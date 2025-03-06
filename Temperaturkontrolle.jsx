// src/pages/Temperaturkontrolle.jsx
import React, { useState, useEffect } from "react";
import TextInput from "../components/TextInput";
import ThColumn from "../components/ThColumn";
import { useAlertModal, useConfirmModal } from "../components/useModals.jsx";
import { getCurrentDateTime, formatDateTime } from "../components/dateUtils.jsx";

/**
 * DebouncedTextInput:
 * Verwaltet intern den Eingabewert und aktualisiert den übergebenen onChange erst beim onBlur,
 * um Focus-Verluste zu vermeiden.
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

export default function Temperaturkontrolle() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // ------------------------------
  // Geräteverwaltung
  // ------------------------------
  const [geraeteListe, setGeraeteListe] = useState(() => {
    const stored = localStorage.getItem("geraeteListe");
    return stored ? JSON.parse(stored) : ["TK", "TK-EIS", "Kühlschrank"];
  });
  useEffect(() => {
    localStorage.setItem("geraeteListe", JSON.stringify(geraeteListe));
  }, [geraeteListe]);

  const [newDevice, setNewDevice] = useState("");

  const handleAddDevice = () => {
    const trimmed = newDevice.trim();
    if (!trimmed) {
      showAlert("Bitte Gerätenamen eingeben!");
      return;
    }
    if (geraeteListe.includes(trimmed)) {
      showAlert(`Gerät "${trimmed}" existiert bereits!`);
      return;
    }
    setGeraeteListe([...geraeteListe, trimmed]);
    setNewDevice("");
    showAlert(`Gerät "${trimmed}" hinzugefügt!`);
  };

  const handleDeleteDevice = (device) => {
    showConfirm(
      `Gerät "${device}" wirklich löschen?`,
      () => {
        setGeraeteListe((prev) => prev.filter((d) => d !== device));
        showAlert(`Gerät "${device}" gelöscht!`);
      },
      () => {}
    );
  };

  // ------------------------------
  // Vor-Schritt: Geräteauswahl
  // ------------------------------
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [devicesSelected, setDevicesSelected] = useState(false);

  const handleSelectDevice = (device, checked) => {
    if (checked) {
      setSelectedDevices((prev) => [...prev, device]);
    } else {
      setSelectedDevices((prev) => prev.filter((d) => d !== device));
    }
  };

  const handleApplyDeviceSelection = () => {
    if (selectedDevices.length === 0) {
      showAlert("Bitte wähle mindestens ein Gerät aus!");
      return;
    }
    // Geräte-Status nur für ausgewählte Geräte initialisieren
    const newStatus = selectedDevices.map((g) => ({
      geraet: g,
      status: "in Ordnung",
      bemerkung: "",
    }));
    setDeviceStatus(newStatus);
    setDevicesSelected(true);
  };

  // ------------------------------
  // Tageskontrolle (Geräte-Status)
  // ------------------------------
  const [deviceStatus, setDeviceStatus] = useState(() =>
    geraeteListe.map((g) => ({
      geraet: g,
      status: "in Ordnung",
      bemerkung: "",
    }))
  );

  // Falls sich die Geräteliste ändert und noch keine Auswahl getroffen wurde,
  // aktualisieren wir deviceStatus auf alle Geräte (Standard).
  useEffect(() => {
    if (!devicesSelected) {
      setDeviceStatus(
        geraeteListe.map((g) => ({
          geraet: g,
          status: "in Ordnung",
          bemerkung: "",
        }))
      );
    }
  }, [geraeteListe, devicesSelected]);

  const handleDeviceStatusChange = (geraet, newStatus) => {
    setDeviceStatus((prev) =>
      prev.map((obj) =>
        obj.geraet === geraet ? { ...obj, status: newStatus } : obj
      )
    );
  };

  const handleDeviceRemarkChange = (geraet, newRemark) => {
    setDeviceStatus((prev) =>
      prev.map((obj) =>
        obj.geraet === geraet ? { ...obj, bemerkung: newRemark } : obj
      )
    );
  };

  const [datumUhrzeit, setDatumUhrzeit] = useState(getCurrentDateTime());
  const handleDateChange = (e) => {
    setDatumUhrzeit(e.target.value);
    setTimeout(() => {
      e.target.blur();
    }, 100);
  };

  // ------------------------------
  // Gespeicherte Einträge
  // ------------------------------
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem("temperaturkontrolle");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("temperaturkontrolle", JSON.stringify(entries));
  }, [entries]);

  const handleRecordEntries = () => {
    // Validierung
    for (const dev of deviceStatus) {
      if (dev.status === "nicht in Ordnung" && !dev.bemerkung.trim()) {
        showAlert(`Gerät "${dev.geraet}" ist nicht in Ordnung. Bitte Bemerkung eingeben!`);
        return;
      }
    }
    // Neue Einträge anlegen
    const newRecs = deviceStatus.map((dev) => ({
      datumUhrzeit,
      geraet: dev.geraet,
      status: dev.status,
      bemerkung: dev.bemerkung,
    }));
    setEntries([...entries, ...newRecs]);
    showAlert("Einträge wurden gespeichert!");

    // Zurücksetzen
    setDatumUhrzeit(getCurrentDateTime());
    setDeviceStatus((prev) =>
      prev.map((obj) => ({ ...obj, status: "in Ordnung", bemerkung: "" }))
    );
  };

  // ------------------------------
  // Filter (Von-Bis-Datum)
  // ------------------------------
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const getFilteredEntries = () => {
    return entries.filter((ent) => {
      const entryTime = new Date(ent.datumUhrzeit);
      if (filterFrom && entryTime < new Date(filterFrom)) return false;
      if (filterTo && entryTime > new Date(filterTo)) return false;
      return true;
    });
  };

  // ------------------------------
  // Sortierung
  // ------------------------------
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
      // Bei datumUhrzeit => Timestamp
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

  // ------------------------------
  // Inline-Edit
  // ------------------------------
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const startEditRow = (globalIndex) => {
    const sorted = getSortedEntries();
    setEditIndex(globalIndex);
    setEditData({ ...sorted[globalIndex] });
  };

  // Beim Wechsel von "nicht in Ordnung" zu "in Ordnung" => Bemerkung leeren
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

  // ------------------------------
  // Pagination
  // ------------------------------
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

  // ------------------------------
  // Interne Komponenten
  // ------------------------------

  // Geräteverwaltung
  const DeviceManagement = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Geräteverwaltung</h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <DebouncedTextInput
          type="text"
          placeholder="Neues Gerät eingeben"
          value={newDevice}
          onChange={(e) => setNewDevice(e.target.value)}
        />
        <button
          onClick={handleAddDevice}
          className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
        >
          Gerät hinzufügen
        </button>
      </div>
      {geraeteListe.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {geraeteListe.map((dev, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded"
            >
              <span>{dev}</span>
              <button
                onClick={() => handleDeleteDevice(dev)}
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

  // Geräteauswahl (Vor-Schritt)
  const DeviceSelection = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Geräte Auswahl</h2>
      <p>Wähle die Geräte aus, die du heute kontrollieren möchtest:</p>
      <div className="flex flex-col gap-2">
        {geraeteListe.map((dev) => (
          <label key={dev} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedDevices.includes(dev)}
              onChange={(e) => handleSelectDevice(dev, e.target.checked)}
              className="form-checkbox"
            />
            {dev}
          </label>
        ))}
      </div>
      <button
        onClick={handleApplyDeviceSelection}
        className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500 mt-2`}
      >
        Auswahl übernehmen
      </button>
    </div>
  );

  // Tageskontrolle
  const TagesKontrolle = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Temperaturkontrolle Eintrag</h2>
        <button
          onClick={() => {
            setDevicesSelected(false);
            setSelectedDevices([]);
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
        <h3 className="font-semibold">Geräte-Status</h3>
        {deviceStatus.length === 0 ? (
          <p className="text-gray-400">
            Keine Geräte ausgewählt. Bitte oben in der Geräteauswahl auswählen.
          </p>
        ) : (
          deviceStatus.map((d) => (
            <div
              key={d.geraet}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-4"
            >
              <span className="md:w-40">{d.geraet}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${d.geraet}`}
                    value="in Ordnung"
                    checked={d.status === "in Ordnung"}
                    onChange={() => handleDeviceStatusChange(d.geraet, "in Ordnung")}
                    className="mr-1"
                  />
                  in Ordnung
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${d.geraet}`}
                    value="nicht in Ordnung"
                    checked={d.status === "nicht in Ordnung"}
                    onChange={() =>
                      handleDeviceStatusChange(d.geraet, "nicht in Ordnung")
                    }
                    className="mr-1"
                  />
                  nicht in Ordnung
                </label>
              </div>
              {/* min-h für stabileres Layout */}
              <div className="w-full md:w-auto min-h-[40px]">
                {d.status === "nicht in Ordnung" ? (
                  <DebouncedTextInput
                    type="text"
                    placeholder="Bemerkung"
                    value={d.bemerkung}
                    onChange={(e) => handleDeviceRemarkChange(d.geraet, e.target.value)}
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

  // PaginationControls (oben & unten)
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
  const TemperatureTable = () => (
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
                label="Gerät"
                sortKey="geraet"
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
                  (currentPage - 1) * (pageSize === "all" ? currentData.length : pageSize) +
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
                      {/* Gerät: jetzt DROPDOWN */}
                      <td className="p-2">
                        <select
                          value={editData.geraet}
                          onChange={(e) => handleEditChange(e, "geraet")}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        >
                          {geraeteListe.map((dev) => (
                            <option key={dev} value={dev}>
                              {dev}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Status (Dropdown) */}
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
                      <td className="p-2">{item.geraet}</td>
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

  // ------------------------------
  // Haupt-Render
  // ------------------------------
  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold">Temperaturkontrolle</h1>

      {/* 1) Geräteverwaltung */}
      <DeviceManagement />

      {/* 2) Geräteauswahl oder Tageskontrolle */}
      {!devicesSelected ? <DeviceSelection /> : <TagesKontrolle />}

      {/* 3) Tabelle (Filter, Sortierung, Inline-Edit) */}
      <TemperatureTable />
    </div>
  );
}
