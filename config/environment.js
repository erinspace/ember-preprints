/* jshint node: true */

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'preprint-service',
        environment: environment,
        rootURL: '/preprints/',
        locationType: 'auto',
        authorizationType: 'cookie',
        'ember-simple-auth': {
            authorizer: 'authorizer:osf-cookie',
            authenticator: 'authenticator:osf-cookie'
        },
        //Change here to switch back to mirage calls. Examples of calls in index.js
        'ember-cli-mirage': {
            enabled: true
        },
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            }
        },
        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
        }
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        // ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
    }

    if (environment === 'production') {

    }

    return ENV;
};
