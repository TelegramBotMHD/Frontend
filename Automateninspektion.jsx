// src/pages/Automateninspektion.jsx
import React, { useState, useEffect } from "react";
import TextInput from "../components/TextInput";
import ThColumn from "../components/ThColumn";
import { useAlertModal, useConfirmModal } from "../components/useModals.jsx";
import { getCurrentDateTime, formatDateTime } from "../components/dateUtils.jsx";

/**
 * DebouncedTextInput:
 * - Verwaltet intern den Eingabewert, aktualisiert den übergebenen onChange erst beim onBlur,
 *   um Fokusverluste beim Tippen zu vermeiden.
 */
const DebouncedTextInput = ({ value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    onChange({ target: { value: localValue } });
  };

  return (
    <TextInput
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
};

export default function Automateninspektion() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // ---------------------------------------
  // 1) Automatenverwaltung
  // ---------------------------------------
  const [automatenListe, setAutomatenListe] = useState(() => {
    const stored = localStorage.getItem("automatenListe");
    return stored
      ? JSON.parse(stored)
      : ["Snack-Automat 1", "Kaffee-Automat A", "Getränke-Automat 2"];
  });
  useEffect(() => {
    localStorage.setItem("automatenListe", JSON.stringify(automatenListe));
  }, [automatenListe]);

  const [newAutomat, setNewAutomat] = useState("");

  const handleAddAutomat = () => {
    const trimmed = newAutomat.trim();
    if (!trimmed) {
      showAlert("Bitte Namen für den Automaten eingeben!");
      return;
    }
    if (automatenListe.includes(trimmed)) {
      showAlert(`Automat "${trimmed}" existiert bereits!`);
      return;
    }
    setAutomatenListe([...automatenListe, trimmed]);
    setNewAutomat("");
    showAlert(`Automat "${trimmed}" hinzugefügt!`);
  };

  const handleDeleteAutomat = (automat) => {
    showConfirm(
      `Automat "${automat}" wirklich löschen?`,
      () => {
        setAutomatenListe((prev) => prev.filter((a) => a !== automat));
        showAlert(`Automat "${automat}" gelöscht!`);
      },
      () => {}
    );
  };

  // ---------------------------------------
  // 2) Vor-Schritt: Auswahl relevanter Automaten
  // ---------------------------------------
  const [selectedAutomaten, setSelectedAutomaten] = useState([]);
  const [automatenSelected, setAutomatenSelected] = useState(false);

  const handleSelectAutomat = (automat, checked) => {
    if (checked) {
      setSelectedAutomaten((prev) => [...prev, automat]);
    } else {
      setSelectedAutomaten((prev) => prev.filter((a) => a !== automat));
    }
  };

  const handleApplyAutomatSelection = () => {
    if (selectedAutomaten.length === 0) {
      showAlert("Bitte wähle mindestens einen Automaten aus!");
      return;
    }
    // Status nur für ausgewählte Automaten initialisieren
    const newStatus = selectedAutomaten.map((a) => ({
      automat: a,
      status: "in Ordnung",
      bemerkung: "",
    }));
    setAutomatenStatus(newStatus);
    setAutomatenSelected(true);
  };

  // ---------------------------------------
  // 3) Inspektionsschritt (Automaten-Status)
  // ---------------------------------------
  const [automatenStatus, setAutomatenStatus] = useState(() =>
    automatenListe.map((a) => ({
      automat: a,
      status: "in Ordnung",
      bemerkung: "",
    }))
  );

  // Falls sich die Automatenliste ändert und noch keine Auswahl getroffen wurde,
  // setzen wir automatenStatus auf die gesamte Liste (Standard).
  useEffect(() => {
    if (!automatenSelected) {
      setAutomatenStatus(
        automatenListe.map((a) => ({
          automat: a,
          status: "in Ordnung",
          bemerkung: "",
        }))
      );
    }
  }, [automatenListe, automatenSelected]);

  const [datumUhrzeit, setDatumUhrzeit] = useState(getCurrentDateTime());
  const handleDateChange = (e) => {
    setDatumUhrzeit(e.target.value);
    setTimeout(() => {
      e.target.blur();
    }, 100);
  };

  const handleAutomatStatusChange = (automat, newStatus) => {
    setAutomatenStatus((prev) =>
      prev.map((obj) =>
        obj.automat === automat ? { ...obj, status: newStatus } : obj
      )
    );
  };

  const handleAutomatRemarkChange = (automat, newRemark) => {
    setAutomatenStatus((prev) =>
      prev.map((obj) =>
        obj.automat === automat ? { ...obj, bemerkung: newRemark } : obj
      )
    );
  };

  // ---------------------------------------
  // 4) Speichern der Einträge
  // ---------------------------------------
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem("automatenInspektionen");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("automatenInspektionen", JSON.stringify(entries));
  }, [entries]);

  const handleRecordEntries = () => {
    // Validierung
    for (const atm of automatenStatus) {
      if (atm.status === "nicht in Ordnung" && !atm.bemerkung.trim()) {
        showAlert(
          `Automat "${atm.automat}" ist nicht in Ordnung. Bitte Bemerkung eingeben!`
        );
        return;
      }
    }
    // Neue Einträge
    const newRecords = automatenStatus.map((atm) => ({
      datumUhrzeit,
      automat: atm.automat,
      status: atm.status,
      bemerkung: atm.bemerkung,
    }));
    setEntries([...entries, ...newRecords]);
    showAlert("Inspektionseinträge gespeichert!");

    // Zurücksetzen
    setDatumUhrzeit(getCurrentDateTime());
    setAutomatenStatus((prev) =>
      prev.map((obj) => ({ ...obj, status: "in Ordnung", bemerkung: "" }))
    );
  };

  // ---------------------------------------
  // 5) Filter (Von-Bis-Datum)
  // ---------------------------------------
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const getFilteredEntries = () => {
    return entries.filter((entry) => {
      const entryTime = new Date(entry.datumUhrzeit);
      if (filterFrom && entryTime < new Date(filterFrom)) return false;
      if (filterTo && entryTime > new Date(filterTo)) return false;
      return true;
    });
  };

  // ---------------------------------------
  // 6) Sortierung
  // ---------------------------------------
  const [sortKey, setSortKey] = useState("datumUhrzeit");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortedEntries = () => {
    const arr = [...getFilteredEntries()];
    arr.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === "datumUhrzeit") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  };

  // ---------------------------------------
  // 7) Inline Editing
  // ---------------------------------------
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const startEditRow = (globalIndex) => {
    const sorted = getSortedEntries();
    setEditIndex(globalIndex);
    setEditData({ ...sorted[globalIndex] });
  };

  // Wenn Status auf "in Ordnung" wechselt => Bemerkung leeren
  const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditData((prev) => {
      if (field === "status" && value === "in Ordnung") {
        return { ...prev, status: value, bemerkung: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveEdit = (globalIndex) => {
    if (editData.status === "nicht in Ordnung" && !editData.bemerkung.trim()) {
      showAlert("Bitte Bemerkung eingeben, da 'nicht in Ordnung'!");
      return;
    }
    const sorted = getSortedEntries();
    const item = sorted[globalIndex];
    const mainIndex = entries.findIndex((x) => x === item);
    if (mainIndex === -1) return;

    const updated = [...entries];
    updated[mainIndex] = { ...editData };
    setEntries(updated);
    showAlert("Eintrag aktualisiert!");
    setEditIndex(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditData({});
  };

  const handleDeleteRow = (globalIndex) => {
    const sorted = getSortedEntries();
    const item = sorted[globalIndex];
    showConfirm(
      "Eintrag wirklich löschen?",
      () => {
        setEntries((prev) => prev.filter((e) => e !== item));
        showAlert("Eintrag gelöscht!");
      },
      () => {}
    );
  };

  // ---------------------------------------
  // Pagination
  // ---------------------------------------
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = getSortedEntries();
  const totalPages =
    pageSize === "all" ? 1 : Math.ceil(sortedEntries.length / pageSize);

  const currentData =
    pageSize === "all"
      ? sortedEntries
      : sortedEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Einheitliche Button-Klassen
  const baseBtnClasses = "px-4 py-2 rounded font-semibold focus:outline-none";

  // ---------------------------------------
  // Interne Komponenten
  // ---------------------------------------

  // 1) Automatenverwaltung
  const AutomatManagement = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Automatenverwaltung</h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <DebouncedTextInput
          type="text"
          placeholder="Neuen Automaten eingeben"
          value={newAutomat}
          onChange={(e) => setNewAutomat(e.target.value)}
        />
        <button
          onClick={handleAddAutomat}
          className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
        >
          Automat hinzufügen
        </button>
      </div>
      {automatenListe.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {automatenListe.map((atm, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded"
            >
              <span>{atm}</span>
              <button
                onClick={() => handleDeleteAutomat(atm)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2) Automatenauswahl (Vor-Schritt)
  const AutomatSelection = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Automatenauswahl</h2>
      <p>Bitte wähle die Automaten aus, die du heute inspizieren möchtest:</p>
      <div className="flex flex-col gap-2">
        {automatenListe.map((atm) => (
          <label key={atm} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedAutomaten.includes(atm)}
              onChange={(e) => handleSelectAutomat(atm, e.target.checked)}
              className="form-checkbox"
            />
            {atm}
          </label>
        ))}
      </div>
      <button
        onClick={handleApplyAutomatSelection}
        className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500 mt-2`}
      >
        Auswahl übernehmen
      </button>
    </div>
  );

  // 3) Automateninspektion (nur für ausgewählte Automaten)
  const AutomatenInspektionControl = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Automateninspektion Eintrag</h2>
        <button
          onClick={() => {
            setAutomatenSelected(false);
            setSelectedAutomaten([]);
          }}
          className={`${baseBtnClasses} bg-gray-600 hover:bg-gray-500`}
        >
          Auswahl ändern
        </button>
      </div>

      <div>
        <label className="block font-medium mb-1">Datum/Uhrzeit</label>
        <input
          type="datetime-local"
          value={datumUhrzeit}
          onChange={handleDateChange}
          className="p-2 rounded bg-gray-700 w-full md:w-64 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Automaten-Status</h3>
        {automatenStatus.length === 0 ? (
          <p className="text-gray-400">
            Keine Automaten ausgewählt. Bitte oben auswählen.
          </p>
        ) : (
          automatenStatus.map((atm) => (
            <div
              key={atm.automat}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-4"
            >
              <span className="md:w-40">{atm.automat}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${atm.automat}`}
                    value="in Ordnung"
                    checked={atm.status === "in Ordnung"}
                    onChange={() =>
                      handleAutomatStatusChange(atm.automat, "in Ordnung")
                    }
                    className="mr-1"
                  />
                  in Ordnung
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${atm.automat}`}
                    value="nicht in Ordnung"
                    checked={atm.status === "nicht in Ordnung"}
                    onChange={() =>
                      handleAutomatStatusChange(atm.automat, "nicht in Ordnung")
                    }
                    className="mr-1"
                  />
                  nicht in Ordnung
                </label>
              </div>
              {/* min-h => stabilisiert Layout bei "nicht in Ordnung" */}
              <div className="w-full md:w-auto min-h-[40px]">
                {atm.status === "nicht in Ordnung" ? (
                  <DebouncedTextInput
                    type="text"
                    placeholder="Bemerkung"
                    value={atm.bemerkung}
                    onChange={(e) =>
                      handleAutomatRemarkChange(atm.automat, e.target.value)
                    }
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <button
          onClick={handleRecordEntries}
          className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500`}
        >
          Einträge speichern
        </button>
      </div>
    </div>
  );

  // Pagination Controls (oben & unten)
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

  // Tabelle mit Einträgen
  const AutomatenInspektionTable = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Einträge</h2>

      {/* Von-Bis-Datum-Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <label className="block font-medium mb-1">Von Datum</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => {
              setFilterFrom(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 rounded bg-gray-700 focus:outline-none w-full md:w-64"
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
            className="p-2 rounded bg-gray-700 focus:outline-none w-full md:w-64"
          />
        </div>
      </div>

      {/* Pagination oben */}
      <PaginationControls />

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
                label="Automat"
                sortKey="automat"
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
                label="Bemerkung"
                sortKey="bemerkung"
                sortState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <th className="p-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-400">
                  Keine Einträge gefunden.
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => {
                const realIndex =
                  (currentPage - 1) *
                    (pageSize === "all" ? currentData.length : pageSize) +
                  idx;

                if (editIndex === realIndex) {
                  // Edit-Modus
                  return (
                    <tr
                      key={realIndex}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      {/* Datum/Uhrzeit */}
                      <td className="p-2">
                        <input
                          type="datetime-local"
                          value={editData.datumUhrzeit}
                          onChange={(e) => handleEditChange(e, "datumUhrzeit")}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        />
                      </td>
                      {/* Automat: jetzt DROPDOWN */}
                      <td className="p-2">
                        <select
                          value={editData.automat}
                          onChange={(e) => handleEditChange(e, "automat")}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        >
                          {automatenListe.map((atm) => (
                            <option key={atm} value={atm}>
                              {atm}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Status */}
                      <td className="p-2">
                        <select
                          value={editData.status}
                          onChange={(e) => handleEditChange(e, "status")}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        >
                          <option value="in Ordnung">in Ordnung</option>
                          <option value="nicht in Ordnung">nicht in Ordnung</option>
                        </select>
                      </td>
                      {/* Bemerkung (Debounced) */}
                      <td className="p-2">
                        <DebouncedTextInput
                          type="text"
                          value={editData.bemerkung}
                          onChange={(e) => handleEditChange(e, "bemerkung")}
                        />
                      </td>
                      {/* Aktionen */}
                      <td className="p-2 flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(realIndex)}
                          className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
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
                      key={realIndex}
                      className={`border-b border-gray-700 hover:bg-gray-700 ${
                        item.status === "nicht in Ordnung" ? "bg-red-900" : ""
                      }`}
                    >
                      <td className="p-2">{formatDateTime(item.datumUhrzeit)}</td>
                      <td className="p-2">{item.automat}</td>
                      <td className="p-2">{item.status}</td>
                      <td className="p-2">{item.bemerkung || "-"}</td>
                      <td className="p-2 flex space-x-2">
                        <button
                          onClick={() => startEditRow(realIndex)}
                          className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRow(realIndex)}
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
  );

  // ---------------------------------------
  // Haupt-Render
  // ---------------------------------------
  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold">Automateninspektion</h1>

      {/* 1) Automatenverwaltung */}
      <AutomatManagement />

      {/* 2) Auswahl oder Inspektion */}
      {!automatenSelected ? <AutomatSelection /> : <AutomatenInspektionControl />}

      {/* 3) Tabelle (Filter, Sortierung, Inline-Edit) */}
      <AutomatenInspektionTable />
    </div>
  );
}
