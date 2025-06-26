// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { simpleGit, SimpleGit, DiffResult } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';
import * as nunjucks from 'nunjucks';

// Interface for git commit information
interface GitCommitInfo {
	filesChanged: number;
	linesAdded: number;
	linesRemoved: number;
	commitHash: string;
	commitMessage: string;
	author: string;
	date: string;
	changedFiles: string[];
}

// Interface for detailed commit changes export
interface DetailedCommitChanges {
	commit: {
		hash: string;
		shortHash: string;
		message: string;
		author: string;
		email: string;
		date: string;
		timestamp: number;
	};
	summary: {
		filesChanged: number;
		linesAdded: number;
		linesRemoved: number;
		totalChanges: number;
	};
	files: Array<{
		filename: string;
		status: string;
		additions: number;
		deletions: number;
		changes: number;
		diff: string;
	}>;
	exportedAt: string;
	exportedBy: string;
}

// Function to get git commit information
async function getLastCommitInfo(workspaceRoot: string): Promise<GitCommitInfo | null> {
	try {
		const git: SimpleGit = simpleGit(workspaceRoot);
		
		// Check if this is a git repository
		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			return null;
		}

		// Get the latest commit
		const log = await git.log({ maxCount: 1 });
		if (log.all.length === 0) {
			return null;
		}

		const latestCommit = log.latest;
		if (!latestCommit) {
			return null;
		}

		// Get diff stats for the latest commit
		const diffSummary = await git.diffSummary([`${latestCommit.hash}^`, latestCommit.hash]);
		
		// Get list of changed files
		const changedFiles = diffSummary.files.map(file => file.file);

		return {
			filesChanged: diffSummary.files.length,
			linesAdded: diffSummary.insertions,
			linesRemoved: diffSummary.deletions,
			commitHash: latestCommit.hash.substring(0, 8), // Short hash
			commitMessage: latestCommit.message,
			author: latestCommit.author_name,
			date: latestCommit.date,
			changedFiles: changedFiles
		};
	} catch (error) {
		console.error('Error getting git commit info:', error);
		return null;
	}
}

// Interface for commit selection
interface CommitOption {
	label: string;
	description: string;
	detail: string;
	hash: string;
}

// Function to get recent commits for selection
async function getRecentCommits(workspaceRoot: string, maxCount: number = 10): Promise<CommitOption[]> {
	try {
		const git: SimpleGit = simpleGit(workspaceRoot);
		
		// Check if this is a git repository
		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			return [];
		}

		// Get recent commits
		const log = await git.log({ maxCount });
		if (log.all.length === 0) {
			return [];
		}

		// Convert commits to selection options
		const commitOptions: CommitOption[] = await Promise.all(
			log.all.map(async (commit, index) => {
				// Get diff stats for this commit
				let diffSummary;
				try {
					diffSummary = await git.diffSummary([`${commit.hash}^`, commit.hash]);
				} catch (error) {
					// Handle case where commit has no parent (initial commit)
					diffSummary = { files: [], insertions: 0, deletions: 0 };
				}

				const shortHash = commit.hash.substring(0, 8);
				const date = new Date(commit.date).toLocaleDateString();
				const filesChanged = diffSummary.files.length;
				const linesChanged = diffSummary.insertions + diffSummary.deletions;

				return {
					label: `${index === 0 ? '🔥 ' : ''}${shortHash} - ${commit.message}`,
					description: `by ${commit.author_name} on ${date}`,
					detail: `${filesChanged} files, ${linesChanged} lines changed`,
					hash: commit.hash
				};
			})
		);

		return commitOptions;
	} catch (error) {
		console.error('Error getting recent commits:', error);
		return [];
	}
}

