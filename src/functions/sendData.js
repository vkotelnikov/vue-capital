
import axios from "axios";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(account, value, currency= "rur") {

    
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            const db = getDatabase();
            const latestData = ref(db, "capital/" + uid + "/latest/" + account);
            set(latestData, {
                value,
                currency,
            });

            let date = new Date().toISOString().replace(/T.*/,'').split('-').join('-');
            const currentDateData = ref(db, "capital/" + uid + "/" + date + "/" + account);
            set(currentDateData, {
                value, currency
            });
        } else {
            alert("Необходимо авторизоваться");
        }
    });
}