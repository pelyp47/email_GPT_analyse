# Initial setup

Download packages via executing ```npm install``` in terminal (root folder)

Download himalaya 1.0.0-beta.4

# .env
```OPEN_API_TOKEN``` - project token given by OpenAI

```HIMALAYA_PATH``` - the location of downloaded himalaya command script. You can call ```type himalaya``` in terminal to find out the location of executable script *(if you downloaded the repo, use pathToProj/target/debug/himalaya)*. The path you are inserting in ```HIMALAYA_PATH``` shoud be absolute.  Please make sure himalaya 1.0.0-beta.4 is downloaded properly.

```DATE_TO``` - the filter option which gives an oportunity to select emails before specific date. Format: ```"[number ]day|month|year|now" | "yyyy-mm-dd" | ""```. *Empty string is considered as "now". EX: "2 year", "2024-06-10", "", "now", "month".

```DATE_FROM``` = the filter option which gives an oportunity to select emails after specific date. Format: ```"[number ]day|month|year|now" | "yyyy-mm-dd" | ""```. *Empty string is considered as "now". EX: "2 year", "2024-06-10", "", "now", "month".

```BEFORE_PROMPT``` - text in the prompt to chatGPT, which will be before the emails content. Pls include the info for ChatGpt that prompt will be splitted into smaller pieces.

```AFTER_PROMPT``` - text in the prompt to chatGPT, which will be after the emails content. Pls include the info for ChatGpt that prompt sequence is ended.

# StartUp
***In root directory: ```node index```***

The workflow:

The emails gotten from himalaya are combined in large text

The text from previous step is sent to chatGPT by chunks

The result will show up in console


***In root directory: ```node index --fast```***

The workflow:

Skips the build step

Sends emails which were sent during the previous time

The result will be in console