// Sidebar View Provider
class VelocityReviewSidebarProvider implements vscode.TreeDataProvider<VelocityReviewItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<VelocityReviewItem | undefined | null | void> = new vscode.EventEmitter<VelocityReviewItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<VelocityReviewItem | undefined | null | void> = this._onDidChangeTreeData.event;
	private gitCommitInfo: GitCommitInfo | null = null;

	constructor() {
		this.loadGitCommitInfo();
	}

	private async loadGitCommitInfo(): Promise<void> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			this.gitCommitInfo = await getLastCommitInfo(workspaceFolders[0].uri.fsPath);
		}
	}

	async refresh(): Promise<void> {
		await this.loadGitCommitInfo();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: VelocityReviewItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: VelocityReviewItem): Thenable<VelocityReviewItem[]> {
		if (!element) {
			// Root level items
			return Promise.resolve([
				new VelocityReviewItem('Pull Request Analysis', vscode.TreeItemCollapsibleState.Collapsed, 'analysis'),
				new VelocityReviewItem('Code Quality Checks', vscode.TreeItemCollapsibleState.Collapsed, 'quality'),
				new VelocityReviewItem('Security Review', vscode.TreeItemCollapsibleState.Collapsed, 'security'),
				new VelocityReviewItem('Performance Metrics', vscode.TreeItemCollapsibleState.Collapsed, 'performance')
			]);
		} else {
			// Child items based on parent
			switch (element.contextValue) {
				case 'analysis':
					if (this.gitCommitInfo) {
						const items = [
							new VelocityReviewItem(`Files Changed: ${this.gitCommitInfo.filesChanged}`, vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem(`Lines Added: ${this.gitCommitInfo.linesAdded}`, vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem(`Lines Removed: ${this.gitCommitInfo.linesRemoved}`, vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem(`Commit: ${this.gitCommitInfo.commitHash}`, vscode.TreeItemCollapsibleState.Collapsed, 'commit-details'),
							new VelocityReviewItem('Changed Files', vscode.TreeItemCollapsibleState.Collapsed, 'changed-files')
						];
						return Promise.resolve(items);
					} else {
						return Promise.resolve([
							new VelocityReviewItem('Files Changed: N/A (No git repo)', vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem('Lines Added: N/A', vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem('Lines Removed: N/A', vscode.TreeItemCollapsibleState.None, 'info')
						]);
					}
				case 'quality':
					return Promise.resolve([
						new VelocityReviewItem('Code Coverage: N/A', vscode.TreeItemCollapsibleState.None, 'info'),
						new VelocityReviewItem('Linting Issues: 0', vscode.TreeItemCollapsibleState.None, 'info'),
						new VelocityReviewItem('Test Status: Pending', vscode.TreeItemCollapsibleState.None, 'info')
					]);
				case 'security':
					return Promise.resolve([
						new VelocityReviewItem('Vulnerability Scan: Pending', vscode.TreeItemCollapsibleState.None, 'info'),
						new VelocityReviewItem('Dependency Check: Pending', vscode.TreeItemCollapsibleState.None, 'info')
					]);
				case 'performance':
					return Promise.resolve([
						new VelocityReviewItem('Bundle Size: N/A', vscode.TreeItemCollapsibleState.None, 'info'),
						new VelocityReviewItem('Load Time: N/A', vscode.TreeItemCollapsibleState.None, 'info')
					]);
				case 'commit-details':
					if (this.gitCommitInfo) {
						return Promise.resolve([
							new VelocityReviewItem(`Message: ${this.gitCommitInfo.commitMessage}`, vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem(`Author: ${this.gitCommitInfo.author}`, vscode.TreeItemCollapsibleState.None, 'info'),
							new VelocityReviewItem(`Date: ${new Date(this.gitCommitInfo.date).toLocaleString()}`, vscode.TreeItemCollapsibleState.None, 'info')
						]);
					}
					return Promise.resolve([]);
				case 'changed-files':
					if (this.gitCommitInfo && this.gitCommitInfo.changedFiles.length > 0) {
						return Promise.resolve(
							this.gitCommitInfo.changedFiles.map(file => 
								new VelocityReviewItem(file, vscode.TreeItemCollapsibleState.None, 'file')
							)
						);
					}
					return Promise.resolve([
						new VelocityReviewItem('No files changed', vscode.TreeItemCollapsibleState.None, 'info')
					]);
				default:
					return Promise.resolve([]);
			}
		}
	}
}

class VelocityReviewItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly contextValue: string
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
		
		// Set icons based on context
		switch (contextValue) {
			case 'analysis':
				this.iconPath = new vscode.ThemeIcon('search');
				break;
			case 'quality':
				this.iconPath = new vscode.ThemeIcon('checklist');
				break;
			case 'security':
				this.iconPath = new vscode.ThemeIcon('shield');
				break;
			case 'performance':
				this.iconPath = new vscode.ThemeIcon('dashboard');
				break;
			case 'commit-details':
				this.iconPath = new vscode.ThemeIcon('git-commit');
				break;
			case 'changed-files':
				this.iconPath = new vscode.ThemeIcon('files');
				break;
			case 'file':
				this.iconPath = new vscode.ThemeIcon('file');
				break;
			case 'info':
				this.iconPath = new vscode.ThemeIcon('info');
				break;
		}
	}
}

// Function to get detailed commit changes for export (latest commit)
async function getDetailedCommitChanges(workspaceRoot: string): Promise<DetailedCommitChanges | null> {
	try {
		const git: SimpleGit = simpleGit(workspaceRoot);
		
		// Check if this is a git repository
		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			return null;
		}

		// Get the latest commit
		const log = await git.log({ maxCount: 1 });
		if (log.all.length === 0) {
			return null;
		}

		const latestCommit = log.latest;
		if (!latestCommit) {
			return null;
		}

		return await getDetailedCommitChangesByHash(workspaceRoot, latestCommit.hash);
	} catch (error) {
		console.error('Error getting detailed commit changes:', error);
		return null;
	}
}

// Function to get detailed commit changes for a specific commit hash
async function getDetailedCommitChangesByHash(workspaceRoot: string, commitHash: string): Promise<DetailedCommitChanges | null> {
	try {
		const git: SimpleGit = simpleGit(workspaceRoot);
		
		// Check if this is a git repository
		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			return null;
		}

		// Get the specific commit
		const log = await git.log({ from: commitHash, maxCount: 1 });
		if (log.all.length === 0) {
			return null;
		}

		const commit = log.all[0];
		if (!commit) {
			return null;
		}

		// Get diff stats for the specific commit
		let diffSummary;
		try {
			diffSummary = await git.diffSummary([`${commit.hash}^`, commit.hash]);
		} catch (error) {
			// Handle case where commit has no parent (initial commit)
			diffSummary = { files: [], insertions: 0, deletions: 0 };
		}
		
		// Process each changed file
		const files = await Promise.all(diffSummary.files.map(async (file) => {
			// Get individual file diff
			let fileDiff;
			try {
				fileDiff = await git.diff([`${commit.hash}^`, commit.hash, '--', file.file]);
			} catch (error) {
				// Handle case where commit has no parent
				fileDiff = `New file: ${file.file}`;
			}
			
			// Handle different file types
			const additions = 'insertions' in file ? file.insertions : 0;
			const deletions = 'deletions' in file ? file.deletions : 0;
			const changes = 'changes' in file ? file.changes : 0;
			const isBinary = 'binary' in file ? file.binary : false;
			
			return {
				filename: file.file,
				status: isBinary ? 'binary' : 'modified',
				additions: additions,
				deletions: deletions,
				changes: changes,
				diff: fileDiff
			};
		}));

		// Get current user info
		const gitConfig = await git.listConfig();
		const userName = Array.isArray(gitConfig.all['user.name']) 
			? gitConfig.all['user.name'][0] 
			: gitConfig.all['user.name'] || 'Unknown';

		return {
			commit: {
				hash: commit.hash,
				shortHash: commit.hash.substring(0, 8),
				message: commit.message,
				author: commit.author_name,
				email: commit.author_email,
				date: commit.date,
				timestamp: new Date(commit.date).getTime()
			},
			summary: {
				filesChanged: diffSummary.files.length,
				linesAdded: diffSummary.insertions,
				linesRemoved: diffSummary.deletions,
				totalChanges: diffSummary.insertions + diffSummary.deletions
			},
			files: files,
			exportedAt: new Date().toISOString(),
			exportedBy: userName
		};
	} catch (error) {
		console.error('Error getting detailed commit changes by hash:', error);
		return null;
	}
}

// Mock LLM API response interface
interface LLMResponse {
	success: boolean;
	response?: string;
	error?: string;
}

// Function to render Jinja2 template with commit data
async function renderPromptTemplate(commitData: DetailedCommitChanges, extensionPath: string): Promise<string> {
	try {
		const templatePath = path.join(extensionPath, 'prompt.j2');
		const templateContent = await fs.promises.readFile(templatePath, 'utf8');
		
		// Configure nunjucks
		const env = new nunjucks.Environment();
		
		// Prepare template data with raw JSON
		const templateData = {
			...commitData,
			raw_json: JSON.stringify(commitData, null, 2)
		};
		
		// Render template with commit data and raw JSON
		const renderedPrompt = env.renderString(templateContent, templateData);
		
		return renderedPrompt;
	} catch (error) {
		console.error('Error rendering template:', error);
		throw new Error('Failed to render prompt template');
	}
}

// Function to call OpenAI API directly
async function callOpenAIAPI(prompt: string, apiKey: string): Promise<LLMResponse> {
	try {
		console.log('Calling OpenAI API directly with prompt length:', prompt.length);
		
		// Check if we should use mock response (for testing when no API key is provided)
		if (!apiKey || apiKey.trim() === '') {
			console.log('No API key provided, using mock response');
			await new Promise(resolve => setTimeout(resolve, 2000));
			const mockResponse = generateMockLLMResponse(prompt);
			return {
				success: true,
				response: mockResponse
			};
		}

		// Actual OpenAI API call using dynamic import for node-fetch
		const { default: fetch } = await import('node-fetch');
		
		const requestBody = {
			model: "gpt-4",
			messages: [
				{
					role: "user",
					content: prompt
				}
			],
			max_tokens: 2000,
			temperature: 0.7
		};

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify(requestBody)
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`OpenAI API call failed (${response.status}): ${errorText}`);
		}
		
		const data: any = await response.json();
		
		// Handle OpenAI response format
		if (data.choices && data.choices.length > 0) {
			return {
				success: true,
				response: data.choices[0].message.content
			};
		} else {
			throw new Error('Invalid response format from OpenAI API');
		}
		
	} catch (error) {
		console.error('OpenAI API call failed:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

// Function to call custom URL API
async function callCustomAPI(prompt: string, apiUrl: string, commitData: DetailedCommitChanges): Promise<LLMResponse> {
	try {
		console.log('Calling custom API with prompt length:', prompt.length);
		console.log('Custom API URL:', apiUrl);
		
		// Use dynamic import for node-fetch
		const { default: fetch } = await import('node-fetch');
		
		// Send both the rendered prompt and raw JSON data to custom API
		const requestBody = {
			prompt: prompt,
			commitData: commitData,
			timestamp: new Date().toISOString()
		};

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Custom API call failed (${response.status}): ${errorText}`);
		}
		
		const data: any = await response.json();
		
		// Handle custom API response - expect either 'response' or 'message' field
		if (data.response) {
			return {
				success: true,
				response: data.response
			};
		} else if (data.message) {
			return {
				success: true,
				response: data.message
			};
		} else {
			throw new Error('Invalid response format from custom API');
		}
		
	} catch (error) {
		console.error('Custom API call failed:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

// Generate mock LLM response for demonstration
function generateMockLLMResponse(prompt: string): string {
	return `# 🔍 Code Review Analysis

## Intent Analysis

Looking at your recent commit, I can see you've made some significant changes! Let me break down what I'm observing:

**Main Goal Assessment:**
Based on the commit message and changes, it appears you were working on enhancing functionality. However, I'd like to understand a few things better:

- What specific problem were you trying to solve with these changes?
- Are there any particular user scenarios you had in mind?
- Does the commit message fully capture the scope of changes made?

## Code Quality Issues

### 🧹 Unused Variables & Dead Code
- I noticed some potential cleanup opportunities
- Consider reviewing import statements for unused dependencies
- Look for any commented-out code that can be removed

### 🔄 Code Duplication
- There might be some repeated patterns that could be refactored
- Consider extracting common functionality into utility functions
- Look for opportunities to apply the DRY principle

### 📝 Naming & Style
- Variable and function names look generally good
- Consider consistency in naming conventions
- Some functions might benefit from more descriptive names

### ⚡ Performance Concerns
- Review any loops or recursive operations
- Consider caching for frequently accessed data
- Look for opportunities to optimize database queries or API calls

## Implementation Logic Gaps

### 🎯 Edge Cases
**Potential scenarios to consider:**
- What happens with empty or null inputs?
- How does the code handle network failures?
- Are there boundary conditions that need testing?

**Suggested test cases:**
- Test with minimum and maximum values
- Test error conditions and recovery
- Test concurrent access scenarios

### 🛡️ Error Handling
- Consider adding try-catch blocks where appropriate
- Implement graceful degradation for non-critical failures
- Add logging for debugging purposes

### 🔒 Security Considerations
- Review input validation and sanitization
- Check for potential injection vulnerabilities
- Consider authentication and authorization requirements

### 📈 Scalability & Maintainability
- Will this code handle increased load?
- Is the architecture extensible for future features?
- Consider documentation for complex logic

## Specific Recommendations

### ⚠️ Immediate Actions
1. Add comprehensive error handling
2. Include unit tests for new functionality
3. Review and update documentation

### 🚀 Future Improvements
1. Consider implementing caching mechanisms
2. Look into performance monitoring
3. Plan for internationalization if needed

### 🧪 Testing Suggestions
- Add unit tests for core functionality
- Include integration tests for API endpoints
- Consider end-to-end testing for user workflows

---

**Overall Assessment:** The changes show good progress! With some attention to the areas mentioned above, this will be solid, maintainable code. 

Would you like me to dive deeper into any specific area, or do you have questions about implementing any of these suggestions?`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "velocityReview" is now active!');

	// Set context to show sidebar
	vscode.commands.executeCommand('setContext', 'velocityReview:showSidebar', true);

	// Create sidebar provider
	const sidebarProvider = new VelocityReviewSidebarProvider();
	
	// Register the sidebar view
	vscode.window.createTreeView('velocityReviewSidebar', {
		treeDataProvider: sidebarProvider,
		showCollapseAll: true
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('velocityReview.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Velocity!');
	});

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('velocityReview.refreshSidebar', () => {
		sidebarProvider.refresh();
		vscode.window.showInformationMessage('Velocity Review sidebar refreshed!');
	});

	// Register start review command
	const startReviewCommand = vscode.commands.registerCommand('velocityReview.startReview', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a project folder.');
			return;
		}

		const workspaceRoot = workspaceFolders[0].uri.fsPath;

		// Step 1: Ask user to choose between latest commit or select from recent commits
		const reviewOption = await vscode.window.showQuickPick([
			{
				label: '🔥 Review Latest Commit',
				description: 'Review the most recent commit',
				detail: 'Quick review of the latest changes',
				value: 'latest'
			},
			{
				label: '📋 Choose from Recent Commits',
				description: 'Select a specific commit to review',
				detail: 'Browse and select from the last 10 commits',
				value: 'select'
			}
		], {
			placeHolder: 'How would you like to start the review?'
		});

		if (!reviewOption) {
			return; // User cancelled
		}

		let selectedCommitHash: string | undefined;

		if (reviewOption.value === 'select') {
			// Step 2: Show recent commits for selection
			const recentCommits = await getRecentCommits(workspaceRoot, 10);
			
			if (recentCommits.length === 0) {
				vscode.window.showErrorMessage('No commits found in this repository.');
				return;
			}

			const selectedCommit = await vscode.window.showQuickPick(recentCommits, {
				placeHolder: 'Select a commit to review'
			});

			if (!selectedCommit) {
				return; // User cancelled
			}

			selectedCommitHash = selectedCommit.hash;
		}

		// Check if API is configured
		const config = vscode.workspace.getConfiguration('velocityReview');
		const apiUrl = config.get<string>('apiUrl');
		
		if (!apiUrl || apiUrl.trim() === '') {
			const result = await vscode.window.showWarningMessage(
				'API URL is not configured. Would you like to configure it now?',
				'Configure URL',
				'Cancel'
			);
			
			if (result === 'Configure URL') {
				vscode.commands.executeCommand('velocityReview.openConfig');
			}
			return;
		}

		// Show progress indicator
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Starting AI-powered code review...",
			cancellable: false
		}, async (progress) => {
			try {
				progress.report({ increment: 0, message: "Analyzing git repository..." });
				
				// Get detailed commit changes for selected commit
				let commitChanges: DetailedCommitChanges | null;
				if (selectedCommitHash) {
					commitChanges = await getDetailedCommitChangesByHash(workspaceRoot, selectedCommitHash);
				} else {
					commitChanges = await getDetailedCommitChanges(workspaceRoot);
				}
				
				if (!commitChanges) {
					vscode.window.showErrorMessage('No git repository found or no commits available.');
					return;
				}

				progress.report({ increment: 25, message: "Generating review prompt..." });
				
				// Render the prompt template with commit data
				const prompt = await renderPromptTemplate(commitChanges, context.extensionPath);
				
				progress.report({ increment: 50, message: "Calling API..." });
				
				// Get API mode and credentials from configuration
				const apiMode = config.get<string>('apiMode') || 'openai';
				const apiKey = config.get<string>('openaiApiKey') || '';
				
				// Call appropriate API based on mode
				let llmResponse: LLMResponse;
				if (apiMode === 'openai') {
					llmResponse = await callOpenAIAPI(prompt, apiKey);
				} else {
					// Custom URL mode
					if (!apiUrl || apiUrl.trim() === '') {
						vscode.window.showErrorMessage('Custom API URL is not configured. Please configure it in settings.');
						return;
					}
					llmResponse = await callCustomAPI(prompt, apiUrl, commitChanges);
				}
				
				progress.report({ increment: 75, message: "Processing review results..." });
				
				if (!llmResponse.success) {
					vscode.window.showErrorMessage(`LLM API call failed: ${llmResponse.error}`);
					return;
				}

				progress.report({ increment: 90, message: "Displaying results..." });
				
				// Create a new document to display the review results
				const reviewDoc = await vscode.workspace.openTextDocument({
					content: llmResponse.response || 'No response received',
					language: 'markdown'
				});
				
				// Show the review in a new editor
				await vscode.window.showTextDocument(reviewDoc, {
					preview: false,
					viewColumn: vscode.ViewColumn.Beside
				});

				progress.report({ increment: 100, message: "Review complete!" });
				
			} catch (error) {
				console.error('Error during code review:', error);
				vscode.window.showErrorMessage(`Code review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		});

		// Refresh sidebar to show updated results
		await sidebarProvider.refresh();
		
		// Show completion message
		const commitInfo = selectedCommitHash ? `selected commit (${selectedCommitHash.substring(0, 8)})` : 'latest commit';
		vscode.window.showInformationMessage(`AI code review completed for ${commitInfo}! Check the new document for detailed analysis.`);
	});

	// Register config command
	const configCommand = vscode.commands.registerCommand('velocityReview.openConfig', async () => {
		const config = vscode.workspace.getConfiguration('velocityReview');
		const currentMode = config.get<string>('apiMode') || 'openai';
		
		// Show configuration options
		const configOption = await vscode.window.showQuickPick([
			{
				label: '⚙️ Configure API Mode',
				description: 'Choose between OpenAI direct or custom URL',
				detail: `Current: ${currentMode === 'openai' ? 'OpenAI Direct' : 'Custom URL'}`,
				action: 'mode'
			},
			{
				label: '🔗 Configure Custom API URL',
				description: 'Set custom API endpoint URL',
				detail: `Current: ${config.get<string>('apiUrl') || 'Not set'} ${currentMode === 'custom' ? '(Active)' : '(Inactive)'}`,
				action: 'url'
			},
			{
				label: '🔑 Configure OpenAI API Key',
				description: 'Set your OpenAI API key',
				detail: config.get<string>('openaiApiKey') ? 'Current: ****' + config.get<string>('openaiApiKey')!.slice(-4) + ` ${currentMode === 'openai' ? '(Active)' : '(Inactive)'}` : 'Current: Not set',
				action: 'apikey'
			}
		], {
			placeHolder: 'Select configuration option'
		});

		if (!configOption) {
			return;
		}

		if (configOption.action === 'mode') {
			const modeOption = await vscode.window.showQuickPick([
				{
					label: '🤖 OpenAI Direct',
					description: 'Use OpenAI API directly with your API key',
					detail: 'Requires OpenAI API key, calls api.openai.com',
					value: 'openai'
				},
				{
					label: '🔗 Custom URL',
					description: 'Use your own API endpoint',
					detail: 'Calls your custom URL with the prompt data',
					value: 'custom'
				}
			], {
				placeHolder: 'Select API mode'
			});

			if (modeOption) {
				await config.update('apiMode', modeOption.value, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`API mode set to: ${modeOption.label}`);
			}
		} else if (configOption.action === 'url') {
			const currentUrl = config.get<string>('apiUrl') || '';
			
			const newUrl = await vscode.window.showInputBox({
				prompt: 'Enter your custom API URL',
				placeHolder: 'https://your-api.example.com/review',
				value: currentUrl,
				validateInput: (value: string) => {
					if (!value || value.trim() === '') {
						return 'URL cannot be empty';
					}
					
					// Basic URL validation
					try {
						new URL(value);
						return null;
					} catch {
						return 'Please enter a valid URL (e.g., https://your-api.example.com/review)';
					}
				}
			});
			
			if (newUrl !== undefined) {
				await config.update('apiUrl', newUrl.trim(), vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`Custom API URL configured: ${newUrl.trim()}`);
			}
		} else if (configOption.action === 'apikey') {
			const currentApiKey = config.get<string>('openaiApiKey') || '';
			
			const newApiKey = await vscode.window.showInputBox({
				prompt: 'Enter your OpenAI API Key',
				placeHolder: 'sk-...',
				value: currentApiKey,
				password: true,
				validateInput: (value: string) => {
					if (!value || value.trim() === '') {
						return 'API Key cannot be empty';
					}
					
					if (!value.startsWith('sk-')) {
						return 'OpenAI API keys typically start with "sk-"';
					}
					
					if (value.length < 20) {
						return 'API key seems too short';
					}
					
					return null;
				}
			});
			
			if (newApiKey !== undefined) {
				await config.update('openaiApiKey', newApiKey.trim(), vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`OpenAI API Key configured successfully`);
			}
		}
	});

	// Register export changes command
	const exportChangesCommand = vscode.commands.registerCommand('velocityReview.exportChanges', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a project folder.');
			return;
		}

		// Show progress indicator
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Exporting commit changes...",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0, message: "Analyzing git repository..." });
			
			const workspaceRoot = workspaceFolders[0].uri.fsPath;
			const commitChanges = await getDetailedCommitChanges(workspaceRoot);
			
			if (!commitChanges) {
				vscode.window.showErrorMessage('No git repository found or no commits available.');
				return;
			}

			progress.report({ increment: 50, message: "Generating JSON export..." });

			// Generate filename with timestamp and commit hash
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `commit-changes-${commitChanges.commit.shortHash}-${timestamp}.json`;
			
			// Ask user where to save the file
			const saveUri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file(path.join(workspaceRoot, filename)),
				filters: {
					'JSON Files': ['json'],
					'All Files': ['*']
				}
			});

			if (!saveUri) {
				return; // User cancelled
			}

			progress.report({ increment: 75, message: "Writing JSON file..." });

			// Write the JSON file
			const jsonContent = JSON.stringify(commitChanges, null, 2);
			await fs.promises.writeFile(saveUri.fsPath, jsonContent, 'utf8');

			progress.report({ increment: 100, message: "Export complete!" });
		});

		vscode.window.showInformationMessage('Commit changes exported successfully!', 'Open File').then(selection => {
			if (selection === 'Open File') {
				vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, 'commit-changes-*.json')));
			}
		});
	});

	context.subscriptions.push(disposable, refreshCommand, startReviewCommand, configCommand, exportChangesCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
