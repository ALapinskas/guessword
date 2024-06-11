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
    #blockControllers = false;
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
        
        for (let i = 0; i < this.#attempts; i++) {
            const row = [],
                marginTop = i * letterCardSize + (i > 0 ? i * this.#letterCardSpaces : 0);
            for (let j = 0; j < this.#letterNum; j++) {
                const marginLeft = j * letterCardSize + (j > 0 ? j *this.#letterCardSpaces : 0);
                const letterCard = this.draw.rotateYObject(marginLeft, marginTop, letterCardSize, letterCardSize, "rgba(0, 0, 0, 1)");
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
        if (this.#win || this.#loose || this.#blockControllers) {
            return false;
        }
        if (button.action) {
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
        } else {
            console.log("clicked something else");
            // popup logic here
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
        let cardsColored = [];
        for (let i = 0; i < len; i++) {
            const inputLetter = word[i],
                //uniqMatchIndex = Array.from(this.#guessWord.word).findIndex((letter, index) => (letter === inputLetter) && (this.#guessWord.isWordChecked(index) === false)), 
                guessLetter = this.#guessWord[i],
                letterCard = this.#rows[currentRowIndex][i];
            if (inputLetter === guessLetter) {
                //letterCard.card.bgColor = "rgba(253, 208, 53, 1)";
                //letterCard.letter.fillStyle = "rgba(0, 0, 0, 1)";
                matchIndexesInput.push(i);
                matchIndexesGuess.push(i);
                letterCard.color = "yellow";
                letterCard.index = i;
                cardsColored.push(letterCard);
            }
        }
        for (let j = 0; j < len; j++) {
            if (!matchIndexesInput.includes(j)) {
                const inputLetter = word[j],
                    letterCard = this.#rows[currentRowIndex][j];

                const guessIndex = this.#guessWord.split("").findIndex((letter, index) => ((letter === inputLetter) && (!matchIndexesGuess.includes(index))));
                
                if (guessIndex !== -1) {
                    //letterCard.card.bgColor = "rgba(211, 211, 211, 1)";
                    //letterCard.letter.fillStyle = "rgba(0, 0, 0, 1)";
                    matchIndexesInput.push(j);
                    matchIndexesGuess.push(guessIndex);

                    letterCard.color = "light-grey";
                    letterCard.index = j;
                    cardsColored.push(letterCard);
                } else {
                    const noMatch = this.#guessWord.indexOf(inputLetter) === -1;
                    //letterCard.card.bgColor = "rgba(51, 51, 51, 1)";
                    //letterCard.card
                    letterCard.color = "dark-grey";
                    letterCard.index = j;
                    cardsColored.push(letterCard);
                    if (noMatch) {
                        this.#markButton(inputLetter);
                    }
                }
            }
        }
        cardsColored.sort((a, b) => a.index - b.index);
        
        return cardsColored;
    }

    #increaseAttempt() {
        if (this.#currentAttempt === this.#attempts) {
            alert("Игра закончена!!! Загаданное слово: " + this.#guessWord);
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
            nextLetter = this.#rows[currentRowIndex][currentLetterLength],
            nextLetterCard = nextLetter ? nextLetter.card : null;

        if (currentLetterLength !== this.#letterNum) {
            this.#currentWord += letter;
            this.#rows[currentRowIndex][currentLetterLength].letter = this.draw.rotateYText(nextLetterCard.x + nextLetterCard.width / 3.2, nextLetterCard.y + nextLetterCard.height - nextLetterCard.height / 10, letter, "50px sans-serif", "white");
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
            this.#blockControllers = true;
            //word exist check it
            const cardsColored = this.#checkWord(currentWord);
            cardsColored.sort();
            this.#openCards(cardsColored).then(() => {
                this.#blockControllers = false;
                if (currentWord === this.#guessWord) {
                    this.#win = true;
                    setTimeout(() => alert("Вы победили!!"), 500);
                } else {
                    this.#increaseAttempt();
                    confirmButton.disabled = true;
                }
            });
        } else {
            alert("Введите английское существительное!");
        }
    }

    #pressKeyboardButton = (event) => {
        const buttonKey = event.key;
        if (this.#win || this.#loose || this.#blockControllers) {
            return false;
        }
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

    #openCards = async(cardsColored) => {
        for (let i = 0; i < cardsColored.length; i++) {
            const element = cardsColored[i];
            
            await this.#openCard(element);
        }
        return Promise.resolve();
    }

    #openCard = async (el) => {
        return new Promise((resolve, reject) => {
            const color = el.color,
            card = el.card,
            letter = el.letter;
            
            let isDone = false;
            const rotate = setInterval(() => {
                if (card.rotation >= Math.PI) {
                    clearInterval(rotate);
                    resolve();
                }
                if (card.rotation >= Math.PI / 2) {
                    letter.rotateClockWise();
                    
                    switch (color) {
                        case "yellow":
                            letter.fillStyle = "rgba(0, 0, 0, 1)";
                            card.bgColor = "rgba(253, 208, 53, 1)";
                            break;
                        case "light-grey":
                            letter.fillStyle = "rgba(0, 0, 0, 1)";
                            card.bgColor = "rgba(211, 211, 211, 1)";
                            break;
                        case "dark-grey":
                            letter.fillStyle = "rgba(255, 255, 255, 1)";
                            card.bgColor = "rgba(51, 51, 51, 1)";
                            break;
                    }
                } else {
                    letter.rotateAnticlockwise();
                    //letter.bgColor = "rgba(0,0,0,1)";
                    //card.bgColor = "rgba(0,0,0,1)";
                }
                card.rotate();
            }, 10 );
        });
    }
}