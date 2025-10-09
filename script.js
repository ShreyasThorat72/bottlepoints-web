// ✅ Your Firebase Config
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

// 🧩 Initialize Recaptcha when page loads
window.onload = function () {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "normal",
    callback: function (response) {
      console.log("reCAPTCHA verified!");
    }
  });
  recaptchaVerifier.render();
};

// 📲 Send OTP
function sendOTP() {
  activePhone = document.getElementById("phoneInput").value.trim();

  if (!activePhone.startsWith("+")) {
    alert("Please include country code (e.g., +91XXXXXXXXXX)");
    return;
  }

  auth.signInWithPhoneNumber(activePhone, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP sent to " + activePhone);
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      alert("Error: " + error.message);
    });
}

// ✅ Verify OTP
function verifyOTP() {
  const otp = document.getElementById("otpInput").value.trim();
  if (!otp) {
    alert("Enter OTP first");
    return;
  }

  confirmationResult.confirm(otp)
    .then((result) => {
      alert("✅ Phone verified successfully!");
      document.getElementById("userData").style.display = "block";

      const encodedPhone = activePhone.replace(/\+/g, "");

      // 🟢 NEW: Set this user as active in Firebase
      db.ref("/activeUser").set(encodedPhone)
        .then(() => console.log("✅ Active user updated in Firebase:", encodedPhone))
        .catch(err => console.error("❌ Error updating activeUser:", err));

      loadUserData(activePhone);
    })
    .catch((error) => {
      console.error("Error verifying OTP:", error);
      alert("❌ Invalid OTP. Try again.");
    });
}

// 🔍 Load user data
function loadUserData(phone) {
  const encodedPhone = phone.replace(/\+/g, "");
  db.ref("users/" + encodedPhone).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        let data = snapshot.val();
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

// 🔄 Manual update button
function manualUpdate() {
  if (!activePhone) {
    alert("Login first!");
    return;
  }

  const encodedPhone = activePhone.replace(/\+/g, "");
  db.ref("users/" + encodedPhone).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        document.getElementById("bottleCount").innerText = data.bottleCount || 0;
        document.getElementById("credits").innerText = data.credits || 0;
        document.getElementById("uniqueCode").innerText = data.uniqueCode || "N/A";
        alert("✅ Data updated successfully!");
      } else {
        alert("No data found in Firebase for this user.");
      }
    })
    .catch(error => {
      console.error("Error during manual update:", error);
    });
}
