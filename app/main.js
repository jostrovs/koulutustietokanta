var Components = require("vue-components");
var Classes = require("classes");
var Firebase = require("firebase");

var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;


const UPDATE_GRID = "UPDATE_GRID";

var bus = new Vue({
    methods: {
        on: function(event, callback){
            this.$on(event, callback);
        },
        emit: function(event, payload){
            this.$emit(event, payload);
        }
    }
});

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
        edit_koulutus: { osallistujat: []},

        osallistujat_dialog: false,
        oppilas_options: {
            columns: [
                { title: 'Nimi', width: "50%", key: 'nimi' },
                { title: 'Vuosi', width: "10%", key: 'vuosi' },
                { title: 'Email', width: "10%", key: 'email' },
            ],

            generalFilter: true,
            columnFilters: true,

            onCreated: function(component){
                bus.on(UPDATE_GRID, function(data){
                    component.setData(data);
                })
            },
        },
    },
    created(){
    },
    mounted: function(){
    },  
    computed: {
    },

    methods: {
        oppilaat(){
            let ret = [];
            console.log("Koulutuksia: " + this.koulutukset.length)
            for(let koulutus of this.koulutukset){
                if(!koulutus.osallistujat) continue;
                koulutus.osallistujat.map(osallistuja=>ret.push(osallistuja));
            }
            return ret;
        },

        newKey(kouluttaja, tilaisuus, date){
            let suffix=1;
            let key = date + "_" + kouluttaja + "_" + "aihe";
            while(this.keys.indexOf(key + "_" + suffix) >= 0){
                suffix++;
            }

            return key + "_" + suffix;
        },
        

        addKoulutus(){
            
            let key = this.newKey("Esko Hannula", "Peruskurssi", "2018.03.03");
            this.db.collection("koulutukset").doc(key).set({
                kouluttaja: "Esko Hannula",
                tilaisuus: "Peruskurssi",
                date: "2018.03.03",
            }).then(function(){location.reload()});

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

        save(koulutus){
            let self = this;

            if(!koulutus.uid){
                this.db.collection("koulutukset").add({
                    nimi: this.edit_koulutus.nimi,
                    osallistujat: this.edit_koulutus.osallistujat,
                })
                .then(function(docRef){
                    self.edit_dialog=false;
                    self.snackbar_text = "Document written with ID: " + docRef.id;
                    self.snackbar=true;
                })
                .catch(function(error) {
                    self.snackbar_text="Error adding document: "+ error;
                    self.snackbar=true;
                });
            } else {
                this.db.collection("koulutukset").doc(this.edit_koulutus.uid).set({
                    kouluttaja: this.edit_koulutus.kouluttaja,
                    osallistujat: this.edit_koulutus.osallistujat,
                })
                .then(function(){
                    self.edit_dialog=false;
                    self.snackbar_text="Document succesfully written!";
                    self.snackbar=true;
                })
                .catch(function(error) {
                    self.snackbar_text="Error writing document: "+ error;
                    self.snackbar=true;
                });
            }
        },

        edit(koulutus){
            let self = this;

            this.edit_dialog=true;
            this.edit_koulutus = new Koulutus(koulutus);
        },

        editOsallistujat(koulutus){
            this.osallistujat_dialog=true;
        }


    }
})






