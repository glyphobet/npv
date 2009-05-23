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


// JavaScript fixes and tools that Python already has
function non_stupid_date(year, month_not_month_minus_one, day){
    // WHAT THE FUCK IS WRONG WITH THIS FUCKING LANGUAGE
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
    }
}

function link(url, content){
    var link = _create_element('a', {'text-decoration':'underline'});
    link.setAttributeNS(xlinkns, 'xlink:href', url);
    link.setAttributeNS(xlinkns, 'xlink:target', "_top"); // For Firefox
    link.setAttribute('target', "_top"); // For Safari
    link.appendChild(svgDocument.createTextNode(content));
    return link;
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
    return [parseInt(point[0]), parseInt(point[1])];
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
// Electoral votes
var evs = {
 'Alabama': 9,
 'Alaska': 3,
 'Arizona': 10,
 'Arkansas': 6,
 'California': 55,
 'Colorado': 9,
 'Connecticut': 7,
 'Delaware': 3,
 'Florida': 27,
 'Georgia': 15,
 'Hawaii': 4,
 'Idaho': 4,
 'Illinois': 21,
 'Indiana': 11,
 'Iowa': 7,
 'Kansas': 6,
 'Kentucky': 8,
 'Louisiana': 9,
 'Maine': 4,
 'Maryland': 10,
 'Massachusetts': 12,
 'Michigan': 17,
 'Minnesota': 10,
 'Mississippi': 6,
 'Missouri': 11,
 'Montana': 3,
 'Nebraska': 5,
 'Nevada': 5,
 'New Hampshire': 4,
 'New Jersey': 15,
 'New Mexico': 5,
 'New York': 31,
 'North Carolina': 15,
 'North Dakota': 3,
 'Ohio': 20,
 'Oklahoma': 7,
 'Oregon': 7,
 'Pennsylvania': 21,
 'Rhode Island': 4,
 'South Carolina': 8,
 'South Dakota': 3,
 'Tennessee': 11,
 'Texas': 34,
 'Utah': 5,
 'Vermont': 3,
 'Virginia': 13,
 'Washington': 11,
 'Washington, D.C.': 3,
 'West Virginia': 5,
 'Wisconsin': 10,
 'Wyoming': 3
}

// National Popular Vote progress
var npvp = [
    {timestamp: non_stupid_date(2006,  4, 17), state: 'Colorado'      , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2006,  5,  1), state: 'California'    , 'event': 'Assembly'},
    {timestamp: non_stupid_date(2006,  8,  1), state: 'California'    , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2006,  9, 30), state: 'California'    , 'event': 'Veto'    },
    {timestamp: non_stupid_date(2007,  1, 24), state: 'Colorado'      , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007,  2, 14), state: 'Hawaii'        , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007,  3, 21), state: 'Arkansas'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2007,  3, 28), state: 'Maryland'      , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007,  4,  2), state: 'Maryland'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2007,  4,  5), state: 'Hawaii'        , 'event': 'House'   },
    {timestamp: non_stupid_date(2007,  4, 10), state: 'Maryland'      , 'event': 'Law'     },
    {timestamp: non_stupid_date(2007,  5,  2), state: 'Illinois'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2007,  5,  3), state: 'Hawaii'        , 'event': 'Veto'    },
    {timestamp: non_stupid_date(2007,  5, 14), state: 'North Carolina', 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007,  5, 14), state: 'California'    , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007,  5, 31), state: 'Illinois'      , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2007, 12, 13), state: 'New Jersey'    , 'event': 'Assembly'},
    {timestamp: non_stupid_date(2008,  1,  3), state: 'New Jersey'    , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  1,  9), state: 'Illinois'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2008,  1, 13), state: 'New Jersey'    , 'event': 'Law'     },
    {timestamp: non_stupid_date(2008,  2, 18), state: 'Washington'    , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  3,  4), state: 'Hawaii'        , 'event': 'House'   },
    {timestamp: non_stupid_date(2008,  3,  4), state: 'Hawaii'        , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  3, 19), state: 'Vermont'       , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  4,  2), state: 'Maine'         , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  4,  7), state: 'Illinois'      , 'event': 'Law'     },
    {timestamp: non_stupid_date(2008,  4, 24), state: 'Vermont'       , 'event': 'House'   },
    {timestamp: non_stupid_date(2008,  5,  1), state: 'Hawaii'        , 'event': 'Law'     },
    {timestamp: non_stupid_date(2008,  5, 16), state: 'Vermont'       , 'event': 'Veto'    },
    {timestamp: non_stupid_date(2008,  5, 27), state: 'Rhode Island'  , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  6, 20), state: 'Rhode Island'  , 'event': 'House'   },
    {timestamp: non_stupid_date(2008,  6, 30), state: 'California'    , 'event': 'Assembly'},
    {timestamp: non_stupid_date(2008,  7,  2), state: 'Rhode Island'  , 'event': 'Veto'    },
    {timestamp: non_stupid_date(2008,  7,  9), state: 'Massachusetts' , 'event': 'House'   },
    {timestamp: non_stupid_date(2008,  7, 30), state: 'Massachusetts' , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2008,  8, 14), state: 'California'    , 'event': 'Veto'    },
    {timestamp: non_stupid_date(2008, 12, 11), state: 'Michigan'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  2,  7), state: 'Vermont'       , 'event': 'Senate'  },
    {timestamp: non_stupid_date(2009,  2, 20), state: 'New Mexico'    , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  3, 12), state: 'Oregon'        , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  3, 17), state: 'Colorado'      , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  4, 15), state: 'Washington'    , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  4, 21), state: 'Nevada'        , 'event': 'Assembly'},
    {timestamp: non_stupid_date(2009,  4, 28), state: 'Washington'    , 'event': 'Law'     },
    {timestamp: non_stupid_date(2009,  5, 12), state: 'Connecticut'   , 'event': 'House'   },
    {timestamp: non_stupid_date(2009,  5, 19), state: 'Rhode Island'  , 'event': 'Senate'  },
    // NOTE: Add new events here
];


