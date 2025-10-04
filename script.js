// 🔐 Firebase Configuration
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

  if (!activePhone.startsWith("+")) {
    alert("Please include country code. Example: +91XXXXXXXXXX");
    return;
  }

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
      alert("✅ Phone verified!");
      let encodedPhone = activePhone.replace(/\+/g, "");

      // Save active user in Firebase
      db.ref("activeUser").set(encodedPhone)
        .then(() => {
          document.getElementById("loginStatus").innerText = "Logged in: " + encodedPhone;
          fetchData();
        });
    })
    .catch((error) => {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP. Try again.");
    });
}

// 🔍 Manual Data Fetch
function fetchData() {
  if (!activePhone) {
    alert("Please login first!");
    return;
  }

  const encodedPhone = activePhone.replace(/\+/g, "");
  const userPath = "users/" + encodedPhone;

  db.ref(userPath).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById("bottleCount").innerText = data.bottleCount || 0;
        document.getElementById("credits").innerText = data.credits || 0;
        document.getElementById("uniqueCode").innerText = data.uniqueCode || "N/A";
      } else {
        alert("No data found for this user.");
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
}
