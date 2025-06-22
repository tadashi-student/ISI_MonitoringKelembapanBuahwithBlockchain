// --- Elemen UI ---
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');
const adminDashboard = document.getElementById('adminDashboard');
const buyerDashboard = document.getElementById('buyerDashboard');
const noAccessView = document.getElementById('noAccessView');
const registerShipmentForm = document.getElementById('registerShipmentForm');
const shipmentSelector = document.getElementById('shipmentSelector');
const shipmentDescription = document.getElementById('shipmentDescription');
const dataTableBody = document.getElementById('dataTableBody');

// --- Tombol Baru ---
const refreshDataButton = document.getElementById('refreshDataButton');
const saveChartButton = document.getElementById('saveChartButton');
const saveCsvButton = document.getElementById('saveCsvButton');



const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const contractABI = [ {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "shipmentId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "temperature",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "humidity",
          "type": "int256"
        }
      ],
      "name": "DataPointAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "shipmentId",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "ShipmentRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_shipmentId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "_temperature",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "_humidity",
          "type": "int256"
        }
      ],
      "name": "addDataPoint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "dataByShipmentId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "temperature",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "humidity",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_shipmentId",
          "type": "string"
        }
      ],
      "name": "getLatestDataPoint",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "temperature",
              "type": "int256"
            },
            {
              "internalType": "int256",
              "name": "humidity",
              "type": "int256"
            }
          ],
          "internalType": "struct Monitoring.DataPoint",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_shipmentId",
          "type": "string"
        }
      ],
      "name": "getShipmentHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "temperature",
              "type": "int256"
            },
            {
              "internalType": "int256",
              "name": "humidity",
              "type": "int256"
            }
          ],
          "internalType": "struct Monitoring.DataPoint[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_buyerAddress",
          "type": "address"
        }
      ],
      "name": "getShipmentsForBuyer",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_shipmentId",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_buyerAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        }
      ],
      "name": "registerShipment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "shipmentDetails",
      "outputs": [
        {
          "internalType": "string",
          "name": "shipmentId",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "buyerAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "shipmentsForBuyer",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    } ];

// --- Variabel Global ---
let provider;
let contract;
let signer;
let sensorChart = null; // Untuk menyimpan instance grafik
let currentShipmentHistory = []; // Untuk menyimpan data yang akan diekspor

// --- Event Listeners ---
connectButton.onclick = connectWallet;
if (registerShipmentForm) registerShipmentForm.onsubmit = registerNewShipment;
shipmentSelector.onchange = () => loadShipmentData(shipmentSelector.value);

// === EVENT LISTENERS BARU ===
refreshDataButton.onclick = () => loadShipmentData(shipmentSelector.value);
saveChartButton.onclick = saveChartAsImage;
saveCsvButton.onclick = saveTableAsCSV;


// --- Fungsi-fungsi ---

async function connectWallet() {
    // ... (Fungsi ini tidak berubah)
    if (typeof window.ethereum === 'undefined') return alert('Silakan install MetaMask!');
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); 
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer); 
        const userAddress = await signer.getAddress();
        walletStatus.textContent = `Status Wallet: Terhubung (${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)})`;
        walletStatus.style.color = 'green';
        connectButton.textContent = 'Ganti Akun';
        routeUser(userAddress);
    } catch (error) {
        handleError("Gagal terhubung ke wallet", error);
    }
}

async function routeUser(userAddress) {
    // ... (Fungsi ini tidak berubah)
    adminDashboard.style.display = 'none';
    buyerDashboard.style.display = 'none';
    noAccessView.style.display = 'none';
    try {
        const owner = await contract.owner();
        if (userAddress.toLowerCase() === owner.toLowerCase()) {
            adminDashboard.style.display = 'block';
        } else {
            const shipments = await contract.getShipmentsForBuyer(userAddress);
            if (shipments.length > 0) {
                buyerDashboard.style.display = 'block';
                populateShipmentSelector(shipments);
                await loadShipmentData(shipments[0]);
            } else {
                noAccessView.style.display = 'block';
            }
        }
    } catch (error) {
        handleError("Gagal memverifikasi peran pengguna", error);
    }
}

async function registerNewShipment(event) {
    // ... (Fungsi ini tidak berubah)
    event.preventDefault();
    const shipmentId = document.getElementById('shipmentId').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const description = document.getElementById('description').value;
    if (!ethers.utils.isAddress(buyerAddress)) return alert("Alamat wallet pembeli tidak valid.");
    try {
        const tx = await contract.registerShipment(shipmentId, buyerAddress, description);
        alert("Mengirim transaksi... Mohon tunggu konfirmasi.");
        await tx.wait();
        alert(`Pengiriman ${shipmentId} berhasil didaftarkan untuk alamat ${buyerAddress}!`);
        registerShipmentForm.reset();
    } catch (error) {
        handleError("Gagal mendaftarkan pengiriman", error);
    }
}

