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
function set_style(node, style){
    for (var a in style){
        node.setAttribute(a, style[a]);
    }
}

function text(x, y, style){
    return function (content){
        var t = svgDocument.createElementNS(xmlns, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        set_style(t, style);
        t.appendChild(svgDocument.createTextNode(content));
        return t;
    }
}

function line(x1, y1, x2, y2, style){
    var l = svgDocument.createElementNS(xmlns, 'line');
    l.setAttribute('x1', x1);
    l.setAttribute('y1', y1);
    l.setAttribute('x2', x2);
    l.setAttribute('y2', y2);
    set_style(l, style);
    return l;
}

function path(d, style){
    var p = svgDocument.createElementNS(xmlns, 'path');
    p.setAttribute('d', d);
    set_style(p, style);
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

function group(attrs){
    var g = svgDocument.createElementNS(xmlns, 'g');
    if (attrs){
        set_style(g, attrs);
    }
    return g;
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
 {'event': 'Senate passes', 'state': 'Colorado', 'timestamp': non_stupid_date(2006, 4, 1)},
 {'event': 'Assembly passes', 'state': 'California', 'timestamp': non_stupid_date(2006, 5, 1)},
 {'event': 'Senate passes', 'state': 'California', 'timestamp': non_stupid_date(2006, 8, 1)},
 {'event': 'Veto', 'state': 'California', 'timestamp': non_stupid_date(2006, 9, 30)},
 {'event': 'Senate passes', 'state': 'Colorado', 'timestamp': non_stupid_date(2007, 1, 24)},
 {'event': 'Senate passes', 'state': 'Hawaii', 'timestamp': non_stupid_date(2007, 2, 14)},
 {'event': 'House passes', 'state': 'Arkansas', 'timestamp': non_stupid_date(2007, 3, 21)},
 {'event': 'Senate passes', 'state': 'Maryland', 'timestamp': non_stupid_date(2007, 3, 28)},
 {'event': 'House passes', 'state': 'Maryland', 'timestamp': non_stupid_date(2007, 4, 2)},
 {'event': 'House passes', 'state': 'Hawaii', 'timestamp': non_stupid_date(2007, 4, 5)},
 {'event': 'Law', 'state': 'Maryland', 'timestamp': non_stupid_date(2007, 4, 10)},
 {'event': 'House passes', 'state': 'Illinois', 'timestamp': non_stupid_date(2007, 5, 2)},
 {'event': 'Veto', 'state': 'Hawaii', 'timestamp': non_stupid_date(2007, 5, 3)},
 {'event': 'Senate passes', 'state': 'North Carolina', 'timestamp': non_stupid_date(2007, 5, 14)},
 {'event': 'Senate passes', 'state': 'California', 'timestamp': non_stupid_date(2007, 5, 14)},
 {'event': 'Senate passes', 'state': 'Illinois', 'timestamp': non_stupid_date(2007, 5, 31)},
 {'event': 'Assembly passes', 'state': 'New Jersey', 'timestamp': non_stupid_date(2007, 12, 13)},
 {'event': 'Senate passes', 'state': 'New Jersey', 'timestamp': non_stupid_date(2008, 1, 3)},
 {'event': 'House passes', 'state': 'Illinois', 'timestamp': non_stupid_date(2008, 1, 9)},
 {'event': 'Law', 'state': 'New Jersey', 'timestamp': non_stupid_date(2008, 1, 13)},
 {'event': 'Senate passes', 'state': 'Washington', 'timestamp': non_stupid_date(2008, 2, 18)},
 {'event': 'House passes', 'state': 'Hawaii', 'timestamp': non_stupid_date(2008, 3, 4)},
 {'event': 'Senate passes', 'state': 'Hawaii', 'timestamp': non_stupid_date(2008, 3, 4)},
 {'event': 'Senate passes', 'state': 'Vermont', 'timestamp': non_stupid_date(2008, 3, 19)},
 {'event': 'Senate passes', 'state': 'Maine', 'timestamp': non_stupid_date(2008, 4, 2)},
 {'event': 'Law', 'state': 'Illinois', 'timestamp': non_stupid_date(2008, 4, 7)},
 {'event': 'House passes', 'state': 'Vermont', 'timestamp': non_stupid_date(2008, 4, 24)},
 {'event': 'Law', 'state': 'Hawaii', 'timestamp': non_stupid_date(2008, 5, 1)},
 {'event': 'Veto', 'state': 'Vermont', 'timestamp': non_stupid_date(2008, 5, 16)},
 {'event': 'Senate passes', 'state': 'Rhode Island', 'timestamp': non_stupid_date(2008, 5, 27)},
 {'event': 'House passes', 'state': 'Rhode Island', 'timestamp': non_stupid_date(2008, 6, 20)},
 {'event': 'Assembly passes', 'state': 'California', 'timestamp': non_stupid_date(2008, 6, 30)},
 {'event': 'Veto', 'state': 'Rhode Island', 'timestamp': non_stupid_date(2008, 7, 2)},
 {'event': 'House passes', 'state': 'Massachusetts', 'timestamp': non_stupid_date(2008, 7, 9)},
 {'event': 'Senate passes', 'state': 'Massachusetts', 'timestamp': non_stupid_date(2008, 7, 30)},
 {'event': 'Veto', 'state': 'California', 'timestamp': non_stupid_date(2008, 8, 14)},
 {'event': 'House passes', 'state': 'Michigan', 'timestamp': non_stupid_date(2008, 12, 11)},
 {'event': 'Senate passes', 'state': 'Vermont', 'timestamp': non_stupid_date(2009, 2, 7)},
 {'event': 'House passes', 'state': 'New Mexico', 'timestamp': non_stupid_date(2009, 2, 20)},
 {'event': 'House passes', 'state': 'Oregon', 'timestamp': non_stupid_date(2009, 3, 12)},
 {'event': 'House passes', 'state': 'Colorado', 'timestamp': non_stupid_date(2009, 3, 17)},
 {'event': 'House passes', 'state': 'Washington', 'timestamp': non_stupid_date(2009, 4, 15)},
 {'event': 'Assembly passes', 'state': 'Nevada', 'timestamp': non_stupid_date(2009, 4, 21)},
 {'event': 'Law', 'state': 'Washington', 'timestamp': non_stupid_date(2009, 4, 28)},
 {'event': 'House passes', 'state': 'Connecticut', 'timestamp': non_stupid_date(2009, 5, 12)}
];

var start = non_stupid_date(2006, 2, 23);

// http://colorschemedesigner.com/#4O527w0w0w0w0
var colors = { //   # normal   # dark     # darker   # light    # lighter
    'Law'         :['#EF002A', '#B32D45', '#9B001C', '#F73E5F', '#F76F87'],
    'Both houses' :['#8506A9', '#6A237E', '#56026E', '#B23AD4', '#BB63D4'],
    'One house'   :['#2A17B1', '#392E85', '#150873', '#5D4BD8', '#7D71D8'],
};

var states = {};

var padding = 12;
var base_y = 270 + padding; // 538

var paths = {};
var groups = {};

var db = ''
function debug(e){
    db += e+'\n';
    //db += e+' '+s+' '+n+'\n';
}

var base_text_style  = {'font-size':12};
var left_text_style  = update({'text-anchor':'start'}, base_text_style);
var right_text_style = update({'text-anchor':'end'}, base_text_style);
var label_text_style = {'text-anchor':'start','font-size':4,};
var fudge = base_text_style['font-size']/2;

function make_label(x, y, date, state, event){
    var lg = group(attrs={'transform':make_label_rotation(x, y)});
    lg.appendChild(
        text(x, y, style=label_text_style)('← ' + date_format(date) + ': ' + make_label_text(state, event))
    );
    return lg;
}

function make_label_text(state, event){
    return state + ' ' + event;
}

function make_label_rotation(x, y){
    return 'rotate(-90,'+ x + ', ' + y +')';
}

function render(evt){
    O = evt.target;
    svgDocument = O.ownerDocument;
    svgRoot = svgDocument.documentElement;

    var chart_end = days(new Date() - start) + padding
    //svgRoot.appendChild(line(padding, padding, chart_end, padding, style={'stroke':'black'}));

    //dds['width' ] = chart_end + padding*2
    //dds['height'] = base_y + padding*2
    //dds['viewBox'] = (0, 0, dds['width'], dds['height'])

    var limit_label = text(chart_end, padding+fudge, style=right_text_style)("Electoral votes needed to take effect:");
    svgRoot.appendChild(limit_label);

    var limit_number = text(chart_end+fudge, padding+fudge, style=left_text_style)(270);
    svgRoot.appendChild(limit_number);

    // Date tick-marks
    svgRoot.appendChild(text(padding, base_y + fudge*3, style=left_text_style)(date_format(start)));
    for (y=start.getFullYear(); y<(new Date()).getFullYear(); y++){
        tick = non_stupid_date(y+1, 1, 1);
        tick_x = days(tick - start) + padding;
        svgRoot.appendChild(text(tick_x, base_y + fudge*3, style=left_text_style)(y+1));
    }

    // Polygons
    var one_group  = group();
    var both_group = group();
    var law_group  = group();
    
    svgRoot.appendChild(one_group );
    svgRoot.appendChild(both_group);
    svgRoot.appendChild(law_group );

    var one_path  = path('M' + padding + ' ' + base_y, 
                               style={'fill':colors['One house'  ][3], 'stroke':colors['One house'  ][1], 'opacity':1.0});
    var both_path = path('M', style={'fill':colors['Both houses'][3], 'stroke':colors['Both houses'][1], 'opacity':1.0});
    var law_path  = path('M', style={'fill':colors['Law'        ][3], 'stroke':colors['Law'        ][1], 'opacity':1.0});

    paths['One house'  ] = one_path ;
    paths['Both houses'] = both_path;
    paths['Law'        ] = law_path ;

    one_group.appendChild(one_path);
    both_group.appendChild(both_path);
    law_group.appendChild(law_path);

    groups['One house'  ] = one_group ;
    groups['Both houses'] = both_group;
    groups['Law'        ] = law_group ;

    for (var i in npvp){
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
            one_group.appendChild(make_label(x, y, e['timestamp'], state, e['event']));
            
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
                    continue
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
                groups[event].appendChild(make_label(x, y, e['timestamp'], state, e['event']));
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
    }

    last_one = last_point(paths['One house']);
    append_point(paths['One house'], chart_end, last_one[1]);
    append_point(paths['One house'], chart_end, base_y);
    close_path(paths['One house']);
    one_group.appendChild(
        text(chart_end+fudge, last_one[1]+fudge, style=update({'fill':colors['One house'][2]}, left_text_style))(270 - (last_one[1] - padding))
    )

    last_both = last_point(paths['Both houses']);
    append_point(paths['Both houses'], chart_end, last_both[1]);
    append_point(paths['Both houses'], chart_end, base_y);
    close_path(paths['Both houses']);
    both_group.appendChild(
        text(chart_end+fudge, last_both[1]+fudge, style=update({'fill':colors['Both houses'][2]}, left_text_style))(270 - (last_both[1] - padding))
    )

    last_law = last_point(paths['Law']);
    append_point(paths['Law'], chart_end, last_law[1]);
    append_point(paths['Law'], chart_end, base_y);
    close_path(paths['Law']);
    law_group.appendChild(
        text(chart_end+fudge, last_law[1]+fudge, style=update({'fill':colors['Law'][2]}, left_text_style))(270 - (last_law[1] - padding))
    )


    if (db!='') alert(db);
}

