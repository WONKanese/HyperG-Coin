
import { db, auth } from "./main.js";
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { addMe, updateLeaderboard } from "./leaderboard.js";

async function getCounter() {
    const user = auth.currentUser;

    if (!user) {
        console.log("user not authenticated");
        return "Error";
    }
    const counter = ref(db, "/counter");
    const snapshot = await get(counter);
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        await set(counter,0);
        return 0;
    }
}

async function updateClicks(inc) {
    const user = auth.currentUser;
    const userRef = ref(db, `users/${user.uid}`);
    return get(userRef).then((userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData.daily_clicks + inc > 100) {
            return false;
        }
        document.getElementById("yourclickCount").textContent = userData.clicks + inc;
        document.getElementById("yourDailyCount").textContent = userData.daily_clicks + inc;
        update(userRef, {
            clicks: userData.clicks + inc,
            daily_clicks: userData.daily_clicks + inc
        });
        return true;
    }).catch((error) => {
        return false;
    })
}

async function increaseCounter(inc) {
    updateClicks(inc).then((over) => {
        if (!over) {
            console.log("over!");
        }
        else {
            const counter = ref(db, "/counter");
            get(counter).then((snapshot) => {
                let currentCount = snapshot.val();
                set(counter, currentCount + inc);
            });
        }
    })
}


const clickCounter = document.getElementById("clickCount");
let gameLoaded = false;
export function gameLoad() {
    getCounter().then(val => {
        console.log("counter: " + val);
        clickCounter.textContent = val;
    });
    gameLoaded = true;
    const counterRef = ref(db, "/counter");
    onValue(counterRef, (snapshot) => {
        if (gameLoaded) {
            const count = snapshot.val();
            clickCounter.textContent = count;
        }
    });
    const user = auth.currentUser;
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((userSnapshot) => {
        const userData = userSnapshot.val();
        document.getElementById("yourclickCount").textContent = userData.clicks;
        console.log("daily_clicks: " + userData.daily_clicks);
        document.getElementById("yourDailyCount").textContent = userData.daily_clicks;
    });
    updateLeaderboard();
}
setInterval(() => {
    if (gameLoaded) {
        addMe();
        updateLeaderboard();
    }
}, 5000);

const clickButton = document.getElementById("clickButton");

clickButton.addEventListener("click", () => {
    increaseCounter(1);
})