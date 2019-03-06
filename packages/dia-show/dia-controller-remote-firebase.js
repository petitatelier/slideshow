import { LitElement } from "lit-element";

export default class DiaControllerRemoteFirebase extends LitElement {
  constructor(target, roomId="room:main") {
    super();

    // The `live id` to follow when receiving  the slide number from firebase
    this.roomId = roomId;

    this._firebaseConfig = {
			apiKey: "AIzaSyADiO_Dlp79UW1IO6DwX6Gyy3jUD8Z-rHI",
			authDomain: "slideshow-npm-package.firebaseapp.com",
			databaseURL: "https://slideshow-npm-package.firebaseio.com",
			projectId: "slideshow-npm-package",
			storageBucket: "slideshow-npm-package.appspot.com",
			messagingSenderId: "154605865517"
		};
    this.initFirebase(this._firebaseConfig);
    this.initFirebaseAuth();
    this.initFirebaseDB();
  }

	// Initialize Firebase
  initFirebase(config) {
		window.firebase.initializeApp(config);
  }

  // Login in anonymous mode
  initFirebaseAuth(){
		window.firebase.auth().signInAnonymously().catch(function(error) {
			// Handle Errors here.
      // let errorCode = error.code;
      // let errorMessage = error.message;
			// ...
		});
		window.firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				let isAnonymous = user.isAnonymous;
				let uid = user.uid;
        if(isAnonymous) {
          console.warn( "User is anonymous", uid);
        }
			} else {
        console.warn("User is not logged in");
			}
		});
  }

  initFirebaseDB() {
    // Firestore cloud database
    let db = window.firebase.firestore();
		db.collection("live").where("id", "==", this.roomId).onSnapshot( (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        let event = new CustomEvent("slide-selected", {
          detail: {slide: data.slide}, bubbles: true, composed: true
        });
        this.dispatchEvent(event);
      });
		});

  }
}

customElements.define("dia-controller-remote-firebase", DiaControllerRemoteFirebase);
