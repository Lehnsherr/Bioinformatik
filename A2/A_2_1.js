// http://jsfiddle.net/Y9Qq3/2/
// http://bl.ocks.org/d3noob/5155181

//https://www.visualcinnamon.com/2015/09/placing-text-on-arcs.html

//https://www.html5rocks.com/en/tutorials/file/dndfiles/

/**
 * Golbale Variablen
 */
// Graph Objekt Array
var objArray = [];

/**
 * Filereader 
 * 
 * Dat File auslesen 
 */
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes, last modified: ',
            f.lastModified ? f.lastModified.toLocaleDateString() : 'n/a',
            '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);


function readBlob(opt_startByte, opt_stopByte) {

    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    var btnSpace = d3.select("readLineButtons");

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2

            var lines = reader.result.split('\n');
            var c = 0;
            var jsonString = [];
            var fragmentArray = [];

            for (var i = 0; i < lines.length; i++) {
                c = c + lines[i].length
                fragmentArray[i] = lineToFragment(lines[i], c, i);
                console.log(fragmentArray[i]);

                squenz_assambly_var_1(fragmentArray[i].fragment, 3);
            }

            buildTable(fragmentArray);

            for (var i = 0; i < fragmentArray.length; i++) {
                document.getElementById('byte_range').textContent =
                    ['Read bytes: ', start + 1, ' - ', stop + 1,
                        ' of ', file.size, ' byte file'].join('');
            }
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

document.querySelector('.readBytesButtons').addEventListener('click', function (evt) {
    if (evt.target.tagName.toLowerCase() == 'button') {
        var startByte = evt.target.getAttribute('data-startbyte');
        var endByte = evt.target.getAttribute('data-endbyte');
        readBlob(startByte, endByte);
    }
}, false);

/**
 * Objekte erstellen
 */
function lineToFragment(line, count, i) {
    var fragmentString = '{"id":' + i + ', "fragment": ' + '"' + line + '"' + ', "count":' + count + '}'

    var objArray = [];
    objArray[i] = JSON.parse(fragmentString);
    //console.log(objArray[i]);

    return objArray[i];
}

/**
 * Sequenz-Assembly - Variante 1
 * Algorithmus: 
 * 1. Teste alle Paare, ob eine Überlappung der Länge k-1
 *      vorhanden ist.
 * 2. Für jedes Paar mit einer Überlappung wird eine gerichtete
 *      Kante zwischen den entsprechenden Knoten von G eingefügt.
 * 3. Berechne Euler-Pfad ( oder Hamiltonian Path )
 * 4. Der Text T kann rekonstruiert werden, indem die ersten
 *      Buchstaben aller Knoten in der Pfad-Reihenfolge aneinander
 *      gehängt werden. Dann werden die restlichen k-1 Buchstaben
 *      des letzten Knotens hinzugefügt.
 */
function squenz_assambly_var_1(fragment, size) {
    var fragmentChunk = [];
    fragmentChunk = createChunks(fragment, size);
    //console.log(fragment, fragmentChunk)

    for (var i = 0; i < fragment.length; i++) {
        if ((fragmentChunk[i + 1]) === undefined) {
        } else {
            //console.log(fragmentChunk[i].length, fragmentChunk.length, size);
            if (((fragmentChunk[i].length) == size) && ((fragmentChunk[i + 1].length) == size)) {
                compareFragmentChunks(i, fragmentChunk[i], fragmentChunk[i + 1]);
            }
        }
    }
    console.log(objArray);
    buildGraph(objArray);
}


/**
 * 1. Teste alle Paare, ob eine Überlappung der Länge k-1
 */
function compareFragmentChunks(i, fragmentChunk_1, fragmentChunk_2) {
    //console.log("Suffix: " + suffix(fragmentChunk_1));
    //console.log("Prefix: " + prefix(fragmentChunk_2));

    if (fragmentChunk_1.length < fragmentChunk_2.length) {
        length = fragmentChunk_1.length
    } else {
        length = fragmentChunk_2.length
    }

    //console.log(fragmentChunk_1, fragmentChunk_2);
    for (var i = 0; i < length; i++) {
        if (suffix(fragmentChunk_1[i]) == prefix(fragmentChunk_2[i])) {
            addToGraphObj(i, fragmentChunk_1[i], fragmentChunk_2[i], 1);
        }
    }
}


/**
 * 2. Für jedes Paar mit einer Überlappung wird eine gerichtete
 *      Kante zwischen den entsprechenden Knoten von G eingefügt.
 * @param {*} source 
 * @param {*} target 
 * @param {*} value 
 */
function addToGraphObj(i, source, target, value) {
    var graphString = '{"id":' + i +
        ', "source": ' + '"' + source + '"' +
        ', "target": ' + '"' + target + '"' +
        ', "value":' + value +
        '}'

    objArray[i] = JSON.parse(graphString);

    return objArray[i];
}

function prefix(str) {
    var size = str.length - 1;
    var pre = createChunk(str, size);

    return pre[0];
}

function suffix(str) {
    var end = str.length;
    var start = str.length - 2;
    var suf = str.substring(start, end);

    return suf
}

function createChunks(str, end, start = 1) {
    var chunks = [];
    var tStr = "";
    for (var i = 0; i < str.length; i++) {
        var tmpStr = str.substring(i, str.length);


        tStr = (tmpStr.match(new RegExp('.{' + start + ',' + end + '}', 'g')));
        //console.log(tmpStr, tStr, start, end)


        for (var k = 0; k < tStr.length; k++) {
            //remove elements with lenghts < end (3)
            if (tStr[k].length !== end) {
                tStr.splice(k);
            }
        }

        chunks.push(tStr);

    }
    //console.log(str, chunks);
    return chunks
}

function createChunk(str, end, start = 1) {
    return str.match(new RegExp('.{' + start + ',' + end + '}', 'g'));
}


/**
 *  Table 
 *  Erzeugen einer Tabelle mit Werten aus Array 
 */
function buildTable(fragmentArray) {
    for (var i = 0; i < fragmentArray.length; i++) {
        //console.log(fragmentArray[i].id, fragmentArray[i].fragment, fragmentArray[i].count)
        var tr = document.createElement('tr');
        var td_id = tr.appendChild(document.createElement('td'));
        var td_frag = tr.appendChild(document.createElement('td'));
        var td_val = tr.appendChild(document.createElement('td'));
        var td_id_text = document.createTextNode(fragmentArray[i].id);
        var td_frag_text = document.createTextNode(fragmentArray[i].fragment);
        var td_val_text = document.createTextNode(fragmentArray[i].count);

        td_id.appendChild(td_id_text);
        td_frag.appendChild(td_frag_text);
        td_val.appendChild(td_val_text);


        document.getElementById("tbody").appendChild(tr);
    }
}


/**
 * Graph
 * 
 * Links -> sind die Ergebnisse aus compareFragmentChunks
 * 
 */
function buildGraph(links) {
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function (link) {
        //console.log(link.source, link.target);
        link.source = nodes[link.source] ||
            (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] ||
            (nodes[link.target] = { name: link.target });
        link.value = +link.value;
    })

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),

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
        .on("tick", tick)
        .start();

    // asign a type per value to encode opacity
    links.forEach(function (link) {
        if (link.value <= 25) {
            link.type = "twofive";
        } else if ((link.value <= 50) && (link.value > 25)) {
            link.type = "fivezero";
        } else if ((link.value) <= 75 && (link.value) > 50) {
            link.type = "sevenfive";
        } else if ((link.value) <= 100 && (link.value) > 75) {
            link.type = "onezerozero";
        }
    });


    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");



    // add the links and the arrows
    var path = svg.selectAll(".path")
        //svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("id", function (d) { return "path" + d.id; })
        .attr("class", function (d) { return "link " + d.type; })
        .attr("marker-end", "url(#end)")
    //.attr("d", "M 10,90 Q 100,15 200,70 Q 340,140 400,30");



    svg.selectAll(".link")
        .append("text")

        .append("textPath")
        .attr("xlink:href", function (d) { return "#path" + d.id; })
        .style("text-anchor", "middle")
        .attr("startOffset", "50%")
        //.attr("x", pathX)
        //.attr("dy", "."+pathY+"em")
        //. //append a textPath to the text element
        .text(function (d) { return d.value; });

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("click", click)
        .on("dblclick", dblclick)
        .call(force.drag);


    // add the nodes
    node.append("circle")
        .attr("r", 5);

    // add the text 
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function (d) { return d.name; });

    // add the curvy lines
    function tick() {
        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    // action to take on mouse click
    function click() {
        d3.select(this).select("text").transition()
            .duration(750)
            .attr("x", 22)
            .style("fill", "steelblue")
            .style("stroke", "lightsteelblue")
            .style("stroke-width", ".5px")
            .style("font", "20px sans-serif");
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 16)
            .style("fill", "lightsteelblue");
    }

    // action to take on mouse double click
    function dblclick() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 6)
            .style("fill", "#ccc");
        d3.select(this).select("text").transition()
            .duration(750)
            .attr("x", 12)
            .style("stroke", "none")
            .style("fill", "black")
            .style("stroke", "none")
            .style("font", "10px sans-serif");
    }
};