var Classes = require("classes");
var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;


class Data {
    
    constructor(){
        this.signed_in = false;
        
        this.koulutukset = [];
        this.users = [];

        this.loading=0;
        this.db = {};

        this.initFirebase();
        this.initFirebaseUi();

        this.keys = [];

    }

    getData(){
        let self = this;

        self.loading++;

        let oppilasLoader = 0;

        this.db.collection("koulutukset").get().then(function(koulutukset) {
            oppilasLoader += koulutukset.size;
            koulutukset.forEach(function(koulutus) {
                // doc.data() is never undefined for query doc snapshots
                console.log(koulutus.id, " => ", koulutus.data());

                self.keys.push(koulutus.id);
                let newKoul = koulutus.data();
                newKoul.uid = koulutus.id;
                self.koulutukset.push(new Koulutus(newKoul));

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
        
    }

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
    };
    
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

                self.getData();
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
    };
    
}

var dataClass=new Data();

module.exports = {
    data: dataClass
}