const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.js')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('F:/Abhinav/Projects/Joinr_archive_1/joinr/src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Add font family to style blocks that contain color or fontSize
    // But since it's tricky with regex, let's just append fontFamily to all text-like styles
    
    // We can also just replace `fontSize: (\d+)` with `fontSize: $1 + 4, fontFamily: 'InstrumentSerif_400Regular'`
    content = content.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
      const newSize = parseInt(p1) + 4;
      return `fontSize: ${newSize}, fontFamily: 'InstrumentSerif_400Regular'`;
    });

    // Remove fontWeight: 'bold' because InstrumentSerif only has 400 regular
    content = content.replace(/fontWeight:\s*['"](?:bold|600|900)['"],?/g, '');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated fonts in ${file}`);
    }
  });
});
