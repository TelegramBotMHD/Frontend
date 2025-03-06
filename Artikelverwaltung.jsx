// src/pages/Artikelverwaltung.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAlertModal, useConfirmModal } from "../components/useModals";
import ThColumn from "../components/ThColumn";
import TextInput from "../components/TextInput";

function NewArticleForm({ form, errors, setForm, dummySuppliers, onAddArticle }) {
  // Steuer und EKP-Brutto berechnen, sobald relevante Felder sich ändern
  useEffect(() => {
    const ekNetto = parseFloat(form.ekpNetto) || 0;
    const pf = parseFloat(form.pfand) || 0;
    const satz = parseFloat(form.steuerSatz) || 19;

    const calculatedSteuer = parseFloat(((ekNetto + pf) * (satz / 100)).toFixed(3));
    const calculatedBrutto = parseFloat(
      (ekNetto + pf + (ekNetto + pf) * (satz / 100)).toFixed(2)
    );

    if (
      calculatedSteuer !== parseFloat(form.steuerBetrag) ||
      calculatedBrutto !== parseFloat(form.ekpBrutto)
    ) {
      setForm((prev) => ({
        ...prev,
        steuerBetrag: calculatedSteuer,
        ekpBrutto: calculatedBrutto,
      }));
    }
  }, [form.ekpNetto, form.pfand, form.steuerSatz, form.steuerBetrag, form.ekpBrutto, setForm]);

  // Eingaben normalisieren (z.B. Komma in Punkt umwandeln)
  const handleLocalChange = (e) => {
    let { name, value } = e.target;
    if (["ekpNetto", "pfand", "menge", "vkp"].includes(name)) {
      value = value.replace(",", ".");
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-semibold mb-2">Neuen Artikel anlegen</h2>

      {/* 
        Drei Spalten nebeneinander (ab md-Screen),
        auf kleineren Bildschirmen automatisch gestapelt
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1) Basisdaten */}
        <div className="bg-gray-700 p-4 rounded space-y-4">
          <h3 className="text-lg font-medium">Basisdaten</h3>
          <div className="space-y-4">
            <div>
              <label className="font-medium">Art.-Name *</label>
              <input
                type="text"
                name="artikelname"
                value={form.artikelname}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.artikelname ? "border border-red-500" : ""
                }`}
              />
              {errors.artikelname && (
                <small className="text-red-400">{errors.artikelname}</small>
              )}
            </div>

            <div>
              <label className="font-medium">EAN</label>
              <input
                type="text"
                name="ean"
                value={form.ean}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.ean ? "border border-red-500" : ""
                }`}
              />
              {errors.ean && <small className="text-red-400">{errors.ean}</small>}
            </div>

            <div>
              <label className="font-medium">Menge *</label>
              <input
                type="number"
                name="menge"
                value={form.menge}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.menge ? "border border-red-500" : ""
                }`}
              />
              {errors.menge && <small className="text-red-400">{errors.menge}</small>}
            </div>
          </div>
        </div>

        {/* 2) Preis & Steuer */}
        <div className="bg-gray-700 p-4 rounded space-y-4">
          <h3 className="text-lg font-medium">Preis &amp; Steuer</h3>
          <div className="space-y-4">
            <div>
              <label className="font-medium">EKP-Netto (EUR) *</label>
              <input
                type="number"
                step="0.01"
                name="ekpNetto"
                value={form.ekpNetto}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.ekpNetto ? "border border-red-500" : ""
                }`}
              />
              {errors.ekpNetto && <small className="text-red-400">{errors.ekpNetto}</small>}
            </div>

            <div>
              <label className="font-medium">Pfand (EUR)</label>
              <input
                type="number"
                step="0.01"
                name="pfand"
                value={form.pfand}
                onChange={handleLocalChange}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium">Steuer %</label>
              <select
                name="steuerSatz"
                value={form.steuerSatz}
                onChange={handleLocalChange}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none"
              >
                <option value={7}>7</option>
                <option value={19}>19</option>
              </select>
            </div>

            <div>
              <label className="font-medium">Steuer (EUR)</label>
              <input
                type="number"
                step="0.001"
                disabled
                value={form.steuerBetrag}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none opacity-70"
              />
            </div>

            <div>
              <label className="font-medium">EKP-Brutto (EUR)</label>
              <input
                type="number"
                step="0.01"
                disabled
                value={form.ekpBrutto}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none opacity-70"
              />
            </div>

            <div>
              <label className="font-medium">VKP (EUR) *</label>
              <input
                type="number"
                step="0.01"
                name="vkp"
                value={form.vkp}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.vkp ? "border border-red-500" : ""
                }`}
              />
              {errors.vkp && <small className="text-red-400">{errors.vkp}</small>}
            </div>
          </div>
        </div>

        {/* 3) Lieferant & Sonstiges */}
        <div className="bg-gray-700 p-4 rounded space-y-4">
          <h3 className="text-lg font-medium">Lieferant &amp; Sonstiges</h3>
          <div className="space-y-4">
            <div>
              <label className="font-medium">Lieferant *</label>
              <select
                name="lieferantId"
                value={form.lieferantId}
                onChange={handleLocalChange}
                className={`p-2 w-full rounded bg-gray-600 focus:outline-none ${
                  errors.lieferantId ? "border border-red-500" : ""
                }`}
              >
                <option value="">-- wählen --</option>
                {dummySuppliers
                  .filter((s) => s.id !== 0)
                  .map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
              </select>
              {errors.lieferantId && (
                <small className="text-red-400">{errors.lieferantId}</small>
              )}
            </div>

            <div>
              <label className="font-medium">Art.-Nr. Lieferant</label>
              <input
                type="text"
                name="artikelnummerLieferant"
                value={form.artikelnummerLieferant}
                onChange={handleLocalChange}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium">Link (optional)</label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleLocalChange}
                className="p-2 w-full rounded bg-gray-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Button am unteren Rand */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onAddArticle}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Artikel anlegen
        </button>
      </div>
    </div>
  );
}

function Artikelzeile({
  art,
  isEditing,
  inlineEditData,
  onInlineChange,
  onInlineSave,
  onInlineCancel,
  dummySuppliers,
  handleRowDoubleClick,
  onDeleteArticle,
}) {
  if (isEditing) {
    return (
      <tr className="border-b border-gray-700 hover:bg-gray-700 bg-gray-700/90">
        <td className="p-3">
          <input
            type="text"
            value={inlineEditData.artikelname}
            onChange={(e) => onInlineChange(e, "artikelname")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="text"
            value={inlineEditData.ean}
            onChange={(e) => onInlineChange(e, "ean")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="number"
            value={inlineEditData.menge}
            onChange={(e) => onInlineChange(e, "menge")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="number"
            step="0.01"
            value={inlineEditData.ekpNetto}
            onChange={(e) => onInlineChange(e, "ekpNetto")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="number"
            step="0.01"
            value={inlineEditData.pfand}
            onChange={(e) => onInlineChange(e, "pfand")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <select
            value={inlineEditData.steuerSatz}
            onChange={(e) => onInlineChange(e, "steuerSatz")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          >
            <option value={7}>7</option>
            <option value={19}>19</option>
          </select>
        </td>
        <td className="p-3">
          <input
            type="number"
            step="0.001"
            disabled
            value={inlineEditData.steuerBetrag}
            className="p-1 rounded bg-gray-600 opacity-70 w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="number"
            step="0.01"
            disabled
            value={inlineEditData.ekpBrutto}
            className="p-1 rounded bg-gray-600 opacity-70 w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="number"
            step="0.01"
            value={inlineEditData.vkp}
            onChange={(e) => onInlineChange(e, "vkp")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          {(inlineEditData.vkp - inlineEditData.ekpBrutto).toFixed(2)}
        </td>
        <td className="p-3">
          {inlineEditData.ekpBrutto > 0
            ? (((inlineEditData.vkp - inlineEditData.ekpBrutto) / inlineEditData.ekpBrutto) * 100).toFixed(2) + "%"
            : "0.00%"}
        </td>
        <td className="p-3">
          <select
            value={inlineEditData.lieferantId}
            onChange={(e) => onInlineChange(e, "lieferantId")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          >
            {dummySuppliers.filter((s) => s.id !== 0).map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </td>
        <td className="p-3">
          <input
            type="text"
            value={inlineEditData.artikelnummerLieferant}
            onChange={(e) => onInlineChange(e, "artikelnummerLieferant")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3">
          <input
            type="text"
            value={inlineEditData.link}
            onChange={(e) => onInlineChange(e, "link")}
            className="p-1 rounded bg-gray-600 focus:outline-none w-full"
          />
        </td>
        <td className="p-3 flex space-x-2">
          <button
            onClick={onInlineSave}
            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded"
          >
            Save
          </button>
          <button
            onClick={onInlineCancel}
            className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700" onDoubleClick={() => handleRowDoubleClick(art)}>
      <td className="p-3">{art.artikelname}</td>
      <td className="p-3">{art.ean}</td>
      <td className="p-3">{art.menge}</td>
      <td className="p-3">{art.ekpNetto.toFixed(2)}</td>
      <td className="p-3">{art.pfand.toFixed(2)}</td>
      <td className="p-3">{art.steuerSatz}%</td>
      <td className="p-3">{art.steuerBetrag.toFixed(3)}</td>
      <td className="p-3">{art.ekpBrutto.toFixed(2)}</td>
      <td className="p-3">{art.vkp.toFixed(2)}</td>
      <td className="p-3">{(art.vkp - art.ekpBrutto).toFixed(2)}</td>
      <td className="p-3">
        {art.ekpBrutto > 0
          ? (((art.vkp - art.ekpBrutto) / art.ekpBrutto) * 100).toFixed(2) + "%"
          : "0.00%"}
      </td>
      <td className="p-3">{dummySuppliers.find((s) => s.id === art.lieferantId)?.name || ""}</td>
      <td className="p-3">{art.artikelnummerLieferant || ""}</td>
      <td className="p-3">
        {art.link ? (
          <a href={art.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
            {art.link}
          </a>
        ) : (
          "-"
        )}
      </td>
      <td className="p-3 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteArticle(art.id);
          }}
          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
        >
          Löschen
        </button>
        <span className="text-gray-400 text-sm">Double-Click: Edit</span>
      </td>
    </tr>
  );
}

function Artikelverwaltung() {
  const { showAlert, AlertModal } = useAlertModal();
  const { showConfirm, ConfirmModal } = useConfirmModal();

  const dummySuppliers = [
    { id: 0, name: "Alle" },
    { id: 1, name: "CocaCola GmbH" },
    { id: 2, name: "XY Getränkehandel" },
    { id: 3, name: "ABC Lieferanten" },
  ];

  const [articles, setArticles] = useState([
    {
      id: 1001,
      artikelname: "Coca Cola 0.5L",
      ean: "1234567890123",
      menge: 100,
      ekpNetto: 0.5,
      pfand: 0.25,
      steuerSatz: 19,
      steuerBetrag: 0.143,
      ekpBrutto: 0.893,
      vkp: 1.19,
      lieferantId: 1,
      artikelnummerLieferant: "CC-500",
      link: "https://www.coca-cola.com",
    },
    {
      id: 1002,
      artikelname: "Fanta Orange 1L",
      ean: "5554443332221",
      menge: 50,
      ekpNetto: 0.6,
      pfand: 0.25,
      steuerSatz: 19,
      steuerBetrag: 0.158,
      ekpBrutto: 1.008,
      vkp: 1.29,
      lieferantId: 1,
      artikelnummerLieferant: "FA-1L",
      link: "",
    },
  ]);

  const [form, setForm] = useState({
    artikelname: "",
    ean: "",
    menge: "",
    ekpNetto: "",
    pfand: "",
    steuerSatz: 19,
    steuerBetrag: 0,
    ekpBrutto: 0,
    vkp: "",
    lieferantId: "",
    artikelnummerLieferant: "",
    link: "",
  });
  const [errors, setErrors] = useState({});

  const [editingArticleId, setEditingArticleId] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({});

  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [tableSupplier, setTableSupplier] = useState(0);
  const [sortKey, setSortKey] = useState("artikelname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableColumns, setTableColumns] = useState({
    artikelname: true,
    ean: true,
    menge: true,
    ekpNetto: true,
    pfand: true,
    steuerSatz: true,
    steuerBetrag: true,
    ekpBrutto: true,
    vkp: true,
    profitEuro: true,
    profitPerc: true,
    lieferant: true,
    artikelnummerLieferant: true,
    link: true,
  });

  const handleFormChange = useCallback((e) => {
    let { name, value } = e.target;
    if (["ekpNetto", "pfand", "menge", "vkp"].includes(name)) {
      value = value.replace(",", ".");
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddArticle = () => {
    const newErrors = {};
    if (!form.artikelname) newErrors.artikelname = "Art.-Name fehlt!";
    if (!form.ekpNetto) newErrors.ekpNetto = "EKP-Netto (EUR) fehlt!";
    if (!form.menge) newErrors.menge = "Menge fehlt!";
    if (!form.vkp) newErrors.vkp = "VKP (EUR) fehlt!";
    if (!form.lieferantId) newErrors.lieferantId = "Lieferant fehlt!";

    if (form.ean) {
      const existsEAN = articles.some(
        (a) => a.ean.toLowerCase() === form.ean.toLowerCase()
      );
      if (existsEAN) newErrors.ean = "EAN bereits vorhanden!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1000;
    const newArt = {
      id: newId,
      artikelname: form.artikelname,
      ean: form.ean,
      menge: parseInt(form.menge, 10) || 0,
      ekpNetto: parseFloat(form.ekpNetto) || 0,
      pfand: parseFloat(form.pfand) || 0,
      steuerSatz: parseFloat(form.steuerSatz) || 19,
      steuerBetrag: parseFloat(form.steuerBetrag) || 0,
      ekpBrutto: parseFloat(form.ekpBrutto) || 0,
      vkp: parseFloat(form.vkp) || 0,
      lieferantId: parseInt(form.lieferantId, 10) || 0,
      artikelnummerLieferant: form.artikelnummerLieferant,
      link: form.link,
    };

    setArticles((prev) => [...prev, newArt]);
    showAlert(`Artikel "${form.artikelname}" wurde angelegt!`);
    setForm({
      artikelname: "",
      ean: "",
      menge: "",
      ekpNetto: "",
      pfand: "",
      steuerSatz: 19,
      steuerBetrag: 0,
      ekpBrutto: 0,
      vkp: "",
      lieferantId: "",
      artikelnummerLieferant: "",
      link: "",
    });
  };

  const handleRowDoubleClick = (art) => {
    setEditingArticleId(art.id);
    setInlineEditData({ ...art });
  };

  const handleInlineChange = (e, field) => {
    let { value } = e.target;
    if (["ekpNetto", "pfand", "menge", "vkp"].includes(field)) {
      value = value.replace(",", ".");
    }
    setInlineEditData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!editingArticleId) return;
    const ekNetto = parseFloat(inlineEditData.ekpNetto) || 0;
    const pf = parseFloat(inlineEditData.pfand) || 0;
    const satz = parseFloat(inlineEditData.steuerSatz) || 19;
    const newSteuer = parseFloat(((ekNetto + pf) * (satz / 100)).toFixed(3));
    const newBrutto = parseFloat((ekNetto + pf + (ekNetto + pf) * (satz / 100)).toFixed(2));
    if (
      newSteuer !== parseFloat(inlineEditData.steuerBetrag) ||
      newBrutto !== parseFloat(inlineEditData.ekpBrutto)
    ) {
      setInlineEditData((prev) => ({ ...prev, steuerBetrag: newSteuer, ekpBrutto: newBrutto }));
    }
  }, [inlineEditData.ekpNetto, inlineEditData.pfand, inlineEditData.steuerSatz, editingArticleId]);

  const handleInlineSave = () => {
    if (inlineEditData.ean) {
      const exists = articles.some(
        (a) =>
          a.id !== editingArticleId &&
          a.ean.toLowerCase() === inlineEditData.ean.toLowerCase()
      );
      if (exists) {
        showAlert("EAN bereits vorhanden!");
        return;
      }
    }
    const updatedList = articles.map((a) =>
      a.id === editingArticleId ? { ...inlineEditData } : a
    );
    setArticles(updatedList);
    showAlert(`Artikel "${inlineEditData.artikelname}" wurde aktualisiert!`);
    setEditingArticleId(null);
    setInlineEditData({});
  };

  const handleInlineCancel = () => {
    setEditingArticleId(null);
    setInlineEditData({});
  };

  const handleDeleteArticle = (id) => {
    const art = articles.find((a) => a.id === id);
    if (!art) return;
    showConfirm(
      `Artikel "${art.artikelname}" wirklich löschen?`,
      () => {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showAlert(`Artikel "${art.artikelname}" wurde gelöscht!`);
      },
      () => {}
    );
  };

  const getFilteredSortedArticles = () => {
    const filtered = articles.filter((a) => {
      const searchLC = tableSearchTerm.toLowerCase();
      const combined = (a.artikelname + " " + (a.ean || "")).toLowerCase();
      if (!combined.includes(searchLC)) return false;
      if (tableSupplier !== 0 && a.lieferantId !== tableSupplier) return false;
      return true;
    });
    const sorted = [...filtered].sort((x, y) => {
      const profitX = x.vkp - x.ekpBrutto;
      const profitY = y.vkp - y.ekpBrutto;
      const profitPercX = x.ekpBrutto ? (profitX / x.ekpBrutto) * 100 : 0;
      const profitPercY = y.ekpBrutto ? (profitY / y.ekpBrutto) * 100 : 0;
      const getSupplierName = (art) =>
        dummySuppliers.find((s) => s.id === art.lieferantId)?.name || "";
      const getVal = (art) => {
        switch (sortKey) {
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
            return profitX;
          case "profitPerc":
            return profitPercX;
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
    setTableColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <div className="w-full min-h-screen px-4 py-6 text-white space-y-8">
      {AlertModal}
      {ConfirmModal}
      <h1 className="text-3xl font-bold mb-4">Artikelverwaltung</h1>

      {/* 1) Neues Artikelformular */}
      <div className="bg-gray-800 p-4 rounded shadow w-full">
        <NewArticleForm
          form={form}
          errors={errors}
          setForm={setForm}
          dummySuppliers={dummySuppliers}
          onAddArticle={handleAddArticle}
          handleFormChange={handleFormChange}
        />
      </div>

      {/* 2) Tabellen-Filter */}
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

      {/* 3) Spaltentoggle */}
      <div className="bg-gray-800 p-4 rounded shadow w-full">
        <h2 className="text-xl font-semibold mb-2">Tabelle Spalten</h2>
        <div className="flex flex-wrap gap-4">
          {[
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
          ].map(([colKey, label]) => (
            <label key={colKey} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableColumns[colKey]}
                onChange={() => handleToggleTableColumn(colKey)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4) Paging */}
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
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(getFilteredSortedArticles().length / pageSize))}
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

      {/* 5) Tabelle */}
      <div className="w-full overflow-x-auto bg-gray-800 p-2 rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <ThColumn label="Art.-Name" sortKey="artikelname" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="EAN" sortKey="ean" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Menge" sortKey="menge" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="EKP-Netto (EUR)" sortKey="ekpNetto" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Pfand (EUR)" sortKey="pfand" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Steuer %" sortKey="steuerSatz" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Steuer (EUR)" sortKey="steuerBetrag" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="EKP-Brutto (EUR)" sortKey="ekpBrutto" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="VKP (EUR)" sortKey="vkp" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Gewinn (EUR)" sortKey="profitEuro" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Gewinn %" sortKey="profitPerc" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Lieferant" sortKey="lieferant" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Art.-Nr. Lieferant" sortKey="artikelnummerLieferant" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <ThColumn label="Link" sortKey="link" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              <th className="p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {currentArticles.length === 0 ? (
              <tr>
                <td colSpan={999} className="p-3 text-center text-gray-400">
                  Keine Artikel gefunden.
                </td>
              </tr>
            ) : (
              currentArticles.map((art) => (
                <Artikelzeile
                  key={art.id}
                  art={art}
                  isEditing={editingArticleId === art.id}
                  inlineEditData={inlineEditData}
                  onInlineChange={handleInlineChange}
                  onInlineSave={handleInlineSave}
                  onInlineCancel={handleInlineCancel}
                  dummySuppliers={dummySuppliers}
                  handleRowDoubleClick={handleRowDoubleClick}
                  onDeleteArticle={handleDeleteArticle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paging unten */}
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
            {pageSize === "all" ? 1 : Math.max(1, Math.ceil(getFilteredSortedArticles().length / pageSize))}
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
      {ConfirmModal}
    </div>
  );
}

export default Artikelverwaltung;
