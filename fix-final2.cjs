const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Fix MemberDirectory
  content = content.replace(/new Date\(b\.dateRegistered \|\| 0\)\s*-\s*new Date\(a\.dateRegistered \|\| 0\)/g, '(new Date(b.dateRegistered || 0) as any) - (new Date(a.dateRegistered || 0) as any)');
  content = content.replace(/new Date\(a\.dateRegistered \|\| 0\)\s*-\s*new Date\(b\.dateRegistered \|\| 0\)/g, '(new Date(a.dateRegistered || 0) as any) - (new Date(b.dateRegistered || 0) as any)');
  content = content.replace(/if \(!groups\[key\]\) groups\[key\] = \[\];/g, 'if (!(groups as any)[key]) (groups as any)[key] = [];');
  content = content.replace(/groups\[key\]\.push\(user\);/g, '(groups as any)[key].push(user);');
  content = content.replace(/\{members\.map\(\(user: any, i: any\)/g, '{(members as any).map((user: any, i: any)');

  // Fix HomePage
  content = content.replace(/heroRef\.current\.style/g, '(heroRef.current as any).style');
  content = content.replace(/heroRef\.current\?\.classList/g, '(heroRef.current as any)?.classList');

  // Fix ClockComponent
  content = content.replace(/let rafId;/g, 'let rafId: any;');
  content = content.replace(/el\.style/g, '(el as any).style');
  content = content.replace(/style=\{\{\s*"--clock-size":\s*`\$\{size\}px`\s*\}\}/g, 'style={{ "--clock-size": `${size}px` } as React.CSSProperties}');
  content = content.replace(/style=\{\{\s*"--tick-rotation":\s*`\$\{i\s*\*\s*30\}deg`\s*\}\}/g, 'style={{ "--tick-rotation": `${i * 30}deg` } as React.CSSProperties}');

  // Fix HistoryTimelineComponent
  content = content.replace(/timelineRef\.current\?\.querySelectorAll/g, '(timelineRef.current as any)?.querySelectorAll');
  content = content.replace(/items\?\.forEach\(\(el\)\s*=>/g, '(items as any)?.forEach((el: any) =>');
  content = content.replace(/ERA_COLORS\[era\.key\]/g, 'ERA_COLORS[(era as any).key as keyof typeof ERA_COLORS]');
  content = content.replace(/return ids\.map\(\(id\)\s*=>/g, 'return (ids as any).map((id: any) =>');

  // Fix MemberProfileComponent
  content = content.replace(/<span className=\{styles\.statValue\}>\{value\s*as\s*any\}<\/span>/g, '<span className={styles.statValue}>{(value as any)}</span>');
  content = content.replace(/type=\{type\s*as\s*any\}/g, 'type={(type as any)}');

  // Fix NewgroundsPortalComponent
  content = content.replace(/\{type\s*as\s*any\}\s*Top/g, '{(type as any)} Top');

  // Fix api/discord/stream/route.ts
  content = content.replace(/rewriteStream\(upstream\.body\)/g, 'rewriteStream(upstream.body as any)');

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
