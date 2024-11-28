// main.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0uzWFOIHLmaiM0iUxuOCZDJ2oi0aAvho",
  authDomain: "hyper-g.firebaseapp.com",
  databaseURL: "https://hyper-g-default-rtdb.firebaseio.com",
  projectId: "hyper-g",
  storageBucket: "hyper-g.firebasestorage.app",
  messagingSenderId: "184619064744",
  appId: "1:184619064744:web:b9a98f962abdc02142d19d",
  measurementId: "G-67YTC0M6J6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

import './auth.js';
import './api.js';
import { register, login} from './auth.js';
import { switchPage, currentPage } from './pages.js';

//load for one second
setTimeout(function() {
  switchPage("login-page");
    
}, 1000);

import { gameLoad } from './game.js';

const sign_up_button = document.getElementById("sign-up");
const log_in_button = document.getElementById("login-submit");

let email_input = document.getElementById("email");
let password_input = document.getElementById("password");
let username_input = document.getElementById("username");

username_input.addEventListener('input', function(event) {
  const value = event.target.value;
  // Allow letters, numbers, and symbols like underscores and hyphens
  const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
  event.target.value = filteredValue;
});

sign_up_button.addEventListener('click', async (event) => {
  event.preventDefault();
  register(email_input.value, password_input.value, username_input.value);
});

log_in_button.addEventListener('click', async (event) => {
  event.preventDefault();
  login(email_input.value, password_input.value);
});

const check_email = document.getElementById("check-email");

check_email.addEventListener("click", async (event) => {
  event.preventDefault();
  onAuthStateChanged(auth, async (user) => {
    console.log("check");
    if (currentPage == "verify-email") {
      if (user) {
        await user.reload();
        console.log(user);
        if (user.emailVerified) {
          switchPage("main-page");
          gameLoad();
        } else {
          console.log("Email is not verified.");
        }
      }
      else {   
        switchPage("login-page")
      }
    }
  })
})