// Configuration
var charts = ['One house', 'Both houses', 'Law'];

// http://colorschemedesigner.com/#4O527w0w0w0w0
var colors = { //   # normal   # dark     # darker   # light    # lighter
    'Law'         :['#EF002A', '#B32D45', '#9B001C', '#F73E5F', '#F76F87'],
    'Both houses' :['#8506A9', '#6A237E', '#56026E', '#B23AD4', '#BB63D4'],
    'One house'   :['#2A17B1', '#392E85', '#150873', '#5D4BD8', '#7D71D8'],
    'complement'  :['#E5FB00', '#B0BC2F', '#95A300', '#EDFD3F', '#F1FD72'],
};

var descriptions = {
    'Law'        :"Enacted into state law",
    'Both houses':"Passed both houses"    ,
    'One house'  :"Passed one house"      ,
}

var start = non_stupid_date(2006, 2, 23);

var states = {};

var padding = 20;
var base_y = 270 + padding; // 538
var horizontal_scale = 2/3;

var chart_end = days(new Date() - start) + padding

var paths = {};
var groups = {};
var tip_items;
var tip_hints;
var tip_zones;
var state_dots = {}
var state_group;


// Debugging
var debug_content = '';
function debug(e){
    debug_content += e+'\n';
    //db += e+' '+s+' '+n+'\n';
}
function show_debug(){
    if (debug_content != '') alert(debug_content);
    debug_content = '';
}


// text styles
var base_text_style  = {'font-size':padding*4/5};
var left_text_style  = update({'text-anchor':'start'}, base_text_style);
var right_text_style = update({'text-anchor':'end'}, base_text_style);
var label_text_style = {'text-anchor':'middle', 'font-size':padding*3/5,};
var credits_text_style = {'text-anchor':'middle', 'font-size':padding*2/5,};
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
        show_debug();
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
        show_debug();
    }
}

function show_tooltip(zone, state){
    hide_tip_hints();
    var tip = svgDocument.getElementById('tip:'+zone.id);
    var bg = tip.firstChild;
    if (bg.getAttribute('x') == 0){
        var bbox = tip.lastChild.getBBox();
        var fs = parseInt(tip.lastChild.getAttribute('font-size'));

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

        tip.lastChild.setAttribute('x', parseInt(tip.lastChild.getAttribute('x')) + oops);
    }
    svgDocument.getElementById('tip:'+zone.id).setAttribute('opacity', 1); 
    state_dots[state].setAttribute('opacity', 1);
}

function hide_tooltip(zone, state){
    state_dots[state].setAttribute('opacity', 0);
    svgDocument.getElementById('tip:'+zone.id).setAttribute('opacity', 0);
}

