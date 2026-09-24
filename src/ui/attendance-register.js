export async function listAllAttendanceRows(list, params) {
  const data = [];
  for (let page = 1; ; page++) {
    const result = await list({ ...params, page, limit: 100 });
    data.push(...result.data);
    if (page >= (result.meta?.pagination?.total_pages ?? 1)) break;
  }
  return { data };
}

export async function saveRegister(api, { classId, date, students, statuses }) {
  if (!students.length || students.some(s => !['Present', 'Absent', 'Excused', 'Late'].includes(statuses[s.id]))) {
    throw new Error('Mark every student before saving the register.');
  }
  // Fetch the exact session again so retries after a partial save are safe.
  const { data } = await listAllAttendanceRows(api.list, { class_id: classId, attendance_date: date });
  try {
    for (const student of students) {
      const existing = data.find(r => r.class_id === classId && r.attendance_date === date && r.student_id === student.id);
      if (existing) {
        if (existing.status !== statuses[student.id]) await api.update(existing.id, { status: statuses[student.id] });
      } else {
        await api.create({ class_id: classId, student_id: student.id, attendance_date: date, status: statuses[student.id] });
      }
    }
  } catch (error) {
    throw new Error(`The register was not fully saved. Some entries may have saved; retry to finish. ${error.message}`);
  }
}
