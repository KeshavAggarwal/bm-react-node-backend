import admin from "firebase-admin";

const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJSON) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env variable is missing");
}

const serviceAccount = JSON.parse(serviceAccountJSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
