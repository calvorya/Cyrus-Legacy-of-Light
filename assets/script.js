let currentNode = null;
let story = {};

async function loadStory() {
    document.getElementById("start").style.display = "none";
    const res = await fetch('./assets/story.json');
    story = await res.json();

    const hash = window.location.hash.slice(1);
    if (hash) {
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.innerText = 'ادامه بازی';
        }
    }
    if (hash && story.nodes[hash]) {
        showNode(hash);
    } else {
        showNode(story.start);
    }
}

function showNode(nodeId) {
    window.location.hash = nodeId;

    currentNode = story.nodes[nodeId];
    document.getElementById('text').innerText = currentNode.text;
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    currentNode.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.innerText = opt.text;
        btn.onclick = () => showNode(opt.next);
        optionsContainer.appendChild(btn);
    });
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
        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.onclick = () => {
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '1000';

                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '20px';
                closeBtn.style.right = '20px';
                closeBtn.style.background = 'none';
                closeBtn.style.border = 'none';
                closeBtn.style.color = 'white';
                closeBtn.style.fontSize = '30px';
                closeBtn.style.cursor = 'pointer';

                const fullImg = document.createElement('img');
                fullImg.src = img.src;
                fullImg.style.maxWidth = '90%';
                fullImg.style.maxHeight = '90%';
                fullImg.style.objectFit = 'contain';

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
                document.body.appendChild(overlay);
            };
        });
    }
    catch { }


    createBackgroundEffects();
}
const createBackgroundEffects = () => {
    const patterns = ['𐎠', '𐎡', '𐎢'];
    let bgContainer = null;
    let isAnimating = false;

    const createPattern = (x, y) => {
        const span = document.createElement('span');
        span.textContent = patterns[Math.floor(Math.random() * patterns.length)];
        span.style.cssText = `
            position: fixed;
            color: #e8d5a9;
            opacity: 0;
            font-size: 24px;
            top: ${y}px;
            left: ${x}px;
            z-index: -1;
            user-select: none;
            pointer-events: none;
            text-shadow: 0 0 12px rgba(232, 213, 169, 0.6);
            transform: scale(0.8);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        requestAnimationFrame(() => {
            span.style.opacity = '0.4';
            span.style.transform = 'scale(1.2)';
        });

        setTimeout(() => {
            span.style.opacity = '0';
            span.style.transform = 'scale(0.6)';
            setTimeout(() => span?.remove(), 600);
        }, 2000);

        return span;
    };

    const handleMouseMove = (e) => {
        if (isAnimating) return;
        isAnimating = true;

        const radius = 1;
        const spacing = 40;

        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (Math.random() > 0.7) continue;

                const offsetX = e.clientX + (i * spacing) + (Math.random() * 8 - 4);
                const offsetY = e.clientY + (j * spacing) + (Math.random() * 8 - 4);

                bgContainer.appendChild(createPattern(offsetX, offsetY));
            }
        }

        setTimeout(() => isAnimating = false, 80);
    };

    const initializeBackground = () => {
        if (bgContainer) document.body.removeChild(bgContainer);

        bgContainer = document.createElement('div');
        bgContainer.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            overflow: hidden;
            pointer-events: none;
            perspective: 800px;
        `;

        document.body.appendChild(bgContainer);
        document.addEventListener('mousemove', handleMouseMove);
    };

    initializeBackground();
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        bgContainer?.remove();
    };
};

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && story.nodes[hash]) {
        showNode(hash);
    }
});

document.getElementById("start-game").onclick = () => {
    loadStory();
}