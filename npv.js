/*
© 2009 Matt Chisholm • matt (dash) npv (at) theory (dot) org • http://glyphobet.net/npv/

This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License.
http://creativecommons.org/licenses/by-nc-sa/3.0/us/

Data collected from: http://nationalpopularvote.com/
Please donate to NPV: http://nationalpopularvote.com/pages/donate.php

To-Do:
 * Google trends chart overlay
*/
var svgns="http://www.w3.org/2000/svg";
var xlinkns="http://www.w3.org/1999/xlink";
var svgRoot;
var svgDocument;


// JavaScript date tool improvements
function make_date(year, month_not_month_minus_one, day){
    // Who counts months from zero? JavaScript, that's who. And nobody else.
    return new Date(year, month_not_month_minus_one - 1, day);
}

var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function date_format(date){
    return date.getDate() + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear();
}

function days(duration){
    return Math.round(duration / (60 * 60 * 24 * 1000) * horizontal_scale);
}

function get(object, key, value){
    if (object.hasOwnProperty(key)){
        return object[key];
    } else {
        return value;
    }
}

function update(aa, other){
    for (var k in other){
        aa[k] = other[k];
    }
    return aa;
}

function object_length(obj){
    var l = 0;
    for (var p in obj){
        l += 1;
    }
    return l;
}

// End JavaScript tools


// SVG generation helpers
function _set_attributes(node, attributes){
    for (var a in attributes){
        node.setAttribute(a, attributes[a]);
    }
}

function _create_element(tag, attributes){
    var n = svgDocument.createElementNS(svgns, tag);
    _set_attributes(n, attributes);
    return n;
}

function group(attributes){
    return _create_element('g', attributes);
}

function text(x, y, attributes){
    return function (content){
        var t = _create_element('text', attributes);
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        t.appendChild(svgDocument.createTextNode(content));
        return t;
    };
}

function link(url, content){
    var l = _create_element('a', {'text-decoration':'underline'});
    l.setAttributeNS(xlinkns, 'xlink:href', url);
    l.setAttributeNS(xlinkns, 'xlink:target', "_top"); // For Firefox
    l.setAttribute('target', "_top"); // For Safari
    l.appendChild(svgDocument.createTextNode(content));
    return l;
}

function line(x1, y1, x2, y2, attributes){
    var l = _create_element('line', attributes);
    l.setAttribute('x1', x1);
    l.setAttribute('y1', y1);
    l.setAttribute('x2', x2);
    l.setAttribute('y2', y2);
    return l;
}

function rect(x, y, w, h, attributes){
    var r = _create_element('rect', attributes);
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    return r;
}

function circle(x, y, r, attributes){
    var c = _create_element('circle', attributes);
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', r);
    return c;
}

function ellipse(x, y, rx, ry, attributes){
    var e = _create_element('ellipse', attributes);
    e.setAttribute('cx', x);
    e.setAttribute('cy', y);
    e.setAttribute('rx', rx);
    e.setAttribute('ry', ry);
    return e;
}

function path(d, attributes){
    var p = _create_element('path', attributes);
    p.setAttribute('d', d);
    return p;
}

function last_point(path){
    var d = path.getAttribute('d');
    var point = d.split(' ').slice(-2);
    return [parseInt(point[0], 10), parseInt(point[1], 10)];
}

function append_point(path, x, y){
    path.setAttribute('d', path.getAttribute('d') + ' ' + x + ' ' + y);
}

function close_path(path){
    path.setAttribute('d', path.getAttribute('d') + 'Z');
}

function reset_path(path){
    path.setAttribute('d', 'M');
}
// End SVG generation helpers


