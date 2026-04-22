/**
 * YourList - Login Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.getElementById('login-card');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const backHomeBtn = document.querySelector('.back-home');

    // Theme logic - sync with home page
    initTheme();

    // Toggle between Login and Signup
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('view-login');
        loginCard.classList.add('view-signup');
        // Animation trigger
        loginCard.style.animation = 'none';
        loginCard.offsetHeight; // trigger reflow
        loginCard.style.animation = null;
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('view-signup');
        loginCard.classList.add('view-login');
        // Animation trigger
        loginCard.style.animation = 'none';
        loginCard.offsetHeight; // trigger reflow
        loginCard.style.animation = null;
    });

    // Form Submissions (Mock)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        if (email && password) {
            // Mock login success
            saveLoginState({ email, name: email.split('@')[0], isLoggedIn: true });
            showSuccessAndRedirect('登入成功！正為您準備清單...');
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;

        if (name && email && password) {
            // Mock signup success
            saveLoginState({ email, name, isLoggedIn: true });
            showSuccessAndRedirect('註冊成功！歡迎加入 YourList');
        }
    });

    function saveLoginState(user) {
        localStorage.setItem('vibe-user', JSON.stringify(user));
    }

    function showSuccessAndRedirect(message) {
        const btn = document.querySelector('.view-login .submit-btn') || document.querySelector('.view-signup .submit-btn');
        const originalText = btn.innerText;
        
        btn.innerText = '處理中...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        setTimeout(() => {
            alert(message);
            window.location.href = 'index.html';
        }, 1000);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('vibe-theme') || 'light';
        document.body.className = savedTheme + '-mode login-page';
    }
});
