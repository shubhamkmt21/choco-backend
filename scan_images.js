
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const imagesDir = path.join(projectRoot, 'images');

// Read all image files
let existingImages = new Set();
try {
    const files = fs.readdirSync(imagesDir);
    files.forEach(file => existingImages.add(file));
} catch (e) {
    console.error("Error reading images dir:", e);
}

// Function to check file content for "images/..."
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /images\/[\w\-\.]+\.(jpg|png|jpeg|gif|webp)/g;
    const matches = content.match(regex);

    if (matches) {
        matches.forEach(match => {
            const imageName = path.basename(match);
            // Ignore query params if any (though regex didn't catch them)
            const cleanName = imageName.split('?')[0];

            if (!existingImages.has(cleanName)) {
                console.log(`[BROKEN LINK] In ${path.basename(filePath)}: ${match} -> File '${cleanName}' not found in images/`);
            }
        });
    }
}

console.log("--- Scanning for Broken Image Links ---");
checkFile(path.join(projectRoot, 'data.js'));
checkFile(path.join(projectRoot, 'server.js'));
checkFile(path.join(projectRoot, 'script.js'));
checkFile(path.join(projectRoot, 'index.html'));
checkFile(path.join(projectRoot, 'products.html'));
checkFile(path.join(projectRoot, 'product_detail.html'));
console.log("--- Scan Complete ---");
