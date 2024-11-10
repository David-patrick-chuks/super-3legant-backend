// const fs = require('fs');
// const { exec } = require('child_process');


// const fileName = 'commit_boost22.txt'
// let counter = 0;


// // Function to modify the fil
// function modifyFile() {
//   counter++;
//   const content = `Boost Commit #${counter}\n`;

//   // Append content to the file
//   fs.appendFile(fileName, content, (err) => {
//     if (err) {
//       console.error('Error modifying file:', err);
//       return;
//     }
//     console.log(`Modified file: ${content.trim()}`);

//     // Stage and commit the changes
//     exec(`git add ${fileName} && git commit -m "Auto Commit: file change detected #${counter}" && git push`, (err, stdout, stderr) => {
//       if (err) {
//         console.error('Error committing changes:', stderr);
//         return;
//       }
//       console.log(`Committed: Auto Commit #${counter}`);
//     });
//   });
// }

// // Run every 5 seconds (adjust as needed)
// setInterval(modifyFile, 5000);



const fs = require('fs');
const { exec } = require('child_process');

const fileName = 'commit_boost22.txt';
let counter = 0;

// Starting date (January 1st, 2024)
let startDate = new Date('2024-01-01');

function modifyFile() {
  counter++;

  // Increment the date by 1 day for each commit
  let commitDate = new Date(startDate);
  commitDate.setDate(startDate.getDate() + counter - 1);

  // Format date in the format used by Git: "YYYY-MM-DD HH:MM:SS"
  const formattedDate = commitDate.toISOString().split('T').join(' ').split('.')[0];

  const content = `Boost Commit #${counter}\n`;

  // Append content to the file
  fs.appendFile(fileName, content, (err) => {
    if (err) {
      console.error('Error modifying file:', err);
      return;
    }
    console.log(`Modified file: ${content.trim()}`);
    // Set environment variables for Windows (PowerShell syntax
    const commitCommand = `git add . && $env:GIT_COMMITTER_DATE="${formattedDate}"; git commit --date "${formattedDate}" -m "commit boost #${counter}" `;

    exec(commitCommand, (err, stdout, stderr) => {
      if (err) {
        console.error('Error committing changes:', stderr);
        return;
      }
      console.log(`Committed: Auto Commit #${counter} on ${formattedDate}`);
    });
  });
}

// Run every 5 seconds (adjust as needed)
setInterval(modifyFile, 5000);


////fdjhfndkf d
////fdjhfndkf d
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd
////fdjhfndkf dfkd