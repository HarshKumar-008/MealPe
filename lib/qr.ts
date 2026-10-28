import crypto from 'crypto';

// Read the secret password from .env.local (with a fallback for local testing)
const HMAC_SECRET = process.env.HMAC_SECRET || 'mealpe_super_secret_key_trivenix_410';

// 1. Helper to get the current 30-second time window integer
export function getCurrentTimeSlot(): number {
    return Math.floor(Date.now() / 30000);
}

// 2. Helper to compute HMAC-SHA256 signature for a given userId, mealId, and timeSlot
export function createSignature(userId: string, mealId: string, timeSlot: number): string {
    const dataToSign = `${userId}|${mealId}|${timeSlot}`;
    return crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(dataToSign)
        .digest('hex');
}

// 3. Function called by Student QR API to generate the full QR string
export function generateQrToken(userId: string, mealId: string) {
    const timeSlot = getCurrentTimeSlot();
    const signature = createSignature(userId, mealId, timeSlot);

    // Final string inside the QR code: "userId|mealId|timeSlot|signature"
    const qrString = `${userId}|${mealId}|${timeSlot}|${signature}`;
    
    // Calculate how many seconds are left in this 30-second window
    const secondsRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);

    return { qrString, timeSlot, secondsRemaining };
}

// 4. Function called by Staff Scanner API to verify if a scanned QR string is authentic & fresh
export function verifyQrToken(qrString: string) {
    const parts = qrString.split('|');
    if (parts.length !== 4) {
        return { valid: false, error: 'Malformed QR code format' };
    }

    const [userId, mealId, slotStr, receivedSignature] = parts;
    const scannedSlot = parseInt(slotStr, 10);

    if (isNaN(scannedSlot)) {
        return { valid: false, error: 'Invalid time slot in QR code' };
    }

    const currentSlot = getCurrentTimeSlot();

    // Allow currentSlot OR (currentSlot - 1) to handle 1-2 seconds of network/camera lag
    if (scannedSlot !== currentSlot && scannedSlot !== currentSlot - 1) {
        return { 
            valid: false, 
            error: 'QR code has expired! Screenshot or old token detected.' 
        };
    }

    // Recompute what the signature SHOULD be using our server's secret key
    const expectedSignature = createSignature(userId, mealId, scannedSlot);

    // Convert both hex strings to byte buffers for constant-time comparison
    const receivedBuf = Buffer.from(receivedSignature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (
        receivedBuf.length !== expectedBuf.length || 
        !crypto.timingSafeEqual(receivedBuf, expectedBuf)
    ) {
        return { valid: false, error: 'Invalid cryptographic signature! Fake QR detected.' };
    }

    return { valid: true, userId, mealId, timeSlot: scannedSlot };
}