// Data
// States
var names = {
  AL:"Alabama"         ,
  AK:"Alaska"          ,
  AZ:"Arizona"         ,
  AR:"Arkansas"        ,
  CA:"California"      ,
  CO:"Colorado"        ,
  CT:"Connecticut"     ,
  DC:"Washington, D.C.",
  DE:"Delaware"        ,
  FL:"Florida"         ,
  GA:"Georgia"         ,
  HI:"Hawaii"          ,
  ID:"Idaho"           ,
  IL:"Illinois"        ,
  IN:"Indiana"         ,
  IA:"Iowa"            ,
  KS:"Kansas"          ,
  KY:"Kentucky"        ,
  LA:"Louisiana"       ,
  ME:"Maine"           ,
  MD:"Maryland"        ,
  MA:"Massachusetts"   ,
  MI:"Michigan"        ,
  MN:"Minnesota"       ,
  MS:"Mississippi"     ,
  MO:"Missouri"        ,
  MT:"Montana"         ,
  NE:"Nebraska"        ,
  NV:"Nevada"          ,
  NH:"New Hampshire"   ,
  NJ:"New Jersey"      ,
  NM:"New Mexico"      ,
  NY:"New York"        ,
  NC:"North Carolina"  ,
  ND:"North Dakota"    ,
  OH:"Ohio"            ,
  OK:"Oklahoma"        ,
  OR:"Oregon"          ,
  PA:"Pennsylvania"    ,
  RI:"Rhode Island"    ,
  SC:"South Carolina"  ,
  SD:"South Dakota"    ,
  TN:"Tennessee"       ,
  TX:"Texas"           ,
  UT:"Utah"            ,
  VT:"Vermont"         ,
  VA:"Virginia"        ,
  WA:"Washington"      ,
  WV:"West Virginia"   ,
  WI:"Wisconsin"       ,
  WY:"Wyoming"
};

// Electoral votes
var electoral_votes = {
  2000: {
    AK:  3,
    AL:  9,
    AR:  6,
    AZ: 10,
    CA: 55,
    CO:  9,
    CT:  7,
    DC:  3,
    DE:  3,
    FL: 27,
    GA: 15,
    HI:  4,
    IA:  7,
    ID:  4,
    IL: 21,
    IN: 11,
    KS:  6,
    KY:  8,
    LA:  9,
    MA: 12,
    MD: 10,
    ME:  4,
    MI: 17,
    MN: 10,
    MO: 11,
    MS:  6,
    MT:  3,
    NC: 15,
    ND:  3,
    NE:  5,
    NH:  4,
    NJ: 15,
    NM:  5,
    NV:  5,
    NY: 31,
    OH: 20,
    OK:  7,
    OR:  7,
    PA: 21,
    RI:  4,
    SC:  8,
    SD:  3,
    TN: 11,
    TX: 34,
    UT:  5,
    VA: 13,
    VT:  3,
    WA: 11,
    WI: 10,
    WV:  5,
    WY:  3
  },
  2010: {
    FL: 29,
    GA: 16,
    IA:  6,
    IL: 20,
    LA:  8,
    MA: 11,
    MI: 16,
    MO: 10,
    NJ: 14,
    NV:  6,
    NY: 29,
    OH: 18,
    PA: 20,
    SC:  9,
    TX: 38,
    UT:  6,
    WA: 12
  }
};

