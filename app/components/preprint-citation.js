import Ember from 'ember';


var BASE_URL = '/preprints/assets/';

var STYLES = {
    apa: 'apa.csl',
    mla: 'modern-language-association.csl',
    chicago: 'chicago-author-date.csl'
};


var get_sys = function(csl, locale) {
    return {
        retrieveItem: function(id) {
            return csl[id];
        },
        retrieveLocale: function() {
            return locale;
        }
    }
};

var makeCiteproc = function(style, citations, format, locale) {
    format = format || 'html';
    let sys = get_sys(citations, locale);
    let citeproc = new CSL.Engine(sys, style); // jshint ignore:line
    citeproc.setOutputFormat(format);
    citeproc.appendCitationCluster({
        citationItems: Object.keys(citations).map(function(key) {
            return {
                id: key
            };
        }),
        properties: {
            noteIndex: 0
        }
    });
    return citeproc;
};

export default Ember.Component.extend({

    apa: Ember.computed('csl', function() {
        return Ember.RSVP.all([
            Ember.$.get(BASE_URL + 'locales-en-US.xml'),
            Ember.$.get(BASE_URL + STYLES.apa)
        ]).then((abc) => {
            let locale = abc[0];
            let style = abc[1];
            let citeproc = makeCiteproc(style, this.get('csl'), 'html', locale);
            return citeproc.makeBibliography()[1];
        });
    }),

    mla: Ember.computed('csl', function() {
        var csl = this.get('csl');
        return csl;
    }),

    chicago: Ember.computed('csl', function() {
        var csl = this.get('csl');
        return csl;
    })
});
