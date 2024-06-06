import { GameStage } from "jsge";

const MATCH = {
    NO_MATCH: 0,
    MATCH: 1,
    MATCH_POS: 2
}
export class WordsGame extends GameStage {
    #letterCardSpaces;
    #letterCardSize;
    #letterNum = 0;
    #attempts = 0;
    #currentAttempt = 1;

    /**
     * @type {string}
     */
    #currentWord = "";

    #wordList;

    #rows = [];

    /**
     * @type {string}
     */
    #guessWord = "";

    #win = false;
    #loose = false;
    register() {
        const settings = this.systemSettings.customSettings;
        this.iLoader.registerLoader("Words", (key, url) => fetch(url).then(response => response.text()));
        this.iLoader.addWords("englishNouns", settings.words_list_url);
        this.#letterNum = settings.letterNum;
        this.#attempts = settings.attempts;
        this.#letterCardSize = settings.letterCardSize;
        this.#letterCardSpaces = settings.letterCardSpaces;
    }

    init() {
        const letterNum = this.#letterNum,
            letterCardSize = this.#letterCardSize,
            letterCardSpace = this.#letterCardSpaces,
            attempts = this.#attempts,
            w = letterNum * letterCardSize + ((letterNum - 1) * letterCardSpace),
            h = attempts * letterCardSize + ((attempts - 1) * letterCardSpace);
        
        this.systemSettings.canvasMaxSize.width = w;
        this.systemSettings.canvasMaxSize.height = h;

        const allWords = this.iLoader.getWords("englishNouns");
        // filter letters with letters number: this.#letterNum
        this.#wordList = allWords.split("\r\n").filter((word) => word.length === letterNum);
        
        this.#guessWord = this.#randomWord(this.#wordList);
        
        console.log(this.#guessWord);
        for (let i = 0; i < this.#attempts; i++) {
            const row = [],
                marginTop = i * letterCardSize + (i > 0 ? i * this.#letterCardSpaces : 0);
            for (let j = 0; j < this.#letterNum; j++) {
                const marginLeft = j * letterCardSize + (j > 0 ? j *this.#letterCardSpaces : 0);
                const letterCard = this.draw.rect(marginLeft, marginTop, letterCardSize, letterCardSize, "rgba(0, 0, 0, 1)");
                
                row.push({letter: null, card: letterCard});
            }
            this.#rows.push(row);
        }
    }

    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        const canvas = this.canvasHtmlElement; 
        canvas.addEventListener("mousemove", this.#mouseHoverEvent);            
        document.addEventListener("click", this.#mouseClickEvent);
        document.addEventListener("keydown", this.#pressKeyboardButton);
    }

    #mouseHoverEvent = (event) => {
    };

    #mouseClickEvent = (event) => {
        const button = event.target.dataset;

        switch (button.action) {
            case "input":
                const letter = button.value;
                this.#pressKeyButton(letter);
                break;
            case "clear":
                this.#pressBackButton();
                break;
            case "confirm":
                this.#pressConfirmButton();
                break;
        }
    }

    #isWordExist = (word) => {
        return this.#wordList.find((wordInList) => wordInList === word);
    }

    #checkWord = (word) => {
        const len = this.#letterNum,
            currentRowIndex = this.#currentAttempt - 1;

        let matchIndexesInput = [],
            matchIndexesGuess = [];
        for (let i = 0; i < len; i++) {
            const inputLetter = word[i],
                //uniqMatchIndex = Array.from(this.#guessWord.word).findIndex((letter, index) => (letter === inputLetter) && (this.#guessWord.isWordChecked(index) === false)), 
                guessLetter = this.#guessWord[i],
                letterCard = this.#rows[currentRowIndex][i];
            if (inputLetter === guessLetter) {
                letterCard.card.bgColor = "rgba(253, 208, 53, 1)";
                letterCard.letter.fillStyle = "rgba(0, 0, 0, 1)";
                matchIndexesInput.push(i);
                matchIndexesGuess.push(i);
            }
        }
        for (let j = 0; j < len; j++) {
            if (!matchIndexesInput.includes(j)) {
                const inputLetter = word[j],
                    letterCard = this.#rows[currentRowIndex][j];

                const guessIndex = this.#guessWord.split("").findIndex((letter, index) => ((letter === inputLetter) && (!matchIndexesGuess.includes(index))));
                
                if (guessIndex !== -1) {
                    letterCard.card.bgColor = "rgba(211, 211, 211, 1)";
                    letterCard.letter.fillStyle = "rgba(0, 0, 0, 1)";
                    matchIndexesInput.push(j);
                    matchIndexesGuess.push(guessIndex);
                } else {
                    const noMatch = this.#guessWord.indexOf(inputLetter) === -1;
                    letterCard.card.bgColor = "rgba(51, 51, 51, 1)";
                    if (noMatch) {
                        this.#markButton(inputLetter);
                    }
                }
            }
        }
    }

    #increaseAttempt() {
        if (this.#currentAttempt === this.#attempts) {
            alert("No more attempts! Game over!!!");
            this.#loose = true;
        } else {
            this.#currentAttempt += 1;
            this.#currentWord = "";
        }
    }

