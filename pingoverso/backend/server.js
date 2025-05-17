const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.static(path.join(__dirname, '../front-end')));
app.use(express.json());

// Rota raiz → carrega o HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/index.html'));
});

// Registro de usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, error: 'Dados inválidos' });

  try {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE));
    }

    if (users.find(u => u.username === username)) {
      return res.json({ success: false, error: 'Usuário já existe' });
    }

    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: 'Erro interno' });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('Usuário conectado');

  socket.on('sendMessage', msg => {
    io.emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

http.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
