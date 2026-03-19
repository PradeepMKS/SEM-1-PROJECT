const API = 'http://localhost:5000/api/students';

const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginMsg = document.getElementById('loginMsg');
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const loggedUserNum = document.getElementById('loggedUserNum');
const logoutBtn = document.getElementById('logoutBtn');

const appMode = document.getElementById('appMode');
const modeCreateBtn = document.getElementById('modeCreateBtn');
const modeUpdateBtn = document.getElementById('modeUpdateBtn');
const modeViewBtn = document.getElementById('modeViewBtn');
const updateSearchSection = document.getElementById('updateSearchSection');
const searchName = document.getElementById('searchName');
const searchBatch = document.getElementById('searchBatch');
const findBtn = document.getElementById('findBtn');

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
};

const placedYes = document.getElementById('placedYes');
const placedNo = document.getElementById('placedNo');
const placementDetails = document.getElementById('placementDetails');
const placementType = document.getElementById('placementType');
const notPlacedDetails = document.getElementById('notPlacedDetails');
const nonPlacedStatus = document.getElementById('nonPlacedStatus');

const filterStatus = document.getElementById('filterStatus');
const searchText = document.getElementById('searchText');
const sortBy = document.getElementById('sortBy');
const notificationMsg = document.getElementById('notificationMsg');

const getStatusBadge = (status) => {
  const map = {
    campus_placed: 'Placed (Campus Interview)',
    outcampus_placed: 'Placed (Out Campus Interview)',
    higher_studies: 'Higher Studies',
    entrepreneur: 'Entrepreneur',
    government_exam: 'Government Exam',
    other: 'Other',
  };
  return `<span class="badge ${status}">${map[status] || status}</span>`;
};

const formatBatch = (year) => {
  const labels = {
    2017: '2017-2021',
    2018: '2018-2022',
    2019: '2019-2023',
    2020: '2020-2024',
    2021: '2021-2025',
  };
  return labels[year] || year || '';
};

const applyModeUI = (mode = appMode.value) => {
  appMode.value = mode;
  modeCreateBtn.classList.toggle('active', mode === 'create');
  modeUpdateBtn.classList.toggle('active', mode === 'update');
  modeViewBtn.classList.toggle('active', mode === 'view');

  if (mode === 'create') {
    updateSearchSection.style.display = 'none';
    form.style.display = 'block';
    document.querySelector('.table-section').style.display = 'none';
  } else if (mode === 'update') {
    updateSearchSection.style.display = 'block';
    form.style.display = 'block';
    document.querySelector('.table-section').style.display = 'none';
  } else if (mode === 'view') {
    updateSearchSection.style.display = 'none';
    form.style.display = 'none';
    document.querySelector('.table-section').style.display = 'block';
  } else {
    updateSearchSection.style.display = 'none';
    form.style.display = 'none';
    document.querySelector('.table-section').style.display = 'none';
  }
};

const applyPlacementUI = () => {
  if (placedYes.checked) {
    placementDetails.style.display = 'block';
    notPlacedDetails.style.display = 'none';
  } else {
    placementDetails.style.display = 'none';
    notPlacedDetails.style.display = 'block';
  }
};

const setStatusFromInputs = () => {
  if (placedYes.checked) {
    fields.status.value = placementType.value;
  } else {
    fields.status.value = nonPlacedStatus.value;
  }
};

const resetForm = () => {
  form.reset();
  fields.id.value = '';
  placedNo.checked = true;
  applyPlacementUI();
  // Keep current mode button state but hide form/table until mode button clicked,
  // if mode was none, nothing appears. For create/update resets, remain in create mode.
  if (appMode.value !== 'create' && appMode.value !== 'update' && appMode.value !== 'view') {
    applyModeUI('');
  } else {
    applyModeUI(appMode.value);
  }
};

