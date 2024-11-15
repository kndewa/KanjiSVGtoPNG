const fs = require('fs'); // Ensure this line is present
const path = require('path');
const { createCanvas } = require('canvas');
const { XMLParser } = require('fast-xml-parser');
const { Canvg } = require('canvg');
const { DOMParser } = require('@xmldom/xmldom'); // Import DOMParser
const yargs = require('yargs');
const pLimit = require('p-limit');

const argv = yargs.argv;

const inputDir = argv.input || 'C:/Users/kndew/Documents/Code/KanjiSVGtoPNG/svgsJa';
const outputDir = argv.output || 'C:/Users/kndew/Documents/Code/KanjiSVGtoPNG/outputPNG_grey';;
const concurrency = argv.concurrency || 5;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to convert decimal Unicode to kanji character
function unicodeDecimalToChar(decimal) {
  return String.fromCodePoint(parseInt(decimal, 10));
}

function processSvgFile(svgFilePath) {
  return new Promise(async (resolve) => {
      try {
          const svgContent = fs.readFileSync(svgFilePath, 'utf8');
          const options = {
              ignoreAttributes: false,
              attributeNamePrefix: '',
          };
          const xmlParser = new XMLParser(options);
          const svgJson = xmlParser.parse(svgContent);

          // Extract stroke paths
          const paths = [];

          if (svgJson.svg && svgJson.svg.path) {
              let svgPaths = svgJson.svg.path;
              if (!Array.isArray(svgPaths)) {
                  svgPaths = [svgPaths];
              }

              // Adjust the regular expression to accommodate the path IDs in your SVG
              svgPaths.forEach((element) => {
                  const id = element.id;
                  if (id && /^z\d+(-\d+)?d\d+$/.test(id) && element.d && element.d.trim() !== '') {
                      // This path is a stroke
                      paths.push(element.d);
                  }
              });
          } else {
              console.warn(`No paths found in ${svgFilePath}`);
              return resolve();
          }

          const numStrokes = paths.length;
          console.log(`Processing ${svgFilePath}: ${numStrokes} strokes`);

          if (numStrokes === 0) {
              console.warn(`No strokes found in ${svgFilePath}`);
              return resolve();
          }

          // Determine canvas dimensions
          const strokeWidth = 1024;
          const canvasHeight = 1024;
          const canvasWidth = strokeWidth * numStrokes;

          // Create the main canvas
          const canvasInstance = createCanvas(canvasWidth, canvasHeight);
          const ctx = canvasInstance.getContext('2d');

          // Background color
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Build the full kanji SVG in light grey
          let fullKanjiSvgParts = [
              `<svg xmlns="http://www.w3.org/2000/svg" width="${strokeWidth}" height="${canvasHeight}" viewBox="0 0 ${strokeWidth} ${canvasHeight}">`,
          ];

          paths.forEach((pathData) => {
              if (pathData) {
                  fullKanjiSvgParts.push(
                      `<path d="${pathData}" fill="#CCCCCC" />` // Light grey color
                  );
              }
          });

          fullKanjiSvgParts.push('</svg>');
          const fullKanjiSvgContent = fullKanjiSvgParts.join('');

          // Render the full kanji once and store it
          const fullKanjiCanvas = createCanvas(strokeWidth, canvasHeight);
          const fullKanjiCtx = fullKanjiCanvas.getContext('2d');
          const fullKanjiCanvgInstance = await Canvg.fromString(fullKanjiCtx, fullKanjiSvgContent, {
              DOMParser,
          });
          await fullKanjiCanvgInstance.render();

          // Create a cumulative canvas for progressive strokes
          const cumulativeCanvas = createCanvas(strokeWidth, canvasHeight);
          const cumulativeCtx = cumulativeCanvas.getContext('2d');

          // Draw the light grey full kanji onto the cumulative canvas once
          cumulativeCtx.drawImage(fullKanjiCanvas, 0, 0);

          // Render strokes sequentially
          for (let i = 0; i < numStrokes; i++) {
              const offsetX = i * strokeWidth;

              // Draw background for current segment
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(offsetX, 0, strokeWidth, canvasHeight);

              // Get current path data
              const pathData = paths[i];
              if (pathData) {
                  // Build SVG content for the current stroke in black
                  const svgContent = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="${strokeWidth}" height="${canvasHeight}" viewBox="0 0 ${strokeWidth} ${canvasHeight}">
                          <path d="${pathData}" fill="#000000" />
                      </svg>
                  `;

                  // Render the current stroke onto the cumulative canvas without clearing it
                  const canvgInstance = await Canvg.fromString(cumulativeCtx, svgContent, {
                      DOMParser,
                      ignoreClear: true, // Prevent canvg from clearing the canvas
                      ignoreDimensions: true,
                  });
                  await canvgInstance.render();
              }

              // Draw the cumulative canvas onto the main canvas
              ctx.drawImage(cumulativeCanvas, offsetX, 0);
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
