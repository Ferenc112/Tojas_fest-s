const rajzSzinezes = document.getElementById('rajz_szinezes');
const szinezesGomb = document.getElementById('szinezes_gomb');
const torlesGomb = document.getElementById('torles_gomb');
const tojasValtoGomb = document.getElementById('tojas_valto');
const paletta = document.getElementById('paletta');
const selectedColorLabel = document.getElementById('selectedColor');
const mentesGomb = document.getElementById('mentes');

let selectedColor = '#f44336';
let eggItems = [];
const segmentCount = 8;

const eggSegments = Array.from({ length: segmentCount }, (_, i) => ({
    id: `stripe-${i}`,
    fill: '#ffffff'
}));

const eggOutlinePath = 'M200,40 C270,40 340,130 340,220 C340,310 270,380 200,380 C130,380 60,310 60,220 C60,130 130,40 200,40 Z';


function drawEgg() {
    rajzSzinezes.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '360');
    svg.setAttribute('height', '420');
    svg.setAttribute('viewBox', '0 0 400 420');

    eggItems = [];

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'eggClip');

    const eggOutlineForClip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    eggOutlineForClip.setAttribute('d', eggOutlinePath);

    clipPath.appendChild(eggOutlineForClip);
    defs.appendChild(clipPath);
    svg.appendChild(defs);

    const stripeHeight = 340 / segmentCount;
    for (let i = 0; i < segmentCount; i++) {
        const seg = eggSegments[i];
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '60');
        rect.setAttribute('y', `${40 + i * stripeHeight}`);
        rect.setAttribute('width', '280');
        rect.setAttribute('height', `${stripeHeight}`);
        rect.setAttribute('fill', seg.fill);
        rect.setAttribute('clip-path', 'url(#eggClip)');
        rect.setAttribute('class', 'egg-segment');
        rect.dataset.segmentId = seg.id;

        rect.addEventListener('click', () => {
            seg.fill = selectedColor;
            rect.setAttribute('fill', selectedColor);
        });

        svg.appendChild(rect);
        eggItems.push(rect);
    }

    const eggOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    eggOutline.setAttribute('d', eggOutlinePath);
    eggOutline.setAttribute('fill', 'none');
    eggOutline.setAttribute('stroke', '#444');
    eggOutline.setAttribute('stroke-width', '2');
    svg.appendChild(eggOutline);

    rajzSzinezes.appendChild(svg);
}

function clearEgg() {
    for (const seg of eggSegments) {
        seg.fill = '#ffffff';
    }
    drawEgg();
}

function fillEgg() {
    for (const seg of eggSegments) {
        seg.fill = selectedColor;
    }
    drawEgg();
}

function randomizeEgg() {
    const colors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#ff9800', '#00bcd4'];
    for (const seg of eggSegments) {
        seg.fill = colors[Math.floor(Math.random() * colors.length)];
    }
    drawEgg();
}

function createPalette() {
    const buttons = paletta.querySelectorAll('.color-btn');

    buttons.forEach(btn => {
        if (btn.dataset.color === selectedColor) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }

        btn.addEventListener('click', () => {
            selectedColor = btn.dataset.color;
            selectedColorLabel.textContent = `Választott: ${selectedColor}`;

            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
}

szinezesGomb.addEventListener('click', fillEgg);
torlesGomb.addEventListener('click', clearEgg);
tojasValtoGomb.addEventListener('click', randomizeEgg);
mentesGomb.addEventListener('click', saveEggAsImage);

function saveEggAsImage() {
    const svg = rajzSzinezes.querySelector('svg');
    if (!svg) {
        alert('Nincs menthető tojás, először csinálj egyet.');
        return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
        source = source.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const width = parseInt(svg.getAttribute('width')) || 360;
        const height = parseInt(svg.getAttribute('height')) || 420;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);

        const pngDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = 'tojas.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tojas.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.src = url;
}

createPalette();
clearEgg();
