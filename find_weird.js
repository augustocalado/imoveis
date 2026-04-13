const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');
const files = [
    path.join(srcDir, 'app/admin/page.tsx'),
    path.join(srcDir, 'app/page.tsx')
];

files.forEach(f => {
    const buffer = fs.readFileSync(f);
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte > 127) {
            console.log(`Non-ASCII found in ${f} at offset ${i}: ${byte}`);
        }
    }
});
