var xmlns=svgns="http://www.w3.org/2000/svg";
var svgRoot;
var svgDocument;

// JavaScript tools that Python already has
function non_stupid_date(year, month_not_month_minus_one, day){
    // WHAT THE FUCK IS WRONG WITH THIS FUCKING LANGUAGE
    return new Date(year, month_not_month_minus_one - 1, day);
}

var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function date_format(date){
    return date.getDate() + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear();
}

function days(duration){
    return duration / (60 * 60 * 24 * 1000);
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
    {'timestamp': non_stupid_date(2006,  4,  1), 'state': 'Colorado'      , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2006,  5,  1), 'state': 'California'    , 'event': 'Assembly passes'},
    {'timestamp': non_stupid_date(2006,  8,  1), 'state': 'California'    , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2006,  9, 30), 'state': 'California'    , 'event': 'Veto'           },
    {'timestamp': non_stupid_date(2007,  1, 24), 'state': 'Colorado'      , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007,  2, 14), 'state': 'Hawaii'        , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007,  3, 21), 'state': 'Arkansas'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2007,  3, 28), 'state': 'Maryland'      , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007,  4,  2), 'state': 'Maryland'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2007,  4,  5), 'state': 'Hawaii'        , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2007,  4, 10), 'state': 'Maryland'      , 'event': 'Law'            },
    {'timestamp': non_stupid_date(2007,  5,  2), 'state': 'Illinois'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2007,  5,  3), 'state': 'Hawaii'        , 'event': 'Veto'           },
    {'timestamp': non_stupid_date(2007,  5, 14), 'state': 'North Carolina', 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007,  5, 14), 'state': 'California'    , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007,  5, 31), 'state': 'Illinois'      , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2007, 12, 13), 'state': 'New Jersey'    , 'event': 'Assembly passes'},
    {'timestamp': non_stupid_date(2008,  1,  3), 'state': 'New Jersey'    , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  1,  9), 'state': 'Illinois'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2008,  1, 13), 'state': 'New Jersey'    , 'event': 'Law'            },
    {'timestamp': non_stupid_date(2008,  2, 18), 'state': 'Washington'    , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  3,  4), 'state': 'Hawaii'        , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2008,  3,  4), 'state': 'Hawaii'        , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  3, 19), 'state': 'Vermont'       , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  4,  2), 'state': 'Maine'         , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  4,  7), 'state': 'Illinois'      , 'event': 'Law'            },
    {'timestamp': non_stupid_date(2008,  4, 24), 'state': 'Vermont'       , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2008,  5,  1), 'state': 'Hawaii'        , 'event': 'Law'            },
    {'timestamp': non_stupid_date(2008,  5, 16), 'state': 'Vermont'       , 'event': 'Veto'           },
    {'timestamp': non_stupid_date(2008,  5, 27), 'state': 'Rhode Island'  , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  6, 20), 'state': 'Rhode Island'  , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2008,  6, 30), 'state': 'California'    , 'event': 'Assembly passes'},
    {'timestamp': non_stupid_date(2008,  7,  2), 'state': 'Rhode Island'  , 'event': 'Veto'           },
    {'timestamp': non_stupid_date(2008,  7,  9), 'state': 'Massachusetts' , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2008,  7, 30), 'state': 'Massachusetts' , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2008,  8, 14), 'state': 'California'    , 'event': 'Veto'           },
    {'timestamp': non_stupid_date(2008, 12, 11), 'state': 'Michigan'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2009,  2,  7), 'state': 'Vermont'       , 'event': 'Senate passes'  },
    {'timestamp': non_stupid_date(2009,  2, 20), 'state': 'New Mexico'    , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2009,  3, 12), 'state': 'Oregon'        , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2009,  3, 17), 'state': 'Colorado'      , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2009,  4, 15), 'state': 'Washington'    , 'event': 'House passes'   },
    {'timestamp': non_stupid_date(2009,  4, 21), 'state': 'Nevada'        , 'event': 'Assembly passes'},
    {'timestamp': non_stupid_date(2009,  4, 28), 'state': 'Washington'    , 'event': 'Law'            },
    {'timestamp': non_stupid_date(2009,  5, 12), 'state': 'Connecticut'   , 'event': 'House passes'   },
];

var charts = ['One house', 'Both houses', 'Law'];

// http://colorschemedesigner.com/#4O527w0w0w0w0
var colors = { //   # normal   # dark     # darker   # light    # lighter
    'Law'         :['#EF002A', '#B32D45', '#9B001C', '#F73E5F', '#F76F87'],
    'Both houses' :['#8506A9', '#6A237E', '#56026E', '#B23AD4', '#BB63D4'],
    'One house'   :['#2A17B1', '#392E85', '#150873', '#5D4BD8', '#7D71D8'],
};

var descriptions = {
    'Law'        :"Enacted into state law",
    'Both houses':"Passed both houses"    ,
    'One house'  :"Passed one house"      ,
}

var start = non_stupid_date(2006, 2, 23);

var states = {};

var padding = 12;
var base_y = 270 + padding; // 538

var chart_end = days(new Date() - start) + padding

var paths = {};
var groups = {};

var debug_content = '';
function debug(e){
    debug_content += e+'\n';
    //db += e+' '+s+' '+n+'\n';
}
function show_debug(){
    if (debug_content != '') alert(debug_content);
}

