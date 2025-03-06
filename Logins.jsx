// src/pages/Logins.jsx
import React, { useState, useEffect } from "react";
import { useAlertModal, useConfirmModal } from "../components/useModals";
import ThColumn from "../components/ThColumn";

/**
 * Helper: Stellt sicher, dass die URL mit "https://" beginnt
 */
function formatUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return "https://" + url;
}

/**
 * Kopiert Text in die Zwischenablage
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Logins() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // -------------------------------
  // Login-Einträge (inkl. E-Mail)
  // -------------------------------
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem("logins_v2");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("logins_v2", JSON.stringify(entries));
  }, [entries]);

  // -------------------------------
  // Formular für neuen Login
  // -------------------------------
  const [formData, setFormData] = useState({
    website: "",
    username: "",
    password: "",
    email: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = () => {
    if (!formData.website || !formData.username || !formData.password) {
      showAlert("Bitte mindestens Webseite, Benutzername und Passwort ausfüllen!");
      return;
    }
    const newEntry = {
      id: Date.now(),
      website: formData.website.trim(),
      username: formData.username.trim(),
      password: formData.password,
      email: formData.email.trim(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setFormData({ website: "", username: "", password: "", email: "" });
    showAlert(`Login für "${newEntry.website}" wurde hinzugefügt!`);
  };

  // -------------------------------
  // Suche (nur nach Webseite)
  // -------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEntries = entries.filter((entry) =>
    entry.website.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------------
  // Sortierung
  // -------------------------------
  const [sortKey, setSortKey] = useState("website");
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

  const getSortedEntries = () => {
    const sorted = [...filteredEntries];
    sorted.sort((a, b) => {
      const valA = (a[sortKey] || "").toString().toLowerCase();
      const valB = (b[sortKey] || "").toString().toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return sorted;
  };

  // -------------------------------
  // Pagination
  // -------------------------------
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedEntries = getSortedEntries();
  const totalPages =
    pageSize === "all" ? 1 : Math.ceil(sortedEntries.length / pageSize);

  const currentEntries =
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

  // -------------------------------
  // Inline-Edit (Edit-Button)
  // -------------------------------
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    website: "",
    username: "",
    password: "",
    email: "",
  });

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({ ...entry });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setEntries((prev) =>
      prev.map((item) => (item.id === editingId ? { ...editData } : item))
    );
    showAlert(`Login für "${editData.website}" wurde aktualisiert!`);
    setEditingId(null);
    setEditData({ website: "", username: "", password: "", email: "" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ website: "", username: "", password: "", email: "" });
  };

  // -------------------------------
  // Delete
  // -------------------------------
  const handleDelete = (entry) => {
    showConfirm(
      `Login für "${entry.website}" wirklich löschen?`,
      () => {
        setEntries((prev) => prev.filter((x) => x.id !== entry.id));
        showAlert(`Login für "${entry.website}" wurde gelöscht!`);
      },
      () => {}
    );
  };

  // -------------------------------
  // Per-Zeile Passwort-Visibility
  // -------------------------------
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const togglePasswordVisibility = (id) => {
    setPasswordVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // -------------------------------
  // Copy-to-Clipboard
  // -------------------------------
  const handleCopyPassword = async (password) => {
    const success = await copyToClipboard(password);
    if (success) {
      showAlert("Passwort in Zwischenablage kopiert!");
    } else {
      showAlert("Kopieren fehlgeschlagen.");
    }
  };

  // -------------------------------
  // Pagination-Controls (oben und unten)
  // -------------------------------
  const PaginationControls = () => (
    <div className="flex items-center justify-between w-full max-w-2xl">
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

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold">Logins verwalten</h1>

      {/* Formular für neuen Login */}
      <div className="bg-gray-800 p-4 rounded shadow w-full max-w-2xl space-y-4">
        <div>
          <label className="font-medium block">Webseite</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleFormChange}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
            placeholder="z. B. google.com"
          />
        </div>
        <div>
          <label className="font-medium block">Benutzername</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleFormChange}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
            placeholder="z. B. admin"
          />
        </div>
        <div>
          <label className="font-medium block">Passwort</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleFormChange}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
            placeholder="Passwort"
          />
        </div>
        <div>
          <label className="font-medium block">E-Mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
            placeholder="z. B. user@domain.com"
          />
        </div>
        <button
          onClick={handleAddEntry}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
        >
          Login hinzufügen
        </button>
      </div>

      {/* SUCHE in einer Zeile */}
      <div className="flex items-end gap-2 max-w-2xl">
        <div className="flex-1">
          <label className="font-medium block mb-1">Suche (Webseite)</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 rounded bg-gray-700 w-full focus:outline-none"
            placeholder="Suchbegriff eingeben..."
          />
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
                label="Webseite"
                sortKey="website"
                sortState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Benutzername"
                sortKey="username"
                sortState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="Passwort"
                sortKey="password"
                sortState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <ThColumn
                label="E-Mail"
                sortKey="email"
                sortState={{ sortKey, sortOrder }}
                onSort={handleSort}
              />
              <th className="p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-400">
                  Keine Logins gefunden.
                </td>
              </tr>
            ) : (
              currentEntries.map((entry) => {
                if (editingId === entry.id) {
                  // Inline-Edit-Zeile
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-3">
                        <input
                          type="text"
                          name="website"
                          value={editData.website}
                          onChange={handleEditChange}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          name="username"
                          value={editData.username}
                          onChange={handleEditChange}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <input
                          type={passwordVisibility[editingId] ? "text" : "password"}
                          name="password"
                          value={editData.password}
                          onChange={handleEditChange}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        />
                        <button
                          onClick={() => togglePasswordVisibility(editingId)}
                          className="px-2 py-1 text-xl"
                        >
                          {passwordVisibility[editingId] ? "🔓" : "🔒"}
                        </button>
                        <button
                          onClick={() => handleCopyPassword(editData.password)}
                          className="px-1 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                        >
                          Copy
                        </button>
                      </td>
                      <td className="p-3">
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          className="p-1 rounded bg-gray-600 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                } else {
                  // Anzeige-Zeile
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-3">
                        <a
                          href={formatUrl(entry.website)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {entry.website}
                        </a>
                      </td>
                      <td className="p-3">{entry.username}</td>
                      <td className="p-3 flex items-center gap-2">
                        <span>
                          {passwordVisibility[entry.id]
                            ? entry.password
                            : "********"}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(entry.id)}
                          className="px-1 py-1 text-xl"
                        >
                          {passwordVisibility[entry.id] ? "🔓" : "🔒"}
                        </button>
                        <button
                          onClick={() => handleCopyPassword(entry.password)}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                        >
                          Copy
                        </button>
                      </td>
                      <td className="p-3">{entry.email || "-"}</td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
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

      {AlertModal}
      {ConfirmModal}
    </div>
  );
}

// Neuen State für per-Zeile Passwort-Visibility hinzufügen
const defaultPasswordVisibility = {};
function LoginsWrapper() {
  // Wir lagern den kompletten Logins-Component in eine Wrapper-Komponente aus,
  // um den neuen State hier bereitzustellen.
  const [passwordVisibility, setPasswordVisibility] = useState(defaultPasswordVisibility);
  const togglePasswordVisibility = (id) => {
    setPasswordVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return <Logins passwordVisibility={passwordVisibility} togglePasswordVisibility={togglePasswordVisibility} />;
}

export default Logins;
