const { spawn } = require('child_process');
const path = require('path');

console.log('Testing VS Code Extension...');
console.log('Current directory:', __dirname);
console.log('Extension path:', path.resolve(__dirname));
console.log('Sample project path:', path.resolve(__dirname, 'sample-project'));

// Try to launch VS Code with extension development path and sample project
const sampleProjectPath = path.resolve(__dirname, 'sample-project');
const vscode = spawn('code', [
    '--extensionDevelopmentPath=' + path.resolve(__dirname),
    sampleProjectPath,
    '--new-window',
    '--wait'
], {
    stdio: 'inherit',
    shell: true
});

vscode.on('error', (error) => {
    console.error('Error launching VS Code:', error);
});

vscode.on('close', (code) => {
    console.log(`VS Code process exited with code ${code}`);
});

console.log('Attempting to launch VS Code Extension Development Host...');
