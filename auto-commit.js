
const exec = require('child_process').exec;
exec('git add . && git commit -m "Auto-commit: file change detected" && git push', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error: ${err.message}`);
    } else {
        console.log("Changes committed and pushed:", stdout);
    }
});