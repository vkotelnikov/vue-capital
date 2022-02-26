import { getFirestore, collection, query, where, getDocs, getDocsFromCache, doc, getDoc, getDocFromCache, orderBy, limit, onSnapshot } from "firebase/firestore";

import { getAuth } from "firebase/auth";

function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() == today.getDate() 
        && someDate.getMonth() == today.getMonth()
        && someDate.getFullYear() == today.getFullYear();
}

export default async function(date) {
    const user = getAuth().currentUser;

    const uid = user.uid;
    const db = getFirestore();

    let result = {};
    const accounts = await getDocs(query(collection(db, "accounts"), where("owner", "==", uid))); 
    // console.log(isToday(date), date);
    if (isToday(date)) {
        for (let acc of accounts.docs) {

            // console.log("id", acc.id, acc.data());
            let snap;
            try {
                snap = await getDocFromCache(doc(db, "snapshots", acc.data().latestSnapshot));
            } catch (ex) {
                console.log("getting data from server");
                snap = await getDoc(doc(db, "snapshots", acc.data().latestSnapshot));
            }
            // const snap =docRef);

            // console.log("snap", snap.data());

            result[acc.data().name] = snap.data();
            result[acc.data().name].currency = acc.data().currency;
        }

    } else {
        let nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        for (let acc of accounts.docs) {

            // console.log("id", acc.id, acc.data());
            // console.log("d", date);

            result[acc.data().name] = {
                currency: acc.data().currency, 
                account: acc.id
            };
            const q = query(collection(db, "snapshots"), 
                where("account", "==", acc.id), 
                where("date", "<", nextDay), 
                orderBy("date", "desc"), 
                limit(1));
        
            
            let accountsAtDate;
            try {
                accountsAtDate = await getDocsFromCache(q);
            } catch(ex) {
                console.log("getting data from server");
                accountsAtDate = await getDocs(q);
            }
            // console.log()
            for (let accAtDate of accountsAtDate.docs) {
                // const snap = await getDoc(accAtDate);
                // console.log("dateSnap", accAtDate.data());
                   
                result[acc.data().name].value = accAtDate.data().value;
                result[acc.data().name].date = accAtDate.data().date;
                // result[acc.data().name].value = accAtDate.data().value;
            }
        }

    }

    return result;
    
}