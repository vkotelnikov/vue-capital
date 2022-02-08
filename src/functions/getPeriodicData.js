import { getDatabase, ref, onValue, query, startAfter, startAt, endAt, orderByKey} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(receivedDataCallback, startDate, endDate = new Date()) {

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            receivedDataCallback({});
        }

        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        let startDateFormatted = startDate.toISOString().replace(/T.*/,'').split('-').join('-');
        console.log("startDateFormatted", startDateFormatted);
        let endDateFormatted = endDate.toISOString().replace(/T.*/,'').split('-').join('-');
        console.log("endDateFormatted", endDateFormatted);

        const db = getDatabase();
        const latestDataAccounts = ref(db, "capital/" + uid + "/latest");
        onValue(latestDataAccounts, (latestSnapshot) => {
            // let accountNames = [];
            console.log("snap",latestSnapshot);
            // let filteredLatest = {};
            let filteredPrev = {};
            latestSnapshot.forEach(latestAccount => {
                let latestAccountData = latestAccount.val();
                if (latestAccountData.date && ((new Date(latestAccountData.date)) < startDate)) {
                    filteredPrev[latestAccount.key] = latestAccountData;
                    return;
                }
                if ((latestAccountData.date && (new Date(latestAccountData.date) < endDate)) && !latestAccountData.prevDate) {
                    filteredPrev[latestAccount.key] = {currency: "rur", value: 0};
                    return;
                }
                if ((latestAccountData.date && (new Date(latestAccountData.date) > startDate))
                    && (latestAccountData.prevDate && (new Date(latestAccountData.prevDate) < startDate))) {
                    const prevData = ref(db, "capital/" + uid + "/" + latestAccountData.prevDate + "/" + latestAccount.key);
                    onValue(prevData, (prevSnapshot) => {
                        console.log("add filteredprev",latestAccount.key, prevSnapshot.val());
                        filteredPrev[latestAccount.key] = prevSnapshot.val();
                    });
                }
            });
            
            const periodicData = query(ref(db, "capital/" + uid), startAt(startDateFormatted), endAt(endDateFormatted), orderByKey());

            let firstDate = true;

            // console.log("step1", filteredPrev);
            onValue(periodicData, (accountsAtDate) => {
                let result = {};
                // console.log(filteredLatest);
                result[startDateFormatted] = {};
                if (firstDate) {
                    result[startDateFormatted] = filteredPrev;
                    firstDate = false;
                }
                accountsAtDate.forEach((dateData) => {
                    if (!dateData.val()) {
                        return console.log("No data found at " + dateData.key);
                    }

                    // console.log("val",dateData.key,dateData.val());
                    if(! result[dateData.key]) {
                        result[dateData.key] = {};
                    }
                    Object.keys(dateData.val()).forEach(key => {
                        result[dateData.key][key] = dateData.val()[key];
                    });
                });
                
                receivedDataCallback(result, undefined);
            });
        });
        
    });

    
}