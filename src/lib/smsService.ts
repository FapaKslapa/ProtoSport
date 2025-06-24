const SHELLRENT_USERNAME = 'username';
const SHELLRENT_PASSWORD = 'password';
const SHELLRENT_API_URL = 'https://api.shellrent.com/sms/send';

export async function sendSms(phoneNumber: string, message: string) {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const params = new URLSearchParams({
            username: SHELLRENT_USERNAME,
            password: SHELLRENT_PASSWORD,
            message: message,
            recipient: formattedPhone,
            sender: 'APP',
        });

        const response = await fetch(SHELLRENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
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

    if (!cleaned.startsWith('+')) {
        if (cleaned.startsWith('00')) {
            cleaned = '+' + cleaned.substring(2);
        } else if (!cleaned.startsWith('0')) {
            cleaned = '+39' + cleaned;
        } else {
            cleaned = '+39' + cleaned.substring(1);
        }
    }

    return cleaned;
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}