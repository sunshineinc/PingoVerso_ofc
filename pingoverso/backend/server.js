const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const usersFile = path.join(__dirname, 'users.json');
const pufflesFile = path.join(__dirname, 'puffles.json');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Endpoint para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
  }
});

// Pega puffles do usuário
app.get('/puffles/:username', (req, res) => {
  const puffles = readJSON(pufflesFile);
  const userPuffles = puffles.filter(p => p.owner === req.params.username);
  res.json(userPuffles);
});

// Adiciona novo puffle
app.post('/puffles', (req, res) => {
  const { owner, name, color } = req.body;
  if (!owner || !name || !color) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }
  let puffles = readJSON(pufflesFile);
  puffles.push({ owner, name, color });
  writeJSON(pufflesFile, puffles);
  res.json({ success: true, message: 'Puffle adicionado!' });
});

// Para qualquer rota que não seja API, retorna index.html (frontend SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
