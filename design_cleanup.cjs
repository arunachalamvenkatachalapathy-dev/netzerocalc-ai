const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'components');

const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(srcPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove "Enterprise", "Interactive", "Global", "Master"
  content = content.replace(/Enterprise /g, '');
  content = content.replace(/Interactive /g, '');
  content = content.replace(/Global /g, '');
  content = content.replace(/Master /g, '');

  // 2. Fix double elevation on bg-white cards
  // bg-white ... shadow-* ... border-* -> remove shadow-*
  // We can just look for classNames containing bg-white, shadow-*, and border-*
  // Since Tailwind class order varies, let's use a regex replace function on className strings
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    let newClasses = classes;
    
    // Fix Elevation
    const hasBgWhite = newClasses.includes('bg-white');
    const hasColoredBg = newClasses.includes('bg-slate-900') || newClasses.includes('bg-emerald-950') || newClasses.includes('bg-amber-50');
    
    if (hasBgWhite) {
      // Remove shadows
      newClasses = newClasses.replace(/\s?shadow-(xs|sm|md|lg|xl|2xl)/g, '');
      newClasses = newClasses.replace(/\s?shadow\b/g, '');
    } else if (hasColoredBg) {
      // Remove borders
      newClasses = newClasses.replace(/\s?border-slate-\d\d\d/g, '');
      newClasses = newClasses.replace(/\s?border-emerald-\d\d\d/g, '');
      newClasses = newClasses.replace(/\s?border-amber-\d\d\d/g, '');
      newClasses = newClasses.replace(/\s?border\b/g, '');
    }

    // Fix border-radius: downgrade rounded-2xl to rounded-xl for inner cards
    // If it's a modal (usually has fixed/absolute or max-w-xl), keep rounded-2xl or rounded-2xl.
    // Actually, user said: `rounded-md` for inputs/badges, `rounded-xl` for inner content, `rounded-2xl` for top-level.
    // We'll replace rounded-2xl with rounded-xl in most cards.
    const isTopLevel = newClasses.includes('max-w-xl') || newClasses.includes('max-w-lg') || newClasses.includes('max-w-md') || newClasses.includes('max-w-2xl');
    if (!isTopLevel) {
      newClasses = newClasses.replace(/\brounded-2xl\b/g, 'rounded-xl');
    }

    // For buttons/inputs, let's make sure they aren't using rounded-lg if they should be md, but the user mainly complained about 27 instances of rounded-2xl.
    
    return `className="${newClasses.trim().replace(/\s+/g, ' ')}"`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Design cleanup complete.");
