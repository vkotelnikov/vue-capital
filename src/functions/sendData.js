import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(account, value, currency= "rur") {

    
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            const db = getDatabase();
            const latestData = ref(db, "capital/" + uid + "/latest/" + account);
            let dateSnapshot = new Date();
            let tzoffset = dateSnapshot.getTimezoneOffset() * 60000; //offset in milliseconds
            let date = (new Date(dateSnapshot.getTime() - tzoffset)).toISOString().replace(/T.*/,'').split('-').join('-');
            set(latestData, {
                value,
                currency,
                date,
            });

            // let date = new Date().toISOString().replace(/T.*/,'').split('-').join('-');
            const currentDateData = ref(db, "capital/" + uid + "/" + date + "/" + account);
            set(currentDateData, {
                value, currency
            });
        } else {
            alert("Необходимо авторизоваться");
        }
    });
}