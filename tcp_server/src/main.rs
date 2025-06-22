use tokio::net::{TcpListener, TcpStream};
use tokio::io::AsyncReadExt;
use std::error::Error;
use serde::Deserialize;
use chrono::{DateTime, Utc};

// --- Integrasi Blockchain ---
use ethers::prelude::*;
use std::env;
use std::sync::Arc;
use dotenv::dotenv;

abigen!(Monitoring, "./abi/Monitoring.json");

// Struct JSON baru, disesuaikan dengan yang dikirim client
#[derive(Deserialize, Debug, Clone)]
struct SensorData {
    timestamp: String,
    shipment_id: String, // Menerima shipment_id
    temperature_celsius: f32,
    humidity_percent: f32,
}

// Fungsi write_to_blockchain dimodifikasi untuk menerima shipment_id
async fn write_to_blockchain(data: &SensorData) -> Result<TxHash, Box<dyn Error>> {
    let provider = Provider::<Http>::try_from("http://127.0.0.1:8545")?;
    let chain_id = provider.get_chainid().await?.as_u64();
    let private_key = env::var("PRIVATE_KEY")?;
    let wallet = private_key.parse::<LocalWallet>()?.with_chain_id(chain_id);
    let client = Arc::new(SignerMiddleware::new(provider, wallet));
    let contract_address: Address = env::var("CONTRACT_ADDRESS")?.parse()?;
    let contract = Monitoring::new(contract_address, client);

    let timestamp_unix = data.timestamp.parse::<DateTime<Utc>>()?.timestamp();
    // Gunakan shipment_id dari data
    let shipment_id = data.shipment_id.clone(); 
    let temp = (data.temperature_celsius * 10.0) as i128;
    let hum = (data.humidity_percent * 10.0) as i128;

    println!("Mengirim transaksi ke blockchain untuk pengiriman: {}", shipment_id);
    // Panggil fungsi addDataPoint yang baru
    let tx_call = contract.add_data_point(
        shipment_id,
        U256::from(timestamp_unix),
        I256::from(temp),
        I256::from(hum)
    );
    let pending_tx = tx_call.send().await?;
    let receipt = pending_tx.await?;
    let tx_hash = receipt.unwrap().transaction_hash;
    println!("✅ Transaksi ke blockchain berhasil dengan hash: {:?}", tx_hash);
    Ok(tx_hash)
}

// Fungsi write_to_influxdb dimodifikasi untuk menggunakan shipment_id sebagai tag
async fn write_to_influxdb(data: &SensorData) -> Result<(), Box<dyn Error>> {
    const INFLUX_URL: &str = "http://localhost:8086/api/v2/write?org=instrumentasi&bucket=monitoring&precision=s";
    const INFLUX_TOKEN: &str = "t3XfMpAywZYjbc0rQ35w1baYYP8RG2ejOtutZPyQoUrE8oAJoQitAal2gSPc3chRWDNOBJ0C2ltWYIUpStf2GQ==";
    let timestamp_dt: DateTime<Utc> = data.timestamp.parse()?;
    let timestamp_unix = timestamp_dt.timestamp();
    
    // Gunakan shipment_id sebagai tag di InfluxDB
    let line_protocol = format!(
        "environment_monitoring,shipment_id={} temperature_celsius={},humidity_percent={} {}",
        data.shipment_id, data.temperature_celsius, data.humidity_percent, timestamp_unix
    );
    
    let client = reqwest::Client::new();
    let response = client.post(INFLUX_URL)
        .header("Authorization", format!("Token {}", INFLUX_TOKEN))
        .header("Content-Type", "text/plain").body(line_protocol).send().await?;
    if response.status().is_success() {
        println!("✅ Data berhasil ditulis ke InfluxDB.");
    } else {
        eprintln!("❌ Gagal menulis ke InfluxDB: {}", response.text().await?);
    }
    Ok(())
}

// Fungsi handle_connection tidak perlu banyak perubahan
async fn handle_connection(mut stream: TcpStream) {
    let mut buffer = Vec::new();
    if let Err(e) = stream.read_to_end(&mut buffer).await {
        eprintln!("Gagal membaca data dari stream: {}", e);
        return;
    }
    match serde_json::from_slice::<SensorData>(&buffer) {
        Ok(data) => {
            println!("\n--- Menerima Data Baru ---");
            println!("{:?}", data);
            if let Err(e) = write_to_influxdb(&data).await {
                eprintln!("Error saat memproses data ke InfluxDB: {}", e);
            }
            if let Err(e) = write_to_blockchain(&data).await {
                eprintln!("❌ Error saat menulis data ke Blockchain: {}", e);
            }
        }
        Err(e) => {
            eprintln!("Gagal mem-parse JSON: {}", e);
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    let listener = TcpListener::bind("0.0.0.0:7878").await?;
    println!("TCP Server listening di 0.0.0.0:7878");
    println!("Menunggu data sensor untuk dikirim ke InfluxDB dan Blockchain...");
    loop {
        let (stream, addr) = listener.accept().await?;
        println!("\nMenerima koneksi dari: {}", addr);
        tokio::spawn(handle_connection(stream));
    }
}