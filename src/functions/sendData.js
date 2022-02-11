import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() == today.getDate() 
        && someDate.getMonth() == today.getMonth()
        && someDate.getFullYear() == today.getFullYear();
}

export default function(data) {

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            alert("Необходимо авторизоваться");
            return location.reload();
        }
        const uid = user.uid;
        const db = getDatabase();

        let dateSnapshot = new Date(data.dateOfCapital);
        if (isToday(dateSnapshot)) {
            const latestData = ref(db, "capital/" + uid + "/latest/" + data.accountName);
            set(latestData, {
                    value: data.value,
                    currency: data.currency,
                    date: data.dateOfCapital,
                }
            );
        }

        // let date = new Date().toISOString().replace(/T.*/,'').split('-').join('-');
        const currentDateData = ref(db, "capital/" + uid + "/" + data.dateOfCapital + "/" + data.accountName);
        set(currentDateData, {
            value: data.value, 
            currency: data.currency,
        });
    });
}