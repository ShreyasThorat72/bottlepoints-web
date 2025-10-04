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

const auth = firebase.auth();
const db = firebase.database();

let confirmationResult;
let activeUser = null;

// ================= OTP / Login =================
function sendOTP() {
  const phoneNumber = document.getElementById("phoneInput").value.trim();

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'normal',
      callback: function(response) {
        console.log("✅ reCAPTCHA solved!");
      }
    });
    window.recaptchaVerifier.render();
  }

  auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent to " + phoneNumber);
    })
    .catch((error) => {
      console.error("❌ Error sending OTP:", error);
      alert(error.message);
    });
}

function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();

  if (!confirmationResult) {
    alert("Please request OTP first!");
    return;
  }

  confirmationResult.confirm(otp)
    .then((result) => {
      activeUser = result.user;
      alert("✅ Phone Verified!");
      startFetchingESPData();
    })
    .catch((error) => {
      console.error("❌ OTP Verification failed:", error);
      alert("Wrong OTP. Try again.");
    });
}

// ================= Fetch from ESP32 =================
function startFetchingESPData() {
  if (!activeUser) {
    console.warn("No active user.");
    return;
  }

  setInterval(() => {
    fetch("/getBottleCount")
      .then(res => res.text())
      .then(data => {
        document.getElementById("bottleCount").textContent = data;
        db.ref("users/" + activeUser.uid + "/bottleCount").set(data);
      });

    fetch("/getCredits")
      .then(res => res.text())
      .then(data => {
        document.getElementById("credits").textContent = data;
        db.ref("users/" + activeUser.uid + "/credits").set(data);
      });

    fetch("/getUniqueCode")
      .then(res => res.text())
      .then(data => {
        document.getElementById("uniqueCode").textContent = data;
        db.ref("users/" + activeUser.uid + "/uniqueCode").set(data);
      });
  }, 5000);
}
