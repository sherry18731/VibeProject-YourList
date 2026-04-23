/**
 * Vibe Todo - Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const taskReason = document.getElementById('task-reason');
    const taskTag = document.getElementById('task-tag');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemsLeft = document.getElementById('items-left');
    const eraserBtn = document.getElementById('eraser-btn');
    
    // Modal Elements
    const noteModal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note');
    const taskNoteTextarea = document.getElementById('task-note');
    const modalTaskText = document.getElementById('modal-task-text');
    let currentEditingTaskId = null;

    let tasks = JSON.parse(localStorage.getItem('vibe-tasks')) || [];
    let currentFilter = 'active';
    let isEraserMode = false;

    // --- Canvas Animation Logic ---
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas.getContext('2d');
    const MAX_BALLS = 200; // 球體上限
    let balls = new Map(); // taskId -> Ball object
    let particles = [];
    let heightMap = []; // 追蹤底部堆疊高度
    let mouseX = -1000;
    let mouseY = -1000;

    function resizeCanvas() {
        const oldWidth = canvas.width;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // 重新初始化或調整高度圖大小
        const newHeightMap = new Array(Math.ceil(canvas.width)).fill(0);
        if (heightMap.length > 0) {
            // 嘗試保留舊的高度數據 (簡單平移)
            for (let i = 0; i < Math.min(heightMap.length, newHeightMap.length); i++) {
                newHeightMap[i] = heightMap[i];
            }
        }
        heightMap = newHeightMap;
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('touchstart', (e) => {
        if (isEraserMode) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isEraserMode) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        // 觸控結束後將座標移開，避免持續清除
        mouseX = -1000;
        mouseY = -1000;
    });
    resizeCanvas();

    let saveTimeout = null;
    function saveParticles() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const data = particles
                .filter(p => p.isAtBottom)
                .map(p => ({
                    x: p.x,
                    y: p.y,
                    color: p.color,
                    radius: p.radius
                }));
            localStorage.setItem('vibe-particles', JSON.stringify(data));
            saveTimeout = null;
        }, 100);
    }

    function loadParticles() {
        const data = JSON.parse(localStorage.getItem('vibe-particles')) || [];
        data.forEach(item => {
            const p = new Particle(item.x, item.y, item.color);
            p.radius = item.radius;
            p.isAtBottom = true;
            p.stack();
            particles.push(p);
        });
    }

    const ballColors = {
        '影視': '#FFB3BA',
        '書籍': '#BAFFC9',
        '音樂': '#BAE1FF',
        '課程': '#FFFFBA',
        '遊戲': '#FFD1A3'
    };

    class Ball {
        constructor(taskId, tag) {
            this.id = taskId;
            this.baseRadius = Math.random() * 8 + 12; // 12-20px
            this.radius = this.baseRadius;
            this.color = ballColors[tag] || '#6366f1';
            
            const areaHeight = window.innerHeight * 0.3;
            this.areaTop = window.innerHeight * 0.7;
            
            this.x = Math.random() * (window.innerWidth - this.radius * 2) + this.radius;
            this.baseY = this.areaTop + Math.random() * (areaHeight - this.radius * 2) + this.radius;
            this.y = this.baseY;
            
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = Math.random() * 0.02 + 0.01;
            this.amplitude = Math.random() * 15 + 10;
            
            // 呼吸效果參數
            this.breathingAngle = Math.random() * Math.PI * 2;
            this.breathingSpeed = 0.03 + Math.random() * 0.02;
        }

        draw() {
            // 根據呼吸相位計算當前半徑與亮度
            const breath = Math.sin(this.breathingAngle);
            this.radius = this.baseRadius + breath * 2;
            const glowIntensity = 15 + breath * 10;
            const opacity = 0.7 + breath * 0.2;

            ctx.beginPath();
            ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = this.color;
            ctx.globalAlpha = opacity;
            ctx.fill();
            
            // 高光 (方塊形的高光)
            ctx.beginPath();
            ctx.rect(this.x - this.radius * 0.8, this.y - this.radius * 0.8, this.radius * 0.4, this.radius * 0.4);
            ctx.fillStyle = 'white';
            ctx.globalAlpha = opacity * 0.5;
            ctx.fill();
            
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.closePath();
        }

        update() {
            this.breathingAngle += this.breathingSpeed;

            // 水平位移
            this.x += this.vx;
            // 垂直基準起伏
            this.angle += this.angleSpeed;
            const targetY = this.baseY + Math.sin(this.angle) * this.amplitude;
            
            // 讓 y 軸具備彈性地追隨目標高度 (為了配合碰撞反彈，不直接賦值)
            const dy = targetY - this.y;
            this.vy += dy * 0.05;
            this.vy *= 0.92; // 阻尼
            this.y += this.vy;

            // 邊界反彈
            if (this.x + this.radius > window.innerWidth) {
                this.x = window.innerWidth - this.radius;
                this.vx *= -1;
            } else if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -1;
            }

            // 區域限制 (高度圖與底部暫不直接碰撞球體，維持漂浮)
            if (this.y - this.radius < this.areaTop) {
                this.y = this.areaTop + this.radius;
                this.vy *= -0.5;
                this.baseY += 2;
            }
            if (this.y + this.radius > window.innerHeight) {
                this.y = window.innerHeight - this.radius;
                this.vy *= -0.5;
                this.baseY -= 2;
            }
            
            // 緩慢恢復原始 vx
            const targetVx = (this.vx > 0 ? 1 : -1) * 0.7;
            this.vx += (targetVx - this.vx) * 0.01;

            this.draw();
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8 - 2;
            this.gravity = 0.12;
            this.friction = 0.96;
            this.isAtBottom = false;
            this.addedHeight = 0;
            this.affectedRange = []; // 記錄影響的高度圖索引
        }

        draw() {
            ctx.beginPath();
            ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update() {
            if (!this.isAtBottom) {
                this.vy += this.gravity;
                this.vx *= this.friction;
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.5; }
                if (this.x > window.innerWidth - this.radius) { this.x = window.innerWidth - this.radius; this.vx *= -0.5; }

                const ix = Math.floor(this.x);
                const currentFloorHeight = heightMap[ix] || 0;
                const targetY = window.innerHeight - currentFloorHeight - this.radius;

                if (this.y >= targetY) {
                    this.y = targetY;
                    this.isAtBottom = true;
                    this.vx = 0;
                    this.vy = 0;
                    this.stack();
                    saveParticles(); // 粒子落地時儲存
                }
            } else {
                // 積雪動態：檢測下方是否有空位 (塌陷邏輯)
                const ix = Math.floor(this.x);
                const currentFloorHeight = heightMap[ix] || 0;
                const targetY = window.innerHeight - currentFloorHeight - this.radius;
                
                // 如果當前高度比紀錄的高度「高」出一定範圍，說明下方有粒子被清理了
                if (this.y < targetY - 2) { 
                    this.remove(); // 先移除舊高度貢獻
                    this.isAtBottom = false;
                    this.vy = 1; // 開始重新落下
                }
            }
            this.draw();
        }

        stack() {
            const ix = Math.floor(this.x);
            const spread = Math.ceil(this.radius * 2); // 影響範圍
            const increment = this.radius * 0.8; // 增加的高度

            for (let i = ix - spread; i <= ix + spread; i++) {
                if (i >= 0 && i < heightMap.length) {
                    // 使用比率讓堆積呈現圓弧狀
                    const dist = Math.abs(i - ix);
                    const ratio = 1 - (dist / (spread + 1));
                    const amount = increment * ratio;
                    
                    heightMap[i] += amount;
                    this.affectedRange.push({ index: i, amount: amount });
                }
            }
        }

        remove() {
            // 從高度圖中扣除貢獻的高度
            this.affectedRange.forEach(item => {
                if (item.index >= 0 && item.index < heightMap.length) {
                    heightMap[item.index] = Math.max(0, heightMap[item.index] - item.amount);
                }
            });
        }

        checkInteraction(mx, my) {
            const dx = this.x - mx;
            const dy = this.y - my;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 25; // 感應範圍
        }
    }

    function createExplosion(x, y, color) {
        const count = 30 + Math.floor(Math.random() * 20);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color));
        }
    }

    function resolveBallCollisions() {
        const ballArray = Array.from(balls.values());
        for (let i = 0; i < ballArray.length; i++) {
            for (let j = i + 1; j < ballArray.length; j++) {
                const b1 = ballArray[i];
                const b2 = ballArray[j];
                
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = b1.radius + b2.radius;
                
                if (distance < minDistance) {
                    // 1. 位置補償 (推開)
                    const angle = Math.atan2(dy, dx);
                    const overlap = minDistance - distance;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    
                    b1.x -= cos * overlap / 2;
                    b1.y -= sin * overlap / 2;
                    b2.x += cos * overlap / 2;
                    b2.y += sin * overlap / 2;
                    
                    // 2. 速度交換 (簡單彈性碰撞)
                    // 計算法線上的速度分量
                    const relativeVx = b1.vx - b2.vx;
                    const relativeVy = b1.vy - b2.vy;
                    const velocityAlongNormal = relativeVx * cos + relativeVy * sin;
                    
                    // 只在靠近時反彈
                    if (velocityAlongNormal > 0) {
                        const impulse = velocityAlongNormal * 0.8; // 能量損耗
                        b1.vx -= impulse * cos;
                        b1.vy -= impulse * sin;
                        b2.vx += impulse * cos;
                        b2.vy += impulse * sin;
                        
                        // 微調 baseY 增加隨機動態
                        b1.baseY -= sin * impulse * 10;
                        b2.baseY += sin * impulse * 10;
                    }
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 處理球體物理碰撞
        resolveBallCollisions();

        // 更新球體
        balls.forEach(ball => ball.update());
        
        // 更新與互動粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            // 僅在橡皮擦模式開啟時，滑鼠移過才會清除粒子
            if (isEraserMode && p.checkInteraction(mouseX, mouseY)) {
                p.remove(); // 移除前先扣除高度圖貢獻
                particles.splice(i, 1);
                saveParticles(); // 粒子被清除時儲存
            }
        }
        
        requestAnimationFrame(animate);
    }
    animate();

    function spawnBall(taskId, tag) {
        if (balls.size >= MAX_BALLS) return; // 上限檢查
        if (!balls.has(String(taskId))) {
            balls.set(String(taskId), new Ball(taskId, tag));
        }
    }

    function removeBall(taskId, shouldExplode = false) {
        const ball = balls.get(String(taskId));
        if (ball && shouldExplode) {
            createExplosion(ball.x, ball.y, ball.color);
        }
        balls.delete(String(taskId));
    }

    // --- Initialization ---
    initTheme();
    initUserSettings();
    renderTasks();
    loadParticles(); // 載入持久化的粒子
    
    // 初始化現有任務的球 (排除已完成與踩雷項目)
    tasks.forEach(task => {
        if (!task.completed && !task.isThunder) spawnBall(task.id, task.tag);
    });

    // --- Event Listeners ---
    addBtn.addEventListener('click', addTask);
    // 針對桌面版的 Enter 鍵快捷新增
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && window.innerWidth > 480) {
            // 若焦點在輸入欄位已由上方 listener 處理，避免重複執行
            if (document.activeElement !== taskInput && taskInput.value.trim()) {
                addTask();
            }
        }
    });

    themeToggle.addEventListener('click', toggleTheme);

    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            isEraserMode = !isEraserMode;
            eraserBtn.classList.toggle('active', isEraserMode);
            document.body.classList.toggle('eraser-mode', isEraserMode);
            
            if (window.navigator.vibrate) window.navigator.vibrate(20);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // 點擊清單內的任何位置 (事件委派)
    todoList.addEventListener('click', (e) => {
        // 使用 closest 尋找最近的目標元素
        const deleteBtn = e.target.closest('.delete-btn');
        const pinBtn = e.target.closest('.pin-btn');
        const bombBtn = e.target.closest('.bomb-btn');
        const toggleArea = e.target.closest('.checkbox-container');
        const contentArea = e.target.closest('.todo-content');
        
        const item = e.target.closest('.todo-item');
        if (!item) return;
        
        const taskId = item.getAttribute('data-id');

        // 判斷點擊的是哪個區域
        if (deleteBtn) {
            deleteTask(taskId);
        } else if (pinBtn) {
            togglePinTask(taskId);
        } else if (bombBtn) {
            toggleThunder(taskId);
        } else if (toggleArea) {
            toggleTask(taskId);
        } else if (contentArea) {
            openNoteModal(taskId);
        }
    });

    closeModalBtn.addEventListener('click', closeNoteModal);
    saveNoteBtn.addEventListener('click', saveTaskNote);
    
    // 點擊背景關閉 (已依需求移除)
    // noteModal.addEventListener('click', (e) => {
    //     if (e.target === noteModal) closeNoteModal();
    // });

    // --- Functions ---

    function addTask() {
        const text = taskInput.value.trim();
        const reason = taskReason.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            reason: reason,
            tag: taskTag.value,
            completed: false,
            pinned: false,
            isThunder: false,
            note: '', // 文字紀錄
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        spawnBall(newTask.id, newTask.tag);
        saveAndRender();
        
        // Reset inputs
        taskInput.value = '';
        taskReason.value = '';
    }

    function openNoteModal(id) {
        const task = tasks.find(t => String(t.id) === String(id));
        if (!task) return;

        currentEditingTaskId = id;
        modalTaskText.innerText = `項目：${task.text}`;
        taskNoteTextarea.value = task.note || '';
        
        noteModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 禁止背景捲動
    }

    function closeNoteModal() {
        noteModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        currentEditingTaskId = null;
    }

    function saveTaskNote() {
        if (!currentEditingTaskId) return;

        tasks = tasks.map(task => {
            if (String(task.id) === String(currentEditingTaskId)) {
                return { ...task, note: taskNoteTextarea.value };
            }
            return task;
        });

        saveAndRender();
        closeNoteModal();
    }

    function initUserSettings() {
        const savedLang = localStorage.getItem('vibe-lang') || 'zh-TW';
        
        // 簡易的多語系對應 (主頁面部分)
        if (savedLang === 'en') {
            // 輸入區域
            const taskInputEl = document.getElementById('task-input');
            if (taskInputEl) taskInputEl.placeholder = 'What is next?';
            
            const reasonLabel = document.querySelector('label[for="task-reason"]');
            if (reasonLabel) reasonLabel.textContent = 'Note (max 15 chars)';
            
            const tagLabel = document.querySelector('label[for="task-tag"]');
            if (tagLabel) tagLabel.textContent = 'Tag';
            
            const addBtnEl = document.getElementById('add-btn');
            if (addBtnEl) addBtnEl.textContent = 'Add to List';

            // 標籤選項
            const tagSelect = document.getElementById('task-tag');
            if (tagSelect) {
                const tagMap = {
                    '影視': '🎬 Movie/TV',
                    '書籍': '📖 Book',
                    '音樂': '🎵 Music',
                    '課程': '🎓 Course',
                    '遊戲': '🎮 Game'
                };
                Array.from(tagSelect.options).forEach(opt => {
                    if (tagMap[opt.value]) opt.textContent = tagMap[opt.value];
                });
            }
            
            // 過濾器
            const filters = {
                'all': 'All',
                'active': 'Active',
                'completed': 'Done',
                'thunder': 'Bomb'
            };
            document.querySelectorAll('.filter-btn').forEach(btn => {
                const f = btn.getAttribute('data-filter');
                if (filters[f]) btn.textContent = filters[f];
            });

            // 空狀態
            const emptyState = document.querySelector('.empty-state p');
            if (emptyState) emptyState.textContent = 'No tasks yet, add one!';

            // 頁尾
            const footerText = document.querySelector('.app-footer p');
            if (footerText) footerText.textContent = 'The page is currently under development. Some features may be incomplete.';

            // Modal
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = 'Note';
            
            const taskNoteTextareaEl = document.getElementById('task-note');
            if (taskNoteTextareaEl) taskNoteTextareaEl.placeholder = 'Type your notes, thoughts, or logs here...';
            
            const saveNoteBtnEl = document.getElementById('save-note');
            if (saveNoteBtnEl) saveNoteBtnEl.textContent = 'Save Note';

            const eraserBtnEl = document.getElementById('eraser-btn');
            if (eraserBtnEl) {
                eraserBtnEl.title = 'Clear Particles';
                eraserBtnEl.setAttribute('aria-label', 'Clear Particles');
            }
        }
    }

    function toggleTask(id) {
        const targetTask = tasks.find(t => String(t.id) === String(id));
        if (targetTask && targetTask.isThunder) return; // 踩雷清單禁止切換狀態

        tasks = tasks.map(task => {
            if (String(task.id) === String(id)) {
                const newCompleted = !task.completed;
                if (newCompleted) {
                    removeBall(id, true); // 完成則移除並爆裂
                } else {
                    spawnBall(id, task.tag); // 取消完成則找回
                }
                return { ...task, completed: newCompleted };
            }
            return task;
        });
        saveAndRender();
    }

    function togglePinTask(id) {
        tasks = tasks.map(task => 
            String(task.id) === String(id) ? { ...task, pinned: !task.pinned } : task
        );
        saveAndRender();
    }

    function toggleThunder(id) {
        tasks = tasks.map(task => {
            if (String(task.id) === String(id)) {
                const newIsThunder = !task.isThunder;
                if (newIsThunder) {
                    removeBall(id, true); // 標記為踩雷時執行爆炸效果並移除球體
                } else if (!task.completed) {
                    spawnBall(id, task.tag); // 取消踩雷且任務未完成時，重新產生球體
                }
                return { ...task, isThunder: newIsThunder };
            }
            return task;
        });
        saveAndRender();
    }

    function deleteTask(id) {
        const itemElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        
        if (itemElement) {
            itemElement.classList.add('deleting');
            setTimeout(() => {
                tasks = tasks.filter(task => String(task.id) !== String(id));
                saveAndRender();
                removeBall(id);
            }, 300);
        } else {
            tasks = tasks.filter(task => String(task.id) !== String(id));
            saveAndRender();
            removeBall(id);
        }
    }

    function saveAndRender() {
        localStorage.setItem('vibe-tasks', JSON.stringify(tasks));
        console.log('儲存至 localStorage 並重新渲染');
        renderTasks();
    }

    function renderTasks() {
        // 先進行排序 (僅保留置頂排序，移除 ID 排序以支援手動順序)
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.pinned !== b.pinned) {
                return a.pinned ? -1 : 1;
            }
            return 0; // 保持陣列原始順序
        });

        const filteredTasks = sortedTasks.filter(task => {
            if (currentFilter === 'thunder') return task.isThunder;
            if (currentFilter === 'active') return !task.completed && !task.isThunder;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            const emptyMsg = currentFilter === 'completed' ? '目前沒有已完成的任務' : '目前沒有任務，快新增一個吧！';
            todoList.innerHTML = `<div class="empty-state"><p>${emptyMsg}</p></div>`;
        } else {
            todoList.innerHTML = filteredTasks.map(task => createTodoElement(task)).join('');
        }

        // 重新初始化拖拽監聽器
        initDragAndDrop();

        // Update items left
        const activeCount = tasks.filter(t => !t.completed).length;
        const lang = localStorage.getItem('vibe-lang') || 'zh-TW';
        if (lang === 'en') {
            itemsLeft.innerText = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
        } else {
            itemsLeft.innerText = `${activeCount} 項清單`;
        }
    }


    function createTodoElement(task) {
        const lang = localStorage.getItem('vibe-lang') || 'zh-TW';
        const isEn = lang === 'en';
        
        const tagMap = {
            '影視': 'Movie/TV',
            '書籍': 'Book',
            '音樂': 'Music',
            '課程': 'Course',
            '遊戲': 'Game'
        };
        const displayTag = isEn ? (tagMap[task.tag] || task.tag) : task.tag;

        return `
            <div class="todo-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''} ${task.isThunder ? 'is-thunder' : ''}" data-id="${task.id}" draggable="true">
                <div class="drag-handle" title="${isEn ? 'Drag to reorder' : '按住拖拽排序'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </div>
                <div class="checkbox-container">
                    <div class="custom-checkbox"></div>
                </div>
                <div class="todo-content">
                    <div class="task-meta">
                        <span class="tag-badge tag-${task.tag}">${displayTag}</span>
                    </div>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                    ${task.reason ? `<span class="tag-reason-text">${escapeHtml(task.reason)}</span>` : ''}
                </div>
                <div class="actions">
                    <button class="action-btn pin-btn ${task.pinned ? 'active' : ''}" title="${task.pinned ? (isEn ? 'Unpin' : '取消置頂') : (isEn ? 'Pin task' : '置頂任務')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                    </button>
                    <button class="action-btn bomb-btn ${task.isThunder ? 'active' : ''}" title="${task.isThunder ? (isEn ? 'Remove Bomb' : '取消踩雷') : (isEn ? 'Mark as Bomb' : '標記為踩雷')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </button>
                    <button class="action-btn delete-btn" title="${isEn ? 'Delete task' : '刪除清單'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        `;
    }



    // --- Theme Logic --- (移除原本重複的 window.* 綁定)

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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Drag & Drop Logic ---
    let draggedItemId = null;
    let placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';

    function initDragAndDrop() {
        const items = todoList.querySelectorAll('.todo-item');
        
        // --- Mouse Drag ---
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItemId = item.getAttribute('data-id');
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                item.style.display = 'flex';
                todoList.classList.remove('drag-over');
                if (placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
            });
        });

        todoList.addEventListener('dragover', (e) => {
            e.preventDefault();
            todoList.classList.add('drag-over');
            
            const afterElement = getDragAfterElement(todoList, e.clientY);
            if (afterElement == null) {
                todoList.appendChild(placeholder);
            } else {
                todoList.insertBefore(placeholder, afterElement);
            }
        });

        todoList.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingItem = todoList.querySelector('.dragging');
            if (draggingItem && placeholder.parentNode) {
                todoList.insertBefore(draggingItem, placeholder);
                updateTasksOrder();
            }
        });

        // --- Touch Drag (Mobile Support) ---
        let touchDragging = false;
        let currentTouchItem = null;

        todoList.addEventListener('touchstart', (e) => {
            const handle = e.target.closest('.drag-handle');
            if (!handle) return;
            
            currentTouchItem = handle.closest('.todo-item');
            touchDragging = true;
            draggedItemId = currentTouchItem.getAttribute('data-id');
            currentTouchItem.classList.add('dragging');
            currentTouchItem.after(placeholder);
            
            // 觸發震動回饋 (如果支援)
            if (window.navigator.vibrate) window.navigator.vibrate(20);
        }, { passive: false });

        todoList.addEventListener('touchmove', (e) => {
            if (!touchDragging) return;
            e.preventDefault(); // 阻止頁面捲動

            const touchY = e.touches[0].clientY;
            const afterElement = getDragAfterElement(todoList, touchY);
            
            if (afterElement == null) {
                todoList.appendChild(placeholder);
            } else {
                todoList.insertBefore(placeholder, afterElement);
            }
        }, { passive: false });

        todoList.addEventListener('touchend', (e) => {
            if (!touchDragging) return;
            
            currentTouchItem.classList.remove('dragging');
            if (placeholder.parentNode) {
                todoList.insertBefore(currentTouchItem, placeholder);
                placeholder.parentNode.removeChild(placeholder);
            }
            
            touchDragging = false;
            currentTouchItem = null;
            updateTasksOrder();
        });
    }

    function getDragAfterElement(container, y) {
        // 排除正在拖拽的項目以及 placeholder 本身
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateTasksOrder() {
        // 此時 DOM 順序已經由 drop 邏輯排好了
        const renderedItems = [...todoList.querySelectorAll('.todo-item')];
        const newOrderIds = renderedItems.map(item => item.getAttribute('data-id'));
        
        const reorderedTasks = [];
        
        // 1. 處理目前渲染順序中的項目
        newOrderIds.forEach(id => {
            const task = tasks.find(t => String(t.id) === String(id));
            if (task) reorderedTasks.push(task);
        });
        
        // 2. 補回不在當前渲染範圍內的項目
        tasks.forEach(task => {
            if (!newOrderIds.includes(String(task.id))) {
                reorderedTasks.push(task);
            }
        });

        tasks = reorderedTasks;
        saveAndRender();
    }
});