// National Popular Vote progress
var npvp = [
  {timestamp:make_date(2006,  4, 17), state:'CO', type:'Senate'  },
  {timestamp:make_date(2006,  5,  1), state:'CA', type:'Assembly'},
  {timestamp:make_date(2006,  8,  1), state:'CA', type:'Senate'  },
  {timestamp:make_date(2006,  9, 30), state:'CA', type:'Veto'    },
  {timestamp:make_date(2007,  1, 24), state:'CO', type:'Senate'  },
  {timestamp:make_date(2007,  2, 14), state:'HI', type:'Senate'  },
  {timestamp:make_date(2007,  3, 21), state:'AR', type:'House'   },
  {timestamp:make_date(2007,  3, 28), state:'MD', type:'Senate'  },
  {timestamp:make_date(2007,  4,  2), state:'MD', type:'House'   },
  {timestamp:make_date(2007,  4,  5), state:'HI', type:'House'   },
  {timestamp:make_date(2007,  4, 10), state:'MD', type:'Law'     },
  {timestamp:make_date(2007,  5,  2), state:'IL', type:'House'   },
  {timestamp:make_date(2007,  5,  3), state:'HI', type:'Veto'    },
  {timestamp:make_date(2007,  5, 14), state:'NC', type:'Senate'  },
  {timestamp:make_date(2007,  5, 14), state:'CA', type:'Senate'  },
  {timestamp:make_date(2007,  5, 31), state:'IL', type:'Senate'  },
  {timestamp:make_date(2007, 12, 13), state:'NJ', type:'Assembly'},
  {timestamp:make_date(2008,  1,  3), state:'NJ', type:'Senate'  },
  {timestamp:make_date(2008,  1,  9), state:'IL', type:'House'   },
  {timestamp:make_date(2008,  1, 13), state:'NJ', type:'Law'     },
  {timestamp:make_date(2008,  2, 18), state:'WA', type:'Senate'  },
  {timestamp:make_date(2008,  3,  4), state:'HI', type:'House'   },
  {timestamp:make_date(2008,  3,  4), state:'HI', type:'Senate'  },
  {timestamp:make_date(2008,  3, 19), state:'VT', type:'Senate'  },
  {timestamp:make_date(2008,  4,  7), state:'IL', type:'Law'     },
  {timestamp:make_date(2008,  4, 14), state:'ME', type:'Senate'  },
  {timestamp:make_date(2008,  4, 24), state:'VT', type:'House'   },
  {timestamp:make_date(2008,  5,  1), state:'HI', type:'Law'     },
  {timestamp:make_date(2008,  5, 16), state:'VT', type:'Veto'    },
  {timestamp:make_date(2008,  5, 27), state:'RI', type:'Senate'  },
  {timestamp:make_date(2008,  6, 20), state:'RI', type:'House'   },
  {timestamp:make_date(2008,  6, 30), state:'CA', type:'Assembly'},
  {timestamp:make_date(2008,  7,  2), state:'RI', type:'Veto'    },
  {timestamp:make_date(2008,  7,  9), state:'MA', type:'House'   },
  {timestamp:make_date(2008,  7, 30), state:'MA', type:'Senate'  },
  {timestamp:make_date(2008,  8, 14), state:'CA', type:'Veto'    },
  {timestamp:make_date(2008, 12, 11), state:'MI', type:'House'   },
  {timestamp:make_date(2009,  2,  7), state:'VT', type:'Senate'  },
  {timestamp:make_date(2009,  2, 20), state:'NM', type:'House'   },
  {timestamp:make_date(2009,  3, 12), state:'OR', type:'House'   },
  {timestamp:make_date(2009,  3, 17), state:'CO', type:'House'   },
  {timestamp:make_date(2009,  4, 15), state:'WA', type:'House'   },
  {timestamp:make_date(2009,  4, 21), state:'NV', type:'Assembly'},
  {timestamp:make_date(2009,  4, 28), state:'WA', type:'Law'     },
  {timestamp:make_date(2009,  5, 12), state:'CT', type:'House'   },
  {timestamp:make_date(2009,  5, 19), state:'RI', type:'Senate'  },
  {timestamp:make_date(2009,  6, 24), state:'DE', type:'House'   },
  {timestamp:make_date(2010,  1,  1), type:'Census'},
  {timestamp:make_date(2010,  6,  2), state:'MA', type:'House'   },
  {timestamp:make_date(2010,  6,  7), state:'NY', type:'Senate'  },
  {timestamp:make_date(2010,  7,  8), state:'DC', type:'Comittee'},
  {timestamp:make_date(2010,  7,  8), state:'DC', type:'Comittee '},
  {timestamp:make_date(2010,  7, 15), state:'MA', type:'Senate'  },
  {timestamp:make_date(2010,  8,  4), state:'MA', type:'Law'     },
  {timestamp:make_date(2010,  9, 21), state:'DC', type:'Law'     },
  {timestamp:make_date(2011,  2, 23), state:'VT', type:'Senate'  },
  {timestamp:make_date(2011,  4, 15), state:'VT', type:'House'   },
  {timestamp:make_date(2011,  4, 23), state:'VT', type:'Law'     },
  {timestamp:make_date(2011,  5, 19), state:'CA', type:'Assembly'},
  {timestamp:make_date(2011,  6,  7), state:'DE', type:'House'   },
  {timestamp:make_date(2011,  6,  7), state:'NY', type:'Senate'  },
  {timestamp:make_date(2011,  6, 16), state:'RI', type:'Senate'  },
  {timestamp:make_date(2011,  7, 14), state:'CA', type:'Senate'  },
  {timestamp:make_date(2011,  8,  8), state:'CA', type:'Law'     },
  {timestamp:make_date(2013,  5, 13), state:'OR', type:'House'   },
  {timestamp:make_date(2013,  6, 12), state:'NY', type:'Assembly'},
  {timestamp:make_date(2013,  6, 13), state:'RI', type:'Senate'  },
  {timestamp:make_date(2013,  6, 13), state:'RI', type:'House'   },
  {timestamp:make_date(2013,  7, 12), state:'RI', type:'Law'     },
  {timestamp:make_date(2014,  2, 14), state:'OK', type:'Senate'  },
  {timestamp:make_date(2014,  3, 25), state:'NY', type:'Assembly'},
  {timestamp:make_date(2014,  3, 25), state:'NY', type:'Senate'  },
  {timestamp:make_date(2014,  4, 15), state:'NY', type:'Law'     }
  //{timestamp:make_date(2011, , ), state:'', type:''}
  // NOTE: Add new events here
];


