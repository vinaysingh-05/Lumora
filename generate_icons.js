// Run: node generate_icons.js
const fs = require('fs');
const path = require('path');

// 1x1 base64 transparent PNG fallback
const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const dir = path.join(__dirname, 'assets', 'icons');

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  fs.writeFileSync(path.join(dir, `icon${size}.png`), minimalPng);
});
console.log('Generated extension icons in assets/icons/');