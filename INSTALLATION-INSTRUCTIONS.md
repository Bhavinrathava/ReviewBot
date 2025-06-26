# Velocity Review Extension - Installation Instructions

## 🎉 Your Extension is Ready!

Your Velocity Review extension has been successfully packaged as `velocityReview-0.0.1.vsix` (401.85 KB).

## Installation Methods

### Method 1: VSCode Command Line (Recommended)
```bash
code --install-extension velocityReview-0.0.1.vsix
```

### Method 2: VSCode UI Installation
1. Open Visual Studio Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Click the "..." menu (three dots) in the Extensions view
4. Select "Install from VSIX..."
5. Browse and select `velocityReview-0.0.1.vsix`
6. Click "Install"

### Method 3: Drag & Drop
- Simply drag the `velocityReview-0.0.1.vsix` file into VSCode

## After Installation

### 1. Verify Installation
- Look for "Velocity" in your Extensions list
- You should see the Velocity Review icon in the Activity Bar (left sidebar)

### 2. Configure the Extension
1. Click the Velocity Review icon in the Activity Bar
2. Click the gear icon (⚙️) to configure
3. Choose your API mode:
   - **OpenAI Direct**: Use your OpenAI API key
   - **Custom URL**: Use your own API endpoint

### 3. Start Using
1. Open a git repository in VSCode
2. Click the play button (▶️) in the Velocity Review sidebar
3. Choose to review latest commit or select from recent commits
4. Get AI-powered code review results!

## Features Included

✅ **Dual API Mode System**
- OpenAI Direct integration with GPT-4
- Custom URL support for your own LLM endpoints

✅ **Commit Selection**
- Review latest commit instantly
- Browse and select from last 10 commits

✅ **Comprehensive Analysis**
- Detailed git commit analysis
- JSON export functionality
- Template-based prompt engineering

✅ **User-Friendly Interface**
- Rich commit information display
- Progress indicators
- Error handling and fallback modes

## Sharing This Extension

### Send to Colleagues
1. Share the `velocityReview-0.0.1.vsix` file
2. Include these installation instructions
3. Recipients can install using any method above

### Email/Slack Distribution
```
Hi! I've created a VSCode extension for AI-powered code reviews.

📎 Attached: velocityReview-0.0.1.vsix

To install:
1. Save the .vsix file
2. In VSCode: Extensions → "..." → "Install from VSIX..."
3. Select the file and install

Features:
- AI code review with OpenAI GPT-4
- Commit selection (latest or browse recent)
- Dual API modes (OpenAI direct or custom URL)
- Comprehensive git analysis

Let me know what you think!
```

### GitHub/File Sharing
1. Upload `velocityReview-0.0.1.vsix` to your preferred platform
2. Share the download link
3. Include installation instructions

## Troubleshooting

### Installation Issues
- **"Extension not found"**: Make sure you're using the correct .vsix file
- **"Installation failed"**: Try restarting VSCode and installing again
- **"Permission denied"**: Run VSCode as administrator (Windows) or with sudo (Mac/Linux)

### Runtime Issues
- **"No git repository"**: Open a folder with git initialized
- **"API call failed"**: Configure your API key or custom URL
- **"No commits found"**: Make sure you have commits in your repository

## Next Steps

### For Marketplace Publishing
If you want to publish this extension officially:
1. Create a Microsoft/Azure DevOps account
2. Set up a publisher profile
3. Run `vsce publish` to publish to the marketplace

### For Updates
When you make changes:
1. Update version in `package.json`
2. Run `vsce package` to create new .vsix
3. Share the updated file

## Support

If you encounter any issues:
1. Check the VSCode Developer Console (`Help → Toggle Developer Tools`)
2. Look for error messages in the Console tab
3. Verify your git repository has commits
4. Ensure API configuration is correct

---

**Congratulations!** Your Velocity Review extension is ready to use and share! 🚀
