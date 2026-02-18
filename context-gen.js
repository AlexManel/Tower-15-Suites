const fs = require('fs');
const path = require('path');

// Αρχεία και φάκελοι που αγνοούμε
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', '.DS_Store', '.env', 'context-gen.js'];
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (!IGNORE_FILES.includes(file) && ALLOWED_EXTENSIONS.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(__dirname);
let output = '';

allFiles.forEach(file => {
  const relativePath = path.relative(__dirname, file);
  const content = fs.readFileSync(file, 'utf8');
  output += `--- START OF FILE ${relativePath} ---\n\n`;
  output += content;
  output += `\n\n`;
});

// Αποθήκευση σε αρχείο output.txt
fs.writeFileSync('full_codebase.txt', output);
console.log('✅ Ο κώδικας αποθηκεύτηκε στο full_codebase.txt. Μπορείς να τον ανεβάσεις ή να τον κάνεις copy-paste στο chat.');
