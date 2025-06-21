const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Agentic-XAI for deployment...');

// Build frontend
console.log('📦 Installing frontend dependencies...');
execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });

console.log('🔨 Building frontend...');
execSync('npm run build', { cwd: 'frontend', stdio: 'inherit' });

// Copy build to public directory
console.log('📁 Copying build files...');
const buildDir = path.join(__dirname, 'frontend', 'build');
const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
fs.ensureDirSync(publicDir);

// Copy all files from build to public
fs.copySync(buildDir, publicDir);

console.log('✅ Build complete! Files copied to public/');
console.log('🌐 Ready for deployment!'); 