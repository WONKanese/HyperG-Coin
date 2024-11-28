import { db, auth } from "./main.js";
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

export async function getCurrentUserData() {
    const user = auth.currentUser;
    const userRef = ref(db, `users/${user.uid}`);
    let userSnapshot = await get(userRef);
    return userSnapshot.val();
} 