// Configuration
var charts = ['One house', 'Both houses', 'Law'];

// http://colorschemedesigner.com/#4O527w0w0w0w0
var colors = { //   # normal   # dark     # darker   # light    # lighter
    'Law'         :['#EF002A', '#B32D45', '#9B001C', '#F73E5F', '#F76F87'],
    'Both houses' :['#8506A9', '#6A237E', '#56026E', '#B23AD4', '#BB63D4'],
    'One house'   :['#2A17B1', '#392E85', '#150873', '#5D4BD8', '#7D71D8'],
    'complement'  :['#E5FB00', '#B0BC2F', '#95A300', '#EDFD3F', '#F1FD72']
};

var descriptions = {
    'Law'        :"Enacted into state law",
    'Both houses':"Passed both houses"    ,
    'One house'  :"Passed one house"
};

var start = make_date(2006, 2, 23);

var states = {};

var padding = 20;
var base_y = 270 + padding; // 538
var horizontal_scale = 3/5;

var chart_end;

var paths = {};
var groups = {};
var tip_items;
var tip_hints;
var tip_zones;
var state_dots = {};
var state_group;


// text styles
var base_text_style  = {'font-size':padding*4/5};
var left_text_style  = update({'text-anchor':'start'}, base_text_style);
var right_text_style = update({'text-anchor':'end'}, base_text_style);
var label_text_style = {'text-anchor':'middle', 'font-size':padding*3/5};
var credits_text_style = {'text-anchor':'middle', 'font-size':padding*2/5};
var title_text_style = {'text-anchor':'start','font-size':padding};
var fudge = base_text_style['font-size']/2;


// Label / tooltip helpers
var tip_hint_timeout;
function show_tip_hints(){
    clearTimeout(tip_hint_timeout);
    var o = parseFloat(tip_hints.getAttribute('opacity'));
    if (o < 0.9){
        tip_hints.setAttribute('opacity', o + 0.1);
        clearTimeout(tip_hint_timeout);
        tip_hint_timeout = setTimeout('show_tip_hints()', 10);
    } else {
        tip_hints.setAttribute('opacity', 1);
        clearTimeout(tip_hint_timeout);
        tip_hint_timeout = setTimeout('hide_tip_hints()', 1000);
    }
}

