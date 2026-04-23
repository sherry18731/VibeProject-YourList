document.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('user-name-input');
    const languageSelect = document.getElementById('language-select');
    const saveBtn = document.getElementById('save-settings');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // 語言翻譯對照表 (簡易版)
    const translations = {
        'zh-TW': {
            'settings-title': '系統<span>設定</span>',
            'label-username': '使用者名稱',
            'label-language': '顯示語言',
            'save-settings': '儲存設定',
            'username-placeholder': '輸入您的名稱',
            'footer-text': '目前網頁正在開發階段，部分功能可能尚不完整。',
            'save-success': '設定已儲存！'
        },
        'en': {
            'settings-title': 'System<span>Settings</span>',
            'label-username': 'Username',
            'label-language': 'Language',
            'save-settings': 'Save Settings',
            'username-placeholder': 'Enter your name',
            'footer-text': 'The page is currently under development. Some features may be incomplete.',
            'save-success': 'Settings Saved!'
        }
    };

    // 初始化讀取設定
    const savedUser = JSON.parse(localStorage.getItem('vibe-user')) || { name: 'User', email: 'user@example.com' };
    const savedLang = localStorage.getItem('vibe-lang') || 'zh-TW';

    userNameInput.value = savedUser.name;
    languageSelect.value = savedLang;
    applyLanguage(savedLang);

    // 儲存設定
    saveBtn.addEventListener('click', () => {
        const newName = userNameInput.value.trim();
        const newLang = languageSelect.value;

        if (newName) {
            savedUser.name = newName;
            localStorage.setItem('vibe-user', JSON.stringify(savedUser));
        }

        localStorage.setItem('vibe-lang', newLang);
        applyLanguage(newLang);
        const dict = translations[newLang] || translations['zh-TW'];
        alert(dict['save-success']);
        window.location.href = 'member.html';
    });

    function applyLanguage(lang) {
        const dict = translations[lang] || translations['zh-TW'];
        
        document.getElementById('settings-title').innerHTML = dict['settings-title'];
        document.getElementById('label-username').textContent = dict['label-username'];
        document.getElementById('label-language').textContent = dict['label-language'];
        document.getElementById('save-settings').textContent = dict['save-settings'];
        
        const nameInput = document.getElementById('user-name-input');
        if (nameInput) nameInput.placeholder = dict['username-placeholder'];
        
        const footerText = document.getElementById('footer-text');
        if (footerText) footerText.textContent = dict['footer-text'];

        // 更新 HTML lang 屬性
        document.documentElement.lang = lang;
    }

    // 主題功能 (共用邏輯)
    initTheme();
    themeToggle.addEventListener('click', toggleTheme);

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
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }
});
