import { getAuth, onAuthStateChanged } from "firebase/auth";
import currentTime from "./../functions/getCurrentTime";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore";

export default async function(startDate, endDate = new Date()) {

    const user = getAuth().currentUser;

    const uid = user.uid;
    let startDateFormatted = currentTime.getStandardDateString(startDate);
    // console.log("startDateFormatted", startDateFormatted);
        endDate = new Date(endDate);
        endDate.setDate(endDate.getDate() + 1);
    let endDateFormatted = currentTime.getStandardDateString(endDate);
    // console.log("endDateFormatted", endDateFormatted);

    const db = getFirestore();
    const accounts = await getDocs(query(collection(db, "accounts"), where("owner", "==", uid))); 
    
    let result = {};
    result[startDateFormatted] = {};
    for (let acc of accounts.docs) {

        const qPrev = query(collection(db, "snapshots"), 
            where("account", "==", acc.id), 
            where("date", "<", startDate), 
            orderBy("date", "desc"), 
            limit(1));
        const snapshotBeforeStartDate = await getDocs(qPrev); 
        if (!snapshotBeforeStartDate.empty) {
            result[startDateFormatted][acc.data().name] = snapshotBeforeStartDate.docs[0].data();
            result[startDateFormatted][acc.data().name].currency = acc.data().currency;
        }

        const q = query(collection(db, "snapshots"), 
            where("account", "==", acc.id), 
            where("date", ">=", startDate),
            where("date", "<", endDate)
        );

        // console.log(acc.data().name, acc.data());

        const accountsInPeriod = await getDocs(q); 
        for (let accAtDate of accountsInPeriod.docs) {
            // const snap = await getDoc(accAtDate);
            // console.log("dateSnap", accAtDate.data());

            // console.log(accAtDate.data(), accAtDate.data().date);
            if(! result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))]) {
                result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))] = {};
            }
            if (!result[startDateFormatted][acc.data().name]) {
                result[startDateFormatted][acc.data().name] = accAtDate.data();
                result[startDateFormatted][acc.data().name].currency = acc.data().currency;
            }
            
            result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))][acc.data().name] = accAtDate.data();               
            result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))][acc.data().name].currency = acc.data().currency;

        }
    }
    return result;
    
}