// src/pages/Artikelliste.jsx
import React, { useState } from "react";
import { useAlertModal, useConfirmModal } from "../components/useModals";
import ThColumn from "../components/ThColumn";
import TextInput from "../components/TextInput";

const calcProfit = (art) => {
  const profitEuro = art.vkp - art.ekpBrutto;
  const profitPerc = art.ekpBrutto > 0 ? (profitEuro / art.ekpBrutto) * 100 : 0;
  return { profitEuro, profitPerc };
};

const Artikelliste = () => {
  const { showAlert, AlertModal } = useAlertModal();
  // ConfirmModal wird hier nicht benötigt, kann aber bei Bedarf importiert werden

  // Dummy-Daten (analog zu Artikelverwaltung)
  const [articles] = useState([
    {
      artikelnummerAuto: 1001,
      artikelname: "Coca Cola 0.5L",
      ean: "1234567890123",
      ekpNetto: 0.5,
      pfand: 0.25,
      steuerSatz: 19,
      steuerBetrag: 0.143,
      ekpBrutto: 0.893,
      menge: 100,
      vkp: 1.19,
      lieferantId: 1,
      artikelnummerLieferant: "CC-500",
      link: "",
    },
    {
      artikelnummerAuto: 1002,
      artikelname: "Fanta Orange 1.0L",
      ean: "5554443332221",
      ekpNetto: 0.6,
      pfand: 0,
      steuerSatz: 19,
      steuerBetrag: 0.114,
      ekpBrutto: 0.714,
      menge: 50,
      vkp: 1.2,
      lieferantId: 2,
      artikelnummerLieferant: "Fanta-1L",
      link: "https://fanta.de",
    },
    {
      artikelnummerAuto: 1003,
      artikelname: "Coke Zero 0.5L",
      ean: "9876543210987",
      ekpNetto: 0.45,
      pfand: 0.25,
      steuerSatz: 19,
      steuerBetrag: 0.133,
      ekpBrutto: 0.833,
      menge: 80,
      vkp: 0.99,
      lieferantId: 1,
      artikelnummerLieferant: "CZ-500",
      link: "",
    },
  ]);

  // Dummy-Lieferanten
  const dummySuppliers = [
    { id: 0, name: "Alle" },
    { id: 1, name: "CocaCola GmbH" },
    { id: 2, name: "XY Getränkehandel" },
    { id: 3, name: "ABC Lieferanten" },
  ];

  // Filter- und Sortierzustände
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [tableSupplier, setTableSupplier] = useState(0);
  const [sortKey, setSortKey] = useState("artikelname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableColumns, setTableColumns] = useState({
    artikelnummerAuto: true,
    artikelname: true,
    ean: true,
    ekpNetto: true,
    pfand: true,
    steuerSatz: true,
    steuerBetrag: true,
    ekpBrutto: true,
    menge: true,
    vkp: true,
    profitEuro: true,
    profitPerc: true,
    lieferant: true,
    artikelnummerLieferant: true,
    link: true,
  });
  // Export-Zustände
  const [exportSearchTerm, setExportSearchTerm] = useState("");
  const [exportSupplier, setExportSupplier] = useState(0);
  const [exportColumns, setExportColumns] = useState({
    artikelnummerAuto: true,
    artikelname: true,
    ean: true,
    ekpNetto: true,
    pfand: true,
    steuerSatz: true,
    steuerBetrag: true,
    ekpBrutto: true,
    menge: true,
    vkp: true,
    profitEuro: true,
    profitPerc: true,
    lieferant: true,
    artikelnummerLieferant: true,
    link: true,
  });

  const getFilteredSortedArticles = () => {
    const filtered = articles.filter((a) => {
      const searchLC = tableSearchTerm.toLowerCase();
      const textCombined = (a.artikelname + " " + (a.ean || "")).toLowerCase();
      if (!textCombined.includes(searchLC)) return false;
      if (tableSupplier !== 0 && a.lieferantId !== tableSupplier) return false;
      return true;
    });
    const sorted = [...filtered].sort((x, y) => {
      const getSupplierName = (art) =>
        dummySuppliers.find((s) => s.id === art.lieferantId)?.name || "";
      const { profitEuro: pX, profitPerc: percX } = calcProfit(x);
      const { profitEuro: pY, profitPerc: percY } = calcProfit(y);
      const getVal = (art) => {
        switch (sortKey) {
          case "artikelnummerAuto":
            return art.artikelnummerAuto;
          case "ean":
            return art.ean || "";
          case "menge":
            return art.menge;
          case "ekpNetto":
            return art.ekpNetto;
          case "pfand":
            return art.pfand;
          case "steuerSatz":
            return art.steuerSatz;
          case "steuerBetrag":
            return art.steuerBetrag;
          case "ekpBrutto":
            return art.ekpBrutto;
          case "vkp":
            return art.vkp;
          case "profitEuro":
            return pX;
          case "profitPerc":
            return percX;
          case "lieferant":
            return getSupplierName(art);
          case "artikelnummerLieferant":
            return art.artikelnummerLieferant || "";
          case "link":
            return art.link || "";
          default:
            return art.artikelname;
        }
      };
      const valX = getVal(x);
      const valY = getVal(y);
      if (valX < valY) return sortOrder === "asc" ? -1 : 1;
      if (valX > valY) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const allSorted = getFilteredSortedArticles();
  const totalPages = pageSize === "all" ? 1 : Math.ceil(allSorted.length / pageSize);
  const currentArticles =
    pageSize === "all"
      ? allSorted
      : allSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };
  const handleToggleTableColumn = (col) => {
    setTableColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const getExportFilteredArticles = () => {
    return articles.filter((a) => {
      const textCombined = (a.artikelname + " " + (a.ean || "")).toLowerCase();
      if (!textCombined.includes(exportSearchTerm.toLowerCase())) return false;
      if (exportSupplier !== 0 && a.lieferantId !== exportSupplier) return false;
      return true;
    });
  };

  const handleExportCSV = () => {
    const filtered = getExportFilteredArticles();
    const colOrder = [
      { key: "artikelnummerAuto", label: "Art.-Nr." },
      { key: "artikelname", label: "Art.-Name" },
      { key: "ean", label: "EAN" },
      { key: "menge", label: "Menge" },
      { key: "ekpNetto", label: "EKP-Netto (EUR)" },
      { key: "pfand", label: "Pfand (EUR)" },
      { key: "steuerSatz", label: "Steuer %" },
      { key: "steuerBetrag", label: "Steuer (EUR)" },
      { key: "ekpBrutto", label: "EKP-Brutto (EUR)" },
      { key: "vkp", label: "VKP (EUR)" },
      { key: "profitEuro", label: "Gewinn (EUR)" },
      { key: "profitPerc", label: "Gewinn %" },
      { key: "lieferant", label: "Lieferant" },
      { key: "artikelnummerLieferant", label: "Art.-Nr. Lieferant" },
      { key: "link", label: "Link" },
    ].filter((col) => exportColumns[col.key]);
    const header = colOrder.map((c) => c.label).join(";");
    const rows = filtered.map((art) => {
      const { profitEuro, profitPerc } = calcProfit(art);
      const supplierName =
        dummySuppliers.find((s) => s.id === art.lieferantId)?.name || "";
      return colOrder
        .map((col) => {
          switch (col.key) {
            case "profitEuro":
              return profitEuro.toFixed(2);
            case "profitPerc":
              return profitPerc.toFixed(2);
            case "lieferant":
              return supplierName;
            case "ean":
              return `"${art.ean || ""}"`;
            case "vkp":
            case "ekpNetto":
            case "pfand":
            case "steuerBetrag":
            case "ekpBrutto":
              return art[col.key].toFixed(2);
            default:
              return art[col.key] != null ? String(art[col.key]) : "";
          }
        })
        .join(";");
    });
    const csvContent = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "artikelliste.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      <h1 className="text-3xl font-bold mb-4">Artikelliste</h1>

      {/* Obere Aktionen */}
      <div className="flex flex-col space-y-4 w-full">
        {/* CSV-Export Bereich */}
        <div className="bg-gray-800 p-4 rounded shadow w-full">
          <h2 className="text-xl font-semibold mb-2">CSV-Export</h2>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div>
              <label className="font-medium block mb-1">Suche (Name/EAN)</label>
              <TextInput
                type="text"
                value={exportSearchTerm}
                onChange={(e) => setExportSearchTerm(e.target.value)}
                placeholder="Suche..."
                style={{ width: "16rem" }}
              />
            </div>
            <div>
              <label className="font-medium block mb-1">Lieferant filtern</label>
              <select
                value={exportSupplier}
                onChange={(e) => setExportSupplier(parseInt(e.target.value, 10))}
                className="p-2 rounded bg-gray-700 focus:outline-none w-64"
              >
                {dummySuppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            {[
              ["artikelnummerAuto", "Art.-Nr."],
              ["artikelname", "Art.-Name"],
              ["ean", "EAN"],
              ["menge", "Menge"],
              ["ekpNetto", "EKP-Netto (EUR)"],
              ["pfand", "Pfand (EUR)"],
              ["steuerSatz", "Steuer %"],
              ["steuerBetrag", "Steuer (EUR)"],
              ["ekpBrutto", "EKP-Brutto (EUR)"],
              ["vkp", "VKP (EUR)"],
              ["profitEuro", "Gewinn (EUR)"],
              ["profitPerc", "Gewinn %"],
              ["lieferant", "Lieferant"],
              ["artikelnummerLieferant", "Art.-Nr. Lieferant"],
              ["link", "Link"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportColumns[key]}
                  onChange={() =>
                    setExportColumns((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          >
            Export CSV
          </button>
        </div>

        {/* Tabelle-Suche & Lieferanten-Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 w-full">
          <div>
            <label className="font-medium block mb-1">Tabelle Suche (Name/EAN)</label>
            <TextInput
              type="text"
              value={tableSearchTerm}
              onChange={(e) => {
                setTableSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Suche..."
              style={{ width: "16rem" }}
            />
          </div>
          <div>
            <label className="font-medium block mb-1">Lieferant filtern</label>
            <select
              value={tableSupplier}
              onChange={(e) => {
                setTableSupplier(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="p-2 rounded bg-gray-700 focus:outline-none w-64"
            >
              {dummySuppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabelle-Spalten toggeln */}
        <div className="bg-gray-800 p-4 rounded shadow space-y-2 w-full">
          <h2 className="text-xl font-semibold">Tabelle Spalten</h2>
          <div className="flex flex-wrap gap-4">
            {[
              ["artikelnummerAuto", "Art.-Nr."],
              ["artikelname", "Art.-Name"],
              ["ean", "EAN"],
              ["menge", "Menge"],
              ["ekpNetto", "EKP-Netto (EUR)"],
              ["pfand", "Pfand (EUR)"],
              ["steuerSatz", "Steuer %"],
              ["steuerBetrag", "Steuer (EUR)"],
              ["ekpBrutto", "EKP-Brutto (EUR)"],
              ["vkp", "VKP (EUR)"],
              ["profitEuro", "Gewinn (EUR)"],
              ["profitPerc", "Gewinn %"],
              ["lieferant", "Lieferant"],
              ["artikelnummerLieferant", "Art.-Nr. Lieferant"],
              ["link", "Link"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tableColumns[key]}
                  onChange={() =>
                    setTableColumns((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Paging */}
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
              if (pageSize !== "all" && currentPage > 1) setCurrentPage(currentPage - 1);
            }}
            disabled={pageSize === "all" || currentPage <= 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            &lt; Prev
          </button>
          <span>
            Seite {currentPage} /{" "}
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(allSorted.length / pageSize))}
          </span>
          <button
            onClick={() => {
              if (pageSize !== "all" && currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
            disabled={pageSize === "all" || currentPage >= totalPages}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {/* Tabelle */}
      <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              {tableColumns.artikelnummerAuto && (
                <ThColumn
                  label="Art.-Nr."
                  sortKey="artikelnummerAuto"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.artikelname && (
                <ThColumn
                  label="Art.-Name"
                  sortKey="artikelname"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.ean && (
                <ThColumn
                  label="EAN"
                  sortKey="ean"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.menge && (
                <ThColumn
                  label="Menge"
                  sortKey="menge"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.ekpNetto && (
                <ThColumn
                  label="EKP-Netto (EUR)"
                  sortKey="ekpNetto"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.pfand && (
                <ThColumn
                  label="Pfand (EUR)"
                  sortKey="pfand"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.steuerSatz && (
                <ThColumn
                  label="Steuer %"
                  sortKey="steuerSatz"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.steuerBetrag && (
                <ThColumn
                  label="Steuer (EUR)"
                  sortKey="steuerBetrag"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.ekpBrutto && (
                <ThColumn
                  label="EKP-Brutto (EUR)"
                  sortKey="ekpBrutto"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.vkp && (
                <ThColumn
                  label="VKP (EUR)"
                  sortKey="vkp"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.profitEuro && (
                <ThColumn
                  label="Gewinn (EUR)"
                  sortKey="profitEuro"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.profitPerc && (
                <ThColumn
                  label="Gewinn %"
                  sortKey="profitPerc"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.lieferant && (
                <ThColumn
                  label="Lieferant"
                  sortKey="lieferant"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.artikelnummerLieferant && (
                <ThColumn
                  label="Art.-Nr. Lieferant"
                  sortKey="artikelnummerLieferant"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
              {tableColumns.link && (
                <ThColumn
                  label="Link"
                  sortKey="link"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
              )}
            </tr>
          </thead>
          <tbody>
            {currentArticles.length === 0 && (
              <tr>
                <td colSpan={999} className="p-3 text-center text-gray-400">
                  Keine Artikel gefunden.
                </td>
              </tr>
            )}
            {currentArticles.map((art, idx) => {
              const { profitEuro, profitPerc } = calcProfit(art);
              const supplierName =
                dummySuppliers.find((s) => s.id === art.lieferantId)?.name || "Unbekannt";
              return (
                <tr
                  key={art.artikelnummerAuto}
                  className={`border-b border-gray-700 hover:bg-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/90"
                  }`}
                >
                  {tableColumns.artikelnummerAuto && <td className="p-3">{art.artikelnummerAuto}</td>}
                  {tableColumns.artikelname && <td className="p-3">{art.artikelname}</td>}
                  {tableColumns.ean && <td className="p-3">{art.ean}</td>}
                  {tableColumns.menge && <td className="p-3">{art.menge}</td>}
                  {tableColumns.ekpNetto && <td className="p-3">{art.ekpNetto.toFixed(2)}</td>}
                  {tableColumns.pfand && <td className="p-3">{art.pfand.toFixed(2)}</td>}
                  {tableColumns.steuerSatz && <td className="p-3">{art.steuerSatz}%</td>}
                  {tableColumns.steuerBetrag && <td className="p-3">{art.steuerBetrag.toFixed(3)}</td>}
                  {tableColumns.ekpBrutto && <td className="p-3">{art.ekpBrutto.toFixed(2)}</td>}
                  {tableColumns.vkp && <td className="p-3">{art.vkp.toFixed(2)}</td>}
                  {tableColumns.profitEuro && <td className="p-3">{profitEuro.toFixed(2)}</td>}
                  {tableColumns.profitPerc && <td className="p-3">{profitPerc.toFixed(2)}%</td>}
                  {tableColumns.lieferant && <td className="p-3">{supplierName}</td>}
                  {tableColumns.artikelnummerLieferant && <td className="p-3">{art.artikelnummerLieferant || ""}</td>}
                  {tableColumns.link && (
                    <td className="p-3">
                      {art.link ? (
                        <a href={art.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                          {art.link}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paging */}
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
              if (pageSize !== "all" && currentPage > 1) setCurrentPage(currentPage - 1);
            }}
            disabled={pageSize === "all" || currentPage <= 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            &lt; Prev
          </button>
          <span>
            Seite {currentPage} /{" "}
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(allSorted.length / pageSize))}
          </span>
          <button
            onClick={() => {
              if (pageSize !== "all" && currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
            disabled={pageSize === "all" || currentPage >= totalPages}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {AlertModal}
    </div>
  );
};

export default Artikelliste;
