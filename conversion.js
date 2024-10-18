const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { XMLParser } = require('fast-xml-parser');
const { Canvg } = require('canvg');
const { DOMParser } = require('@xmldom/xmldom'); // Import DOMParser
const yargs = require('yargs');
const pLimit = require('p-limit');

const argv = yargs.argv;

const inputDir = argv.input || 'C:/Users/kndew/Documents/Kanji Book/KanjiSVGtoPNG/svgsJa';
const outputDir = argv.output || 'C:/Users/kndew/Documents/Kanji Book/KanjiSVGtoPNG/outputPNG';
const concurrency = argv.concurrency || 5;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to convert decimal Unicode to kanji character
function unicodeDecimalToChar(decimal) {
  return String.fromCodePoint(parseInt(decimal, 10));
}

// Function to process a single SVG file
function processSvgFile(svgFilePath) {
  return new Promise(async (resolve) => {
    try {
      const svgContent = fs.readFileSync(svgFilePath, 'utf8');
      const options = {
        ignoreAttributes: false,
        attributeNamePrefix: '',
      }
      const xmlParser = new XMLParser(options);
      const svgJson = xmlParser.parse(svgContent);

      // Extract stroke paths
      const paths = [];

      if (svgJson.svg && svgJson.svg.path) {
        let svgPaths = svgJson.svg.path;
        if (!Array.isArray(svgPaths)) {
          svgPaths = [svgPaths];
        }

        svgPaths.forEach((element) => {
          if (element.d) {
            paths.push(element.d);
          }
        });
      } else {
        console.warn(`No paths found in ${svgFilePath}`);
        return resolve();
      }

      const numStrokes = paths.length/2;
      if (numStrokes === 0) {
        console.warn(`No strokes found in ${svgFilePath}`);
        return resolve();
      }

      // Determine canvas dimensions
      const strokeWidth = 1024;
      const canvasHeight = 1024;
      const canvasWidth = strokeWidth * numStrokes;

      // Create a canvas
      const canvasInstance = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvasInstance.getContext('2d');

      // Background color
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Render strokes sequentially
      for (let i = 0; i < numStrokes; i++) {
        const offsetX = i * strokeWidth;

        // Draw background for current segment
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(offsetX, 0, strokeWidth, canvasHeight);

        // Create a new canvas for canvg
        const strokeCanvas = createCanvas(strokeWidth, canvasHeight);
        const strokeCtx = strokeCanvas.getContext('2d');

        // Build SVG content for strokes up to the current one
        let svgParts = [
          `<svg xmlns="http://www.w3.org/2000/svg" width="${strokeWidth}" height="${canvasHeight}">`,
        ];

        for (let j = 0; j <= i; j++) {
          const pathData = paths[j];
          if (pathData) {
            svgParts.push(
              `<path d="${pathData}" fill="#000000" />`
            );
          }
        }

        svgParts.push('</svg>');
        const strokeSvgContent = svgParts.join('');

        // Use canvg to render the SVG onto the stroke canvas
        const canvgInstance = await Canvg.fromString(strokeCtx, strokeSvgContent, {
          DOMParser, // Provide DOMParser via options
        });
        await canvgInstance.render();

        // Draw the stroke canvas onto the main canvas
        ctx.drawImage(strokeCanvas, offsetX, 0);
      }

      // Get the kanji character from the filename
      const filename = path.basename(svgFilePath, '.svg');
      const kanjiChar = unicodeDecimalToChar(filename);

      if (!kanjiChar || kanjiChar === '') {
        console.warn(`Invalid Unicode for file ${svgFilePath}`);
        return resolve();
      }

      // Save the canvas as a PNG file
      const outputFilePath = path.join(outputDir, `${kanjiChar}.png`);
      const out = fs.createWriteStream(outputFilePath);
      const stream = canvasInstance.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        console.log(`Generated ${outputFilePath}`);
        resolve();
      });
    } catch (error) {
      console.error(`Error processing ${svgFilePath}:`, error);
      resolve();
    }
  });
}


// Function to process all SVG files in the input directory
async function processAllSvgFiles() {
  const files = fs.readdirSync(inputDir).filter((file) => file.endsWith('.svg'));
  const limit = pLimit(concurrency);
  const promises = files.map((file) =>
    limit(() => processSvgFile(path.join(inputDir, file)))
  );
  await Promise.all(promises);
}

// Run the script
processAllSvgFiles();
