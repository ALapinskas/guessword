import { WordsGame } from "./wordsGame.js";
import { System, SystemSettings } from "jsge";
import { settings } from "./settings.js";

import { RotateYRect, createRotateYDrawObjectInstance, drawRotateYObject } from "./rotateYObject.js";
import { primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes } from "./rotateYProgram.js";
import { RotateYText, createRotateYTextInstance, drawRotateYText } from "./rotateYObject.js";
import { imgVertexShader, imgFragmentShader, imgUniforms, imgAttributes } from "./rotateYProgram.js";

SystemSettings.customSettings = settings;

document.addEventListener("DOMContentLoaded", function(event) { 
    //do work
    console.log("start app to: ", document.getElementById("game"));
    const app = new System(SystemSettings, document.getElementById("game"));

    app.iSystem.iExtension.registerAndCompileWebGlProgram("rotateYProgram", primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes);
    app.iSystem.iExtension.registerDrawObject("rotateYObject", createRotateYDrawObjectInstance);
    app.iSystem.iExtension.registerObjectRender(RotateYRect.name, drawRotateYObject, "rotateYProgram");

    app.iSystem.iExtension.registerAndCompileWebGlProgram("rotateYTextProgram", imgVertexShader, imgFragmentShader, imgUniforms, imgAttributes);
    app.iSystem.iExtension.registerDrawObject("rotateYText", createRotateYTextInstance);
    app.iSystem.iExtension.registerObjectRender(RotateYText.name, drawRotateYText, "rotateYTextProgram");

    app.registerStage("WordsGame", WordsGame);

    app.preloadAllData().then(() => {
        app.iSystem.startGameStage("WordsGame");
    });
});

