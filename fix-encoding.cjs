const fs = require('fs');

const filePath = 'src/services/integration/ai/aiPatientScreeningService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix double quotes
content = content.replace(/''/g, "'");

// Fix broken strings more carefully
const lines = content.split('\n');
const fixedLines = lines.map(line => {
  // Fix gender field
  if (line.includes("gender: '") && !line.match(/gender: '[^']+'/)) {
    line = line.replace(/gender: '[^']*'?/g, "gender: '男'");
  }
  
  // Fix recommendationLevel
  if (line.includes("recommendationLevel: '") && !line.match(/recommendationLevel: '[^']+'/)) {
    line = line.replace(/recommendationLevel: '[^']*'?/g, "recommendationLevel: '强烈推荐'");
  }
  
  return line;
});

content = fixedLines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');

console.log('File fixed successfully');
