const { simpleGit } = require('simple-git');

async function testGitFunctionality() {
    try {
        const git = simpleGit('.');
        
        // Check if this is a git repository
        const isRepo = await git.checkIsRepo();
        console.log('Is Git Repository:', isRepo);
        
        if (!isRepo) {
            console.log('Not a git repository');
            return;
        }

        // Get the latest commit
        const log = await git.log({ maxCount: 1 });
        console.log('Latest commit found:', log.all.length > 0);
        
        if (log.all.length === 0) {
            console.log('No commits found');
            return;
        }

        const latestCommit = log.latest;
        console.log('\n=== LATEST COMMIT INFO ===');
        console.log('Hash:', latestCommit.hash.substring(0, 8));
        console.log('Message:', latestCommit.message);
        console.log('Author:', latestCommit.author_name);
        console.log('Date:', new Date(latestCommit.date).toLocaleString());

        // Get diff stats for the latest commit
        const diffSummary = await git.diffSummary([`${latestCommit.hash}^`, latestCommit.hash]);
        
        console.log('\n=== DIFF STATS ===');
        console.log('Files Changed:', diffSummary.files.length);
        console.log('Lines Added:', diffSummary.insertions);
        console.log('Lines Removed:', diffSummary.deletions);
        
        console.log('\n=== CHANGED FILES ===');
        diffSummary.files.forEach(file => {
            console.log(`- ${file.file} (+${file.insertions}/-${file.deletions})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testGitFunctionality();
