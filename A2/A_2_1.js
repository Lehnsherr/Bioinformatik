'use strict';

/**
 * Golbale Variablen
 */
var objArray = [];
var graphArray = [];
var fragmentArray = undefined;

var nodes = [];
var edges = [];

var max_id = 0;

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
            f.size, ' bytes, zuletzt modifiezert: ',
            f.lastModified ? f.lastModified : 'n/a',
            '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);


function readBlob(opt_startByte, opt_stopByte) {

    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Bitte Datei auswähhlen!');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    var btnSpace = d3.select('readLineButtons');

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            var lines = reader.result.split('\n');
            var c = 0;
            fragmentArray = [];

            for (var i = 0; i < lines.length; i++) {
                c = c + lines[i].length;
                fragmentArray[i] = lineToFragment(lines[i], c, i);
                //console.log(fragmentArray[i]);
            }

            buildTable(fragmentArray);
            makeGraph();

            for (var j = 0; j < fragmentArray.length; j++) {
                document.getElementById('byte_range').textContent =
                    ['Read bytes: ', start + 1, ' - ', stop + 1,
                        ' of ', file.size, ' byte file'].join('');
            }
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

//Button mit onclick belegen 
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
    var fragmentString = '{"id":' + i + ', "fragment": ' + '"' + line + '"' + ', "count":' + count + '}';

    var objArray = [];
    objArray[i] = JSON.parse(fragmentString);
    //console.log(objArray[i]);

    return objArray[i];
}


document.querySelector('.mergeGraph').addEventListener('click', function (evt) {
    if (evt.target.tagName.toLowerCase() == 'button') {
        if (fragmentArray === undefined) {
            alert('Please select a file!');
        } else {
            deleteTable(fragmentArray);
            merdgeNodes(edges);
            updateTable(nodes);
        }
    }
}, false);


function initNodes() {
    nodes = [];
    for (var i = 0; i < fragmentArray.length; i++) {
        var node = new Node(fragmentArray[i].fragment);

        nodes[i] = node;
    }
}

function makeGraph() {
    console.log(nodes);

    graphArray = [];
    edges = [];

    if (nodes.length == 0) {
        initNodes();
    }

    if (nodes.length == 1) {
        buildSingelNode(nodes[0])
    }

    for (var k = 0; k < nodes.length; k++) {
        nodes[k].edgesOut = [];
        nodes[k].edgesOut = [];
    }


    for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < nodes.length; j++) {
            var break_it = false;
            if (nodes[i].fragment == nodes[j].fragment) {
                break_it = true;
            }

            if (nodes[j] === undefined) {
                break_it = true;
            }

            //let overlap = longestCommonSubstring(nodes[i].fragment, nodes[j].fragment);
            let overlap = computeOverlap(nodes[i].fragment, nodes[j].fragment);

            //console.log('new: ' + overlap_2.sequence, overlap_2.length, 'Old: ' + overlap.sequence, overlap.length)

            if (nodes.length > 3) {
                if (overlap.length <= 0) {
                    break_it = true;
                }
            }



            if (break_it == false) {
                var edge = new Edge(i, nodes[i].fragment, j, nodes[j].fragment, overlap.sequence);
                nodes[i].edgesOut.push(edge);
                nodes[j].edgesIn.push(edge);
            }

        }

        edges.push(nodes[i].edgesOut);

    }
    edges = [].concat.apply([], edges)


    //Graph erstellen
    let x = 0;
    edges.forEach(function (edge) {
        //console.log(edge);
        x++;
        addToGraphObj(x, edge.from, edge.to, edge.overlap.length);
    });

    buildGraph(graphArray);
}



/**
 * Reduzierung des Graphen 
 * Raussuchen der Groeßten überlappung
 * Verschmelzung dieser
 * @param {obj} edges Alle Edges aus den Nodes
 */
