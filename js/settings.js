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
    let currentUser = null;
    const savedLang = localStorage.getItem('vibe-lang') || 'zh-TW';
    languageSelect.value = savedLang;
    applyLanguage(savedLang);

    async function initSettingsApp() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = session.user;
        userNameInput.value = currentUser.user_metadata?.name || currentUser.email.split('@')[0];
    }
    
    initSettingsApp();

    // 儲存設定
    saveBtn.addEventListener('click', async () => {
        const newName = userNameInput.value.trim();
        const newLang = languageSelect.value;
        const btnText = saveBtn.innerText;

        saveBtn.innerText = '處理中...';
        saveBtn.disabled = true;

        if (newName && currentUser) {
            // Update user metadata in Supabase
            const { error } = await window.supabaseClient.auth.updateUser({
                data: { name: newName }
            });
            
            if (error) {
                alert('名稱更新失敗: ' + error.message);
                saveBtn.innerText = btnText;
                saveBtn.disabled = false;
                return;
            }
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
        // 類別現在由 head 中的腳本處理，這裡只需確保圖示正確
        updateThemeIcons(savedTheme);
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        
        document.documentElement.classList.remove('light-mode', 'dark-mode');
        document.documentElement.classList.add(newTheme + '-mode');
        
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
