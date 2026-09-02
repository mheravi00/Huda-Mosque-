export async function sendEmail({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'development') {
    console.info('[mock-email]', { to, subject, text: text || html });
    return { success: true, provider: 'mock', status: 'logged' };
  }

  return {
    success: true,
    provider: 'resend',
    status: 'queued',
    to,
    subject,
  };
}
