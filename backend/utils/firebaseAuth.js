import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Verifies Firebase Auth ID tokens using Google's public signing keys —
// no service account / Admin SDK credential is required for verification,
// only the project ID (to check the token's issuer/audience).
const client = jwksClient({
  jwksUri: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  cache: true,
  cacheMaxAge: 12 * 60 * 60 * 1000,
});

const getSigningKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
};

export const verifyFirebaseToken = (idToken) =>
  new Promise((resolve, reject) => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      reject(new Error('FIREBASE_PROJECT_ID is not configured on the server'));
      return;
    }

    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ['RS256'],
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      },
      (err, decoded) => {
        if (err) return reject(err);
        if (!decoded.sub) return reject(new Error('Token missing subject (uid)'));
        resolve(decoded);
      }
    );
  });
