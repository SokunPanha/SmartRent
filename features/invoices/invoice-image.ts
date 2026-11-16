import { Invoice } from '@/lib/types';
import {
  Bilingual,
  DOC,
  STATUS_LABEL,
  billingPeriod,
  fmtKHR,
  fmtUSD,
  InvoiceIssuer,
  PaymentInfo,
  invoiceLines,
  invoiceTitle,
  invoiceTotals,
} from './invoice-document';

/**
 * Renders an invoice as a PNG (Canvas 2D, no dependencies) for sending as a
 * Telegram photo. Mirrors the printable invoice (PrintInvoiceModal): same
 * content from invoice-document.ts, same standard layout, bilingual with
 * Khmer first.
 *
 * Latin text uses the page's fonts (Geist / JetBrains Mono); Khmer glyphs
 * fall back to a system Khmer font, which the browser resolves per glyph.
 */

export interface InvoiceImageInput {
  invoice: Invoice;
  tenantName: Bilingual;
  tenantPhone?: string;
  roomNumber: string;
  floor?: number;
  propertyName: Bilingual;
  /** Business (or building) issuing the invoice — see invoiceIssuer(). */
  issuer: InvoiceIssuer;
  /** Bank account + QR to pay into, if configured. */
  payment: PaymentInfo | null;
  /** The payment QR image, already loaded (see loadImage). */
  qrImage?: ImageBitmap | null;
}

/** Fetches an image (e.g. the authenticated payment QR) for drawing. */
export async function loadImage(url: string): Promise<ImageBitmap | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await createImageBitmap(await res.blob());
  } catch {
    return null;
  }
}

const W = 1080; // logical width; drawn at 2x for crisp text when zoomed
const SCALE = 2;
const M = 64; // page margin
const CW = W - M * 2; // content width

const C = {
  ink: '#1B1C20',
  body: '#4A4F57',
  muted: '#6B7079',
  faint: '#9AA0A8',
  hair: '#E3E7EB',
  panel: '#F4F6F8',
  primary: '#4F5BEF',
  primaryDeep: '#3540C9',
  primaryTint: '#EEF0FE',
  green: '#1F9D5C',
};

const STATUS_COLORS: Record<Invoice['status'], { fg: string; bg: string }> = {
  paid: { fg: '#1F9D5C', bg: '#E8F6EE' },
  partial: { fg: '#94690A', bg: '#FBF3DD' },
  unpaid: { fg: '#D93D42', bg: '#FDECEC' },
  overdue: { fg: '#D93D42', bg: '#FDECEC' },
};

function fontFamilies() {
  const root = getComputedStyle(document.documentElement);
  const sans = root.getPropertyValue('--font-sans').trim() || getComputedStyle(document.body).fontFamily;
  const mono = root.getPropertyValue('--font-mono').trim() || 'ui-monospace, monospace';
  const khmer = "'Khmer Sangam MN', 'Khmer OS', 'Noto Sans Khmer', 'Leelawadee UI'";
  return { sans: `${sans}, ${khmer}, sans-serif`, mono: `${mono}, ${khmer}, monospace` };
}

/** Shortens `text` with an ellipsis so it fits `maxWidth` (current font). */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo) + '…';
}

