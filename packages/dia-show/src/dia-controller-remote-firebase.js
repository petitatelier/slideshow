import { LitElement, html } from "lit-element";
import { CommonStyles } from "@petitatelier/dia-styles";

export default class DiaControllerRemoteFirebase extends LitElement {
  static get styles() {
    return [ CommonStyles ];
  }

  static get properties() {
    return {
      roomId:   { type: String, attribute: "room-id" }, // RoomId to listen in order to get the correct `head:slide`
      photoURL: { type: String },
      head:     { type: Object}
    }
  }

  render() {
    return html`
			<style>
      :host { display: inline-flex; }
      :host > * {
        margin-right: 5px;
        height: 2em;
      }
      img {
        vertical-align: middle;
      }
      button[hidden] {
        display: none;
      }
			</style>
			<img class="small-user-profile" src="${this.photoURL}"></img>
      <button id="login">LogIn</button>
      <button id="logout" hidden>Logout</button>
    `
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

    // The connected user
    this._user = undefined;

    this.initFirebase(this._firebaseConfig);
    this.initFirebaseAuth();
    this.initFirebaseDB();
  }

	// Initialize Firebase
  initFirebase(config) {
		window.firebase.initializeApp(config);
  }

  // Listen to login state changes
  initFirebaseAuth(){
    window.firebase.auth().onAuthStateChanged((user) => {
			if (user) {
			} else {
        console.warn("User is not logged in");
        this._firebaseLoginAnonymously();
			}
      this._displayLoginButton(user && user.isAnonymous);
      this._updateUser(user);
      this.updateAudienceStats(this.head);
		});
  }

  _firebaseLoginAnonymously(){
    window.firebase.auth().signInAnonymously().catch((error) => {
		});
  }

  _firebaseLoginGoogle() {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    window.firebase.auth().signInWithPopup(provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
    }).catch(function(error) {
      throw error;
    });
  }

  _firebaseLogoutGooge() {
		window.firebase.auth().signOut().then(function() {
			// Sign-out successful.
      this._updateUser(undefined);
		}).catch(function(error) {
			// An error happened.
		});
  }

  _updateUser(googleUser) {
    this._user = googleUser;
    this.photoURL = "https://petit-atelier.ch/images/petit-atelier-logo.svg"
    if(googleUser && googleUser.photoURL){
      this.photoURL = googleUser.photoURL;
    }
  }

  _displayLoginButton(b) {
    if(b) {
      this.shadowRoot.querySelector("button[id='logout']").setAttribute("hidden", "");
      this.shadowRoot.querySelector("button[id='login']").removeAttribute("hidden");
    } else {
      this.shadowRoot.querySelector("button[id='login']").setAttribute("hidden", "");
      this.shadowRoot.querySelector("button[id='logout']").removeAttribute("hidden");
    }
  }

  // Firestore cloud database
  initFirebaseDB() {
    this._db = window.firebase.firestore();
  }

  firstUpdated(){
    const buttonLogin = this.shadowRoot.querySelector("button[id='login']");
    buttonLogin.addEventListener("click", () => { this._firebaseLoginGoogle(); });
    const buttonLogout = this.shadowRoot.querySelector("button[id='logout']");
    buttonLogout.addEventListener("click", () => { this._firebaseLogoutGooge(); });
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
      console.log("Firebase > Recvd new head", doc.data());
      this.dispatchEvent( new CustomEvent( "live-head-updated", {
        detail: {liveHead: {slide: data["head:slide"], display: data["head:display"]} }, bubbles: true, composed: true
      }));
    });
  }

  updateLiveHead(head){
    if( head == undefined) { return; }
    console.log("Firebase > updating the current `head` to", head);
    this._db.collection("live").doc(this.roomId).update({"head:slide": head.slide, "head:display": head.display})
  }

  updateAudienceStats(head){
    if(head) { this.head = head; } // register the user current head in case he logs in
    if(this._user == undefined || this._user.uid == undefined || head == undefined){ return; }
    console.log("Update user audience head", head);
    const docId = this._user.isAnonymous ? "A_"+this._user.uid : this._user.email;
    this._db.collection("audience").doc(docId).set({
      "head:slide": head.slide,
      "head:display": head.display,
      displayName: this._user.displayName,
      isAnonymous: this._user.isAnonymous
    });
  }
}

customElements.define("dia-controller-remote-firebase", DiaControllerRemoteFirebase);
