// 《自由万岁》头像生成：酒红渐变 + 倾杯泼酒图案（纯像素绘制，无文字）
const zlib = require('zlib');
const fs = require('fs');

const W = 400, H = 500;
const buf = Buffer.alloc(H * (1 + W * 4));

// 逐像素画布
const px = new Float64Array(W * H * 3); // 累积 premultiplied-ish（上层混合）
const alpha = new Float64Array(W * H);  // 覆盖度 0~1
const color = new Float64Array(W * H * 3);

function blend(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = y * W + x;
  const na = a + alpha[i] * (1 - a);
  if (na <= 0) return;
  color[i * 3] = (r * a + color[i * 3] * alpha[i] * (1 - a)) / na;
  color[i * 3 + 1] = (g * a + color[i * 3 + 1] * alpha[i] * (1 - a)) / na;
  color[i * 3 + 2] = (b * a + color[i * 3 + 2] * alpha[i] * (1 - a)) / na;
  alpha[i] = na;
}
function fillRect(x0, y0, x1, y1, c, a) {
  for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1 | 0); y++)
    for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1 | 0); x++) blend(x, y, c[0], c[1], c[2], a);
}
function distSeg(px0, py0, px1, py1, x, y) {
  const dx = px1 - px0, dy = py1 - py0;
  const L2 = dx * dx + dy * dy || 1;
  let t = ((x - px0) * dx + (y - py0) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  const cx = px0 + t * dx, cy = py0 + t * dy;
  return Math.hypot(x - cx, y - cy);
}
function line(x0, y0, x1, y1, w, c, a) {
  const pad = Math.ceil(w / 2) + 2;
  for (let y = Math.min(y0, y1) - pad; y <= Math.max(y0, y1) + pad; y++)
    for (let x = Math.min(x0, x1) - pad; x <= Math.max(x0, x1) + pad; x++) {
      const d = distSeg(x0, y0, x1, y1, x + 0.5, y + 0.5);
      if (d <= w / 2) blend(x | 0, y | 0, c[0], c[1], c[2], a);
    }
}
function tri(p0, p1, p2, c, a) {
  const minY = Math.floor(Math.min(p0[1], p1[1], p2[1])), maxY = Math.ceil(Math.max(p0[1], p1[1], p2[1]));
  const minX = Math.floor(Math.min(p0[0], p1[0], p2[0])), maxX = Math.ceil(Math.max(p0[0], p1[0], p2[0]));
  const e = (ax, ay, bx, by, x, y) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const cx = x + 0.5, cy = y + 0.5;
      const e0 = e(p0[0], p0[1], p1[0], p1[1], cx, cy);
      const e1 = e(p1[0], p1[1], p2[0], p2[1], cx, cy);
      const e2 = e(p2[0], p2[1], p0[0], p0[1], cx, cy);
      if ((e0 >= 0 && e1 >= 0 && e2 >= 0) || (e0 <= 0 && e1 <= 0 && e2 <= 0))
        blend(x, y, c[0], c[1], c[2], a);
    }
}
function disc(cx, cy, r, c, a) {
  for (let y = cy - r - 1; y <= cy + r + 1; y++)
    for (let x = cx - r - 1; x <= cx + r + 1; x++)
      if (Math.hypot(x - cx, y - cy) <= r) blend(x | 0, y | 0, c[0], c[1], c[2], a);
}

// 背景：酒红→近黑垂直渐变
for (let y = 0; y < H; y++) {
  const t = y / H;
  const r = 67 + (22 - 67) * t, g = 16 + (4 - 16) * t, b = 30 + (9 - 30) * t;
  for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; px[i] = r; px[i + 1] = g; px[i + 2] = b; }
}
// 背后暖金光晕（衬托杯体）
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - 215, y - 235) / 230;
    const glow = Math.max(0, 1 - d) * 0.22;
    const i = (y * W + x) * 3;
    px[i] += (201 - px[i]) * glow * 0.35;
    px[i + 1] += (161 - px[i + 1]) * glow * 0.35;
    px[i + 2] += (90 - px[i + 2]) * glow * 0.35;
  }

