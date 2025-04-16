let currentNode = null;
let story = {};
let playerStats = {
    military: 0,
    diplomacy: 0,
    treasury: 1000,
    allies: []
};

async function loadStory() {
    document.getElementById("start").style.display = "none";
    const res = await fetch('./assets/story.json');
    story = await res.json();

    const hash = window.location.hash.slice(1);
    if (hash && story.nodes[hash]) {
        showNode(hash);
    } else {
        showNode(story.start);
    }
}
function saveStats() {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
}
function loadStats() {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
        playerStats = JSON.parse(savedStats);
        if (window.location.hash.slice(1) == "intro") {
            playerStats = {
                military: 5,
                diplomacy: 15,
                treasury: 100,
                allies: []
            };
            saveStats();
        }
    }

}
function updateStats() {
    saveStats();
    const statsContainer = document.getElementById('stats');
    statsContainer.style.display = '';
    if (!statsContainer) {
        const container = document.createElement('div');
        container.id = 'stats';
        container.className = 'stats-container';

        container.innerHTML = `
            <div class="stat">
                <span class="stat-label">نیروی نظامی:</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(playerStats.military / 100) * 100}%"></div>
                    <span class="stat-value">${playerStats.military}</span>
                </div>
            </div>
            <div class="stat">
                <span class="stat-label">دیپلماسی:</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(playerStats.diplomacy / 100) * 100}%"></div>
                    <span class="stat-value">${playerStats.diplomacy}</span>
                </div>
            </div>
            <div class="stat">
                <span class="stat-label">خزانه:</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(playerStats.treasury / 1000) * 100}%"></div>
                    <span class="stat-value">${playerStats.treasury}</span>
                </div>
            </div>
            <div class="stat">
                <span class="stat-label">متحدان:</span>
                <div class="allies-container">
                    <span class="stat-value">${playerStats.allies.join(', ') || 'هیچ'}</span>
                </div>
            </div>
        `;

        document.body.insertBefore(container, document.getElementById('text'));
    } else {
        const updateProgressBar = (index, value, max) => {
            const bar = statsContainer.querySelector(`.stat:nth-child(${index}) .progress`);
            bar.style.width = `${(value / max) * 100}%`;
        };

        updateProgressBar(1, playerStats.military, 100);
        updateProgressBar(2, playerStats.diplomacy, 100);
        updateProgressBar(3, playerStats.treasury, 1000);
        statsContainer.querySelector('.stat:nth-child(4) .stat-value').textContent = playerStats.allies.join(', ') || 'هیچ';
    }
}

function showNode(nodeId) {
    window.location.hash = nodeId;

    currentNode = story.nodes[nodeId];

    if (currentNode.effects) {
        if (currentNode.effects.military) playerStats.military += currentNode.effects.military;
        if (currentNode.effects.diplomacy) playerStats.diplomacy += currentNode.effects.diplomacy;
        if (currentNode.effects.treasury) playerStats.treasury += currentNode.effects.treasury;
        if (currentNode.effects.allies) playerStats.allies = [...new Set([...playerStats.allies, ...currentNode.effects.allies])];
    }

    updateStats();

    document.getElementById('text').innerText = currentNode.text;
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    currentNode.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option';

        if (opt.requires) {
            const canChoose = Object.entries(opt.requires).every(([stat, value]) => playerStats[stat] >= value);
            if (!canChoose) {
                btn.classList.add('disabled');
                btn.disabled = true;
                btn.title = 'نیازمندی‌های کافی را ندارید';
                btn.style.cursor = 'not-allowed';
            }
        }

        btn.innerText = opt.text;
        btn.onclick = () => showNode(opt.next);
        optionsContainer.appendChild(btn);
    });

    if (currentNode.title) {
        document.querySelectorAll('h2').forEach(el => el.remove());
        const titleElement = document.createElement('h2');
        titleElement.innerText = currentNode.title;
        document.getElementById('text').insertAdjacentElement('beforebegin', titleElement);
    }

    try {
        const imageContainer = document.getElementById('image');
        imageContainer.style.display = 'none';
        imageContainer.innerHTML = '';
        currentNode.image.forEach(img => {
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imageContainer.appendChild(imgElement);
        });
        if (currentNode.image.length > 0) {
            imageContainer.style.display = 'block';
        }
        const images = imageContainer.querySelectorAll('img');
        let imageText = null;
        let imageTextCount = 0;
        images.forEach(img => {
            let imageTextInnerText = currentNode.image_text[imageTextCount] || "تصویر";
            imageTextCount++;
            img.style.cursor = 'pointer';
            img.onclick = () => {
                const overlay = document.createElement('div');
                overlay.className = 'image-popup-overlay';

                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.className = 'image-popup-close';

                const fullImg = document.createElement('img');
                fullImg.src = img.src;
                fullImg.className = 'image-popup-img';

                const imageText = document.createElement('div');
                imageText.className = 'image-popup-text';
                imageText.innerText = imageTextInnerText;

                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        document.body.removeChild(overlay);
                    }
                };

                closeBtn.onclick = () => {
                    document.body.removeChild(overlay);
                };

                overlay.appendChild(closeBtn);
                overlay.appendChild(fullImg);
                overlay.appendChild(imageText);
                document.body.appendChild(overlay);
            };
        });
    }
    catch { }

    createBackgroundEffects();
}

