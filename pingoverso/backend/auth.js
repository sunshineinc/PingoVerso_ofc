const fs = require('fs');
const path = require('path');

function authenticate(username, password) {
    const usersPath = path.join(__dirname, 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath));
    return users.find(u => u.username === username && u.password === password);
}

module.exports = { authenticate };