// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Replace with your project URL and anon key
const SUPABASE_URL = 'https://lpaczuvwlsjsaotarkrj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWN6dXZ3bHNqc2FvdGFya3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQ5MjMsImV4cCI6MjA2MTU3MDkyM30.d1M_7Jfdyeow9OMHdUuQoKjxNR5SIhVZx86vkbL-kWs'

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


// Variables to store sensor values
let getRandomTemp = 0
let getRandomHumidity = 0
let getRandomWind = 0
let autoStatus = 'offine'



const toggleButton = document.getElementById('notchToggle');
const dropdownMenu = document.getElementById('notchDropdown');

toggleButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
});

// Hide dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!document.querySelector('.notch-menu').contains(e.target)) {
        dropdownMenu.classList.add('hidden');
    }
});




// Fetch Supabase data
async function fetchSensorData() {
  const { data, error } = await supabase
    .from('enviroment-monitoring-current-data')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
    return null
  }
  
  return data
}

// Assign values from Supabase
async function fetchAndAssignSensorValues() {
  const data = await fetchSensorData()
  if (!data) return

  data.forEach(sensor => {
    switch (sensor.sensor_name) {
      case 'Temperature':
        getRandomTemp = sensor.sensor_value
        break
      case 'Humidity':
        getRandomHumidity = sensor.sensor_value
        break
      case 'Wind Speed':
        getRandomWind = sensor.sensor_value
        break
    }
  })
}






// Data arrays
const labels = [];
const tempData = [];
const humidityData = [];
const windData = [];

// Chart.js chart creation helper
function createChart(ctxId, label, color) {
    return new Chart(document.getElementById(ctxId).getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: [],
                backgroundColor: color.replace('1)', '0.2)'),
                borderColor: color,
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Main charts
const tempChart = createChart('tempHistoryChart', 'Temperature (°C)', 'rgba(255,99,132,1)');
const humidityChart = createChart('humidityHistoryChart', 'Humidity (%)', 'rgba(54,162,235,1)');
const windChart = createChart('windHistoryChart', 'Wind Speed (km/h)', 'rgba(75,192,192,1)');

// Combined chart
const combinedChart = new Chart(document.getElementById('combinedChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: tempData,
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 2,
                fill: false,
                tension: 0.3
            },
            {
                label: 'Humidity (%)',
                data: humidityData,
                backgroundColor: 'rgba(54,162,235,0.2)',
                borderColor: 'rgba(54,162,235,1)',
                borderWidth: 2,
                fill: false,
                tension: 0.3
            },
            {
                label: 'Wind Speed (km/h)',
                data: windData,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: { y: { beginAtZero: false } }
    }
});

// Mini charts for metric cards
const tempCardChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: 'rgba(255,99,132,1)',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
    }
});

const humidityCardChart = new Chart(document.getElementById('humidityChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: 'rgba(54,162,235,1)',
            backgroundColor: 'rgba(54,162,235,0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
    }
});

const windCardChart = new Chart(document.getElementById('windChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
    }
});





// Stats updater
function updateStats(data, minId, maxId, avgId, unit) {
    if (data.length === 0) return;
    const min = Math.min(...data).toFixed(1);
    const max = Math.max(...data).toFixed(1);
    const avg = (data.reduce((a, b) => a + Number(b), 0) / data.length).toFixed(1);
    document.getElementById(minId).textContent = `${min} ${unit}`;
    document.getElementById(maxId).textContent = `${max} ${unit}`;
    document.getElementById(avgId).textContent = `${avg} ${unit}`;
}

// Metric card updaters
function updateTemperatureCard(newTemp) {
    document.getElementById('temperature').textContent = newTemp;
    let status = "Normal";
    if (newTemp < 0) status = "Freezing ❄️";
    else if (newTemp > 30) status = "Hot 🔥";
    document.getElementById('tempStatus').textContent = status;
    const now = new Date().toLocaleTimeString();
    tempCardChart.data.labels.push(now);
    tempCardChart.data.datasets[0].data.push(newTemp);
    if (tempCardChart.data.labels.length > 10) {
        tempCardChart.data.labels.shift();
        tempCardChart.data.datasets[0].data.shift();
    }
    tempCardChart.update();
}

function updateHumidityCard(newHumidity) {
    document.getElementById('humidity').textContent = newHumidity;
    document.getElementById('humidityFill').style.width = `${newHumidity}%`;
    let status = "Normal";
    if (newHumidity < 30) status = "Dry 🌵";
    else if (newHumidity > 70) status = "Humid 💦";
    document.getElementById('humidityStatus').textContent = status;
    const now = new Date().toLocaleTimeString();
    humidityCardChart.data.labels.push(now);
    humidityCardChart.data.datasets[0].data.push(newHumidity);
    if (humidityCardChart.data.labels.length > 10) {
        humidityCardChart.data.labels.shift();
        humidityCardChart.data.datasets[0].data.shift();
    }
    humidityCardChart.update();
}

