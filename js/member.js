document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // 初始化主題與語言
    initTheme();
    initLanguage();

    // 讀取資料並計算統計
    const tasks = JSON.parse(localStorage.getItem('vibe-tasks')) || [];
    const lang = localStorage.getItem('vibe-lang') || 'zh-TW';

    let completedCount = 0;
    let thunderCount = 0;

    tasks.forEach(task => {
        if (task.completed) completedCount++;
        if (task.isThunder) thunderCount++;
    });

    // 更新 DOM，加入動畫數字效果 (可選，這裡直接更新)
    // 更新 DOM
    document.getElementById('completed-count').innerText = completedCount;
    document.getElementById('thunder-count').innerText = thunderCount;

    // 讀取並更新使用者名稱
    const savedUser = JSON.parse(localStorage.getItem('vibe-user')) || { name: 'User' };
    const memberNameDisplay = document.querySelector('.member-name');
    if (memberNameDisplay) {
        memberNameDisplay.innerText = savedUser.name;
    }

    function initLanguage() {
        const savedLang = localStorage.getItem('vibe-lang') || 'zh-TW';
        if (savedLang === 'en') {
            document.documentElement.lang = 'en';
            const titleEl = document.getElementById('member-title');
            if (titleEl) titleEl.innerHTML = 'Member<span>Profile</span>';

            const labelCompleted = document.getElementById('label-completed');
            if (labelCompleted) labelCompleted.textContent = 'Completed Items';

            const labelThunder = document.getElementById('label-thunder');
            if (labelThunder) labelThunder.textContent = 'Thunder Items';

            const footerText = document.getElementById('footer-text');
            if (footerText) footerText.textContent = 'The page is currently under development. Some features may be incomplete.';

            const backBtn = document.getElementById('back-btn');
            if (backBtn) backBtn.setAttribute('aria-label', 'Back to Home');
        }
    }

    // --- 主題切換邏輯 ---
    function initTheme() {
        const savedTheme = localStorage.getItem('vibe-theme') || 'light';
        document.body.className = savedTheme + '-mode';
        updateThemeIcons(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.body.className = newTheme + '-mode';
        localStorage.setItem('vibe-theme', newTheme);
        updateThemeIcons(newTheme);
    }

    function updateThemeIcons(theme) {
        if (theme === 'light') {
            if (sunIcon) sunIcon.classList.remove('hidden');
            if (moonIcon) moonIcon.classList.add('hidden');
        } else {
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
        }
    }

    // 初始化主題並綁定事件
    initTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});
