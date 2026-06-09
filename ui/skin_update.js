/**
 * skin-update.js
 * Logika pembaharuan mandiri Tipe + Kondisi Kulit berbasis CHECKBOX beserta pencatatan histori riwayat.
 * Dioptimalkan untuk pemisahan layout Kotak Produk dan Kotak Riwayat Kondisi Kulit.
 */

// 1. Fungsi buka-tutup form dan mencentang otomatis checkbox sesuai data yang tersimpan
function toggleHomeConcernEdit(show) {
    const form = document.getElementById('home-concern-form');
    if (!form) return;

    if (show) {
        form.classList.remove('hidden');
        
        // Ambil data terkini di localStorage untuk mencentang kembali checkbox-nya
        const rawData = localStorage.getItem('glowdiary_skin');
        if (rawData) {
            const skinData = JSON.parse(rawData);
            
            // Atur Checkbox Tipe Kulit
            const savedTypes = Array.isArray(skinData.skinType) ? skinData.skinType : (skinData.skinType ? [skinData.skinType] : []);
            const typeCheckboxes = document.querySelectorAll('input[name="home-type-cb"]');
            typeCheckboxes.forEach(cb => {
                cb.checked = savedTypes.includes(cb.value);
            });
            
            // Atur Checkbox Kondisi Kulit
            const savedConcerns = Array.isArray(skinData.skinConcern) ? skinData.skinConcern : (skinData.skinConcern ? [skinData.skinConcern] : ["Tidak ada masalah khusus"]);
            const concernCheckboxes = document.querySelectorAll('input[name="home-concern-cb"]');
            concernCheckboxes.forEach(cb => {
                cb.checked = savedConcerns.includes(cb.value);
            });
        }
    } else {
        form.classList.add('hidden');
    }
}

// 2. Fungsi merender badge Tipe & Kondisi kulit di widget atas #skin-status-box
function displayHomeSkinStatus() {
    const statusBox = document.getElementById('skin-status-box');
    if (!statusBox) return;

    const rawData = localStorage.getItem('glowdiary_skin');
    let badgeHtml = '';

    if (rawData) {
        const skinData = JSON.parse(rawData);

        // A. Render Badge Tipe Kulit (Warna Ungu)
        if (skinData.skinType && skinData.skinType.length > 0) {
            const types = Array.isArray(skinData.skinType) ? skinData.skinType : [skinData.skinType];
            types.forEach(type => {
                if (type && type.trim() !== "") {
                    const displayType = type === "Sensitive" ? "Sensitif" : type;
                    badgeHtml += `<span class="bg-purple-100 text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200 shadow-sm flex items-center gap-1 animate-fade-in"><i class="fa-solid fa-sparkles text-[10px]"></i> ${displayType}</span>`;
                }
            });
        }

        // B. Render Badge Kondisi Kulit / Skin Concern (Warna Amber/Emas)
        if (skinData.skinConcern && skinData.skinConcern.length > 0) {
            const concerns = Array.isArray(skinData.skinConcern) ? skinData.skinConcern : [skinData.skinConcern];
            let validConcernCount = 0;

            concerns.forEach(concern => {
                if (concern && concern.trim() !== "") {
                    badgeHtml += `<span class="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1 animate-fade-in"><i class="fa-solid fa-circle-exclamation text-[10px]"></i> ${concern}</span>`;
                    validConcernCount++;
                }
            });

            if (validConcernCount === 0) {
                badgeHtml += `<span class="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1 animate-fade-in"><i class="fa-solid fa-circle-exclamation text-[10px]"></i> Tidak ada masalah khusus</span>`;
            }
        } else {
            badgeHtml += `<span class="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1 animate-fade-in"><i class="fa-solid fa-circle-exclamation text-[10px]"></i> Tidak ada masalah khusus</span>`;
        }

        statusBox.innerHTML = badgeHtml;
    } else {
        statusBox.innerHTML = `<div class="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs w-full font-medium"><a href="kuesioner.html" class="font-bold underline flex items-center gap-1"><i class="fa-solid fa-wand-magic-sparkles"></i> Mulai Analisis Kulit &rarr;</a></div>`;
    }
}

