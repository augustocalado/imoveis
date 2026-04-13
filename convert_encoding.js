const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(process.cwd(), 'src');
walk(srcDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        const content = fs.readFileSync(filePath);
        // Remove BOM if exists
        let str = content.toString('utf8');
        if (str.charCodeAt(0) === 0xFEFF) {
            str = str.slice(1);
        }
        // Write as UTF8 without BOM
        fs.writeFileSync(filePath, str, 'utf8');
        console.log(`Converted: ${filePath}`);
    }
});
