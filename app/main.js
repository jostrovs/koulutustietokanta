import VueComponents from "./vue-components"

import VueKoulutukset from "./components/koulutukset"


import Classes from "./classes"
import Firebase from "./firebase"
import Bus from "./bus"

var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;

import Jos from 'jos.vue'
Vue.component("jos", Jos);

new Vue({
    el: '#app',
    data: {
        tabs: null,

        date_picker_menu: {},

        data: {
            signed_in: false
        }, //Firebase.data, asetetaan created-metodissa

        filters: {
            pvm: null,
            tilaisuus: null,
            kouluttaja: null,
            osallistujia: null
        },

        snackbar: false,
        snackbar_text: "",

        koulutukset: [],
        users: [],

        edit_dialog: false,
        edit_koulutus: new Koulutus({}),

        osallistujat_dialog: false,
        oppilas_options: {
            columns: [{
                    title: 'Nimi',
                    width: "20%",
                    key: 'nimi'
                },
                {
                    title: 'Tilaisuus',
                    width: "20%",
                    name: 'tilaisuus',
                    template: opp => {
                        return "<a>" + opp.tilaisuus + "</a>";
                    },
                    onClick: entry => {
                        Bus.emit(Bus.LINK_CLICK, entry);
                    }
                },
                {
                    title: 'Vuosi',
                    width: "10%",
                    key: 'vuosi'
                },
                {
                    title: 'Email',
                    width: "10%",
                    key: 'email'
                },
                {
                    title: 'PostiNo',
                    width: "10%",
                    key: 'postino'
                },
                {
                    title: 'Paikka',
                    width: "10%",
                    key: 'paikka'
                },
                {
                    title: 'Huom',
                    width: "10%",
                    key: 'huom'
                },
                {   hidden: true,  key: 'tilaisuus' },
                {   hidden: true,  key: 'tilaisuus_til'},
                {   hidden: true,  key: 'tilaisuus_koul'},
                {   hidden: true,  key: 'tilaisuus_pvm'},
            ],

            generalFilter: true,
            columnFilters: true,

            onCreated: function(component) {
                Bus.on(Bus.UPDATE_GRID, function(data) {
                    component.setData(data);
                })
            },
        },
    },
    created() {
        let self = this;
        this.data = Firebase.data;

        Bus.on(Bus.SNACKBAR, function(msg) {
            self.snackbar_text = msg;
            self.snackbar = true;
        });

        Bus.on(Bus.EDIT_KOULUTUS, self.edit);
        Bus.on(Bus.LINK_CLICK, self.klikker);
    },
    mounted: function() {},
    computed: {
        level() {
            if (!this.data) return 0;
            return this.data.userLevel();
        }
    },

    methods: {
        klikker(entry) {
            let a = entry;
            this.tabs = "1"; // Valitaan koulutukset-tabi
            this.filters.tilaisuus = entry.tilaisuus_til;
            this.filters.kouluttaja = entry.tilaisuus_koul;
            this.filters.pvm = entry.tilaisuus_pvm;
        },

        oppilaat() {
            return this.data.oppilaat();
        },

        addKoulutus() {
            this.edit(new Koulutus());
        },

        sign_out() {
            let self = this;
            firebase.auth().signOut().then(function() {
                location.reload()
            });
        },

        add_osallistuja() {
            this.edit_koulutus.osallistujat.push({
                id: id++
            });
        },

        remove_osallistuja(osallistuja) {
            this.edit_koulutus.osallistujat = this.edit_koulutus.osallistujat.filter(osall => {
                return osall.id !== osallistuja.id;
            });
        },


        edit(koulutus) {
            let self = this;

            this.edit_dialog = true;
            this.edit_koulutus = new Koulutus(koulutus);

        },

        save(koulutus) {
            let self = this;

            self.data.save(koulutus).then(function() {
                self.edit_dialog = false;
            });
        },

        editOsallistujat(koulutus) {
            this.osallistujat_dialog = true;
        }

    }
})