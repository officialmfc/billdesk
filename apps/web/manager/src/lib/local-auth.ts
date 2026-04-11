// Local Authentication System
// Supports PIN and Biometric (fingerprint/face) authentication
import { logger } from "@/lib/logger";

const LOCAL_AUTH_KEY = "mfc_local_auth";
const LOCAL_AUTH_ENABLED_KEY = "mfc_local_auth_enabled";
const BIOMETRIC_ENABLED_KEY = "mfc_biometric_enabled";
const BIOMETRIC_CREDENTIAL_KEY = "mfc_biometric_credential";

export type LocalAuthType = "pin" | "biometric" | "none";

interface LocalAuthData {
    pinHash: string;
    salt: string;
    enabled: boolean;
    biometricEnabled: boolean;
}

// Generate a random salt
function generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

// Hash PIN with salt using PBKDF2
async function hashPin(pin: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + salt);

    const key = await crypto.subtle.importKey(
        "raw",
        data,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
            iterations: 600000,
            hash: "SHA-256"
        },
        key,
        256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Check if biometric authentication is available
export async function isBiometricAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
        return false;
    }

    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (error) {
        logger.error(error, "Error checking biometric availability");
        return false;
    }
}

// Setup PIN authentication (always required)
export async function setupPinAuth(pin: string): Promise<boolean> {
    try {
        if (pin.length < 4) {
            throw new Error("PIN must be at least 4 digits");
        }

        const salt = generateSalt();
        const pinHash = await hashPin(pin, salt);

        // Get existing auth data to preserve biometric setting
        const existingDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
        const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};

        const authData: LocalAuthData = {
            pinHash,
            salt,
            enabled: true,
            biometricEnabled: existingData.biometricEnabled || false
        };

        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authData));
        localStorage.setItem(LOCAL_AUTH_ENABLED_KEY, "true");

        return true;
    } catch (error) {
        logger.error(error, "❌ Failed to setup PIN");
        return false;
    }
}

// Setup biometric authentication
export async function setupBiometricAuth(userId: string): Promise<boolean> {
    try {
        const available = await isBiometricAvailable();
        if (!available) {
            throw new Error("Biometric authentication not available");
        }

        // Create credential
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: "MFC Manager",
                id: window.location.hostname
            },
            user: {
                id: new TextEncoder().encode(userId),
                name: userId,
                displayName: "MFC Manager User"
            },
            pubKeyCredParams: [
                { alg: -7, type: "public-key" },  // ES256
                { alg: -257, type: "public-key" } // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required"
            },
            timeout: 60000,
            attestation: "none"
        };

        const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions
        }) as PublicKeyCredential;

        if (!credential) {
            throw new Error("Failed to create credential");
        }

        // Store credential ID
        const credentialId = Array.from(new Uint8Array(credential.rawId))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

        localStorage.setItem(BIOMETRIC_CREDENTIAL_KEY, credentialId);
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");

        // Update existing auth data to enable biometric
        const authDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
        if (authDataStr) {
            const authData: LocalAuthData = JSON.parse(authDataStr);
            authData.biometricEnabled = true;
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authData));
        }

        return true;
    } catch (error) {
        logger.error(error, "❌ Failed to setup biometric");
        return false;
    }
}

// Verify PIN
export async function verifyPin(pin: string): Promise<boolean> {
    try {
        const authDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
        if (!authDataStr) {
            return false;
        }

        const authData: LocalAuthData = JSON.parse(authDataStr);
        if (!authData.pinHash || !authData.salt) {
            return false;
        }

        const pinHash = await hashPin(pin, authData.salt);
        const isValid = pinHash === authData.pinHash;

        return isValid;
    } catch (error) {
        logger.error(error, "❌ Failed to verify PIN");
        return false;
    }
}

// Verify biometric
export async function verifyBiometric(): Promise<boolean> {
    try {
        const credentialId = localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY);
        if (!credentialId) {
            return false;
        }

        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        // Convert hex string back to Uint8Array
        const credentialIdBytes = new Uint8Array(
            credentialId.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        const publicKeyOptions: PublicKeyCredentialRequestOptions = {
            challenge,
            allowCredentials: [{
                id: credentialIdBytes,
                type: "public-key",
                transports: ["internal"]
            }],
            userVerification: "required",
            timeout: 60000
        };

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyOptions
        }) as PublicKeyCredential;

        if (!assertion) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error(error, "❌ Failed to verify biometric");
        return false;
    }
}

// Check if local auth is enabled
export function isLocalAuthEnabled(): boolean {
    return localStorage.getItem(LOCAL_AUTH_ENABLED_KEY) === "true";
}

// Get local auth type (returns preferred method)
export function getLocalAuthType(): LocalAuthType {
    const authDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!authDataStr) return "none";

    const authData: LocalAuthData = JSON.parse(authDataStr);

    // If biometric is enabled, prefer it (but PIN is still available as fallback)
    if (authData.biometricEnabled && localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY)) {
        return "biometric";
    }

    // Otherwise use PIN
    if (authData.pinHash) {
        return "pin";
    }

    return "none";
}

// Check if biometric is enabled
export function isBiometricEnabled(): boolean {
    return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
}

// Check if PIN is set up
export function isPinEnabled(): boolean {
    const authDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!authDataStr) return false;
    const authData: LocalAuthData = JSON.parse(authDataStr);
    return !!authData.pinHash;
}

// Disable local auth completely
export function disableLocalAuth(): void {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    localStorage.removeItem(LOCAL_AUTH_ENABLED_KEY);
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    localStorage.removeItem(BIOMETRIC_CREDENTIAL_KEY);
}

// Disable only biometric (keep PIN)
export function disableBiometric(): void {
    const authDataStr = localStorage.getItem(LOCAL_AUTH_KEY);
    if (authDataStr) {
        const authData: LocalAuthData = JSON.parse(authDataStr);
        authData.biometricEnabled = false;
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authData));
    }
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    localStorage.removeItem(BIOMETRIC_CREDENTIAL_KEY);
}

// Change PIN
export async function changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
        const isValid = await verifyPin(oldPin);
        if (!isValid) {
            throw new Error("Invalid current PIN");
        }

        return await setupPinAuth(newPin);
    } catch (error) {
        logger.error(error, "❌ Failed to change PIN");
        return false;
    }
}
