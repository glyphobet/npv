#!/usr/bin/env python2.5
# -*- coding: utf-8 -*-
import yaml
import datetime
import svgfig
from svgfig.interactive import SVG, poly

evs = yaml.load(open('electoral votes.yaml'))
npvp = yaml.load(open('npv progress.yaml'))

start = datetime.date(2006, 02, 23)

# http://colorschemedesigner.com/#4O527w0w0w0w0
colors = {           # normal   # dark     # darker   # light    # lighter
    'Law'         :['#EF002A', '#B32D45', '#9B001C', '#F73E5F', '#F76F87'],
    'Both houses' :['#8506A9', '#6A237E', '#56026E', '#B23AD4', '#BB63D4'],
    'One house'   :['#2A17B1', '#392E85', '#150873', '#5D4BD8', '#7D71D8'],
}

states = {}

padding = 12
base_y = 270 + padding # 538

points = {
    'Law'         : [],
    'Both houses' : [],
    'One house'   : [(padding, base_y)],
}
labels = {
    'Law'         : ['',],
    'Both houses' : ['',],
    'One house'   : ['',],
}

timeformat = '%d %B %Y'

for e in npvp:
    x = (e['timestamp'] - start).days + padding
    event = e['event']
    state = e['state']

    if event == 'Veto':
        del states[state]
        for f in ('One house', 'Both houses'):
            old = points[f][-1]
            new = (x, old[1] + evs[state])
            points[f].append(new)

            if old[1] + evs[state] >= base_y:
                # Veto takes this event type back to zero, so zero out start point for next event type
                if f == 'Both houses':
                    points['Law'] = []

        # Label it, but only for 'One house' (the uppermost one) to avoid overlap
        label = '%s %s' % (state, e['event'])
        labels['One house'].append(u'← '+e['timestamp'].strftime(timeformat) + ': ' + label)
        labels['Both houses'].append('')

    else:
        if event != 'Law':
            states[state] = states.get(state, 0) + 1
            if states[state] == 1:
                event = 'One house'
            elif states[state] == 2:
                event = 'Both houses'
            else:
                # Second version of a bill passed
                continue
        old = points[event][-1]
        new = (x, old[1] - evs[state])
        label = '%s %s' % (state, e['event'])
        if x == old[0]:
            points[event][-1] = new
            labels[event][-1] += ', ' + label
        else:
            points[event].append(new)
            labels[event].append(u'← '+e['timestamp'].strftime(timeformat) + ': ' + label)

        # Set start points for the "next" event type now that this one is non-zero
        if event == 'One house' and not points['Both houses']:
            points['Both houses'].append((x, base_y))
        elif event == 'Both houses' and not points['Law']:
            points['Law'].append((x, base_y))


chart_end = (datetime.date.today() - start).days + padding

dds = svgfig.defaults.defaults_svg
dds['font-family'] = 'Trebuchet MS'
dds['width' ] = chart_end + padding*2
dds['height'] = base_y + padding*2
dds['viewBox'] = (0, 0, dds['width'], dds['height'])

text_style = {
    'text-anchor':'start',
    'font-size'  :8,
}

chart = SVG('g')

chart.append(SVG('line', padding, padding, chart_end, padding))
chart.append(SVG('text', chart_end, padding*2, style={'text-anchor':'end','font-size':8})('270 electoral votes needed to take effect'))

# Draw polygons and labels
for k in (('One house', 'Both houses', 'Law')):
    points[k].append((chart_end, points[k][-1][1]))
    points[k].append((chart_end, base_y))
    chart.append(SVG('path', poly(loop=True, *points[k]), 
        fill=colors[k][3],
        stroke=colors[k][1],
        opacity=1.0))
    for p,t in zip(points[k], labels[k]):
        chart.append(
            SVG('g',
                SVG('text', p[0]+1, p[1]-2, style={'text-anchor':'start','font-size':2},
                fill=colors[k][2])(t),
                transform='rotate(-90, %d, %d)' % (p[0]+1, p[1]-2)
                )
            )

    last_y = points[k][-3][1]
    fudge = text_style['font-size']/2
    chart.append(
        SVG('text', chart_end+fudge, last_y+fudge, style=text_style, fill=colors[k][2])(str(270 - (last_y - padding)))
    )

# Date tick-marks
chart.append(SVG('text', padding, base_y + padding, style=text_style)(start.strftime(timeformat)))
for y in range(start.year, datetime.date.today().year):
    tick = datetime.date(y+1, 1, 1)
    tick_x = (tick - start).days + padding
    chart.append(SVG('text', tick_x, base_y + padding, style=text_style)(str(y+1)))

chart.save('npv generated.svg')
