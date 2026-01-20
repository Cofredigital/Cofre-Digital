// cofre-digital-web/lib/firebaseAdmin.ts
import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const json = process.env.FIREBASE_ADMIN_SDK_JSON;

  if (!json) {
    throw new Error("FIREBASE_ADMIN_SDK_JSON não definido nas variáveis de ambiente.");
  }

  return JSON.parse(json);
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(getServiceAccount()),
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
