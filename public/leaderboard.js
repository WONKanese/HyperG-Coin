import { db, auth } from "./main.js";
import { ref, get, set, update, onValue, orderByChild, push} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUserData } from "./util.js";

export async function updateLeaderboard() {
    console.log("Updating Leaderboard...");
    const lbElement = document.getElementById("lb");
    const lbRef = ref(db, "lb");
    try {
        let snapshot = await get(lbRef);
        lbElement.innerHTML = "";

        let usersArray = [];
        snapshot.forEach(childSnapshot => {
            const thisUserData = childSnapshot.val();
            usersArray.push({
                username: thisUserData.username,
                clicks: thisUserData.clicks
            });
        });

        usersArray.sort((a, b) => b.clicks - a.clicks);

        usersArray.forEach((user, index) => {
            const newListItem = document.createElement("li");

            newListItem.textContent = `#${index + 1} ${user.username} - ${user.clicks}`;
            lbElement.appendChild(newListItem);
        })
    } catch (error) {
        console.error("Error fetching data from 'lb':", error);
    }
}

export async function addMe() {
    const lbRef = ref(db, "lb");
    const userData = await getCurrentUserData();
    const snapshot = await get(lbRef);
    if (snapshot.exists()) {
        let users = [];

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            users.push({
                id: childSnapshot.key,
                username: data.username,
                clicks: data.clicks
            });
        });
        let minClicks = 999999999;
        // Check if the user exists and update clicks if so
        let userExists = false;
        for (let user of users) {
            if (userData.clicks < minClicks) {
                minClicks = user.clicks;
            }
            if (user.username === userData.username) {
                // Update the user's clicks
                const userRef = ref(db, `lb/${user.id}`);
                await update(userRef, {
                    clicks: userData.clicks // Increment the user's clicks
                });
                console.log("User's clicks updated.");
                userExists = true;
                break; // Exit the loop after updating the user
            }
        }
        if (!userExists) {
            console.log("trying to add new user");
            users.sort((a, b) => b.clicks - a.clicks);

            if (userData > minClicks || users.length < 10) {
                const newUserRef = push(lbRef);  // Generate a new unique ID for the user
                await set(newUserRef, {
                    username: userData.username,
                    clicks: userData.clicks
                });
                console.log("New user added.");

                // Add the new user to the array
                users.push({
                    id: newUserRef.key,
                    username: userData.username,
                    clicks: userData.clicks
                });

                // If there are more than 10 users now, remove the one with the least clicks
                if (users.length > 10) {
                    // Remove the user with the lowest clicks (last item after sorting)
                    const userToRemove = users.pop();
                    const userRefToRemove = ref(db, `lb/${userToRemove.id}`);
                    await remove(userRefToRemove);
                    console.log(`Removed user with ID ${userToRemove.id} (clicks: ${userToRemove.clicks}).`);
                }
            }
        }
    } else {
        let newUserRef = push(lbRef);
        console.log(userData);
        console.log(userData.username);

        await set(newUserRef, { username: userData.username, clicks: userData.clicks});
        console.log("lb node new user added");
    }
}
