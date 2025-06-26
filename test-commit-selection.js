const { simpleGit } = require('simple-git');
const path = require('path');

// Test the commit selection functionality with the RedditModHelper project
async function testCommitSelection() {
    console.log('🚀 Testing Commit Selection Feature with RedditModHelper Project\n');
    
    const workspaceRoot = path.join(__dirname, 'sample-project');
    const git = simpleGit(workspaceRoot);
    
    try {
        // Check if it's a git repository
        const isRepo = await git.checkIsRepo();
        console.log(`📁 Is Git Repository: ${isRepo}`);
        
        if (!isRepo) {
            console.log('❌ Not a git repository');
            return;
        }
        
        // Get recent commits (simulating the getRecentCommits function)
        console.log('\n📋 Recent Commits Available for Selection:');
        console.log('=' .repeat(60));
        
        const log = await git.log({ maxCount: 10 });
        
        for (let i = 0; i < log.all.length; i++) {
            const commit = log.all[i];
            
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
            
            // Format like the extension would show
            const label = `${i === 0 ? '🔥 ' : '   '}${shortHash} - ${commit.message}`;
            const description = `by ${commit.author_name} on ${date}`;
            const detail = `${filesChanged} files, ${linesChanged} lines changed`;
            
            console.log(label);
            console.log(`   ${description}`);
            console.log(`   ${detail}`);
            console.log('');
        }
        
        // Test detailed analysis of a specific commit
        console.log('\n🔍 Testing Detailed Analysis of Latest Commit:');
        console.log('=' .repeat(60));
        
        const latestCommit = log.latest;
        if (latestCommit) {
            console.log(`Commit Hash: ${latestCommit.hash}`);
            console.log(`Short Hash: ${latestCommit.hash.substring(0, 8)}`);
            console.log(`Message: ${latestCommit.message}`);
            console.log(`Author: ${latestCommit.author_name} <${latestCommit.author_email}>`);
            console.log(`Date: ${latestCommit.date}`);
            
            // Get diff summary
            try {
                const diffSummary = await git.diffSummary([`${latestCommit.hash}^`, latestCommit.hash]);
                console.log(`\nFiles Changed: ${diffSummary.files.length}`);
                console.log(`Lines Added: ${diffSummary.insertions}`);
                console.log(`Lines Removed: ${diffSummary.deletions}`);
                console.log(`Total Changes: ${diffSummary.insertions + diffSummary.deletions}`);
                
                console.log('\nChanged Files:');
                diffSummary.files.forEach(file => {
                    const additions = 'insertions' in file ? file.insertions : 0;
                    const deletions = 'deletions' in file ? file.deletions : 0;
                    console.log(`  📄 ${file.file} (+${additions}/-${deletions})`);
                });
                
            } catch (error) {
                console.log('Note: This appears to be an initial commit with no parent');
            }
        }
        
        // Test selecting a specific commit (simulate selecting the 3rd commit)
        if (log.all.length >= 3) {
            console.log('\n🎯 Testing Analysis of Selected Commit (3rd in list):');
            console.log('=' .repeat(60));
            
            const selectedCommit = log.all[2]; // 3rd commit (0-indexed)
            console.log(`Selected: ${selectedCommit.hash.substring(0, 8)} - ${selectedCommit.message}`);
            
            try {
                const diffSummary = await git.diffSummary([`${selectedCommit.hash}^`, selectedCommit.hash]);
                console.log(`Files Changed: ${diffSummary.files.length}`);
                console.log(`Lines Added: ${diffSummary.insertions}`);
                console.log(`Lines Removed: ${diffSummary.deletions}`);
                
                // Show first few lines of diff for demonstration
                if (diffSummary.files.length > 0) {
                    const firstFile = diffSummary.files[0];
                    const fileDiff = await git.diff([`${selectedCommit.hash}^`, selectedCommit.hash, '--', firstFile.file]);
                    console.log(`\nSample diff from ${firstFile.file}:`);
                    console.log(fileDiff.split('\n').slice(0, 10).join('\n'));
                    if (fileDiff.split('\n').length > 10) {
                        console.log('... (truncated for display)');
                    }
                }
            } catch (error) {
                console.log('Note: Could not analyze this commit (may be initial commit)');
            }
        }
        
        console.log('\n✅ Commit Selection Feature Test Complete!');
        console.log('\nThis demonstrates how the extension would:');
        console.log('1. 🔥 Show latest commit with fire emoji');
        console.log('2. 📋 List recent commits with rich information');
        console.log('3. 🎯 Allow selection of any commit for detailed analysis');
        console.log('4. 📊 Generate comprehensive JSON data for AI review');
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

// Run the test
testCommitSelection().catch(console.error);
