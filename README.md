# KanjiSVGtoPNG

This project provides a Node.js script that converts SVG files representing Kanji characters into PNG images. The script processes each SVG file, extracts the stroke paths, and generates a sequence of images showing the progressive drawing of each stroke. The output is a PNG file for each Kanji character, illustrating the stroke order.

## Features

- **Batch Processing**: Process multiple SVG files in a specified directory.
- **Progressive Stroke Rendering**: Generates images showing each stroke added sequentially.
- **Customizable Output**: Specify input and output directories and control concurrency.
- **Unicode Support**: Converts Unicode decimal values from filenames to Kanji characters.

## Prerequisites

- **Node.js**: Version 12 or higher is recommended.
- **npm**: Comes bundled with Node.js.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/KanjiSVGtoPNG.git
   cd KanjiSVGtoPNG
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This will install the following packages:

   - [`canvas`](https://www.npmjs.com/package/canvas)
   - [`fast-xml-parser`](https://www.npmjs.com/package/fast-xml-parser)
   - [`canvg`](https://www.npmjs.com/package/canvg)
   - [`@xmldom/xmldom`](https://www.npmjs.com/package/@xmldom/xmldom)
   - [`yargs`](https://www.npmjs.com/package/yargs)
   - [`p-limit`](https://www.npmjs.com/package/p-limit)

## Usage

### Command-Line Interface

Run the script using Node.js:

```bash
node conversion.js
```

### Options

The script accepts the following command-line arguments:

- `--input` or `-i`: Path to the input directory containing SVG files.
- `--output` or `-o`: Path to the output directory where PNG files will be saved.
- `--concurrency` or `-c`: Number of files to process concurrently.

### Default Values

- **Input Directory**: `C:/Users/kndew/Documents/Kanji Book/animCJK/testSVG`
- **Output Directory**: `C:/Users/kndew/Documents/Kanji Book/animCJK/outputPNG`
- **Concurrency**: `5`

### Examples

#### Example 1: Using Default Settings

```bash
node conversion.js
```

#### Example 2: Specifying Input and Output Directories

```bash
node conversion.js --input "path/to/your/svg/files" --output "path/to/save/png/files"
```

#### Example 3: Adjusting Concurrency

```bash
node conversion.js --concurrency 10
```

## Script Overview

The script performs the following steps:

1. **Reads SVG Files**: Scans the input directory for SVG files.
2. **Parses SVG Content**: Uses `fast-xml-parser` to parse the SVG files and extract stroke paths.
3. **Generates PNG Images**: Renders the strokes sequentially onto a canvas using `canvg` and `canvas`.
4. **Handles Unicode Filenames**: Converts filenames from Unicode decimal values to Kanji characters.
5. **Saves Output**: Writes the final PNG images to the output directory.

## Directory Structure

```
KanjiSVGtoPNG/
├── conversion.js      # Main script
├── package.json       # npm package file
├── package-lock.json  # npm lock file
├── README.md          # This README file
├── input/             # Default input directory (optional)
└── output/            # Default output directory (optional)
```

## Dependencies Installation Notes

### Installing `canvas` on Windows

The `canvas` package requires some additional setup on Windows:

1. **Install Windows Build Tools**

   ```bash
   npm install --global windows-build-tools
   ```

2. **Install `canvas`**

   ```bash
   npm install canvas
   ```

### Troubleshooting `canvg` Dependencies

If you encounter errors related to `canvg`, ensure that all dependencies are installed correctly:

```bash
npm install canvg @xmldom/xmldom
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -am "Add new feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- **[AnimCJK Project](https://github.com/parsimonhi/animCJK)**: The SVG files and inspiration for this project come from the AnimCJK project.
- **[Node.js](https://nodejs.org/)**: JavaScript runtime environment.
- **[canvas](https://github.com/Automattic/node-canvas)**: Canvas implementation for Node.js.
- **[canvg](https://github.com/canvg/canvg)**: SVG rendering on Canvas.
- **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)**: Fast XML parsing.
- **[@xmldom/xmldom](https://github.com/xmldom/xmldom)**: XML DOM parser for Node.js.

## Contact

For any questions or suggestions, please open an issue or contact the repository owner.

## Example Output

The script generates PNG images where each Kanji character is displayed with its strokes added sequentially, demonstrating the correct stroke order.

---

**Note**: Ensure that the input SVG files are correctly formatted and named using their Unicode decimal values (e.g., `36817.svg` for the character with Unicode code point U+8FED).

## Troubleshooting

### Common Issues

- **Missing Dependencies**: Ensure all npm packages are installed.
- **Permission Errors**: Run the script with appropriate permissions, especially when accessing files in protected directories.
- **Incorrect File Paths**: Use absolute paths or ensure relative paths are correct.

### Getting Help

- **Check the Console Output**: Error messages are logged to the console.
- **Open an Issue**: If problems persist, open an issue on the GitHub repository.

## Version History

- **v1.0.0**: Initial release with SVG to PNG conversion and stroke rendering.

## Known Issues

- **Conversion Failure for 38859.svg**: The SVG file `38859.svg` does not convert successfully due to an inherent error within the file. Attempts to process this file result in an error. 