function hide_tip_hints(){
    // The weird *10 /10 crap avoids a flicker due to imprecisions in Firefox's floating point arithmetic
    clearTimeout(tip_hint_timeout);
    var o = parseFloat(tip_hints.getAttribute('opacity')) * 10;
    if (o > 1){
        tip_hints.setAttribute('opacity', (o - 1)/10);
        clearTimeout(tip_hint_timeout);
        tip_hint_timeout = setTimeout('hide_tip_hints()', 10);
    } else {
        tip_hints.setAttribute('opacity', 0);
    }
}

function show_tooltip(zone, state){
    hide_tip_hints();
    var tip = svgDocument.getElementById('tip:'+zone.id);
    var bg = tip.firstChild;
    if (bg.getAttribute('x') == 0){
        var bbox = tip.lastChild.getBBox();
        var fs = parseInt(tip.lastChild.getAttribute('font-size'), 10);

        // watch out for tooltips that fall off of one side of the chart or the other
        var oops = 0;
        if (bbox.x + bbox.width + fs/2 > chart_end + padding) {
            oops = chart_end + padding - (bbox.x + bbox.width + fs/2);
        } else if (bbox.x - fs/2 < 0){
            oops = -1 * (bbox.x - fs/2);
        }

        bg.setAttribute('x', bbox.x-(fs/2) + oops);
        bg.setAttribute('y', bbox.y-(fs/3));
        bg.setAttribute('width', bbox.width+fs);
        bg.setAttribute('height', bbox.height+(2*fs/3));

        tip.lastChild.setAttribute('x', parseInt(tip.lastChild.getAttribute('x'), 10) + oops);
    }
    svgDocument.getElementById('tip:'+zone.id).setAttribute('opacity', 1);
    state_dots[state].setAttribute('opacity', 1);
}

function hide_tooltip(zone, state){
    state_dots[state].setAttribute('opacity', 0);
    svgDocument.getElementById('tip:'+zone.id).setAttribute('opacity', 0);
}

function make_label(x, y, date, state, type, chart){
    var zone_size = 6;
    var z = rect(
        x-zone_size*horizontal_scale,
        y-zone_size,
        zone_size*2*horizontal_scale,
        zone_size*2,
        attributes={'opacity': 0, 'rx':padding/5, 'ry':padding/5}
    );
    z.setAttribute('onmouseover', 'show_tooltip(this, "'+state+'");');
    z.setAttribute('onmouseout' , 'hide_tooltip(this, "'+state+'");');
    z.setAttribute('id', x+','+y);
    tip_zones.appendChild(z);

    var rect_style = {'opacity':0.75, 'rx':padding/5, 'ry':padding/5};

    var hb = rect(
        x-zone_size*horizontal_scale,
        y-zone_size,
        zone_size*2*horizontal_scale,
        zone_size*2,
        attributes=update(
            {'stroke':colors['complement'][1], 'fill':colors['complement'][4]},
            rect_style
        )
    );
    var ht = text(
        x,
        y+zone_size-1,
        attributes=update(
            {'fill':colors['complement'][2]},
            label_text_style
        )
    )('?');
    var hg = group();
    hg.appendChild(hb);
    hg.appendChild(ht);
    tip_hints.appendChild(hg);

    var g = group(attributes={'opacity':0});
    g.setAttribute('id', 'tip:'+x+','+y);
    g.appendChild(
        rect(
            0,0,0,0,
            attributes=update(
                {'stroke':colors[chart][1], 'fill':'white'},
                rect_style
            )
        )
    );
    g.appendChild(
        text(
            x, y - padding/2,
            attributes=update(
                {'fill': colors[chart][2]},
                label_text_style
            )
        )(date_format(date) + ': ' + make_label_text(state, type)));
    tip_items.appendChild(g);

    if (! state_dots.hasOwnProperty(state)){
        state_dots[state] = group({'opacity':0});
        state_group.appendChild(state_dots[state]);
    }
    var d = circle(x, y, 4, {'fill':colors[chart][1]});
    state_dots[state].appendChild(d);
}

