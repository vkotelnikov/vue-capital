import { getDatabase, ref, onValue} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import getLatestData from "./../functions/getLatestData";

function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() == today.getDate() 
        && someDate.getMonth() == today.getMonth()
        && someDate.getFullYear() == today.getFullYear();
}

export default function(date, receivedDataCallback) {

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            alert("Необходимо авторизоваться");
            return location.reload();
        }

        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        let dateFormatted = isToday(date) ? "latest" : date.toISOString().replace(/T.*/,'').split('-').join('-');

        const db = getDatabase();
        const dataAtDate = ref(db, "capital/" + uid + "/" + dateFormatted);
        onValue(dataAtDate, (snapshot) => {
            let result = {};
            snapshot.forEach((childSnapshot) => {
                result[childSnapshot.key] = childSnapshot.val();
            });
            receivedDataCallback(result);
        });
    });
    
}