import { LitElement } from "lit-element";

export default class DiaControllerRemoteFirebase extends LitElement {
  static get properties() {
    return {
      roomId: { type: String, attribute: "room-id" } // RoomId to listen in order to get the correct `head:slide`
    }
  }

  constructor() {
    super();

    // The controller to talk to.
    this.controller = undefined;

    // The `live id` to follow when receiving  the slide number from firebase
    this.roomId = undefined;

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

  // Firestore cloud database
  initFirebaseDB() {
    this._db = window.firebase.firestore();
  }

  updated(changedProperties) {
    if( changedProperties.has('roomId')){
      this._listenRoomHeadSlide(this.roomId);
    }
  }

  _listenRoomHeadSlide(roomId){
    if(roomId == undefined) { return; }
		this._db.collection("live").doc(this.roomId).onSnapshot( (doc) => {
      const data = doc.data();
      // this.controller.remoteHeadUpdated(data["head:slide"])
      this.dispatchEvent( new CustomEvent( "live-head-updated", {
        detail: {liveHead: data["head:slide"]}, bubbles: true, composed: true
      }));
    });
  }

  updateSlideHead(slideId){
    console.log("Firebase > updating the current `head:slide` to", slideId);
    this._db.collection("live").doc(this.roomId).update({"head:slide": slideId})
  }
}

customElements.define("dia-controller-remote-firebase", DiaControllerRemoteFirebase);
