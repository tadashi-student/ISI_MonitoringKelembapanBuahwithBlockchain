import sys
from influxdb_client import InfluxDBClient
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel, QPushButton,
    QMessageBox, QHBoxLayout, QFrame, QFileDialog
)
from PyQt5.QtCore import QTimer, Qt, QDateTime, QPoint
from PyQt5.QtChart import QChart, QChartView, QLineSeries, QDateTimeAxis, QValueAxis
from PyQt5.QtGui import QPainter, QColor, QPixmap, QFont

class InfluxGUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Monitoring & Alarm Fermentasi Kopi")
        self.resize(800, 700) # Perbesar sedikit tinggi window

        # Layout utama
        self.layout = QVBoxLayout()

        # Status koneksi
        self.status_label = QLabel("Status Koneksi: ❌ Tidak Terhubung")
        self.status_label.setStyleSheet("font-weight: bold; color: red;")
        self.layout.addWidget(self.status_label)

        # Frame untuk data real-time dan status alarm
        self.data_frame = QFrame()
        self.data_frame.setFrameShape(QFrame.StyledPanel)
        self.top_layout = QHBoxLayout()

        # --- Kolom Suhu ---
        self.temp_column = QVBoxLayout()
        self.temp_label = QLabel("Temperatur: - °C")
        self.temp_label.setStyleSheet("font-size: 18px; font-weight: bold;")
        self.temp_column.addWidget(self.temp_label, alignment=Qt.AlignCenter)

        # ================== FITUR ALARM ==================
        self.temp_status_box = QLabel("Status: Menunggu Data")
        self.temp_status_box.setAlignment(Qt.AlignCenter)
        self.temp_status_box.setFont(QFont("Arial", 10, QFont.Bold))
        self.temp_status_box.setMinimumHeight(40)
        self.temp_column.addWidget(self.temp_status_box)
        # ===============================================
        self.top_layout.addLayout(self.temp_column)

        # --- Kolom Kelembapan ---
        self.hum_column = QVBoxLayout()
        self.hum_label = QLabel("Kelembapan: - %")
        self.hum_label.setStyleSheet("font-size: 18px; font-weight: bold;")
        self.hum_column.addWidget(self.hum_label, alignment=Qt.AlignCenter)
        
        # ================== FITUR ALARM ==================
        self.hum_status_box = QLabel("Status: Menunggu Data")
        self.hum_status_box.setAlignment(Qt.AlignCenter)
        self.hum_status_box.setFont(QFont("Arial", 10, QFont.Bold))
        self.hum_status_box.setMinimumHeight(40)
        self.hum_column.addWidget(self.hum_status_box)
        # ===============================================
        self.top_layout.addLayout(self.hum_column)
        
        self.data_frame.setLayout(self.top_layout)
        self.layout.addWidget(self.data_frame)

        # ... (Kode Grafik tidak berubah)
        self.temp_chart_view = QChartView() # Didefinisikan di sini
        self.hum_chart_view = QChartView() # Didefinisikan di sini
        self.setup_charts() # Panggil fungsi untuk setup grafik
        self.layout.addWidget(self.temp_chart_view, stretch=1)
        self.layout.addWidget(self.hum_chart_view, stretch=1)

        # Tombol Kontrol
        self.button_layout = QHBoxLayout()
        self.start_button = QPushButton("Mulai")
        self.stop_button = QPushButton("Berhenti")
        self.stop_button.setEnabled(False)
        self.save_button = QPushButton("Simpan Grafik")
        self.start_button.clicked.connect(self.start_query)
        self.stop_button.clicked.connect(self.stop_query)
        self.save_button.clicked.connect(self.save_charts_as_image)
        self.button_layout.addWidget(self.start_button)
        self.button_layout.addWidget(self.stop_button)
        self.button_layout.addWidget(self.save_button)
        self.layout.addLayout(self.button_layout)
        self.setLayout(self.layout)
        
        # Pengaturan InfluxDB dan data
        self.url = "http://localhost:8086"
        self.token = "t3XfMpAywZYjbc0rQ35w1baYYP8RG2ejOtutZPyQoUrE8oAJoQitAal2gSPc3chRWDNOBJ0C2ltWYIUpStf2GQ=="
        self.org = "instrumentasi"
        self.bucket = "monitoring"
        self.client = None
        self.timer = QTimer()
        self.timer.timeout.connect(self.query_data)
        self.max_points = 60
        self.temp_data = []
        self.hum_data = []
        
        # ================== FITUR ALARM ==================
        self.blink_state = True # Untuk logika kedip
        # Definisikan stylesheet untuk mudah digunakan kembali
        self.STYLE_SAFE = "background-color: #2ecc71; color: white; border-radius: 5px;"
        self.STYLE_ALARM_ON = "background-color: #e74c3c; color: white; border-radius: 5px;"
        self.STYLE_ALARM_OFF = "background-color: #c0392b; color: white; border-radius: 5px;"
        self.set_initial_status_styles()
        # ===============================================

    def set_initial_status_styles(self):
        # Atur style awal
        initial_style = "background-color: #bdc3c7; color: black; border-radius: 5px;"
        self.temp_status_box.setStyleSheet(initial_style)
        self.hum_status_box.setStyleSheet(initial_style)

    def setup_charts(self):
        # Fungsi ini untuk merapikan kode __init__
        # Grafik Suhu
        self.temp_chart = QChart()
        self.temp_chart.setTitle("Grafik Temperatur (°C)")
        self.temp_series = QLineSeries(name="Temperatur")
        self.temp_series.setPointsVisible(True)
        self.temp_chart.addSeries(self.temp_series)
        self.temp_axis_x = QDateTimeAxis()
        self.temp_axis_x.setFormat("HH:mm:ss")
        self.temp_axis_x.setTitleText("Waktu")
        self.temp_axis_x.setTickCount(10)
        self.temp_chart.addAxis(self.temp_axis_x, Qt.AlignBottom)
        self.temp_series.attachAxis(self.temp_axis_x)
        self.temp_axis_y = QValueAxis()
        self.temp_axis_y.setLabelFormat("%.1f")
        self.temp_axis_y.setTitleText("Temperatur")
        self.temp_chart.addAxis(self.temp_axis_y, Qt.AlignLeft)
        self.temp_series.attachAxis(self.temp_axis_y)
        self.temp_axis_y.setRange(15, 70) # Rentang diperluas sedikit
        self.temp_chart.legend().hide()
        self.temp_chart_view.setChart(self.temp_chart)
        self.temp_chart_view.setRenderHint(QPainter.Antialiasing)

        # Grafik Kelembapan
        self.hum_chart = QChart()
        self.hum_chart.setTitle("Grafik Kelembapan (%)")
        self.hum_series = QLineSeries(name="Kelembapan")
        self.hum_series.setColor(QColor("green"))
        self.hum_series.setPointsVisible(True)
        self.hum_chart.addSeries(self.hum_series)
        self.hum_axis_x = QDateTimeAxis()
        self.hum_axis_x.setFormat("HH:mm:ss")
        self.hum_axis_x.setTitleText("Waktu")
        self.hum_axis_x.setTickCount(10)
        self.hum_chart.addAxis(self.hum_axis_x, Qt.AlignBottom)
        self.hum_series.attachAxis(self.hum_axis_x)
        self.hum_axis_y = QValueAxis()
        self.hum_axis_y.setLabelFormat("%.1f")
        self.hum_axis_y.setTitleText("Kelembapan")
        self.hum_chart.addAxis(self.hum_axis_y, Qt.AlignLeft)
        self.hum_series.attachAxis(self.hum_axis_y)
        self.hum_axis_y.setRange(0, 100)
        self.hum_chart.legend().hide()
        self.hum_chart_view.setChart(self.hum_chart)
        self.hum_chart_view.setRenderHint(QPainter.Antialiasing)

    def query_data(self):
        try:
            # ... (Logika query InfluxDB tidak berubah)
            query_api = self.client.query_api()
            flux_query = f'''
                from(bucket: "{self.bucket}")
                    |> range(start: -2m)
                    |> filter(fn: (r) => r._measurement == "environment_monitoring")
                    |> filter(fn: (r) => r._field == "temperature_celsius" or r._field == "humidity_percent")
                    |> last()
                    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            '''
            tables = query_api.query(flux_query)
            if not tables or not tables[0].records:
                print("Tidak ada data baru.")
                return
            record = tables[0].records[-1]
            temp_f = record["temperature_celsius"]
            hum_f = record["humidity_percent"]
            self.temp_label.setText(f"Temperatur: {temp_f:.2f} °C")
            self.hum_label.setText(f"Kelembapan: {hum_f:.2f} %")
            
            # ================== FITUR ALARM ==================
            # Cek Batas Suhu (24-30 °C)
            if 24 <= temp_f <= 35:
                self.temp_status_box.setText("TEMPERATUR OPTIMAL")
                self.temp_status_box.setStyleSheet(self.STYLE_SAFE)
            else:
                self.temp_status_box.setText("TEMPERATUR DI LUAR BATAS!")
                # Logika Kedip
                if self.blink_state:
                    self.temp_status_box.setStyleSheet(self.STYLE_ALARM_ON)
                else:
                    self.temp_status_box.setStyleSheet(self.STYLE_ALARM_OFF)

            # Cek Batas Kelembapan (50-70 %)
            if 50 <= hum_f <= 70:
                self.hum_status_box.setText("KELEMBAPAN OPTIMAL")
                self.hum_status_box.setStyleSheet(self.STYLE_SAFE)
            else:
                self.hum_status_box.setText("KELEMBAPAN DI LUAR BATAS!")
                # Logika Kedip
                if self.blink_state:
                    self.hum_status_box.setStyleSheet(self.STYLE_ALARM_ON)
                else:
                    self.hum_status_box.setStyleSheet(self.STYLE_ALARM_OFF)
            
            # Toggle state untuk kedipan berikutnya
            self.blink_state = not self.blink_state
            # ===============================================

            # ... (Logika update grafik tidak berubah)
            timestamp = record.get_time()
            dt = QDateTime.fromSecsSinceEpoch(int(timestamp.timestamp()))
            self.temp_data.append((dt, temp_f))
            self.hum_data.append((dt, hum_f))
            if len(self.temp_data) > self.max_points: self.temp_data.pop(0)
            if len(self.hum_data) > self.max_points: self.hum_data.pop(0)
            self.temp_series.clear()
            for dt, val in self.temp_data: self.temp_series.append(dt.toMSecsSinceEpoch(), val)
            self.hum_series.clear()
            for dt, val in self.hum_data: self.hum_series.append(dt.toMSecsSinceEpoch(), val)
            if self.temp_data:
                first_timestamp = self.temp_data[0][0]
                last_timestamp = self.temp_data[-1][0]
                if first_timestamp != last_timestamp:
                    self.temp_axis_x.setMin(first_timestamp)
                    self.temp_axis_x.setMax(last_timestamp)
                    self.hum_axis_x.setMin(first_timestamp)
                    self.hum_axis_x.setMax(last_timestamp)

        except Exception as e:
            self.stop_query()
            QMessageBox.critical(self, "Query Error", f"Gagal mengambil data dari InfluxDB:\n{e}")

    # ... (Fungsi start_query, stop_query, save_charts_as_image tidak ada perubahan)
    def start_query(self):
        try:
            self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
            if self.client.ping():
                self.status_label.setText("Status Koneksi: ✅ Terhubung ke InfluxDB")
                self.status_label.setStyleSheet("font-weight: bold; color: green;")
                self.start_button.setEnabled(False)
                self.stop_button.setEnabled(True)
                self.timer.start(2000)
            else: raise Exception("Ping ke InfluxDB gagal.")
        except Exception as e:
            self.status_label.setText("Status Koneksi: ❌ Gagal Terhubung")
            self.status_label.setStyleSheet("font-weight: bold; color: red;")
            QMessageBox.critical(self, "Error", f"InfluxDB connection failed:\n{e}")
    def stop_query(self):
        self.timer.stop()
        self.status_label.setText("Status Koneksi: ❌ Terputus")
        self.status_label.setStyleSheet("font-weight: bold; color: red;")
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.set_initial_status_styles()
    def save_charts_as_image(self):
        path, _ = QFileDialog.getSaveFileName(self, "Simpan Grafik", "grafik-monitoring.png", "Images (*.png *.jpg)")
        if path:
            pixmap_temp = self.temp_chart_view.grab()
            pixmap_hum = self.hum_chart_view.grab()
            composite_pixmap = QPixmap(pixmap_temp.width(), pixmap_temp.height() + pixmap_hum.height())
            composite_pixmap.fill(Qt.white)
            painter = QPainter(composite_pixmap)
            painter.drawPixmap(QPoint(0, 0), pixmap_temp)
            painter.drawPixmap(QPoint(0, pixmap_temp.height()), pixmap_hum)
            painter.end()
            if composite_pixmap.save(path): QMessageBox.information(self, "Berhasil", f"Grafik berhasil disimpan di:\n{path}")
            else: QMessageBox.warning(self, "Gagal", "Gagal menyimpan gambar.")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    gui = InfluxGUI()
    gui.show()
    sys.exit(app.exec_())