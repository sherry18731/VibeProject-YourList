document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // 初始化主題與語言
    initTheme();
    initLanguage();

    let tasks = [];
    let currentUser = null;

    async function initMemberApp() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = session.user;

        // 讀取並更新使用者名稱
        const memberNameDisplay = document.querySelector('.member-name');
        const memberEmailDisplay = document.querySelector('.member-email');
        if (memberNameDisplay) {
            memberNameDisplay.innerText = currentUser.user_metadata?.name || currentUser.email.split('@')[0];
        }
        if (memberEmailDisplay) {
            memberEmailDisplay.innerText = currentUser.email;
        }

        // 讀取資料並計算統計
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .select('*')
            .eq('user_id', currentUser.id);

        if (!error && data) {
            tasks = data;
        }

        // 更新 DOM
        updateStats('all');
    }

    initMemberApp();

    // 監聽分類切換
    const categoryBtns = document.querySelectorAll('#category-tabs .filter-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateStats(btn.dataset.category);
        });
    });

    function updateStats(category) {
        let currentCompleted = 0;
        let currentThunder = 0;

        tasks.forEach(task => {
            const matchesCategory = category === 'all' || task.tag === category;
            if (matchesCategory) {
                if (task.isThunder) {
                    currentThunder++;
                } else if (task.completed) {
                    currentCompleted++;
                }
            }
        });

        document.getElementById('completed-count').innerText = currentCompleted;
        document.getElementById('thunder-count').innerText = currentThunder;
    }

    // 會員名稱更新已移至 initMemberApp() 中

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

            // 分類翻譯
            const categoryMap = {
                'all': 'All',
                '影視': 'Movie',
                '書籍': 'Book',
                '音樂': 'Music',
                '課程': 'Course',
                '遊戲': 'Game'
            };
            document.querySelectorAll('#category-tabs .filter-btn').forEach(btn => {
                const cat = btn.dataset.category;
                if (categoryMap[cat]) btn.textContent = categoryMap[cat];
            });
        }
    }

    // --- 主題切換邏輯 ---
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
