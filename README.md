# Website Acara

Struktur project sederhana (HTML, CSS, JS) — tidak butuh instalasi apa pun.

## Cara membuka di VS Code

1. Ekstrak/salin folder ini ke komputer Anda.
2. Buka VS Code → **File > Open Folder** → pilih folder `website-acara`.
3. Install ekstensi **Live Server** (oleh Ritwick Dey) dari tab Extensions.
4. Klik kanan `index.html` → **Open with Live Server**. Website akan terbuka di browser dan otomatis refresh setiap Anda menyimpan perubahan.

## Struktur file

```
website-acara/
├─ index.html      → isi & struktur semua bagian website
├─ style.css       → tema warna hijau, tipografi, layout
├─ script.js       → menu mobile, efek navbar, animasi scroll
└─ assets/
   └─ logo.png      → logo acara
```

## Yang perlu Anda edit

Semua teks yang perlu diisi ditandai dengan tanda kurung siku, misalnya `[NAMA ACARA]` atau `[Tuliskan sejarah singkat...]`. Buka `index.html`, cari teks berkurung siku (gunakan Ctrl+F / Cmd+F), lalu ganti dengan konten acara Anda.

Bagian yang tersedia saat ini:
- Beranda (hero + logo)
- Profil & Latar Belakang
- Visi & Misi
- Rangkaian Acara / Format
- Struktur Kepanitiaan
- Sponsorship / Partnership
- Kontak (footer)

## Menambah kartu/kolom

Untuk menambah anggota panitia, paket sponsorship, atau kartu misi baru, salin blok elemen yang sudah ada (misalnya satu `<div class="panitia-card">...</div>`) dan tempel lagi di bawahnya dengan isi baru — layout akan otomatis menyesuaikan.

## Warna tema (bisa diubah di `style.css`, bagian `:root`)

| Variabel | Warna |
|---|---|
| `--forest-950` | Hijau tua (background hero & footer) |
| `--forest-600` / `--forest-500` | Hijau utama |
| `--gold` | Aksen emas (dari warna logo) |
| `--paper` | Latar belakang putih kehijauan |
