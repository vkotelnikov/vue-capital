import getDataAtDate from "./getDataAtDate";

export default function(receivedDataCallback) {

    getDataAtDate(new Date, receivedDataCallback);
    
}