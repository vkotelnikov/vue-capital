import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import axios from "axios";

export default function (date = new Date(), receivedDataCallback) {

    // console.log(date);
    let tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let formatDate = (new Date(date.getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');
    // let formatDate = date.toISOString().replace(/T.*/, '').split('-').join('-');
    // const auth = getAuth();
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
                let requestFormatDate = formatDate.replaceAll("-", "/");
                let url = "https://www.cbr-xml-daily.ru/archive/" + requestFormatDate + "/daily_json.js";
                return axios({
                    method: "get",
                    url: url,
                }).then(response => {
                    const newData = ref(db, "prices/" + formatDate);
                    set(newData, response.data.Valute);
                    // console.log("curr", response);
                    return response.data.Valute;
                });
            }
        });
    });
}