/** Word-wraps `text` to `maxWidth` (current font), at most `maxLines`. Khmer
 *  has no spaces between words, so it falls back to wrapping by character. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3): string[] {
  const tokens = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
  const lines: string[] = [];
  let line = '';
  for (const tok of tokens) {
    const next = line + tok;
    if (ctx.measureText(next).width <= maxWidth || !line.trim()) line = next;
    else {
      lines.push(line.trim());
      line = tok.trim() ? tok : '';
    }
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = fit(ctx, kept[maxLines - 1] + '…', maxWidth);
    return kept;
  }
  return lines;
}

export async function renderInvoiceImage(input: InvoiceImageInput): Promise<Blob> {
  const { invoice: inv } = input;
  const F = fontFamilies();

  await Promise.all(
    ['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 32px ${F.sans}`).catch(() => [])),
  );
  await document.fonts.load(`600 32px ${F.mono}`).catch(() => []);

  const lines = invoiceLines(inv);
  const totals = invoiceTotals(inv);
  const period = billingPeriod(inv);

  // ── Pre-measure wrapped text so the canvas height is exact ──────────────
  const measure = document.createElement('canvas').getContext('2d')!;
  const NOTE_W = CW - 440 - 40;
  measure.font = `500 21px ${F.sans}`;
  const noteKh = wrap(measure, DOC.paymentBody[0], NOTE_W, 3);
  measure.font = `400 18px ${F.sans}`;
  const noteEn = wrap(measure, DOC.paymentBody[1], NOTE_W, 3);
  measure.font = `400 20px ${F.sans}`;
  const addrKh = input.issuer.address[0] ? wrap(measure, input.issuer.address[0], 540, 2) : [];
  measure.font = `400 17px ${F.sans}`;
  const addrEn = input.issuer.address[1] ? wrap(measure, input.issuer.address[1], 540, 1) : [];

  const rowH = (l: (typeof lines)[number]) => 30 + 38 + (l.title[1] ? 32 : 0) + (l.detail ? 34 + 26 : 0) + 16;
  const HEADER_H = Math.max(222, 124 + addrKh.length * 32 + addrEn.length * 30 + (input.issuer.phone ? 32 : 0));
  const DETAILS_H = 150;
  const PARTIES_H = 196;
  const TABLE_H = 92 + lines.reduce((s, l) => s + rowH(l), 0);
  const totalsH = 70 + (totals.paidUSD > 0 ? 70 : 0) + 150;
  // Payment block: QR (150px) beside the bank lines, then the instructions.
  const pay = input.payment;
  const bankRows = pay ? [pay.bankName, pay.accountName, pay.accountNumber].filter(Boolean).length : 0;
  const QR = 150;
  const payBlockH = pay ? Math.max(input.qrImage ? QR + 52 : 0, bankRows * 58) + 20 : 0;
  const noteH = 70 + payBlockH + noteKh.length * 32 + noteEn.length * 28 + 60;
  const BOTTOM_H = Math.max(totalsH, noteH);
  const FOOTER_H = 120;
  const H = M + HEADER_H + 28 + DETAILS_H + 40 + PARTIES_H + TABLE_H + 36 + BOTTOM_H + FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.scale(SCALE, SCALE);

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  const fitText = (s: string, x: number, y: number, font: string, color: string, maxW: number, align: CanvasTextAlign = 'left') => {
    ctx.font = font;
    text(fit(ctx, s, maxW), x, y, font, color, align);
  };
  /** Field label: Khmer primary + English underneath, top-aligned at y. */
  const label = (b: Bilingual, x: number, y: number, align: CanvasTextAlign = 'left') => {
    text(b[0], x, y + 22, `600 20px ${F.sans}`, C.body, align);
    if (b[1]) text(b[1], x, y + 50, `400 16px ${F.sans}`, C.faint, align);
  };

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.primary;
  ctx.fillRect(0, 0, W, 10);

  const L = M;
  const R = W - M;
  let y = M;

  // ── Header: issuer (left) + title & status (right) ───────────────────────
  ctx.fillStyle = C.primary;
  ctx.beginPath();
  ctx.roundRect(L, y, 76, 76, 18);
  ctx.fill();
  const initial = (input.issuer.name[1] || input.issuer.name[0]).charAt(0) || '·';
  text(initial, L + 38, y + 51, `700 34px ${F.sans}`, '#FFFFFF', 'center');
  const IX = L + 96;
  fitText(input.issuer.name[0], IX, y + 34, `700 32px ${F.sans}`, C.ink, 540);
  let hy = y + 34;
  if (input.issuer.name[1]) {
    hy += 36;
    fitText(input.issuer.name[1], IX, hy, `500 21px ${F.sans}`, C.muted, 540);
  }
  hy += 10;
  for (const ln of addrKh) {
    hy += 32;
    text(ln, IX, hy, `400 20px ${F.sans}`, C.body);
  }
  for (const ln of addrEn) {
    hy += 30;
    text(ln, IX, hy, `400 17px ${F.sans}`, C.faint);
  }
  if (input.issuer.phone) {
    hy += 32;
    text(`${DOC.phone[0]} / ${DOC.phone[1]}: ${input.issuer.phone}`, IX, hy, `400 19px ${F.sans}`, C.body);
  }

  const title = invoiceTitle(inv.kind);
  ctx.font = `700 52px ${F.sans}`;
  const titleSize = ctx.measureText(title[0]).width > 360 ? 40 : 52;
  text(title[0], R, y + 50, `700 ${titleSize}px ${F.sans}`, C.primary, 'right');
  text(title[1], R, y + 100, `600 20px ${F.sans}`, C.muted, 'right');
  const st = STATUS_LABEL[inv.status];
  const sc = STATUS_COLORS[inv.status];
  ctx.font = `700 22px ${F.sans}`;
  const w1 = ctx.measureText(st[0]).width;
  ctx.font = `700 15px ${F.sans}`;
  const w2 = ctx.measureText(st[1]).width;
  const stampW = Math.max(w1, w2) + 44;
  ctx.fillStyle = sc.bg;
  ctx.strokeStyle = sc.fg;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(R - stampW, y + 122, stampW, 70, 10);
  ctx.fill();
  ctx.stroke();
  text(st[0], R - stampW / 2, y + 154, `700 22px ${F.sans}`, sc.fg, 'center');
  text(st[1], R - stampW / 2, y + 178, `700 15px ${F.sans}`, sc.fg, 'center');
  y += HEADER_H + 28;

  // ── Document details ─────────────────────────────────────────────────────
  ctx.fillStyle = C.panel;
  ctx.beginPath();
  ctx.roundRect(L, y, CW, DETAILS_H, 20);
  ctx.fill();
  // First column is wider so long invoice numbers fit.
  const weights = [1.3, 0.9, 0.9, 0.9];
  const unit = (CW - 48) / weights.reduce((a, b) => a + b, 0);
  const cellX = weights.map((_, i) => L + 24 + weights.slice(0, i).reduce((a, b) => a + b, 0) * unit);
  const details: [Bilingual, Bilingual, boolean][] = [
    [DOC.invoiceNo, [inv.invoiceNumber, ''], true],
    [DOC.issued, [inv.issueDate, ''], true],
    [DOC.due, [inv.dueDate, ''], true],
    [DOC.period, period, false],
  ];
  details.forEach(([lb, v, mono], i) => {
    const x = cellX[i];
    const w = weights[i] * unit - 16;
    label(lb, x, y + 18);
    fitText(v[0], x, y + 106, mono ? `600 20px ${F.mono}` : `600 22px ${F.sans}`, C.ink, w);
    if (v[1]) fitText(v[1], x, y + 134, `400 17px ${F.sans}`, C.muted, w);
  });
  y += DETAILS_H + 40;

  // ── Parties ──────────────────────────────────────────────────────────────
  const half = CW / 2 - 24;
  label(DOC.billTo, L, y);
  fitText(input.tenantName[0], L, y + 98, `700 30px ${F.sans}`, C.ink, half);
  let py = y + 98;
  if (input.tenantName[1]) {
    py += 36;
    fitText(input.tenantName[1], L, py, `500 21px ${F.sans}`, C.muted, half);
  }
  if (input.tenantPhone) {
    text(`${DOC.phone[0]} / ${DOC.phone[1]}: ${input.tenantPhone}`, L, py + 34, `400 20px ${F.sans}`, C.body);
  }
  label(DOC.room, R, y, 'right');
  text(input.roomNumber, R, y + 98, `700 30px ${F.sans}`, C.ink, 'right');
  text(`${DOC.floor[0]} / ${DOC.floor[1]} ${input.floor ?? '—'}`, R, y + 132, `400 20px ${F.sans}`, C.body, 'right');
  if (!input.issuer.isProperty) {
    fitText(input.propertyName[0], R, y + 166, `400 20px ${F.sans}`, C.body, half, 'right');
  }
  y += PARTIES_H;

  // ── Line items ───────────────────────────────────────────────────────────
  const col = { no: L, desc: L + 64, qty: L + 580, unit: L + 770, amt: R };
  const descW = col.qty - col.desc - 130;
  ctx.fillStyle = C.ink;
  ctx.fillRect(L, y, CW, 3);
  label(DOC.no, col.no, y + 14);
  label(DOC.description, col.desc, y + 14);
  label(DOC.qty, col.qty, y + 14, 'right');
  label(DOC.unitPrice, col.unit, y + 14, 'right');
  label(DOC.amount, col.amt, y + 14, 'right');
  y += 84;
  ctx.fillStyle = C.ink;
  ctx.fillRect(L, y, CW, 3);
  y += 8;

  for (const ln of lines) {
    const h = rowH(ln);
    let ry = y + 30 + 14;
    text(String(ln.no), col.no, ry, `500 22px ${F.mono}`, C.muted);
    fitText(ln.title[0], col.desc, ry, `600 24px ${F.sans}`, C.ink, descW);
    text(ln.qty, col.qty, ry, `400 22px ${F.sans}`, C.ink, 'right');
    text(ln.unitPrice, col.unit, ry, `400 22px ${F.mono}`, C.body, 'right');
    text(fmtUSD(ln.amountUSD), col.amt, ry, `600 24px ${F.mono}`, C.ink, 'right');
    if (ln.title[1]) {
      ry += 32;
      fitText(ln.title[1], col.desc, ry, `400 18px ${F.sans}`, C.muted, descW);
    }
    if (ln.detail) {
      ry += 34;
      fitText(ln.detail[0], col.desc, ry, `400 18px ${F.sans}`, C.body, descW);
      if (ln.detail[1]) {
        ry += 26;
        fitText(ln.detail[1], col.desc, ry, `400 16px ${F.sans}`, C.faint, descW);
      }
    }
    y += h;
    ctx.fillStyle = C.hair;
    ctx.fillRect(L, y - 1, CW, 2);
  }
  y += 36;

  // ── Totals (right) ───────────────────────────────────────────────────────
  const TX = R - 420;
  let ty = y;
  label(DOC.subtotal, TX, ty);
  text(fmtUSD(totals.subtotalUSD), R, ty + 26, `500 24px ${F.mono}`, C.ink, 'right');
  ty += 70;
  if (totals.paidUSD > 0) {
    label(DOC.paid, TX, ty);
    text(`− ${fmtUSD(totals.paidUSD)}`, R, ty + 26, `500 24px ${F.mono}`, C.green, 'right');
    ty += 70;
  }
  ctx.fillStyle = C.primaryTint;
  ctx.beginPath();
  ctx.roundRect(TX - 20, ty, 440, 136, 20);
  ctx.fill();
  text(DOC.balance[0], TX, ty + 46, `700 24px ${F.sans}`, C.primaryDeep);
  text(DOC.balance[1], TX, ty + 80, `500 17px ${F.sans}`, C.primaryDeep);
  text(fmtUSD(totals.balanceUSD), R - 4, ty + 62, `700 40px ${F.mono}`, C.primaryDeep, 'right');
  text(`≈ ${fmtKHR(totals.balanceKHR)}`, R - 4, ty + 108, `400 20px ${F.mono}`, C.body, 'right');

  // ── Payment note (left) ──────────────────────────────────────────────────
  let ny = y;
  label(DOC.payment, L, ny);
  ny += 64;
  if (pay) {
    const top = ny + 8;
    let bx = L;
    if (input.qrImage) {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = C.hair;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(L, top, QR, QR, 14);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(input.qrImage, L + 8, top + 8, QR - 16, QR - 16);
      text(DOC.scanToPay[0], L + QR / 2, top + QR + 26, `600 16px ${F.sans}`, C.ink, 'center');
      text(DOC.scanToPay[1], L + QR / 2, top + QR + 46, `400 14px ${F.sans}`, C.faint, 'center');
      bx = L + QR + 28;
    }
    let by = top;
    const rows: [Bilingual, string, boolean][] = [
      [DOC.bank, pay.bankName, false],
      [DOC.accountName, pay.accountName, false],
      [DOC.accountNo, pay.accountNumber, true],
    ];
    for (const [lb, v, mono] of rows) {
      if (!v) continue;
      text(`${lb[0]} / ${lb[1]}`, bx, by + 18, `400 16px ${F.sans}`, C.faint);
      fitText(v, bx, by + 46, mono ? `600 22px ${F.mono}` : `600 22px ${F.sans}`, C.ink, NOTE_W - (bx - L));
      by += 58;
    }
    ny += payBlockH;
  }
  for (const ln of noteKh) {
    ny += 32;
    text(ln, L, ny, `500 21px ${F.sans}`, C.ink);
  }
  for (const ln of noteEn) {
    ny += 28;
    text(ln, L, ny, `400 18px ${F.sans}`, C.muted);
  }
  ny += 44;
  text(
    `${DOC.rate[0]} / ${DOC.rate[1]}: 1 USD = ${inv.khmerExchangeRate.toLocaleString('en-US')} ៛`,
    L,
    ny,
    `500 19px ${F.sans}`,
    C.ink,
  );
  y += BOTTOM_H;

  // ── Footer ───────────────────────────────────────────────────────────────
  ctx.fillStyle = C.hair;
  ctx.fillRect(L, y + 16, CW, 2);
  text(DOC.thanks[0], W / 2, y + 62, `500 21px ${F.sans}`, C.body, 'center');
  text(DOC.thanks[1], W / 2, y + 96, `400 17px ${F.sans}`, C.faint, 'center');

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not render the invoice image.');
  return blob;
}
