// Decode the TDZ stack trace lines against the sourcemap to find the
// original source location for each frame. Usage:
//   node decode_tdz.js
// Reads dist/assets/index-DqyhDRg5.js.map and outputs the original
// (file, line, col, name) for the user-reported stack.
const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

const MAP_PATH = path.join(__dirname, 'dist/assets/index-DqyhDRg5.js.map');
const FRAMES = [
  { fn: 'Nv', line: 42, col: 62142 },
  { fn: 'Pu', line: 38, col: 17027 },
  { fn: 'Ay', line: 40, col: 44058 },
  { fn: 'By', line: 40, col: 39790 },
  { fn: 'cv', line: 40, col: 39718 },
  { fn: 'Cd', line: 40, col: 39570 },
  { fn: 'nu', line: 40, col: 35934 },
  { fn: 'Fy', line: 40, col: 34883 },
  { fn: 'W',  line: 25, col: 1621 },
];

(async () => {
  const raw = fs.readFileSync(MAP_PATH, 'utf8');
  const map = JSON.parse(raw);
  await SourceMapConsumer.with(map, null, (consumer) => {
    for (const f of FRAMES) {
      const orig = consumer.originalPositionFor({ line: f.line, column: f.col });
      console.log(`${f.fn.padEnd(4)} L${f.line}:${f.col}  →  ${orig.source || '?'} L${orig.line}:${orig.column}  name=${orig.name || '?'}`);
    }
  });
})().catch(e => { console.error(e); process.exit(1); });
