const express = require('express');
const cors = require('cors');
const { init } = require('./models/db');
const studentsRouter = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

init();

app.get('/', (req, res) => {
  res.send('Passed-out student tracker API is running');
});

app.use('/api/students', studentsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
