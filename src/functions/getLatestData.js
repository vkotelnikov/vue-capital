import { getDatabase, ref, onValue} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(receivedDataCallback) {

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const uid = user.uid;
            let date = new Date().toISOString().replace(/T.*/,'').split('-').join('-');

            const db = getDatabase();
            const latestData = ref(db, "capital/" + uid + "/latest");
            onValue(latestData, (snapshot) => {
                let result = {};
                snapshot.forEach((childSnapshot) => {
                    console.log(childSnapshot.key);
                    result[childSnapshot.key] = childSnapshot.val();
                    console.log(childSnapshot.val());
                });
                receivedDataCallback(result);
            });
        } else {
            receivedDataCallback({});
        }
    });

    
}