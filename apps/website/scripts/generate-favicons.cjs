const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicons() {
  const svgPath = path.join(__dirname, '../public/logo/logo-schlechta-bildmarke.svg');
  const publicPath = path.join(__dirname, '../public');

  console.log('Generating favicons from logo...');

  try {
    // Read SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate PNG versions
    const sizes = [16, 32, 192, 512];

    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicPath, `favicon-${size}x${size}.png`));
      console.log(`✓ Created favicon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicPath, 'apple-touch-icon.png'));
    console.log('✓ Created apple-touch-icon.png');

    // Copy SVG as favicon
    fs.copyFileSync(svgPath, path.join(publicPath, 'favicon.svg'));
    console.log('✓ Created favicon.svg');

    console.log('\nAll favicons created successfully!');
    console.log('\nNext steps:');
    console.log('1. Add favicon links to app/layout.tsx');
    console.log('2. Update metadata with logo');

  } catch (error) {
    console.error('Error generating favicons:', error.message);
  }
}

generateFavicons();