function append_and_move_label(x, y, extra){
    tip_items.lastChild.lastChild.appendChild(svgDocument.createTextNode(extra));
    tip_items.lastChild.lastChild.setAttribute('x', x);
    tip_items.lastChild.lastChild.setAttribute('y', y - padding/2);
    tip_hints.lastChild.setAttribute('cx', x);
    tip_hints.lastChild.setAttribute('cy', y);
}

function make_label_text(code, type){
    var state_name = names[code];
    if (type == 'Veto'){
        return 'vetoed in ' + state_name;
    } else if (type == 'Census') {
        return 'electoral vote redistribution based on US Census';
    } else if (type == 'Law'){
        return 'became ' + state_name + ' law';
    } else {
        return 'passed ' + state_name + ' ' + type;
    }
}

function make_label_rotation(x, y){
    return 'rotate(-90,'+ x + ', ' + y +')';
}

// End label helpers


function get_previous_y(type){
    if (paths[type].getAttribute('d') == 'M'){
        return base_y;
    } else {
        return last_point(paths[type])[1];
    }
}

// Draw a step transition between vote amounts.
function step_to(type, x, old_y, new_y, arrow){
    append_point(paths[type], x, old_y);
    append_point(paths[type], x, new_y);

    if (arrow) {
        var arrow_size = 4;
        var arrow_direction = old_y < new_y ? -1 : 1;
        var arrow = path('M'+
            x+' '+(new_y)+' '+
            (x-arrow_size/2*arrow_direction)+' '+(new_y+arrow_size*arrow_direction)+' '+
            (x+arrow_size/2*arrow_direction)+' '+(new_y+arrow_size*arrow_direction)+
            'Z', attributes={'fill':colors[type][2], 'stroke':colors[type][2], 'stroke-linejoin':'mitre'});
        groups[type].appendChild(arrow);
    }
}


// Draw a diagonal line between vote amounts. Unused. */
function diagonal_to(type, x, old_y, new_y){
    if (type == 'One house' && paths['One house'].getAttribute('d') == 'M'){
        append_point(paths['One house'], padding, base_y);
    }

    append_point(paths[type], x, new_y);
    groups[type].appendChild(circle(x, new_y, 2, attributes={'fill':colors[type][1]}));

    // Set start points for the "next" type type now that this one is non-zero
    if (type == 'One house' && paths['Both houses'].getAttribute('d') == "M"){
        reset_path(paths['Both houses']);
        append_point(paths['Both houses'], x, base_y);
    } else if (type == 'Both houses' && paths['Law'].getAttribute('d') == "M"){
        reset_path(paths['Law']);
        append_point(paths['Law'], x, base_y);
    }

    // Reset Law points back to zero as this veto re-sets the place where the Law chart should start
    if (new_y >= base_y){
        reset_path(paths['Law']);
    }
}


function find_electoral_votes(year, state) {
    year = Math.floor(year / 10) * 10;
    while (true) {
        if (electoral_votes[year][state]) {
            return electoral_votes[year][state];
        }
        year -= 10;
    }
}

var delay = false;
function next_event(i){
    if (i < npvp.length - 1){
        if (delay) {
            setTimeout('handle_event('+(i+1)+')',
                (npvp[i+1].timestamp - npvp[i].timestamp)/10000000
            );
        } else {
            handle_event(i+1);
        }
    } else {
        finish();
    }
}


