
// Mengambil tombol menu dan daftar navigasi
const tombolMenu = document.getElementById("menu-btn");
const daftarMenu = document.getElementById("menu");

// Membuka dan menutup menu navigasi
tombolMenu.addEventListener("click", function() {

    daftarMenu.classList.toggle("buka");

    const menuTerbuka = daftarMenu.classList.contains("buka");

    tombolMenu.setAttribute("aria-expanded", menuTerbuka);

});

// Menutup menu setelah salah satu link diklik
const linkMenu = daftarMenu.querySelectorAll("a");

linkMenu.forEach(function(link) {

    link.addEventListener("click", function() {

        daftarMenu.classList.remove("buka");
        tombolMenu.setAttribute("aria-expanded", "false");

    });

});

// Menampilkan tahun otomatis
document.getElementById("tahun").textContent =
    new Date().getFullYear();
