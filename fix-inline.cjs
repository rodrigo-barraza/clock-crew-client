const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // e.g. onChange={(val) =>
  content = content.replace(/\(\(val\)\s*=>/g, '((val: any) =>');
  content = content.replace(/\(user\)\s*=>/g, '(user: any) =>');
  content = content.replace(/\(item\)\s*=>/g, '(item: any) =>');
  content = content.replace(/\(profile\)\s*=>/g, '(profile: any) =>');
  content = content.replace(/\(entry\)\s*=>/g, '(entry: any) =>');
  content = content.replace(/\(doc\)\s*=>/g, '(doc: any) =>');
  content = content.replace(/\(e\)\s*=>/g, '(e: any) =>');
  content = content.replace(/e\.target\.style/g, '(e.target as any).style');
  content = content.replace(/\(clock\)\s*=>/g, '(clock: any) =>');

  // Any array param functions like .map(entry => ... )
  content = content.replace(/\.map\(\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g, '.map(($1: any) =>');
  content = content.replace(/\.filter\(\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g, '.filter(($1: any) =>');
  content = content.replace(/\.reduce\(\s*\(\s*([a-zA-Z_$]+)\s*,\s*([a-zA-Z_$]+)\s*\)\s*=>/g, '.reduce(($1: any, $2: any) =>');

  // Handle useCallback((profile) =>
  content = content.replace(/useCallback\(\s*\(\s*([a-zA-Z_$]+)\s*\)\s*=>/g, 'useCallback(($1: any) =>');

  // Any left over test files where jest/vitest is used incorrectly
  content = content.replace(/expect\((\w+)\)\.toBeInTheDocument/g, 'expect($1 as any).toBeInTheDocument');

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
