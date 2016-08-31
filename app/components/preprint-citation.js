import Ember from 'ember';

import {CSL} from 'npm:citeproc-js-node';
// import * as citeproc from "citeproc-js-node";

// var citeproc = require("citeproc-js-node");



var STYLES = {
    apa: 'apa.csl',
    mla: 'modern-language-association.csl',
    chicago: 'chicago-author-date.csl'
};
//
// var makeCiteproc = function(style, citations, format) {
//     format = format || 'html';
//     var sys = {
//         retrieveItem: function(id) {
//             return citations[id];
//         },
//         retrieveLocale: function() {
//             return locale;
//         }
//     };
//     var citeproc = new CSL.Engine(sys, style); // jshint ignore:line
//     citeproc.setOutputFormat(format);
//     citeproc.appendCitationCluster({
//         citationItems: Object.keys(citations).map(function(key) {
//             return {
//                 id: key
//             };
//         }),
//         properties: {
//             noteIndex: 0
//         }
//     });
//     return citeproc;
// };

var formatCitation = function(style, data, format) {
    var citeproc = makeCiteproc(style, data, format);
    return citeproc.makeBibliography()[1];
};


export default Ember.Component.extend({

    apa: Ember.computed('csl', function() {
        var csl = this.get('csl');
        return formatCitation(STYLES.apa, csl, 'text');
    }),

    mla: Ember.computed('csl', function() {
        var csl = this.get('csl');
        return formatCitation(STYLES.mla, csl, 'text');
    }),

    chicago: Ember.computed('csl', function() {
        var csl = this.get('csl');
        return formatCitation(STYLES.chicago, csl, 'text');
    })
});


'use strict';

// require('css/citations.css');
// var locale = require('raw!../vendor/bower_components/locales/locales-en-US.xml');
