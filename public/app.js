(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("bus.js", function(exports, require, module) {
"use strict";

var bus = new Vue({
    methods: {
        on: function on(event, callback) {
            this.$on(event, callback);
        },
        emit: function emit(event, payload) {
            this.$emit(event, payload);
        }
    }
});

var SNACKBAR = "SNACKBAR";
var UPDATE_GRID = "UPDATE_GRID";
var DOC_SAVED = "DOC SAVED";

function snackbar(message) {
    console.log(message);
    bus.emit(SNACKBAR, message);
}

module.exports = {
    bus: bus,
    UPDATE_GRID: UPDATE_GRID,
    DOC_SAVED: DOC_SAVED,
    SNACKBAR: SNACKBAR,
    on: function on(event, callback) {
        bus.on(event, callback);
    },
    emit: function emit(event, payload) {
        bus.emit(event, payload);
    },
    snackbar: snackbar
};
});

;require.register("classes.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var id = 1;

var Osallistuja = function () {
    function Osallistuja() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, Osallistuja);

        this.luokka = "Osallistuja";
        if (obj) {
            this.id = obj.id;
            this.nimi = obj.nimi;
            this.postino = obj.postino;
            this.paikka = obj.paikka;
            this.vuosi = obj.vuosi;
            this.email = obj.email;
        }

        if (this.id < 1) this.id = id++;
    }

    _createClass(Osallistuja, [{
        key: "toFirebase",
        value: function toFirebase() {
            var ret = {};
            ret.nimi = this.nimi ? this.nimi.toString() : "<puuttuu>";
            ret.postino = this.postino ? this.postino : "";
            ret.vuosi = this.vuosi ? this.vuosi : "";
            ret.paikka = this.paikka ? this.paikka : "";
            ret.email = this.email ? this.email : "";
            ret.huom = this.huom ? this.email : "";

            return ret;
        }
    }]);

    return Osallistuja;
}();

var Koulutus = function () {
    function Koulutus() {
        var _this = this;

        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _classCallCheck(this, Koulutus);

        if (obj) {
            this.uid = obj.uid;
            this.id = obj.id;
            this.kouluttaja = obj.kouluttaja;
            this.tilaisuus = obj.tilaisuus;
            this.pvm = obj.pvm;
            this.paikka = obj.paikka;
            this.alue = obj.alue;
            this.info = obj.info;
            this.lkm = obj.lkm;
            this.osallistujat = [];
            if (obj.osallistujat) obj.osallistujat.map(function (osall) {
                _this.osallistujat.push(new Osallistuja(osall));
            });
        }

        if (!this.osallistujat) this.osallistujat = [];

        if (!this.id) this.id = id++;

        this.title = this.tilaisuus + "_" + this.pvm;
    }

    _createClass(Koulutus, [{
        key: "create",
        value: function create() {
            this.osallistujat.push(new Osallistuja({ id: id++ }));
        }
    }, {
        key: "toFirebase",
        value: function toFirebase() {
            var ret = {};

            ret.kouluttaja = this.kouluttaja ? this.kouluttaja : "<puuttuu>";
            ret.tilaisuus = this.tilaisuus ? this.tilaisuus : "<puuttuu>";
            ret.pvm = this.pvm ? this.pvm : "1999.01.01";
            ret.paikka = this.paikka ? this.paikka : "";
            ret.alue = this.alue ? this.alue : "";
            ret.info = this.info ? this.info : "";
            ret.lkm = this.lkm ? this.lkm : this.osallistujat.length;

            ret.osallistujat = this.osallistujat.map(function (osall) {
                return osall.toFirebase();
            });

            return ret;
        }
    }]);

    return Koulutus;
}();

module.exports = {
    Osallistuja: Osallistuja,
    Koulutus: Koulutus
};
});

