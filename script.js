// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBH1YR29VHK4pJzcYMpKGgiUDBxH6clccA",
  authDomain: "bottlepoints-60dc8.firebaseapp.com",
  databaseURL: "https://bottlepoints-60dc8-default-rtdb.firebaseio.com",
  projectId: "bottlepoints-60dc8",
  storageBucket: "bottlepoints-60dc8.firebasestorage.app",
  messagingSenderId: "507941735663",
  appId: "1:507941735663:web:ade66e1a5723248741df1a"
};

// 🚀 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let confirmationResult;
let activePhone = "";

// ✅ Send OTP
function sendOTP() {
  activePhone = document.getElementById("phoneInput").value.trim();
  if (!activePhone.startsWith("+")) activePhone = "+" + activePhone;

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", { size: "normal" });

  auth.signInWithPhoneNumber(activePhone, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent to " + activePhone);
    })
    .catch((error) => {
      console.error(error);
      alert("Error: " + error.message);
    });
}

// ✅ Verify OTP
function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();
  confirmationResult.confirm(otp)
    .then((result) => {
      alert("Phone verified!");
      activePhone = result.user.phoneNumber.replace("+", "");
      
      // ✅ Set active user for ESP32
      db.ref("/activeUser").set(activePhone);
      
      // Start listening for updates
      listenToUserData(activePhone);
      
      document.getElementById("status").innerText = "Connected: " + activePhone;
      document.getElementById("status").style.color = "green";
    })
    .catch((error) => {
      alert("Invalid OTP: " + error.message);
    });
}

// 🔄 Listen to user’s live data
function listenToUserData(phone) {
  const path = "users/" + phone;
  db.ref(path).on("value", (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("bottleCount").innerText = data.bottleCount ?? 0;
      document.getElementById("credits").innerText = data.credits ?? 0;
      document.getElementById("uniqueCode").innerText = data.uniqueCode ?? "N/A";
    }
  });
}

// 🔁 Manual Refresh
function manualUpdate() {
  if (!activePhone) {
    alert("Please verify phone first!");
    return;
  }
  listenToUserData(activePhone);
}
