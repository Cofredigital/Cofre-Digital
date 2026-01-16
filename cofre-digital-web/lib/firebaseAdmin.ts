import admin from "firebase-admin";

function getAdminCredentials() {
  const json = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;

  if (!json) {
    throw new Error(
      "FIREBASE_ADMIN_CREDENTIALS_JSON não configurado nas Environment Variables"
    );
  }

  try {
    const serviceAccount = JSON.parse(json);
    return admin.credential.cert(serviceAccount);
  } catch (e) {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS_JSON inválido (falha ao ler JSON)");
  }
}

// Evita reinicializar no hot-reload
if (!admin.apps.length) {
  admin.initializeApp({
    credential: getAdminCredentials(),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();