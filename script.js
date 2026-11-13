// Data & Asset Default Bawaan (Format SVG Ringan)
const defaultAvatar = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><circle cx="100" cy="75" r="40" fill="#06b6d4"/><path d="M30 190 C30 130, 170 130, 170 190" fill="#06b6d4"/></svg>`);
const defaultBg = "";
const defaultProjImg = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#0f172a"/><circle cx="200" cy="100" r="20" fill="#334155"/><path d="M185 100 L215 100 M200 85 L200 115" stroke="#94a3b8" stroke-width="4"/></svg>`);

const themes = [
    { name: "Cyan Network", hex: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)" },
    { name: "Matrix Green", hex: "#10b981", glow: "rgba(16, 185, 129, 0.35)" },
    { name: "Cisco Blue", hex: "#3b82f6", glow: "rgba(59, 130, 246, 0.35)" },
    { name: "Fiber Orange", hex: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)" },
    { name: "Hacker Purple", hex: "#a855f7", glow: "rgba(168, 85, 247, 0.35)" }
];

const iconList = [
    "fa-network-wired", "fa-server", "fa-ethernet", "fa-wifi", "fa-microchip", "fa-database",
    "fa-shield-halved", "fa-laptop-code", "fa-code-branch", "fa-terminal", "fa-cloud",
    "fa-envelope", "fa-phone", "fa-brands fa-whatsapp", "fa-brands fa-github", "fa-brands fa-linkedin", "fa-brands fa-instagram"
];

// Struktur Penyimpanan Data
let db = JSON.parse(localStorage.getItem("tjkt_master")) || {
    avatar: defaultAvatar, bg: defaultBg, themeIdx: 0, texts: {}, icons: {},
    projects: [
        { id: 1, title: "Topologi Lab Komputer", tag: "MIKROTIK", image: defaultProjImg }
    ]
};

let isEditMode = false;
let targetIconEl = null;
let mouse = { x: null, y: null };

/* --- 1. INISIALISASI & RENDER --- */
function init() {
    applyTheme();
    document.getElementById("profile-img").src = db.avatar;
    if(db.bg) document.getElementById("hero-bg").style.backgroundImage = `url(${db.bg})`;
    
    // Terapkan Teks
    document.querySelectorAll(".editable").forEach(el => {
        const key = el.getAttribute("data-key");
        if (db.texts[key]) el.innerText = db.texts[key];
    });

    // Terapkan Ikon
    document.querySelectorAll(".edit-icon").forEach(el => {
        const key = el.getAttribute("data-icon");
        if (db.icons[key]) el.className = `edit-icon fas ${db.icons[key]}`;
        
        el.onclick = function() {
            if (!isEditMode) return;
            targetIconEl = this;
            renderIconModal();
            document.getElementById("modal-ikon").classList.add("active");
        };
    });

    renderProjects();
    typeEffect();
}

/* --- 2. SISTEM TEMA --- */
function applyTheme() {
    document.documentElement.style.setProperty("--accent", themes[db.themeIdx].hex);
    document.documentElement.style.setProperty("--accent-glow", themes[db.themeIdx].glow);
}
function cycleTheme() {
    db.themeIdx = (db.themeIdx + 1) % themes.length;
    applyTheme();
    showToast(`Tema: ${themes[db.themeIdx].name}`);
}

