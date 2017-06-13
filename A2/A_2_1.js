//http://jsfiddle.net/Y9Qq3/2/
//http://bl.ocks.org/d3noob/5155181

//https://www.visualcinnamon.com/2015/09/placing-text-on-arcs.html

//https://www.html5rocks.com/en/tutorials/file/dndfiles/


/**
 * Golbale Variablen
 */
// Graph Objekt Array
var objArray = [];
var graphArray = [];
var fragmentArray = undefined;

var nodes = [];
var edges = [];
'use strict';

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
                console.log(fragmentArray[i]);
            }

            buildTable(fragmentArray);


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

document.querySelector('.buildGraph').addEventListener('click', function (evt) {
    if (evt.target.tagName.toLowerCase() == 'button') {
        if (fragmentArray === undefined) {
            alert('Please select a file!');
        }else{
            makeGraph();
        }
    }
}, false);

document.querySelector('.mergeGraph').addEventListener('click', function (evt) {
    if (evt.target.tagName.toLowerCase() == 'button') {
        if (fragmentArray === undefined) {
            alert('Please select a file!');
        }else{
            merdgeNodes(edges);
        }
    }
}, false);


function makeGraph(){
    //console.log(fragmentArray);
    nodes = [];
    edges = [];
    //var AdjazenzArray = makeAdjazenzArray(fragmentArray);

    for (var i = 0; i < fragmentArray.length; i++) {
        node = new Node(fragmentArray[i].fragment);
        
        nodes[i] = node;
    }


    for (var i = 0; i < fragmentArray.length; i++) { 
        for (var j = 0; j < fragmentArray.length; j++) {

            if (fragmentArray[i].fragment == fragmentArray[j].fragment){
                continue;
            }

            if (nodes[j] === undefined){
                break;
            }

            let overlap = longestCommonSubstring(nodes[i].fragment, nodes[j].fragment);

            if (overlap <= 0){
                continue;   
            }
            //console.log(nodes[i].fragment, nodes[j].fragment, overlap);

            edge = new Edge(i, nodes[i].fragment, j, nodes[j].fragment, overlap.sequence);
            nodes[i].edgesOut.push(edge);
            nodes[j].edgesIn.push(edge);
        }
        
        edges.push(nodes[i].edgesOut);

    }
    edges = [].concat.apply([], edges)


    //merdgeNodes(edges);
    
    console.log(edges);
    console.log(nodes);
    
    
    //Graph erstellen
    
    let x = 0;
    edges.forEach(function(edge) {
        x++;
        addToGraphObj(x , edge.from, edge.to, edge.overlap.length);
    });
    
    buildGraph(graphArray);
}

//Reduzierung des Graphen 
//Raussuchen der Groeßten überlappung
//Verschmelzung dieser
function merdgeNodes(edges){
    var new_fragment = undefined;
    var max_edge = getMaxOverlap(edges);
    console.log(max_edge);

    var tmp_node_from = max_edge.from;
    var tmp_node_to = max_edge.to;

    var tmp_node_from_rest = (tmp_node_from.split(max_edge.overlap));
    var tmp_node_to_rest = (tmp_node_to.split(max_edge.overlap));

    new_fragment = tmp_node_to_rest[0] + max_edge.overlap + tmp_node_from_rest[1];
    
    //alte Nodes entfernen
    nodes.splice(tmp_node_from.id, tmp_node_to.id)

    node = new Node(new_fragment);
}


function getMaxOverlap(edges){
    var max_overlap_edge;

    if(edges !== undefined){
        max_overlap_edge = edges[0];
    }

    for (var i = 0; i < edges.length; i++) {
        if (edges[i].overlap.length > max_overlap_edge.overlap.length){
            max_overlap_edge = edges[i];
        }
    }
    return max_overlap_edge;
}



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


