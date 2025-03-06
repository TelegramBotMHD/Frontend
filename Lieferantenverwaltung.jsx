// src/pages/Lieferantenverwaltung.jsx
import React, { useState } from "react";

// Hilfs-Konstante: Wochentage
const daysOfWeek = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

/* ------------------------------------------
   HOOKS: useAlertModal und useConfirmModal
   -> Ersetzen window.alert und window.confirm
------------------------------------------- */
function useAlertModal() {
  const [alertData, setAlertData] = useState({ open: false, text: "" });
  const showAlert = (text) => setAlertData({ open: true, text });
  const closeAlert = () => setAlertData({ open: false, text: "" });
  const AlertModal = alertData.open ? (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded w-full max-w-md space-y-4">
        <p className="text-white text-lg">{alertData.text}</p>
        <div className="flex justify-end">
          <button
            onClick={closeAlert}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
  return { showAlert, AlertModal };
}

function useConfirmModal() {
  const [confirmData, setConfirmData] = useState({
    open: false,
    text: "",
    onYes: () => {},
    onNo: () => {},
  });
  const showConfirm = (text, onYes, onNo) =>
    setConfirmData({ open: true, text, onYes, onNo });
  const closeConfirm = () => setConfirmData({ ...confirmData, open: false });
  const ConfirmModal = confirmData.open ? (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded w-full max-w-md space-y-4">
        <p className="text-white text-lg">{confirmData.text}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              confirmData.onNo && confirmData.onNo();
              closeConfirm();
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Abbrechen
          </button>
          <button
            onClick={() => {
              confirmData.onYes && confirmData.onYes();
              closeConfirm();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
  return { showConfirm, ConfirmModal };
}

/* ------------------------------------------
   Sortierbare Spaltenüberschrift
------------------------------------------- */
function ThColumn({ label, sortKey, sortKeyState, onSort }) {
  const { sortKey: currentKey, sortOrder } = sortKeyState;
  const arrow = currentKey === sortKey ? (sortOrder === "asc" ? " ▲" : " ▼") : "";
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

/* ------------------------------------------
   EditSupplierModal
   (Erweiterte Version mit Dropdowns für Liefertage und Bestelltage)
------------------------------------------- */
const EditSupplierModal = ({ supplier, setSupplier, onClose, onSave }) => {
  // Wir erwarten, dass supplier.liefertage und supplier.bestelltage als Arrays gespeichert sind.
  const [editData, setEditData] = useState({
    ...supplier,
    // Falls nicht vorhanden, Standard auf leere Arrays
    liefertage: supplier.liefertage || [],
    bestelltage: supplier.bestelltage || [],
    // Optional: Anzahl Felder, damit die Dropdowns korrekt angezeigt werden
    liefertageCount: supplier.liefertage ? supplier.liefertage.length : 0,
    bestelltageCount: supplier.bestelltage ? supplier.bestelltage.length : 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayChange = (field, index, value) => {
    setEditData((prev) => {
      const days = [...(prev[field] || [])];
      days[index] = value;
      return { ...prev, [field]: days };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded w-full max-w-xl space-y-4">
        <h3 className="text-xl font-semibold">Lieferant bearbeiten – {editData.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basisfelder */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Homepage (optional)</label>
            <input
              type="text"
              name="homepage"
              value={editData.homepage}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Login Name (optional)</label>
            <input
              type="text"
              name="loginName"
              value={editData.loginName}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">PW (optional)</label>
            <input
              type="text"
              name="password"
              value={editData.password}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          {/* Liefertage */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium">Liefertage</label>
            {editData.liefertage.map((day, idx) => (
              <select
                key={idx}
                value={day}
                onChange={(e) => handleDayChange("liefertage", idx, e.target.value)}
                className="p-2 rounded bg-gray-700 focus:outline-none mb-2"
              >
                <option value="">-- wählen --</option>
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ))}
            {/* Falls keine Liefertage ausgewählt sind, Option anzeigen */}
            {editData.liefertage.length === 0 && (
              <p className="text-gray-400 text-sm">Keine Liefertage ausgewählt.</p>
            )}
          </div>
          {/* Bestelltage */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium">Bestelltage</label>
            {editData.bestelltage.map((day, idx) => (
              <select
                key={idx}
                value={day}
                onChange={(e) => handleDayChange("bestelltage", idx, e.target.value)}
                className="p-2 rounded bg-gray-700 focus:outline-none mb-2"
              >
                <option value="">-- wählen --</option>
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ))}
            {editData.bestelltage.length === 0 && (
              <p className="text-gray-400 text-sm">Keine Bestelltage ausgewählt.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onSave(editData)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------
   Hauptkomponente: Lieferantenverwaltung
------------------------------------------ */
const Lieferantenverwaltung = () => {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // Beispiel-Dummy-Daten
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "CocaCola GmbH",
      homepage: "https://www.cocacola.de",
      loginName: "cc_admin",
      password: "secret123",
      liefertage: ["Montag", "Donnerstag"],
      bestelltage: ["Dienstag", "Freitag"],
    },
    {
      id: 2,
      name: "XY Getränkehandel",
      homepage: "",
      loginName: "",
      password: "",
      liefertage: ["Mittwoch"],
      bestelltage: ["Donnerstag"],
    },
    {
      id: 3,
      name: "ABC Lieferanten",
      homepage: "https://www.abc-lieferanten.de",
      loginName: "abc_user",
      password: "abcpass",
      liefertage: ["Freitag"],
      bestelltage: ["Samstag"],
    },
  ]);

  // Formular-State für neuen Lieferanten (inkl. Liefertage & Bestelltage)
  const [form, setForm] = useState({
    name: "",
    homepage: "",
    loginName: "",
    password: "",
    liefertage: [],
    bestelltage: [],
    liefertageCount: 0,
    bestelltageCount: 0,
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "liefertageCount" || name === "bestelltageCount") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLiefertageChange = (e, index) => {
    const value = e.target.value;
    setForm((prev) => {
      const newDays = prev.liefertage ? [...prev.liefertage] : [];
      newDays[index] = value;
      return { ...prev, liefertage: newDays };
    });
  };

  const handleBestelltageChange = (e, index) => {
    const value = e.target.value;
    setForm((prev) => {
      const newDays = prev.bestelltage ? [...prev.bestelltage] : [];
      newDays[index] = value;
      return { ...prev, bestelltage: newDays };
    });
  };

  const handleAddSupplier = () => {
    if (!form.name) {
      showAlert("Bitte mindestens einen Namen eingeben!");
      return;
    }
    const newId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;
    const newSupplier = {
      id: newId,
      name: form.name,
      homepage: form.homepage,
      loginName: form.loginName,
      password: form.password,
      liefertage: form.liefertage,
      bestelltage: form.bestelltage,
    };
    setSuppliers([...suppliers, newSupplier]);
    showAlert(`Lieferant "${form.name}" wurde angelegt!`);
    setForm({
      name: "",
      homepage: "",
      loginName: "",
      password: "",
      liefertage: [],
      bestelltage: [],
      liefertageCount: 0,
      bestelltageCount: 0,
    });
  };

  const handleCancelForm = () => {
    setForm({
      name: "",
      homepage: "",
      loginName: "",
      password: "",
      liefertage: [],
      bestelltage: [],
      liefertageCount: 0,
      bestelltageCount: 0,
    });
  };

  const handleDelete = (id) => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return;
    showConfirm(
      `Lieferant "${sup.name}" wirklich löschen?`,
      () => {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        showAlert(`Lieferant "${sup.name}" wurde gelöscht!`);
      },
      () => {}
    );
  };

  const [editSupplierId, setEditSupplierId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = (sup) => {
    setEditSupplierId(sup.id);
    setEditForm({ ...sup });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "liefertageCount" || name === "bestelltageCount") {
      setEditForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditLiefertageChange = (e, index) => {
    const value = e.target.value;
    setEditForm((prev) => {
      const newDays = prev.liefertage ? [...prev.liefertage] : [];
      newDays[index] = value;
      return { ...prev, liefertage: newDays };
    });
  };

  const handleEditBestelltageChange = (e, index) => {
    const value = e.target.value;
    setEditForm((prev) => {
      const newDays = prev.bestelltage ? [...prev.bestelltage] : [];
      newDays[index] = value;
      return { ...prev, bestelltage: newDays };
    });
  };

  const handleEditSave = () => {
    if (!editForm.name) {
      showAlert("Name darf nicht leer sein!");
      return;
    }
    const updated = suppliers.map((s) =>
      s.id === editSupplierId ? { ...editForm } : s
    );
    setSuppliers(updated);
    showAlert(`Lieferant "${editForm.name}" aktualisiert!`);
    setEditSupplierId(null);
    setEditForm({});
  };

  /* ------------------------------------------
     Filter / Sortierung / Pagination
  ------------------------------------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSuppliers = suppliers.filter((s) => {
    const lower = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(lower) ||
      (s.homepage && s.homepage.toLowerCase().includes(lower))
    );
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const valA = a[sortKey] || "";
    const valB = b[sortKey] || "";
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const totalPages = pageSize === "all" ? 1 : Math.ceil(sortedSuppliers.length / pageSize);
  const currentSuppliers = pageSize === "all"
    ? sortedSuppliers
    : sortedSuppliers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8 bg-gray-800">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold mb-4">Lieferantenverwaltung</h1>

      {/* Formular: Neuer Lieferant */}
      <div className="bg-gray-800 p-4 rounded shadow w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Neuen Lieferanten anlegen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Homepage (optional)</label>
            <input
              type="text"
              name="homepage"
              value={form.homepage}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Login Name (optional)</label>
            <input
              type="text"
              name="loginName"
              value={form.loginName}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">PW (optional)</label>
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          {/* Neue Felder: Liefertage */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Anzahl Liefertage</label>
            <select
              name="liefertageCount"
              value={form.liefertageCount || 0}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          {form.liefertageCount > 0 && (
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-medium">Liefertage</label>
              {Array.from({ length: form.liefertageCount }).map((_, idx) => (
                <select
                  key={idx}
                  name={`liefertage_${idx}`}
                  value={form.liefertage ? form.liefertage[idx] || "" : ""}
                  onChange={(e) => handleLiefertageChange(e, idx)}
                  className="p-2 rounded bg-gray-700 focus:outline-none mb-2"
                >
                  <option value="">-- wählen --</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
          {/* Neue Felder: Bestelltage */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Anzahl Bestelltage</label>
            <select
              name="bestelltageCount"
              value={form.bestelltageCount || 0}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          {form.bestelltageCount > 0 && (
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-medium">Bestelltage</label>
              {Array.from({ length: form.bestelltageCount }).map((_, idx) => (
                <select
                  key={idx}
                  name={`bestelltage_${idx}`}
                  value={form.bestelltage ? form.bestelltage[idx] || "" : ""}
                  onChange={(e) => handleBestelltageChange(e, idx)}
                  className="p-2 rounded bg-gray-700 focus:outline-none mb-2"
                >
                  <option value="">-- wählen --</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleAddSupplier}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            Anlegen
          </button>
          <button
            onClick={handleCancelForm}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
          >
            Abbrechen
          </button>
        </div>
      </div>

      {/* Suchfeld */}
      <div className="w-full max-w-xl">
        <label className="mb-1 font-medium block">Lieferanten-Suche</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 rounded bg-gray-700 focus:outline-none w-full"
          placeholder="Name oder Homepage..."
        />
      </div>

      {/* Tabelle */}
      <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <ThColumn
                label="Name"
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
                sortKey="loginName"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="PW"
                sortKey="password"
                sortKeyState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <th className="p-3">Liefertage</th>
              <th className="p-3">Bestelltage</th>
              <th className="p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-400">
                  Keine Lieferanten gefunden.
                </td>
              </tr>
            ) : (
              currentSuppliers.map((sup, idx) => (
                <tr
                  key={sup.id}
                  className={`border-b border-gray-700 hover:bg-gray-700 ${
                    idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/90"
                  }`}
                >
                  <td className="p-3">{sup.name}</td>
                  <td className="p-3">
                    {sup.homepage ? (
                      <a
                        href={sup.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {sup.homepage}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{sup.loginName || "-"}</td>
                  <td className="p-3">{sup.password || "-"}</td>
                  <td className="p-3">
                    {sup.liefertage ? sup.liefertage.join(", ") : "-"}
                  </td>
                  <td className="p-3">
                    {sup.bestelltage ? sup.bestelltage.join(", ") : "-"}
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => handleEditClick(sup)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
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
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(sortedSuppliers.length / pageSize))}
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

      {/* Edit Modal */}
      {editSupplierId && (
        <EditSupplierModal
          supplier={editForm}
          setSupplier={setEditForm}
          onClose={() => {
            setEditSupplierId(null);
            setEditForm({});
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default Lieferantenverwaltung;
