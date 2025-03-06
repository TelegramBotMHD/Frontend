// src/pages/Kritische.jsx
import React, { useState } from "react";
import { format } from "date-fns";

// Dummy-Lieferanten mit individuellem Lieferzyklus
const dummySuppliers = [
  { id: 1, name: "CocaCola GmbH", lieferzyklusTage: 4 },
  { id: 2, name: "XY Getränkehandel", lieferzyklusTage: 3 },
  { id: 3, name: "ABC Lieferanten", lieferzyklusTage: 5 },
];

// Dummy-Artikel-Daten inklusive 28-tägiger Verkaufszahlen
const initialArticles = [
  {
    id: 1,
    name: "Coca Cola 0.5L",
    bestand: 50,
    verkaufLetzte7: 140,
    verkaufVorletzte7: 105,
    verkaufTage3und4: 210,
    dailySales28: [20, 18, 22, 19, 21, 20, 19, 18, 20, 22, 21, 19, 20, 20, 18, 21, 19, 20, 20, 22, 18, 19, 20, 21, 20, 19, 20, 20],
    lieferantId: 1,
  },
  {
    id: 2,
    name: "Fanta Orange 1L",
    bestand: 30,
    verkaufLetzte7: 70,
    verkaufVorletzte7: 60,
    verkaufTage3und4: 120,
    dailySales28: [8, 7, 9, 8, 8, 7, 8, 9, 7, 8, 8, 7, 8, 9, 8, 7, 8, 8, 9, 7, 8, 8, 7, 8, 9, 8, 7, 8],
    lieferantId: 2,
  },
  {
    id: 3,
    name: "Red Bull 0.25L",
    bestand: 20,
    verkaufLetzte7: 105,
    verkaufVorletzte7: 90,
    verkaufTage3und4: 150,
    dailySales28: [5, 4, 6, 5, 5, 4, 5, 6, 5, 5, 4, 5, 5, 6, 5, 5, 4, 5, 5, 6, 5, 5, 4, 5, 5, 6, 5, 5],
    lieferantId: 3,
  },
];

// Sicherheitsfaktor (z) – z. B. 1,65 für ca. 95% Service-Level
const Z = 1.65;

// Hilfsfunktion zur Berechnung der Standardabweichung
function calcStdev(values) {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

// Berechnet die Bestellmenge für einen Artikel
function computeOrderQty(art) {
  const vLastWeek = art.verkaufLetzte7 / 7;
  const vPrevWeek = art.verkaufVorletzte7 / 7;
  const vOld2Weeks = art.verkaufTage3und4 / 14;
  const V = (vLastWeek * 0.5) + (vPrevWeek * 0.3) + (vOld2Weeks * 0.2);
  let T = vPrevWeek > 0 ? vLastWeek / vPrevWeek : 1;
  T = Math.max(0.8, Math.min(T, 1.2)); // Begrenzung des Trendfaktors
  const sigma = calcStdev(art.dailySales28);
  const supplier = dummySuppliers.find((s) => s.id === art.lieferantId);
  const L = supplier ? supplier.lieferzyklusTage : 4;
  const SB = Z * sigma * Math.sqrt(L + 1);
  let orderQty = (V * L * T) + SB - art.bestand;
  return orderQty < 0 ? 0 : Math.round(orderQty);
}

// Komponente für sortierbare Spaltenüberschriften
function ThColumn({ label, sortKey, sortState, onSort }) {
  const { sortKey: currentKey, sortOrder } = sortState;
  const arrow = currentKey === sortKey ? (sortOrder === "asc" ? " ▲" : " ▼") : "";
  return (
    <th
      className="p-2 cursor-pointer whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

const Kritische = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(0);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtere Artikel basierend auf Suche und Lieferant
  const filteredArticles = initialArticles.filter((art) => {
    const term = searchTerm.toLowerCase();
    const matchName = art.name.toLowerCase().includes(term);
    const matchSupplier = selectedSupplier === 0 || art.lieferantId === selectedSupplier;
    return matchName && matchSupplier;
  });

  // Sortiere die gefilterten Artikel
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let valA, valB;
    switch (sortKey) {
      case "name":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "bestand":
        valA = a.bestand;
        valB = b.bestand;
        break;
      case "orderQty":
        valA = computeOrderQty(a);
        valB = computeOrderQty(b);
        break;
      default:
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Kritische Bestände / Bestellvorschläge</h1>

      {/* Filter: Suche und Lieferant */}
      <div className="flex flex-col md:flex-row gap-4 max-w-md mb-4">
        <input
          type="text"
          placeholder="Artikel suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-gray-700 w-full focus:outline-none"
        />
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(parseInt(e.target.value, 10))}
          className="p-2 rounded bg-gray-700 w-full focus:outline-none"
        >
          <option value={0}>Alle Lieferanten</option>
          {dummySuppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabelle */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <ThColumn label="Artikel" sortKey="name" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Bestand" sortKey="bestand" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <th className="p-2">Tagesverbrauch (V)</th>
              <th className="p-2">Trendfaktor (T)</th>
              <th className="p-2">Sicherheitsbestand (SB)</th>
              <th className="p-2">Art.-Nr.</th>
              <ThColumn label="Bestellvorschlag" sortKey="orderQty" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sortedArticles.map((art) => {
              // Berechnungen
              const vLastWeek = art.verkaufLetzte7 / 7;
              const vPrevWeek = art.verkaufVorletzte7 / 7;
              const vOld2Weeks = art.verkaufTage3und4 / 14;
              const V = (vLastWeek * 0.5) + (vPrevWeek * 0.3) + (vOld2Weeks * 0.2);
              let T = vPrevWeek > 0 ? vLastWeek / vPrevWeek : 1;
              T = Math.max(0.8, Math.min(T, 1.2));
              const sigma = calcStdev(art.dailySales28);
              const supplier = dummySuppliers.find((s) => s.id === art.lieferantId);
              const L = supplier ? supplier.lieferzyklusTage : 4;
              const SB = Z * sigma * Math.sqrt(L + 1);
              const orderQty = computeOrderQty(art);
              return (
                <tr key={art.id} className="border-b border-gray-600 hover:bg-gray-700">
                  <td className="p-2">{art.name}</td>
                  <td className="p-2">{art.bestand}</td>
                  <td className="p-2">{V.toFixed(1)} / Tag</td>
                  <td className="p-2">{T.toFixed(2)}</td>
                  <td className="p-2">{Math.round(SB)}</td>
                  <td className="p-2">{art.id}</td>
                  <td className="p-2 font-semibold text-yellow-400">{orderQty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Kritische;
