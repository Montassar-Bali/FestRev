#!/usr/bin/env python3
"""Quick check: how many tickets have a valid codeBarres in Firebase."""
import json, urllib.request

url = "https://fest-rev-default-rtdb.firebaseio.com/tickets.json"
print("Fetching all tickets from Firebase...")
with urllib.request.urlopen(url) as resp:
    data = json.loads(resp.read())

if not data:
    print("No tickets found.")
    exit()

total = len(data)
has_barcode = 0
empty_barcode = 0
zero_barcode = 0
sample_with = []
sample_without = []

for ticket_id, ticket in data.items():
    cb = ticket.get("codeBarres", None)
    # Also check common raw Excel column variants
    if cb is None:
        cb = ticket.get("Code-barres", ticket.get("code-barres", ticket.get("Code barres", ticket.get("code barres", None))))

    if cb is None or cb == "" or cb == 0 or cb == "0":
        empty_barcode += 1
        if len(sample_without) < 3:
            sample_without.append({
                "id": ticket_id,
                "nCommande": ticket.get("nCommande", ticket.get("N_ de commande", "?")),
                "nBillet": ticket.get("nBillet", ticket.get("N_ billet", "?")),
                "codeBarres": cb,
                "all_keys": list(ticket.keys())[:20]
            })
    else:
        has_barcode += 1
        if len(sample_with) < 3:
            sample_with.append({
                "id": ticket_id,
                "nCommande": ticket.get("nCommande", ticket.get("N_ de commande", "?")),
                "nBillet": ticket.get("nBillet", ticket.get("N_ billet", "?")),
                "codeBarres": cb
            })

    if str(cb) == "0":
        zero_barcode += 1

print(f"\n{'='*60}")
print(f"TOTAL TICKETS:        {total}")
print(f"WITH codeBarres:      {has_barcode}  ({has_barcode/total*100:.1f}%)")
print(f"WITHOUT codeBarres:   {empty_barcode}  ({empty_barcode/total*100:.1f}%)")
print(f"  (of which value=0): {zero_barcode}")
print(f"{'='*60}")

if sample_with:
    print(f"\n--- Sample WITH barcode ({len(sample_with)}) ---")
    for s in sample_with:
        print(f"  nCommande={s['nCommande']}, nBillet={s['nBillet']}, codeBarres={s['codeBarres']}")

if sample_without:
    print(f"\n--- Sample WITHOUT barcode ({len(sample_without)}) ---")
    for s in sample_without:
        print(f"  nCommande={s['nCommande']}, nBillet={s['nBillet']}, codeBarres={s['codeBarres']}")
        print(f"    Fields in this ticket: {s['all_keys']}")

# Check what field names exist that might contain barcodes
print(f"\n--- All unique field names across first 50 tickets ---")
all_keys = set()
for i, (tid, ticket) in enumerate(data.items()):
    if i >= 50:
        break
    all_keys.update(ticket.keys())
for k in sorted(all_keys):
    print(f"  {k}")
