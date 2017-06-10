'use strict';

function test(){
    console.log('test');
}


class Node {
    constructor(fragment, edgesIn, edgesOut) {
        this.edgesIn = [];
        this.edgesOut = [];
        this.fragment = checkVaildeFragment(fragment);
    }

    get getvaildeFragment() {
        return this.checkVaildeFragment(fragment);
    }

    checkVaildeFragment(fragment) {
        if (fragment == null) {
            new Error("Null fragment.")
        }


        for (var i = 0; i < fragment.length; i++) {
            var character = fragment.charAt(i);
            if (character != 'A' && character != 'T' && character != 'C' && character != 'G') {
                new Error("Invalid fragment.");
            }
        }
        return fragment;
    }
}
