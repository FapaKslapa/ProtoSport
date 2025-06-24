import config from '../config/sms-config.json';

const SHELLRENT_USERNAME = config.shellrent.username;
const SHELLRENT_PASSWORD = config.shellrent.password;
const SHELLRENT_API_URL = config.shellrent.apiUrl;

export async function sendSms(phoneNumber: string, message: string) {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);

        const requestData = {
            message: message,
            numbers: [formattedPhone],
        };
        console.log(`Invio SMS a ${formattedPhone}: ${message}`);
        const response = await fetch(SHELLRENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${SHELLRENT_USERNAME}.${SHELLRENT_PASSWORD}`
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        console.log(`SMS inviato a ${formattedPhone}: ${message}`);

        if (data && data.status === 'success') {
            return true;
        } else {
            console.error('Errore invio SMS:', data?.message || 'Risposta API non valida');
            return false;
        }
    } catch (error) {
        console.error('Errore durante l\'invio SMS:', error);
        return false;
    }
}

function formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\s+/g, '');

    if (cleaned.startsWith('+')) {
        cleaned = '00' + cleaned.substring(1);
    } else if (cleaned.startsWith('00')) {
    } else if (!cleaned.startsWith('0')) {
        cleaned = '0039' + cleaned;
    } else {
        cleaned = '0039' + cleaned.substring(1);
    }

    return cleaned;
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}