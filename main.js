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
        id: 1,
        
        tabs: null,

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

        loading: 0,

        oppilasLoader: 0,

        // Firebase jutut
        db: {},
        firebaseUi: {},
        
        user: {},
        signed_in: false,

        keys: [],
    },
    created(){
        let self = this;

        self.initFirebase();
        self.initFirebaseUi();

        self.loading++;

        let oppilasLoader = 0;

        this.db.collection("koulutukset").get().then(function(koulutukset) {
            oppilasLoader += koulutukset.size;
            koulutukset.forEach(function(koulutus) {
                // doc.data() is never undefined for query doc snapshots
                console.log(koulutus.id, " => ", koulutus.data());

                self.keys.push(koulutus.id);
                let newKoulutus = koulutus.data();
                if(newKoulutus.osallistujat) newKoulutus.osallistujat.map(osall=>{
                    osall.id=self.id++;
                });
                self.koulutukset.push(newKoulutus);

                oppilasLoader--;
                if(oppilasLoader < 1){
                    bus.emit(UPDATE_GRID, self.oppilaat());
                }
            });
        })
        .catch(function(error){
            console.log("Koulutusten haku epäonnistui: " + error);
            self.snackbar_text = "Koulutusten haku epäonnistui: " + error;
            self.snackbar = true;
        });           
        self.loading--;

        self.loading++;
        this.db.collection("users").get().then(function(users) {
            users.forEach(function(user) {
                // doc.data() is never undefined for query doc snapshots
                console.log(user.id, " => ", user.data());
                self.users.push(user.data());
            });
        })
        .catch(function(error){
            console.log("Käyttäjien haku epäonnistui: " + error);
            self.snackbar_text = "Käyttäjien haku epäonnistui: " + error;
            self.snackbar = true;
        });           
    self.loading--;
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
        
        initFirebase(){
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
        },

        initFirebaseUi(){
            let self = this;

            let uiConfig = {
                signInSuccessUrl: '', //'<url-to-redirect-to-on-success>',
                signInOptions: [
                    // Leave the lines as is for the providers you want to offer your users.
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                ],
                // Terms of service url.
                tosUrl: '<your-tos-url>'
            };
          
            this.firebaseUi = new firebaseui.auth.AuthUI(firebase.auth());
        
            // The start method will wait until the DOM is loaded.
            this.firebaseUi.start('#firebaseui-auth-container', uiConfig);  
            
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    
                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var uid = user.uid;
                    var phoneNumber = user.phoneNumber;
                    var providerData = user.providerData;
                    user.getIdToken().then(function(accessToken) {
                        self.user = user;
                        self.signed_in = true;
                        
                        // document.getElementById('sign-in-status').textContent = 'Signed in';
                        // document.getElementById('sign-in').textContent = 'Sign out';
                    });
                } else {
                    // User is signed out.
                    self.signed_in = false;
                    self.user = {};
                    // document.getElementById('sign-in-status').textContent = 'Signed out';
                    // document.getElementById('sign-in').textContent = 'Sign in';
                    // document.getElementById('account-details').textContent = 'null';
                }
            }, function(error) {
                console.log(error);
            });
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
            this.edit_koulutus.osallistujat.push({ id: this.id++});
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
                    nimi: this.edit_koulutus.nimi,
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
            this.edit_koulutus.nimi = koulutus.nimi;
            this.edit_koulutus.puh = koulutus.puh;
            this.edit_koulutus.paikkakunta = koulutus.paikkakunta;
            this.edit_koulutus.osallistujat = koulutus.osallistujat;
        },

        editOsallistujat(koulutus){
            this.osallistujat_dialog=true;
        }


    }
})