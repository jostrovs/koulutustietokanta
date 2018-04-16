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

        data: {
            signed_in: false 
        },//Firebase.data, asetetaan created-metodissa

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
        edit_koulutus: {},

        osallistujat_dialog: false,
        oppilas_options: {
            columns: [
                { title: 'Nimi', width: "20%", key: 'nimi' },
                { title: 'Tilaisuus', width: "20%", key: 'tilaisuus' },
                { title: 'Vuosi', width: "10%", key: 'vuosi' },
                { title: 'Email', width: "10%", key: 'email' },
                { title: 'PostiNo', width: "10%", key: 'postino' },
                { title: 'Paikka', width: "10%", key: 'paikka' },
                { title: 'Huom', width: "10%", key: 'huom' },
            ],

            generalFilter: true,
            columnFilters: true,

            onCreated: function(component){
                Bus.on(Bus.UPDATE_GRID, function(data){
                    component.setData(data);
                })
            },
        },
    },
    created(){
        let self=this;
        this.data = Firebase.data;

        Bus.on(Bus.SNACKBAR, function(msg){
            self.snackbar_text = msg;
            self.snackbar = true;
        });

        Bus.on(Bus.EDIT_KOULUTUS, self.edit);
    },
    mounted: function(){
    },  
    computed: {
        level(){
            if(!this.data) return 0;
            return this.data.userLevel();
        }
    },

    methods: {
        oppilaat(){
            return this.data.oppilaat();
        },
        
        addKoulutus(){
            this.edit(new Koulutus());
        },

        sign_out(){
            let self = this;
            firebase.auth().signOut().then(function(){location.reload()});
        },

        add_osallistuja(){
            this.edit_koulutus.osallistujat.push({ id: id++});
        },

        remove_osallistuja(osallistuja){
            this.edit_koulutus.osallistujat = this.edit_koulutus.osallistujat.filter(osall=>{ return osall.id !== osallistuja.id;});
        },


        edit(koulutus){
            let self = this;

            this.edit_dialog=true;
            this.edit_koulutus = new Koulutus(koulutus);
        },

        save(koulutus){
            let self = this;
            this.data.save(koulutus).then(function(){
                self.edit_dialog = false;
            });
        },

        editOsallistujat(koulutus){
            this.osallistujat_dialog=true;
        }


    }
})






