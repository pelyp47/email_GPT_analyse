const fs = require('fs');
const dotenv = require('dotenv')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// const path = require('path')

dotenv.config()


// Specify the path to your JSON file containing email data
const jsonFilePath = './messages.json';

function calculateDateQuery(input, type) {
    let currentDate = new Date();

    if (input.toLowerCase() === 'now' || input.trim() === '') {
        let year = currentDate.getFullYear();
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let day = String(currentDate.getDate()).padStart(2, '0');
        return `${type} ${year}-${month}-${day}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        currentDate = new Date(input);
    } else {
        let matches = input.match(/^(\d+)\s*(month|year|day)$/);
        if (matches) {
            let number = parseInt(matches[1]);
            let unit = matches[2];

            if (unit === 'month') {
                currentDate.setMonth(currentDate.getMonth() - number);
            } else if (unit === 'year') {
                currentDate.setFullYear(currentDate.getFullYear() - number);
            } else if (unit === 'day') {
                currentDate.setDate(currentDate.getDate() - number);
            }
        } else {
            return ""
        }
    }

    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');

    return `${type} ${year}-${month}-${day}`;
}

function extractIds(emails) {
    return process.env.HIMALAYA_PATH+ " -o=json message read "+ emails.map(email => email.id).join(' ')+" > ./text.json";
}



// Function to read input from file
function readFileContent(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

// Function to send prompt to OpenAI's ChatGPT API
async function sendMessageToChatGPT(prompt) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = process.env.OPEN_API_TOKEN;

    const chunkSize = 4000;
    const chunks = [];
    for (let i = 0; i < prompt.length; i += chunkSize) {
        chunks.push(prompt.slice(i, i + chunkSize));
    }

    // Array to store all responses
    const responses = [];

    // Iterate through chunks and send requests
    for (let i=0; i< chunks.length; i++) {
        process.stdout.moveCursor(-`${i}/${chunks.length}`.length, 0)
        process.stdout.clearLine(1)
        process.stdout.write(`${i}/${chunks.length}`)
    const chunk = chunks[i]
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: `${i} prompt: ${chunk}` }],
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    responses.push(responseData.choices[0].message.content.trim());
    }
    console.log(responses.join(' '))
}

// Main function to coordinate the steps
async function main() {

    try {
       if(!process.argv.includes("--fast")) {
            // console.log(`messages.json <= himalaya list -o=json --page-size=${process.env.PAGE_SIZE}`);
            await exec(`${process.env.HIMALAYA_PATH} -o=json envelope list ${calculateDateQuery(process.env.DATE_TO, "before")} and ${calculateDateQuery(process.env.DATE_FROM, "after")} > ./messages.json`)
            const emails = await readFileContent("messages.json")
            const command = extractIds(JSON.parse(emails))
            await exec(command)
            const text = await readFileContent("text.json")
            sendMessageToChatGPT(process.env.BEFORE_PROMPT+text+process.env.AFTER_PROMPT)
            
       } else {
        const text = await readFileContent("text.json")
        sendMessageToChatGPT(text)
       }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();