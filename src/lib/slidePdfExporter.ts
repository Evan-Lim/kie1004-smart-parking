import { jsPDF } from 'jspdf';
import {
  PRESENTATION_SLIDES,
  type PresentationSlide,
  type SlideCallout,
} from '../data/slidesData';

const W = 297;
const H = 167.06;
const MARGIN = 14;

const ACCENT_RGB: Record<NonNullable<SlideCallout['accent']>, [number, number, number]> = {
  blue: [26, 115, 232],
  green: [19, 115, 51],
  amber: [176, 96, 0],
  red: [197, 34, 31],
};

function drawPdfDiagram(doc: jsPDF, slide: PresentationSlide, x: number, y: number, w: number, h: number): void {
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(218, 220, 224);
  doc.setLineWidth(0.35);
  doc.rect(x, y, w, h, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(26, 115, 232);
  doc.text(`DIAGRAM · SLIDE ${String(slide.slideNumber).padStart(2, '0')}`, x + 4, y + 6.5);

  if (slide.diagramType === 'cover-blueprint') {
    const bw = (w - 16) / 3;
    [
      { t: 'BAY 1 (0x27)', s: 'OPEN · Green', c: [19, 115, 51] as [number, number, number] },
      { t: 'BAY 2 (0x26)', s: '00:45 · RM 1', c: [176, 96, 0] as [number, number, number] },
      { t: 'BAY 3 (0x25)', s: 'OVERSTAY!', c: [197, 34, 31] as [number, number, number] },
    ].forEach((b, i) => {
      const bx = x + 4 + i * (bw + 4);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(218, 220, 224);
      doc.rect(bx, y + 11, bw, h - 25, 'FD');
      doc.setFillColor(22, 51, 39);
      doc.rect(bx + 3, y + 19, bw - 6, 13, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(185, 246, 202);
      doc.text(b.s, bx + 5, y + 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...b.c);
      doc.text(b.t, bx + 3, y + 16.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(95, 99, 104);
      doc.text('3 LEDs + US + Buzzer', bx + 3, y + h - 18);
    });
    doc.setFillColor(26, 115, 232);
    doc.rect(x + 4, y + h - 11, w - 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text('UNO R3 (20/20) + 2N2222 + PCF8574 (0x24) · 3x PASSIVE BUZZERS', x + w / 2, y + h - 5.5, { align: 'center' });
    return;
  }

  if (slide.diagramType === 'pinout-i2c') {
    const cx = x + w * 0.34;
    const cw = w * 0.32;
    doc.setFillColor(232, 240, 254);
    doc.setDrawColor(26, 115, 232);
    doc.rect(cx, y + 11, cw, h - 16, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(23, 78, 166);
    doc.text('ARDUINO UNO R3', cx + cw / 2, y + 18, { align: 'center' });
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(32, 33, 36);
    ['D0/D1 : USB Serial', 'D2-D7 : 3x HC-SR04', 'D8-13 : Bay 1&2 LED', 'A0-A2 : Bay 3 LED', 'A3    : 2N2222 Tone', 'A4/A5 : 4x I2C Bus'].forEach((line, i) => {
      doc.text(line, cx + 3, y + 27 + i * 7.5);
    });
    // Left sonar boxes
    ['Bay 1 (D2/D3)', 'Bay 2 (D4/D5)', 'Bay 3 (D6/D7)'].forEach((s, i) => {
      doc.setFillColor(230, 244, 234);
      doc.setDrawColor(19, 115, 51);
      doc.rect(x + 4, y + 13 + i * 18, w * 0.25, 13, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(19, 115, 51);
      doc.text(s, x + 7, y + 21 + i * 18);
    });
    // Right LED, 2N2222 & 4x I2C boxes
    const rx = x + w * 0.70;
    const rw = w * 0.27;
    doc.setFillColor(254, 247, 224);
    doc.setDrawColor(176, 96, 0);
    doc.rect(rx, y + 12, rw, 14, 'FD');
    doc.setFontSize(6.8);
    doc.setTextColor(122, 65, 0);
    doc.text('9 LEDs + 9x 330 Ohm', rx + 3, y + 20.5);
    doc.setFillColor(252, 232, 230);
    doc.setDrawColor(197, 34, 31);
    doc.rect(rx, y + 29, rw, 16, 'FD');
    doc.setTextColor(165, 14, 14);
    doc.text('2N2222 -> 3x Passive BZ', rx + 3, y + 36);
    doc.setFont('courier', 'normal');
    doc.text('(-) -> 0x24 P0/P1/P2', rx + 3, y + 42.5);
    doc.setFillColor(232, 240, 254);
    doc.setDrawColor(26, 115, 232);
    doc.rect(rx, y + 48, rw, 36, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 78, 166);
    doc.text('4x Shared I2C Bus:', rx + 3, y + 54.5);
    doc.setFont('courier', 'normal');
    doc.text('B1 LCD: 0x27 (Open)', rx + 3, y + 61);
    doc.text('B2 LCD: 0x26 (A0)', rx + 3, y + 67.5);
    doc.text('B3 LCD: 0x25 (A1)', rx + 3, y + 74);
    doc.text('PCF8574: 0x24 (A0+A1)', rx + 3, y + 80.5);
    return;
  }

  if (slide.diagramType === 'fsm-tdm') {
    const states = ['0. EMPTY', '1. HOLD 5s', '2. COUNT UP', '3. EXIT 3s'];
    const sw = (w - 20) / 4;
    states.forEach((st, i) => {
      const sx = x + 4 + i * (sw + 4);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(26, 115, 232);
      doc.rect(sx, y + 13, sw, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(32, 33, 36);
      doc.text(st, sx + sw / 2, y + 23.5, { align: 'center' });
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(95, 99, 104);
    doc.text('40 ms Sensor Turns + 200 ms Staggered LCDs + Dirty-Checked 0x24 3-Buzzer Gates', x + 4, y + 43);
    ['B1 0ms', 'B2 40ms', 'B3 80ms', 'B1 120ms', 'B2 160ms', 'B3 200ms'].forEach((slot, i) => {
      const sx = x + 4 + i * ((w - 14) / 6);
      doc.setFillColor(i % 3 === 0 ? 26 : i % 3 === 1 ? 19 : 176, i % 3 === 0 ? 115 : i % 3 === 1 ? 115 : 96, i % 3 === 0 ? 232 : i % 3 === 1 ? 51 : 0);
      doc.rect(sx, y + 49, (w - 20) / 6, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text(slot, sx + 2, y + 56);
    });
    return;
  }

  // Clean general caption visual for other diagram types
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 64, 67);
  const lines = doc.splitTextToSize(slide.diagramCaption, w - 10);
  doc.text(lines, x + 5, y + 16);
}

function renderSlidePage(doc: jsPDF, slide: PresentationSlide, index: number): void {
  if (index > 0) doc.addPage([W, H], 'landscape');

  // Clean white artboard + top accent stripe
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(26, 115, 232);
  doc.rect(0, 0, W, 2.2, 'F');

  // Header metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(26, 115, 232);
  doc.text(slide.sectionTag, MARGIN, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(17.5);
  doc.setTextColor(32, 33, 36);
  doc.text(doc.splitTextToSize(slide.title, W - MARGIN * 2).slice(0, 2), MARGIN, 19.5);

  if (slide.layout === 'cover-hero') {
    doc.setFontSize(9.5);
    doc.setTextColor(95, 99, 104);
    doc.text(doc.splitTextToSize(slide.subtitle, 125), MARGIN, 36);

    if (slide.stats) {
      slide.stats.forEach((st, i) => {
        const sx = MARGIN + i * 42;
        doc.setFillColor(248, 250, 253);
        doc.setDrawColor(218, 220, 224);
        doc.rect(sx, 58, 39, 19, 'FD');
        doc.setFontSize(6.5);
        doc.setTextColor(95, 99, 104);
        doc.text(st.label.toUpperCase(), sx + 3, 64.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(32, 33, 36);
        doc.text(st.value, sx + 3, 73);
        doc.setFont('helvetica', 'normal');
      });
    }

    drawPdfDiagram(doc, slide, 146, 30, 137, 82);

    // 5-member strip at bottom
    const mw = (W - MARGIN * 2 - 12) / 5;
    slide.highlights.forEach((h, i) => {
      const mx = MARGIN + i * (mw + 3);
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(218, 220, 224);
      doc.rect(mx, 120, mw, 28, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(26, 115, 232);
      doc.text(h.title, mx + 3, 126.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(95, 99, 104);
      doc.text(doc.splitTextToSize(h.body, mw - 6), mx + 3, 133);
    });
  } else if (slide.layout === 'three-pillar') {
    doc.setFontSize(9);
    doc.setTextColor(95, 99, 104);
    doc.text(slide.subtitle, MARGIN, 29);

    const colW = (W - MARGIN * 2 - 10) / 3;
    slide.highlights.forEach((h, i) => {
      const cx = MARGIN + i * (colW + 5);
      const rgb = ACCENT_RGB[h.accent ?? 'blue'];
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(218, 220, 224);
      doc.rect(cx, 37, colW, 64, 'FD');
      doc.setFillColor(...rgb);
      doc.rect(cx, 37, 2.2, 64, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(32, 33, 36);
      doc.text(doc.splitTextToSize(h.title, colW - 10), cx + 6, 46);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(60, 64, 67);
      doc.text(doc.splitTextToSize(h.body, colW - 10), cx + 6, 58);
    });

    drawPdfDiagram(doc, slide, MARGIN, 108, W - MARGIN * 2, 40);
  } else if (slide.layout === 'diagram-focus') {
    drawPdfDiagram(doc, slide, MARGIN, 31, 158, 116);
    const rx = 178;
    const rw = W - rx - MARGIN;
    slide.highlights.forEach((h, i) => {
      const ry = 31 + i * 29;
      const rgb = ACCENT_RGB[h.accent ?? 'blue'];
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(218, 220, 224);
      doc.rect(rx, ry, rw, 25, 'FD');
      doc.setFillColor(...rgb);
      doc.rect(rx, ry, 2, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(32, 33, 36);
      doc.text(h.title, rx + 5, ry + 7.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(95, 99, 104);
      doc.text(doc.splitTextToSize(h.body, rw - 8), rx + 5, ry + 14);
    });
  } else if (slide.layout === 'split-code') {
    // Left dark code panel
    doc.setFillColor(22, 27, 34);
    doc.rect(MARGIN, 31, 158, 116, 'F');
    doc.setFillColor(13, 17, 23);
    doc.rect(MARGIN, 31, 158, 9, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(121, 192, 255);
    doc.text(slide.codeSnippetTitle ?? 'C++ Firmware Code', MARGIN + 4, 37);
    doc.setTextColor(230, 237, 243);
    doc.setFontSize(7.4);
    const codeLines = (slide.codeSnippet ?? '').split('\n');
    codeLines.forEach((line, idx) => {
      doc.text(line, MARGIN + 4, 46 + idx * 6.2);
    });

    // Right concepts
    const rx = 178;
    const rw = W - rx - MARGIN;
    slide.highlights.forEach((h, i) => {
      const ry = 31 + i * 31;
      const rgb = ACCENT_RGB[h.accent ?? 'blue'];
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(218, 220, 224);
      doc.rect(rx, ry, rw, 27, 'FD');
      doc.setFillColor(...rgb);
      doc.rect(rx, ry, 2, 27, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(32, 33, 36);
      doc.text(h.title, rx + 5, ry + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(95, 99, 104);
      doc.text(doc.splitTextToSize(h.body, rw - 8), rx + 5, ry + 14.5);
    });
    drawPdfDiagram(doc, slide, rx, 125, rw, 22);
  } else if (slide.layout === 'comparison-grid') {
    doc.setFontSize(9);
    doc.setTextColor(95, 99, 104);
    doc.text(slide.subtitle, MARGIN, 29);

    let topY = 36;
    if (slide.stats) {
      const sw = (W - MARGIN * 2 - 9) / 4;
      slide.stats.forEach((st, i) => {
        const sx = MARGIN + i * (sw + 3);
        doc.setFillColor(248, 250, 253);
        doc.setDrawColor(218, 220, 224);
        doc.rect(sx, topY, sw, 15, 'FD');
        doc.setFontSize(6.5);
        doc.setTextColor(95, 99, 104);
        doc.text(st.label.toUpperCase(), sx + 3, topY + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(26, 115, 232);
        doc.text(st.value, sx + 3, topY + 12.2);
        doc.setFont('helvetica', 'normal');
      });
      topY += 20;
    }

    const leftW = 114;
    const itemH = Math.min(27, (148 - topY) / slide.highlights.length - 3);
    slide.highlights.forEach((h, i) => {
      const ry = topY + i * (itemH + 3);
      const rgb = ACCENT_RGB[h.accent ?? 'blue'];
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(218, 220, 224);
      doc.rect(MARGIN, ry, leftW, itemH, 'FD');
      doc.setFillColor(...rgb);
      doc.rect(MARGIN, ry, 2, itemH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(32, 33, 36);
      doc.text(h.title, MARGIN + 5, ry + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.3);
      doc.setTextColor(95, 99, 104);
      doc.text(doc.splitTextToSize(h.body, leftW - 8), MARGIN + 5, ry + 13);
    });

    drawPdfDiagram(doc, slide, MARGIN + leftW + 6, topY, W - MARGIN * 2 - leftW - 6, 148 - topY);
  } else {
    // timeline-closing
    doc.setFontSize(9);
    doc.setTextColor(95, 99, 104);
    doc.text(slide.subtitle, MARGIN, 29);

    drawPdfDiagram(doc, slide, MARGIN, 36, W - MARGIN * 2, 42);

    const cw = (W - MARGIN * 2 - 9) / 4;
    slide.highlights.forEach((h, i) => {
      const cx = MARGIN + i * (cw + 3);
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(218, 220, 224);
      doc.rect(cx, 86, cw, 60, 'FD');
      doc.setFillColor(26, 115, 232);
      doc.rect(cx, 86, cw, 2, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(26, 115, 232);
      doc.text(`STEP 0${i + 1}`, cx + 4, 95);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(32, 33, 36);
      doc.text(doc.splitTextToSize(h.title, cw - 8), cx + 4, 103);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(95, 99, 104);
      doc.text(doc.splitTextToSize(h.body, cw - 8), cx + 4, 115);
    });
  }

  // Clean Minimal Footer (No Spoken Script Ever Printed!)
  doc.setDrawColor(218, 220, 224);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, H - 10, W - MARGIN, H - 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(95, 99, 104);
  doc.text('KIE1004 Smart Multi-Space Parking Assistance & Management System (Arduino Uno R3)', MARGIN, H - 5.2);
  doc.text(`${String(slide.slideNumber).padStart(2, '0')} / ${PRESENTATION_SLIDES.length}`, W - MARGIN, H - 5.2, { align: 'right' });
}

export function buildSlidesPdfDocument(): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [W, H],
    compress: true,
  });

  doc.setProperties({
    title: 'KIE1004 Smart Multi-Space Parking System — Presentation Slides',
    subject: 'KIE1004 Programming 1 Assignment (Semester 1, 2026/2027)',
    author: 'KIE1004 Project Team',
  });

  PRESENTATION_SLIDES.forEach((slide, index) => {
    renderSlidePage(doc, slide, index);
  });

  return doc;
}

export function getSlidesPdfBytes(): Uint8Array {
  const doc = buildSlidesPdfDocument();
  const ab = doc.output('arraybuffer');
  return new Uint8Array(ab);
}

export function downloadSlidesPdf(): void {
  const doc = buildSlidesPdfDocument();
  doc.save('KIE1004_Smart_Parking_Presentation.pdf');
}
