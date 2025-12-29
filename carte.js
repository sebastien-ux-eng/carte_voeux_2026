const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

let photo = null;
let photoX = 0;
let photoY = 0;
let photoScale = 1;

// Frame (portrait)
const frameW = 220;
const frameH = 320;
const frameX = (canvas.width - frameW) / 2;
const frameY = 70;

// SLOGANS IA (simulée)
const slogans = [
    "2026, l’année de toutes les opportunités",
    "Un nouvel avenir commence maintenant",
    "Osez innover en 2026",
    "Construisons ensemble un futur meilleur",
    "2026 : progrès, paix et succès",
    "Une nouvelle année, une nouvelle vision"
];

function generateSlogan() {
    const random = slogans[Math.floor(Math.random() * slogans.length)];
    document.getElementById("slogan").value = random;
    drawCard();
}

// Messages IA adaptées
const messagesIA = {
    classique: [
        "Que 2026 vous apporte sérénité, chaleur humaine et doux souvenirs.",
        "Que cette nouvelle année vous comble de paix, de santé et de joie.",
        "Pour 2026 : de la simplicité, du bonheur partagé et de beaux accomplissements."
    ],
    professionnel: [
        "2026 : réussite, collaborations fortes et projets inspirants.",
        "Que votre activité s’épanouisse et que vos idées se transforment en succès.",
        "Nous vous souhaitons une année d’innovations et d’opportunités concrètes." 
    ],
    moderne: [
        "Cap sur 2026 : créativité, audace et belles aventures numériques.",
        "Faites de 2026 une année d’impact et d’originalité.",
        "Que 2026 soit synonyme de découvertes, d’énergie et d’inspiration."
    ]
};

function generateMessage() {
    const style = document.getElementById("style").value || 'classique';
    const list = messagesIA[style] || messagesIA.classique;
    const random = list[Math.floor(Math.random() * list.length)];
    document.getElementById("message").value = random;
    drawCard();
}

