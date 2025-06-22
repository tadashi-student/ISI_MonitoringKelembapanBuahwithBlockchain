use tokio_modbus::{client::rtu, prelude::*};
use tokio_serial::SerialPortBuilderExt;
use tokio::time::{sleep, Duration};
use std::error::Error;

async fn sht20(slave:u8) -> Result<Vec<u16>, Box<dyn Error>> {
    // config
    let builder = tokio_serial::new("/dev/ttyUSB0", 9600)
        .parity(tokio_serial::Parity::None)
        .stop_bits(tokio_serial::StopBits::One)
        .data_bits(tokio_serial::DataBits::Eight)
        .timeout(std::time::Duration::from_secs(1));
    
    let port = builder.open_native_async()?;
    let slave = Slave(slave);
    
    let response = {
        let mut ctx = rtu::attach_slave(port, slave);
        let res = ctx.read_input_registers(1, 2).await?;
        res
    }; // ctx auto exit form this case

  
    Ok(response)
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    loop {
        let response = sht20(1).await?;
        if response.len() == 2 {
            let temp = response[0] as f32 / 10.0;
            let rh = response[1] as f32 / 10.0;
            println!("temp : {:.1} C", temp);
            println!("rh   : {:.1} %", rh);
            println!()
        } else {
            println!("Invalid response: {:?}", response);
        }
        sleep(Duration::from_secs(2)).await;
    }
}