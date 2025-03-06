// src/pages/Ausbuchen.jsx
import React, { useState, useEffect, useRef } from "react";

const Ausbuchen = () => {
  const dummyArticles = [
    { id: 1, ean: "1234567890123", name: "Coca Cola 0.5L", bestand: 100 },
    { id: 2, ean: "7894561230456", name: "Coca Cola 1.0L", bestand: 50 },
    { id: 3, ean: "6789456123045", name: "Cola Zero 0.5L", bestand: 80 },
    { id: 4, ean: "1112223334445", name: "Fanta Orange 0.5L", bestand: 60 },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [bookings, setBookings] = useState([]);

  // Refs
  const quantityRef = useRef(null);
  const searchRef = useRef(null);

  // 1) Beim Laden: Buchungen aus sessionStorage holen
  useEffect(() => {
    const stored = sessionStorage.getItem("ausbuchenBookings");
    if (stored) {
      setBookings(JSON.parse(stored));
    }
  }, []);

  // 2) Speichern, wenn bookings sich ändern
  useEffect(() => {
    sessionStorage.setItem("ausbuchenBookings", JSON.stringify(bookings));
  }, [bookings]);

  // Such-Logik
  useEffect(() => {
    if (!searchTerm) {
      setMatches([]);
      setSelectedArticle(null);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    const found = dummyArticles.filter(
      (art) =>
        art.ean.toLowerCase().includes(lowerTerm) ||
        art.name.toLowerCase().includes(lowerTerm)
    );
    setMatches(found);

    // Wenn genau 1 Treffer -> auto-Auswahl
    if (found.length === 1) {
      const art = found[0];
      setSelectedArticle(art);
      setSearchTerm(art.name);
      quantityRef.current?.focus();
    } else {
      setSelectedArticle(null);
    }
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedArticle) {
      console.log("Kein Artikel eindeutig gefunden!");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      console.log("Bitte eine gültige positive Menge eingeben!");
      return;
    }
    if (selectedArticle.bestand < qty) {
      console.log("Bestand zu niedrig! Ausbuchung nicht möglich.");
      return;
    }

    // Ausbuchen
    const now = new Date().toLocaleString();
    const bookingRecord = {
      id: Date.now(),
      articleId: selectedArticle.id,
      articleName: selectedArticle.name,
      ean: selectedArticle.ean,
      quantity: qty,
      date: now,
    };
    setBookings([bookingRecord, ...bookings]);

    // Kein Alert - direkt weiter
    // Reset => Cursor ins Suchfeld
    setSearchTerm("");
    setMatches([]);
    setSelectedArticle(null);
    setQuantity("");
    searchRef.current?.focus();
  };

  // ENTER im Mengenfeld => handleSubmit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  // Artikel aus Liste auswählen
  const handleSelectArticle = (art) => {
    setSelectedArticle(art);
    setSearchTerm(art.name);
    setMatches([art]);
    quantityRef.current?.focus();
  };

  // Buchung löschen
  const handleDeleteBooking = (bookingId) => {
    const confirmDelete = window.confirm("Buchung wirklich löschen?");
    if (confirmDelete) {
      setBookings(bookings.filter((b) => b.id !== bookingId));
    }
  };

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold mb-4">Ausbuchen</h1>

      <div className="bg-gray-800 p-4 rounded shadow max-w-xl space-y-4">
        <h2 className="text-xl font-semibold">Ware ausbuchen</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Artikel/EAN */}
          <div className="flex flex-col relative">
            <label className="mb-1 font-medium">Artikel/EAN suchen</label>
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded bg-gray-700 focus:outline-none"
              placeholder="EAN oder Artikelname..."
              autoFocus
            />
            {searchTerm && matches.length > 1 && !selectedArticle && (
              <div className="absolute mt-14 w-full bg-gray-700 rounded shadow-lg z-20 max-h-60 overflow-auto">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 hover:bg-gray-600 cursor-pointer border-b border-gray-600"
                    onClick={() => handleSelectArticle(m)}
                    onDoubleClick={() => handleSelectArticle(m)}
                  >
                    <span className="font-semibold">{m.ean}</span> – {m.name}
                  </div>
                ))}
              </div>
            )}
            {searchTerm && matches.length === 0 && (
              <small className="text-red-400">Kein passender Artikel gefunden</small>
            )}
          </div>

          {/* Menge */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Menge</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="p-2 rounded bg-gray-700 focus:outline-none"
              ref={quantityRef}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            >
              Buchen
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setMatches([]);
                setSelectedArticle(null);
                setQuantity("");
                searchRef.current?.focus();
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>

      {/* Letzte Ausbuchungen */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Letzte Ausbuchungen (Session only)</h2>
        <table className="w-full text-left bg-gray-800 rounded overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Artikel</th>
              <th className="p-3">EAN</th>
              <th className="p-3">Menge</th>
              <th className="p-3">Datum</th>
              <th className="p-3">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr
                key={b.id}
                className={`border-b border-gray-700 hover:bg-gray-700 ${
                  i % 2 === 0 ? "bg-gray-800" : "bg-gray-800/90"
                }`}
              >
                <td className="p-3">{b.articleName}</td>
                <td className="p-3">{b.ean}</td>
                <td className="p-3">{b.quantity}</td>
                <td className="p-3">{b.date}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteBooking(b.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ausbuchen;
