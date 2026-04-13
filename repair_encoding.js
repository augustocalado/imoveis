const fs = require('fs');
const path = require('path');

const replacements = [
    [/Ã¡/g, 'á'],
    [/Ã³/g, 'ó'],
    [/Ã£/g, 'ã'],
    [/Ã§/g, 'ç'],
    [/Ãµ/g, 'õ'],
    [/Ã /g, 'à'],
    [/Ã©/g, 'é'],
    [/Ã­/g, 'í'],
    [/Ãª/g, 'ê'],
    [/Ãº/g, 'ú'],
    [/Ã‚Â©/g, '©'],
    [/Ã¢â‚¬Â¢/g, '•'],
    [/ÃƒÂ¡/g, 'á'],
    [/ÃƒÂ³/g, 'ó'],
    [/ÃƒÂ£/g, 'ã'],
    [/ÃƒÂ§/g, 'ç'],
    [/ÃƒÂµ/g, 'õ'],
    [/ÃƒÂ /g, 'à'],
    [/ÃƒÂ©/g, 'é'],
    [/ÃƒÂ­/g, 'í'],
    [/ÃƒÂª/g, 'ê'],
    [/ÃƒÂº/g, 'ú'],
];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(process.cwd(), 'src');
walk(srcDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        replacements.forEach(([regex, replacement]) => {
            content = content.replace(regex, replacement);
        });
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Repaired: ${filePath}`);
        }
    }
});
