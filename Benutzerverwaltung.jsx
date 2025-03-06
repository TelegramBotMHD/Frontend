// src/pages/Benutzerverwaltung.jsx
import React, { useState } from "react";

/* ------------------------------------------
   HOOKS: useAlertModal und useConfirmModal
------------------------------------------- */
function useAlertModal() {
  const [alertData, setAlertData] = useState({ open: false, text: "" });
  const showAlert = (text) => setAlertData({ open: true, text });
  const closeAlert = () => setAlertData({ open: false, text: "" });

  const AlertModal = alertData.open && (
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
  );

  return { showAlert, AlertModal };
}

function useConfirmModal() {
  const [confirmData, setConfirmData] = useState({
    open: false,
    text: "",
    onYes: null,
    onNo: null,
  });

  const showConfirm = (text, onYes, onNo) => {
    setConfirmData({ open: true, text, onYes, onNo });
  };
  const closeConfirm = () => {
    setConfirmData((prev) => ({ ...prev, open: false }));
  };

  const ConfirmModal = confirmData.open && (
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
  );

  return { showConfirm, ConfirmModal };
}

/* ------------------------------------------
   Hauptkomponente: Benutzerverwaltung
------------------------------------------- */
export default function Benutzerverwaltung() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  // Beispiel-Dummy-Daten
  const [users, setUsers] = useState([
    { id: 1, username: "admin", role: "Admin", lastLogin: "2025-02-01 09:15" },
    { id: 2, username: "max", role: "Nutzer", lastLogin: "2025-02-10 14:42" },
  ]);

  // Formular für neuen Benutzer
  const [newUser, setNewUser] = useState({
    username: "",
    role: "Admin", // Standard
    password: "",
  });

  // Modals (PW ändern, Edit)
  const [pwModalUser, setPwModalUser] = useState(null);    // Objekt des Users, dessen PW geändert werden soll
  const [editModalUser, setEditModalUser] = useState(null); // Objekt des Users, der editiert werden soll

  /* ------------------------------------------
     Neuen Benutzer anlegen
  ------------------------------------------- */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = () => {
    // Validierung
    if (!newUser.username || !newUser.password) {
      showAlert("Bitte Benutzername und Passwort ausfüllen!");
      return;
    }

    // Ermitteln neuer ID
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    const newEntry = {
      id: newId,
      username: newUser.username,
      role: newUser.role,
      lastLogin: now,
    };
    setUsers([...users, newEntry]);
    showAlert(`Benutzer "${newUser.username}" wurde angelegt!`);

    // Formular zurücksetzen
    setNewUser({ username: "", role: "Admin", password: "" });
  };

  const handleCancel = () => {
    setNewUser({ username: "", role: "Admin", password: "" });
  };

  /* ------------------------------------------
     Benutzer löschen
  ------------------------------------------- */
  const handleDeleteUser = (id) => {
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return;
    showConfirm(
      `Benutzer "${userToDelete.username}" wirklich löschen?`,
      () => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showAlert(`Benutzer "${userToDelete.username}" gelöscht.`);
      },
      () => {}
    );
  };

  /* ------------------------------------------
     Passwort ändern
  ------------------------------------------- */
  const handleChangePassword = (userObj, newPw) => {
    // Hier könnte man einen API-Call machen
    showAlert(`Passwort für "${userObj.username}" wurde geändert auf: "${newPw}".`);
    setPwModalUser(null);
  };

  /* ------------------------------------------
     Benutzer editieren
  ------------------------------------------- */
  const handleEditUser = (id, changedName, changedRole) => {
    if (!changedName) {
      showAlert("Bitte einen Benutzernamen eingeben!");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, username: changedName, role: changedRole } : u
      )
    );
    showAlert(`Benutzer "${changedName}" wurde aktualisiert.`);
    setEditModalUser(null);
  };

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}

      <h1 className="text-3xl font-bold mb-4">Benutzerverwaltung</h1>

      {/* Formular: Neuen Benutzer anlegen */}
      <div className="bg-gray-800 p-4 rounded shadow w-full max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">Neuen Benutzer anlegen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Benutzername */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Benutzername</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          {/* Rolle */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Rolle</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Nutzer">Nutzer</option>
            </select>
          </div>
          {/* Passwort */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium">Passwort</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleFormChange}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          >
            Benutzer anlegen
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
          >
            Abbrechen
          </button>
        </div>
      </div>

      {/* Tabelle: alle Benutzer */}
      <div className="space-y-2 w-full overflow-x-auto bg-gray-800 p-2 rounded">
        <h2 className="text-2xl font-semibold mb-2 px-2">Bestehende Benutzer</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Benutzername</th>
              <th className="p-3">Rolle</th>
              <th className="p-3">Letzter Login</th>
              <th className="p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={`border-b border-gray-700 hover:bg-gray-700 ${
                  idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/90"
                }`}
              >
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.lastLogin}</td>
                <td className="p-3 flex space-x-2">
                  {/* Edit-Button */}
                  <button
                    onClick={() => setEditModalUser(u)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                  >
                    Edit
                  </button>

                  {/* PW ändern */}
                  <button
                    onClick={() => setPwModalUser(u)}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded"
                  >
                    PW ändern
                  </button>

                  {/* Löschen */}
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-400">
                  Keine Benutzer vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PW ändern-Feld */}
      {pwModalUser && (
        <PasswordChangeModal
          user={pwModalUser}
          onClose={() => setPwModalUser(null)}
          onSave={handleChangePassword}
        />
      )}

      {/* Edit-Feld */}
      {editModalUser && (
        <EditUserModal
          user={editModalUser}
          onClose={() => setEditModalUser(null)}
          onSave={handleEditUser}
        />
      )}

      {AlertModal}
      {ConfirmModal}
    </div>
  );
}

/* ------------------------------------------
   PW ändern Modal
------------------------------------------- */
function PasswordChangeModal({ user, onClose, onSave }) {
  const [newPw, setNewPw] = useState("");

  const handleSave = () => {
    if (!newPw) {
      // Falls du eine Warnung brauchst:
      // showAlert("Bitte ein Passwort eingeben!");
      return;
    }
    onSave(user, newPw);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-gray-800 p-6 rounded w-full max-w-sm space-y-4">
        <h3 className="text-xl font-semibold">
          Passwort ändern (<span className="text-blue-300">{user.username}</span>)
        </h3>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-gray-700 focus:outline-none"
          placeholder="Neues Passwort"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSave}
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
}

/* ------------------------------------------
   Edit-User Modal
------------------------------------------- */
function EditUserModal({ user, onClose, onSave }) {
  const [editName, setEditName] = useState(user.username);
  const [editRole, setEditRole] = useState(user.role);

  const handleSave = () => {
    onSave(user.id, editName, editRole);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-gray-800 p-6 rounded w-full max-w-sm space-y-4">
        <h3 className="text-xl font-semibold">Benutzer bearbeiten</h3>
        <div>
          <label className="block mb-1 font-medium">Benutzername</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Rolle</label>
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
          >
            <option value="Admin">Admin</option>
            <option value="Nutzer">Nutzer</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={handleSave}
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
}
