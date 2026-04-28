const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const TURNSTILE_SECRET_KEY = defineSecret('TURNSTILE_SECRET_KEY');
const db = admin.firestore();
const CAPTCHA_VERIFICATION_TTL_MS = 10 * 60 * 1000;

exports.verifySignupCaptcha = onCall(
  {
    cors: true,
    secrets: [TURNSTILE_SECRET_KEY],
  },
  async (request) => {
    const token = String(request.data?.token || '').trim();
    const action = String(request.data?.action || 'signup').trim();
    if (!token) {
      throw new HttpsError('invalid-argument', 'Missing captcha token.');
    }

    const formData = new URLSearchParams();
    formData.set('secret', TURNSTILE_SECRET_KEY.value());
    formData.set('response', token);
    if (request.rawRequest?.ip) {
      formData.set('remoteip', request.rawRequest.ip);
    }

    let payload;
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      payload = await response.json();
    } catch {
      throw new HttpsError('unavailable', 'Captcha verification service is unavailable.');
    }

    if (!payload?.success) {
      return {
        success: false,
        errorCodes: Array.isArray(payload?.['error-codes']) ? payload['error-codes'] : [],
      };
    }

    const verificationId = crypto.randomUUID();
    await db.collection('captchaVerifications').doc(verificationId).set({
      provider: 'turnstile',
      action,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
      hostname: String(payload.hostname || '').trim(),
      challengeTs: String(payload.challenge_ts || '').trim(),
      used: false,
    });

    return {
      success: true,
      verificationId,
      hostname: String(payload.hostname || '').trim(),
      action,
      challengeTs: String(payload.challenge_ts || '').trim(),
    };
  },
);

exports.claimSignupCaptchaVerification = onCall(
  {
    cors: true,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'You must be signed in to claim captcha verification.');
    }
    const verificationId = String(request.data?.verificationId || '').trim();
    if (!verificationId) {
      throw new HttpsError('invalid-argument', 'Missing verification id.');
    }
    const ref = db.collection('captchaVerifications').doc(verificationId);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return { success: false, reason: 'missing' };
    }
    const data = snapshot.data() || {};
    if (Boolean(data.used)) {
      return { success: false, reason: 'used' };
    }
    const createdAtMs = Math.max(0, Number(data.createdAtMs) || 0);
    if (!createdAtMs || (Date.now() - createdAtMs) > CAPTCHA_VERIFICATION_TTL_MS) {
      return { success: false, reason: 'expired' };
    }
    await ref.set({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      usedByUid: request.auth.uid,
    }, { merge: true });
    await db.collection('userProfiles').doc(request.auth.uid).set({
      signupCaptcha: {
        provider: 'turnstile',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedAtMs: Date.now(),
        hostname: String(data.hostname || '').trim(),
        action: String(data.action || 'signup').trim(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  },
);
