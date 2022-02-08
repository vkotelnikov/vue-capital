import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(accountName, accountData) {

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            alert("Необходимо авторизоваться");
        }

        const uid = user.uid;
        const db = getDatabase();
        const latestData = ref(db, "capital/" + uid + "/latest/" + accountName);
        let dateSnapshot = new Date();
        let tzoffset = dateSnapshot.getTimezoneOffset() * 60000; //offset in milliseconds
        let date = (new Date(dateSnapshot.getTime() - tzoffset)).toISOString().replace(/T.*/,'').split('-').join('-');
        set(latestData, accountData.date === date 
            ? accountData
            : {
                value: accountData.value,
                currency: accountData.currency,
                date: date,
                prevDate: accountData.date,
            }
        );

        // let date = new Date().toISOString().replace(/T.*/,'').split('-').join('-');
        const currentDateData = ref(db, "capital/" + uid + "/" + date + "/" + accountName);
        set(currentDateData, {
            value: accountData.value, 
            currency: accountData.currency,
        });
    });
}