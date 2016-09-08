import Ember from 'ember';


var STYLES = {
    apa: 'apa',
    mla: 'modern-language-association',
    chicago: 'chicago-author-date'
};


export default Ember.Component.extend({

    apa: Ember.computed('csl', function() {

        var csl = this.get('csl');
        return Ember.$.ajax({
            type: 'GET',
            url: 'http://localhost:8000/v2/nodes/' + csl.id + '/citation/apa/',
            crossDomain: true,
        }).then(function (results) {
            // debugger;
            return results.citation;
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
