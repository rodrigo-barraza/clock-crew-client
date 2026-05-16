const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  content = content.replace(/function\s+(\w+)\s*\(\s*\{([^}]+)\}\s*\)\s*\{/g, 'function $1({$2}: any) {');
  content = content.replace(/const\s+(\w+)\s*=\s*\(\s*\{([^}]+)\}\s*\)\s*=>/g, 'const $1 = ({$2}: any) =>');
  
  // Also fix useState(null) if I missed it because of type inferrence bugs
  // But wait, the previous ones should have worked.
  
  // Fix specific bugs like `err` vs `error` in NewgroundsPortalComponent
  content = content.replace(/console\.error\("\[NewgroundsPortal\] Fetch error:", err\);/g, 'console.error("[NewgroundsPortal] Fetch error:", (error as any));');
  
  // Fix `Timeout is not assignable to type null` (use any for ref)
  content = content.replace(/const debounceRef = useRef<any>\(null\);/g, 'const debounceRef = useRef<any>(null);');
  content = content.replace(/const debounceRef = useRef\(null\);/g, 'const debounceRef = useRef<any>(null);');
  
  // Fix `style: any` inside destructured params (my previous script messed it up)
  content = content.replace(/\{\s*profile,\s*style:\s*any,\s*onClick\s*\}/g, '{ profile, style, onClick }');

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