// 3. Fungsi Menyimpan data checkbox terpilih ke data utama dan mencatat ke dalam Histori (DIPERBAIKI)
function saveHomeConcernUpdate() {
    const selectedTypes = [];
    document.querySelectorAll('input[name="home-type-cb"]:checked').forEach(cb => {
        selectedTypes.push(cb.value);
    });

    const selectedConcerns = [];
    document.querySelectorAll('input[name="home-concern-cb"]:checked').forEach(cb => {
        selectedConcerns.push(cb.value);
    });

    if (selectedTypes.length === 0) {
        alert('Silakan pilih minimal satu tipe kulit Anda.');
        return;
    }

    if (selectedConcerns.length === 0) {
        selectedConcerns.push("Tidak ada masalah khusus");
    }

    const todayDate = new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // --- BAGIAN A: Update Data Utama Kulit ---
    const updatedSkinData = {
        skinType: selectedTypes,
        skinConcern: selectedConcerns,
        analyzedAt: todayDate
    };
    localStorage.setItem('glowdiary_skin', JSON.stringify(updatedSkinData));

    // --- BAGIAN B: Catat ke dalam Histori / Riwayat Skin (DIPERBAIKI JADI ARRAY SEHAT) ---
    let skinHistory = JSON.parse(localStorage.getItem('glowdiary_skin_history')) || [];
    
    const historyEntry = {
        id: Date.now(),
        date: todayDate,
        types: selectedTypes,     // Disimpan dalam bentuk Array murni
        concerns: selectedConcerns // Disimpan dalam bentuk Array murni
    };

    skinHistory.unshift(historyEntry);
    
    if (skinHistory.length > 5) {
        skinHistory = skinHistory.slice(0, 5);
    }
    localStorage.setItem('glowdiary_skin_history', JSON.stringify(skinHistory));

    // --- BAGIAN C: Sinkronisasi Tampilan ---
    alert('Kondisi & tipe kulit Anda berhasil diperbarui ke dalam riwayat!');
    
    toggleHomeConcernEdit(false);
    displayHomeSkinStatus(); 
    renderSkinHistoryHome();  
}

// 4. Fungsi menampilkan list histori riwayat di kolom `#home-history-list` (DIPERBAIKI LEBIH RESPONSIF & MODEREN)
function renderSkinHistoryHome() {
    // PERBAIKAN DI SINI: Menyesuaikan dengan ID kontainer kulit yang baru
    const historyList = document.getElementById('skin-history-list');
    if (!historyList) return;

    const skinHistory = JSON.parse(localStorage.getItem('glowdiary_skin_history')) || [];
    
    if (skinHistory.length === 0) {
        historyList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-4">
                <p class="text-[11px] text-gray-400 font-medium italic">Belum ada catatan perubahan kondisi.</p>
            </div>`;
        return;
    }

    let historyHtml = '';
    skinHistory.forEach(item => {
        const typesArr = Array.isArray(item.types) ? item.types : (item.type ? item.type.split(', ') : []);
        const concernsArr = Array.isArray(item.concerns) ? item.concerns : (item.concern ? item.concern.split(', ') : []);

        const typeBadges = typesArr.map(t => {
            const displayT = t === "Sensitive" ? "Sensitif" : t;
            return `<span class="bg-purple-50 text-brand-dark px-2 py-0.5 rounded-md font-bold text-[10px] border border-purple-100/70">${displayT}</span>`;
        }).join(' ');

        const concernBadges = concernsArr.map(c => 
            `<span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-amber-100/70">${c}</span>`
        ).join(' ');

        historyHtml += `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50/70 to-white p-3 rounded-xl border border-gray-100 hover:border-purple-200 transition-all duration-200 animate-fade-in">
                <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-brand-dark text-[10px] shrink-0">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div class="space-y-1.5">
                        <div class="flex flex-wrap gap-1 items-center">
                            <span class="text-[10px] font-bold text-gray-400 w-14">Tipe:</span>
                            <div class="flex flex-wrap gap-1">${typeBadges || '<span class="text-gray-400 italic text-[10px]">Normal</span>'}</div>
                        </div>
                        <div class="flex flex-wrap gap-1 items-center">
                            <span class="text-[10px] font-bold text-gray-400 w-14">Masalah:</span>
                            <div class="flex flex-wrap gap-1">${concernBadges}</div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-1 text-gray-400 font-semibold text-[10px] shrink-0 self-end sm:self-center">
                    <i class="fa-regular fa-clock text-[9px]"></i>
                    <span>${item.date}</span>
                </div>
            </div>
        `;
    });

    historyList.innerHTML = historyHtml;
}

// 5. PENYELARAS OTOMATIS: Memastikan text termuat sempurna
function initSkinUpdateSystem() {
    displayHomeSkinStatus();
    renderSkinHistoryHome();

    setTimeout(() => {
        displayHomeSkinStatus();
    }, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkinUpdateSystem);
} else {
    initSkinUpdateSystem();
}

window.displayHomeSkinStatus = displayHomeSkinStatus;
window.renderSkinHistoryHome = renderSkinHistoryHome;