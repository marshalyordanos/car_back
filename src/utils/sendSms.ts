import axios, { AxiosResponse } from 'axios';

/**
 * Interface for the AfroMessage API response
 */
interface AfroMessageResponse {
  acknowledge: 'success' | 'error';
  message?: string;
  [key: string]: any;
}

/**
 * Sends an SMS message using the AfroMessage API
 * @param message - The text message to send
 * @param phone - The recipient phone number
 */
export async function sendSms(message: string, phone: string): Promise<void> {
  const baseUrl = 'https://api.afromessage.com/api/send';
  //   const token = process.env.AFRO_MESSAGE_API_KEY;
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiNjR5YmVZUFBtc2UwUmhxT2p1b3d2TnNnZU42aVAycGoiLCJleHAiOjE5MjE2MDQ5MjIsImlhdCI6MTc2MzgzODUyMiwianRpIjoiYzUzODAzY2ItZDg4Mi00OTEyLTk3OTctOTgzNjMzOWUxMjljIn0.IW6JP9BJ2tYC_udqiInDb5VY5SMVuXBxGD1XdIA1wBA';

  if (!token) {
    console.error(
      'AFRO_MESSAGE_API_KEY is not defined in environment variables.',
    );
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const body = {
    to: phone,
    message,
    sender: 'afridatai', // Optional field — uncomment if needed
  };

  try {
    const result: AxiosResponse<AfroMessageResponse> = await axios.post(
      baseUrl,
      body,
      { headers },
    );

    if (result.status === 200) {
      const json = result.data;

      if (json.acknowledge === 'success') {
        console.log('✅ SMS sent successfully via AfroMessage');
      } else {
        console.error('⚠️ AfroMessage API responded with error:', json);
      }
    } else {
      console.error(
        `❌ HTTP error: ${result.status} - ${JSON.stringify(result.data)}`,
      );
    }
  } catch (error: any) {
    console.error(
      '🚨 Error sending SMS:',
      error?.response?.data || error.message || error,
    );
  }
}
