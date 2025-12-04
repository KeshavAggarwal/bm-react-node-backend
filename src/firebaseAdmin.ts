import admin from "firebase-admin";
import serviceAccountConfig from "../firebase-service-account.json";

const serviceAccount = serviceAccountConfig.FIREBASE_SERVICE_ACCOUNT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
