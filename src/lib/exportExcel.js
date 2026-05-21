// ─────────────────────────────────────────────
// FestRev – Excel Export (browser-only, exceljs)
// ─────────────────────────────────────────────

import ExcelJS from 'exceljs';
import { EXPORT_OPTIONS } from '../data/constants';
import { formatDate } from './helpers';

/**
 * Export reservations to a styled .xlsx workbook and trigger a browser download.
 *
 * @param {Array}  reservations  Full reservations array
 * @param {Array}  hotels        Full hotels array
 * @param {Object} options       Optional filters
 * @param {string} options.hotelId     Only include this hotel
 * @param {Object} options.dateRange   { start: ISO, end: ISO }
 */
export async function exportToExcel(reservations, hotels, options = {}) {
  const { sheetColors, columnHeaders } = EXPORT_OPTIONS;

  // ── Filter reservations ───────────────────
  let filtered = [...reservations];

  if (options.hotelId) {
    filtered = filtered.filter((r) => r.hotelId === options.hotelId);
  }

  if (options.dateRange) {
    const start = new Date(options.dateRange.start);
    const end   = new Date(options.dateRange.end);
    filtered = filtered.filter((r) => {
      const ci = new Date(r.checkIn);
      return ci >= start && ci <= end;
    });
  }

  // ── Determine which hotels to include ─────
  const relevantHotelIds = new Set(filtered.map((r) => r.hotelId));
  const relevantHotels = options.hotelId
    ? hotels.filter((h) => h.id === options.hotelId)
    : hotels.filter((h) => relevantHotelIds.has(h.id));

  // ── Create workbook ───────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FestRev';
  wb.created = new Date();

  for (const hotel of relevantHotels) {
    const hotelReservations = filtered
      .filter((r) => r.hotelId === hotel.id)
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

    // Sheet name max 31 chars (Excel limit)
    const sheetName = hotel.name.slice(0, 31);
    const ws = wb.addWorksheet(sheetName);

    // ── Title row (hotel name banner) ───────
    const totalCols = columnHeaders.length;
    ws.mergeCells(1, 1, 1, totalCols);
    const titleCell = ws.getCell('A1');
    titleCell.value = `${hotel.name}  ${'★'.repeat(hotel.stars)}  —  ${hotel.address}`;
    titleCell.font = { bold: true, size: 14, color: { argb: sheetColors.titleFont } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: sheetColors.titleBg },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 36;

    // ── Column headers row ──────────────────
    const headerRow = ws.addRow(columnHeaders);
    headerRow.height = 24;
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
    hotelReservations.forEach((res, idx) => {
      const extraDesc = (res.extraNights || [])
        .map((e) => {
          const pName = res.participants[e.participantIndex];
          const label = pName ? `${pName.prenom} ${pName.nom}` : `#${e.participantIndex + 1}`;
          return `${label} (${e.type === 'before' ? 'avant' : 'après'} ${formatDate(e.date)})`;
        })
        .join('; ');

      const rowData = [
        idx + 1,
        res.roomType,
        res.category,
      ];

      // Participants columns (up to 4 × nom + prenom)
      for (let p = 0; p < 4; p++) {
        const part = res.participants?.[p];
        rowData.push(part?.nom ?? '', part?.prenom ?? '');
      }

      rowData.push(
        formatDate(res.checkIn),
        formatDate(res.checkOut),
        extraDesc || '—',
        res.notes || '',
      );

      const dataRow = ws.addRow(rowData);

      // Alternating row color
      const isAlt = idx % 2 === 1;
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', wrapText: colNumber === totalCols };
        cell.border = thinBorder();

        // Default alternating bg
        if (isAlt) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: sheetColors.altRowBg },
          };
        }
      });

      // Category cell colour coding (column 3)
      const catCell = dataRow.getCell(3);
      const catColor = getCategoryFillColor(res.category, sheetColors);
      catCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: catColor },
      };
      catCell.font = { bold: true, size: 10 };
    });

    // ── Auto-width columns ──────────────────
    ws.columns.forEach((col, i) => {
      let maxLen = columnHeaders[i]?.length ?? 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(Math.max(maxLen + 3, 8), 40);
    });

    // ── Summary row ─────────────────────────
    const summaryRowNumber = ws.lastRow.number + 2;
    ws.mergeCells(summaryRowNumber, 1, summaryRowNumber, 4);
    const sumCell = ws.getCell(summaryRowNumber, 1);
    sumCell.value = `Total réservations : ${hotelReservations.length}  |  Participants : ${hotelReservations.reduce((s, r) => s + (r.participants?.length ?? 0), 0)}`;
    sumCell.font = { bold: true, size: 11, italic: true };
    sumCell.alignment = { horizontal: 'left' };
  }

  // ── Trigger download ──────────────────────
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

// ── Internal helpers ────────────────────────

function thinBorder() {
  const side = { style: 'thin', color: { argb: 'D1D5DB' } };
  return { top: side, left: side, bottom: side, right: side };
}

function getCategoryFillColor(category, colors) {
  const map = {
    VIP:          colors.categoryVIP,
    Artiste:      colors.categoryArtiste,
    Organisation: colors.categoryOrganisation,
    Standard:     colors.categoryStandard,
  };
  return map[category] ?? colors.categoryStandard;
}
