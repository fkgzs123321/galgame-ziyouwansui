// 《自由万岁》头像 v2：风格化沈知意插画（白裙长发·倾杯泼酒·酒红金调）
// 800x1000 超采样绘制后降采样到 400x500
const zlib = require('zlib');
const fs = require('fs');

const W = 800, H = 1000; // 超采样画布
const SS = 2;            // 最终 400x500

// ── 画布（浮点累积混合）──
const col = new Float64Array(W * H * 3);
const alp = new Float64Array(W * H);
function blend(x, y, r, g, b, a) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = y * W + x;
  const na = a + alp[i] * (1 - a);
  if (na <= 0) return;
  col[i * 3] = (r * a + col[i * 3] * alp[i] * (1 - a)) / na;
  col[i * 3 + 1] = (g * a + col[i * 3 + 1] * alp[i] * (1 - a)) / na;
  col[i * 3 + 2] = (b * a + col[i * 3 + 2] * alp[i] * (1 - a)) / na;
  alp[i] = na;
}
function fillEllipse(cx, cy, rx, ry, c, a, rot = 0) {
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const R = Math.max(rx, ry) + 2;
  for (let y = cy - R; y <= cy + R; y++)
    for (let x = cx - R; x <= cx + R; x++) {
      const dx = x - cx, dy = y - cy;
      const u = (dx * cos + dy * sin) / rx, v = (-dx * sin + dy * cos) / ry;
      if (u * u + v * v <= 1) blend(x, y, c[0], c[1], c[2], a);
    }
}
function strokeEllipse(cx, cy, rx, ry, w, c, a, rot = 0) {
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const R = Math.max(rx, ry) + w + 2;
  for (let y = cy - R; y <= cy + R; y++)
    for (let x = cx - R; x <= cx + R; x++) {
      const dx = x - cx, dy = y - cy;
      const u = (dx * cos + dy * sin) / rx, v = (-dx * sin + dy * cos) / ry;
      const d = Math.abs(Math.sqrt(u * u + v * v) - 1) * Math.min(rx, ry);
      if (d <= w / 2) blend(x, y, c[0], c[1], c[2], a);
    }
}
function fillPoly(pts, c, a) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      const cx = x + 0.5, cy = y + 0.5;
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > cy) !== (yj > cy) && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) blend(x, y, c[0], c[1], c[2], a);
    }
}
function distSeg(px0, py0, px1, py1, x, y) {
  const dx = px1 - px0, dy = py1 - py0;
  const L2 = dx * dx + dy * dy || 1;
  let t = ((x - px0) * dx + (y - py0) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (px0 + t * dx), y - (py0 + t * dy));
}
function line(x0, y0, x1, y1, w, c, a) {
  const pad = Math.ceil(w / 2) + 2;
  for (let y = Math.min(y0, y1) - pad; y <= Math.max(y0, y1) + pad; y++)
    for (let x = Math.min(x0, x1) - pad; x <= Math.max(x0, x1) + pad; x++)
      if (distSeg(x0, y0, x1, y1, x + 0.5, y + 0.5) <= w / 2) blend(x, y, c[0], c[1], c[2], a);
}
function bezier(p0, p1, p2, p3, n, w, c, a) {
  let prev = p0;
  for (let i = 1; i <= n; i++) {
    const t = i / n, mt = 1 - t;
    const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
    const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
    line(prev[0], prev[1], x, y, w, c, a);
    prev = [x, y];
  }
}

// ── 调色板 ──
const SKIN = [245, 217, 200], SKIN_SH = [224, 184, 163];
const HAIR = [38, 24, 24], HAIR_HI = [74, 46, 40];
const EYE = [48, 28, 24], BROW = [56, 34, 30];
const LIP = [181, 72, 77];
const DRESS = [247, 243, 234], DRESS_SH = [226, 218, 203];
const WINE = [138, 28, 44], GLASS = [235, 228, 214], GOLD = [201, 161, 90];
const BLUSH = [236, 150, 140];

// ── 背景 ──
for (let y = 0; y < H; y++) {
  const t = y / H;
  const r = 67 + (22 - 67) * t, g = 16 + (4 - 16) * t, b = 30 + (9 - 30) * t;
  for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; col[i] = r; col[i + 1] = g; col[i + 2] = b; }
}
// 人物背后暖金光晕
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - 400, y - 500) / 480;
    const glow = Math.max(0, 1 - d) * 0.2;
    const i = (y * W + x) * 3;
    col[i] += (201 - col[i]) * glow * 0.35; col[i + 1] += (161 - col[i + 1]) * glow * 0.35; col[i + 2] += (90 - col[i + 2]) * glow * 0.35;
  }

