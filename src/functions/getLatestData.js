import { getDatabase, ref, onValue} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import getDataAtDate from "./getDataAtDate";

export default function(receivedDataCallback) {

    getDataAtDate(new Date, receivedDataCallback);

    // const auth = getAuth();
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         // User is signed in, see docs for a list of available properties
    //         // https://firebase.google.com/docs/reference/js/firebase.User
    //         const uid = user.uid;

    //         const db = getDatabase();
    //         const latestData = ref(db, "capital/" + uid + "/latest");
    //         onValue(latestData, (snapshot) => {
    //             let result = {};
    //             snapshot.forEach((childSnapshot) => {
    //                 result[childSnapshot.key] = childSnapshot.val();
    //             });
    //             receivedDataCallback(result);
    //         });
    //     } else {
    //         receivedDataCallback({});
    //     }
    // });

    
}