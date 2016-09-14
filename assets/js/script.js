const USER_WIDTH = $(window).width();
const DEV_WIDTH = 1670;
const INIT_RADIUS_SCALE = 5 / DEV_WIDTH * USER_WIDTH;
const RADIUS_SCALE = 30 / DEV_WIDTH * USER_WIDTH;
const SEPARATION_SCALE = 250 / DEV_WIDTH * USER_WIDTH;
const OFFSET_SCALE = 25 / DEV_WIDTH * USER_WIDTH;
const SPIKE_SCALE = 150 / DEV_WIDTH * USER_WIDTH;
const SPIKE_ANGLE = 10;
const PI = Math.PI;

let colorList = {
    'danger':'#800000',
    'crowd':'#FF0000', 
    'conflict':'#808000', 
    'phone':'#FFFF00', 
    'unexpected':'#008000',
    'future':'#00FF00',
    'work':'#008080',
    'stock':'#00FFFF',
    'parking':'#000080',
    'class':'#0000FF',
    'assignment':'#800080',
    'face':'#FF00FF'
}

let s = d3.select('svg');
s.attr('viewBox', 
    '0 0 ' + (8 * SEPARATION_SCALE).toString() + ' ' + (4 * SEPARATION_SCALE).toString());

var data = null;

// Load data
d3.json('/data.json', function(err, d) {
    if(err) {
        console.log(err);
    } else {
        data = d;
        drawCircles();
    }
});

function drawCircles() {
    s.selectAll()
        .data(data)
        .enter()
        .append('circle')
        .style('fill', 'teal')
        .attr('stroke', 'black') 
        .attr('r', INIT_RADIUS_SCALE)
        .attr('cx', function(d) {
            return SEPARATION_SCALE * d.x;// + OFFSET_SCALE * (Math.random() - 0.5)
        })
        .attr('cy', function(d) {
            return -2* INIT_RADIUS_SCALE;// * d.y //+ OFFSET_SCALE * (Math.random() - 0.5)
        });

        transitionCircles();
}

/*function drawSpikes() {
    var circleList = s.selectAll('circle')._groups[0];
    for (var circle = 0; circle < circleList.length; circle++) {
        var c = circleList[circle];
        var cx = c.cx.baseVal.value;
        var cy = c.cy.baseVal.value;
        var r = c.r.baseVal.value;        
        var eventsList = c.__data__.events;
        var numberOfEvents = c.__data__.events.length;
        
        for (var event = 0; event < eventsList.length; event++) {
            var e = eventsList[event];
            // Create string of svg points
            var p1x = (cx - r * Math.sin(PI / 12 * e.time_float - SPIKE_ANGLE * PI / 180)).toString();
            var p1y = (cy + r * Math.cos(PI / 12 * e.time_float - SPIKE_ANGLE * PI / 180)).toString();
            var p2x = (cx - r * Math.sin(PI / 12 * e.time_float + SPIKE_ANGLE * PI / 180)).toString();
            var p2y = (cy + r * Math.cos(PI / 12 * e.time_float + SPIKE_ANGLE * PI / 180)).toString();
            var p3x = (cx - (r + SPIKE_SCALE * e.rating / 10) * Math.sin(PI / 12 * e.time_float)).toString();
            var p3y = (cy + (r + SPIKE_SCALE * e.rating / 10) * Math.cos(PI / 12 * e.time_float)).toString();
            var polyStr = p1x + ',' + p1y + ' ' +
                          p2x + ',' + p2y + ' ' +
                          p3x + ',' + p3y;
            s.append('polygon')
                .attr('points', polyStr)
                .attr('stroke', 'black')
                .attr('fill', colorList[e.type] != '' ? colorList[e.type] : 'white')
        }
    }
}*/

function drawSpikes() {
    s.selectAll('circle')
        // for each circle object (day)
        .each(function(d, i){
            // record its x and y position...
            var cx = this.cx.baseVal.value;
            var cy = this.cy.baseVal.value;
            // ...and its radius
            var r = this.r.baseVal.value;   
            s.selectAll()
                // then bind each event that day to a polygon
                .data(d.events)
                .enter()
                .append('polygon')
                .attr('points', function(d) {
                    return polygonPtsString(cx, cy, r, d.time_float, d.rating, false);
                })
                .attr('stroke', 'black')
                .attr('fill', function(d) {
                    return colorList[d.type] != '' ? colorList[d.type] : 'white'
                })
                .on('mouseover', function() {
                   $('#test-field').text(this.__data__.detail);
                   $('#test-field').css('visibility', 'visible');
                })
                .on('mouseout', function() {
                   $('#test-field').css('visibility', 'hidden');                    
                });
        });

    $('#test-field').css('visibility', 'visible');
}

function polygonPtsString(cx, cy, r, eventTime, eventRating, selected) {
    var spikeSize = selected ? (1.5 * SPIKE_SCALE) : SPIKE_SCALE;
    var p1x = (cx - r * Math.sin(PI / 12 * eventTime - SPIKE_ANGLE * PI / 180)).toString();
    var p1y = (cy + r * Math.cos(PI / 12 * eventTime - SPIKE_ANGLE * PI / 180)).toString();
    var p2x = (cx - r * Math.sin(PI / 12 * eventTime + SPIKE_ANGLE * PI / 180)).toString();
    var p2y = (cy + r * Math.cos(PI / 12 * eventTime + SPIKE_ANGLE * PI / 180)).toString();
    var p3x = (cx - (r + spikeSize * eventRating / 10) * Math.sin(PI / 12 * eventTime)).toString();
    var p3y = (cy + (r + spikeSize * eventRating / 10) * Math.cos(PI / 12 * eventTime)).toString();
    var ptsString = p1x + ',' + p1y + ' ' +
                    p2x + ',' + p2y + ' ' +
                    p3x + ',' + p3y;
    return ptsString;
}

function transitionCircles() {
    s.selectAll('circle')
        .data(data)
        .transition()
        .duration(600)
        .attr('cy', function(d) {
            return SEPARATION_SCALE * d.y;
        })
        .transition()
        .duration(1000)
        .attr('r', function(d) {
            return RADIUS_SCALE * Math.log(d.events.length + 1)
        });

        setTimeout(drawSpikes, 1700);
}