let currentNode = null;
let story = {};

async function loadStory() {
    document.getElementById("start").style.display = "none";
    const res = await fetch('/assets/story.json');
    story = await res.json();
    showNode(story.start);
}

function showNode(nodeId) {
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
}

document.getElementById("start-game").onclick = () => {
    loadStory();
}