import './globals.css';

export const metadata = {
  title: 'Huda Mosque Madrasa',
  description: 'Madrasa management, attendance, homework, assessments, and reports.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
