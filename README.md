# ReviewBot 🤖

A powerful VS Code extension that leverages Large Language Models (LLMs) to provide intelligent, automated code reviews for your projects. ReviewBot analyzes your latest commit changes and provides comprehensive feedback to help you write better, more maintainable code.

## ✨ Features

### 🔍 Intelligent Code Analysis
- **One-Click Review**: Press a button to instantly analyze your latest commit changes
- **Comprehensive Scanning**: Reviews the entire project context while focusing on recent changes
- **Multi-Language Support**: Works with popular programming languages and frameworks

### 📊 Code Quality Assessment
- **Formatting Issues**: Identifies inconsistent code formatting and style violations
- **Unused Variables**: Detects unused variables, imports, and dead code
- **Implementation Gaps**: Spots incomplete implementations and missing error handling
- **Edge Case Detection**: Identifies potential edge cases that could cause failures
- **Best Practices**: Suggests improvements following industry standards and conventions

### 🧪 Test Coverage Analysis
- **Coverage Gaps**: Identifies untested code paths and functions
- **Test Quality**: Evaluates existing test completeness and effectiveness
- **Missing Test Cases**: Suggests additional test scenarios for better coverage
- **Coverage Reports**: Provides detailed explanations of what's not covered

### 🎯 Smart Recommendations
- **Actionable Feedback**: Provides specific, implementable suggestions
- **Priority Levels**: Categorizes issues by severity (Critical, High, Medium, Low)
- **Code Examples**: Shows before/after code snippets for suggested improvements
- **Documentation**: Highlights areas needing better documentation

## 🚀 Getting Started

### Prerequisites
- VS Code 1.74.0 or higher
- Git repository with commit history
- LLM API access (OpenAI, Anthropic, or compatible service)

### Installation

1. **From VS Code Marketplace**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "ReviewBot"
   - Click Install

2. **From VSIX**:
   - Download the latest `.vsix` file from releases
   - Run `code --install-extension reviewbot-x.x.x.vsix`

### Configuration

1. Open VS Code Settings (Ctrl+,)
2. Search for "ReviewBot"
3. Configure your LLM provider:
   ```json
   {
     "reviewbot.llm.provider": "openai",
     "reviewbot.llm.apiKey": "your-api-key",
     "reviewbot.llm.model": "gpt-4",
     "reviewbot.analysis.includeTests": true,
     "reviewbot.analysis.severity": "medium"
   }
   ```

## 📖 Usage

### Basic Review
1. Make sure you have committed changes in your Git repository
2. Open the Command Palette (Ctrl+Shift+P)
3. Run `ReviewBot: Analyze Latest Commit`
4. Wait for the analysis to complete
5. Review the results in the ReviewBot panel

### Review Panel
The ReviewBot panel displays:
- **Summary**: Overview of findings and overall code quality score
- **Issues**: Categorized list of identified problems
- **Suggestions**: Specific recommendations for improvements
- **Test Coverage**: Analysis of test gaps and suggestions
- **Files Changed**: List of modified files with individual assessments

### Keyboard Shortcuts
- `Ctrl+Alt+R`: Quick review of latest commit
- `Ctrl+Alt+Shift+R`: Full project review
- `Ctrl+Alt+T`: Focus on test coverage analysis

## ⚙️ Configuration Options

### LLM Settings
```json
{
  "reviewbot.llm.provider": "openai",           // LLM provider (openai, anthropic, azure)
  "reviewbot.llm.apiKey": "",                   // Your API key
  "reviewbot.llm.model": "gpt-4",              // Model to use
  "reviewbot.llm.temperature": 0.1,            // Response creativity (0-1)
  "reviewbot.llm.maxTokens": 4000              // Maximum response length
}
```

### Analysis Settings
```json
{
  "reviewbot.analysis.includeTests": true,      // Include test file analysis
  "reviewbot.analysis.severity": "medium",     // Minimum severity level
  "reviewbot.analysis.maxFiles": 50,           // Maximum files to analyze
  "reviewbot.analysis.excludePatterns": [      // Files/folders to exclude
    "node_modules/**",
    "dist/**",
    "*.min.js"
  ]
}
```

### Review Settings
```json
{
  "reviewbot.review.autoOpen": true,           // Auto-open results panel
  "reviewbot.review.showInProblems": true,    // Show issues in Problems panel
  "reviewbot.review.groupByFile": true,       // Group results by file
  "reviewbot.review.showCodeExamples": true   // Include code examples in suggestions
}
```

## 🎨 Customization

### Custom Review Prompts
Create custom review prompts for specific needs:
```json
{
  "reviewbot.prompts.security": "Focus on security vulnerabilities and data validation",
  "reviewbot.prompts.performance": "Analyze for performance bottlenecks and optimization opportunities",
  "reviewbot.prompts.accessibility": "Review for accessibility compliance and best practices"
}
```

### Language-Specific Rules
Configure language-specific analysis rules:
```json
{
  "reviewbot.languages.javascript": {
    "checkUnusedImports": true,
    "enforceStrict": true,
    "preferConst": true
  },
  "reviewbot.languages.python": {
    "checkPEP8": true,
    "requireDocstrings": true,
    "checkTypeHints": true
  }
}
```

## 🔧 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `ReviewBot: Analyze Latest Commit` | Review changes in the last commit | `Ctrl+Alt+R` |
| `ReviewBot: Full Project Review` | Comprehensive review of entire project | `Ctrl+Alt+Shift+R` |
| `ReviewBot: Test Coverage Analysis` | Focus on test coverage gaps | `Ctrl+Alt+T` |
| `ReviewBot: Custom Review` | Run review with custom prompt | - |
| `ReviewBot: Export Report` | Export review results to file | - |
| `ReviewBot: Clear Results` | Clear current review results | - |

## 📊 Output Examples

### Issue Report
```
🔴 CRITICAL: Potential SQL Injection
File: src/database.js:45
Issue: User input directly concatenated into SQL query
Suggestion: Use parameterized queries or prepared statements

🟡 MEDIUM: Unused Import
File: src/utils.js:1
Issue: 'lodash' imported but never used
Suggestion: Remove unused import to reduce bundle size
```

### Test Coverage Report
```
📊 Test Coverage Analysis
Overall Coverage: 67% (Target: 80%)

❌ Uncovered Functions:
- src/auth.js: validateToken() - No tests found
- src/api.js: handleError() - Missing edge case tests

💡 Suggestions:
- Add unit tests for error handling scenarios
- Include integration tests for authentication flow
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to launch Extension Development Host
5. Make changes and test

### Running Tests
```bash
npm test                 # Run all tests
npm run test:unit       # Run unit tests only
npm run test:integration # Run integration tests
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 🐛 Known Issues

- Large repositories (>1000 files) may take longer to analyze
- Some language-specific rules are still in development
- API rate limits may affect analysis speed

## 🔒 Privacy & Security

- Code is analyzed locally when possible
- Only diff content is sent to LLM providers
- API keys are stored securely in VS Code settings
- No code is stored or logged by ReviewBot

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the VS Code team for the excellent extension API
- OpenAI and Anthropic for providing powerful LLM capabilities
- The open-source community for inspiration and feedback

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/reviewbot/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/reviewbot/discussions)
- 📧 **Email**: support@reviewbot.dev
- 💬 **Discord**: [Join our community](https://discord.gg/reviewbot)

---

**Made with ❤️ for developers who care about code quality**
