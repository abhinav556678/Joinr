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

const replacements = [
  { regex: /#0D1117/gi, replacement: '#FDFBF7' },
  { regex: /#161B22/gi, replacement: '#FFFFFF' },
  { regex: /rgba\(22, 27, 34, 0\.5\)/g, replacement: 'rgba(255, 255, 255, 0.5)' },
  { regex: /#30363D/gi, replacement: '#EBE6DA' },
  { regex: /#E6EDF3/gi, replacement: '#111111' },
  { regex: /#C9D1D9/gi, replacement: '#333333' },
  { regex: /#8B949E/gi, replacement: '#666666' },
  { regex: /#484F58/gi, replacement: '#999999' },
  { regex: /#58A6FF/gi, replacement: '#deb785' },
  { regex: /#3FB950/gi, replacement: '#deb785' },
  { regex: /rgba\(88, 166, 255, 0\.1\)/gi, replacement: 'rgba(222, 183, 133, 0.2)' },
  { regex: /rgba\(63, 185, 80, 0\.1\)/gi, replacement: 'rgba(222, 183, 133, 0.2)' },
  { regex: /rgba\(63, 185, 80, 0\.4\)/gi, replacement: 'rgba(222, 183, 133, 0.4)' },
  { regex: /rgba\(63, 185, 80, 0\.8\)/gi, replacement: 'rgba(222, 183, 133, 0.8)' },
  { regex: /#1F6FEB/gi, replacement: '#deb785' },
  { regex: /#21262D/gi, replacement: '#FFFFFF' },
  { regex: /#238636/gi, replacement: '#deb785' },
  // Let's add some font replacements. We will add `fontFamily: 'InstrumentSerif_400Regular'`
  // where we have `fontWeight: 'bold'` or `fontSize` that makes sense, 
  // but to keep it simple, we can apply fontFamily to headers.
];

walk('F:/Abhinav/Projects/Joinr_archive_1/joinr/src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated colors in ${file}`);
    }
  });
});
