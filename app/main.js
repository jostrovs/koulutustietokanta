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

        data: {signed_in: false,},//Firebase.data, asetetaan created-metodissa

        snackbar: false,
        snackbar_text: "",

        koulutukset: [],
        users: [],

        edit_dialog: false,
        edit_koulutus: new Koulutus(),

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
        })
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






