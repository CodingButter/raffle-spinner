const { exec } = require('child_process');
const path = require('path');

console.log('Testing utils build from JavaScript...');
console.log('Current directory:', process.cwd());

// Clean dist directory
const fs = require('fs');
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Cleaned dist directory');
}

// Run build
exec('npx tsup', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Build failed:', error.message);
        console.error('STDERR:', stderr);
        process.exit(1);
    }
    
    console.log('✅ Build successful!');
    console.log('STDOUT:', stdout);
    
    // List generated files
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        console.log('📄 Generated files:', files);
    }
});