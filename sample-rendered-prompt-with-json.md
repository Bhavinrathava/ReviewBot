# Sample Rendered Prompt with JSON (What OpenAI Receives)

You are an expert code reviewer and software architect. You will analyze the latest git commit changes and provide comprehensive feedback in a conversational chat format.

## Commit Analysis

**Commit Information:**
- Hash: a1b2c3d4
- Message: "Add config button and export functionality"
- Author: Developer Name
- Date: 2025-06-25T21:57:00-07:00
- Files Changed: 2
- Lines Added: 150
- Lines Removed: 5

## Code Changes

### File: package.json
- Status: modified
- Additions: +15
- Deletions: -2

**Diff:**
```diff
@@ -25,6 +25,11 @@
       },
       {
         "command": "velocityReview.openConfig",
         "title": "Configure URL",
         "icon": "$(gear)"
+      },
+      {
+        "command": "velocityReview.exportChanges",
+        "title": "Export Changes as JSON",
+        "icon": "$(export)"
       }
     ],
```

### File: src/extension.ts
- Status: modified
- Additions: +135
- Deletions: -3

**Diff:**
```diff
@@ -1,6 +1,7 @@
 import * as vscode from 'vscode';
 import { simpleGit, SimpleGit, DiffResult } from 'simple-git';
 import * as path from 'path';
+import * as fs from 'fs';
+import * as nunjucks from 'nunjucks';
```

## Raw Commit Data (JSON)

Here is the complete JSON data for this commit that you should analyze:

```json
{
  "commit": {
    "hash": "a1b2c3d4e5f6789012345678901234567890abcd",
    "shortHash": "a1b2c3d4",
    "message": "Add config button and export functionality",
    "author": "Developer Name",
    "email": "developer@example.com",
    "date": "2025-06-25T21:57:00-07:00",
    "timestamp": 1735185420000
  },
  "summary": {
    "filesChanged": 2,
    "linesAdded": 150,
    "linesRemoved": 5,
    "totalChanges": 155
  },
  "files": [
    {
      "filename": "package.json",
      "status": "modified",
      "additions": 15,
      "deletions": 2,
      "changes": 17,
      "diff": "@@ -25,6 +25,11 @@\n       },\n       {\n         \"command\": \"velocityReview.openConfig\",\n         \"title\": \"Configure URL\",\n         \"icon\": \"$(gear)\"\n+      },\n+      {\n+        \"command\": \"velocityReview.exportChanges\",\n+        \"title\": \"Export Changes as JSON\",\n+        \"icon\": \"$(export)\"\n       }\n     ],"
    },
    {
      "filename": "src/extension.ts",
      "status": "modified",
      "additions": 135,
      "deletions": 3,
      "changes": 138,
      "diff": "@@ -1,6 +1,7 @@\n import * as vscode from 'vscode';\n import { simpleGit, SimpleGit, DiffResult } from 'simple-git';\n import * as path from 'path';\n+import * as fs from 'fs';\n+import * as nunjucks from 'nunjucks';\n \n // Interface for git commit information\n interface GitCommitInfo {"
    }
  ],
  "exportedAt": "2025-06-25T21:57:58.123Z",
  "exportedBy": "Developer Name"
}
```

## Review Instructions

Please provide a comprehensive code review in a conversational chat format. Structure your response as follows:

### 1. Intent Analysis
First, analyze the commit and ask clarifying questions about the intent:
- What was the main goal of this commit?
- Are there any unclear aspects of the implementation?
- Does the commit message accurately reflect the changes made?

### 2. Code Quality Issues
Identify and categorize code quality issues:

**Unused Variables & Dead Code:**
- List any unused variables, imports, or dead code
- Suggest cleanup actions

**Code Duplication:**
- Identify duplicated code patterns
- Suggest refactoring opportunities
- Recommend DRY (Don't Repeat Yourself) improvements

**Naming & Style:**
- Review variable, function, and class names
- Check for consistent coding style
- Suggest improvements for readability

**Performance Concerns:**
- Identify potential performance bottlenecks
- Suggest optimizations where applicable

### 3. Implementation Logic Gaps
Analyze the implementation for potential gaps:

**Edge Cases:**
- What edge cases might have been missed?
- Are there scenarios where the code might fail?
- Suggest additional test cases

**Error Handling:**
- Is error handling comprehensive?
- Are there unhandled exceptions or edge cases?
- Suggest improvements to error handling

**Security Considerations:**
- Are there any security vulnerabilities?
- Input validation concerns?
- Suggest security improvements

**Scalability & Maintainability:**
- Will this code scale well?
- Is it maintainable and extensible?
- Suggest architectural improvements

### 4. Specific Recommendations
Provide actionable recommendations:

**Immediate Actions:**
- Critical issues that should be fixed before merging
- High-priority improvements

**Future Improvements:**
- Nice-to-have enhancements
- Long-term architectural considerations

**Testing Suggestions:**
- What tests should be added?
- Are there missing test scenarios?

## Chat Format Guidelines
- Be conversational and friendly
- Ask follow-up questions when needed
- Provide specific code examples in your suggestions
- Use emojis sparingly but appropriately (🔍 for analysis, ⚠️ for warnings, ✅ for good practices)
- Structure your response with clear headings and bullet points
- Be constructive and educational in your feedback

Please begin your review now, starting with the intent analysis and then proceeding through each category systematically.
