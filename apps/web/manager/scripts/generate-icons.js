// Simple script to generate PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG icon template
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000" rx="64"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>
</svg>`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Save SVG files (browsers can use SVG as icons)
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
console.log('✅ Created icon.svg');

// For now, we'll use SVG. To generate PNG, you'd need a library like sharp or canvas
console.log('\n📝 Note: For production, generate actual PNG files using:');
console.log('   npm install sharp');
console.log('   Then use sharp to convert SVG to PNG at 192x192 and 512x512');
