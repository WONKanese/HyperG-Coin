// auth.js
import { auth, db} from './main.js';
import { ref, set, update, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { switchPage } from './pages.js';
import { censorText } from './badword-handler.js';
import { gameLoad } from './game.js';

const error_text = document.getElementById("login-error");

// Register a new user
export const register = async (email, password, username) => {
  try {
    let censored = censorText(username);
    if (censored.includes("*")) {
      error_text.textContent = `Error: Inappropriate Username`;
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}`), {
      username: username,
      email: email,
      clicks: 0,
      daily_clicks: 0,
      last_login: Date.now(),
      createdAt: Date.now(),
    });
    await updateProfile(user, { displayName: username});
    switchPage("loading");
    await sendEmailVerification(user);
    console.log("User registered:", userCredential.user);
    switchPage("verify-email");
  } catch (error) {
    error_text.textContent = `Error: ${error.message}`;
  }
};

// Log in an existing user
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;   
    if (user.emailVerified) {  
      //update last login time
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then((userSnapshot) => {
        const userData = userSnapshot.val();
        let pastDate = new Date(userData.last_login);
        let currentDate = new Date(Date.now());
        console.log(userData.last_login);
        let isDifferentDay =
          pastDate.getDate() !== currentDate.getDate() ||
          pastDate.getMonth() !== currentDate.getMonth() ||
          pastDate.getFullYear() !== currentDate.getFullYear();
        if (isDifferentDay) {
          update(userRef, {daily_clicks: 0});
        }
        update(userRef, { last_login: Date.now() });
      });
      

      console.log("User logged in:", userCredential.user);
      switchPage("main-page");
      gameLoad();
    }
    else {
      switchPage("loading");
      await sendEmailVerification(user);
      switchPage("verify-email");
    }
  } catch (error) {
    error_text.textContent = `Error: ${error.message}`;
  }
};