function merdgeNodes(edges) {
    var tmp_node_from = undefined;
    var tmp_node_to = undefined;
    var new_fragment = undefined;
    var from, to = undefined;

    var max_edge = getMaxOverlap(edges);

    tmp_node_from = max_edge.from;
    tmp_node_to = max_edge.to;

    var tmp_node_from_rest = (tmp_node_from.substring(0, tmp_node_from.length - max_edge.overlap.length));
    var tmp_node_to_rest = (tmp_node_to.substring(max_edge.overlap.length, tmp_node_to.length));


    new_fragment = tmp_node_from_rest + max_edge.overlap + tmp_node_to_rest;

    showMergeOutput(tmp_node_from, tmp_node_to, new_fragment, max_edge);

    removeByAttr(nodes, 'fragment', tmp_node_from);
    removeByAttr(nodes, 'fragment', tmp_node_to);

    var node = new Node(new_fragment);

    nodes.push(node);

    makeGraph()
}

/**
 * Sucht aus einem gegeben Array (Edges) die Kante mit dem
 * größen Overlap herraus
 * @param {Array} edges 
 */
function getMaxOverlap(edges) {
    var max_overlap_edge;

    if (edges !== undefined) {
        max_overlap_edge = edges[0];
    }

    for (var i = 0; i < edges.length; i++) {
        if (edges[i].overlap.length > max_overlap_edge.overlap.length) {
            max_overlap_edge = edges[i];
            max_id = i;
        }
    }
    return max_overlap_edge;
}


/**
 * berechnet den direkten Overlap zwischen 2 Strings
 * @param {String} str1 
 * @param {String} str2 
 */
function computeOverlap(str1, str2) {
    if (!str1 || !str2) {
        return {
            length: 0,
            sequence: ""
        };
    }


    for (var k = Math.min(str1.length, str2.length); k > 0; k--) {
        if (str1.substring(str1.length - k) == (str2.substring(0, k))) {
            return {
                length: k,
                sequence: str2.substring(0, k)
            };
        }
    }

    return {
        length: 0,
        sequence: ""
    };
}

/**
 * Löscht Objekt aus Array anhand von Attribut und alue
 * @param {Array} arr       ein Array mit Onjekten
 * @param {String} attr     eine Attribut des Objektes im Array
 * @param {int/string} value         Wert des gesuchten Attributes
 */
var removeByAttr = function (arr, attr, value) {
    var i = arr.length;
    while (i--) {
        if (arr[i]
            && arr[i].hasOwnProperty(attr)
            && (arguments.length > 2 && arr[i][attr] === value)) {

            arr.splice(i, 1);
        }
    }
    return arr;
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
        '}';

    graphArray.push(JSON.parse(graphString));
}


/*
function longestCommonSubstring(str1, str2) {
    if (!str1 || !str2)
        return {
            length: 0,
            sequence: "",
            offset: 0
        };

    var sequence = "",
        str1Length = str1.length,
        str2Length = str2.length,
        num = new Array(str1Length),
        maxlen = 0,
        lastSubsBegin = 0;

    for (var i = 0; i < str1Length; i++) {
        var subArray = new Array(str2Length);
        for (var j = 0; j < str2Length; j++)
            subArray[j] = 0;
        num[i] = subArray;
    }
    var thisSubsBegin = null;
    for (var i = 0; i < str1Length; i++) {
        for (var j = 0; j < str2Length; j++) {
            if (str1[i] !== str2[j])
                num[i][j] = 0;
            else {
                if ((i === 0) || (j === 0))
                    num[i][j] = 1;
                else
                    num[i][j] = 1 + num[i - 1][j - 1];

                if (num[i][j] > maxlen) {
                    maxlen = num[i][j];
                    thisSubsBegin = i - num[i][j] + 1;
                    if (lastSubsBegin === thisSubsBegin) {//if the current LCS is the same as the last time this block ran
                        sequence += str1[i];
                    }
                    else //this block resets the string builder if a different LCS is found
                    {
                        lastSubsBegin = thisSubsBegin;
                        sequence = ""; //clear it
                        sequence += str1.substr(lastSubsBegin, (i + 1) - lastSubsBegin);
                    }
                }
            }
        }
    }
    return {
        length: maxlen,
        sequence: sequence,
        offset: thisSubsBegin
    };
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

    return suf;
}
*/