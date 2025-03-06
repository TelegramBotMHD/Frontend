// src/pages/HACCPKonzept.jsx
import React from "react";
import { jsPDF } from "jspdf";

const HACCPKonzept = () => {
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let yPos = 20;
    const leftMargin = 15;
    const bottomMargin = 280; // Konstante für den unteren Seitenrand

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const writeText = (text, fontSize = 12, isBold = false, addGap = true) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(fontSize);

      const lines = doc.splitTextToSize(text, 180);
      lines.forEach((line) => {
        if (yPos > bottomMargin) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 7;
      });
      if (addGap) yPos += 2;
    };

    // PDF-Inhalt generieren
    writeText("HACCP-Konzept", 16, true);
    writeText("1. Gefahrenanalyse", 14, true);
    writeText("Bereiche und mögliche Gefahren:", 12);

    // A) Wareneingang
    writeText("A. Wareneingang", 12, true, false);
    writeText("Biologisch: Keine direkten Gefahren, da nur verpackte Produkte geliefert werden.");
    writeText("Chemisch: Kontamination durch Transportbehälter.");
    writeText("Physikalisch: Beschädigte Verpackungen, Fremdkörper in Produkten.");

    // B) Lagerung
    writeText("B. Lagerung", 12, true, false);
    writeText("Biologisch: Wachstum von Mikroorganismen bei unsachgemäßer Temperaturkontrolle.");
    writeText("Chemisch: Rückstände von Reinigungsmitteln in Kühlschränken/Tiefkühltruhen.");
    writeText("Physikalisch: Fremdkörper durch beschädigte Verpackungen.");

    // C) Auffüllen der Verkaufsautomaten
    writeText("C. Auffüllen der Verkaufsautomaten", 12, true, false);
    writeText("Biologisch: Temperaturanstieg bei zu langer Handhabung außerhalb der Kühlung.");
    writeText("Chemisch: Migration von Verpackungsmaterialien in die Lebensmittel.");
    writeText("Physikalisch: Fremdkörper durch beschädigte Verpackungen.");

    // D) Personalhygiene
    writeText("D. Personalhygiene", 12, true, false);
    writeText("Biologisch: Übertragung von Krankheitserregern durch Personal.");
    writeText("Chemisch: Unsachgemäße Handhabung von Reinigungsmitteln.");
    writeText("Physikalisch: Fremdkörper wie Haare, Schmuck.");

    writeText("2. Kritische Kontrollpunkte (CCP)", 14, true);
    writeText("• Wareneingang: Kontrolle der Verpackungsintegrität und Einhaltung der Lieferkette (Temperaturüberprüfung).");
    writeText("• Lagerung: Regelmäßige Temperaturkontrollen in Kühlschränken und Tiefkühltruhen.");
    writeText("• Auffüllen der Verkaufsautomaten: Schnelle Handhabung, um Temperaturanstieg zu vermeiden.");
    writeText("• Personalhygiene: Strenge Hygienevorschriften.");

    writeText("3. Kritische Grenzwerte", 14, true);
    writeText("Lagerungstemperaturen:");
    writeText("• Kühlschrank: 2-6°C");
    writeText("• Tiefkühltruhe: -18°C oder niedriger");
    writeText("Zeit außerhalb der Kühlung: Maximal 10 Minuten beim Auffüllen der Automaten.");

    writeText("4. Überwachungsverfahren", 14, true);
    writeText("Temperaturkontrollen: Tägliche Überprüfung und Aufzeichnung der Kühlschrank- und Tiefkühltemperaturen.");
    writeText("Visuelle Inspektion: Kontrolle der Verpackungsintegrität bei Wareneingang und beim Auffüllen der Automaten.");

    writeText("5. Korrekturmaßnahmen", 14, true);
    writeText("Abweichungen bei Temperaturkontrollen: Sofortiges Umschichten der Produkte in funktionsfähige Kühlgeräte, Entsorgung von Produkten bei längerfristigen Abweichungen.");
    writeText("Beschädigte Verpackungen: Entfernen und Entsorgen der betroffenen Produkte.");

    writeText("6. Verifizierungsverfahren", 14, true);
    writeText("Regelmäßige interne Audits: Überprüfung der Einhaltung des HACCP-Systems.");
    writeText("Mitarbeiterschulungen: Regelmäßige Auffrischung der Schulungen zur Lebensmittelsicherheit und Personalhygiene.");

    writeText("7. Dokumentation und Aufzeichnungen führen", 14, true);
    writeText("Temperaturprotokolle: Tägliche Aufzeichnungen der Kühlschrank- und Tiefkühltemperaturen.");
    writeText("Inspektionsberichte: Dokumentation der Wareneingangs- und Verpackungskontrollen.");

    doc.save("HACCP-Konzept.pdf");
  };

  return (
    <main className="w-full min-h-screen px-4 py-6 bg-gray-800 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">HACCP-Konzept</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Gefahrenanalyse</h2>
          <p className="mb-4">Bereiche und mögliche Gefahren:</p>

          <article className="mb-6">
            <h3 className="text-xl font-semibold mb-2">A. Wareneingang</h3>
            <p>
              <strong>Biologisch:</strong> Keine direkten Gefahren, da nur verpackte Produkte geliefert werden.
            </p>
            <p>
              <strong>Chemisch:</strong> Kontamination durch Transportbehälter.
            </p>
            <p>
              <strong>Physikalisch:</strong> Beschädigte Verpackungen, Fremdkörper in Produkten.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold mb-2">B. Lagerung</h3>
            <p>
              <strong>Biologisch:</strong> Wachstum von Mikroorganismen bei unsachgemäßer Temperaturkontrolle.
            </p>
            <p>
              <strong>Chemisch:</strong> Rückstände von Reinigungsmitteln in Kühlschränken/Tiefkühltruhen.
            </p>
            <p>
              <strong>Physikalisch:</strong> Fremdkörper durch beschädigte Verpackungen.
            </p>
          </article>

          <article className="mb-6">
            <h3 className="text-xl font-semibold mb-2">C. Auffüllen der Verkaufsautomaten</h3>
            <p>
              <strong>Biologisch:</strong> Temperaturanstieg bei zu langer Handhabung außerhalb der Kühlung.
            </p>
            <p>
              <strong>Chemisch:</strong> Migration von Verpackungsmaterialien in die Lebensmittel.
            </p>
            <p>
              <strong>Physikalisch:</strong> Fremdkörper durch beschädigte Verpackungen.
            </p>
          </article>

          <article>
            <h3 className="text-xl font-semibold mb-2">D. Personalhygiene</h3>
            <p>
              <strong>Biologisch:</strong> Übertragung von Krankheitserregern durch Personal.
            </p>
            <p>
              <strong>Chemisch:</strong> Unsachgemäße Handhabung von Reinigungsmitteln.
            </p>
            <p>
              <strong>Physikalisch:</strong> Fremdkörper wie Haare, Schmuck.
            </p>
          </article>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Kritische Kontrollpunkte (CCP)</h2>
          <p>
            <strong>Wareneingang:</strong> Kontrolle der Verpackungsintegrität und Einhaltung der Lieferkette (Temperaturüberprüfung).
          </p>
          <p>
            <strong>Lagerung:</strong> Regelmäßige Temperaturkontrollen in Kühlschränken und Tiefkühltruhen.
          </p>
          <p>
            <strong>Auffüllen der Verkaufsautomaten:</strong> Schnelle Handhabung, um Temperaturanstieg zu vermeiden.
          </p>
          <p>
            <strong>Personalhygiene:</strong> Strenge Hygienevorschriften.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Kritische Grenzwerte</h2>
          <p>
            <strong>Lagerungstemperaturen:</strong>
          </p>
          <p>
            <strong>Kühlschrank:</strong> 2-6°C
          </p>
          <p>
            <strong>Tiefkühltruhe:</strong> -18°C oder niedriger
          </p>
          <p>
            <strong>Zeit außerhalb der Kühlung:</strong> Maximal 10 Minuten beim Auffüllen der Automaten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Überwachungsverfahren</h2>
          <p>
            <strong>Temperaturkontrollen:</strong> Tägliche Überprüfung und Aufzeichnung der Kühlschrank- und Tiefkühltemperaturen.
          </p>
          <p>
            <strong>Visuelle Inspektion:</strong> Kontrolle der Verpackungsintegrität bei Wareneingang und beim Auffüllen der Automaten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Korrekturmaßnahmen</h2>
          <p>
            <strong>Abweichungen bei Temperaturkontrollen:</strong> Sofortiges Umschichten der Produkte in funktionsfähige Kühlgeräte, Entsorgung von Produkten bei längerfristigen Abweichungen.
          </p>
          <p>
            <strong>Beschädigte Verpackungen:</strong> Entfernen und Entsorgen der betroffenen Produkte.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Verifizierungsverfahren</h2>
          <p>
            <strong>Regelmäßige interne Audits:</strong> Überprüfung der Einhaltung des HACCP-Systems.
          </p>
          <p>
            <strong>Mitarbeiterschulungen:</strong> Regelmäßige Auffrischung der Schulungen zur Lebensmittelsicherheit und Personalhygiene.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Dokumentation und Aufzeichnungen führen</h2>
          <p>
            <strong>Temperaturprotokolle:</strong> Tägliche Aufzeichnungen der Kühlschrank- und Tiefkühltemperaturen.
          </p>
          <p>
            <strong>Inspektionsberichte:</strong> Dokumentation der Wareneingangs- und Verpackungskontrollen.
          </p>
        </section>

        <button
          onClick={handleDownloadPDF}
          className="
            bg-green-500 
            hover:bg-green-600 
            text-white 
            font-semibold 
            px-6 
            py-3 
            rounded 
            mt-6 
            focus:outline-none 
            focus:ring-2 
            focus:ring-green-500
          "
        >
          PDF Herunterladen
        </button>
      </div>
    </main>
  );
};

export default HACCPKonzept;
