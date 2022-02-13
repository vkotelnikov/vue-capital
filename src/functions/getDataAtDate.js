import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

import { getAuth, onAuthStateChanged, connectAuthEmulator } from "firebase/auth";


let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds

function isToday(someDate) {
    const today = new Date(new Date().getTime() + tzoffset);
    return someDate.getDate() == today.getDate() 
        && someDate.getMonth() == today.getMonth()
        && someDate.getFullYear() == today.getFullYear();
}

export default async function(date, receivedDataCallback) {

    const user = getAuth().currentUser;

    const uid = user.uid;
    let dateFormatted = isToday(date) ? "latest" : date.toISOString().replace(/T.*/,'').split('-').join('-');
    const db = getFirestore();

    let result = {};
    const accounts = await getDocs(query(collection(db, "accounts"), where("owner", "==", uid))); 
    if (isToday(date)) {
        for (let acc of accounts.docs) {

            console.log("id", acc.id, acc.data());
            const docRef = doc(db, "snapshots", acc.data().latestSnapshot);
            const snap = await getDoc(docRef);

            console.log("snap", snap.data());

            result[acc.data().name] = snap.data();
            result[acc.data().name].currency = acc.data().currency;
        }

    } else {
        let nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate()+1);
        for (let acc of accounts.docs) {

            console.log("id", acc.id, acc.data());
            console.log("d", date);

            result[acc.data().name] = {currency: acc.data().currency, account: acc.id};
            const q = query(collection(db, "snapshots"), where("account", "==", acc.id), where("date", ">=", date), where("date", "<", nextDay));
            const accountsAtDate = await getDocs(q); 
            // console.log()
            for (let accAtDate of accountsAtDate.docs) {
                // const snap = await getDoc(accAtDate);
                console.log("dateSnap", accAtDate.data());
                   
                result[acc.data().name].value = accAtDate.data().value;
                result[acc.data().name].date = accAtDate.data().date;
                // result[acc.data().name].value = accAtDate.data().value;
            }
        }

    }
    receivedDataCallback(result);
    
}