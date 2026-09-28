const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let changed = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('InstrumentSerif_400Regular') || content.includes('@expo-google-fonts/instrument-serif')) {
        content = content.replace(/InstrumentSerif_400Regular/g, 'Inter_400Regular');
        content = content.replace(/@expo-google-fonts\/instrument-serif/g, '@expo-google-fonts/inter');
        fs.writeFileSync(f, content);
        changed++;
        console.log('Updated ' + f);
    }
});
console.log('Changed files:', changed);
