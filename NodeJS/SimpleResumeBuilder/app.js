// Import file system module
const fs = require("fs");
const readline = require('readline');

// Init questions to ask
const questions = [
    "FULL NAME",
    "EMAIL",
    "LINKEDIN PROFILE LINK",
    "SUMMARY",
    "SKILLS",
    "LANGUAGES",
    "NUM OF EDUCATION",
    "NUM OF EXPERIENCES",
];

console.log("\n\n\n\n----------------------------------------------------------------------")
console.log("Welcome to the Simple Resume Builder!");
console.log("Please answer the following questions to create your resume.");
console.log("For multiple items (like skills or languages), separate them with commas.");
console.log("(Type '.exit' to quit at any time)")

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask function (prints formatted questions)
function ask(question) {
    return new Promise((resolve) => {
        rl.question(`\n${question}\n:`, (answer) => {
            if (answer.toLowerCase() === '.exit') {
                console.log("Exiting the program...");
                process.exit(0);
            }
            resolve(answer.trim());
        });
    });
}

async function getEducationDetails(num) {
    let educationDetails = [];
    for (let i = 0; i < num; i++) {
        console.log(`\nEducation ${i + 1}`);
        let school = await ask("School Name");
        let startDate = await ask("Start Date");
        let endDate = await ask("End Date");
        let summary = await ask("Summary");
        educationDetails.push({ school, startDate, endDate, summary });
    }
    return educationDetails;
}

async function getExperienceDetails(num) {
    let experienceDetails = [];
    for (let i = 0; i < num; i++) {
        console.log(`\nExperience ${i + 1}`);
        let company = await ask("Company Name");
        let position = await ask("Position");
        let startDate = await ask("Start Date");
        let endDate = await ask("End Date");
        let summary = await ask("Summary");
        experienceDetails.push({ company, position, startDate, endDate, summary });
    }
    return experienceDetails;
}

async function main() {
    let name = await ask(questions[0]);
    // Sanitize the file name to avoid invalid characters
    let sanitizedFileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let fileName = `./${sanitizedFileName}_simple_resume.md`;

    // If the file name already exists, delete the original file to make a new one
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    let answerStream = fs.createWriteStream(fileName);
    answerStream.write(`# ${name}\n\n`);

    for (let i = 1; i < questions.length; i++) {
        let answer = await ask(questions[i]);

        switch(questions[i]) {
            case "EMAIL":
                answerStream.write(`**Email:** ${answer}\n\n`);
                break;
            case "LINKEDIN PROFILE LINK":
                answerStream.write(`**LinkedIn:** ${answer}\n\n`);
                break;
            case "SUMMARY":
                answerStream.write(`## Summary\n${answer}\n\n`);
                break;
            case "SKILLS":
                answerStream.write(`## Skills\n${answer}\n\n`);
                break;
            case "LANGUAGES":
                answerStream.write(`## Languages\n${answer}\n\n`);
                break;
            case "NUM OF EDUCATION":
                if (parseInt(answer) === 0) {
                    break;
                }
                answerStream.write(`## Education\n`);
                let educationDetails = await getEducationDetails(parseInt(answer));
                educationDetails.forEach(edu => {
                    answerStream.write(`### ${edu.school}\n`);
                    answerStream.write(`${edu.startDate} - ${edu.endDate}\n`);
                    answerStream.write(`${edu.summary}\n\n`);
                });
                break;
            case "NUM OF EXPERIENCES":
                if (parseInt(answer) === 0) {
                    break;
                }  
                answerStream.write(`## Experience\n`);
                let experienceDetails = await getExperienceDetails(parseInt(answer));
                experienceDetails.forEach(exp => {
                    answerStream.write(`### ${exp.position} at ${exp.company}\n`);
                    answerStream.write(`${exp.startDate} - ${exp.endDate}\n`);
                    answerStream.write(`${exp.summary}\n\n`);
                });
                break;
            default:
                answerStream.write(`${questions[i]}: ${answer}\n\n`);
        }
    }

    rl.close();
    answerStream.end();

    console.log("\n\n\n\n");
    console.log(`Resume Building Complete`);
    console.log("\n\n\n\n");
}

main().catch(err => {
    console.error("An error occurred:", err);
    process.exit(1);
});
