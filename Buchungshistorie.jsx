// src/pages/Buchungshistorie.jsx
import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import ThColumn from "../components/ThColumn";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Dummy-Daten für Buchungen
// Jedes Objekt enthält: id, date (ISO-String), bookingType ("Einbuchen" oder "Ausbuchen"), user, article, quantity
const dummyBookings = [
  { id: 1, date: "2023-04-10T09:15", bookingType: "Einbuchen", user: "admin", article: "Coca Cola 0.5L", quantity: 20 },
  { id: 2, date: "2023-04-10T10:30", bookingType: "Ausbuchen", user: "max", article: "Fanta Orange", quantity: 5 },
  { id: 3, date: "2023-04-11T11:00", bookingType: "Einbuchen", user: "anna", article: "Coke Zero", quantity: 10 },
  { id: 4, date: "2023-04-12T14:20", bookingType: "Einbuchen", user: "admin", article: "Sprite", quantity: 15 },
  { id: 5, date: "2023-04-13T16:45", bookingType: "Ausbuchen", user: "max", article: "Pepsi", quantity: 8 },
  { id: 6, date: "2023-04-14T09:50", bookingType: "Einbuchen", user: "anna", article: "Coca Cola 0.5L", quantity: 25 },
  { id: 7, date: "2023-04-15T12:10", bookingType: "Ausbuchen", user: "admin", article: "Fanta Orange", quantity: 6 },
  // weitere Buchungen ...
];

// Custom Tooltip, das den Tag, die Anzahl der Buchungen und die beteiligten Benutzer anzeigt
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow">
        <p className="font-bold">{label}</p>
        <p>Buchungen: {data.count}</p>
        <p>Benutzer: {data.users.join(", ")}</p>
      </div>
    );
  }
  return null;
};

const Buchungshistorie = () => {
  // Buchungen – in einem echten System aus der DB oder per API laden
  const [bookings, setBookings] = useState(dummyBookings);

  // Filter für den Diagramm-Bereich (von/bis)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Für die Tabelle (Sortierung, Paging, Datumsfilter)
  const [tableFromDate, setTableFromDate] = useState("");
  const [tableToDate, setTableToDate] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Gruppierung der Buchungen für das Diagramm
  const chartData = useMemo(() => {
    // Filtere Buchungen anhand des Diagramm-Datumsfilters, falls gesetzt
    const filtered = bookings.filter((b) => {
      const bDate = parseISO(b.date);
      let valid = true;
      if (fromDate) {
        valid = valid && isAfter(bDate, new Date(fromDate));
      }
      if (toDate) {
        valid = valid && isBefore(bDate, new Date(toDate));
      }
      return valid;
    });
    // Gruppierung: Für jeden Tag – Zähler und Set der Benutzer
    const groups = {};
    filtered.forEach((b) => {
      const day = format(parseISO(b.date), "yyyy-MM-dd");
      if (!groups[day]) {
        groups[day] = { date: day, count: 0, users: new Set() };
      }
      groups[day].count += 1;
      groups[day].users.add(b.user);
    });
    return Object.values(groups).map((g) => ({
      ...g,
      users: Array.from(g.users),
    }));
  }, [bookings, fromDate, toDate]);

  // Für die Tabelle: Filterung (von/bis)
  const filteredTableData = useMemo(() => {
    let data = [...bookings];
    if (tableFromDate) {
      data = data.filter((b) => parseISO(b.date) >= new Date(tableFromDate));
    }
    if (tableToDate) {
      data = data.filter((b) => parseISO(b.date) <= new Date(tableToDate));
    }
    return data;
  }, [bookings, tableFromDate, tableToDate]);

  // Sortierung der Tabellendaten
  const sortedTableData = useMemo(() => {
    return [...filteredTableData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === "date") {
        valA = parseISO(valA);
        valB = parseISO(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTableData, sortKey, sortOrder]);

  // Pagination
  const totalPages = pageSize === "all" ? 1 : Math.ceil(sortedTableData.length / pageSize);
  const currentTableData =
    pageSize === "all"
      ? sortedTableData
      : sortedTableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    <div className="w-full min-h-screen px-4 py-6 bg-gray-800 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Buchungshistorie</h1>

        {/* Diagramm-Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div>
            <label className="block font-medium mb-1">Von Datum</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Bis Datum</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Balkendiagramm */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Buchungen" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filter für die Tabelle */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div>
            <label className="block font-medium mb-1">Von Datum</label>
            <input
              type="date"
              value={tableFromDate}
              onChange={(e) => {
                setTableFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Bis Datum</label>
            <input
              type="date"
              value={tableToDate}
              onChange={(e) => {
                setTableToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded bg-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabelle */}
        <div className="w-full overflow-x-auto bg-gray-700 p-2 rounded">
          <table className="w-full text-left">
            <thead className="bg-gray-600">
              <tr>
                <ThColumn label="Datum/Uhrzeit" sortKey="date" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
                <ThColumn label="Art der Buchung" sortKey="bookingType" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
                <ThColumn label="Benutzer" sortKey="user" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
                <ThColumn label="Artikel" sortKey="article" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
                <ThColumn label="Menge" sortKey="quantity" sortState={{ sortKey, sortOrder }} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">
                    Keine Buchungen gefunden.
                  </td>
                </tr>
              ) : (
                currentTableData.map((b) => (
                  <tr key={b.id} className="border-b border-gray-500">
                    <td className="p-2">{format(parseISO(b.date), "dd.MM.yyyy HH:mm")}</td>
                    <td className="p-2">{b.bookingType}</td>
                    <td className="p-2">{b.user}</td>
                    <td className="p-2">{b.article}</td>
                    <td className="p-2">{b.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls oben */}
        <div className="flex items-center justify-between w-full">
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
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={pageSize === "all" || currentPage <= 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              &lt; Prev
            </button>
            <span>
              Seite {currentPage} / {pageSize === "all" ? 1 : Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={pageSize === "all" || currentPage >= totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Next &gt;
            </button>
          </div>
        </div>

        {/* Pagination Controls unten (optional, hier nochmal wiederholen) */}
        <div className="flex items-center justify-between w-full">
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
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={pageSize === "all" || currentPage <= 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              &lt; Prev
            </button>
            <span>
              Seite {currentPage} / {pageSize === "all" ? 1 : Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={pageSize === "all" || currentPage >= totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buchungshistorie;
