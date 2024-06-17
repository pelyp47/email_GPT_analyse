# Initial setup

Download packages via executing ```npm install``` in terminal (root folder)

# .env
```OPEN_API_TOKEN``` - project token given by OpenAI

```PAGE_SIZE``` - the max amount of emails that could possibly be sent+gotten in 1 month

```BEFORE_PROMPT``` - text in the prompt to chatGPT, which will be before the emails content. Pls include the info for ChatGpt that prompt will be splitted into smaller pieces.

```AFTER_PROMPT``` - text in the prompt to chatGPT, which will be after the emails content. Pls include the info for ChatGpt that prompt sequence is ended.

# StartUp
***In root directory: ```node index```***

The workflow:

input the command in himalaya terminal ```himalaya list -o=json --page-size=...```, which will be displayed in console

the result of command (email object/objects) put in ```messages.json``` in root folder

print ```yes``` in node console

input the command in himalaya terminal ```himalaya -o=json read ...```, which will be displayed in console

the result of command (email/emails contert) paste in ```text.json``` in root folder

print ```yes``` in node console

the result of prompt will be printed in console


***In root directory: ```node index --fast```***

The workflow:

*the text.json in root folder should be filled with email/emails content

the result of prompt will be printed in console