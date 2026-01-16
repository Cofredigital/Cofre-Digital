import admin from "firebase-admin";

if (!admin.apps.length) {
  const credentialsPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;

  if (!credentialsPath) {
    throw new Error(
      "FIREBASE_ADMIN_CREDENTIALS_PATH não configurado no .env.local"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(credentialsPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();