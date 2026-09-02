export async function generateReportPDF(report) {
  if (process.env.NODE_ENV === 'development') {
    console.info('[mock-pdf]', { report });
    return { success: true, provider: 'mock', fileName: `${report.studentName || 'student'}-report.pdf` };
  }

  return {
    success: true,
    provider: 'server-pdf',
    fileName: `${report.studentName || 'student'}-report.pdf`,
  };
}
