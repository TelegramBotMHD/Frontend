// src/pages/Wareneingang.jsx
import React, { useState, useEffect } from "react";
import TextInput from "../components/TextInput";
import ThColumn from "../components/ThColumn";
import { useAlertModal, useConfirmModal } from "../components/useModals.jsx";
import { getCurrentDateTime, formatDateTime } from "../components/dateUtils.jsx";

/**
 * DebouncedTextInput:
 * Verwaltet intern den Eingabewert und aktualisiert den übergebenen onChange erst beim onBlur,
 * um Focus-Verluste zu verhindern.
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

export default function Wareneingang() {
  // ------------------------------
  // Modals
  // ------------------------------
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // ------------------------------
  // Lieferantenverwaltung (bestehende Liste)
  // ------------------------------
  const [supplierList, setSupplierList] = useState(() => {
    const stored = localStorage.getItem("wareneingang_suppliers");
    return stored ? JSON.parse(stored) : ["CocaCola GmbH", "Lieferant ABC"];
  });
  useEffect(() => {
    localStorage.setItem("wareneingang_suppliers", JSON.stringify(supplierList));
  }, [supplierList]);

  const [newSupplier, setNewSupplier] = useState("");

  const handleAddSupplier = () => {
    const trimmed = newSupplier.trim();
    if (!trimmed) {
      showAlert("Bitte Lieferantennamen eingeben!");
      return;
    }
    if (supplierList.includes(trimmed)) {
      showAlert(`Lieferant "${trimmed}" existiert bereits!`);
      return;
    }
    setSupplierList([...supplierList, trimmed]);
    setNewSupplier("");
    showAlert(`Lieferant "${trimmed}" hinzugefügt!`);
  };

  const handleDeleteSupplier = (sup) => {
    showConfirm(
      `Lieferant "${sup}" wirklich löschen?`,
      () => {
        setSupplierList((prev) => prev.filter((s) => s !== sup));
        showAlert(`Lieferant "${sup}" gelöscht!`);
      },
      () => {}
    );
  };

  // ------------------------------
  // Auswahl relevanter Lieferanten (neu)
  // ------------------------------
  // Hier wählst du aus, welche Lieferanten heute geliefert haben.
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [suppliersSelected, setSuppliersSelected] = useState(false);

  const handleSelectSupplier = (supplier, checked) => {
    if (checked) {
      setSelectedSuppliers((prev) => [...prev, supplier]);
    } else {
      setSelectedSuppliers((prev) => prev.filter((s) => s !== supplier));
    }
  };

  const handleApplySelection = () => {
    if (selectedSuppliers.length === 0) {
      showAlert("Bitte wähle mindestens einen Lieferanten aus!");
      return;
    }
    // Erzeuge für die Kontrolle nur Einträge für die ausgewählten Lieferanten.
    const newStatus = selectedSuppliers.map((s) => ({
      supplier: s,
      status: "in Ordnung",
      remark: "",
    }));
    setSupplierStatus(newStatus);
    setSuppliersSelected(true);
  };

  // ------------------------------
  // Wareneingang-Kontrolle: Lieferanten-Status
  // ------------------------------
  // Falls noch keine Auswahl getroffen wurde, wird supplierStatus anhand der supplierList initialisiert.
  const [supplierStatus, setSupplierStatus] = useState(() =>
    supplierList.map((s) => ({
      supplier: s,
      status: "in Ordnung",
      remark: "",
    }))
  );
  useEffect(() => {
    if (!suppliersSelected) {
      setSupplierStatus(
        supplierList.map((s) => ({
          supplier: s,
          status: "in Ordnung",
          remark: "",
        }))
      );
    }
  }, [supplierList, suppliersSelected]);

  const handleStatusChange = (sup, newStatus) => {
    setSupplierStatus((prev) =>
      prev.map((obj) => (obj.supplier === sup ? { ...obj, status: newStatus } : obj))
    );
  };

  const handleRemarkChange = (sup, newRemark) => {
    setSupplierStatus((prev) =>
      prev.map((obj) => (obj.supplier === sup ? { ...obj, remark: newRemark } : obj))
    );
  };

  const [entryDate, setEntryDate] = useState(getCurrentDateTime());

  // ------------------------------
  // Wareneingangs-Einträge
  // ------------------------------
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem("wareneingang_entries");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("wareneingang_entries", JSON.stringify(entries));
  }, [entries]);

  const handleRecordEntries = () => {
    for (const supObj of supplierStatus) {
      if (supObj.status === "nicht in Ordnung" && !supObj.remark.trim()) {
        showAlert(
          `Lieferant "${supObj.supplier}" ist nicht in Ordnung - bitte Bemerkung eingeben!`
        );
        return;
      }
    }
    const newRecs = supplierStatus.map((supObj) => ({
      datumUhrzeit: entryDate,
      supplier: supObj.supplier,
      status: supObj.status,
      remark: supObj.remark,
    }));
    setEntries([...entries, ...newRecs]);
    showAlert("Wareneingangs-Einträge gespeichert!");
    setEntryDate(getCurrentDateTime());
    setSupplierStatus((prev) =>
      prev.map((obj) => ({ ...obj, status: "in Ordnung", remark: "" }))
    );
  };

  const handleDateTimeChange = (e) => {
    setEntryDate(e.target.value);
    setTimeout(() => {
      e.target.blur();
    }, 100);
  };

  // ------------------------------
  // Filter: Von-Bis Datum
  // ------------------------------
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const getFiltered = () => {
    return entries.filter((e) => {
      const entryTime = new Date(e.datumUhrzeit);
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

  const getSorted = () => {
    const arr = [...getFiltered()];
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

  // ------------------------------
  // Inline-Edit in der Tabelle
  // ------------------------------
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (globalIndex) => {
    const sorted = getSorted();
    setEditIndex(globalIndex);
    setEditData({ ...sorted[globalIndex] });
  };

  // Beim Wechsel von "nicht in Ordnung" zu "in Ordnung" soll die Bemerkung gelöscht werden
  const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditData((prev) => {
      if (field === "status" && value === "in Ordnung") {
        return { ...prev, status: value, remark: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveEdit = (globalIndex) => {
    if (editData.status === "nicht in Ordnung" && !editData.remark.trim()) {
      showAlert("Bitte Bemerkung eingeben, da 'nicht in Ordnung'!");
      return;
    }
    const sorted = getSorted();
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

  const handleDelete = (globalIndex) => {
    const sorted = getSorted();
    const item = sorted[globalIndex];
    showConfirm(
      `Eintrag von "${item.supplier}" wirklich löschen?`,
      () => {
        setEntries((prev) => prev.filter((x) => x !== item));
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

  const sortedEntries = getSorted();
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

  // SupplierManagement: Verwaltung der Lieferanten (bestehende Funktionalität)
  const SupplierManagement = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Lieferantenverwaltung</h2>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <DebouncedTextInput
          type="text"
          placeholder="Neuen Lieferanten eingeben"
          value={newSupplier}
          onChange={(e) => setNewSupplier(e.target.value)}
        />
        <button
          onClick={handleAddSupplier}
          className={`${baseBtnClasses} bg-green-600 hover:bg-green-500`}
        >
          Lieferant hinzufügen
        </button>
      </div>
      {supplierList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {supplierList.map((sup, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded"
            >
              <span>{sup}</span>
              <button
                onClick={() => handleDeleteSupplier(sup)}
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

  // SupplierSelection: Neue Komponente zur Auswahl der tatsächlich gelieferten Lieferanten
  const SupplierSelection = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Lieferanten Auswahl</h2>
      <p>Bitte wähle die Lieferanten aus, die heute geliefert haben:</p>
      <div className="flex flex-col gap-2">
        {supplierList.map((sup) => (
          <label key={sup} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedSuppliers.includes(sup)}
              onChange={(e) => handleSelectSupplier(sup, e.target.checked)}
              className="form-checkbox"
            />
            {sup}
          </label>
        ))}
      </div>
      <button
        onClick={handleApplySelection}
        className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500 mt-2`}
      >
        Auswahl übernehmen
      </button>
    </div>
  );

  // WareneingangControl: Anzeige der Kontrolle, aber nur für die ausgewählten Lieferanten
  const WareneingangControl = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Wareneingang-Kontrolle</h2>
        {/* Optional: Button um die Auswahl zu ändern */}
        <button
          onClick={() => {
            setSuppliersSelected(false);
            setSelectedSuppliers([]);
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
          value={entryDate}
          onChange={handleDateTimeChange}
          className="p-2 rounded bg-gray-700 w-full md:w-64 focus:outline-none"
        />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Lieferanten-Status</h3>
        {supplierStatus.length === 0 ? (
          <p className="text-gray-400">
            Keine Lieferanten ausgewählt. Bitte wähle oben in der Lieferantenauswahl aus.
          </p>
        ) : (
          supplierStatus.map((obj) => (
            <div
              key={obj.supplier}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2"
            >
              <span className="md:w-40">{obj.supplier}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${obj.supplier}`}
                    value="in Ordnung"
                    checked={obj.status === "in Ordnung"}
                    onChange={() => handleStatusChange(obj.supplier, "in Ordnung")}
                    className="mr-1"
                  />
                  in Ordnung
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`status-${obj.supplier}`}
                    value="nicht in Ordnung"
                    checked={obj.status === "nicht in Ordnung"}
                    onChange={() => handleStatusChange(obj.supplier, "nicht in Ordnung")}
                    className="mr-1"
                  />
                  nicht in Ordnung
                </label>
              </div>
              <div className="w-full md:w-auto min-h-[40px]">
                {obj.status === "nicht in Ordnung" ? (
                  <DebouncedTextInput
                    type="text"
                    placeholder="Bemerkung"
                    value={obj.remark}
                    onChange={(e) => handleRemarkChange(obj.supplier, e.target.value)}
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

  // PaginationControls: Wiederverwendbare Komponente für die Paginierung (oben und unten)
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

  // WareneingangTable: Anzeige der Einträge inkl. Filter, Inline-Editing etc.
  const WareneingangTable = () => (
    <div className="bg-gray-800 p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">Einträge</h2>
      {/* Von-Bis-Filter */}
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
                label="Lieferant"
                sortKey="supplier"
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
                sortKey="remark"
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
                      {/* Lieferant (Dropdown) */}
                      <td className="p-2">
                        <select
                          value={editData.supplier}
                          onChange={(e) => handleEditChange(e, "supplier")}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        >
                          {supplierList.map((sup) => (
                            <option key={sup} value={sup}>
                              {sup}
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
                          <option value="nicht in Ordnung">
                            nicht in Ordnung
                          </option>
                        </select>
                      </td>
                      {/* Bemerkung */}
                      <td className="p-2">
                        <DebouncedTextInput
                          type="text"
                          value={editData.remark}
                          onChange={(e) => handleEditChange(e, "remark")}
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
                        item.status === "nicht in Ordnung"
                          ? "bg-red-900"
                          : ""
                      }`}
                    >
                      <td className="p-2">
                        {formatDateTime(item.datumUhrzeit)}
                      </td>
                      <td className="p-2">{item.supplier}</td>
                      <td className="p-2">{item.status}</td>
                      <td className="p-2">{item.remark || "-"}</td>
                      <td className="p-2 flex space-x-2">
                        <button
                          onClick={() => startEdit(realIndex)}
                          className={`${baseBtnClasses} bg-blue-600 hover:bg-blue-500`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(realIndex)}
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
  // Gesamt-Render
  // ------------------------------
  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}
      <h1 className="text-3xl font-bold">Wareneingang</h1>
      <SupplierManagement />
      {/* Wenn noch keine Auswahl getroffen wurde, zeige SupplierSelection */}
      {!suppliersSelected ? <SupplierSelection /> : <WareneingangControl />}
      <WareneingangTable />
    </div>
  );
}