/**
 * Objekte erstellen
 /
function toAdjazenzString(id, frag_id, frag, compare_frag_id, compare_frag, overlap) {
    var objArray = [];
    var adjazenzString = '{"id":' + id +
        ', "fragment_ID": ' + '"' + frag_id + '"' +
        ', "fragment": ' + '"' + frag + '"' +
        ', "Compfragment_ID": ' + '"' + compare_frag_id + '"' +
        ', "fragment_2": ' + '"' + compare_frag + '"' +
        ', "overlap":' + overlap + '}';

    objArray[id] = JSON.parse(adjazenzString);

    return objArray[id];
}

function makeAdjazenzArray(fragments) {
    var Adjazenzlist = [];
    var k = 0;
    var l = 0;

    for (var i = 0; i < fragments.length; i++) {
        var fragment = fragments[i].fragment;
        for (var j = 0; j < fragments.length; j++) {
            var compare_frag = fragments[j].fragment;
            var overlap = longestCommonSubstring(fragment, compare_frag);

            if (overlap.length !== 0 && overlap.length !== fragment.length && overlap.length !== compare_frag.length && fragment !== compare_frag) {
                Adjazenzlist[l] = (toAdjazenzString(k, i, fragment, j, compare_frag, overlap.length));
                addToGraphObj(i, fragment, compare_frag, overlap.length);
                l++;
            }

            k++;
        }
    }
    buildGraph(graphArray);
    return Adjazenzlist;
}

*/

/*
function AdjazenzArrayToList(AdjazenzArray) {
     var str = '';
    for (var i = 0; i < AdjazenzArray.length; i++) {
        var j = i+1;
       
        var node = AdjazenzArray[i].fragment;
        var next_node = AdjazenzArray[j].fragment;
        var edge = AdjazenzArray[i].fragment_2;
        var overlap = AdjazenzArray[i].overlap;
        var edgesOut = [];



        if (j = AdjazenzArray.length){
            break;
        }
        if (next_node == node) {
            value_edge = edge + '(' + overlap + ')';
            console.log(value_edge);
            edgesOut.push(value_edge);
        } else {
            str = str + node + edgesOut;
        }
        console.log(node, edge, overlap)
    }

    console.log(str);
    //return AdjazenzList;
}
*/


/* Veraltet, kann wsl weg
/
 Sequenz-Assembly - Variante 1
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
/
function squenz_assambly_var_1(fragment, size) {
    var fragmentChunk = [];
    graphArray = [];

    fragmentChunk = createChunks(fragment, size);
    console.log(fragment, fragmentChunk);

    for (var i = 0; i < fragment.length; i++) {
        //console.log(fragmentChunk[i], fragmentChunk[i +1]);

        if ((fragmentChunk[i + 1]) === undefined){
        } else {
            //if (((fragmentChunk[i].length) == size) && ((fragmentChunk[i + 1].length) == size)) {
            compareFragmentChunks(i, fragmentChunk[i], fragmentChunk[i + 1]);
            //}
        }
    }
    //console.log(graphArray);
    buildGraph(graphArray);
}


/*
 * 1. Teste alle Paare, ob eine Überlappung der Länge k-1
/
function compareFragmentChunks(i, fragmentChunk_1, fragmentChunk_2) {

    if (fragmentChunk_1.length < fragmentChunk_2.length) {
        length = fragmentChunk_1.length;
    } else {
        length = fragmentChunk_2.length;
    }

    //console.log(fragmentChunk_1, fragmentChunk_1.length , fragmentChunk_2, fragmentChunk_2.length);
    for (var i = 0; i < length; i++) {
        if (suffix(fragmentChunk_1[i]) == prefix(fragmentChunk_2[i])) {
            //console.log(i , fragmentChunk_1[i], fragmentChunk_2[i]);
            addToGraphObj(i, fragmentChunk_1[i], fragmentChunk_2[i], 1);
        }
    }
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

function createChunks(str, end, start = 1) {
    var chunks = [];
    var tStr = '';
    for (var i = 0; i < str.length; i++) {
        var tmpStr = str.substring(i, str.length);


        tStr = (tmpStr.match(new RegExp('.{' + start + ',' + end + '}', 'g')));
        console.log(tmpStr, tStr, start, end)


        for (var k = 0; k < tStr.length; k++) {
            //remove elements with lenghts < end (3)
            if (tStr[k].length !== end) {
                tStr.splice(k);
            }
        }

        chunks.push(tStr);

    }
    //console.log(str, chunks);
    return chunks;
}

function createChunk(str, end, start = 1) {
    return str.match(new RegExp('.{' + start + ',' + end + '}', 'g'));
}


*/
