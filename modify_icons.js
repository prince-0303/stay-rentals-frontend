const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We want to replace width/height on <svg> tags to make them smaller.
    // Let's use a regex to find <svg ... className="..." ...> and modify the sizes.
    // A simpler approach is to add a global CSS class to all SVG or replace w-X h-X inside <svg
    
    // Actually, we can just replace common sizes in <svg tags
    content = content.replace(/<svg([^>]+)className=(["'])([^"']*?)\2([^>]*)>/g, (match, p1, quote, classes, p4) => {
        let newClasses = classes
            .replace(/\bw-4\b/g, 'w-3.5')
            .replace(/\bh-4\b/g, 'h-3.5')
            .replace(/\bw-5\b/g, 'w-4')
            .replace(/\bh-5\b/g, 'h-4')
            .replace(/\bw-6\b/g, 'w-5')
            .replace(/\bh-6\b/g, 'h-5')
            .replace(/\bw-8\b/g, 'w-6')
            .replace(/\bh-8\b/g, 'h-6')
            .replace(/\bw-10\b/g, 'w-8')
            .replace(/\bh-10\b/g, 'h-8');
        return `<svg${p1}className="${newClasses}"${p4}>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated icons in', filePath);
    }
}

walkDir('/Users/princeb/Documents/Rental-Fullstack-Project/Front-end/src', processFile);
