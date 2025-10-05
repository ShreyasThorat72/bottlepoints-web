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
const auth = firebase.auth();

let confirmationResult;
let activePhone = "";

// 📲 Send OTP
function sendOTP() {
  activePhone = document.getElementById("phoneInput").value.trim();
  if (!activePhone.startsWith("+")) activePhone = "+" + activePhone;

  // Setup Recaptcha
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
      activePhone = result.user.phoneNumber.replace(/\+/g, "");
      db.ref("/activeUser").set(activePhone);
      startRealtimeListener(activePhone);
    })
    .catch((error) => {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Try again.");
    });
}

// 🔄 Real-time listener
function startRealtimeListener(phone) {
  const userPath = "users/" + phone;

  db.ref(userPath).on("value", (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("bottleCount").innerText = data.bottleCount || 0;
      document.getElementById("credits").innerText = data.credits || 0;
      document.getElementById("uniqueCode").innerText = data.uniqueCode || "N/A";
    } else {
      document.getElementById("bottleCount").innerText = 0;
      document.getElementById("credits").innerText = 0;
      document.getElementById("uniqueCode").innerText = "N/A";
    }
  });
}

// 🧭 Manual refresh button (optional)
function manualUpdate() {
  if (!activePhone) {
    alert("Please verify phone first!");
    return;
  }
  startRealtimeListener(activePhone);
}
