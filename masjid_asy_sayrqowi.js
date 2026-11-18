let jadwal = [
  { nama: "Subuh", jam: "04:09" },
  { nama: "Dzuhur", jam: "11:39" },
  { nama: "Ashar", jam: "14:52" },
  { nama: "Maghrib", jam: "17:48" },
  { nama: "Isya", jam: "18:59" }
];

const el = (id) => document.getElementById(id);

function perbaruiWaktu() {
  const sekarang = new Date();

  const jamTeks = sekarang
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
    .replace(/\./g, ":");

  const tanggalTeks = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  el("jam").textContent = jamTeks;
  el("tanggal").textContent = tanggalTeks;

  hitungWaktuSalat(sekarang);
}

function hitungWaktuSalat(sekarang) {
  const banner = el("banner-salat");
  let berikutnya = null;

  for (const item of jadwal) {
    const [jam, menit] = item.jam.split(":").map(Number);
    const waktu = new Date(sekarang);
    waktu.setHours(jam, menit, 0, 0);

    if (waktu > sekarang) {
      berikutnya = { nama: item.nama, waktu: waktu };
      break;
    }
  }

  if (!berikutnya) {
    const [jam, menit] = jadwal[0].jam.split(":").map(Number);
    const besok = new Date(sekarang);
    besok.setDate(besok.getDate() + 1);
    besok.setHours(jam, menit, 0, 0);

    berikutnya = { nama: jadwal[0].nama, waktu: besok };
  }

  const totalDetik = Math.floor((berikutnya.waktu - sekarang) / 1000);
  const jamSisa = Math.floor(totalDetik / 3600);
  const menitSisa = Math.floor((totalDetik % 3600) / 60);
  const detikSisa = totalDetik % 60;

  banner.textContent =
    `Menuju ${berikutnya.nama}: ${jamSisa} jam ${menitSisa} menit ${detikSisa} detik lagi`;

  // Sorot kartu sholat yang berikutnya
  document.querySelectorAll(".sholat").forEach((kartu) => {
    kartu.classList.toggle("berikut", kartu.dataset.nama === berikutnya.nama);
  });
}

async function muatJadwal() {
  try {
    const url =
      "https://api.aladhan.com/v1/timingsByCity?city=Salatiga&country=Indonesia&method=20";
    const respons = await fetch(url);

    if (!respons.ok) {
      throw new Error("gagal");
    }

    const waktu = (await respons.json()).data.timings;

    const peta = {
      Subuh: waktu.Fajr,
      Dzuhur: waktu.Dhuhr,
      Ashar: waktu.Asr,
      Maghrib: waktu.Maghrib,
      Isya: waktu.Isha
    };

    jadwal = jadwal.map((j) => ({
      nama: j.nama,
      jam: peta[j.nama].slice(0, 5)
    }));

    document.querySelectorAll(".sholat").forEach((kartu) => {
      const data = jadwal.find((j) => j.nama === kartu.dataset.nama);
      kartu.querySelector("strong").textContent = data.jam;
    });

    el("sumber-jadwal").textContent = "Waktu sholat hari ini (sumber: Kemenag RI)";
  } catch (error) {
    el("sumber-jadwal").textContent = "Waktu sholat (data tersimpan)";
  }

  perbaruiWaktu();
}

perbaruiWaktu();
setInterval(perbaruiWaktu, 1000);
muatJadwal();
el("tahun").textContent = new Date().getFullYear();

const menu = el("menu");
const tombol = el("menu-btn");

tombol.addEventListener("click", () => {
  const terbuka = menu.classList.toggle("buka");
  tombol.setAttribute("aria-expanded", terbuka);
});

menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("buka");
  }
});

const tautan = [...menu.querySelectorAll("a")];

const pengamat = new IntersectionObserver(
  (daftarEntri) => {
    daftarEntri.forEach((entri) => {
      if (!entri.isIntersecting) return;

      tautan.forEach((a) => {
        const cocok = a.getAttribute("href") === "#" + entri.target.id;
        a.classList.toggle("aktif", cocok);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

document
  .querySelectorAll("main section[id]")
  .forEach((section) => pengamat.observe(section));

const angka = document.querySelectorAll("[data-hitung]");

const pengamatAngka = new IntersectionObserver(
  (daftarEntri, pengamatIni) => {
    daftarEntri.forEach((entri) => {
      if (!entri.isIntersecting) return;

      const tujuan = Number(entri.target.dataset.hitung);
      const mulai = performance.now();

      function langkah(sekarang) {
        const progres = Math.min((sekarang - mulai) / 900, 1);
        entri.target.textContent = Math.round(tujuan * progres);

        if (progres < 1) {
          requestAnimationFrame(langkah);
        }
      }

      langkah(mulai);
      pengamatIni.unobserve(entri.target);
    });
  },
  { threshold: 0.6 }
);

const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!kurangiGerak) {
  angka.forEach((a) => pengamatAngka.observe(a));
}

(function () {
  const KEY = "jadwalJumat";
  const form = el("form-jumat");
  const daftar = el("daftar-jumat");
  const kosong = el("jumat-kosong");

  function ambil() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function simpan(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
    }
  }

  function formatTanggal(tanggal) {
    return new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  const hariIniObj = new Date();
  const tahun = hariIniObj.getFullYear();
  const bulan = String(hariIniObj.getMonth() + 1).padStart(2, "0");
  const hari = String(hariIniObj.getDate()).padStart(2, "0");
  el("jumat-tanggal").min = `${tahun}-${bulan}-${hari}`;

  function tampilkan() {
    const hariIni = el("jumat-tanggal").min;

    const data = ambil()
      .filter((j) => j.tanggal >= hariIni)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    daftar.innerHTML = "";
    kosong.style.display = data.length ? "none" : "block";

    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "item-jumat";

      // Info tanggal + petugas
      const info = document.createElement("div");

      const tgl = document.createElement("div");
      tgl.className = "tgl";
      tgl.textContent = formatTanggal(item.tanggal);

      const petugas = document.createElement("div");
      petugas.className = "petugas";
      petugas.textContent = `Khatib: ${item.khatib} • Imam: ${item.imam}`;

      info.append(tgl, petugas);

      // Tombol hapus
      const tombolHapus = document.createElement("button");
      tombolHapus.className = "btn-hapus";
      tombolHapus.type = "button";
      tombolHapus.textContent = "Hapus";

      tombolHapus.addEventListener("click", () => {
        if (confirm("Hapus jadwal ini?")) {
          simpan(ambil().filter((j) => j.id !== item.id));
          tampilkan();
        }
      });

      li.append(info, tombolHapus);
      daftar.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tanggal = el("jumat-tanggal").value;
    const khatib = el("jumat-khatib").value.trim();
    const imam = el("jumat-imam").value.trim();

    if (!tanggal || !khatib || !imam) return;

    const bukanJumat = new Date(tanggal + "T00:00:00").getDay() !== 5;

    if (bukanJumat && !confirm("Tanggal tersebut bukan hari Jumat. Tetap tambahkan?")) {
      return;
    }

    const data = ambil();
    data.push({ id: Date.now(), tanggal: tanggal, khatib: khatib, imam: imam });
    simpan(data);

    form.reset();
    tampilkan();
  });

  tampilkan();
})();