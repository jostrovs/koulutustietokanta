import Bus from "./bus"
import Classes from "./classes"
import Stubs from "./stubs"

var Osallistuja = Classes.Osallistuja;
var Koulutus = Classes.Koulutus;

let id = 1;

let useStubs = localStorage.useStubs != "false";
if(useStubs == undefined) useStubs = true;
localStorage.useStubs = useStubs;

class Data {

    constructor() {
        this.maxkey = 0;

        this.signed_in = false;
        this.read_only = false;

        this.koulutukset = [];
        this.users = [];

        this.loading = 0;
        this.db = {};

        this.initFirebase();
        this.initFirebaseUi();
    }


    oppilaat() {
        let ret = [];
        for (let i = 0; i < this.koulutukset.length; ++i) {
            let koulutus = this.koulutukset[i];
            if (!koulutus.osallistujat) continue;
            for (let j = 0; j < koulutus.osallistujat.length; ++j) {
                let item = new Osallistuja(koulutus.osallistujat[j]);
                item.tilaisuus = koulutus.title;
                item.tilaisuus_id = koulutus.id;
                ret.push(item);
            }
        }
        return ret;
    }

    sensitize(koulutus) {
        if (this.signed_in) return koulutus;
        return koulutus.sensitize();
    }

    getData() {
        if (useStubs) return this.getDataStub();
        let self = this;

        self.loading++;

        let oppilasLoader = 0;

        this.db.collection("koulutukset").get().then(function(koulutukset) {
                oppilasLoader += koulutukset.size;
                koulutukset.forEach(function(koulutus) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(koulutus.id, " => ", koulutus.data());
                    self.handleMaxkey(koulutus.id);

                    let newKoul = koulutus.data();
                    newKoul.uid = koulutus.id;
                    self.koulutukset.push(self.sensitize(new Koulutus(newKoul)));

                    oppilasLoader--;
                    if (oppilasLoader < 1) {
                        Bus.emit(Bus.UPDATE_GRID, self.oppilaat());
                    }
                });
            })
            .catch(function(error) {
                Bus.snackbar("Koulutusten haku epäonnistui: " + error);
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
            .catch(function(error) {
                Bus.snackbar("Käyttäjien haku epäonnistui: " + error);
            });
        self.loading--;

    }

    save(koulutus) {
        let self = this;

        if (useStubs) return this.saveStub(koulutus);

        return new Promise(function(resolve, reject) {
            let fb = koulutus.toFirebase();

            let uid = koulutus.uid;
            if (!uid) {
                uid = self.newUid(fb);
            }

            self.db.collection("koulutukset").doc(uid).set(fb)
                .then(function(docRef) {
                    self.edit_dialog = false;
                    self.update(koulutus);
                    let oppil = self.oppilaat();
                    Bus.emit(Bus.UPDATE_GRID, oppil);
                    Bus.snackbar("Document succesfully written! (id:" + uid + ")");
                    resolve();
                })
                .catch(function(error) {
                    Bus.snackbar("Error writing document: " + error);
                    reject(error);
                });

        });
    }

    newUid(koulutus) {
        this.maxkey++;
        return this.maxkey.toString();
    }
    handleMaxkey(id) {
        let i = parseInt(id, 10);
        if (i > this.maxkey) {
            this.maxkey = i;
        }
    }

    update(koulutus) {
        // Vaihdetaan sisäisen listan tieto
        for (let i = 0; i < this.koulutukset.length; ++i) {
            if (this.koulutukset[i].uid == koulutus.uid) {
                this.koulutukset.splice(i, 1, koulutus);
                return;
            }
        }

        // Ei löytynyt; lisätään.
        this.koulutukset.push(koulutus);
    }

    initFirebase() {
        // Initialize Firebase
        if (useStubs) return this.initFirebaseStub();

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

    initFirebaseUi() {
        if (useStubs) return this.initFirebaseUiStub();
        let self = this;

        let uiConfig = {
            signInSuccessUrl: '', //'<url-to-redirect-to-on-success>',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
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
            self.getData();

        }, function(error) {
            console.log(error);
        });
    };

    userLevel() {
        if (!this.signed_in) return 0;
        if (this.user.admin) return 2;
        return 1;
    }


    /// Stubit
    getDataStub() {
        this.loading = 0;
        this.koulutukset = [];
        for (let i = 0; i < Stubs.koulutukset.length; ++i) {
            this.koulutukset.push(new Koulutus(Stubs.koulutukset[i]));
        }
        Bus.emit(Bus.UPDATE_GRID, this.oppilaat());

        this.users = [];
        this.users = Stubs.users;
    }

    initFirebaseStub() {
        this.db = {};
    };

    initFirebaseUiStub() {
        this.user = Stubs.users[0];
        this.getData();
        this.signed_in = true;
    };

    saveStub(koulutus) {
        let self = this;

        if(!koulutus.uid){
            let max = 0;
            for(let i=0;i<this.koulutukset.length;++i){
                if(this.koulutukset[i].uid > max) max = this.koulutukset[i].uid;
            }
            koulutus.uid = max+1;
            koulutus.id = max+1;
        }
        
        self.update(koulutus);

        return new Promise(function(resolve, reject) {
            let oppil = self.oppilaat();
            Bus.emit(Bus.UPDATE_GRID, oppil);
            Bus.snackbar("Stub succesful!");

            resolve();
        });
    };
}

var dataClass = new Data();

module.exports = {
    data: dataClass
}