function updateWindCard(newWindSpeed) {
    document.getElementById('windSpeed').textContent = newWindSpeed;
    let status = "Calm 🌿";
    if (newWindSpeed > 5 && newWindSpeed <= 20) status = "Breezy 🍃";
    else if (newWindSpeed > 20 && newWindSpeed <= 40) status = "Windy 💨";
    else if (newWindSpeed > 40) status = "Stormy 🌪️";
    document.getElementById('windStatus').textContent = status;
    const direction = Math.floor(Math.random() * 360);
    document.getElementById('windDirection').style.transform = `rotate(${direction}deg)`;
    const now = new Date().toLocaleTimeString();
    windCardChart.data.labels.push(now);
    windCardChart.data.datasets[0].data.push(newWindSpeed);
    if (windCardChart.data.labels.length > 10) {
        windCardChart.data.labels.shift();
        windCardChart.data.datasets[0].data.shift();
    }
    windCardChart.update();
}

// Unified chart and card update
function updateCharts() {
    const now = new Date().toLocaleTimeString();
    const temp = parseFloat(getRandomTemp);
    const humidity = parseFloat(getRandomHumidity);
    const wind = parseFloat(getRandomWind);

    labels.push(now);
    tempData.push(temp);
    humidityData.push(humidity);
    windData.push(wind);

    if (labels.length > 20) {
        labels.shift();
        tempData.shift();
        humidityData.shift();
        windData.shift();
    }

    tempChart.data.datasets[0].data = tempData;
    humidityChart.data.datasets[0].data = humidityData;
    windChart.data.datasets[0].data = windData;
    combinedChart.update();
    tempChart.update();
    humidityChart.update();
    windChart.update();

    updateStats(tempData, 'tempMin', 'tempMax', 'tempAvg', '°C');
    updateStats(humidityData, 'humidityMin', 'humidityMax', 'humidityAvg', '%');
    updateStats(windData, 'windMin', 'windMax', 'windAvg', 'km/h');

    updateTemperatureCard(temp);
    updateHumidityCard(humidity);
    updateWindCard(wind);
    checkWeatherAlerts(temp, humidity, wind);
}



// ===== Update last updated time =====
function updateLastUpdated() {
    document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString();
}

// ===== Auto toggle button =====
document.getElementById("autoToggle").addEventListener("click", function () {
    // Only update the text node, not the SVG
    const btn = this;
    const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (btn.textContent.includes("ON")) {
        if (textNode) textNode.textContent = "Auto OFF";
        btn.classList.remove("green");
        btn.classList.add("blue");
        autoStatus = 'online';
        console.log("Auto mode enabled");
    } else {
        if (textNode) textNode.textContent = "Auto ON";
        btn.classList.remove("blue");
        btn.classList.add("green");
        autoStatus = 'offline';
        console.log("Auto mode disabled");
    }
});


function checkWeatherAlerts(temp, humidity, wind) {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = ''; // Clear previous alerts

    let alerts = [];

    if (temp >= 35) {
        alerts.push({ message: `🔥 Extreme Heat Alert: ${temp}°C`, type: 'heat' });
    } else if (temp >= 30) {
        alerts.push({ message: `☀️ Very Hot: ${temp}°C`, type: 'hot' });
    } else if (temp <= 0) {
        alerts.push({ message: `❄️ Freezing Temperature: ${temp}°C`, type: 'cold' });
    }

    if (humidity >= 80) {
        alerts.push({ message: `💧 High Humidity: ${humidity}%`, type: 'humidity' });
    } else if (humidity <= 20) {
        alerts.push({ message: `🌵 Low Humidity: ${humidity}%`, type: 'humidity' });
    }

    if (wind >= 50) {
        alerts.push({ message: `🌪️ Storm Winds: ${wind} km/h`, type: 'wind' });
    } else if (wind >= 30) {
        alerts.push({ message: `💨 Strong Wind: ${wind} km/h`, type: 'wind' });
    }

    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<div class="no-alerts">No active alerts</div>';
        return;
    }

    // Add alert items to DOM
    alerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = 'alert-item';
        alertEl.textContent = alert.message;
        alertsContainer.appendChild(alertEl);
    });
}


