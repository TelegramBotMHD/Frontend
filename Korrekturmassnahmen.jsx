// src/pages/Korrekturmassnahmen.jsx
import React, { useState, useEffect, useCallback } from "react";
import TextInput from "../components/TextInput";
import ThColumn from "../components/ThColumn";
import { useAlertModal, useConfirmModal } from "../components/useModals.jsx";
import { getCurrentDateTime, formatDateTime } from "../components/dateUtils.jsx";

/**
 * Beispiel: Basis-Button-Klassen für konsistente UI
 */
const baseBtnClasses = "px-4 py-2 rounded font-semibold focus:outline-none";

export default function Korrekturmassnahmen() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  const currentUser = "Aktuell angemeldeter Benutzer";

  // Formularfelder (neue Korrekturmaßnahme)
  const [datumUhrzeit, setDatumUhrzeit] = useState(getCurrentDateTime());
  const [beschreibung, setBeschreibung] = useState("");
  const [massnahme, setMassnahme] = useState("");
  const [status, setStatus] = useState("offen");
  const [kommentar, setKommentar] = useState("");

  // Einträge (lokal gespeichert)
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem("korrekturmassnahmen");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("korrekturmassnahmen", JSON.stringify(entries));
  }, [entries]);

  // Filter: Von–Bis-Datum
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Sortierung
  const [sortKey, setSortKey] = useState("datumUhrzeit");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Kombinierte Filter-/Sortier-Funktion
  const getFilteredSortedEntries = useCallback(() => {
    let filtered = entries;

    // Von–Datum
    if (filterFrom) {
      filtered = filtered.filter(
        (e) => new Date(e.datumUhrzeit) >= new Date(filterFrom)
      );
    }
    // Bis–Datum
    if (filterTo) {
      filtered = filtered.filter(
        (e) => new Date(e.datumUhrzeit) <= new Date(filterTo)
      );
    }

    // Sortierung
    const sorted = [...filtered].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === "datumUhrzeit") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [entries, filterFrom, filterTo, sortKey, sortOrder]);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = getFilteredSortedEntries();
  const totalPages =
    pageSize === "all" ? 1 : Math.ceil(sortedEntries.length / pageSize);

  const currentData =
    pageSize === "all"
      ? sortedEntries
      : sortedEntries.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Inline Editing
  const [editingIndex, setEditingIndex] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({});

  const startEditRow = (index, entry) => {
    setEditingIndex(index);
    setInlineEditData({ ...entry });
  };

  const handleInlineChange = (e, field) => {
    setInlineEditData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const saveInlineEntry = (index) => {
    // Beispiel: Wenn wir bei "offen" einen Kommentar fordern (nur als Demo)
    if (
      inlineEditData.status === "offen" &&
      !inlineEditData.kommentar?.trim()
    ) {
      showAlert("Bitte Kommentar eingeben, da 'offen'!");
      return;
    }
    const updated = [...entries];
    updated[index] = { ...inlineEditData };
    setEntries(updated);
    showAlert("Eintrag aktualisiert!");
    setEditingIndex(null);
    setInlineEditData({});
  };

  const cancelInlineEntry = () => {
    setEditingIndex(null);
    setInlineEditData({});
  };

  const handleDeleteEntry = (entry) => {
    showConfirm(
      `Eintrag wirklich löschen?`,
      () => {
        setEntries((prev) => prev.filter((x) => x !== entry));
        showAlert("Eintrag gelöscht!");
      },
      () => {}
    );
  };

  // CSV-Export (unverändert)
  const handleExportCSV = () => {
    const header =
      "Datum/Uhrzeit;Beschreibung;Maßnahme;Verantwortlich;Status;Kommentar";
    const rows = sortedEntries.map((e) => {
      const dt = e.datumUhrzeit || "";
      const dateStr = dt ? new Date(dt).toLocaleString() : "";
      return [
        dateStr.replace(/;/g, ","), // Kommas statt Semikolons in den Feldern
        (e.beschreibung || "").replace(/;/g, ","),
        (e.massnahme || "").replace(/;/g, ","),
        (e.verantwortlichePerson || "").replace(/;/g, ","),
        (e.status || "").replace(/;/g, ","),
        (e.kommentar || "").replace(/;/g, ","),
      ].join(";");
    });
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "korrekturmassnahmen.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Neues Objekt speichern (Formular)
  const handleSaveNew = () => {
    if (!beschreibung.trim() || !massnahme.trim()) {
      showAlert("Bitte sowohl Beschreibung als auch Maßnahme ausfüllen!");
      return;
    }
    const newObj = {
      datumUhrzeit,
      beschreibung,
      massnahme,
      status,
      kommentar,
      verantwortlichePerson: currentUser,
    };
    setEntries([...entries, newObj]);
    showAlert("Korrekturmaßnahme wurde gespeichert!");

    // Formular zurücksetzen
    setDatumUhrzeit(getCurrentDateTime());
    setBeschreibung("");
    setMassnahme("");
    setStatus("offen");
    setKommentar("");
  };

  const handleResetForm = () => {
    setDatumUhrzeit(getCurrentDateTime());
    setBeschreibung("");
    setMassnahme("");
    setStatus("offen");
    setKommentar("");
  };

  // Kleine Hilfskomponente für Pagination (oben/unten)
  const PaginationControls = () => (
    <div className="flex items-center justify-between w-full mt-2">
      <div>
        <label className="font-medium mr-2">Zeilen pro Seite:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            const val = e.target.value === "all" ? "all" : parseInt(e.target.value, 10);
            setPageSize(val);
            setCurrentPage(1);
          }}
          className="p-1 rounded bg-gray-700 focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value="all">Alle</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={pageSize === "all" || currentPage <= 1}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
        >
          &lt; Prev
        </button>
        <span>
          Seite {currentPage} / {pageSize === "all" ? 1 : totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={pageSize === "all" || currentPage >= totalPages}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold mb-4">Korrekturmaßnahmen</h1>

      {/* Formular: Neue Maßnahme */}
      <div className="bg-gray-800 p-4 rounded shadow space-y-4 w-full max-w-3xl">
        <div>
          <label className="block font-medium mb-1">Datum/Uhrzeit</label>
          <input
            type="datetime-local"
            value={datumUhrzeit}
            onChange={(e) => setDatumUhrzeit(e.target.value)}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Beschreibung</label>
          <textarea
            placeholder="Beschreibung des Vorfalls"
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Maßnahme</label>
          <textarea
            placeholder="Ergriffene Maßnahme"
            value={massnahme}
            onChange={(e) => setMassnahme(e.target.value)}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
          >
            <option value="offen">offen</option>
            <option value="erledigt">erledigt</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Kommentar</label>
          <textarea
            placeholder="Kommentar (optional)"
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveNew}
            className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500`}
          >
            Speichern
          </button>
          <button
            onClick={handleResetForm}
            className={`${baseBtnClasses} bg-gray-600 hover:bg-gray-500`}
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Filter + Export + Pagination (oben) */}
      <div className="bg-gray-800 p-4 rounded shadow space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div>
            <label className="block font-medium mb-1">Von Datum</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => {
                setFilterFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded bg-gray-700 focus:outline-none w-64"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Bis Datum</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => {
                setFilterTo(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded bg-gray-700 focus:outline-none w-64"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleExportCSV}
              className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
            >
              Exportieren
            </button>
          </div>
        </div>

        {/* Pagination oben */}
        <PaginationControls />

        {/* Tabelle */}
        <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <ThColumn
                  label="Datum/Uhrzeit"
                  sortKey="datumUhrzeit"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <ThColumn
                  label="Beschreibung"
                  sortKey="beschreibung"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <ThColumn
                  label="Maßnahme"
                  sortKey="massnahme"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <ThColumn
                  label="Verantwortlich"
                  sortKey="verantwortlichePerson"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <ThColumn
                  label="Status"
                  sortKey="status"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <ThColumn
                  label="Kommentar"
                  sortKey="kommentar"
                  sortState={{ sortKey, sortOrder }}
                  onSort={handleSort}
                />
                <th className="p-2">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-400">
                    Keine Einträge gefunden.
                  </td>
                </tr>
              ) : (
                currentData.map((entry, idx) => {
                  const globalIndex =
                    (currentPage - 1) *
                      (pageSize === "all" ? currentData.length : pageSize) +
                    idx;

                  // Farbe: Falls "offen", rote Zeile
                  const rowColor =
                    entry.status === "offen" ? "bg-red-900" : "";

                  if (editingIndex === globalIndex) {
                    // Edit-Modus
                    return (
                      <tr
                        key={globalIndex}
                        className={`border-b border-gray-700 hover:bg-gray-700 ${rowColor}`}
                      >
                        <td className="p-2">
                          <input
                            type="datetime-local"
                            value={inlineEditData.datumUhrzeit}
                            onChange={(e) => handleInlineChange(e, "datumUhrzeit")}
                            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-2">
                          <TextInput
                            type="text"
                            value={inlineEditData.beschreibung}
                            onChange={(e) => handleInlineChange(e, "beschreibung")}
                          />
                        </td>
                        <td className="p-2">
                          <TextInput
                            type="text"
                            value={inlineEditData.massnahme}
                            onChange={(e) => handleInlineChange(e, "massnahme")}
                          />
                        </td>
                        <td className="p-2">
                          {entry.verantwortlichePerson}
                          {/* Falls du ein Dropdown willst, hier einbauen */}
                        </td>
                        <td className="p-2">
                          <select
                            value={inlineEditData.status}
                            onChange={(e) => handleInlineChange(e, "status")}
                            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                          >
                            <option value="offen">offen</option>
                            <option value="erledigt">erledigt</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <TextInput
                            type="text"
                            value={inlineEditData.kommentar}
                            onChange={(e) => handleInlineChange(e, "kommentar")}
                          />
                        </td>
                        <td className="p-2 flex space-x-2">
                          <button
                            onClick={() => saveInlineEntry(globalIndex)}
                            className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelInlineEntry}
                            className={`${baseBtnClasses} bg-red-600 hover:bg-red-500`}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    // Anzeige-Modus
                    return (
                      <tr
                        key={globalIndex}
                        className={`border-b border-gray-700 hover:bg-gray-700 ${rowColor}`}
                      >
                        <td className="p-2">
                          {formatDateTime(entry.datumUhrzeit)}
                        </td>
                        <td className="p-2">{entry.beschreibung}</td>
                        <td className="p-2">{entry.massnahme}</td>
                        <td className="p-2">{entry.verantwortlichePerson}</td>
                        <td className="p-2">{entry.status}</td>
                        <td className="p-2">{entry.kommentar || "-"}</td>
                        <td className="p-2 flex space-x-2">
                          <button
                            onClick={() => startEditRow(globalIndex, entry)}
                            className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry)}
                            className={`${baseBtnClasses} bg-red-600 hover:bg-red-500`}
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination unten */}
        <PaginationControls />
      </div>

      {AlertModal}
      {ConfirmModal}
    </div>
  );
}