function handle_veto(x, e) {
    delete states[e.state];
    for (var c in charts.slice(0,2)){
        var ct = charts[c];
        var old_y = get_previous_y(ct);
        var new_y = old_y + find_electoral_votes(e.timestamp.getFullYear(), e.state);
        step_to(ct, x, old_y, new_y);
        make_label(x, new_y, e.timestamp, e.state, e.type, ct);
    }
}


function handle_census(x, e) {
    var new_ys = {
      'One house': 0,
      'Both houses': 0,
      'Law': 0
    };
    for (var s in states) {
        var sl = object_length(states[s]);
        if (sl >= 1) {
            var ev = find_electoral_votes(e.timestamp.getFullYear(), s);
            new_ys['One house'] += ev;
            if (sl >= 2) {
                new_ys['Both houses'] += ev;
                if (sl >= 3) {
                    new_ys['Law'] += ev;
                }
            }
        }
    }
    for (var c in charts) {
        var ct = charts[c];
        var old_y = get_previous_y(ct);
        var new_y = base_y - new_ys[ct];
        step_to(ct, x, old_y, new_y);
        make_label(x, new_y, e.timestamp, 'Census', 'Census', ct);
    }
}


function handle_passage(x, e) {
    var step = find_electoral_votes(e.timestamp.getFullYear(), e.state);
    var ct = e.type;
    if (e.type == 'Law'){
        states[e.state]['Law'] = true;
    } else {
        states[e.state] = get(states, e.state, {});
        if (states[e.state].hasOwnProperty(e.type)){
            // Second version of a bill passed; don't increment
            step = 0;
        } else {
            states[e.state][e.type] = true;
        }
        if (object_length(states[e.state]) == 1){
            ct = 'One house';
        } else if (object_length(states[e.state]) == 2){
            ct = 'Both houses';
        }
    }
    var old_y = get_previous_y(ct);
    var new_y = old_y - step;
    step_to(ct, x, old_y, new_y);
    make_label(x, new_y, e.timestamp, e.state, e.type, ct);
}


function handle_event(i){
    var e = npvp[i];
    var x = days(e.timestamp - start) + padding;

    if (e.type == 'Veto'){
        handle_veto(x, e);
    } else if (e.type == 'Census') {
        handle_census(x, e);
    } else {
        handle_passage(x, e);
    }
    next_event(i);
}