// ===== Export button placeholder =====
document.getElementById("exportBtn").addEventListener("click", function () {
  const popup = window.open("", "ExportWindow", "width=600,height=500");

  const tableRows = labels.map((time, i) => `
    <tr>
      <td>${time}</td>
      <td>${tempData[i]}</td>
      <td>${humidityData[i]}</td>
      <td>${windData[i]}</td>
    </tr>`).join('');

  popup.document.write(`
    <html>
    <head>
      <title>Export Weather Data</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        button {
          margin: 10px 10px 0 0;
          padding: 8px 12px;
          border: none;
          border-radius: 5px;
          background: #f0f0f0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        button:hover { background: #5c44443b; }
        svg { vertical-align: middle; }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
    </head>
    <body>
      <h2>Export Weather Data</h2>
      <button id="popupDownloadCSV">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" role="img" aria-label="CSV file icon">
        <!-- Background shadow -->
        <rect x="10" y="6" width="44" height="56" rx="6" ry="6" fill="#0f172a" opacity="0.05"/>
        
        <!-- Document body -->
        <rect x="8" y="4" width="40" height="56" rx="6" ry="6" fill="#16a34a"/>
        
        <!-- Folded corner -->
        <path d="M48 4 L56 12 L48 12 Z" fill="#0d8a3e"/>
        
        <!-- Table/grid hint -->
        <g transform="translate(14,18)" stroke="#ffffff" stroke-width="1.2" opacity="0.75">
            <rect x="0" y="0" width="28" height="20" fill="none" rx="2"/>
            <line x1="0" y1="6.7" x2="28" y2="6.7"/>
            <line x1="0" y1="13.3" x2="28" y2="13.3"/>
            <line x1="9.3" y1="0" x2="9.3" y2="20"/>
            <line x1="18.7" y1="0" x2="18.7" y2="20"/>
        </g>
        
        <!-- CSV text -->
        <text x="28" y="49" font-family="Inter, Arial, Helvetica, sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="#ffffff">
            CSV
        </text>
        </svg>
        Download CSV
      </button>
      <button id="popupDownloadPDF">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64">
        <!-- Document shape -->
        <rect x="8" y="4" width="40" height="56" rx="4" ry="4" fill="#e53e3e"/>
        <!-- Folded corner -->
        <polygon points="48,4 56,12 48,12" fill="#c53030"/>
        <!-- PDF text -->
        <text x="14" y="38" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#fff">
            PDF
        </text>
        </svg>
        Download PDF
      </button>
      <table id="exportTable">
        <thead>
          <tr><th>Time</th><th>Temperature (°C)</th><th>Humidity (%)</th><th>Wind Speed (km/h)</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <script>
        const { jsPDF } = window.jspdf;
        const labels = ${JSON.stringify(labels)};
        const tempData = ${JSON.stringify(tempData)};
        const humidityData = ${JSON.stringify(humidityData)};
        const windData = ${JSON.stringify(windData)};

        document.getElementById("popupDownloadCSV").onclick = function () {
          let csv = "Time,Temperature (°C),Humidity (%),Wind Speed (km/h)\\n";
          labels.forEach((t, i) => csv += \`\${t},\${tempData[i]},\${humidityData[i]},\${windData[i]}\\n\`);
          const blob = new Blob([csv], { type: "text/csv" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "weather_data.csv";
          link.click();
        };

        document.getElementById("popupDownloadPDF").onclick = function () {
          const doc = new jsPDF();
          doc.setFontSize(14);
          doc.text("Weather Data Export", 14, 20);
          doc.autoTable({
            startY: 30,
            head: [["Time", "Temperature (°C)", "Humidity (%)", "Wind Speed (km/h)"]],
            body: labels.map((t, i) => [t, tempData[i], humidityData[i], windData[i]]),
            theme: 'grid'
          });
          doc.save("weather_data.pdf");
        };
      </script>
    </body>
    </html>
  `);

  popup.document.close();
});


const logoutButton = document.getElementById('logout-button')

logoutButton.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    alert('Logout failed: ' + error.message)
  } else {
    alert('Logged out successfully')
    window.location.reload() // or redirect to login page
  }
})




document.getElementById('databaseBtn').addEventListener('click', () => {
  window.location.href = 'export_database.html';
});



// Button references
const loginBtn = document.getElementById('login-button')
const logoutBtn = document.getElementById('logout-button')

// Check current auth state on load
supabase.auth.getSession().then(({ data: { session } }) => {
  toggleAuthButtons(session)
})

// Auth state listener (fires on login/logout)
supabase.auth.onAuthStateChange((event, session) => {
  toggleAuthButtons(session)
})

// Logout logic
logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    alert('Logout failed: ' + error.message)
  } else {
    alert('Logged out')
  }
})

// Toggle visibility based on session
function toggleAuthButtons(session) {
  if (session?.user) {
    loginBtn.style.display = 'none'
    logoutBtn.style.display = 'inline-block'
  } else {
    loginBtn.style.display = 'inline-block'
    logoutBtn.style.display = 'none'
  }
}


supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.href = 'index.html'
  }
})



document.getElementById("refreshBtn").addEventListener("click", () => {
  // List of your canvas element IDs
  const canvasIds = [
    "tempHistoryChart",
    "humidityHistoryChart",
    "windHistoryChart",
    "combinedChart"
  ];

  canvasIds.forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
});


// Fetch and update every 2 seconds
setInterval(async () => {
    if (autoStatus === 'online') {
        await fetchAndAssignSensorValues()
        updateCharts()
        updateLastUpdated()
    }

}, 2000)