// 倾杯（旋转 -25°）
const th = (-25 * Math.PI) / 180;
const cos = Math.cos(th), sin = Math.sin(th);
const CX = 205, CY = 250;
const R = (x, y) => [CX + x * cos - y * sin, CY + x * sin + y * cos];
const glass = [235, 228, 214];   // 玻璃淡白
const gold = [201, 161, 90];     // 描金
const wine = [138, 28, 44];      // 酒液

// V 形杯：上沿两点、杯底一点
const A = R(-78, -100), B = R(78, -100), C = R(0, 25);
tri(A, B, C, wine, 0.9);                              // 杯中酒
line(A[0], A[1], C[0], C[1], 7, glass, 0.85);         // 杯壁左
line(B[0], B[1], C[0], C[1], 7, glass, 0.85);         // 杯壁右
line(A[0], A[1], B[0], B[1], 5, gold, 0.95);          // 金色杯沿
// 杯脚与底座
const D = R(0, 25), E = R(0, 105), F0 = R(-42, 112), F1 = R(42, 112);
line(D[0], D[1], E[0], E[1], 6, glass, 0.85);
line(F0[0], F0[1], F1[0], F1[1], 6, glass, 0.85);

// 泼出的酒：沿抛物线的酒滴，从上沿 B 飞出
const N = 26;
for (let i = 0; i < N; i++) {
  const t = i / (N - 1);
  const bx = B[0] + 18, by = B[1] - 6;
  const x = bx + t * 150 - t * t * 40;
  const y = by - t * 55 + t * t * 205;
  disc(x, y, 6.5 - t * 3.2, wine, 0.85);
}
// 飞溅小酒滴
const drops = [[318, 128, 3], [338, 152, 2.4], [300, 100, 2.2], [352, 186, 3.4], [272, 78, 2], [366, 226, 2.6], [344, 92, 1.8]];
for (const [x, y, r] of drops) disc(x, y, r, wine, 0.8);

// 背景金色星点
const stars = [[70, 92], [330, 322], [92, 372], [58, 232], [344, 398]];
for (const [sx, sy] of stars) {
  line(sx - 7, sy, sx + 7, sy, 1.6, gold, 0.75);
  line(sx, sy - 7, sx, sy + 7, 1.6, gold, 0.75);
  disc(sx, sy, 1.6, gold, 0.9);
}

// 描金内框
const fr = 10;
for (let x = fr; x < W - fr; x++) { blend(x | 0, fr, gold[0], gold[1], gold[2], 0.8); blend(x | 0, H - fr - 1, gold[0], gold[1], gold[2], 0.8); }
for (let y = fr; y < H - fr; y++) { blend(fr, y | 0, gold[0], gold[1], gold[2], 0.8); blend(W - fr - 1, y | 0, gold[0], gold[1], gold[2], 0.8); }

// 暗角 + 颗粒，合成像素
let seed = 20260620;
const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const out = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  out[y * (1 + W * 4)] = 0; // filter none
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    let r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
    const a = alpha[i];
    // 暗角
    const dv = Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2);
    const vig = 1 - Math.max(0, dv - 0.55) * 0.9;
    r = r * (1 - a) + color[i * 3] * a; g = g * (1 - a) + color[i * 3 + 1] * a; b = b * (1 - a) + color[i * 3 + 2] * a;
    r *= vig; g *= vig; b *= vig;
    // 颗粒
    const n = (rand() - 0.5) * 10;
    r += n; g += n; b += n;
    const o = y * (1 + W * 4) + 1 + x * 4;
    out[o] = Math.max(0, Math.min(255, r | 0));
    out[o + 1] = Math.max(0, Math.min(255, g | 0));
    out[o + 2] = Math.max(0, Math.min(255, b | 0));
    out[o + 3] = 255;
  }
}

// PNG 编码
function crc32(data) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (const byte of data) c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(out, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
fs.writeFileSync('src/自由万岁/avatar.png', png);
console.log('avatar.png 已生成:', (png.length / 1024).toFixed(1) + ' KB', W + 'x' + H);