/* --- 3. ANIMASI & KANVAS (PARTIKEL) --- */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = document.getElementById('beranda').offsetHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
        ctx.fillStyle = themes[db.themeIdx].hex; ctx.fill();
    }
}
for (let i = 0; i < 45; i++) particles.push(new Particle());

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        if (mouse.x != null) {
            let dx = mouse.x - particles[i].x, dy = mouse.y - particles[i].y, dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 130) {
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist/130})`; ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}
animateCanvas();

// Efek Ketik
const roles = ["Junior Network Administrator", "IT Support Specialist", "Linux Server Admin"];
let charIdx = 0, roleIdx = 0, isDel = false;
function typeEffect() {
    const txt = roles[roleIdx];
    document.getElementById("typing-text").textContent = txt.substring(0, isDel ? charIdx-1 : charIdx+1);
    charIdx += isDel ? -1 : 1;
    if (!isDel && charIdx === txt.length) { isDel = true; setTimeout(typeEffect, 2000); return; }
    if (isDel && charIdx === 0) { isDel = false; roleIdx = (roleIdx + 1) % roles.length; }
    setTimeout(typeEffect, isDel ? 40 : 80);
}

/* --- 4. SISTEM EDIT & SAVE (DENGAN KOMPRESI) --- */
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle("edit-mode", isEditMode);
    document.querySelectorAll(".editable").forEach(el => el.contentEditable = isEditMode);
    document.querySelector("#toggle-edit-btn span").textContent = isEditMode ? "Tutup Edit" : "Mode Edit";
    document.querySelector("#toggle-edit-btn i").className = isEditMode ? "fas fa-times" : "fas fa-sliders-h";
    if (!isEditMode) saveData(false);
}

function saveData(notify = true) {
    document.querySelectorAll(".editable").forEach(el => {
        db.texts[el.getAttribute("data-key")] = el.innerText.trim();
    });
    try {
        localStorage.setItem("tjkt_master", JSON.stringify(db));
        if(notify) showToast("Tersimpan Permanen!");
    } catch (e) {
        alert("Memori browser penuh! Hapus beberapa foto proyek untuk menyimpan.");
    }
}

function resetData() {
    if(confirm("Kembalikan ke pengaturan awal? Semua foto akan terhapus.")) {
        localStorage.removeItem("tjkt_master"); location.reload();
    }
}

function showToast(msg) {
    const t = document.getElementById("toast"); t.textContent = msg;
    t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2500);
}

// Kompresi Gambar agar tidak cepat penuh
function compressImage(file, maxW, callback) {
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width, h = img.height;
            if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL("image/jpeg", 0.7)); // Kompres ke JPEG kualitas 70%
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

document.getElementById("input-avatar").addEventListener("change", e => {
    if(e.target.files[0]) compressImage(e.target.files[0], 400, res => { db.avatar = res; init(); saveData(); });
});
document.getElementById("input-bg").addEventListener("change", e => {
    if(e.target.files[0]) compressImage(e.target.files[0], 1200, res => { db.bg = res; init(); saveData(); });
});

/* --- 5. MODAL IKON & PROYEK --- */
function renderIconModal() {
    const grid = document.getElementById("icon-grid"); grid.innerHTML = "";
    iconList.forEach(cls => {
        const btn = document.createElement("button"); btn.className = "icon-btn";
        btn.innerHTML = `<i class="${cls.includes('brands') ? cls : 'fas ' + cls}"></i>`;
        btn.onclick = () => {
            db.icons[targetIconEl.getAttribute("data-icon")] = cls;
            document.getElementById("modal-ikon").classList.remove("active"); init(); saveData();
        };
        grid.appendChild(btn);
    });
}

function renderProjects() {
    const grid = document.getElementById("projects-grid"); grid.innerHTML = "";
    db.projects.forEach(p => {
        grid.innerHTML += `
            <div class="glass-card project-card">
                <button class="btn-delete-proj" onclick="deleteProject(${p.id})"><i class="fas fa-trash"></i></button>
                <img src="${p.image}" class="project-thumb">
                <div class="project-body">
                    <span class="project-tag">${p.tag}</span>
                    <h3 style="font-size:16px; margin-bottom:5px;">${p.title}</h3>
                </div>
            </div>`;
    });
}

document.getElementById("form-proyek").addEventListener("submit", e => {
    e.preventDefault();
    const file = document.getElementById("proj-img").files[0];
    if (file) {
        compressImage(file, 600, imgData => {
            db.projects.unshift({
                id: Date.now(),
                title: document.getElementById("proj-title").value,
                tag: document.getElementById("proj-tag").value.toUpperCase(),
                image: imgData
            });
            document.getElementById("modal-proyek").classList.remove("active");
            document.getElementById("form-proyek").reset();
            renderProjects(); saveData();
        });
    }
});

function deleteProject(id) {
    if(confirm("Hapus proyek ini?")) { db.projects = db.projects.filter(p => p.id !== id); renderProjects(); saveData(); }
}

window.onload = init;
