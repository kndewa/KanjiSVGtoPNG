// testPath2D.js
const canvas = require('canvas');

const pathData = 'M10 10 h 80 v 80 h -80 Z';
const path = new canvas.Path2D(pathData);

console.log('Path2D is working:', path !== undefined);
