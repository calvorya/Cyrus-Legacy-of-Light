let currentNode = null;
let story = {};

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
        let imageText = null;
        let imageTextCount = 0;
        images.forEach(img => {
            let imageTextInnerText = currentNode.image_text[imageTextCount] || "تصویر";
            imageTextCount++;
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

                const imageText = document.createElement('div');
                imageText.style.position = 'absolute';
                imageText.style.bottom = '20px';
                imageText.style.left = '50%';
                imageText.style.transform = 'translateX(-50%)';
                imageText.style.color = 'white';
                imageText.style.backgroundColor = 'rgba(0,0,0,0.7)';
                imageText.style.padding = '10px 20px';
                imageText.style.borderRadius = '5px';
                imageText.style.fontSize = '16px';
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
    const patterns = ['𐎠', '𐎡', '𐎢', '👑', '⚔️', '🏰', '🗡️', '🛡️'];
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
        const scale = 0.8 + Math.random() * 0.8;
        const duration = 15 + Math.random() * 10; 

        Object.assign(pattern.style, {
            position: 'fixed',
            color: 'var(--pattern-color, #d4c8a1)',
            opacity: '0',
            fontSize: '24px',
            top: `${randomY}px`,
            left: `${randomX}px`,
            zIndex: '-1',
            userSelect: 'none',
            pointerEvents: 'none',
            textShadow: '0 0 12px rgba(212, 200, 161, 0.6)',
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transition: 'all 3s ease-out', 
            animation: `floatToMouse ${duration}s ease-in-out infinite`
        });

        if (!document.querySelector('#background-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'background-animations';
            styleSheet.textContent = `
                @keyframes floatToMouse {
                    0% { transform: translate(0, 0) rotate(${rotation}deg) scale(${scale}); }
                    50% { transform: translate(calc(${state.mouseX}px - 50%), calc(${state.mouseY}px - 50%)) rotate(${rotation + 180}deg) scale(${scale}); }
                    100% { transform: translate(0, 0) rotate(${rotation + 360}deg) scale(${scale}); }
                }
            `;
            document.head.appendChild(styleSheet);
        }

        requestAnimationFrame(() => {
            pattern.style.opacity = '0.4';
        });

        const updatePosition = () => {
            if (!pattern.isConnected) return;
            
            const rect = pattern.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angleToMouse = Math.atan2(state.mouseY - centerY, state.mouseX - centerX);
            const distanceToMouse = Math.hypot(state.mouseX - centerX, state.mouseY - centerY);
            
            const moveX = Math.cos(angleToMouse) * (distanceToMouse * 0.02);
            const moveY = Math.sin(angleToMouse) * (distanceToMouse * 0.02);
            
            pattern.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation + (Date.now() / 50)}deg) scale(${scale})`;
            
            requestAnimationFrame(updatePosition);
        };

        updatePosition();

        setTimeout(() => {
            pattern?.remove();
        }, duration * 1000);

        return pattern;
    };

    const spawnPatterns = () => {
        if (!state.bgContainer) return;
        
        const numPatterns = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPatterns; i++) {
            state.bgContainer.appendChild(createPattern());
        }

        setTimeout(spawnPatterns, 3000 + Math.random() * 2000);
    };

    const initializeBackground = () => {
        if (state.bgContainer) state.bgContainer.remove();

        state.bgContainer = document.createElement('div');
        Object.assign(state.bgContainer.style, {
            position: 'fixed',
            inset: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '-1',
            overflow: 'hidden',
            pointerEvents: 'none',
            perspective: '1000px'
        });

        document.body.appendChild(state.bgContainer);
        spawnPatterns();
    };

    initializeBackground();
    return () => {
        state.bgContainer?.remove();
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
    loadStory();
}