document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    // 讀取資料並計算統計
    const tasks = JSON.parse(localStorage.getItem('vibe-tasks')) || [];
    
    let completedCount = 0;
    let thunderCount = 0;
    
    tasks.forEach(task => {
        if (task.completed) completedCount++;
        if (task.isThunder) thunderCount++;
    });
    
    // 更新 DOM，加入動畫數字效果 (可選，這裡直接更新)
    document.getElementById('completed-count').innerText = completedCount;
    document.getElementById('thunder-count').innerText = thunderCount;

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
