// 🔐 Your Firebase Config
  const firebaseConfig = {
  apiKey: "AIzaSyBH1YR29VHK4pJzcYMpKGgiUDBxH6clccA",
  authDomain: "bottlepoints-60dc8.firebaseapp.com",
  databaseURL: "https://bottlepoints-60dc8-default-rtdb.firebaseio.com",
  projectId: "bottlepoints-60dc8",
  storageBucket: "bottlepoints-60dc8.firebasestorage.app",
  messagingSenderId: "507941735663",
  appId: "1:507941735663:web:ade66e1a5723248741df1a"
};
// 🔥 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function getData() {
  let email = document.getElementById("emailInput").value.trim();
  let encodedEmail = email.replace('.', ','); // Firebase key cannot have '.'

  db.ref("users/" + encodedEmail).once("value").then(snapshot => {
    if (snapshot.exists()) {
      let data = snapshot.val();
      document.getElementById("bottleCount").innerText = data.bottleCount || 0;
      document.getElementById("credits").innerText = data.credits || 0;
    } else {
      alert("No data found for this email.");
    }
  });
}