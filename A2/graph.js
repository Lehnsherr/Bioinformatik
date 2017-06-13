
/*''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
 * Graph
 * 
 * Links -> sind die Ergebnisse aus compareFragmentChunks
 * 
 /''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''*/
function buildGraph(links) {
    var nodes = {};
    var linkDistance = 300;
    var colors = d3.scale.category10();

    // Compute the distinct nodes from the links.
    links.forEach(function (link) {
        //console.log(link.source, link.target, link.value);
        link.source = nodes[link.source] ||
            (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] ||
            (nodes[link.target] = { name: link.target });
    });

    //select all the elements below the SVG with the "svg > *" selector, i.e. to remove all of those
    d3.selectAll('svg > *').remove();

    var svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height');

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance([linkDistance])
        .charge([-500])
        .theta(0.1)
        .gravity(0.05)
        .start();

    var edges = svg.selectAll(".line")
        .data(links)
        .enter()
        .append("line")
        .attr("id", function (d, i) { return 'edge' + i })
        .attr('marker-end', 'url(#arrowhead)')
        .style("stroke", "#ccc")
        .style("pointer-events", "none");


    
    var nodes = svg.selectAll("circle")
        .data(force.nodes())
        .enter()
        .append("circle")
        .attr({ "r": 15
            })
        .style("fill", function (d, i) { return colors(i); })
        .call(force.drag);

    var nodelabels = svg.selectAll(".nodelabel")
        .data(force.nodes())
        .enter()
        .append("text")
        .attr({"x":function(d){
            return d.x;},
              "y":function(d){return d.y;},
              "class":"nodelabel",
              "stroke":"black"})
       .text(function(d){return d.name;});

    var edgepaths = svg.selectAll(".edgepath")
        .data(links)
        .enter()
        .append('path')
        .attr({
            'd': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y },
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'fill': 'blue',
            'stroke': 'red',
            'id': function (d, i) { return 'edgepath' + i }
        })
        .style("pointer-events", "none");

    var edgelabels = svg.selectAll(".edgelabel")
        .data(links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) { return 'edgelabel' + i },
            'dx': 80,
            'dy': 0,
            'font-size': 10,
            'fill': '#aaa'
        });

    edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i })
        .style("pointer-events", "none")
        .text(function (d, i) { return links[i].value });


    svg.append('defs').append('marker')
        .attr({
            'id': 'arrowhead',
            'viewBox': '-0 -5 10 10',
            'refX': 25,
            'refY': 0,
            'orient': 'auto',
            'markerWidth': 10,
            'markerHeight': 10,
            'xoverflow': 'visible'
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#ccc')
        .attr('stroke', '#ccc');


    force.on("tick", function () {

        edges.attr({
            "x1": function (d) { return d.source.x; },
            "y1": function (d) { return d.source.y; },
            "x2": function (d) { return d.target.x; },
            "y2": function (d) { return d.target.y; }
        });

        nodes.attr({
            "cx": function (d) { return d.x; },
            "cy": function (d) { return d.y; }
        });

        
        nodelabels
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; });
        

        edgepaths
            .attr('d', function (d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                return path
        });

        edgelabels.attr('transform', function (d, i) {
            if (d.target.x < d.source.x) {
                bbox = this.getBBox();
                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    });
}
