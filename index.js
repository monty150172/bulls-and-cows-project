const prompt = require("prompt-sync")({ sigint: true });
const colors = require("colors");
const readline = require("readline");

console.clear();

let rulesMessage = `Gameplay looks so: you enter your guess code, 
computer compares it with the secret code and gives you two clues: 
numbers of "bulls" and "cows". 
What does this mean? A bull is a digit which is present in both 
the codes in the same position. And a cow is a digit which is 
present in both the codes in a different position. 

For example, if the secret code is 2056 and you ask 9516, 
an answer will be "one bull and one cow" 
(but you won't know which digit is a bull 
and which digit is a cow). 

That's all!`;

let cheerMessage = [
    "Just a friendly reminder that I believe in you.".rainbow,
    "I predict a big win at the next guess".rainbow,
    "Crossing my fingers for you! Go, go, go".rainbow,
];

let findTheUser = prompt("What's your name: ".rainbow);

let winnerMessage = colors.bold.magenta(`
 ____                            _         _ _ _ 
/ ___|___  _ __   __ _ _ __ __ _| |_ ___  | | | |
| |   / _ \\| '_ \\ / _\` | '__/ _\` | __/ __| | | | |
| |__| (_) | | | | (_| | | | (_| | |\\__ \\ |_|_|_|
 \\____\\___/|_| |_|\\__, |_|  \\__,_|\\__|___/ (___/                           
                    _) )
                    ___`);

console.log(
    colors.bold.magenta(`
__        __   _                            _                     
\\ \\      / /__| | ___ ___  _ __ ___   ___  | |_ ___               
 \\ \\ /\\ / / _ \\ |/ __/ _ \\| '_ \` _ \\ / _ \\ | __/ _ \\              
  \\ V  V /  __/ | (_| (_) | | | | | |  __/ | || (_) |             
 __\\_/\\_/ \\___|_|\\___\\___/|_| |_| |_|\\___|  \\__\\___/              
| __ ) _   _| | |___    __ _ _ __   __| |  / ___|_____      _____ 
|  _ \\| | | | | / __|  / _\` | '_ \\ / _\` | | |   / _ \\ \\ /\\ / / __|
| |_) | |_| | | \\__ \\ | (_| | | | | (_| | | |__| (_) \\ V  V /\\__ \\
|____/ \\__,_|_|_|___/  \\__,_|_| |_|\\__,_|  \\____\\___/ \\_/\\_/ |___/
`)
);

function getRandomNumberNoRepeat(level) {
    let numberPick = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return numberPick
        .sort(() => Math.random() - 0.5)
        .join("")
        .slice(0, level);
}

function levelSelector() {
    let level = prompt(
        "Choose your level easy, medium, hard, or extreme: ".rainbow
    );
    switch (level.toLowerCase()) {
        case "easy":
            return 4;
        case "medium":
            return 6;
        case "hard":
            return 7;
        case "extreme":
            return 9;
        default:
            console.log(
                "Invalid level. Please choose easy, medium, hard, or extreme."
                    .rainbow
            );
            return false;
    }
}

function askForTheRules() {
    let question = prompt(
        `Do you know the rules of the game ${findTheUser}? (Y/N): `.rainbow
    );
    console.clear();
    if (question.toUpperCase() === "N") {
        console.log(`\n${rulesMessage}\n\nLet's go ${findTheUser}\n`.rainbow);
    } else {
        console.log(`\nLet's go ${findTheUser}`.rainbow);
    }
}

function waitForSpace() {
    console.log("Press Space to continue...".rainbow);
    return new Promise((resolve) => {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on("keypress", (str, key) => {
            if (key.name === "space") {
                process.stdin.setRawMode(false);
                process.stdin.removeAllListeners("keypress");
                resolve();
            }
        });
    });
}

function randomMessage() {
    return cheerMessage[Math.floor(Math.random() * cheerMessage.length)];
}

function playAgain() {
    return new Promise((resolve) => {
        let playAgainTheGame = "";
        while (
            !(
                playAgainTheGame.toUpperCase() === "Y" ||
                playAgainTheGame.toUpperCase() === "N"
            )
        ) {
            playAgainTheGame = prompt(
                "Do you want to play again? (Y/N): ".rainbow
            );
            if (playAgainTheGame.toUpperCase() === "Y") {
                resolve(true);
            } else if (playAgainTheGame.toUpperCase() === "N") {
                console.log(`\nThanks for playing ${findTheUser}`.rainbow);
                resolve(false);
            } else {
                console.log("Please enter Y or N.".rainbow);
            }
        }
    });
}

function validGuess(guess, level) {
    if (guess.length !== level) {
        console.log(
            `Invalid number length. You need to enter a ${level}-digit number.`
                .red
        );
        return false;
    }

    let noRepeatInputCheck = guess.split("").sort((a, b) => a - b);
    if (new Set(noRepeatInputCheck).size !== level) {
        console.log("Each number should be unique!".yellow);
        return false;
    }

    if (!checkIfOnlyNumbers(guess)) {
        console.log("Only numbers are allowed!".red);
        return false;
    }
    return true;
}

function checkIfOnlyNumbers(guess) {
    for (var i = 0; i < guess.length; i++) {
        if (isNaN(parseInt(guess[i]))) {
            return false;
        }
    }
    return true;
}

async function playTheGame(level) {
    let secretNumber = getRandomNumberNoRepeat(level);
    let attempts = 0;
    console.log("\n");
    while (true) {
        let guess = prompt("Your Guess: ".rainbow);
        if (!validGuess(guess, level)) {
            continue;
        }
        attempts++;
        if (secretNumber === guess) {
            console.log(
                attempts === 1
                    ? `You won at your first attempt. Well done, ${findTheUser}!`
                          .rainbow
                    : `You won after ${attempts} attempts. Very well done, ${findTheUser}!`
                          .rainbow
            );
            console.log(winnerMessage);
            break;
        }

        let cows = 0;
        let bulls = 0;
        for (let i = 0; i < secretNumber.length; i++) {
            if (secretNumber[i] === guess[i]) {
                bulls++;
            } else if (secretNumber.includes(guess[i])) {
                cows++;
            }
        }
        if (bulls === 0 && cows === 0) {
            console.log("\n", randomMessage(), "\n");
        }
        console.log(
            colors.magenta(
                `You found 🐮 ${cows} ${
                    cows === 1 ? "cow" : "cows"
                } and 🦬  ${bulls} ${bulls === 1 ? "bull" : "bulls"}.`
            )
        );
    }
}

async function start() {
    let play = true;
    while (play) {
        let level = levelSelector();
        if (level !== false) {
            askForTheRules();
            await waitForSpace();
            await playTheGame(level);
            play = await playAgain();
        }
    }
}

start();
