function getCurrentTime() {
    let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    return new Date(new Date().getTime() - tzoffset);
}

function getTimeFromString(dateString) {
    let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    return new Date(new Date(dateString).getTime() + tzoffset);
}

function getTimeFromDate(date) {
    let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    return new Date(date.getTime());
}

function getStandardDateString(date = new Date()) {
    let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    return new Date(new Date(date).getTime() - tzoffset).toISOString().replace(/T.*/, '').split('-').join('-');
}

export default {getCurrentTime, getTimeFromString, getTimeFromDate, getStandardDateString};