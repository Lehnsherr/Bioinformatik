'use strict';

class Node {
    constructor(fragment) {
        this.edgesIn = [];
        this.edgesOut = [];
        this.fragment = this.checkVaildeFragment(fragment);
    }

    get getvaildeFragment() {
        return this.checkVaildeFragment(this.fragment);
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
