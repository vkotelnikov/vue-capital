import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, orderBy, limit } from "firebase/firestore";

import axios from "axios";

async function getPriceFromArchive(date, trialsLeft = 5, originalRequestDateString) {
    if (trialsLeft < 1) {
        return;
    }
    let tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let requestFormatDate = (new Date(new Date(date).getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('/');

    let url = "https://www.cbr-xml-daily.ru/archive/" + requestFormatDate + "/daily_json.js";
    try {
        const response = await axios({
            method: "get",
            url: url,
        });
        const db = getFirestore();
        const latestData = doc(db, "prices", originalRequestDateString);
        await setDoc(latestData, response.data.Valute);
        return response.data.Valute;
    } catch (ex) {
        console.log(ex);
        date.setDate(date.getDate() - 1);
        await getPriceFromArchive(date, trialsLeft - 1, originalRequestDateString);
    };
}

export default async function (date = new Date(), trialsLeft = 5) {

    // console.log(date);
    let tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let formatDate = (new Date(date.getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');
    
    const db = getFirestore();
    const latestData = await getDoc(doc(db, "prices", formatDate));
    
    if (latestData.exists()) {
        return latestData.data();
    } else {
        console.log("plan b");
        return await getPriceFromArchive(date, trialsLeft, formatDate);
    }
}