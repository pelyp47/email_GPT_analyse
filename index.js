const fs = require('fs');
const prompt = require('prompt-sync')();
const dotenv = require('dotenv')
const readline = require('readline');

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getUserApproval() {
  return new Promise((resolve) => {
    rl.question('Do you want to proceed? (yes/no) ', (answer) => {
      resolve(answer.toLowerCase());
    });
  });
}
// Specify the path to your JSON file containing email data
const jsonFilePath = './messages.json';

function filterObjectsByDateRange(objects) {
    const today = new Date();
  
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
    const filteredObjects = objects.filter(obj => {
      return new Date(obj.date) >= startDate && new Date(obj.date) <= today;
    });
  
    return filteredObjects;
  }

function extractIds(emails) {
    return "text.json <= himalaya -o=json read "+ filterObjectsByDateRange(emails).map(email => email.id).join(' ');
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
        console.log(`messages.json <= himalaya list -o=json --page-size=${process.env.PAGE_SIZE}`);
        const approval = await getUserApproval()
        if (approval=="yes") {
            const emails = await readFileContent("messages.json")
            const command = extractIds(JSON.parse(emails))
            console.log(command)
            const approval1 = await getUserApproval()
            if(approval1=="yes") {
                const text = await readFileContent("text.json")
                sendMessageToChatGPT(process.env.BEFORE_PROMPT+text+process.env.AFTER_PROMPT)
            }
        }
       } else {
        const text = await readFileContent("text.json")
        sendMessageToChatGPT(text)
       }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();