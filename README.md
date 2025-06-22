# Sistem Monitoring Suhu & Kelembapan Terintegrasi Blockchain

## 1. Latar Belakang dan Tujuan Proyek

Proyek ini adalah sebuah prototipe fungsional untuk sistem monitoring lingkungan (suhu dan kelembapan) yang canggih, dengan fokus pada kasus penggunaan **monitoring pengiriman buah dalam kontainer**. Tujuannya adalah untuk menyediakan solusi yang tidak hanya andal secara operasional tetapi juga **transparan, akuntabel, dan dapat dipercaya** oleh semua pihak yang terlibat, mulai dari penjual, pengirim, hingga pembeli.

Masalah utama dalam sistem monitoring konvensional adalah data yang tersimpan secara terpusat rentan terhadap manipulasi atau kehilangan. Proyek ini mengatasi masalah tersebut dengan mengintegrasikan **teknologi blockchain** sebagai lapisan kepercayaan (*trust layer*). Data sensor penting tidak hanya disimpan untuk analisis, tetapi juga dicatat secara permanen dan tidak dapat diubah (*immutable*) di blockchain, menciptakan jejak audit digital yang kuat.

Dengan sistem ini, seorang pembeli buah dapat memantau kondisi pengiriman mereka secara *real-time* dan memverifikasi riwayat data suhu/kelembapan melalui antarmuka web terdesentralisasi (DApp), memastikan kualitas produk tetap terjaga selama di perjalanan.

## 2. Arsitektur Sistem

Sistem ini terdiri dari beberapa komponen yang bekerja secara sinergis. Alur data lengkapnya adalah sebagai berikut:

1.  **Sensor Fisik (SHT20)**: Mengambil data mentah suhu dan kelembapan dari lingkungan (kontainer).
2.  **Rust Modbus Client (`modbus_client`)**: Sebuah program Rust yang berjalan di dekat sensor, bertugas membaca data dari sensor menggunakan protokol Modbus RTU dan memformatnya ke dalam JSON.
3.  **Rust TCP Server (`tcp_server`)**: Bertindak sebagai *hub* pusat. Menerima data JSON dari client dan mendistribusikannya ke dua jalur:
    * **Jalur Data Cepat (InfluxDB)**: Semua data sensor dikirim ke InfluxDB, sebuah database *time-series* yang dioptimalkan untuk kueri cepat dan penyimpanan data bervolume besar.
    * **Jalur Data Kepercayaan (Blockchain)**: Data yang sama juga dikirim sebagai transaksi ke *Smart Contract* di blockchain untuk menciptakan catatan permanen. Server ini bertindak sebagai **Oracle** tepercaya.
4.  **Penyimpanan & Visualisasi Terpusat**:
    * **InfluxDB**: Menyimpan seluruh riwayat data untuk analisis mendalam.
    * **Grafana**: Terhubung ke InfluxDB untuk membuat dashboard visual tingkat tinggi.
    * **Aplikasi Desktop (PyQt)**: Aplikasi lokal untuk monitoring *real-time*, menampilkan alarm, dan analisis data historis dari InfluxDB.
5.  **Lapisan Terdesentralisasi (Blockchain)**:
    * **Smart Contract (Solidity)**: Diterbitkan di jaringan Ethereum (disimulasikan dengan Hardhat), berfungsi sebagai "buku besar digital" yang mencatat data dan mengatur hak akses.
    * **DApp (HTML/JS/Ethers.js)**: Antarmuka web yang memungkinkan Admin (penjual) mendaftarkan pengiriman dan Pembeli memverifikasi data pengiriman mereka langsung dari blockchain melalui MetaMask.

## 3. Teknologi yang Digunakan

* **Backend & Sensor**: Rust, Tokio, Modbus RTU, TCP/IP
* **Database**: InfluxDB
* **Aplikasi Desktop**: Python 3, PyQt5, Pandas
* **Visualisasi**: Grafana, PyQtChart
* **Blockchain**: Solidity, Hardhat, Ethers.js, MetaMask
* **Web Frontend (DApp)**: HTML5, CSS3, JavaScript (ES6+)

