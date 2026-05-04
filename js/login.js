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
    const notification = document.getElementById('auth-notification');

    function showNotification(message, type = 'error') {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
    }

    function hideNotification() {
        notification.className = 'notification';
    }

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

    // Form Submissions (Supabase Auth)
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        if (email && password) {
            hideNotification();
            const btn = loginForm.querySelector('.submit-btn');
            const originalText = btn.innerText;
            btn.innerText = '處理中...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                let errorMsg = error.message;
                if (error.status === 429) {
                    errorMsg = "登入嘗試次數過多，請稍後再試。";
                } else if (error.message.includes('Invalid login credentials')) {
                    errorMsg = "信箱或密碼錯誤。";
                }
                showNotification('登入失敗: ' + errorMsg, 'error');
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                saveLoginState(data.user);
                showNotification('登入成功！正為您準備清單...', 'success');
                showSuccessAndRedirect();
            }
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;

        if (name && email && password) {
            hideNotification();
            const btn = signupForm.querySelector('.submit-btn');
            const originalText = btn.innerText;
            btn.innerText = '處理中...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) {
                let errorMsg = error.message;
                if (error.status === 429) {
                    errorMsg = "註冊嘗試次數過多，請稍後再試 (系統防護機制)。";
                }
                showNotification('註冊失敗: ' + errorMsg, 'error');
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                saveLoginState(data.user);
                showNotification('註冊成功！歡迎加入 YourList', 'success');
                showSuccessAndRedirect();
            }
        }
    });

    function saveLoginState(user) {
        if(user) {
            const name = user.user_metadata?.name || user.email.split('@')[0];
            localStorage.setItem('vibe-user', JSON.stringify({ email: user.email, name: name, isLoggedIn: true }));
        }
    }

    function showSuccessAndRedirect() {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    function initTheme() {
        // 類別現在由 head 中的腳本處理
        // 登入頁面特有的類別可以繼續加在 body
        document.body.classList.add('login-page');
    }
});
