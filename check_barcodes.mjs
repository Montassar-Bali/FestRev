// Quick check: how many tickets have a valid codeBarres in Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1GwY_Cn-w2jHvLvwS7-nbDQYnEDkyJTA",
  databaseURL: "https://fest-rev-default-rtdb.firebaseio.com",
  projectId: "fest-rev",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkBarcodes() {
  console.log("Fetching all tickets from Firebase...");
  const snapshot = await get(ref(db, 'tickets'));
  const data = snapshot.val();

  if (!data) {
    console.log("No tickets found.");
    process.exit();
  }

  const entries = Object.entries(data);
  const total = entries.length;
  let hasBarcode = 0;
  let emptyBarcode = 0;
  let zeroBarcode = 0;
  const sampleWith = [];
  const sampleWithout = [];

  for (const [ticketId, ticket] of entries) {
    let cb = ticket.codeBarres;
    // Also check raw Excel column variants
    if (cb === undefined || cb === null) {
      cb = ticket["Code-barres"] || ticket["code-barres"] || ticket["Code barres"] || ticket["Code_barres"] || null;
    }

    const cbStr = String(cb ?? "").trim();
    const isEmpty = !cb || cbStr === "" || cbStr === "0";

    if (isEmpty) {
      emptyBarcode++;
      if (sampleWithout.length < 5) {
        sampleWithout.push({
          id: ticketId,
          nCommande: ticket.nCommande || ticket["N_ de commande"] || "?",
          nBillet: ticket.nBillet || ticket["N_ billet"] || "?",
          codeBarres: cb,
          allKeys: Object.keys(ticket).slice(0, 25),
        });
      }
    } else {
      hasBarcode++;
      if (sampleWith.length < 5) {
        sampleWith.push({
          id: ticketId,
          nCommande: ticket.nCommande || ticket["N_ de commande"] || "?",
          nBillet: ticket.nBillet || ticket["N_ billet"] || "?",
          codeBarres: cb,
        });
      }
    }

    if (cbStr === "0") zeroBarcode++;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`TOTAL TICKETS:        ${total}`);
  console.log(`WITH codeBarres:      ${hasBarcode}  (${(hasBarcode/total*100).toFixed(1)}%)`);
  console.log(`WITHOUT codeBarres:   ${emptyBarcode}  (${(emptyBarcode/total*100).toFixed(1)}%)`);
  console.log(`  (of which value=0): ${zeroBarcode}`);
  console.log("=".repeat(60));

  if (sampleWith.length > 0) {
    console.log(`\n--- Sample WITH barcode (${sampleWith.length}) ---`);
    for (const s of sampleWith) {
      console.log(`  nCommande=${s.nCommande}, nBillet=${s.nBillet}, codeBarres=${s.codeBarres}`);
    }
  }

  if (sampleWithout.length > 0) {
    console.log(`\n--- Sample WITHOUT barcode (${sampleWithout.length}) ---`);
    for (const s of sampleWithout) {
      console.log(`  nCommande=${s.nCommande}, nBillet=${s.nBillet}, codeBarres=${s.codeBarres}`);
      console.log(`    Fields: ${s.allKeys.join(", ")}`);
    }
  }

  // Show all unique field names from first 50 tickets
  const allKeys = new Set();
  let count = 0;
  for (const [, ticket] of entries) {
    if (count >= 50) break;
    Object.keys(ticket).forEach(k => allKeys.add(k));
    count++;
  }
  console.log(`\n--- All unique field names (from first 50 tickets) ---`);
  const sorted = [...allKeys].sort();
  console.log(sorted.join("\n  "));

  process.exit(0);
}

checkBarcodes().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
