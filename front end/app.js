const API = 'http://localhost:5000/api/students';

const form = document.getElementById('studentForm');
const studentsTableBody = document.querySelector('#studentsTable tbody');
const resetBtn = document.getElementById('resetBtn');
const filterBtn = document.getElementById('filterBtn');

const fields = {
  id: document.getElementById('studentId'),
  name: document.getElementById('name'),
  graduationYear: document.getElementById('graduationYear'),
  department: document.getElementById('department'),
  status: document.getElementById('status'),
  organization: document.getElementById('organization'),
  position: document.getElementById('position'),
  location: document.getElementById('location'),
  notes: document.getElementById('notes'),
};

const getStatusBadge = (status) => {
  const map = { working: 'Working', higher_studies: 'Higher Studies', business: 'Business' };
  return `<span class="badge ${status}">${map[status] || status}</span>`;
};

const loadStudents = async () => {
  const status = document.getElementById('filterStatus').value;
  const search = document.getElementById('searchText').value.trim();
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  if (search) query.append('search', search);

  const res = await fetch(`${API}?${query.toString()}`);
  const students = await res.json();
  studentsTableBody.innerHTML = '';

  if (!students.length) {
    studentsTableBody.innerHTML = '<tr><td colspan="8">No entries found.</td></tr>';
    return;
  }

  students.forEach((st) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${st.name}</td>
      <td>${st.graduationYear || ''}</td>
      <td>${st.department || ''}</td>
      <td>${getStatusBadge(st.status)}</td>
      <td>${st.organization || ''}</td>
      <td>${st.position || ''}</td>
      <td>${st.location || ''}</td>
      <td>
        <button class="action-btn" onclick="editRecord(${st.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteRecord(${st.id})">Delete</button>
      </td>
    `;
    studentsTableBody.appendChild(row);
  });
};

window.editRecord = async (id) => {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  if (res.ok) {
    fields.id.value = data.id;
    fields.name.value = data.name;
    fields.graduationYear.value = data.graduationYear || '';
    fields.department.value = data.department || '';
    fields.status.value = data.status || '';
    fields.organization.value = data.organization || '';
    fields.position.value = data.position || '';
    fields.location.value = data.location || '';
    fields.notes.value = data.notes || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    alert(data.error || 'Failed to load student');
  }
};

window.deleteRecord = async (id) => {
  if (!confirm('Delete this record?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  const body = await res.json();
  if (res.ok) {
    await loadStudents();
  } else {
    alert(body.error || 'Delete failed');
  }
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: fields.name.value.trim(),
    graduationYear: fields.graduationYear.value ? Number(fields.graduationYear.value) : null,
    department: fields.department.value.trim(),
    status: fields.status.value,
    organization: fields.organization.value.trim(),
    position: fields.position.value.trim(),
    location: fields.location.value.trim(),
    notes: fields.notes.value.trim(),
  };

  if (!payload.name || !payload.status) {
    alert('Name and status are required.');
    return;
  }

  const method = fields.id.value ? 'PUT' : 'POST';
  const url = fields.id.value ? `${API}/${fields.id.value}` : API;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (res.ok) {
    form.reset();
    fields.id.value = '';
    await loadStudents();
  } else {
    alert(data.error || 'Failed to save');
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  fields.id.value = '';
});

filterBtn.addEventListener('click', loadStudents);

document.addEventListener('DOMContentLoaded', loadStudents);
