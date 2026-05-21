import ExcelJS from 'exceljs';
import { EXPORT_OPTIONS } from '../data/constants';

/**
 * Helper to generate a thin cell border configuration
 */
function thinBorder() {
  const side = { style: 'thin', color: { argb: 'D1D5DB' } };
  return { top: side, left: side, bottom: side, right: side };
}

/**
 * Helper to get the status color code
 */
function getStatusFillColor(status, colors) {
  if (status === 'Payé') return colors.statusPaye;
  if (status === 'En attente') return colors.statusPending;
  if (status === 'Remboursé') return colors.statusRefunded;
  return colors.statusStandard;
}

/**
 * Export tickets to a styled .xlsx workbook and trigger a browser download.
 *
 * @param {Array}  tickets  Full tickets array
 * @param {Object} options  Optional filters
 */
export async function exportToExcel(tickets, options = {}) {
  const { sheetColors, columnHeaders } = EXPORT_OPTIONS;

  // ── Filter tickets ───────────────────
  let filtered = [...tickets];

  // Exclude deleted tickets unless specifically asked
  if (!options.includeDeleted) {
    filtered = filtered.filter(t => t.supprime !== 1);
  }

  if (options.mode === 'typology' && options.typology) {
    filtered = filtered.filter((t) => t.typologie === options.typology);
  }

  if (options.mode === 'date') {
    if (options.dateFrom) {
      filtered = filtered.filter((t) => t.dateCommande >= options.dateFrom);
    }
    if (options.dateTo) {
      filtered = filtered.filter((t) => t.dateCommande <= options.dateTo);
    }
  }

  // ── Create workbook ───────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FestRev';
  wb.created = new Date();

  // Create one main worksheet
  const sheetName = 'Billets FestRev';
  const ws = wb.addWorksheet(sheetName);

  // ── Title row (merged banner) ───────
  const totalCols = columnHeaders.length;
  ws.mergeCells(1, 1, 1, totalCols);
  const titleCell = ws.getCell('A1');
  titleCell.value = 'FestRev — Exportation Globale de la Billetterie';
  titleCell.font = { bold: true, size: 14, color: { argb: sheetColors.titleFont } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: sheetColors.titleBg },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 38;

  // ── Column headers row ──────────────────
  const headerRow = ws.addRow(columnHeaders);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: sheetColors.headerFont } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: sheetColors.headerBg },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder();
  });

  // ── Data rows ───────────────────────────
  filtered.forEach((t, idx) => {
    const rowData = [
      t.nBillet || '',
      t.nCommande || '',
      t.nCommandeAvance || '',
      t.typologie || '',
      t.categorieFamille || '',
      t.tarif || '',
      t.codeBarres ? Number(t.codeBarres) : '',
      Number(t.composte) === 1 ? 'Oui' : 'Non',
      Number(t.supprime) === 1 ? 'Oui' : 'Non',
      t.dateCommande || '',
      t.datePaiement || '',
      t.origine || '',
      t.statutBillet || '',
      Number(t.prixPublic) || 0,
      Number(t.totalFrais) || 0,
      t.codeReduction || '',
      Number(t.reduction) || 0,
      Number(t.ttcPrixPaye) || 0,
      Number(t.commission) || 0,
      Number(t.ttcPrixSansCommission) || 0,
      Number(t.htPrixPaye) || 0,
      t.tauxTaxe || '',
      Number(t.taxe) || 0,
      t.nomAcheteur || '',
      t.prenomAcheteur || '',
      t.emailAcheteur || '',
      t.mobileAcheteur || '',
      t.nomParticipant || '',
      t.prenomParticipant || '',
      t.emailParticipant || '',
      t.civiliteParticipant || '',
      t.dateNaissanceParticipant || '',
      t.telephoneParticipant || '',
      t.villeParticipant || '',
      t.paysParticipant || '',
      t.dateNuiteeSupplementaire || '',
      t.referenceFullPass || '',
      t.factureSociete || '',
      t.factureTva || '',
      t.factureAdresse || '',
      t.factureVille || '',
      t.facturePays || '',
      t.informationsComplementaires || ''
    ];

    const dataRow = ws.addRow(rowData);

    // Style data cell borders & alignments
    const isAlt = idx % 2 === 1;
    dataRow.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = thinBorder();

      // Number formatting for currencies
      if ([14, 15, 17, 18, 19, 20, 21, 23].includes(colNumber)) {
        cell.numFmt = '#,##0.00 €';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }

      // Alternating row background
      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: sheetColors.altRowBg },
        };
      }
    });

    // Color code the status cell (column 13: Statut Billet)
    const statusCell = dataRow.getCell(13);
    const statusColor = getStatusFillColor(t.statutBillet, sheetColors);
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusColor },
    };
    statusCell.font = { bold: true, size: 9 };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Compost highlight (column 8: Composté)
    const compostCell = dataRow.getCell(8);
    if (Number(t.composte) === 1) {
      compostCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: sheetColors.statusPaye }, // green
      };
      compostCell.font = { bold: true };
    }
  });

  // ── Auto-fit Columns ──────────────────
  ws.columns.forEach((col, i) => {
    let maxLen = columnHeaders[i]?.length ?? 12;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value;
      if (val) {
        // Format strings or numbers length
        const len = typeof val === 'number' ? 10 : String(val).length;
        if (len > maxLen) maxLen = len;
      }
    });
    // Give description columns slightly more breathing space
    col.width = Math.min(Math.max(maxLen + 3, 10), 35);
  });

  // ── Summary row ─────────────────────────
  const summaryRowNumber = ws.lastRow.number + 2;
  ws.mergeCells(summaryRowNumber, 1, summaryRowNumber, 6);
  const sumCell = ws.getCell(summaryRowNumber, 1);
  
  const totalRev = filtered.reduce((s, t) => s + (Number(t.ttcPrixPaye) || 0), 0);
  const compostCount = filtered.filter(t => Number(t.composte) === 1).length;
  
  sumCell.value = `Total Billets : ${filtered.length}  |  Scannés/Compostés : ${compostCount}  |  Revenus : ${totalRev.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
  sumCell.font = { bold: true, size: 11, italic: true };
  sumCell.alignment = { horizontal: 'left', vertical: 'middle' };

  // ── Trigger browser download ──────────────────────
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${EXPORT_OPTIONS.defaultFileName}_${dateStamp}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  return fileName;
}