// ── 身体与白裙 ──
fillPoly([[300, 1000], [500, 1000], [520, 700], [460, 560], [340, 560], [280, 700]], DRESS, 1);
// 领口与锁骨阴影
bezier([345, 585], [375, 615], [425, 615], [455, 585], 40, 5, DRESS_SH, 0.9);
// 裙摆褶皱
line(380, 700, 370, 1000, 4, DRESS_SH, 0.6);
line(470, 700, 480, 1000, 4, DRESS_SH, 0.6);
// ── 脖颈 ──
fillPoly([[372, 490], [428, 490], [432, 575], [368, 575]], SKIN, 1);
for (let y = 490; y < 530; y++) for (let x = 372; x < 428; x++) blend(x, y, SKIN_SH[0], SKIN_SH[1], SKIN_SH[2], 0.35);
// ── 后层头发（在脸后）──
fillPoly([[268, 420], [255, 620], [270, 800], [320, 880], [360, 820], [330, 620], [340, 380]], HAIR, 1);
fillPoly([[532, 420], [548, 640], [535, 830], [480, 900], [470, 820], [505, 620], [492, 380]], HAIR, 1);
fillEllipse(400, 330, 155, 130, HAIR, 1);
// 发丝高光
bezier([300, 300], [262, 480], [272, 680], [300, 800], 50, 6, HAIR_HI, 0.7);
bezier([500, 300], [542, 480], [532, 690], [505, 830], 50, 6, HAIR_HI, 0.7);
// ── 脸 ──
fillEllipse(400, 400, 90, 108, SKIN, 1);
// 脸侧阴影（发际）
fillEllipse(312, 400, 24, 96, SKIN_SH, 0.4);
fillEllipse(488, 400, 24, 96, SKIN_SH, 0.4);
// 下巴阴影
fillEllipse(400, 488, 40, 16, SKIN_SH, 0.3);
// ── 前发刘海（斜扫）──
fillPoly([[262, 400], [268, 295], [340, 232], [470, 222], [545, 295], [540, 400], [522, 315], [468, 288], [372, 300], [296, 362]], HAIR, 1);
bezier([275, 372], [310, 306], [430, 276], [534, 340], 50, 9, HAIR, 1);
bezier([292, 352], [330, 300], [420, 282], [516, 322], 50, 3, HAIR_HI, 0.6);
// 刘海弧线高光
bezier([285, 340], [340, 290], [440, 275], [525, 320], 50, 4, HAIR_HI, 0.5);
// ── 眉眼 ──
bezier([330, 385], [350, 372], [382, 372], [396, 384], 30, 5, BROW, 0.9);
bezier([408, 384], [424, 372], [456, 372], [474, 385], 30, 5, BROW, 0.9);
// 眼（杏眼，微上挑）
fillEllipse(362, 408, 21, 14, EYE, 1, -0.12);
fillEllipse(444, 408, 21, 14, EYE, 1, 0.12);
// 眼白高光

// 下睫阴影
bezier([346, 420], [360, 426], [376, 426], [384, 422], 20, 3, SKIN_SH, 0.7);
bezier([420, 422], [430, 426], [446, 426], [460, 420], 20, 3, SKIN_SH, 0.7);
// 上睫加粗
bezier([344, 404], [356, 394], [374, 394], [382, 400], 20, 5, [20, 12, 12], 1);
bezier([422, 400], [432, 394], [450, 394], [462, 404], 20, 5, [20, 12, 12], 1);
blend(356, 402, 255, 255, 255, 0.95); blend(351, 411, 200, 200, 200, 0.6);
blend(438, 402, 255, 255, 255, 0.95); blend(451, 411, 200, 200, 200, 0.6);
// ── 鼻与唇 ──
line(400, 428, 398, 448, 3, SKIN_SH, 0.8);
fillEllipse(400, 468, 15, 8, LIP, 1);
fillEllipse(400, 462, 11, 5, [201, 90, 94], 1);
// ── 腮红 ──
fillEllipse(334, 448, 17, 10, BLUSH, 0.35);
fillEllipse(468, 448, 17, 10, BLUSH, 0.35);
fillEllipse(452, 252, 9, 9, GOLD, 0.95);
fillEllipse(452, 252, 4, 4, [245, 220, 170], 1);
// ── 耳饰 ──
fillEllipse(309, 470, 7, 7, GOLD, 1);
fillEllipse(491, 470, 7, 7, GOLD, 1);
// 项链
bezier([370, 570], [390, 592], [412, 592], [432, 570], 30, 3.5, GOLD, 0.9);

