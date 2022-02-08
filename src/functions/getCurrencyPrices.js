import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import axios from "axios";

function getPriceFromArchive(date, trialsLeft = 5, originalRequestDateString) {
    console.log("plan b");
    if (trialsLeft < 1) {
        return;
    }
    let tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let requestFormatDate = (new Date(new Date(date).getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('/');

    let url = "https://www.cbr-xml-daily.ru/archive/" + requestFormatDate + "/daily_json.js";
    return axios({
        method: "get",
        url: url,
    }).then(response => {
        const db = getDatabase();
        const newData = ref(db, "prices/" + originalRequestDateString);
        set(newData, response.data.Valute);
        // console.log("curr", response);
        return response.data.Valute;
    }).catch(ex => {
        console.log(ex);
        date.setDate(date.getDate() - 1);
        getPriceFromArchive(date, trialsLeft - 1, originalRequestDateString);
    });
}

export default function (date = new Date(), receivedDataCallback, trialsLeft = 5) {

    // console.log(date);
    let tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let formatDate = (new Date(date.getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');

    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            alert("Необходимо авторизоваться");
        }
        console.log("start get prices");
        const uid = user.uid;
        const db = getDatabase();
        const latestData = ref(db, "prices/" + formatDate);
        onValue(latestData, (snapshot) => {
            let result = {};
            // console.log("getcurrsnap", latestData);
            if (snapshot.val()) {
                snapshot.forEach((childSnapshot) => {
                    // console.log(childSnapshot.key);
                    result[childSnapshot.key] = childSnapshot.val();
                    // console.log(childSnapshot.val());
                });
                receivedDataCallback(result);
            } else {
                console.log("plan b");
                getPriceFromArchive(date, trialsLeft, formatDate);
            }
        });
    });
}