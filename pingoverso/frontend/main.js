const socket = io();

// DOM Elements
const loginRegisterDiv = document.getElementById('login-register');
const gameDiv = document.getElementById('game');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success) {
    loginMessage.textContent = '';
    startGame(username);
  } else {
    loginMessage.textContent = data.error || 'Erro no login.';
  }
});

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success) {
    loginMessage.style.color = 'green';
    loginMessage.textContent = 'Cadastro realizado com sucesso! Faça login.';
  } else {
    loginMessage.style.color = 'red';
    loginMessage.textContent = data.error || 'Erro no cadastro.';
  }
});

// Chat
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  socket.emit('sendMessage', message);
  chatInput.value = '';
});

socket.on('receiveMessage', (msg) => {
  const p = document.createElement('p');
  p.textContent = msg;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Three.js básico com pinguim simples e movimentação clicando

let scene, camera, renderer, penguin;
let targetPosition = null;

function initThree() {
  const container = document.getElementById('three-container');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Luz
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // Chão
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x55aaff });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = - Math.PI / 2;
  scene.add(floor);

  // Pinguim (usando geometria simples)
  const bodyGeom = new THREE.SphereGeometry(1, 32, 32);
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 1;

  const bellyGeom = new THREE.SphereGeometry(0.6, 32, 32);
  const bellyMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const belly = new THREE.Mesh(bellyGeom, bellyMat);
  belly.position.set(0, 1, 0.8);

  penguin = new THREE.Group();
  penguin.add(body);
  penguin.add(belly);
  penguin.position.set(0, 0, 0);

  scene.add(penguin);

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', onWindowResize);
  container.addEventListener('click', onClick);
}

function onWindowResize() {
  const container = document.getElementById('three-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function onClick(event) {
  // Calcula posição do clique no plano (chão)
  const container = document.getElementById('three-container');
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / container.clientHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectPoint = new THREE.Vector3();

  raycaster.ray.intersectPlane(plane, intersectPoint);

  targetPosition = intersectPoint;
}

function animate() {
  requestAnimationFrame(animate);

  if (targetPosition) {
    const direction = new THREE.Vector3().subVectors(targetPosition, penguin.position);
    const distance = direction.length();

    if (distance > 0.05) {
      direction.normalize();
      penguin.position.addScaledVector(direction, 0.05);

      // Rotaciona pinguim na direção do movimento
      const angle = Math.atan2(direction.x, direction.z);
      penguin.rotation.y = angle;
    } else {
      targetPosition = null;
    }
  }

  renderer.render(scene, camera);
}

function startGame(username) {
  loginRegisterDiv.style.display = 'none';
  gameDiv.style.display = 'flex';

  initThree();
  animate();

  socket.emit('sendMessage', `${username} entrou no jogo.`);
}
