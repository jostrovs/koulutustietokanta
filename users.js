new Vue({
    el: '#app',
    data: {
        snackbar: false,
        snackbar_text: "",

        users: [],

        edit_dialog: false,
        edit_user: {},

        loading: 0,

        // Firebase jutut
        db: {},
        firebaseUi: {},
        
        user: {},
        signed_in: false,
    },
    created(){
        let self = this;

        self.initFirebase();
        self.initFirebaseUi();

        self.loading++;
        this.db.collection("users").get().then(function(users) {
            users.forEach(function(user) {
                // doc.data() is never undefined for query doc snapshots
                console.log(user.id, " => ", user.data());
                let newUser = user.data();
                newUser.uid = user.id;
                self.users.push(newUser);
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

        sign_out(){
            let self = this;
            firebase.auth().signOut().then(function(){location.reload()});
        },

        edit(user){
            this.edit_user = user;
            this.edit_dialog = true;
        },        

        save(user){
            let self=this;
            
            let userRef = this.db.collection("users").doc(user.uid);
            userRef.set({
                nimi: user.nimi,
                admin: user.admin?true:false,
            }, {merge: true})
            .then(function(){
                self.edit_dialog = false;

                self.snackbar_text = "Talletus onnistui.";
                self.snackbar = true;
            })
            .catch(function(error){
                console.log("Käyttäjän talletus epäonnistui: " + error);
                self.snackbar_text = "Käyttäjän talletus epäonnistui: " + error;
                self.snackbar = true;
            });           

        },        
    }
})