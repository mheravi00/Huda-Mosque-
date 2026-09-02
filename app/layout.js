import './globals.css';

export const metadata = {
  title: 'Huda Mosque Madrasa Management System',
  description: 'Madrasa management, attendance, homework, assessments, reports, and communication workflow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
