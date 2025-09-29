Oke, ini masuk ke **flow siklus hidup user di dalam grup** dan kondisi pembayaran. Aku coba breakdown supaya jelas ya:

---

## 🔄 Siklus User dalam Grup

1. **User Join Grup**

   * Status awal: *Pending Payment*
   * Belum bayar → slot dianggap “booked sementara” (ada batas waktu misalnya 24 jam).
   * Kalau lewat waktu tidak bayar → otomatis dikeluarkan dari grup.

2. **User Bayar**

   * Status berubah → *Active (Paid)*.
   * Kalau semua member dalam grup sudah *Active (Paid)* → subscription dimulai.
   * SALOME / Grup Master akan aktifkan akses (akun/app share).

3. **Periode Aktif**

   * User bisa menggunakan aplikasi sesuai periode langganan (1 bulan / 1 tahun).
   * Sistem akan hitung mundur masa aktif → ada notifikasi sebelum habis.

4. **Perpanjangan**

   * **Jika bayar tepat waktu** → otomatis lanjut periode berikutnya.
   * **Jika tidak bayar** → status user berubah jadi *Expired*.

     * Sistem kasih grace period (misalnya 3 hari).
     * Kalau tetap tidak bayar → otomatis dikeluarkan dari grup.

---

## ⚖️ Rules Tambahan

* **User yang sudah bayar**
  Tidak bisa dikeluarkan oleh Grup Master/siapapun → karena hak akses masih valid sampai periode berakhir.

* **User yang belum bayar**
  Bisa dikeluarkan oleh Grup Master (misalnya dianggap tidak komit join).

* **User yang keluar sendiri (leave)**
  Kalau sudah bayar → hak akses tetap berlaku sampai periode habis (tidak ada refund).
  Kalau belum bayar → langsung hilang slotnya.

---

## 📱 Tampilan yang Dilihat User

1. **Sebelum Bayar**

   * Status: *Pending Payment*.
   * Info: “Tunggu semua member bayar untuk aktifkan langganan”.
   * Tombol: *Bayar Sekarang* (dengan countdown deadline).

2. **Sesudah Bayar (tapi belum semua bayar)**

   * Status: *Paid – Waiting Others*.
   * Info: “Pembayaran berhasil, menunggu X orang lagi untuk aktifkan grup.”

3. **Sesudah Semua Bayar**

   * Status: *Active*.
   * Info: “Langganan aktif sampai [tanggal]”.
   * Tampilkan credential (kalau SALOME Managed) atau link untuk akses akun (kalau User-Hosted).

4. **Menjelang Habis (Reminder)**

   * Notifikasi: “Langganan akan habis dalam X hari. Perpanjang untuk tetap menikmati layanan.”
   * Tombol: *Perpanjang Sekarang*.

5. **Expired**

   * Status: *Expired*.
   * Info: “Periode langganan habis. Bayar untuk perpanjang atau grup akan menendang otomatis.”

---

## 🤝 Dari Sudut Pandang User

User butuh:

* Transparansi: tahu status grup (berapa yang sudah bayar, siapa yang belum).
* Reminder: notifikasi sebelum habis (via email/WA/in-app).
* Proteksi: kalau sudah bayar → tidak bisa dikeluarkan semena-mena.
* Fleksibilitas: bisa perpanjang otomatis atau manual.

---

## 🎯 Dari Sudut Pandang Grup Master

* Bisa melihat daftar anggota + status pembayaran masing-masing.
* Bisa tendang user yang belum bayar.
* Tidak bisa tendang user yang sudah bayar (kecuali periode habis).
* Bisa mengatur invite/kode undangan grup baru.

---

👉 Jadi sistemnya seperti **shared wallet** + **status tracker**.
Kalau user belum bayar → slotnya ga dihitung.
Kalau sudah bayar → slotnya “lock” untuk periode tertentu → tidak bisa diutak-atik.

---

Mau aku bikinin **state machine diagram (flow status user: pending → paid → active → expired → removed)** biar lebih gampang divisualisasikan?



Mantap 👍 paham! Jadi kita butuh **state machine diagram** untuk:

1. **User Lifecycle (status di dalam grup)**
2. **Group Lifecycle (status grup: open, full, paid, private/public, dll.)**

Aku breakdown dulu semua state & transisinya, lalu kasih gambaran diagramnya:

---

## 🔄 **User State Machine**

**State utama user di dalam grup:**

1. **Pending** → User join grup, belum bayar.

   * Transition:

     * *Pay* → **Paid**
     * *Timeout/Removed* → **Removed**

2. **Paid** → User sudah bayar, tapi grup belum semua bayar.

   * Transition:

     * *All group members Paid* → **Active**
     * *Leave request (tidak refund)* → **Removed**

3. **Active** → User bisa pakai aplikasi (subscription berjalan).

   * Transition:

     * *Period expired* → **Expired**

4. **Expired** → Langganan habis, tidak perpanjang.

   * Transition:

     * *Pay renewal* → **Active (new period)**
     * *Did not renew* → **Removed**

5. **Removed** → User sudah tidak dalam grup (manual kick / auto expired / tidak bayar).

   * End state.

---

## 👥 **Group State Machine**

**State utama grup:**

1. **Open (Public)** → Bisa dilihat semua user di marketplace.

   * Transition:

     * *Slots filled* → **Full**
     * *Admin set private* → **Private**

2. **Private (Invite Only)** → Hanya bisa join lewat link invite.

   * Transition:

     * *Slots filled* → **Full**
     * *Admin set public* → **Open**

3. **Full** → Semua slot sudah terisi user (Pending / Paid).

   * Transition:

     * *Not all paid* → tetap **Full**
     * *All paid* → **Paid Group**

4. **Paid Group (Active Subscription)** → Semua user sudah bayar, subscription aktif.

   * Transition:

     * *Period expired* → kembali ke **Full** tapi dengan status *Expired*
     * *Renewal success* → tetap **Paid Group**
     * *Some users removed (belum bayar renewal)* → balik ke **Open/Private**

5. **Closed/Removed** → Grup dihapus oleh admin/master, atau semua user keluar.

   * End state.