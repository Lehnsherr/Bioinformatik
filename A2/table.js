
/**
 *  Table 
 *  Erzeugen einer Tabelle mit Werten aus Array 
 */
function buildTable(fragmentArray) {
    for (var i = 0; i < fragmentArray.length; i++) {
        console.log(fragmentArray[i].id, fragmentArray[i].fragment, fragmentArray[i].count);

        var frag = fragmentArray[i].fragment;

        var tr = document.createElement('tr');
        tr.setAttribute("id", i);

        var td_id = tr.appendChild(document.createElement('td'));
        var td_frag = tr.appendChild(document.createElement('td'));
        var td_val = tr.appendChild(document.createElement('td'));

        var td_id_text = document.createTextNode(fragmentArray[i].id);
        var td_frag_text = document.createTextNode(fragmentArray[i].fragment);
        var td_val_text = document.createTextNode(fragmentArray[i].count);


        td_id.appendChild(td_id_text);
        td_frag.appendChild(td_frag_text);
        td_val.appendChild(td_val_text);

        document.getElementById('tbody_inputTab').appendChild(tr);
    }
}

function updateTable(nodes, new_node) {
    var c = 0;
    fragmentArray = [];
    for (var i = 0; i < nodes.length; i++) {
        c = c + nodes[i].fragment.length;
        fragmentArray[i] = lineToFragment(nodes[i].fragment, c, i);

        console.log(fragmentArray[i]);
    }

    buildTable(fragmentArray);
    color_new_node(nodes);
}

function deleteTable(fragmentArray) {
    var tbody = document.getElementsByTagName('tbody');
    for (var i=tbody.length-1; i>=0;i-=1){
        tbody[i].parentNode.removeChild(tbody[i]);
    }


    var tbl_in = document.getElementById('inputTab');
    
    var tbdy_in = document.createElement('tbody');
    tbdy_in.setAttribute("id", "tbody_inputTab");
    tbl_in.appendChild(tbdy_in);


    var tbl_out = document.getElementById('outputTab');
    
    var tbdy_out = document.createElement('tbody');
    tbdy_out.setAttribute("id", "tbody_outputTab");
    tbl_out.appendChild(tbdy_out);

    console.log(tbl_in);
    console.log(tbl_out);
    //HTMLTableElement.appendChild(document.createElement('tbody'));
    //tab.appendChild(document.createElement('tbody'))
}

function color_new_node(nodes){
    var last_node_id = (nodes.length-1);
    var tbl_clm = document.getElementById(last_node_id);
    var tds = tbl_clm.getElementsByTagName("td");

    for(var i = 0, j = tds.length; i < j; ++i){
       tds[i].style.color = "#00AA00";
    }
}


function showMergeOutput(tmp_node_from, tmp_node_to, new_fragment, max_edge) {
    var str_whitespace = '';
    var html_whitespace = '&#8199;';

    for (var i = 0; i < (tmp_node_from.length - max_edge.overlap.length); i++) {
        str_whitespace = str_whitespace + '\xa0';
        html_whitespace = html_whitespace + '&#8199;';
    }

    var mergeConsoleStr = (
        '\n' + 'Overlap:   ' + str_whitespace + max_edge.overlap +
        '\n' + 'From:      ' + tmp_node_from +
        '\n' + 'To  :      ' + str_whitespace + tmp_node_to +
        '\n' + 'New Node:  ' + new_fragment + '\n');
    console.log(mergeConsoleStr);

    var mergeOutputOverlap = html_whitespace + max_edge.overlap;
    var mergeOutputFrom = tmp_node_from;
    var mergeOutputTo = html_whitespace + tmp_node_to;
    var mergeOutputNewNode = new_fragment;

    var tr_Overlap = document.createElement('tr');
    var tr_From = document.createElement('tr');
    var tr_To = document.createElement('tr');
    var tr_Frag = document.createElement('tr');

    var td_txt_Overlap = tr_Overlap.appendChild(document.createElement('td'));
    var td_mergeOutputOverlap = tr_Overlap.appendChild(document.createElement('td'));
    var td_txt_From = tr_From.appendChild(document.createElement('td'));
    var td_mergeOutputFrom = tr_From.appendChild(document.createElement('td'));
    var td_txt_To = tr_To.appendChild(document.createElement('td'));
    var td_mergeOutputTo = tr_To.appendChild(document.createElement('td'));
    var td_txt_NewNode = tr_Frag.appendChild(document.createElement('td'));
    var td_mergeOutputNewNode = tr_Frag.appendChild(document.createElement('td'));

    var td_txt_Overlap_text = document.createTextNode('Overlap:');
    var td_mergeOutputOverlap_text = document.createTextNode(decodeEntities(mergeOutputOverlap));
    var td_txt_From_text = document.createTextNode('From:');
    var td_mergeOutputFrom_text = document.createTextNode(decodeEntities(mergeOutputFrom));
    var td_txt_To_text = document.createTextNode('To:');
    var td_mergeOutputTo_text = document.createTextNode(decodeEntities(mergeOutputTo));
    var td_txt_NewNode_text = document.createTextNode('New Node:');
    var td_mergeOutputNewNode_text = document.createTextNode(decodeEntities(mergeOutputNewNode));

    td_txt_Overlap.appendChild(td_txt_Overlap_text);
    td_mergeOutputOverlap.appendChild(td_mergeOutputOverlap_text);
    td_txt_From.appendChild(td_txt_From_text);
    td_mergeOutputFrom.appendChild(td_mergeOutputFrom_text);
    td_txt_To.appendChild(td_txt_To_text);
    td_mergeOutputTo.appendChild(td_mergeOutputTo_text);
    td_txt_NewNode.appendChild(td_txt_NewNode_text);
    td_mergeOutputNewNode.appendChild(td_mergeOutputNewNode_text);

    document.getElementById('tbody_outputTab').appendChild(tr_Overlap);
    document.getElementById('tbody_outputTab').appendChild(tr_From);
    document.getElementById('tbody_outputTab').appendChild(tr_To);
    document.getElementById('tbody_outputTab').appendChild(tr_Frag);
}


var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();