;require.register("firebase.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bus = require("bus");
var Classes = require("classes");
var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;

var id = 1;

var Data = function () {
    function Data() {
        _classCallCheck(this, Data);

        this.signed_in = false;

        this.koulutukset = [];
        this.users = [];

        this.loading = 0;
        this.db = {};

        this.initFirebase();
        this.initFirebaseUi();

        this.keys = [];
    }

    _createClass(Data, [{
        key: "oppilaat",
        value: function oppilaat() {
            var ret = [];
            for (var i = 0; i < this.koulutukset.length; ++i) {
                var koulutus = this.koulutukset[i];
                for (var j = 0; j < koulutus.osallistujat.length; ++j) {
                    ret.push(koulutus.osallistujat[j]);
                }
            }

            return ret;
        }
    }, {
        key: "getData",
        value: function getData() {
            var self = this;

            self.loading++;

            var oppilasLoader = 0;

            this.db.collection("koulutukset").get().then(function (koulutukset) {
                oppilasLoader += koulutukset.size;
                koulutukset.forEach(function (koulutus) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(koulutus.id, " => ", koulutus.data());

                    self.keys.push(koulutus.id);
                    var newKoul = koulutus.data();
                    newKoul.uid = koulutus.id;
                    self.koulutukset.push(new Koulutus(newKoul));

                    oppilasLoader--;
                    if (oppilasLoader < 1) {
                        Bus.emit(Bus.UPDATE_GRID, self.oppilaat());
                    }
                });
            }).catch(function (error) {
                Bus.snackbar("Koulutusten haku epäonnistui: " + error);
            });
            self.loading--;

            self.loading++;
            this.db.collection("users").get().then(function (users) {
                users.forEach(function (user) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(user.id, " => ", user.data());
                    self.users.push(user.data());
                });
            }).catch(function (error) {
                Bus.snackbar("Käyttäjien haku epäonnistui: " + error);
            });
            self.loading--;
        }
    }, {
        key: "save",
        value: function save(koulutus, callback) {
            var self = this;

            var fb = koulutus.toFirebase();

            if (!koulutus.uid) {
                this.db.collection("koulutukset").add(fb).then(function (docRef) {
                    self.edit_dialog = false;
                    Bus.snackbar("Document written with ID: " + docRef.id);
                    self.koulutukset.push(new Koulutus(docRef));
                    if (callback) callback();
                }).catch(function (error) {
                    Bus.snackbar("Error adding document: " + error);
                });
            } else {
                this.db.collection("koulutukset").doc(koulutus.uid).set(fb).then(function () {
                    self.edit_dialog = false;
                    Bus.snackbar("Document succesfully written!");
                    if (callback) callback();
                }).catch(function (error) {
                    Bus.snackbar("Error writing document: " + error);
                });
            }
        }
    }, {
        key: "update",
        value: function update(koulutus) {
            // Vaihdetaan sisäisen listan tieto
            for (var i = 0; i < this.koulutukset.length; ++i) {
                if (this.koulutukset[i].uid == koulutus.id) {
                    this.koulutukset[i] = koulutus;
                    return;
                }
            }
        }
    }, {
        key: "initFirebase",
        value: function initFirebase() {
            // Initialize Firebase
            var config = {
                apiKey: "AIzaSyBqnnD4nhjqAPGYSy5c8doBIUhdJQH3fVM",
                authDomain: "koulutustirtokanta.firebaseapp.com",
                databaseURL: "https://koulutustirtokanta.firebaseio.com",
                projectId: "koulutustirtokanta",
                storageBucket: "koulutustirtokanta.appspot.com",
                messagingSenderId: "437082065797"
            };
            firebase.initializeApp(config);
            this.db = firebase.firestore();
        }
    }, {
        key: "initFirebaseUi",
        value: function initFirebaseUi() {
            var self = this;

            var uiConfig = {
                signInSuccessUrl: '', //'<url-to-redirect-to-on-success>',
                signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID],
                // Terms of service url.
                tosUrl: '<your-tos-url>'
            };

            this.firebaseUi = new firebaseui.auth.AuthUI(firebase.auth());

            // The start method will wait until the DOM is loaded.
            this.firebaseUi.start('#firebaseui-auth-container', uiConfig);

            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {

                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var uid = user.uid;
                    var phoneNumber = user.phoneNumber;
                    var providerData = user.providerData;
                    user.getIdToken().then(function (accessToken) {
                        self.user = user;
                        self.signed_in = true;

                        // document.getElementById('sign-in-status').textContent = 'Signed in';
                        // document.getElementById('sign-in').textContent = 'Sign out';
                    });

                    self.getData();
                } else {
                    // User is signed out.
                    self.signed_in = false;
                    self.user = {};
                    // document.getElementById('sign-in-status').textContent = 'Signed out';
                    // document.getElementById('sign-in').textContent = 'Sign in';
                    // document.getElementById('account-details').textContent = 'null';
                }
            }, function (error) {
                console.log(error);
            });
        }
    }]);

    return Data;
}();

