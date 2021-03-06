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
        useStubs: localStorage.useStubs!="false",
        
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
        edit_dialog_readonly: false,
        edit_dialog_isnew: false,
        edit_dialog_valid: false,
        edit_koulutus: new Koulutus({}),

        pvmRules: [ v => !!v || "Päivämäärä on pakollinen" ],
        tilaisuusRules: [ v => !!v || "Tilaisuus on annettava" ],
        kouluttajaRules: [ v => !!v || "Kouluttaja on annettava" ],

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
                    key: 'tilaisuus',
                    template: opp => {
                        return "<a>" + opp.tilaisuus + "</a>";
                    },
                    onClick: entry => {
                        Bus.emit(Bus.LINK_CLICK, entry);
                    },
                    link_click: true,
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
                {   hidden: true,  key: 'tilaisuus_id'},
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
            let koulutus = this.data.koulutukset.filter(it => it.id == entry.tilaisuus_id);
            this.edit(koulutus[0], true);
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


        edit(koulutus, read_only) {
            let self = this;

            if(read_only) this.edit_dialog_readonly = true;
            else this.edit_dialog_readonly = false;

            this.edit_dialog = true;
            this.edit_koulutus = new Koulutus(koulutus);

        },

        save(koulutus) {
            let self = this;
            if(!this.$refs.form.validate()) return;


            self.data.save(koulutus).then(function() {
                self.edit_dialog = false;
            });
        },

        editOsallistujat(koulutus) {
            this.osallistujat_dialog = true;
        },

        toggleStubs(){
            this.useStubs = !this.useStubs;
            localStorage.useStubs = this.useStubs;
            location.reload();
        }
    }
})