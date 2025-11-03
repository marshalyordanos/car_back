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
    'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiQ3o5MzQ0VExCMXVvNDJVaUY4eFpNREdpS0NqQk1rQmoiLCJleHAiOjE5MTk5NTkyNjAsImlhdCI6MTc2MjE5Mjg2MCwianRpIjoiM2MyZTY4NDAtNTcwNC00ZTUwLWI5NmYtYjc1NTQwYmRkMzU0In0.0q-r_RZb0X09vgB0MX1orxmSiXQhTKATJfrRDB4UglI	';

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
    // sender: "Kelati", // Optional field — uncomment if needed
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
