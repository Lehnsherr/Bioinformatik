
/**
 *  Table 
 *  Erzeugen einer Tabelle mit Werten aus Array 
 */
function buildTable(fragmentArray) {
    for (var i = 0; i < fragmentArray.length; i++) {
        console.log(fragmentArray[i].id, fragmentArray[i].fragment, fragmentArray[i].count);

        var frag = fragmentArray[i].fragment;

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

        document.getElementById('tbody').appendChild(tr);
    }
}
