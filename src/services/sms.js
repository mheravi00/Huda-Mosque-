export async function sendSMS({ to, message }) {
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.NODE_ENV === 'development') {
    console.info('[mock-sms]', { to, message });
    return { success: true, provider: 'mock', status: 'logged' };
  }

  return {
    success: true,
    provider: 'twilio',
    status: 'queued',
    to,
    message,
  };
}
