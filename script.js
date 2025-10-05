// ================= Firebase Config =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
