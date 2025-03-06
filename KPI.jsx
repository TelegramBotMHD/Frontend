// KPI.jsx
import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrierung der ChartJS-Module
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const KPI = () => {
  // Steuerung: Zeitraum und Vergleichstyp
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-06-30");
  const [comparisonType, setComparisonType] = useState("month"); // Optionen: week, month, year

  // KPI-Daten (Dummy-Daten)
  const [revenueData, setRevenueData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [utilizationData, setUtilizationData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [onlineOfflineData, setOnlineOfflineData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulierter API-Abruf, der auch die Steuerung berücksichtigt
  const fetchKpiData = async () => {
    // Hier könnten echte API-Aufrufe mit Übergabe von startDate, endDate und comparisonType erfolgen.
    // Wir simulieren hier Dummy-Daten, die je nach Vergleichstyp leicht variieren.
    const variation = comparisonType === "week" ? 5 : comparisonType === "year" ? 15 : 10;
    
    // Umsatz (Liniendiagramm)
    const dummyRevenueData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"],
      datasets: [
        {
          label: `Umsatz (Tsd. EUR) – Vergleich: ${comparisonType}`,
          data: [120, 150, 130, 170, 200, 190].map((val) => val + Math.floor(Math.random() * variation)),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // Lagerbestand (Balkendiagramm)
    const dummyInventoryData = {
      labels: ["Produkt A", "Produkt B", "Produkt C", "Produkt D"],
      datasets: [
        {
          label: "Lagerbestand",
          data: [80, 120, 60, 100].map((val) => val + Math.floor(Math.random() * variation)),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Gewinnentwicklung (Liniendiagramm)
    const dummyProfitData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"],
      datasets: [
        {
          label: "Gewinn (Tsd. EUR)",
          data: [30, 40, 35, 50, 45, 55].map((val) => val + Math.floor(Math.random() * variation)),
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // Auslastung (Doughnut-Diagramm)
    const dummyUtilizationData = {
      labels: ["Voll ausgelastet", "Teilweise", "Nicht ausgelastet"],
      datasets: [
        {
          label: "Auslastung",
          data: [60, 25, 15].map((val) => val + Math.floor(Math.random() * 3) - 1),
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Kundenentwicklung (Liniendiagramm)
    const dummyCustomerData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"],
      datasets: [
        {
          label: "Kunden (Anzahl)",
          data: [200, 220, 210, 230, 250, 240].map((val) => val + Math.floor(Math.random() * variation * 2)),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // Online vs. Offline Sales (Doughnut-Diagramm)
    const dummyOnlineOfflineData = {
      labels: ["Online", "Offline"],
      datasets: [
        {
          label: "Vertriebskanal",
          data: [70, 30].map((val) => val + Math.floor(Math.random() * 5)),
          backgroundColor: [
            "rgba(255, 205, 86, 0.6)",
            "rgba(201, 203, 207, 0.6)",
          ],
          borderColor: [
            "rgba(255, 205, 86, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    setRevenueData(dummyRevenueData);
    setInventoryData(dummyInventoryData);
    setProfitData(dummyProfitData);
    setUtilizationData(dummyUtilizationData);
    setCustomerData(dummyCustomerData);
    setOnlineOfflineData(dummyOnlineOfflineData);
    setLoading(false);
  };

  // Daten initial abrufen und alle 60 Sekunden aktualisieren sowie bei Änderung der Steuerung
  useEffect(() => {
    setLoading(true);
    fetchKpiData();
    const intervalId = setInterval(() => {
      fetchKpiData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [startDate, endDate, comparisonType]);

  // Chart-Optionen
  const commonOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title },
    },
  });

  if (
    loading ||
    !revenueData ||
    !inventoryData ||
    !profitData ||
    !utilizationData ||
    !customerData ||
    !onlineOfflineData
  ) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        Daten werden geladen...
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded shadow mx-4 my-6">
      <h2 className="text-2xl font-bold mb-4 text-white">KPI Übersicht</h2>

      {/* Steuerungsbereich: Datumsauswahl und Vergleich */}
      <div className="bg-gray-700 p-4 rounded mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div>
            <label className="text-white font-medium mr-2">Startdatum:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded bg-gray-600 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-white font-medium mr-2">Enddatum:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded bg-gray-600 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-white font-medium mr-2">Vergleich:</label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="p-2 rounded bg-gray-600 text-white focus:outline-none"
            >
              <option value="week">Woche-Woche</option>
              <option value="month">Monat-Monat</option>
              <option value="year">Jahr-Jahr</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid-Layout für sechs Diagramme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Umsatzdiagramm */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Line data={revenueData} options={commonOptions("Umsatzentwicklung")} />
        </div>
        {/* Lagerbestand */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Bar data={inventoryData} options={commonOptions("Lagerbestand")} />
        </div>
        {/* Gewinnentwicklung */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Line data={profitData} options={commonOptions("Gewinnentwicklung")} />
        </div>
        {/* Auslastung */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Doughnut data={utilizationData} options={commonOptions("Auslastung")} />
        </div>
        {/* Kundenentwicklung */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Line data={customerData} options={commonOptions("Kundenentwicklung")} />
        </div>
        {/* Online vs. Offline Sales */}
        <div className="w-full h-64 sm:h-80 md:h-96">
          <Doughnut data={onlineOfflineData} options={commonOptions("Vertriebskanal")} />
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Daten werden alle 60 Sekunden automatisch aktualisiert.
      </p>
    </div>
  );
};

export default KPI;
