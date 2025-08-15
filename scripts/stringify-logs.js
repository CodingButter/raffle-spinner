#!/usr/bin/env node

/**
 * Quick script to replace console.log objects with JSON.stringify
 * for easier copying of logs from browser console
 */

const fs = require('fs');
const path = require('path');

const files = [
  '../packages/spinners/src/slot-machine/SlotMachineWheelFixed.tsx',
  '../packages/spinners/src/slot-machine/hooks/useSlotMachineAnimation.ts',
];

files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace console.log with object literals to JSON.stringify
  content = content.replace(
    /console\.log\(([^,]+),\s*\{([^}]+)\}\)/g,
    (match, label, objectContent) => {
      return `console.log(${label}, JSON.stringify({${objectContent}}, null, 2))`;
    }
  );

  // Handle multiline console.log statements
  content = content.replace(
    /console\.log\(([^,]+),\s*\{([^}]*\n[^}]*)\}\)/g,
    (match, label, objectContent) => {
      return `console.log(${label}, JSON.stringify({${objectContent}}, null, 2))`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${path.basename(filePath)}`);
});

console.log('\n🎉 All console.log statements converted to JSON.stringify format!');
