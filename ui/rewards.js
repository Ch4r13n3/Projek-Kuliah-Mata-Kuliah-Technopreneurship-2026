/**
 * rewards.js
 * Sistem Gamifikasi & Reward Poin GlowDiary
 */

// 1. Fungsi Utama Menambah Poin
function addUserPoints(amount) {
    // Ambil poin saat ini
    let currentPoints = parseInt(localStorage.getItem('glowdiary_glowPoints')) || 0;
    
    // Tambahkan poin baru
    currentPoints += amount;
    
    // Simpan kembali
    localStorage.setItem('glowdiary_glowPoints', currentPoints);
    
    // Munculkan notifikasi visual
    showPointToast(amount);
    
    // Langsung perbarui teks poin di layar
    updatePointsDisplay();
}

// 2. Fungsi Memunculkan Animasi Notifikasi (Toast)
function showPointToast(amount) {
    // Hapus toast lama jika masih ada di layar agar tidak bertumpuk
    const existingToast = document.getElementById('glow-points-toast');
    if (existingToast) existingToast.remove();

    // Buat elemen alert toast
    const toast = document.createElement('div');
    toast.id = "glow-points-toast";
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-bounce transition-all duration-500";
    toast.innerHTML = `<i class="fa-solid fa-star text-amber-300"></i> Selamat! +${amount} Poin GlowDiary! ✨`;
    
    document.body.appendChild(toast);
    
    // Hapus otomatis setelah 3 detik
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// 3. Fungsi Sinkronisasi Tampilan Poin
function updatePointsDisplay() {
    // Cari elemen poin (mencakup ID di dashboard atau class di halaman profil)
    const pointBadge = document.getElementById('user-points-display') || document.querySelector('.text-xl.font-black.text-purple-600');
    
    if (pointBadge) {
        const currentPoints = localStorage.getItem('glowdiary_glowPoints') || '0';
        pointBadge.innerText = currentPoints + " Pts";
    }
}

// 4. Pastikan teks poin selalu ter-update saat halaman manapun dimuat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePointsDisplay);
} else {
    updatePointsDisplay();
}