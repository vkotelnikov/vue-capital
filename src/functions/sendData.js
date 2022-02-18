import { getFirestore, collection, query, where, addDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
// @ts-ignore
import currentTime from "./../functions/getCurrentTime";
// @ts-ignore
import getCurrencyPrices from "./../functions/getCurrencyPrices";


function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() == today.getDate() 
        && someDate.getMonth() == today.getMonth()
        && someDate.getFullYear() == today.getFullYear();
}

export default async function(data) {

    const auth = getAuth();
    const user = auth.currentUser;

    const uid = user.uid;
    const db = getFirestore();

    let inputDateSnapshot = currentTime.getTimeFromString(data.dateOfCapital);
    // const docRef = doc(db, "accounts", data.accountId);
    // getDoc(docRef).then(account => {
    if (data.currency !== "RUR") {
        getCurrencyPrices(inputDateSnapshot);
    }
    if (!data.accountId) {
        const newAccRef = await addDoc(collection(db, "accounts"), {
            name: data.accountName,
            currency: data.currency,
            owner: uid,
        });

        const docRef = await addDoc(collection(db, "snapshots"), {
            value: data.value,
            date: inputDateSnapshot,
            account: newAccRef.id,
        });

        await updateDoc(newAccRef, {
            latestSnapshot: docRef.id,
        });
        console.log("Latest snapshot written with ID: ", docRef.id);
    } else {
        const accRef = doc(db, "accounts", data.accountId);
        if (isToday(inputDateSnapshot)) {

            const account = await getDoc(accRef);

            const snapRef = doc(db, "snapshots", account.data().latestSnapshot);

            const snap = await getDoc(snapRef);
            if (snap.exists() && isToday(new Date(snap.data().date.seconds * 1000))) {
                updateDoc(snapRef, {
                    value: data.value,
                });
            } else {
                const docRef = await addDoc(collection(db, "snapshots"), {
                    value: data.value,
                    account: data.accountId,
                    date: inputDateSnapshot,
                });
                updateDoc(accRef, {
                    latestSnapshot: docRef.id,
                });
            }
        } else {

            let nextDay = new Date(inputDateSnapshot);
            nextDay.setDate(nextDay.getDate() + 1);
            const q = query(collection(db, "snapshots"), 
                where("account", "==", data.accountId), 
                where("date", ">=", inputDateSnapshot), 
                where("date", "<", nextDay));

            const accountsAtDate = await getDocs(q);
            if (accountsAtDate.empty) {
                const newSnapRef = await addDoc(collection(db, "snapshots"), {
                    value: data.value,
                    account: data.accountId,
                    date: inputDateSnapshot,
                });
                const account = await getDoc(accRef);
    
                const latestSnapshot = await getDoc(doc(db, "snapshots", account.data().latestSnapshot));
                if(inputDateSnapshot > new Date(latestSnapshot.data().date.seconds * 1000)) {
                    updateDoc(accRef, {
                        latestSnapshot: newSnapRef.id,
                    });
                }
            } else {
                await updateDoc(accountsAtDate.docs[0].ref, {
                    value: data.value,
                });
            }
        }
    }
}