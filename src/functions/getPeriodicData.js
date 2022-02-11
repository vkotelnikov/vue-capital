import { getDatabase, ref, onValue, query, startAfter, startAt, endAt, orderByKey} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function(receivedDataCallback, startDate, endDate = new Date()) {

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            alert("Необходимо авторизоваться");
            return location.reload();
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
            // console.log("snap",latestSnapshot);
            // let filteredLatest = {};
            let filteredPrev = {};
            latestSnapshot.forEach(latestAccount => {
                let latestAccountData = latestAccount.val();
                if (latestAccountData.date && ((new Date(latestAccountData.date)) < startDate)) {
                    filteredPrev[latestAccount.key] = latestAccountData;
                    return;
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
                    Object.keys(dateData.val()).forEach(accountName => {
                        if (!result[startDateFormatted][accountName]) {
                            result[startDateFormatted][accountName] = dateData.val()[accountName];
                        }
                        result[dateData.key][accountName] = dateData.val()[accountName];
                    });
                });
                
                receivedDataCallback(result, undefined);
            });
        });
        
    });

    
}