var base_text_style  = {'font-size':12};
var left_text_style  = update({'text-anchor':'start'}, base_text_style);
var right_text_style = update({'text-anchor':'end'}, base_text_style);
var label_text_style = {'text-anchor':'start','font-size':4,};
var title_text_style = {'text-anchor':'start','font-size':18};
var fudge = base_text_style['font-size']/2;

// Label helpers

function make_label(x, y, date, state, event, chart){
    var lg = group(attrs={'transform':make_label_rotation(x+1, y-2)});
    lg.appendChild(
        text(x+1, y-2, attributes=update({'fill':colors[chart][2],}, label_text_style))('← ' + date_format(date) + ': ' + make_label_text(state, event))
    );
    return lg;
}

function make_label_text(state, event){
    return state + ' ' + event;
}

function make_label_rotation(x, y){
    return 'rotate(-90,'+ x + ', ' + y +')';
}

// End label helpers

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

        var old = last_point(paths['One house']);
        var y = old[1] + evs[state];
        append_point(paths['One house'], x, y); ///

        // Label it, but only for 'One house' (the uppermost one) to avoid overlap
        groups['One house'].appendChild(make_label(x, y, e['timestamp'], state, e['event'], 'One house'));
        
        old = last_point(paths['Both houses']);
        y = old[1] + evs[state];
        append_point(paths['Both houses'], x, y);

        if (y >= base_y){
            reset_path(paths['Law']);
        }

    } else {
        if (event != 'Law'){
            states[state] = get(states, state, 0) + 1;
            if (states[state] == 1){
                event = 'One house'
            } else if (states[state] == 2){
                event = 'Both houses'
            } else {
                // Second version of a bill passed; do nothing
                next_event(i);
                return;
            }
        }
        var old = last_point(paths[event]);
        var y = old[1] - evs[state];
        if (x == old[0]){
            // Move and append to the last label rather than generating a new one
            var last_label_group = groups[event].lastChild;
            last_label_group.setAttribute('transform', make_label_rotation(x, y));
            var last_label_text = last_label_group.lastChild;
            last_label_text.setAttribute('y', y);
            last_label_text.appendChild(
                svgDocument.createTextNode(', ' + make_label_text(state, e['event']))
            );

            // Overwrite the last point rather than generating a new one
            paths[event].setAttribute('d', paths[event].getAttribute('d').split(' ').slice(0, -2).join(' '));
            append_point(paths[event], x, y);
        } else {
            groups[event].appendChild(make_label(x, y, e['timestamp'], state, e['event'], event));
            append_point(paths[event], x, y);
        }
        // Set start points for the "next" event type now that this one is non-zero
        if (event == 'One house' && paths['Both houses'].getAttribute('d') == "M"){
            reset_path(paths['Both houses']);
            append_point(paths['Both houses'], x, base_y);
        } else if (event == 'Both houses' && paths['Law'].getAttribute('d') == "M"){
            reset_path(paths['Law']);
            append_point(paths['Law'], x, base_y);
        }
    }
    next_event(i);
}

function render(evt){
    O = evt.target;
    svgDocument = O.ownerDocument;
    svgRoot = svgDocument.documentElement;

    //svgRoot.appendChild(line(padding, padding, chart_end, padding, style={'stroke':'black'}));

    //dds['width' ] = chart_end + padding*2
    //dds['height'] = base_y + padding*2
    //dds['viewBox'] = (0, 0, dds['width'], dds['height'])
    
    svgRoot.appendChild(text(padding, padding*2, attributes=title_text_style)("Progress of National Popular Vote Legislation"));

    svgRoot.appendChild(text(chart_end, padding+fudge, attributes=right_text_style)("Electoral votes needed to take effect:"));

    svgRoot.appendChild(text(chart_end+fudge, padding+fudge, attributes=left_text_style)(270));

    // Date tick-marks
    svgRoot.appendChild(text(padding, base_y + fudge*3, attributes=left_text_style)(date_format(start)));
    for (y=start.getFullYear(); y<(new Date()).getFullYear(); y++){
        tick = non_stupid_date(y+1, 1, 1);
        tick_x = days(tick - start) + padding;
        svgRoot.appendChild(text(tick_x, base_y + fudge*3, attributes=left_text_style)(y+1));
    }

    // Create polygons and key 
    var key_start = title_text_style['font-size'] * 2 + padding;
    var box_size = left_text_style['font-size'];
    for (var c in charts){
        var ct = charts[c];
        var color = {'fill':colors[ct][3], 'stroke':colors[ct][1], 'opacity':1.0};
        var p = path('M', attributes=color);
        paths[ct] = p;
        var g = group();
        groups[ct] = g;
        g.appendChild(p)
        svgRoot.appendChild(g);

        g.appendChild(rect(padding, key_start-box_size, box_size, box_size, attributes=color));
        g.appendChild(text(padding+box_size*1.5, key_start, attributes=update({'fill':colors[ct][2],}, left_text_style))(descriptions[ct]));
        key_start += box_size*1.5;
    }

    // Add start point
    append_point(paths['One house'], padding, base_y);

    handle_event(0);
}

function finish(){
    for (var c in charts){
        var ct = charts[c]; 
        last = last_point(paths[ct]);
        append_point(paths[ct], chart_end, last[1]); /// extend to (x for today, last y)
        append_point(paths[ct], chart_end, base_y);  /// extend to (x for today, base y)
        close_path(paths[ct]); /// close the path
        groups[ct].appendChild( /// Add a number for progress
            text(chart_end+fudge, last[1]+fudge, attributes=update({'fill':colors[ct][2]}, left_text_style))(270 - (last[1] - padding))
        )
    }

    show_debug();
}