const loadStudents = async () => {
  let url = API;
  const params = new URLSearchParams();

  if (filterStatus.value) params.append('status', filterStatus.value);
  if (searchText.value.trim()) params.append('search', searchText.value.trim());

  if ([...params].length) url += `?${params.toString()}`;

  const res = await fetch(url);
  const students = await res.json();

  const parseBatch = (batch) => {
    if (!batch) return 0;
    const year = parseInt(String(batch).slice(0, 4), 10);
    return Number.isNaN(year) ? 0 : year;
  };

  let sorted = [...students];
  switch (sortBy.value) {
    case 'year_asc': sorted.sort((a, b) => parseBatch(a.graduationYear) - parseBatch(b.graduationYear)); break;
    case 'year_desc': sorted.sort((a, b) => parseBatch(b.graduationYear) - parseBatch(a.graduationYear)); break;
    case 'name_asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name_desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: break;
  }

  studentsTableBody.innerHTML = '';

  if (!sorted.length) {
    studentsTableBody.innerHTML = '<tr><td colspan="8">No entries found.</td></tr>';
    return;
  }

  sorted.forEach((st) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatBatch(st.graduationYear)}</td>
      <td>${st.name}</td>
      <td>${st.organization || ''}</td>
      <td>${getStatusBadge(st.status)}</td>
      <td>${st.department || ''}</td>
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
  if (!res.ok) {
    alert(data.error || 'Failed to load student');
    return;
  }

  appMode.value = 'update';
  applyModeUI();

  fields.id.value = data.id;
  fields.name.value = data.name;
  fields.graduationYear.value = data.graduationYear || '';
  fields.department.value = data.department || '';
  fields.organization.value = data.organization || '';
  fields.position.value = data.position || '';
  fields.location.value = data.location || '';

  if (data.status === 'campus_placed' || data.status === 'outcampus_placed') {
    placedYes.checked = true;
    placementType.value = data.status;
    notPlacedDetails.style.display = 'none';
  } else {
    placedNo.checked = true;
    placementType.value = '';
    nonPlacedStatus.value = data.status || 'higher_studies';
    placementDetails.style.display = 'none';
  }
  applyPlacementUI();
  fields.status.value = data.status;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteRecord = async (id) => {
  if (!confirm('Delete this record?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || 'Delete failed');
    return;
  }

  await loadStudents();
};

findBtn.addEventListener('click', async () => {
  const name = searchName.value.trim();
  const batch = searchBatch.value;

  if (!name || !batch) {
    alert('Please provide name and batch to search.');
    return;
  }

  const res = await fetch(`${API}?search=${encodeURIComponent(name)}`);
  const students = await res.json();
  const found = students.find((st) => st.name.toLowerCase() === name.toLowerCase() && String(st.graduationYear) === batch);

  if (!found) {
    alert('No student found with that name and batch.');
    return;
  }

  await editRecord(found.id);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  setStatusFromInputs();

  const payload = {
    name: fields.name.value.trim(),
    graduationYear: fields.graduationYear.value ? Number(fields.graduationYear.value) : null,
    department: fields.department.value.trim(),
    status: fields.status.value,
    organization: fields.organization.value.trim(),
    position: fields.position.value.trim(),
    location: fields.location.value.trim(),
  };

  if (!payload.name || !payload.graduationYear || !payload.status) {
    alert('Name, batch (year), and outcome are required.');
    return;
  }

  if ((payload.status === 'campus_placed' || payload.status === 'outcampus_placed') && !payload.organization) {
    alert('Company name is required for placed students.');
    return;
  }

  const method = fields.id.value ? 'PUT' : 'POST';
  const url = fields.id.value ? `${API}/${fields.id.value}` : API;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('save failed', data);
      alert(data.error || 'Failed to save');
      return;
    }

    notificationMsg.textContent = 'list has been updated';
    notificationMsg.style.display = 'block';
    setTimeout(() => {
      notificationMsg.style.display = 'none';
    }, 3000);

    resetForm();
    await loadStudents();
  } catch (err) {
    console.error('Network error', err);
    alert('Failed to save (network error). Make sure backend server is running.');
  }
});

resetBtn.addEventListener('click', resetForm);

filterBtn.addEventListener('click', loadStudents);
modeCreateBtn.addEventListener('click', () => { applyModeUI('create'); resetForm(); });
modeUpdateBtn.addEventListener('click', () => { applyModeUI('update'); resetForm(); });
modeViewBtn.addEventListener('click', () => { applyModeUI('view'); loadStudents(); });
placedYes.addEventListener('change', applyPlacementUI);
placedNo.addEventListener('change', applyPlacementUI);
placementType.addEventListener('change', () => { if (placementType.value) fields.status.value = placementType.value; });
nonPlacedStatus.addEventListener('change', () => { if (nonPlacedStatus.value) fields.status.value = nonPlacedStatus.value; });

logoutBtn.addEventListener('click', () => {
  loginSection.style.display = 'block';
  mainSection.style.display = 'none';
  loginMsg.textContent = '';
  loginForm.reset();
  resetForm();
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!/^[0-9]{10}$/.test(username)) {
    loginMsg.textContent = 'Username must be exactly 10 digits.';
    return;
  }

  if (password !== 'PSG') {
    loginMsg.textContent = 'invalid password';
    return;
  }

  loginMsg.textContent = '';
  loginSection.style.display = 'none';
  mainSection.style.display = 'block';
  loggedUserNum.textContent = username;
  applyModeUI('');  // start with only option buttons, no form/table shown
  resetForm();
});

// on load, start at login screen
loginSection.style.display = 'block';
mainSection.style.display = 'none';
applyModeUI();
applyPlacementUI();

