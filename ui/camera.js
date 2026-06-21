/**
 * camera.js
 * Logika Kontrol Kamera Real-Time Hardware & Pemindaian AI Seketika
 * GlowDiary Project - Diadaptasi dari Modul analyze.html
 */

let localStream = null;

// 1. Membuka Aliran Kamera Perangkat Pengguna secara Real-Time
function startSkinCamera() {
    const video = document.getElementById('webcam');
    const viewContainer = document.getElementById('scan-view-container');
    const btnStart = document.getElementById('btn-start-scan');
    const btnCapture = document.getElementById('btn-capture-scan');
    const scanResults = document.getElementById('scan-results');

    if (!video || !viewContainer) return;

    // Sembunyikan hasil lama jika ada
    if (scanResults) scanResults.classList.add('hidden');

    // Meminta izin ke sistem operasi untuk menggunakan kamera depan (user)
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
    })
    .then(stream => {
        localStream = stream;
        video.srcObject = stream;
        
        // Atur visibilitas UI komponen kamera aktif
        viewContainer.classList.remove('hidden');
        btnStart.innerHTML = `<i class="fa-solid fa-rotate mr-1"></i> Reset Kamera`;
        btnCapture.classList.remove('hidden');
    })
    .catch(err => {
        console.error("Gagal mengakses hardware kamera: ", err);
        alert("Gagal mengaktifkan kamera langsung! Pastikan Anda memberikan izin akses kamera di browser Anda atau periksa apakah perangkat Anda mendukung webcam.");
    });
}

// 2. Mengambil Gambar Bingkai (Frame) Kamera & Menjalankan Progress Bar AI
function captureAndAnalyzeSkin() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('scan-canvas');
    const loadingContainer = document.getElementById('scan-loading');
    const progressBar = document.getElementById('scan-progress-bar');
    const viewContainer = document.getElementById('scan-view-container');
    const btnCapture = document.getElementById('btn-capture-scan');

    if (!video || !canvas || !loadingContainer || !progressBar) return;

    // Ambil gambar freeze frame dari video masukkan ke canvas
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.translate(canvas.width, 0); // Balik horizontal agar tidak mirror
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Hentikan aliran kamera hardware agar hemat baterai/daya HP
    stopSkinCameraStream();
    viewContainer.classList.add('hidden');
    btnCapture.classList.add('hidden');

    // Tampilkan Loading Bar Animasi Pemindaian sesuai logika analyze.html
    loadingContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 18 + 5; // Penambahan persentase secara acak
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Selesai scanning, munculkan card report hasil analisa
            setTimeout(() => {
                loadingContainer.classList.add('hidden');
                displaySkinScanResults();
            }, 400);
        }
        progressBar.style.width = Math.min(progress, 100) + '%';
    }, 1500 / 10); // Durasi total simulasi loading sekitar 1.5 detik
}

// 3. Menghentikan Aliran Hardware Kamera secara Bersih
function stopSkinCameraStream() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
}

// 4. Kalkulasi Data Dinamis & Mengubah Teks Card Hasil Analisis Kulit + SIMPAN HISTORY
function displaySkinScanResults() {
    const resultsContainer = document.getElementById('scan-results');
    const dateEl = document.getElementById('scan-result-date');
    const moistureEl = document.getElementById('res-moisture');
    const oilEl = document.getElementById('res-oil');
    const barrierEl = document.getElementById('res-barrier');
    const recommendationEl = document.getElementById('res-recommendation');

    if (!resultsContainer) return;

    // Kalkulasi angka indikator secara dinamis agar terlihat real-time
    const moistureValue = Math.floor(Math.random() * (85 - 40 + 1)) + 40; // Rentang 40% - 85%
    const oilValue = Math.floor(Math.random() * (55 - 15 + 1)) + 15;      // Rentang 15% - 55%
    
    let barrierStatus = "Sangat Kuat ✨";
    let recommendationText = "Luar biasa! Struktur skin barrier Anda dalam kondisi optimal. Pertahankan hidrasi ini menggunakan pelembap ringan.";

    if (moistureValue < 55) {
        barrierStatus = "Dehidrasi ⚠️";
        recommendationText = "Kulit Anda menunjukkan tanda dehidrasi ringan. Sangat disarankan mengaplikasikan Essence Toner berlayer dan Serum Hyaluronic Acid malam ini.";
    } else if (oilValue > 45) {
        barrierStatus = "Berminyak (Sebum Tinggi)";
        recommendationText = "Kadar produksi kelenjar minyak berlebih di area pori-pori. Gunakan pencuci muka berbahan Salicylic Acid (BHA) untuk membersihkan sumbatan sebum.";
    }

    // Ambil tanggal dan waktu saat ini
    const now = new Date();
    const dateString = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";

    // Suntikkan data kalkulasi baru ke dalam dokumen HTML
    if (dateEl) dateEl.innerText = "Dianalisis pada: " + dateString + " - " + timeString;
    if (moistureEl) moistureEl.innerText = moistureValue + "%";
    if (oilEl) oilEl.innerText = oilValue + "%";
    if (barrierEl) {
        barrierEl.innerText = barrierStatus;
        barrierEl.className = moistureValue < 55 ? "text-xs font-bold text-amber-500 mt-1.5" : "text-xs font-bold text-emerald-600 mt-1.5";
    }
    if (recommendationEl) recommendationEl.innerText = recommendationText;

    // ================= LOGIKA CATAT HISTORY KE LOCALSTORAGE =================
    let scanHistory = JSON.parse(localStorage.getItem('glowdiary_scan_history')) || [];
    
    const newScanRecord = {
        id: "scan_" + Date.now(),
        tanggal: dateString,
        jam: timeString,
        moisture: moistureValue,
        oil: oilValue,
        barrier: barrierStatus,
        rekomendasi: recommendationText
    };
    
    scanHistory.unshift(newScanRecord);
    localStorage.setItem('glowdiary_scan_history', JSON.stringify(scanHistory));
    // ==============================================================================

    // Munculkan card hasil ke layar
    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Setiap kali ada scan baru, otomatis tutup dulu mode "lihat semua"
    // supaya pengguna tetap fokus melihat 5 riwayat teratas (termasuk yang baru).
    scanHistoryExpanded = false;

    // Pemicu Re-render: Memperbarui tampilan list riwayat secara instan tanpa reload halaman
    renderSkinScanHistoryAnalyze();
}

