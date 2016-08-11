import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';

// Enum of available states
export const State = Object.freeze(new Ember.Object({
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}));

export default Ember.Controller.extend(NodeActionsMixin, {
    toast: Ember.inject.service(),
    session: Ember.inject.service(),
    panelActions: Ember.inject.service(),
    currentUser: Ember.inject.service(),
    fileManager: Ember.inject.service(),

    _State: State,
    state: State.START,
    uploadState: State.START,
    uploadFile: null,
    resolve: null,
    preprintNode: null,
    user: null,
    userNodes: Ember.A([]),
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },

    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),
    valid: new Ember.Object(),
    init() {
        this._super(...arguments);
        if (this.get('session.isAuthenticated')) {
            this._setCurrentUser();
        }
    },
    _setCurrentUser() {
        this.get('currentUser').load().then(user => this.set('user', user));
    },
    _refreshNodes() {
        const user = this.get('user');
        if (user) {
            loadAll(user, 'nodes', this.get('userNodes'));
        } else {
            this.set('userNodes', Ember.A());
        }
    },
    onGetCurrentUser: Ember.observer('user', function() {
        this._refreshNodes();
    }),

    filter: [{}, {}, {}],
    filteredPath: Ember.computed('path', 'filter', 'filter.@each.value', function() {
        return this.get('path').slice(0, 2).map((path, i) => {
            if (path.children && this.get(`filter.${i + 1}.value`)) {
                return {
                    name: path.name,
                    children: path.children.filter(child =>
                        this.get(`filter.${i + 1}.value`).indexOf(child.name || child) !== -1)
                };
            }
            return path;
        });
    }),
    sortedTaxonomies: Ember.computed('taxonomies', 'filter', 'filter.0.value', function() {
        return [{
            name: 'a',
            children: [{
                name: 'b',
                children: ['c', 'd', 'e']
            }, {
                name: 'f',
                children: ['g']
            }],
        }, {
            name: 'h',
            children: [{
                name: 'i',
                children: ['j', 'k']
            }]
        }, {
            name: 'l'
        }].filter(taxonomy =>
            !this.get('filter.0.value') || taxonomy.name.indexOf(this.get('filter.0.value')) !== -1
        );
    }),
    path: [],
    selected: new Ember.Object(),
    sortedSelection: Ember.computed('selected', function() {
        const sorted = [];
        const selected = this.get('selected');
        const flatten = ([obj, name = []]) => {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return name.length !== 0 && sorted.pushObject(name);
            } else {
                return keys.sort()
                    .map(key => [obj.get(key), [...name, key]])
                    .forEach(flatten);
            }
        };
        flatten([selected]);
        return sorted;
    }),

    actions: {
        verify(name, state) {
            this.get('valid').set(name, state);
        },
        next(name) {
            // Open next panel
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(name) + 1}`));
        },
        changeState(newState) {
            this.set('state', newState);
        },
        changeUploadState(newState) {
            this.set('uploadState', newState);
        },
        createProject(resolve) {
            const node = this.get('store').createRecord('node', {
                title: this.get('nodeTitle'),
                category: 'project',
                public: true
            });
            node.save().then(() => {
                this.set('preprintNode', node);
                this._refreshNodes();
                this.send('startUpload', resolve);
            });
        },
        deleteProject(resolve) {
            if (this.get('preprintNode')) {
                this.get('preprintNode').destroyRecord().then(() => {
                    this.get('toast').info('Project deleted');
                });
                this.set('preprintNode', null);
                // TODO: reset dropzone, since uploaded file has no project
            }
            resolve();
        },
        preUpload(ignore, dropzone, file) {
            this.set('uploadFile', file);
            return new Ember.RSVP.Promise(resolve => this.set('resolve', resolve));
        },
        startUpload(resolve) {
            this.set('_url', `${this.get('preprintNode.files').findBy('name', 'osfstorage').get('links.upload')}?kind=file&name=${this.get('uploadFile.name')}`);
            this.get('resolve')();
            this.get('toast').info('File will upload in the background.');
            resolve();
        },
        buildUrl() {
            return this.get('_url');
        },
        success() {
            this.get('toast').info('File uploaded!');
        },
        deleteSubject(key, array = key.split('.')) {
            this.set(key, null);
            // Delete key manually
            switch (array.length) {
                case 2:
                    delete this[array[0]][array[1]];
                    break;
                case 3:
                    delete this[array[0]][array[1]][array[2]];
                    break;
                case 4:
                    delete this[array[0]][array[1]][array[2]][array[3]];
                    break;
                default:
                    console.error('deletion not implemented');
            }
        },
        deselectSubject([...args]) {
            args = args.filter(arg => Ember.typeOf(arg) === 'string');
            this.send('deleteSubject', `selected.${args.join('.')}`, ['selected', ...args]);
            this.notifyPropertyChange('selected');
            this.rerender();
        },
        selectSubject(...args) {
            const process = (prev, cur, i, arr) => {
                const selected = this.get(`selected.${prev}`);
                if (!selected) {
                    // Create necessary parent objects and newly selected object
                    this.set(`selected.${prev}`, new Ember.Object());
                } else if (i === 3 || i === args.length && args.length === this.get('path').length &&
                    this.get('path').every((e, i) => e.name === args[i].name) &&
                    Object.keys(selected).length === 0) {
                    // Deselecting a subject: if subject is last item in args,
                    // its children are showing, and no children are selected
                    this.send('deleteSubject', `selected.${prev}`, ['selected', ...arr.splice(0, i)]);
                    args.popObject();
                }
                return `${prev}.${cur}`;
            };
            // Process past length of array
            [...args.map(arg => arg.name || arg), ''].reduce(process);
            this.set('path', args);
            this.notifyPropertyChange('selected');
            this.rerender();
        }
    }
});
