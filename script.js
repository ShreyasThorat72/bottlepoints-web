// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBH1YR29VHK4pJzcYMpKGgiUDBxH6clccA",
  authDomain: "bottlepoints-60dc8.firebaseapp.com",
  databaseURL: "https://bottlepoints-60dc8-default-rtdb.firebaseio.com",
  projectId: "bottlepoints-60dc8",
  storageBucket: "bottlepoints-60dc8.appspot.com",
  messagingSenderId: "507941735663",
  appId: "1:507941735663:web:ade66e1a5723248741df1a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let confirmationResult;
let activePhone = "";

// 📲 Send OTP
function sendOTP() {
  activePhone = document.getElementById("phoneInput").value.trim();

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "normal"
  });

  auth.signInWithPhoneNumber(activePhone, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent to " + activePhone);
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      alert(error.message);
    });
}

// ✅ Verify OTP
function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();

  confirmationResult.confirm(otp)
    .then((result) => {
      alert("Phone verified!");
      // Store active user in Firebase (without + sign)
      let encodedPhone = activePhone.replace(/\+/g, "");
      db.ref("activeUser").set(encodedPhone);
      document.getElementById("loginStatus").innerText = "Logged in: " + encodedPhone;
      fetchData();
    })
    .catch((error) => {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Try again.");
    });
}

// 🔍 Fetch User Data
function fetchData() {
  db.ref("activeUser").once("value").then(snapshot => {
    if (snapshot.exists()) {
      let encodedPhone = snapshot.val();
      db.ref("users/" + encodedPhone).once("value").then(userSnap => {
        if (userSnap.exists()) {
          let data = userSnap.val();
          document.getElementById("bottleCount").innerText = data.bottleCount || 0;
          document.getElementById("credits").innerText = data.credits || 0;
          document.getElementById("uniqueCode").innerText = data.uniqueCode || "N/A";
        } else {
          alert("No data for this user.");
        }
      });
    } else {
      alert("No active user set.");
    }
  });
}