## 4. Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal perangkat lunak berikut:
* [Rust dan Cargo](https://www.rust-lang.org/tools/install)
* [Node.js dan npm](https://nodejs.org/) (disarankan versi LTS)
* [Python 3 dan pip](https://www.python.org/downloads/)
* [InfluxDB v2.x](https://www.influxdata.com/downloads/)
* [Grafana](https://grafana.com/grafana/download/) (Opsional)
* [Git](https://git-scm.com/downloads/)

## 5. Struktur Folder Proyek

Untuk kemudahan pengelolaan, disarankan untuk menyatukan semua bagian proyek dalam satu folder utama.
NAMA_PROYEK_ANDA/
├── rust_backend/             <-- Folder untuk semua kode Rust (sebelumnya TUGAS4)
│   ├── .env                  <-- File konfigurasi (perlu dibuat manual, diabaikan oleh Git)
│   ├── Cargo.toml            <-- File workspace Rust
│   ├── modbus_client/        <-- Sub-proyek client sensor
│   └── tcp_server/           <-- Sub-proyek server TCP & Blockchain
│
├── blockchain_dapp/          <-- Folder untuk semua kode Hardhat & DApp (sebelumnya proyek-blockchain)
│   ├── contracts/            <-- Tempat menyimpan file smart contract .sol
│   ├── scripts/              <-- Tempat menyimpan skrip deployment .js
│   ├── index.html            <-- File utama DApp
│   ├── app.js                <-- Logika JavaScript DApp
│   ├── ethers.umd.min.js     <-- Library Ethers.js lokal
│   └── ...                   <-- File & folder Hardhat lainnya
│
├── gui_desktop/              <-- (Saran) Folder terpisah untuk aplikasi PyQt
│   ├── gui_app.py            <-- File utama aplikasi desktop Anda
│   └── requirements.txt      <-- Daftar dependensi Python
│
└── README.md                 <-- File penjelasan proyek ini

## 6. Langkah-langkah Instalasi dan Menjalankan

#### Langkah A: Setup Awal

1.  **Clone Repositori (Jika sudah di GitHub)**
    ```bash
    git clone [URL_GITHUB_ANDA]
    cd [NAMA_PROYEK_ANDA]
    ```
2.  **Install Dependensi Backend Blockchain**
    ```bash
    cd blockchain_dapp
    npm install
    cd ..
    ```
3.  **Install Dependensi Aplikasi Desktop** (Disarankan membuat file `requirements.txt`)
    * Buat file `gui_desktop/requirements.txt` berisi:
        ```
        PyQt5
        PyQtChart
        influxdb-client
        pandas
        openpyxl
        ```
    * Jalankan instalasi:
        ```bash
        cd gui_desktop
        pip install -r requirements.txt
        cd ..
        ```

#### Langkah B: Menjalankan Keseluruhan Sistem

Proses ini membutuhkan beberapa terminal yang berjalan secara bersamaan.

1.  **Jalankan Blockchain Lokal (Terminal 1)**
    * Buka terminal, masuk ke folder `blockchain_dapp`.
    * Jalankan Hardhat Node:
        ```bash
        npx hardhat node --hostname 0.0.0.0
        ```
    * **Biarkan terminal ini berjalan.**

2.  **Deploy Smart Contract (Terminal 2)**
    * Buka terminal **baru**, masuk ke folder `blockchain_dapp`.
    * Jalankan skrip deploy:
        ```bash
        npx hardhat run scripts/deploy.js --network localhost
        ```
    * ✅ **CATAT ALAMAT KONTRAK BARU** yang muncul.

3.  **Konfigurasi Alamat Kontrak dan Kunci**
    * **Buat file `.env`**: Di dalam folder `rust_backend`, buat file bernama `.env`. Salin `PRIVATE_KEY` dari **Account #0** di Terminal 1 dan alamat kontrak baru dari Terminal 2 ke dalamnya.
        ```env
        PRIVATE_KEY=0xac097...
        CONTRACT_ADDRESS=0x5Fb...
        ```
    * **Perbarui `app.js`**: Buka file `blockchain_dapp/app.js` dan perbarui variabel `const contractAddress` dengan alamat kontrak baru tersebut. Perbarui juga `const contractABI` jika ada perubahan.

4.  **Jalankan Server Rust (Terminal 3)**
    * Buka terminal **baru**, masuk ke folder `rust_backend`.
    * Jalankan server TCP yang juga terhubung ke InfluxDB dan Blockchain:
        ```bash
        cargo run -p tcp_server
        ```
    * Biarkan terminal ini berjalan.

5.  **Jalankan Client Sensor Rust (Terminal 4)**
    * Buka terminal **baru**, masuk ke folder `rust_backend`.
    * Jalankan client yang membaca data sensor dan mengirimkannya ke server:
        ```bash
        cargo run -p modbus_client
        ```

#### Langkah C: Mengakses Antarmuka Pengguna (Frontend)

1.  **Jalankan DApp (Terminal 5)**
    * Buka terminal **baru**, masuk ke folder `blockchain_dapp`.
    * Jalankan server web sederhana:
        ```bash
        python3 -m http.server 8000 --bind 0.0.0.0
        ```
    * Buka browser dan akses `http://localhost:8000`.
    * Konfigurasi MetaMask untuk terhubung ke jaringan Hardhat Local (`http://127.0.0.1:8545`, Chain ID `31337`) dan uji DApp sebagai Admin atau Pembeli.

2.  **Jalankan Aplikasi Desktop PyQt (Terminal 6)**
    * Buka terminal **baru**, 
    * Jalankan aplikasi:
        ```bash
        python3 qt.py
