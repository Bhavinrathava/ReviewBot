// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { simpleGit, SimpleGit, DiffResult } from 'simple-git';
import * as path from 'path';

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

	context.subscriptions.push(disposable, refreshCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