// ── 右臂举杯 ──
line(508, 720, 570, 560, 26, SKIN, 1);
line(570, 560, 604, 430, 24, SKIN, 1);
fillEllipse(606, 418, 24, 20, SKIN, 1); // 手
// 肩部衔接
fillEllipse(514, 706, 22, 22, DRESS, 1);

// ── 手中的酒杯（更大倾角，正在泼出）──
const th = (-38 * Math.PI) / 180;
const cos = Math.cos(th), sin = Math.sin(th);
const GCX = 610, GCY = 385;
const R = (x, y) => [GCX + x * cos - y * sin, GCY + x * sin + y * cos];
const A = R(-52, -66), Bp = R(52, -66), C = R(0, 18), D2 = R(0, 70), E0 = R(-28, 76), E1 = R(28, 76);
fillPoly([A, Bp, C], WINE, 0.95);
line(A[0], A[1], C[0], C[1], 6, GLASS, 0.9);
line(Bp[0], Bp[1], C[0], C[1], 6, GLASS, 0.9);
line(A[0], A[1], Bp[0], Bp[1], 4, GOLD, 0.95);
line(C[0], C[1], D2[0], D2[1], 5, GLASS, 0.9);
line(E0[0], E0[1], E1[0], E1[1], 5, GLASS, 0.9);
// 泼出的酒弧
const N = 22;
for (let i = 0; i < N; i++) {
  const t = i / (N - 1);
  const bx = Bp[0] + 8, by = Bp[1] - 4;
  const x = bx + t * 120 - t * t * 30;
  const y = by - t * 42 + t * t * 150;
  fillEllipse(x, y, 5.5 - t * 2.6, 5.5 - t * 2.6, WINE, 0.85);
}
const drops = [[756, 300, 4], [772, 340, 3], [744, 268, 2.6], [786, 390, 3.4]];
for (const [x, y, r] of drops) fillEllipse(x, y, r, r, WINE, 0.8);

// ── 金色星点与内框 ──
const stars = [[120, 180], [660, 620], [130, 700], [96, 420], [688, 150]];
for (const [sx, sy] of stars) {
  line(sx - 10, sy, sx + 10, sy, 2.2, GOLD, 0.75);
  line(sx, sy - 10, sx, sy + 10, 2.2, GOLD, 0.75);
  fillEllipse(sx, sy, 2.2, 2.2, GOLD, 0.9);
}
const fr = 20;
for (let x = fr; x < W - fr; x++) { blend(x, fr, GOLD[0], GOLD[1], GOLD[2], 0.8); blend(x, H - fr - 1, GOLD[0], GOLD[1], GOLD[2], 0.8); }
for (let y = fr; y < H - fr; y++) { blend(fr, y, GOLD[0], GOLD[1], GOLD[2], 0.8); blend(W - fr - 1, y, GOLD[0], GOLD[1], GOLD[2], 0.8); }

// ── 暗角与颗粒，降采样输出 ──
let seed = 20260620;
const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const OW = W / SS, OH = H / SS;
const out = Buffer.alloc(OH * (1 + OW * 4));
for (let oy = 0; oy < OH; oy++) {
  out[oy * (1 + OW * 4)] = 0;
  for (let ox = 0; ox < OW; ox++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 0; sy < SS; sy++)
      for (let sx = 0; sx < SS; sx++) {
        const x = ox * SS + sx, y = oy * SS + sy;
        const i = (y * W + x) * 3, a = alp[y * W + x];
        let cr = col[i] * (1 - a) + col[i] * a, cg = col[i + 1], cb = col[i + 2];
        const dv = Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2);
        const vig = 1 - Math.max(0, dv - 0.55) * 0.9;
        cr = col[i] * vig; cg = col[i + 1] * vig; cb = col[i + 2] * vig;
        r += cr; g += cg; b += cb;
      }
    r /= SS * SS; g /= SS * SS; b /= SS * SS;
    const n = (rand() - 0.5) * 8;
    const o = oy * (1 + OW * 4) + 1 + ox * 4;
    out[o] = Math.max(0, Math.min(255, (r + n) | 0));
    out[o + 1] = Math.max(0, Math.min(255, (g + n) | 0));
    out[o + 2] = Math.max(0, Math.min(255, (b + n) | 0));
    out[o + 3] = 255;
  }
}

function crc32(data) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c; }
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
ihdr.writeUInt32BE(OW, 0); ihdr.writeUInt32BE(OH, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(out, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
fs.writeFileSync('src/自由万岁/avatar.png', png);
console.log('沈知意插画头像已生成:', (png.length / 1024).toFixed(1) + ' KB', OW + 'x' + OH);
