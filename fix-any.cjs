const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  const replaceRegexes = [
    /(function\s+\w+\s*\()([^)]+)(\))/g,
    /(const\s+\w+\s*=\s*(?:async\s*)?\()([^)]+)(\)\s*=>)/g,
    /(export\s+default\s+(?:async\s*)?function(?:\s+\w+)?\s*\()([^)]+)(\))/g,
    /(export\s+(?:async\s*)?function\s+\w+\s*\()([^)]+)(\))/g
  ];

  for (const regex of replaceRegexes) {
    content = content.replace(regex, (match, p1, p2, p3) => {
      const params = p2.split(',').map(p => {
        let trimmed = p.trim();
        if (trimmed === '' || trimmed.includes(':') || trimmed.includes('=')) return p;
        
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          return `${trimmed}: any`;
        }
        if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(trimmed)) {
           return `${trimmed}: any`;
        }
        // catch elements like `...args`
        if (trimmed.startsWith('...')) {
            return `${trimmed}: any[]`;
        }
        return p;
      });
      const newParams = params.join(', ');
      if (p2 !== newParams) changed = true;
      return `${p1}${newParams}${p3}`;
    });
  }

  // Handle (.map(user => ...)) or array functions without parenthesis
  // Actually, too complex for regex, I'll just skip simple arrow without parenthesis 
  // since `tsc` will error and we can fix manually or add them.
  const arrowNoParens = /(\.map|\.filter|\.reduce|\.forEach)\(\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g;
  content = content.replace(arrowNoParens, (match, p1, p2) => {
    changed = true;
    return `${p1}((${p2}: any) =>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir('./src');
if (fs.existsSync('./tests')) walkDir('./tests');
