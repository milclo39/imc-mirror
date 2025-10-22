var config = {
    apiKey: "AIzaSyCt8CYPIoZC16dux9v7ldcqWv4rJvFL8UE",
    authDomain: "imagemate-c.firebaseapp.com",
    databaseURL: "https://imagemate-c.firebaseio.com",
    projectId: "imagemate-c",
    storageBucket: "imagemate-c.appspot.com",
    messagingSenderId: "881589935244"
};
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(user => {
    if (user != null) {
        user.getIdToken().then(function(idToken) {
            AuthUI.data.authed = true;
            AuthUI.data.userId = user.email;
            AuthUI.draw();
        });
    }
});
var AuthUI = {
    init: function() {
        AuthUI.provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().getRedirectResult().then(function(result) {
            if (result.credential) {
                var token = result.credential.accessToken;
            }
            if(result.user) {
                AuthUI.data.authed = true;
                AuthUI.data.userId = result.user.email;
                AuthUI.draw();
            }
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    },
    data: {
        authed: false,
        userId: '',
    },
    draw: function() {
/*
        if (AuthUI.data.authed == true) {
            $(".login").stop(true, true).fadeIn(1000, function() { loadPicker(); });
        } else {
            $('#login').attr('src', './' + useLanguage + '/images/Login.png');
        }
*/
    },
    doAuth: function() {
        if(AuthUI.data.authed == true) {
            firebase.auth().signOut().then(function() {
                AuthUI.data.authed = false;
                AuthUI.data.userId = '';
                AuthUI.draw();
            }, function(error) {
                console.log("fireabse auth signOut :: error :: " + error.code + "::" + error.message);
            });
        } else {
            firebase.auth().signInWithRedirect(AuthUI.provider);
        }
    }
};
AuthUI.init();
document.addEventListener('DOMContentLoaded', function() {
    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
    } catch (e) {
/*
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
*/
    }
});
