import { getAuth, onAuthStateChanged } from "firebase/auth";
import currentTime from "./../functions/getCurrentTime";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore";

export default async function(receivedDataCallback, startDate, endDate = new Date()) {

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

        const q = query(collection(db, "snapshots"), 
            where("account", "==", acc.id), 
            where("date", ">=", startDate),
            where("date", "<", endDate)
            // , 
            // orderBy("date", "desc")
        );
        
        console.log(acc.data().name, acc.data());
        if (!result[startDateFormatted]) {
            result[startDateFormatted] = {};
            // result[startDateFormatted] = dateData.val()[accountName];
        }

        const accountsInPeriod = await getDocs(q); 
        for (let accAtDate of accountsInPeriod.docs) {
            // const snap = await getDoc(accAtDate);
            // console.log("dateSnap", accAtDate.data());

            console.log(accAtDate.data(), accAtDate.data().date);
            if(! result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))]) {
                result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))] = {};
            }
            if (!result[startDateFormatted][acc.data().name]) {
                result[startDateFormatted][acc.data().name] = accAtDate.data();
            }
            
            result[currentTime.getStandardDateString(new Date(accAtDate.data().date.seconds * 1000))][acc.data().name] = accAtDate.data();               

        }
    }
    receivedDataCallback(result, undefined);

    // onValue(latestDataAccounts, (latestSnapshot) => {
    //     // let accountNames = [];
    //     // console.log("snap",latestSnapshot);
    //     // let filteredLatest = {};
    //     let filteredPrev = {};
    //     latestSnapshot.forEach(latestAccount => {
    //         let latestAccountData = latestAccount.val();
    //         if (latestAccountData.date && ((new Date(latestAccountData.date)) < startDate)) {
    //             filteredPrev[latestAccount.key] = latestAccountData;
    //             return;
    //         }
    //     });
        
    //     const periodicData = query(ref(db, "capital/" + uid), startAt(startDateFormatted), endAt(endDateFormatted), orderByKey());

    //     let firstDate = true;

    //     // console.log("step1", filteredPrev);
    //     onValue(periodicData, (accountsAtDate) => {

    //         let result = {};
    //         // console.log(filteredLatest);
    //         result[startDateFormatted] = {};
    //         if (firstDate) {
    //             result[startDateFormatted] = filteredPrev;
    //             firstDate = false;
    //         }
    //         accountsAtDate.forEach((dateData) => {
    //             if (!dateData.val()) {
    //                 return console.log("No data found at " + dateData.key);
    //             }

    //             // console.log("val",dateData.key,dateData.val());
    //             if(! result[dateData.key]) {
    //                 result[dateData.key] = {};
    //             }
    //             Object.keys(dateData.val()).forEach(accountName => {
    //                 if (!result[startDateFormatted][accountName]) {
    //                     result[startDateFormatted][accountName] = dateData.val()[accountName];
    //                 }
    //                 result[dateData.key][accountName] = dateData.val()[accountName];
    //             });
    //         });
            
    //         receivedDataCallback(result, undefined);
    //     });
    // });

    
}