    #markButton = (letter) => {
        const keyboardLetter = document.querySelector(`[data-value="${letter}"]`);
        
        keyboardLetter.classList.add("marked");
    }

    #loaderErrorHandler = (error) => {
        console.log("--->>>>error");
        console.log(error);
    }

    unregisterEventListeners() {
    }

    #pressKeyButton = (letter) => {
        const currentWord = this.#currentWord,
            currentLetterLength = currentWord.length,
            confirmButton = document.getElementById("confirm"),
            currentRowIndex = this.#currentAttempt - 1,
            letterCard = this.#rows[currentRowIndex][currentLetterLength - 1],
            nextLetter = this.#rows[currentRowIndex][currentLetterLength],
            nextLetterCard = nextLetter ? nextLetter.card : null;

        if (currentLetterLength !== this.#letterNum) {
            this.#currentWord += letter;
            this.#rows[currentRowIndex][currentLetterLength].letter = this.draw.text(nextLetterCard.x + nextLetterCard.width / 4, nextLetterCard.y + nextLetterCard.height - nextLetterCard.height / 10, letter, "50px sans-serif", "white");
            if (currentLetterLength + 1 === this.#letterNum) {
                confirmButton.disabled = false;
            }
        }
    }

    #pressBackButton = () => {
        const currentLetterLength = this.#currentWord.length,
            confirmButton = document.getElementById("confirm"),
            currentRowIndex = this.#currentAttempt - 1,
            letterCard = this.#rows[currentRowIndex][currentLetterLength - 1];

        if (currentLetterLength > 0) {
            letterCard.letter.destroy();
            letterCard.letter = null;
            this.#currentWord = this.#currentWord.slice(0, -1);
        }
        if (confirmButton.disabled === false) {
            confirmButton.disabled = true;
        }
    }

    #pressConfirmButton = () => {
        const currentWord = this.#currentWord,
            confirmButton = document.getElementById("confirm");

        if (this.#isWordExist(currentWord)) {
            //word exist check it
            this.#checkWord(currentWord);
            if (currentWord === this.#guessWord) {
                this.#win = true;
                setTimeout(() => alert("you win!!"), 500);
            } else {
                this.#increaseAttempt();
                confirmButton.disabled = true;
            }
        } else {
            alert("Please enter english verb!");
        }
    }

    #pressKeyboardButton = (event) => {
        const buttonKey = event.key;
        switch (buttonKey) {
            case "q":
            case "w":
            case "e":
            case "r":
            case "t":
            case "y": 
            case "u":
            case "i":
            case "o":
            case "p":
            case "a":
            case "s":
            case "d":
            case "f":
            case "g":
            case "h":
            case "j":
            case "k":
            case "l":
            case "z":
            case "x":
            case "c":
            case "v":
            case "b":
            case "n":
            case "m":
                this.#pressKeyButton(buttonKey);
                break;
            case "Backspace":
                this.#pressBackButton();
                break;
            case "Enter":
                console.log("confirm");
                this.#pressConfirmButton();
                break;
        }
    };

    #randomWord = (words) => {
        const len = words.length;
        const randIndex = Math.floor(Math.random() * len);
        return words[randIndex];
    }
}