function make_label(x, y, date, state, event, chart){
    var zone_size = 6;
    var z = rect(x-zone_size*horizontal_scale, y-zone_size, zone_size*2*horizontal_scale, zone_size*2, attributes={'opacity': 0, 'rx':padding/5, 'ry':padding/5});
    z.setAttribute('onmouseover', 'show_tooltip(this, "'+state+'");');
    z.setAttribute('onmouseout' , 'hide_tooltip(this, "'+state+'");');
    z.setAttribute('id', x+','+y);
    tip_zones.appendChild(z);
    
    var rect_style = {'opacity':0.75, 'rx':padding/5, 'ry':padding/5};

    var hb = rect(x-zone_size*horizontal_scale, y-zone_size, zone_size*2*horizontal_scale, zone_size*2, attributes=update({'stroke':colors['complement'][1], 'fill':colors['complement'][4]}, rect_style));
    var ht = text(x, y+zone_size-1, attributes=update({'fill':colors['complement'][2]}, label_text_style))('?');
    var hg = group();
    hg.appendChild(hb);
    hg.appendChild(ht);
    tip_hints.appendChild(hg);

    var g = group(attributes={'opacity':0,});
    g.setAttribute('id', 'tip:'+x+','+y);
    g.appendChild(rect(0,0,0,0, attributes=update({'stroke':colors[chart][1], 'fill':'white'}, rect_style)));
    g.appendChild(text(x, y - padding/2, attributes=update({'fill':colors[chart][2]}, label_text_style))(date_format(date) + ': ' + make_label_text(state, event)));
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

function old_make_label(x, y, date, state, event, chart){
    var lg = group(attrs={'transform':make_label_rotation(x+1, y-2)});
    lg.appendChild(
        text(x+1, y-2, attributes=update({'fill':colors[chart][2],}, label_text_style))('← ' + date_format(date) + ': ' + make_label_text(state, event))
    );
    groups[chart].appendChild(lg);
}

/* old_append_and_move_label
var last_label_group = groups[event].lastChild;
last_label_group.setAttribute('transform', make_label_rotation(x, y));
var last_label_text = last_label_group.lastChild;
last_label_text.setAttribute('y', y);
last_label_text.appendChild(
    svgDocument.createTextNode(', ' + make_label_text(state, e['event']))
);
*/

function make_label_text(state, event){
    if (event == 'Veto'){
        return 'vetoed in ' + state
    } else if (event == 'Law'){
        return 'became ' + state + ' law'
    } else {
        return 'passed ' + state + ' ' + event
    }
}

function make_label_rotation(x, y){
    return 'rotate(-90,'+ x + ', ' + y +')';
}

// End label helpers


function get_previous_y(event){
    if (paths[event].getAttribute('d') == 'M'){
        return base_y;
    } else {
        return last_point(paths[event])[1];
    }    
}


function step_to(event, x, old_y, new_y){ // Step function
    append_point(paths[event], x, old_y);
    append_point(paths[event], x, new_y);

/*    var arrow_size = 4;
    var arrow_direction = old_y < new_y ? -1 : 1;
    var arrow = path('M'+
        x+' '+(new_y)+' '+
        (x-arrow_size/2*arrow_direction)+' '+(new_y+arrow_size*arrow_direction)+' '+
        (x+arrow_size/2*arrow_direction)+' '+(new_y+arrow_size*arrow_direction)+
        'Z', attributes={'fill':colors[event][2], 'stroke':colors[event][2], 'stroke-linejoin':'mitre'});
    groups[event].appendChild(arrow);*/
}


/* // diagonal line. Unused. */
function diagonal_to(event, x, old_y, new_y){
    if (event == 'One house' && paths['One house'].getAttribute('d') == 'M'){
        append_point(paths['One house'], padding, base_y);
    }

    append_point(paths[event], x, new_y);
    groups[event].appendChild(circle(x, new_y, 2, attributes={'fill':colors[event][1]}));

    // Set start points for the "next" event type now that this one is non-zero
    if (event == 'One house' && paths['Both houses'].getAttribute('d') == "M"){
        reset_path(paths['Both houses']);
        append_point(paths['Both houses'], x, base_y);
    } else if (event == 'Both houses' && paths['Law'].getAttribute('d') == "M"){
        reset_path(paths['Law']);
        append_point(paths['Law'], x, base_y);
    }

    // Reset Law points back to zero as this veto re-sets the place where the Law chart should start
    if (new_y >= base_y){
        reset_path(paths['Law']);
    }
}
/* */

function next_event(i){
    if (i < npvp.length - 1){
        handle_event(i+1);
/*        setTimeout('handle_event('+(i+1)+')', 
            (npvp[i+1]['timestamp'] - npvp[i]['timestamp'])/10000000
        );*/
    } else {
        finish();
    }
}

function handle_event(i){
    var e = npvp[i];
    var event = e['event'];
    var state = e['state'];
    var x = days(e['timestamp'] - start) + padding;

    if (event == 'Veto'){
        delete states[state];
        for (var c in charts.slice(0,2)){
            var ct = charts[c];
            var old_y = get_previous_y(ct);
            var new_y = old_y + evs[state];
            step_to(ct, x, old_y, new_y);
            make_label(x, new_y, e['timestamp'], state, e['event'], ct);
        }

    } else {
        var step = evs[state];
        if (event != 'Law'){
            states[state] = get(states, state, {});
            if (states[state].hasOwnProperty(event)){
                // Second version of a bill passed; don't increment
                step = 0;                
            } else {
                states[state][event] = true;
            }
            if (object_length(states[state]) == 1){
                event = 'One house';
            } else if (object_length(states[state]) == 2){
                event = 'Both houses';
            }
        }
        var old_y = get_previous_y(event);
        var new_y = old_y - step;
        step_to(event, x, old_y, new_y);
        make_label(x, new_y, e['timestamp'], state, e['event'], event);
    }
    next_event(i);
}


function render(evt){
    svgDocument = evt.target.ownerDocument;
    svgRoot = svgDocument.documentElement;

    svgRoot.setAttribute('width' , chart_end + padding*2);
    svgRoot.setAttribute('height', base_y + padding*2);
    svgRoot.setAttribute('viewBox', '0 0 '+(chart_end + padding*2)+' '+(base_y + padding*2)); // might not need this
    var piframe = parent.document.getElementById('iframe');
    if(piframe){
        piframe.setAttribute('width' , chart_end + padding*2);
        piframe.setAttribute('height', base_y + padding*2);
    }

    var title = text(padding, padding+fudge, attributes=title_text_style)('Progress of the ')
    var title_link = link("http://nationalpopularvote.com/", "National Popular Vote plan");
    title.appendChild(title_link);
    svgRoot.appendChild(title);

    svgRoot.appendChild(text(chart_end, padding+fudge, attributes=right_text_style)("Electoral votes needed to take effect:"));

    svgRoot.appendChild(text(chart_end+fudge, padding+fudge, attributes=left_text_style)(270));

    // Date tick-marks
    svgRoot.appendChild(text(padding, base_y + fudge*3, attributes=left_text_style)(date_format(start)));
    for (y=start.getFullYear(); y<(new Date()).getFullYear(); y++){
        tick = non_stupid_date(y+1, 1, 1);
        tick_x = days(tick - start) + padding;
        svgRoot.appendChild(text(tick_x, base_y + fudge*3, attributes=left_text_style)(y+1));
    }

    var credits = text(chart_end/2, base_y + padding *2, attributes=credits_text_style)("\u00A9 2009 ");
    credits.appendChild(link('http://glyphobet.net', "Matt Chisholm"));
    credits.appendChild(svgDocument.createTextNode(" \u2022 "))
    credits.appendChild(link('http://creativecommons.org/licenses/by-nc-sa/3.0/us/', "Licensed under Creative Commons"));
    credits.appendChild(svgDocument.createTextNode(" \u2022 "))
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
        g.appendChild(p)
        svgRoot.appendChild(g);

        var r = rect(padding+1, key_start-box_size+1, box_size, box_size, attributes=attrs)
        g.appendChild(r);
        g.appendChild(text(padding+box_size*1.5, key_start, attributes=update({'fill':colors[ct][2],}, left_text_style))(descriptions[ct]));
        key_start += padding+fudge;
    }

    // Base line
    svgRoot.appendChild(line(padding, base_y, chart_end, base_y, attributes={'stroke':'black', 'stroke-linecap':'square', 'opacity':1}));

    // Group for tooltip hints
    tip_hints = group(attributes={'opacity':0})
    svgRoot.appendChild(tip_hints);
    
    state_group = group();
    svgRoot.appendChild(state_group);
    
    // Group for tooltip contents
    tip_items = group();
    svgRoot.appendChild(tip_items);
    
    // Group for tooltip activation zones
    tip_zones = group(attributes={'opacity':1});
    svgRoot.appendChild(tip_zones);

    var bgrd = rect(padding, padding*2, chart_end-padding, base_y-padding*2, attributes={'opacity':0.0});
    tip_zones.appendChild(bgrd);
    bgrd.setAttribute('onmousemove', 'show_tip_hints()');
    bgrd.setAttribute('onmouseout', 'hide_tip_hints()');

    handle_event(0);
}

function finish(){
    for (var c in charts){
        var ct = charts[c]; 
        last = last_point(paths[ct]);
        append_point(paths[ct], chart_end, last[1]); // extend to (x for today, last y)
        append_point(paths[ct], chart_end, base_y);  // extend to (x for today, base y)
        close_path(paths[ct]); // close the path
        groups[ct].appendChild( // Add a number for progress
            text(chart_end+fudge, last[1]+fudge, attributes=update({'fill':colors[ct][2]}, left_text_style))(270 - (last[1] - padding))
        )
    }

    show_tip_hints();

    show_debug();
}

