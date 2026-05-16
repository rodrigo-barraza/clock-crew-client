const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // fix map/filter with index: .map((x, i) =>
  content = content.replace(/\.map\(\(\s*([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*\)\s*=>/g, '.map(($1: any, $2: any) =>');
  content = content.replace(/\.filter\(\(\s*([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*\)\s*=>/g, '.filter(($1: any, $2: any) =>');
  
  // fix remaining missing types for val, err, etc
  content = content.replace(/\(val\)\s*=>/g, '(val: any) =>');
  content = content.replace(/\(sub\)\s*=>/g, '(sub: any) =>');
  content = content.replace(/\(link\)\s*=>/g, '(link: any) =>');
  content = content.replace(/\(p\)\s*=>/g, '(p: any) =>');
  content = content.replace(/\(r\)\s*=>/g, '(r: any) =>');
  content = content.replace(/\(t\)\s*=>/g, '(t: any) =>');
  content = content.replace(/\(y\)\s*=>/g, '(y: any) =>');
  content = content.replace(/\(d\)\s*=>/g, '(d: any) =>');
  content = content.replace(/\(day\)\s*=>/g, '(day: any) =>');
  content = content.replace(/\(c\)\s*=>/g, '(c: any) =>');
  
  content = content.replace(/isNaN\(d\)/g, 'isNaN(d as any)');
  content = content.replace(/emoji\} Top/g, 'type} Top'); // 'emoji' is missing
  content = content.replace(/TYPE_META\[contentType\]/g, 'TYPE_META[contentType as keyof typeof TYPE_META]');
  
  // expect.toBeInTheDocument
  content = content.replace(/expect\((.+?)\)\.toBeInTheDocument\(\)/g, '(expect($1) as any).toBeInTheDocument()');

  if (content !== original) {
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
      replaceInFile(fullPath);
    }
  }
}

walkDir('./src');
if (fs.existsSync('./tests')) walkDir('./tests');