function loadImage(event) {
    const reader = new FileReader();
    reader.onload = () => {
        photo = new Image();
        photo.onload = () => {
            // initialize scale to cover frame
            photoScale = Math.max(frameW / photo.width, frameH / photo.height);
            photoX = frameX + (frameW - photo.width * photoScale) / 2;
            photoY = frameY + (frameH - photo.height * photoScale) / 2;
            drawCard();
            // try face detection (models may load later)
            detectFacesWithRetry(photo);
        };
        photo.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function detectFacesWithRetry(img, attempt = 0) {
    if (window.faceapi && faceapi.nets && faceapi.nets.tinyFaceDetector && faceapi.nets.tinyFaceDetector.params) {
        faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .then(results => {
                if (results && results.length > 0) {
                    // focus on first face
                    const box = results[0].box;
                    const faceCenterX = box.x + box.width / 2;
                    const faceCenterY = box.y + box.height / 2;
                    // desired: make face occupy ~60% of frame height
                    const desiredScale = (0.6 * frameH) / box.height;
                    // ensure not smaller than cover scale
                    const coverScale = Math.max(frameW / photo.width, frameH / photo.height);
                    photoScale = Math.max(desiredScale, coverScale);
                    // position so face center is centered in frame
                    photoX = frameX + frameW / 2 - faceCenterX * photoScale;
                    photoY = frameY + frameH / 2 - faceCenterY * photoScale;
                    drawCard();
                }
            })
            .catch(() => {});
    } else if (attempt < 6) {
        setTimeout(() => detectFacesWithRetry(img, attempt + 1), 500);
    }
}

function drawRoundedImage(img, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
    // This helper only creates a clipped rounded rect. Actual image drawn by caller.
}

function drawPhotoInFrame() {
    if (!photo) return;
    ctx.save();
    // rounded frame path
    ctx.beginPath();
    const r = 18;
    ctx.moveTo(frameX + r, frameY);
    ctx.lineTo(frameX + frameW - r, frameY);
    ctx.quadraticCurveTo(frameX + frameW, frameY, frameX + frameW, frameY + r);
    ctx.lineTo(frameX + frameW, frameY + frameH - r);
    ctx.quadraticCurveTo(frameX + frameW, frameY + frameH, frameX + frameW - r, frameY + frameH);
    ctx.lineTo(frameX + r, frameY + frameH);
    ctx.quadraticCurveTo(frameX, frameY + frameH, frameX, frameY + frameH - r);
    ctx.lineTo(frameX, frameY + r);
    ctx.quadraticCurveTo(frameX, frameY, frameX + r, frameY);
    ctx.closePath();
    ctx.clip();

    const drawW = photo.width * photoScale;
    const drawH = photo.height * photoScale;
    ctx.drawImage(photo, photoX, photoY, drawW, drawH);
    ctx.restore();
}

function drawCard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current style
    const style = document.getElementById("style").value || "classique";

    // Apply style-specific gradient and appearance
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (style === "classique") {
        grad.addColorStop(0, "#ffd89b");
        grad.addColorStop(0.5, "#ffccaa");
        grad.addColorStop(1, "#ffb366");
    } else if (style === "professionnel") {
        grad.addColorStop(0, "#1e3c72");
        grad.addColorStop(0.5, "#2a5298");
        grad.addColorStop(1, "#0d0f2d");
    } else if (style === "moderne") {
        grad.addColorStop(0, "#00d4ff");
        grad.addColorStop(0.5, "#0099ff");
        grad.addColorStop(1, "#6600ff");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Photo (above the year)
    if (photo) {
        drawPhotoInFrame();
    }

    // Textes
    ctx.fillStyle = style === "classique" ? "#000" : "#ffffff";
    ctx.textAlign = "center";

    const titleY = frameY - 20; // move year above frame
    const sloganY = frameY + frameH + 30;
    const nameY = sloganY + 36; // name before message
    const messageY = nameY + 28;
    const footerY = canvas.height - 15;

    ctx.font = "bold 26px Segoe UI";
    ctx.fillText("🎉 Bonne Année 2026 🎊", 210, titleY);

    ctx.font = "18px Segoe UI";
    ctx.fillText(document.getElementById("slogan").value || "", 210, sloganY);

    ctx.font = "bold 18px Segoe UI";
    ctx.fillText(document.getElementById("name").value || "", 210, nameY);

    ctx.font = "16px Segoe UI";
    const msg = document.getElementById("message").value || "";
    drawCenteredText(msg, 210, messageY, 320, 22);

    ctx.font = "12px Segoe UI";
    ctx.fillText("TechX • Solutions Numériques", 210, footerY);
}

// Mise à jour auto
["name", "message", "slogan"].forEach(id => {
    document.getElementById(id).addEventListener("input", drawCard);
});

drawCard();

// Téléchargement
function downloadCard() {
    const link = document.createElement("a");
    link.download = "Carte_Voeux_2026_TechX.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
}

function drawCenteredText(text, centerX, startY, maxWidth, lineHeight) {
    if (!text) return;
    ctx.textAlign = 'center';
    const words = text.split(' ');
    let line = '';
    let y = startY;
    const lines = [];
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line.trim());
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    lines.forEach((l, i) => {
        ctx.fillText(l, centerX, startY + i * lineHeight);
    });
}

// Drag & wheel controls for framing (user scrolls over canvas)
let isDragging = false;
let lastPos = { x: 0, y: 0 };
canvas.addEventListener('mousedown', e => {
    if (!photo) return;
    isDragging = true;
    lastPos = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mousemove', e => {
    if (!isDragging || !photo) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    photoX += dx;
    photoY += dy;
    lastPos = { x: e.clientX, y: e.clientY };
    drawCard();
});
window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('wheel', e => {
    if (!photo) return;
    // vertical scroll moves image; ctrl+wheel zooms
    if (e.ctrlKey) {
        const factor = e.deltaY < 0 ? 1.05 : 0.95;
        const prevScale = photoScale;
        photoScale *= factor;
        // adjust position so zoom focuses on frame center
        const cx = frameX + frameW / 2;
        const cy = frameY + frameH / 2;
        photoX = cx - ((cx - photoX) * (photoScale / prevScale));
        photoY = cy - ((cy - photoY) * (photoScale / prevScale));
    } else {
        photoY -= e.deltaY * 0.6;
    }
    drawCard();
    e.preventDefault();
}, { passive: false });

// Auto-update inputs
["name", "message", "slogan"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", drawCard);
});

drawCard();

// Téléchargement
function downloadCard() {
    const link = document.createElement("a");
    link.download = "Carte_Voeux_2026_TechX.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
}