function populateShipmentSelector(shipments) {
    // ... (Fungsi ini tidak berubah)
    shipmentSelector.innerHTML = '';
    shipments.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        shipmentSelector.appendChild(option);
    });
}

// === FUNGSI LOAD DATA DIMODIFIKASI UNTUK MENYIMPAN HASIL ===
async function loadShipmentData(shipmentId) {
    if (!contract || !shipmentId) return;

    dataTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Memuat data untuk ${shipmentId}...</td></tr>`;
    
    try {
        const details = await contract.shipmentDetails(shipmentId);
        shipmentDescription.textContent = `Deskripsi: ${details.description}`;

        const history = await contract.getShipmentHistory(shipmentId);
        currentShipmentHistory = history; // Simpan data ke variabel global untuk ekspor

        populateTable(history);
        renderChart(history);

    } catch (error) {
        handleError(`Gagal memuat data untuk ${shipmentId}`, error);
    }
}

function populateTable(data) {
    // ... (Fungsi ini dimodifikasi sedikit untuk menyesuaikan kolom)
    dataTableBody.innerHTML = '';
    if (data.length === 0) {
        dataTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Belum ada data tercatat.</td></tr>';
        return;
    }
    data.slice().reverse().forEach(dp => {
        const row = dataTableBody.insertRow();
        const date = new Date(dp.timestamp.toNumber() * 1000).toLocaleString("id-ID", { timeZone: 'Asia/Jakarta' });
        const temp = dp.temperature.toNumber() / 10.0;
        const hum = dp.humidity.toNumber() / 10.0;
        
        row.insertCell().textContent = date;
        row.insertCell().textContent = temp.toFixed(1);
        row.insertCell().textContent = hum.toFixed(1);
    });
}

function renderChart(data) {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    if (data.length === 0) {
        if(sensorChart) sensorChart.destroy(); // Hapus grafik jika tidak ada data
        return;
    }

    const labels = data.map(dp => new Date(dp.timestamp.toNumber() * 1000));
    const temperatureData = data.map(dp => dp.temperature.toNumber() / 10.0);
    const humidityData = data.map(dp => dp.humidity.toNumber() / 10.0);

    if (sensorChart) {
        sensorChart.destroy(); // Hapus grafik lama sebelum menggambar yang baru
    }

    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Suhu (°C)',
                    data: temperatureData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    yAxisID: 'y_temp',
                    fill: true,
                },
                {
                    label: 'Kelembapan (%)',
                    data: humidityData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    yAxisID: 'y_hum',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        // === PERUBAHAN DI SINI UNTUK INTERVAL 30 MENIT ===
                        unit: 'minute',    // Ganti dari 'hour' ke 'minute'
                        stepSize: 30,      // Tampilkan label setiap 30 menit
                        tooltipFormat: 'DD MMM YYYY, HH:mm:ss', // Format saat kursor diarahkan ke titik data
                        displayFormats: {
                            minute: 'HH:mm', // Format label waktu di sumbu-X (misal: 10:00, 10:30)
                            hour: 'HH:mm'    // Format jika rentang membesar
                        }
                        // ================================================
                    },
                    title: {
                        display: true,
                        text: 'Waktu'
                    }
                },
                y_temp: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Suhu (°C)',
                        color: '#e74c3c',
                    }
                },
                y_hum: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Kelembapan (%)',
                        color: '#3498db',
                    },
                    grid: {
                        drawOnChartArea: false, // Hanya tampilkan grid dari sumbu Y suhu
                    },
                }
            }
        }
    });
}
// === FUNGSI-FUNGSI BARU UNTUK EKSPOR ===

function saveChartAsImage() {
    if (!sensorChart || sensorChart.data.labels.length === 0) {
        alert("Tidak ada data di grafik untuk disimpan.");
        return;
    }
    const link = document.createElement('a');
    link.href = sensorChart.toBase64Image(); // Dapatkan gambar dari canvas
    link.download = `grafik-pengiriman-${shipmentSelector.value}.png`;
    link.click();
}

function saveTableAsCSV() {
    if (currentShipmentHistory.length === 0) {
        alert("Tidak ada data di tabel untuk disimpan.");
        return;
    }

    // Buat header CSV
    let csvContent = "data:text/csv;charset=utf-8,Waktu (WIB),Suhu (C),Kelembapan (%)\r\n";

    // Tambahkan setiap baris data
    currentShipmentHistory.forEach(dp => {
        const date = new Date(dp.timestamp.toNumber() * 1000).toLocaleString("id-ID", { timeZone: 'Asia/Jakarta' });
        const temp = (dp.temperature.toNumber() / 10.0).toFixed(1);
        const hum = (dp.humidity.toNumber() / 10.0).toFixed(1);
        csvContent += `"${date}",${temp},${hum}\r\n`;
    });

    // Buat link download dan klik secara otomatis
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riwayat-data-${shipmentSelector.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleError(message, error) {
    // ... (Fungsi ini tidak berubah)
    console.error(message, error);
    alert(`${message}: ${error.reason || error.message}`);
}