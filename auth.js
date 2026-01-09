// Authentication utility functions
const AUTH_KEY = 'ecosort_user';
const AUTH_TOKEN = 'ecosort_token';

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem(AUTH_TOKEN) !== null;
}

// Get current user info
function getCurrentUser() {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
}

// Login user
function loginUser(email, fullname = '') {
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const user = {
        email: email,
        fullname: fullname || email.split('@')[0],
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return true;
}

// Logout user
function logoutUser() {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(AUTH_KEY);
}

// Redirect to login if not authenticated
function requireLogin(redirectPath = 'login.html') {
    if (!isUserLoggedIn()) {
        window.location.href = redirectPath;
        return false;
    }
    return true;
}

// Update navbar with user info and logout button
function updateNavbarForAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove existing login/register/logout links
    const existingAuthLinks = navLinks.querySelectorAll('[data-auth-link]');
    existingAuthLinks.forEach(link => link.remove());

    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        
        // Create user menu
        const userMenuHTML = `
            <li class="user-menu" data-auth-link>
                <span class="user-name">
                    <i class="fas fa-user-circle"></i>
                    ${user.fullname}
                </span>
                <ul class="user-dropdown">
                    <li><a href="#" onclick="handleLogout(event)">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a></li>
                </ul>
            </li>
        `;
        navLinks.innerHTML += userMenuHTML;
    } else {
        // Show login and register buttons
        const authLinksHTML = `
            <li data-auth-link><a href="login.html">Login</a></li>
            <li data-auth-link><a href="register.html" class="nav-btn">Register</a></li>
        `;
        navLinks.innerHTML += authLinksHTML;
    }
}

// Handle logout
function handleLogout(event) {
    event.preventDefault();
    logoutUser();
    window.location.href = 'index.html';
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavbarForAuth();
});
