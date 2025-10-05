// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔥 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH1YR29VHK4pJzcYMpKGgiUDBxH6clccA",
  authDomain: "bottlepoints-60dc8.firebaseapp.com",
  databaseURL: "https://bottlepoints-60dc8-default-rtdb.firebaseio.com",
  projectId: "bottlepoints-60dc8",
  storageBucket: "bottlepoints-60dc8.appspot.com",
  messagingSenderId: "940048534270",
  appId: "1:940048534270:web:ec4c9176f4034f7e0d4f6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🧩 Setup reCAPTCHA
window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "normal",
  callback: () => console.log("reCAPTCHA solved"),
});

// 📲 Send OTP
document.getElementById("getOtpBtn").addEventListener("click", () => {
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  if (!phoneNumber.startsWith("+91")) {
    alert("Please add +91 before number");
    return;
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      document.getElementById("status").innerText = "✅ OTP sent!";
    })
    .catch((error) => {
      document.getElementById("status").innerText = "❌ Error: " + error.message;
    });
});

// 🔑 Verify OTP
document.getElementById("verifyOtpBtn").addEventListener("click", () => {
  const otp = document.getElementById("otp").value;
  if (!otp) return alert("Enter OTP!");

  window.confirmationResult.confirm(otp)
    .then((result) => {
      const user = result.user;
      const phone = user.phoneNumber.replace("+", ""); // Remove '+'
      document.getElementById("status").innerText = "✅ Login success!";
      document.getElementById("userPhone").innerText = phone;

      // 🟢 Update active user path for ESP32
      set(ref(db, "activeUser"), phone);

      // Create user node if missing
      set(ref(db, "users/" + phone), {
        bottleCount: 0,
        credits: 0,
        uniqueCode: "BP-NEW-USER"
      });

      // Show dashboard
      document.getElementById("dashboard").style.display = "block";

      // Listen for live updates from ESP32
      const userRef = ref(db, "users/" + phone);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          document.getElementById("bottleCount").innerText = data.bottleCount ?? 0;
          document.getElementById("credits").innerText = data.credits ?? 0;
          document.getElementById("uniqueCode").innerText = data.uniqueCode ?? "";
        }
      });
    })
    .catch((error) => {
      document.getElementById("status").innerText = "❌ Invalid OTP: " + error.message;
    });
});
