// src/pages/Lieferantenliste.jsx
import React, { useState } from "react";

// Hilfsfunktion für sortierbare Spaltenüberschriften
function ThColumn({ label, sortKey, sortKeyState, onSort }) {
  const { sortKey: currentKey, sortOrder } = sortKeyState;
  const arrow =
    currentKey === sortKey ? (sortOrder === "asc" ? " ▲" : " ▼") : "";
  return (
    <th
      className="p-3 cursor-pointer whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {arrow}
    </th>
  );
}

const Lieferantenliste = () => {
  // Dummy-Daten – jetzt mit "bestelltage" und "liefertage" als Arrays.
  const [lieferanten] = useState([
    {
      id: 1,
      name: "CocaCola GmbH",
      homepage: "https://www.coca-cola.com",
      login: "admin",
      pw: "pass123",
      bestelltage: ["Montag", "Mittwoch"],
      liefertage: ["Donnerstag"],
    },
    {
      id: 2,
      name: "Nestlé Deutschland AG",
      homepage: "",
      login: "nestle_user",
      pw: "securepass",
      bestelltage: ["Dienstag"],
      liefertage: ["Freitag", "Samstag"],
    },
    {
      id: 3,
      name: "PepsiCo Europe",
      homepage: "https://www.pepsi.com",
      login: "pepsi_admin",
      pw: "pepsipass",
      bestelltage: ["Montag", "Freitag"],
      liefertage: ["Mittwoch", "Donnerstag"],
    },
  ]);

  // Suchfeld (Filterung nach Name)
  const [searchTerm, setSearchTerm] = useState("");
  // Sortierung
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  // Paginierung
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter: Suche nach Name (in Kleinbuchstaben)
  const filteredLieferanten = lieferanten.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sortierung: Bei Arrays werden diese in Strings (kommagetrennt) umgewandelt.
  const sortedLieferanten = [...filteredLieferanten].sort((a, b) => {
    let valA = a[sortKey] || "";
    let valB = b[sortKey] || "";
    if (Array.isArray(valA)) {
      valA = valA.join(", ");
    }
    if (Array.isArray(valB)) {
      valB = valB.join(", ");
    }
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  // Paginierung
  const totalPages =
    pageSize === "all" ? 1 : Math.ceil(sortedLieferanten.length / pageSize);
  const currentLieferanten =
    pageSize === "all"
      ? sortedLieferanten
      : sortedLieferanten.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // CSV-Export: Nun mit den neuen Spalten
  const handleExportCSV = () => {
    const header =
      "Lieferant;Homepage;Login-Name;Passwort;Bestelltage;Liefertage";
    const rows = sortedLieferanten.map(
      (l) =>
        `${l.name};${l.homepage || "-"};${l.login || "-"};${l.pw || "-"};${(l.bestelltage || []).join(
          ", "
        )};${(l.liefertage || []).join(", ")}`
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lieferantenliste.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-6">
      <h1 className="text-3xl font-bold mb-4">Lieferantenliste</h1>

      {/* Suchfeld */}
      <div className="max-w-xl space-y-2">
        <label className="font-medium block">Lieferanten suchen</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 rounded bg-gray-700 focus:outline-none w-full"
          placeholder="z. B. CocaCola"
        />
      </div>

      {/* CSV-Export Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-blue-500 rounded"
        >
          Export CSV
        </button>
      </div>

      {/* Tabelle */}
      <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <ThColumn
                label="Lieferant"
                sortKey="name"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Homepage"
                sortKey="homepage"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Login-Name"
                sortKey="login"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Passwort"
                sortKey="pw"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Bestelltage"
                sortKey="bestelltage"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Liefertage"
                sortKey="liefertage"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {currentLieferanten.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-400">
                  Keine Lieferanten gefunden.
                </td>
              </tr>
            ) : (
              currentLieferanten.map((l, idx) => (
                <tr
                  key={l.id}
                  className={`border-b border-gray-700 hover:bg-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/90"
                  }`}
                >
                  <td className="p-3">{l.name}</td>
                  <td className="p-3">
                    {l.homepage ? (
                      <a
                        href={l.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {l.homepage}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{l.login || "-"}</td>
                  <td className="p-3">{l.pw || "-"}</td>
                  <td className="p-3">{(l.bestelltage || []).join(", ")}</td>
                  <td className="p-3">{(l.liefertage || []).join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-4 w-full">
        <div>
          <label className="font-medium mr-2">Zeilen pro Seite:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === "all" ? "all" : parseInt(e.target.value, 10);
              setPageSize(val);
              setCurrentPage(1);
            }}
            className="p-1 rounded bg-gray-700"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value="all">Alle</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (pageSize !== "all" && currentPage > 1)
                setCurrentPage(currentPage - 1);
            }}
            disabled={pageSize === "all" || currentPage <= 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            &lt; Prev
          </button>
          <span>
            Seite {currentPage} /{" "}
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(filteredLieferanten.length / pageSize))}
          </span>
          <button
            onClick={() => {
              if (pageSize !== "all" && currentPage < totalPages)
                setCurrentPage(currentPage + 1);
            }}
            disabled={pageSize === "all" || currentPage >= totalPages}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lieferantenliste;
