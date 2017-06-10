
/*''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
 * Graph
 * 
 * Links -> sind die Ergebnisse aus compareFragmentChunks
 * 
 /''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''*/
function buildGraph(links) {
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function (link) {
        console.log(link.source, link.target);
        link.source = nodes[link.source] ||
            (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] ||
            (nodes[link.target] = { name: link.target });
        link.value = +link.value;
    });

    //select all the elements below the SVG with the "svg > *" selector, i.e. to remove all of those
    d3.selectAll('svg > *').remove();

    var svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height'),

        markerWidth = 6,
        markerHeight = 6,
        cRadius = 30,
        refX = 15,
        refY = -1.5,
        pathX = cRadius + (markerWidth * 2),
        pathY = Math.sqrt(cRadius),
        drSub = cRadius + refY;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(160)
        .charge(-300)
        .on('tick', tick)
        .start();

    // asign a type per value to encode opacity
    links.forEach(function (link) {
        if (link.value <= 25) {
            link.type = 'twofive';
        } else if ((link.value <= 50) && (link.value > 25)) {
            link.type = 'fivezero';
        } else if ((link.value) <= 75 && (link.value) > 50) {
            link.type = 'sevenfive';
        } else if ((link.value) <= 100 && (link.value) > 75) {
            link.type = 'onezerozero';
        }
    });


    // build the arrow.
    svg.append('svg:defs').selectAll('marker')
        .data(['end'])      // Different link/path types can be defined here
        .enter().append('svg:marker')    // This section adds in the arrows
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');



    // add the links and the arrows
    var path = svg.selectAll('.path')
        //svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append('svg:path')
        .attr('id', function (d) { return 'path' + d.id; })
        .attr('class', function (d) { return 'link ' + d.type; })
        .attr('marker-end', 'url(#end)');
    //.attr("d", "M 10,90 Q 100,15 200,70 Q 340,140 400,30");



    svg.selectAll('.link')
        .append('text')

        .append('textPath')
        .attr('xlink:href', function (d) { return '#path' + d.id; })
        .style('text-anchor', 'middle')
        .attr('startOffset', '50%')
        //.attr("x", pathX)
        //.attr("dy", "."+pathY+"em")
        //. //append a textPath to the text element
        .text(function (d) { return d.value; });

    // define the nodes
    var node = svg.selectAll('.node')
        .data(force.nodes())
        .enter().append('g')
        .attr('class', 'node')
        .on('click', click)
        .on('dblclick', dblclick)
        .call(force.drag);


    // add the nodes
    node.append('circle')
        .attr('r', 5);

    // add the text 
    node.append('text')
        .attr('x', 12)
        .attr('dy', '.35em')
        .text(function (d) { return d.name; });

    // add the curvy lines
    function tick() {
        path.attr('d', function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return 'M' +
                d.source.x + ',' +
                d.source.y + 'A' +
                dr + ',' + dr + ' 0 0,1 ' +
                d.target.x + ',' +
                d.target.y;
        });

        node
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
    }

    // action to take on mouse click
    function click() {
        d3.select(this).select('text').transition()
            .duration(750)
            .attr('x', 22)
            .style('fill', 'steelblue')
            .style('stroke', 'lightsteelblue')
            .style('stroke-width', '.5px')
            .style('font', '20px sans-serif');
        d3.select(this).select('circle').transition()
            .duration(750)
            .attr('r', 16)
            .style('fill', 'lightsteelblue');
    }

    // action to take on mouse double click
    function dblclick() {
        d3.select(this).select('circle').transition()
            .duration(750)
            .attr('r', 6)
            .style('fill', '#ccc');
        d3.select(this).select('text').transition()
            .duration(750)
            .attr('x', 12)
            .style('stroke', 'none')
            .style('fill', 'black')
            .style('stroke', 'none')
            .style('font', '10px sans-serif');
    }
}