// 5. RENDERING LIST RIWAYAT DI HALAMAN YANG SAMA (TAB ANALYZE) — VERSI DROPDOWN
const SCAN_HISTORY_VISIBLE_LIMIT = 5; // Jumlah riwayat yang tampil sebelum di-dropdown
let scanHistoryExpanded = false; // Status dropdown: false = ringkas, true = tampil semua

// Dipanggil oleh tombol "Lihat Semua / Sembunyikan" pada daftar riwayat
function toggleScanHistoryDropdown() {
    scanHistoryExpanded = !scanHistoryExpanded;
    renderSkinScanHistoryAnalyze();

    // Jika baru saja di-collapse, scroll halus ke awal kotak riwayat agar tidak "melompat"
    if (!scanHistoryExpanded) {
        const box = document.getElementById('skin-scan-history-list');
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderSkinScanHistoryAnalyze() {
    const container = document.getElementById('skin-scan-history-list');
    const countEl = document.getElementById('scan-history-count');
    if (!container) return;

    let scanHistory = JSON.parse(localStorage.getItem('glowdiary_scan_history')) || [];

    if (countEl) countEl.innerText = `${scanHistory.length} Scan`;

    if (scanHistory.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 italic py-4 text-center">Belum ada catatan riwayat pemindaian.</p>';
        return;
    }

    const needsDropdown = scanHistory.length > SCAN_HISTORY_VISIBLE_LIMIT;
    const visibleHistory = (needsDropdown && !scanHistoryExpanded)
        ? scanHistory.slice(0, SCAN_HISTORY_VISIBLE_LIMIT)
        : scanHistory;

    const itemsHtml = visibleHistory.map(item => {
        let barrierBadgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
        if (item.barrier.includes("Dehidrasi")) {
            barrierBadgeClass = "bg-amber-50 text-amber-600 border-amber-100";
        } else if (item.barrier.includes("Berminyak")) {
            barrierBadgeClass = "bg-blue-50 text-blue-600 border-blue-100";
        }

        return `
            <div class="p-3 bg-gray-50/70 rounded-xl border border-gray-100 text-left transition hover:border-purple-200">
                <div class="flex justify-between items-center mb-1.5">
                    <div>
                        <p class="text-[11px] font-black text-gray-700">${item.tanggal}</p>
                        <p class="text-[9px] text-gray-400">${item.jam}</p>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${barrierBadgeClass}">
                        ${item.barrier}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                    <div><i class="fa-solid fa-droplet text-purple-400 mr-0.5"></i> Kelembapan: <strong class="text-gray-700">${item.moisture}%</strong></div>
                    <div><i class="fa-solid fa-oil-can text-amber-400 mr-0.5"></i> Minyak: <strong class="text-gray-700">${item.oil}%</strong></div>
                </div>
            </div>
        `;
    }).join('');

    let toggleHtml = '';
    if (needsDropdown) {
        const hiddenCount = scanHistory.length - SCAN_HISTORY_VISIBLE_LIMIT;
        toggleHtml = scanHistoryExpanded
            ? `
                <button onclick="toggleScanHistoryDropdown()" class="w-full mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-brand-dark bg-purple-100 hover:bg-purple-200 py-2.5 rounded-xl transition-all active:scale-[0.98]">
                    <i class="fa-solid fa-chevron-up text-[9px]"></i> Sembunyikan Riwayat
                </button>`
            : `
                <button onclick="toggleScanHistoryDropdown()" class="w-full mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-brand hover:text-brand-dark bg-purple-50 hover:bg-purple-100 py-2.5 rounded-xl transition-all active:scale-[0.98] border border-purple-100">
                    <i class="fa-solid fa-chevron-down text-[9px]"></i> Lihat ${hiddenCount} Riwayat Lainnya
                </button>`;
    }

    container.innerHTML = itemsHtml + toggleHtml;
}