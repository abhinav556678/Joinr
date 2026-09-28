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
    // skip AppText itself
    if (f.includes('AppText.js')) return;
    
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // 1. Remove the old fontFamily hardcodes completely
    content = content.replace(/,\s*fontFamily:\s*'InstrumentSerif_400Regular'/g, '');
    content = content.replace(/fontFamily:\s*'InstrumentSerif_400Regular',\s*/g, '');
    content = content.replace(/fontFamily:\s*'InstrumentSerif_400Regular'/g, '');

    // 2. Replace <Text with <AppText and </Text> with </AppText>
    if (content.includes('<Text')) {
        content = content.replace(/<Text/g, '<AppText');
        content = content.replace(/<\/Text>/g, '</AppText>');
        
        // 3. Add import if not present
        if (!content.includes('AppText')) {
            // Determine relative path to src/components/AppText.js
            let depth = f.split(path.sep).length - 2; // src/app/file.js -> split=3 -> depth=1
            let relPath = '';
            if (depth === 0) {
                relPath = './components/AppText';
            } else {
                relPath = '../'.repeat(depth) + 'components/AppText';
            }
            
            // Add import after first react-native import, or top of file
            if (content.includes("from 'react-native';")) {
                content = content.replace("from 'react-native';", "from 'react-native';\nimport AppText from '" + relPath + "';");
            } else {
                content = "import AppText from '" + relPath + "';\n" + content;
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(f, content);
        changed++;
        console.log('Updated ' + f);
    }
});
console.log('Changed files:', changed);