const createBackgroundEffects = () => {
    const patterns = ['𐎠', '𐎡', '𐎢', '👑', '⚔️', '🏰', '🗡️', '🛡️', '✨', '🌟'];
    const state = {
        bgContainer: null,
        isAnimating: false,
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2
    };

    document.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });

    const createPattern = () => {
        const pattern = document.createElement('span');
        pattern.textContent = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.classList.add('background-pattern');

        const rotation = Math.random() * 360;
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        const scale = 0.6 + Math.random() * 0.8;
        const duration = 12 + Math.random() * 8;

        Object.assign(pattern.style, {
            position: 'fixed',
            color: 'var(--pattern-color, rgba(255, 215, 0, 0.4))',
            opacity: '0',
            fontSize: '28px',
            top: `${randomY}px`,
            left: `${randomX}px`,
            zIndex: '-1',
            userSelect: 'none',
            pointerEvents: 'none',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: `floatToMouse ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`
        });

        if (!document.querySelector('#background-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'background-animations';
            styleSheet.textContent = `
                @keyframes floatToMouse {
                    0% { 
                        transform: translate(0, 0) rotate(${rotation}deg) scale(${scale});
                        filter: hue-rotate(0deg);
                    }
                    50% { 
                        transform: translate(calc(${state.mouseX}px - 50%), calc(${state.mouseY}px - 50%)) rotate(${rotation + 180}deg) scale(${scale * 1.2});
                        filter: hue-rotate(180deg);
                    }
                    100% { 
                        transform: translate(0, 0) rotate(${rotation + 360}deg) scale(${scale});
                        filter: hue-rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }

        requestAnimationFrame(() => {
            pattern.style.opacity = '0.6';
        });

        const updatePosition = () => {
            if (!pattern.isConnected) return;

            const rect = pattern.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const angleToMouse = Math.atan2(state.mouseY - centerY, state.mouseX - centerX);
            const distanceToMouse = Math.hypot(state.mouseX - centerX, state.mouseY - centerY);

            const moveX = Math.cos(angleToMouse) * (distanceToMouse * 0.03);
            const moveY = Math.sin(angleToMouse) * (distanceToMouse * 0.03);

            pattern.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation + (Date.now() / 40)}deg) scale(${scale})`;
            pattern.style.filter = `hue-rotate(${(Date.now() / 50) % 360}deg)`;

            requestAnimationFrame(updatePosition);
        };

        updatePosition();

        setTimeout(() => {
            if (pattern.isConnected) {
                pattern.style.opacity = '0';
                pattern.style.transform = `scale(0.1)`;
                setTimeout(() => pattern?.remove(), 800);
            }
        }, duration * 1000);

        return pattern;
    };

    const spawnPatterns = () => {
        if (!state.bgContainer) return;

        const numPatterns = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPatterns; i++) {
            setTimeout(() => {
                state.bgContainer.appendChild(createPattern());
            }, i * 200);
        }

        setTimeout(spawnPatterns, 2500 + Math.random() * 1500);
    };

    const initializeBackground = () => {
        if (state.bgContainer) {
            state.bgContainer.style.opacity = '0';
            setTimeout(() => state.bgContainer.remove(), 500);
        }

        state.bgContainer = document.createElement('div');
        Object.assign(state.bgContainer.style, {
            position: 'fixed',
            inset: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '-1',
            overflow: 'hidden',
            pointerEvents: 'none',
            perspective: '1500px',
            transition: 'opacity 0.5s ease',
            opacity: '0'
        });

        document.body.appendChild(state.bgContainer);
        requestAnimationFrame(() => {
            state.bgContainer.style.opacity = '1';
        });
        spawnPatterns();
    };

    initializeBackground();
    return () => {
        if (state.bgContainer) {
            state.bgContainer.style.opacity = '0';
            setTimeout(() => state.bgContainer?.remove(), 500);
        }
    };
};

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && story.nodes[hash]) {
        showNode(hash);
    }
});

const hash = window.location.hash.slice(1);
if (hash) {
    document.getElementById('start-game').innerHTML = "ادامه بازی";
}

document.getElementById("start-game").onclick = () => {
    loadStats();
    loadStory();
}