var dataClass = new Data();

module.exports = {
    data: dataClass
};
});

;require.register("main.js", function(exports, require, module) {
"use strict";

var Components = require("vue-components");
var Classes = require("classes");
var Firebase = require("firebase");
var Bus = require("bus");

var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;

new Vue({
    el: '#app',
    data: {
        tabs: null,

        data: Firebase.data,

        snackbar: false,
        snackbar_text: "",

        koulutukset: [],
        users: [],

        edit_dialog: false,
        edit_koulutus: new Koulutus(),

        osallistujat_dialog: false,
        oppilas_options: {
            columns: [{ title: 'Nimi', width: "50%", key: 'nimi' }, { title: 'Vuosi', width: "10%", key: 'vuosi' }, { title: 'Email', width: "10%", key: 'email' }],

            generalFilter: true,
            columnFilters: true,

            onCreated: function onCreated(component) {
                Bus.on(Bus.UPDATE_GRID, function (data) {
                    component.setData(data);
                });
            }
        }
    },
    created: function created() {
        var self = this;

        Bus.on(Bus.SNACKBAR, function (msg) {
            self.snackbar_text = msg;
            self.snackbar = true;
        });
    },

    mounted: function mounted() {},
    computed: {},

    methods: {
        oppilaat: function oppilaat() {
            var ret = [];
            console.log("Koulutuksia: " + this.koulutukset.length);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.koulutukset[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var koulutus = _step.value;

                    if (!koulutus.osallistujat) continue;
                    koulutus.osallistujat.map(function (osallistuja) {
                        return ret.push(osallistuja);
                    });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return ret;
        },
        newKey: function newKey(kouluttaja, tilaisuus, date) {
            var suffix = 1;
            var key = date + "_" + kouluttaja + "_" + "aihe";
            while (this.keys.indexOf(key + "_" + suffix) >= 0) {
                suffix++;
            }

            return key + "_" + suffix;
        },
        addKoulutus: function addKoulutus() {

            var key = this.newKey("Esko Hannula", "Peruskurssi", "2018.03.03");
            this.db.collection("koulutukset").doc(key).set({
                kouluttaja: "Esko Hannula",
                tilaisuus: "Peruskurssi",
                date: "2018.03.03"
            }).then(function () {
                location.reload();
            });
        },
        sign_out: function sign_out() {
            var self = this;
            firebase.auth().signOut().then(function () {
                location.reload();
            });
        },
        add_osallistuja: function add_osallistuja() {
            this.edit_koulutus.osallistujat.push({ id: id++ });
        },
        remove_osallistuja: function remove_osallistuja(osallistuja) {
            this.edit_koulutus.osallistujat = this.edit_koulutus.osallistujat.filter(function (osall) {
                return osall.id !== osallistuja.id;
            });
        },
        edit: function edit(koulutus) {
            var self = this;

            this.edit_dialog = true;
            this.edit_koulutus = new Koulutus(koulutus);
        },
        save: function save(koulutus) {
            var self = this;
            this.data.save(koulutus, function () {
                self.edit_dialog = false;
            });
        },
        editOsallistujat: function editOsallistujat(koulutus) {
            this.osallistujat_dialog = true;
        }
    }
});
});

;require.register("vue-components.js", function(exports, require, module) {
'use strict';

module.exports = "compo";

Vue.component('vue-jos-grid', {
    template: '\n    <div class="jos-table-container" style="padding: 0px;">   \n\n    <input v-if="options.generalFilter" style="margin-top: 16px; border: 1px solid #eee;" type="text" v-model="general_filter" placeholder="Hae">\n    <table :class="options.luokka" id="jos-grid" style="cursor: pointer;">                                                                               \n        <thead>                                                                                                   \n            <tr>                                                                                                  \n                <th v-for="column in shownColumns" :class="{active: sortCol == column.key}" :width="column.width">\n                    <span @click="column.sortable != false && sortBy(column.key)">{{column.title}}</span>         \n                    <span v-if="sortIndicators[column.key]==1" class="material-icons" style="font-size: 15px">arrow_downward</span>                                          \n                    <span v-if="sortIndicators[column.key]==-1" class="material-icons" style="font-size: 15x">arrow_upward</span>                                       \n\n                    <i v-if="column.isLast" style="float: right" class="glyphicon glyphicon-filter" @click="toggleColumnFilters()" title="Sarakekohtaiset suodattimet p\xE4\xE4lle/pois" />                                                                                  \n                    \n                    <template v-if="columnFilters && column.filterable != false">                                                  \n                        <br><input style="width: 80%;" type="text" v-model="filters[column.key]">                 \n                    </template> \n                </th>                                                                                             \n            </tr>                                                                                                 \n        </thead>                                                                                                  \n        <tbody>                                                                                                   \n            <tr v-for="entry in filteredSortedData" :key="entry.josOrder" @click="rowClick(entry)">            \n                <td v-for="column in shownColumns">                                                               \n                    <div v-if="column.template" style="display: inline-block" v-html="entry[column.key]"></div>\n                    <template v-else>\n                        <template v-if="column.type == \'text\'">                                                     \n                            {{entry[column.key]}}                                                                     \n                        </template>                                                                                   \n                        <template v-if="column.type == \'number\'">                                                   \n                            {{entry[column.key]}}                                                                                          \n                        </template>                                                                                    \n                        <template v-if="column.type == \'link\'">                                                     \n                            <a :href="entry[column.key].href">{{entry[column.key].text}}</a>                          \n                        </template>                                                                                   \n                        <template v-if="column.type == \'date\'">                                                     \n                            {{formatDate(entry[column.key])}}\n                        </template>                                                                                   \n                    </template>\n                </td>                                                                                             \n            </tr>                                                                                                 \n        </tbody>                                                                                                  \n    </table>                                                                                                      \n    </div>                \n    ',
    props: ['data', 'options'],

    // columnSetting:
    // {
    //     title: "Pitkä nimi",
    //     key: "nimi",
    //     type: text / number / date / jotain ihan muuta
    // }

    data: function data() {
        var self = this;
        var localData = [];
        this.options.luokka = {
            'table': false,
            'table-striped': false,
            'table-bordered': false,
            'table-hover': false,
            'table-condensed': false,

            'jos-table': true
        };

        var columns = [];
        var filters = {};
        var sortIndicators = {};
        var cnt = 1;
        if (this.options && this.options.columns) {
            this.options.columns.forEach(function (column) {
                var localColumn = column;
                localColumn.josSortOrder = 0;
                if (column.type == undefined) localColumn.type = "text";
                if (column.name == undefined) localColumn.name = column.key;
                columns.push(localColumn);
                sortIndicators[column.key] = 0;
                localColumn.isLast = cnt++ == self.options.columns.length - 1;
            });
        }

        var c = 1;
        if (this.data) {
            this.data.forEach(function (item) {
                item['josOrder'] = c++;

                self.options.columns.forEach(function (column) {
                    if (column.template != undefined) {
                        item[column.key] = column.template(item);
                    }
                });
                localData.push(item);
            });
        }

        var sortKey = '';
        if (this.options.initialSort) {
            sortIndicators[this.options.initialSort.key] = this.options.initialSort.order; //sortIndicators['pvm']=-1;
            sortKey = this.options.initialSort.key;
        }

        var columnFilters = this.options.columnFilters;
        if (localStorage.josGridColumnFilters) columnFilters = localStorage.josGridColumnFilters;
        if (typeof columnFilters === 'undefined') columnFilters = false;

        return {
            columnFilters: columnFilters,
            menu: false,
            general_filter: "",
            localData: localData,
            sortCol: sortKey,
            sortOrder: -1,
            columns: columns,
            sortIndicators: sortIndicators,
            filters: filters
        };
    },

    created: function created() {
        if (this.options.onCreated) this.options.onCreated(this);

        if (this.options.columnFilters != true) this.options.columnFilters = false;
        if (this.options.generalFilter != true) this.options.generalFilter = false;
    },

    computed: {
        shownColumns: function shownColumns() {
            return this.columns.filter(function (item) {
                return item.hidden != true;
            });
        },

        filteredSortedData: function filteredSortedData() {
            var _this = this;

            var self = this;
            var ret = this.localData;

            if (this.options.externalFilters) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.options.externalFilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var extFilt = _step.value;

                        ret = extFilt(ret);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            for (var i = 0; i < this.columns.length; ++i) {
                var column = this.columns[i];
                ret = this.filterByColumn(column, ret);
            }

            var _loop = function _loop(_i) {
                var column = _this.columns[_i];
                if (column.name == _this.sortCol) {
                    if (_this.sortOrder == 0) {
                        ret = ret.sort(function (a, b) {
                            return a.josOrder - b.josOrder;
                        });
                    } else {
                        ret = ret.sort(function (a, b) {
                            var r = 0;
                            var v1 = self.getVal(column, a[column.key]);
                            var v2 = self.getVal(column, b[column.key]);

                            if (v1 < v2) r = -1;else if (v1 > v2) r = 1;
                            return r * self.sortOrder;
                        });
                    }
                }
            };

            for (var _i = 0; _i < this.columns.length; ++_i) {
                _loop(_i);
            }

            ret = this.generalFilter(ret);

            return ret;
        }
    },
    methods: {
        toggleColumnFilters: function toggleColumnFilters() {
            this.columnFilters = !this.columnFilters;

            localStorage.josGridColumnFilters = this.columnFilters;
        },


        rowClick: function rowClick(row_item) {
            if (this.options.onRowClick) this.options.onRowClick(row_item);
        },

        setData: function setData(data) {
            var self = this;
            var localData = [];
            var c = 1;
            if (data) {
                data.forEach(function (item) {
                    var ni = {};
                    ni['josOrder'] = c++;

                    var col = 0;
                    self.options.columns.forEach(function (column) {
                        if (column.template != undefined) {
                            ni[column.key] = column.template(item);
                        } else {
                            ni[column.key] = item[column.key];
                        }
                    });
                    localData.push(ni);
                });
            }

            self.localData = localData;
        },

        sortBy: function sortBy(key) {
            this.sortIndicators = {};
            if (this.sortCol != key) {
                this.sortCol = key;
                this.sortOrder = 1;
            } else {
                if (this.sortOrder == 1) this.sortOrder = -1;else if (this.sortOrder == -1) this.sortOrder = 0;else if (this.sortOrder == 0) this.sortOrder = 1;
            }
            this.sortIndicators[key] = this.sortOrder;
        },
        getVal: function getVal(column, entry) {
            if (entry == null || entry == undefined) entry = "";
            if (column.type == 'link') return entry.text.toLowerCase();
            return entry.toLowerCase();
        },
        filterByColumn: function filterByColumn(column, data) {
            var self = this;
            var filter = this.filters[column.key];
            if (filter == undefined || filter.length < 1) return data;
            filter = filter.toLowerCase();
            var ret = data;

            ret = ret.filter(function (item) {
                var val = self.getVal(column, item[column.key]);
                if (val == undefined) val = "";
                val = val.toString().toLowerCase();
                return val.indexOf(filter) > -1;
            });
            return ret;
        },
        generalFilter: function generalFilter(data) {
            if (this.general_filter.length < 1) return data;

            var self = this;
            var filter = this.general_filter.toLowerCase();
            var ret = data;

            ret = ret.filter(function (item) {
                var accept = false;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = self.columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var col = _step2.value;

                        if (col.hidden) continue;
                        var val = self.getVal(col, item[col.key]);
                        val = val.toString().toLowerCase();
                        if (val.indexOf(filter) > -1) {
                            accept = true;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                return accept;
            });
            return ret;
        },
        formatDate: function formatDate(string) {
            return moment(string).format("DD.MM.YYYY");
        }
    }
});

Vue.component('vue-grid-filters', {
    template: ' \n    <div style="margin-right: 5px; margin-top: 10px; margin-bottom: 10px; float: right;">\n        <div class="btn-group" style="margin-right: 15px;">                                                                                                                                                                             \n            <button type="button" @click="dateFilter(\'ALL\')" :class="classes.all">Kaikki</button>                                                                                                                                                                                   \n            <button type="button" @click="dateFilter(\'MONTH\')" :class="classes.kk">Kuukausi</button>                                                                                                                                                                                   \n            <button type="button" @click="dateFilter(\'WEEK\')" :class="classes.vko">Viikko</button>                                                                                                                                                                                   \n        </div>                                                                                                                                                                            \n        <div class="btn-group">                                                                                                                                                                             \n            <button type="button" @click="userFilter(\'MY\')" :class="classes.omat">Omat</button>                                                                                                                                                                                   \n            <button type="button" @click="userFilter(\'ALL\')" :class="classes.kaikkien">Kaikkien</button>                                                                                                                                                                                   \n        </div>                \n    </div>                                                                                                                                                            \n    ',
    props: ['date_filter', 'user_filter', 'jos'],
    data: function data() {
        return {};
    },
    computed: {
        classes: function classes() {
            var all = false;
            var month = false;
            var week = false;
            var my = false;
            if (this.date_filter == 'ALL') all = true;
            if (this.date_filter == 'MONTH') month = true;
            if (this.date_filter == 'WEEK') week = true;
            if (this.user_filter == 'MY') my = true;

            var ret = {
                all: {
                    'btn': true,
                    'btn-default': !all,
                    'btn-primary': all,
                    'btn-xs': true
                },
                kk: {
                    'btn': true,
                    'btn-default': !month,
                    'btn-primary': month,
                    'btn-xs': true
                },
                vko: {
                    'btn': true,
                    'btn-default': !week,
                    'btn-primary': week,
                    'btn-xs': true
                },

                omat: {
                    'btn': true,
                    'btn-default': !my,
                    'btn-primary': my,
                    'btn-xs': true
                },
                kaikkien: {
                    'btn': true,
                    'btn-default': my,
                    'btn-primary': !my,
                    'btn-xs': true
                }
            };
            return ret;
        }
    },
    methods: {
        dateFilter: function dateFilter(f) {
            bus.emit(EVENT_DATE_FILTER, f);
        },
        userFilter: function userFilter(f) {
            bus.emit(EVENT_USER_FILTER, f);
        }
    }
});
});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('main');
//# sourceMappingURL=app.js.map