function render(evt){
    svgDocument = evt.target.ownerDocument;
    svgRoot = svgDocument.documentElement;

    // Get user-defined horizontal scale from parent IFRAME
    if (window.frameElement && window.frameElement.hasAttribute('hscale')){
        var user_hscale = parseFloat(window.frameElement.getAttribute('hscale'));
        if (user_hscale){
            horizontal_scale = Math.max(0.56, user_hscale);
        }
    }
    chart_end = days(new Date() - start) + padding;
    var width  = chart_end + padding*4;
    var height = base_y + padding*2;

    svgRoot.setAttribute('width' , width );
    svgRoot.setAttribute('height', height);
    svgRoot.setAttribute('viewBox', '0 0 '+width+' '+height); // might not need this
    svgRoot.setAttribute('style', 'background-color:#fff;');

    if(window.frameElement){
        // If this is inside an unsized IFRAME, set the IFRAME's size accordingly
        if (! window.frameElement.width ) {
            if (window.frameElement.height) {
                window.frameElement.width = width + 24;
            } else {
                window.frameElement.width = width;
            }
        }
        if (! window.frameElement.height) {
            if (window.frameElement.width) {
                window.frameElement.height = height + 24;
            } else {
                window.frameElement.height = height;
            }
        }
    }

    var title = text(padding, padding+fudge, attributes=title_text_style)('Progress of the ');
    var title_link = link("http://nationalpopularvote.com/", "National Popular Vote plan");
    title.appendChild(title_link);
    svgRoot.appendChild(title);

    svgRoot.appendChild(
        text(
            chart_end,
            padding+fudge,
            attributes=right_text_style
        )("Electoral votes needed to take effect:")
    );

    svgRoot.appendChild(
        text(
            chart_end+fudge,
            padding+fudge,
            attributes=left_text_style
        )(270)
    );

    // Date tick-marks
    svgRoot.appendChild(
        text(
            padding,
            base_y + padding,
            attributes=left_text_style
        )(date_format(start))
    );
    for (y=start.getFullYear(); y<(new Date()).getFullYear(); y++){
        tick = make_date(y+1, 1, 1);
        tick_x = days(tick - start) + padding;
        svgRoot.appendChild(
            text(
                tick_x,
                base_y + padding,
                attributes=left_text_style
            )(y+1)
        );
    }

    var credits = text(chart_end/2, base_y + padding *1.875, attributes=credits_text_style)("\u00A9 2009 ");
    credits.appendChild(link('http://glyphobet.net', "Matt Chisholm"));
    credits.appendChild(svgDocument.createTextNode(" \u2022 "));
    credits.appendChild(link('http://creativecommons.org/licenses/by-nc-sa/3.0/us/', "Licensed under Creative Commons"));
    credits.appendChild(svgDocument.createTextNode(" \u2022 "));
    credits.appendChild(link('http://nationalpopularvote.com/pages/donate.php', "Click here to donate to NPV"));
    svgRoot.appendChild(credits);

    // Create polygons and key
    var key_start = (padding + fudge) * 2;
    var box_size = left_text_style['font-size'];
    for (var c in charts){
        var ct = charts[c];
        var attrs = {'fill':colors[ct][3], 'stroke':colors[ct][1], 'opacity':1.0};
        var p = path('M', attributes=attrs);
        paths[ct] = p;
        var g = group();
        groups[ct] = g;
        g.appendChild(p);
        svgRoot.appendChild(g);

        var r = rect(padding+1, key_start-box_size+1, box_size, box_size, attributes=attrs);
        g.appendChild(r);
        g.appendChild(
            text(
                padding+box_size*1.5,
                key_start,
                attributes=update(
                    {'fill':colors[ct][2]},
                    left_text_style
                )
            )(descriptions[ct])
        );
        key_start += padding+fudge;
    }

    // Base line
    svgRoot.appendChild(
        line(
            padding,
            base_y,
            chart_end,
            base_y,
            attributes={'stroke':'black', 'stroke-linecap':'square', 'opacity':1}
        )
    );

    // Group for tooltip hints
    tip_hints = group(attributes={'opacity':0});
    svgRoot.appendChild(tip_hints);

    state_group = group();
    svgRoot.appendChild(state_group);

    // Group for tooltip contents
    tip_items = group();
    svgRoot.appendChild(tip_items);

    // Group for tooltip activation zones
    tip_zones = group(attributes={'opacity':1});
    svgRoot.appendChild(tip_zones);

    var tip_zone_hover = rect(
        padding,
        padding*2,
        chart_end-padding,
        base_y-padding*2,
        attributes={'opacity':0.0}
    );
    tip_zones.appendChild(tip_zone_hover);
    tip_zone_hover.setAttribute('onmousemove', 'show_tip_hints()');
    tip_zone_hover.setAttribute('onmouseout', 'hide_tip_hints()');

    handle_event(0);
}

function finish(){
    for (var c in charts){
        var ct = charts[c];
        last = last_point(paths[ct]);
        append_point(paths[ct], chart_end, last[1]); // extend to (x for today, last y)
        append_point(paths[ct], chart_end, base_y);  // extend to (x for today, base y)
        close_path(paths[ct]); // close the path

        // Add a number for progress
        var progress = 270 - (last[1] - padding);
        groups[ct].appendChild(
            text(chart_end+fudge, last[1]+fudge,
                attributes=update(
                    {'fill':colors[ct][2]},
                    left_text_style
                )
            )(progress + ' (' + (progress/270*100).toFixed(0) + '%)')
        );
    }

    show_tip_hints();
}

