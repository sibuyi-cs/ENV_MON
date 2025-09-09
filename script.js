// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Replace with your project URL and anon key
const SUPABASE_URL = 'https://lpaczuvwlsjsaotarkrj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWN6dXZ3bHNqc2FvdGFya3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQ5MjMsImV4cCI6MjA2MTU3MDkyM30.d1M_7Jfdyeow9OMHdUuQoKjxNR5SIhVZx86vkbL-kWs'

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const fetchBtn = document.getElementById("fetchData");
  const downloadExcelBtn = document.getElementById("downloadExcel");
  const downloadPDFBtn = document.getElementById("downloadPDF");

  let labels_ = [], tempData = [], humidityData = [], windData = [];

  // Set default date range to past 7 days
  window.onload = () => {
    const today = new Date();
    const pastWeek = new Date(today);
    pastWeek.setDate(today.getDate() - 7);

    document.getElementById("startDate").value = pastWeek.toISOString().split("T")[0];
    document.getElementById("endDate").value = today.toISOString().split("T")[0];
  };


fetchBtn.addEventListener("click", async () => {
  const rawStartDate = document.getElementById("startDate").value;
  const rawEndDate = document.getElementById("endDate").value;
  const startDate = rawStartDate + "T00:00:00";
  const endDate = rawEndDate + "T23:59:59";

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const { data, error } = await supabase
    .from('enviroment-monitoring-current-data')
    .select('sensor_name,sensor_value,Unit,created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    alert("Error fetching data: " + error.message);
    console.error('Error fetching data:', error);
    return;
  }
  console.log(data);

  // Save data globally for export if needed
  window.rawData = data;

  renderRawTable(data);

  downloadExcelBtn.style.display = "inline-block";
  downloadPDFBtn.style.display = "inline-block";
});

function renderRawTable(data) {
  const headRow = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");

  // Set table headers
  headRow.innerHTML = `
    <th>Time</th>
    <th>Sensor Name</th>
    <th>Sensor Value</th>
    <th>Unit</th>
  `;

  // Fill table body with every row as is
  body.innerHTML = data.map(row => `
    <tr>
      <td>${new Date(row.created_at).toLocaleString()}</td>
      <td>${row.sensor_name}</td>
      <td>${row.sensor_value}</td>
      <td>${row.Unit}</td>
    </tr>
  `).join('');

  document.getElementById("tableSection").style.display = "block";
}

downloadExcelBtn.addEventListener("click", () => {
  if (!window.rawData || window.rawData.length === 0) {
    alert("No data to export. Please fetch data first.");
    return;
  }

  const includeTemp = document.getElementById("exportTemp").checked;
  const includeHumidity = document.getElementById("exportHumidity").checked;
  const includeWind = document.getElementById("exportWind").checked;

  const headers = ["Time", "Sensor Name", "Sensor Value", "Unit"];
  const wb = XLSX.utils.book_new();
  const ws_data = [headers];

  // Filter data based on checkboxes
  const filteredData = window.rawData.filter(row => {
    if (row.sensor_name === "Temperature" && includeTemp) return true;
    if (row.sensor_name === "Humidity" && includeHumidity) return true;
    if (row.sensor_name === "Wind Speed" && includeWind) return true;
    return false;
  });

  filteredData.forEach(row => {
    ws_data.push([
      new Date(row.created_at).toLocaleString(),
      row.sensor_name,
      row.sensor_value,
      row.Unit
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "WeatherData");
  XLSX.writeFile(wb, "weather_data.xlsx");
});


downloadPDFBtn.addEventListener("click", () => {
  if (!window.rawData || window.rawData.length === 0) {
    alert("No data to export. Please fetch data first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const includeTemp = document.getElementById("exportTemp").checked;
  const includeHumidity = document.getElementById("exportHumidity").checked;
  const includeWind = document.getElementById("exportWind").checked;

  const head = [["Time", "Sensor Name", "Sensor Value", "Unit"]];

  // Filter data based on checkboxes
  const filteredData = window.rawData.filter(row => {
    if (row.sensor_name === "Temperature" && includeTemp) return true;
    if (row.sensor_name === "Humidity" && includeHumidity) return true;
    if (row.sensor_name === "Wind Speed" && includeWind) return true;
    return false;
  });

  const body = filteredData.map(row => [
    new Date(row.created_at).toLocaleString(),
    row.sensor_name,
    row.sensor_value,
    row.Unit
  ]);

  doc.text("Weather Data Export", 14, 20);
  doc.autoTable({ startY: 30, head, body, theme: 'grid' });
  doc.save("weather_data.pdf");
});



supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.href = 'index.html'
  }
})

document.getElementById("returnDashboard").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
