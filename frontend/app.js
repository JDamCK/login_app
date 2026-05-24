const API_URL = 'https://backend-ixcn.onrender.com';
const API = API_URL + '/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard(token);
    }

    document.getElementById('tabLogin').addEventListener('click', () => switchTab('login'));
    document.getElementById('tabRegister').addEventListener('click', () => switchTab('register'));

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('tabRegister').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function showMessage(el, msg, ok) {
    el.textContent = msg;
    el.style.color = ok ? '#2ed573' : '#ff4757';
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Cargando...';
    try {
        const res = await fetch(API + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            showMessage(msg, 'Inicio de sesión exitoso', true);
            setTimeout(() => showDashboard(data.token), 500);
        } else {
            showMessage(msg, data.message, false);
        }
    } catch (err) {
        showMessage(msg, 'Error de conexión', false);
    }
    btn.disabled = false;
    btn.textContent = 'Entrar';
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('regMessage');
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Cargando...';
    try {
        const res = await fetch(API + '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.success) {
            showMessage(msg, 'Cuenta creada. Ahora inicia sesión.', true);
            setTimeout(() => switchTab('login'), 1500);
        } else {
            showMessage(msg, data.message, false);
        }
    } catch (err) {
        showMessage(msg, 'Error de conexión', false);
    }
    btn.disabled = false;
    btn.textContent = 'Registrarse';
}

async function showDashboard(token) {
    try {
        const res = await fetch(API + '/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('dashUsername').textContent = data.user.username;
            document.getElementById('dashEmail').textContent = data.user.email || 'No especificado';
            document.getElementById('dashCreated').textContent = new Date(data.user.created_at).toLocaleDateString();
        } else {
            localStorage.removeItem('token');
        }
    } catch (err) {
        localStorage.removeItem('token');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
}
