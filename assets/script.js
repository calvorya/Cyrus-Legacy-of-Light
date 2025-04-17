let currentNode = null;
let story = {};
let playerStats = {
    military: 5,
    diplomacy: 15,
    treasury: 100,
    allies: [],
    skills: []
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
            <div class="stat">
                <span class="stat-label">مهارت‌ها:</span>
                <div class="skills-container">
                    <span class="stat-value">${playerStats.skills.join(', ') || 'هیچ'}</span>
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
        statsContainer.querySelector('.stat:nth-child(5) .stat-value').textContent = playerStats.skills.join(', ') || 'هیچ';
    }
}

function showNode(nodeId) {
    window.location.hash = nodeId;
    if (window.location.hash.slice(1) == "intro") {
        playerStats = {
            military: 5,
            diplomacy: 15,
            treasury: 100,
            allies: [],
            skills: []
        };
        saveStats();
    }
    currentNode = story.nodes[nodeId];

    if (currentNode.effects) {
        if (currentNode.effects.military) playerStats.military += currentNode.effects.military;
        if (currentNode.effects.diplomacy) playerStats.diplomacy += currentNode.effects.diplomacy;
        if (currentNode.effects.treasury) playerStats.treasury += currentNode.effects.treasury;
        if (currentNode.effects.allies) playerStats.allies = [...new Set([...playerStats.allies, ...currentNode.effects.allies])];
        if (currentNode.effects.skills) playerStats.skills = [...new Set([...playerStats.skills, ...currentNode.effects.skills])];
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

}

const createBackgroundEffects = () => {
    if (document.querySelector('.pattern-container')) {
        document.querySelector(".pattern").forEach(el => el.style.animationDelay = `${Math.random() * 2}s`);
        return;
    };
    const patterns = ['👑', '⚔️', '🏰', '🗡️', '🛡️', '✨', '🌟', ''];

    const patternContainer = document.createElement('div');
    patternContainer.className = 'pattern-container';

    patterns.forEach(pattern => {
        const patternElement = document.createElement('span');
        patternElement.className = 'pattern';
        patternElement.textContent = pattern;
        patternElement.style.fontSize = `${Math.random() * 2 + 1}em`;
        patternElement.style.left = `${Math.random() * 100}%`;
        patternElement.style.top = `${Math.random() * 100}%`;
        patternElement.style.animationDelay = `${Math.random() * 5}s`;
        patternElement.style.rotate = `${Math.random() * 360}deg`;
        patternElement.style.setProperty('--random-x', `${Math.random() * 1000}`);
        patternElement.style.setProperty('--random-y', `${Math.random() * 1000}`);
        patternElement.style.transform = `translate(${Math.random() * 100}px, ${Math.random() * 100}px)`;
        patternContainer.appendChild(patternElement);
    });

    document.body.appendChild(patternContainer);
};
window.addEventListener('load', () => {
    createBackgroundEffects();
});
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