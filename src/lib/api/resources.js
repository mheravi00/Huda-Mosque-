import { api, apiRequest } from './client';

const collection = path => ({
  list: params => api.get(path, params),
  get: id => api.get(`${path}/${id}`),
  create: body => api.post(path, body),
  update: (id, body) => api.patch(`${path}/${id}`, body),
  remove: id => api.delete(`${path}/${id}`),
});

export const studentsApi = { ...collection('/api/students'), admin: collection('/api/admin/students'), guardians: id => api.get(`/api/students/${id}/guardians`), linkGuardian: (id, guardian_id) => api.post(`/api/admin/students/${id}/guardians`, { guardian_id }), unlinkGuardian: (id, guardianId) => api.delete(`/api/admin/students/${id}/guardians/${guardianId}`) };
export const guardiansApi = { ...collection('/api/guardians'), admin: collection('/api/admin/guardians') };
export const teachersApi = { admin: collection('/api/admin/teachers'), classes: id => api.get(`/api/admin/teachers/${id}/classes`) };
export const subjectsApi = { ...collection('/api/subjects'), admin: collection('/api/admin/subjects') };
export const classesApi = { ...collection('/api/classes'), admin: collection('/api/admin/classes'), students: id => api.get(`/api/admin/classes/${id}/students`), assignStudent: (id, student_id) => api.post(`/api/admin/classes/${id}/students`, { student_id }), removeStudent: (id, studentId) => api.delete(`/api/admin/classes/${id}/students/${studentId}`), teachers: id => api.get(`/api/admin/classes/${id}/teachers`), assignTeacher: (id, teacher_id) => api.post(`/api/admin/classes/${id}/teachers`, { teacher_id }), removeTeacher: (id, teacherId) => api.delete(`/api/admin/classes/${id}/teachers/${teacherId}`) };
export const attendanceApi = collection('/api/attendance');
export const homeworkApi = { ...collection('/api/homework'), submissions: id => api.get(`/api/homework/${id}/submissions`), updateSubmission: (id, studentId, body) => api.patch(`/api/homework/${id}/submissions/${studentId}`, body) };
export const assessmentsApi = { ...collection('/api/assessments'), results: id => api.get(`/api/assessments/${id}/results`), createResult: (id, body) => api.post(`/api/assessments/${id}/results`, body), updateResult: (id, studentId, body) => api.patch(`/api/assessments/${id}/results/${studentId}`, body) };
export const notesApi = { list: studentId => api.get(`/api/students/${studentId}/notes`), create: (studentId, body) => api.post(`/api/students/${studentId}/notes`, body), update: (id, body) => api.patch(`/api/student-notes/${id}`, body), remove: id => api.delete(`/api/student-notes/${id}`) };
export const reportsApi = { ...collection('/api/reports'), sections: id => api.get(`/api/reports/${id}/sections`), createSection: (id, body) => api.post(`/api/reports/${id}/sections`, body), updateSection: (id, sectionId, body) => api.patch(`/api/reports/${id}/sections/${sectionId}`, body), removeSection: (id, sectionId) => api.delete(`/api/reports/${id}/sections/${sectionId}`), pdf: id => api.post(`/api/reports/${id}/pdf`, {}) };
export const reportRequestsApi = { ...collection('/api/report-requests'), create: body => api.post('/api/admin/report-requests', body) };
export const messagesApi = collection('/api/messages');
export const notificationsApi = collection('/api/notifications');
export const calendarApi = { ...collection('/api/calendar'), admin: collection('/api/admin/calendar') };
export const settingsApi = { list: () => api.get('/api/settings'), update: (key, value) => api.patch(`/api/admin/settings/${encodeURIComponent(key)}`, { value }) };
export const storageApi = { upload: form => api.upload('/api/storage/upload', form), signedUrl: body => api.post('/api/storage/signed-url', body), remove: body => apiRequest('/api/storage/objects', { method: 'DELETE', body }) };
