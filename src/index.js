import { WordsGame } from "./wordsGame.js";
import { System, SystemSettings } from "jsge";
import { settings } from "./settings.js";

SystemSettings.customSettings = settings;

const app = new System(SystemSettings, document.getElementById("game"));

app.registerStage("WordsGame", WordsGame);

app.preloadAllData().then(() => {
    app.iSystem.startGameStage("WordsGame");
});