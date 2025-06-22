use tokio::net::TcpStream;
use tokio::io::AsyncWriteExt;
use tokio::time::{sleep, Duration};
use tokio_modbus::{client::rtu, prelude::*};
use tokio_serial::SerialPortBuilderExt;
use serde::Serialize;
use std::error::Error;
use chrono::{DateTime, Utc};

// Struct JSON baru, sekarang menyertakan shipment_id
#[derive(Serialize)]
struct SensorData {
    timestamp: String,
    shipment_id: String, // ID unik untuk setiap kontainer/pengiriman
    temperature_celsius: f32,
    humidity_percent: f32,
}

// Fungsi read_sht20 tidak berubah
async fn read_sht20(slave_id: u8) -> Result<Vec<u16>, Box<dyn Error>> {
    let builder = tokio_serial::new("/dev/ttyUSB0", 9600)
        .parity(tokio_serial::Parity::None)
        .stop_bits(tokio_serial::StopBits::One)
        .data_bits(tokio_serial::DataBits::Eight)
        .timeout(std::time::Duration::from_secs(1));
    let port = builder.open_native_async()?;
    let slave = Slave(slave_id);
    let response = {
        let mut ctx = rtu::connect_slave(port, slave).await?;
        ctx.read_input_registers(1, 2).await?
    };
    Ok(response)
}

// Fungsi send_data_to_server tidak berubah
async fn send_data_to_server(data: &SensorData) -> Result<(), Box<dyn Error>> {
    const SERVER_ADDR: &str = "127.0.0.1:7878";
    let json_payload = serde_json::to_string(&data)?;
    println!("Mengirim data: {}", json_payload);
    match TcpStream::connect(SERVER_ADDR).await {
        Ok(mut stream) => {
            stream.write_all(json_payload.as_bytes()).await?;
            println!("Data berhasil dikirim ke server.");
        }
        Err(e) => eprintln!("Gagal terhubung ke server: {}", e),
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Untuk tujuan tes, kita tetapkan ID pengiriman di sini.
    // Nanti, ID ini bisa berasal dari file konfigurasi atau argumen program.
    let shipment_id_tes = "KONTAINER-001".to_string();

    loop {
        println!("\nMembaca sensor untuk pengiriman: {}", shipment_id_tes);
        match read_sht20(1).await {
            Ok(response) => {
                if response.len() == 2 {
                    let temp = response[0] as f32 / 10.0;
                    let rh = response[1] as f32 / 10.0;
                    
                    println!("Suhu: {:.1} C, Kelembapan: {:.1} %", temp, rh);
                    
                    let now: DateTime<Utc> = Utc::now();
                    // Membuat struct data baru dengan shipment_id
                    let sensor_reading = SensorData {
                        timestamp: now.to_rfc3339(),
                        shipment_id: shipment_id_tes.clone(),
                        temperature_celsius: temp,
                        humidity_percent: rh,
                    };

                    if let Err(e) = send_data_to_server(&sensor_reading).await {
                        eprintln!("Error saat mengirim data: {}", e);
                    }
                } else {
                    println!("Response sensor tidak valid: {:?}", response);
                }
            }
            Err(e) => eprintln!("Gagal membaca sensor: {}", e),
        }
        sleep(Duration::from_secs(15)).await; // Kita perlambat interval pengiriman
    }
}