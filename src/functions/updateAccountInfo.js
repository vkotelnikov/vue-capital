import { getFirestore, doc, updateDoc} from "firebase/firestore"; 
import { getAuth } from "firebase/auth";


export default async function(id, data) {

    const auth = getAuth();
    const user = auth.currentUser;

    const uid = user.uid;
    
    if (!id) {
        return;
    } 
    const db = getFirestore();
    
    console.log("updating", id, data);
    const accountRef = doc(db, "accounts", id);
    await updateDoc(accountRef, data);
}