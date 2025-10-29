const fs = require('fs');
const path = require('path');
const png2icons = require('png2icons');

// Simple SVG to PNG converter (without sharp)
async function svgToPng() {
  console.log('Converting SVG to PNG...');

  // For this to work in Node.js without browser APIs, we'll use a simpler approach
  // We'll create PNG files using the Canvas API or just use pre-rendered sizes

  // Since we don't have sharp installed successfully, let's try a different approach
  // We'll create the icon using the electron-icon-builder approach or manually

  const svgPath = path.join(__dirname, '../public/icon.svg');
  const pngPath = path.join(__dirname, '../public/icon.png');

  // Read SVG
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  console.log('Note: For full conversion, please install ImageMagick or use an online converter.');
  console.log('Creating placeholder PNG...');

  // We'll need to use a different method. Let me check if sharp is available
  try {
    const sharp = require('sharp');

    // Convert SVG to PNG at 1024x1024
    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(pngPath);

    console.log('✓ Created icon.png (1024x1024)');

    // Now create .icns and .ico files
    const pngBuffer = fs.readFileSync(pngPath);

    // Create .icns for macOS
    const icnsPath = path.join(__dirname, '../public/icon.icns');
    const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BILINEAR, 0);
    fs.writeFileSync(icnsPath, icnsBuffer);
    console.log('✓ Created icon.icns');

    // Create .ico for Windows
    const icoPath = path.join(__dirname, '../public/icon.ico');
    const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BILINEAR, 0, false);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✓ Created icon.ico');

    console.log('\nAll icons created successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nPlease install sharp: npm install sharp');
  }
}

svgToPng().catch(console.error);
