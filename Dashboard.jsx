// Dashboard.jsx (optimiert)
import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Dashboard = () => {
  const quickStats = {
    gesamtArtikel: 152,
    kritischeArtikel: 12,
    lagerwert: 12345,
  };

  const letzteBuchungen = [
    { typ: "Einbuchen", artikel: "Cola 0.5L", menge: 20, zeit: "Heute, 15:30" },
    { typ: "Ausbuchen", artikel: "Red Bull 0.25L", menge: 5, zeit: "Heute, 14:15" },
    { typ: "Einbuchen", artikel: "Fanta 1L", menge: 30, zeit: "Heute, 13:00" },
  ];

  const neuesteAktivitaeten = [
    { user: "Marco", aktion: 'Benutzer "xyz" erstellt', zeit: "Heute, 14:00" },
    { user: "Anna", aktion: 'Artikel "Red Bull" geändert', zeit: "Heute, 13:20" },
  ];

  const topArtikel = [
    { name: "Cola 0.5L", menge: 120 },
    { name: "Red Bull 0.25L", menge: 110 },
    { name: "Fanta 1L", menge: 90 },
    { name: "Pepsi 0.5L", menge: 80 },
    { name: "Sprite 1L", menge: 70 },
  ];

  const flopArtikel = [
    { name: "Artikel A", menge: 5 },
    { name: "Artikel B", menge: 4 },
    { name: "Artikel C", menge: 2 },
  ];

  const COLORS = ["#ef4444", "#f97316", "#facc15"];

  return (
    <div className="p-8 space-y-8 text-white">
      {/* Schnellaktionen */}
      <div className="flex gap-4">
        {[
          { text: "Einbuchen", link: "/einbuchen", color: "bg-green-600" },
          { text: "Ausbuchen", link: "/ausbuchen", color: "bg-red-600" },
          { text: "Neuer Artikel", link: "/artikelverwaltung", color: "bg-blue-600" },
        ].map((action, idx) => (
          <Link key={idx} to={action.link} className={`px-4 py-2 rounded-lg ${action.color} hover:scale-105 transition-transform`}>
            {action.text}
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          Gesamtzahl Artikel: <span className="font-semibold">{quickStats.gesamtArtikel}</span>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          Kritische Artikel: <span className="text-red-500 font-semibold">{quickStats.kritischeArtikel}</span>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          Lagerwert (EKP Netto): <span className="font-semibold">{quickStats.lagerwert.toLocaleString()} €</span>
        </div>
      </div>

      {/* Letzte Buchungen & Neueste Aktivitäten */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Letzte Buchungen</h2>
          <ul className="space-y-1">
            {letzteBuchungen.map((b, idx) => (
              <li key={idx}>{b.typ}: {b.artikel} ({b.menge} Stück) – {b.zeit}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Neueste Aktivitäten</h2>
          <ul className="space-y-1">
            {neuesteAktivitaeten.map((a, idx) => (
              <li key={idx}>{a.user} hat {a.aktion} ({a.zeit})</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top & Flop Artikel Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Top Artikel</h2>
          <ResponsiveContainer height={200}>
            <BarChart data={topArtikel}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="menge" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Flop Artikel</h2>
          <ResponsiveContainer height={200}>
            <PieChart>
              <Pie data={flopArtikel} dataKey="menge" nameKey="name" label>
                {flopArtikel.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
