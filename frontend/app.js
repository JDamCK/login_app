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

    // Setup Password Toggles
    setupPasswordToggle('toggleLoginPassword', 'loginPassword');
    setupPasswordToggle('toggleRegPassword', 'regPassword');
});

function setupPasswordToggle(toggleId, inputId) {
    const toggleIcon = document.getElementById(toggleId);
    const passwordInput = document.getElementById(inputId);
    
    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        });
    }
}

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
    el.innerHTML = ok 
        ? `<i class="fa-solid fa-circle-check"></i> ${msg}`
        : `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
    el.className = 'message ' + (ok ? 'success' : 'error');
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');
    const btn = e.target.querySelector('button');
    const btnText = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    
    btn.disabled = true;
    const originalText = btnText.textContent;
    const originalIconClass = btnIcon.className;
    btnText.textContent = 'Cargando...';
    btnIcon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';
    
    msg.innerHTML = '';
    msg.className = 'message';
    
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
            setTimeout(() => showDashboard(data.token), 800);
        } else {
            showMessage(msg, data.message, false);
        }
    } catch (err) {
        showMessage(msg, 'Error de conexión con el servidor', false);
    }
    
    btn.disabled = false;
    btnText.textContent = originalText;
    btnIcon.className = originalIconClass;
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('regMessage');
    const btn = e.target.querySelector('button');
    const btnText = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    
    btn.disabled = true;
    const originalText = btnText.textContent;
    const originalIconClass = btnIcon.className;
    btnText.textContent = 'Cargando...';
    btnIcon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';
    
    msg.innerHTML = '';
    msg.className = 'message';
    
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
        showMessage(msg, 'Error de conexión con el servidor', false);
    }
    
    btn.disabled = false;
    btnText.textContent = originalText;
    btnIcon.className = originalIconClass;
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
            
            // Set User Details
            document.getElementById('dashWelcomeName').textContent = data.user.username;
            document.getElementById('dashUsername').textContent = data.user.username;
            document.getElementById('dashEmail').textContent = data.user.email || 'No especificado';
            document.getElementById('dashCreated').textContent = new Date(data.user.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            
            // Set Avatar Initials
            const initials = data.user.username.slice(0, 2).toUpperCase();
            document.getElementById('avatarInitials').textContent = initials;
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
    // Limpiar campos y mensajes al salir
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('loginMessage').innerHTML = '';
    document.getElementById('loginMessage').className = 'message';
    document.getElementById('regMessage').innerHTML = '';
    document.getElementById('regMessage').className = 'message';
}
