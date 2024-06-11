import { DrawRectObject } from "jsge/src/base/DrawRectObject.js";
import { DrawTextObject } from "jsge/src/base/DrawTextObject.js";
import { TextureStorage } from "jsge/src/base/WebGl/TextureStorage.js";
class RotateYRect extends DrawRectObject {
    z = 0;
    originalXPos;

    skipShifts = 0;
    constructor(x,y,w,h,bg) {
        super(x,y,w,h,bg);
        this.originalXPos = x;
        //setInterval(() => {
        //    this.rotate();
        //}, 10);
    }
    
    rotate = () => {
        const step = 40,
            stepRotation = Math.PI / step, // 3.14 / 10
            cardWidth = this.width; // 70 / 10
        const card = this,
            currentRotation = card.rotation;
        if (currentRotation < Math.PI/2) {
            card.rotation += stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
        } else if (currentRotation < Math.PI) {
            this.rotation += stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
        } else if (currentRotation < 3*Math.PI/2) {
            this.rotation += stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
        } else if (currentRotation < 2 * Math.PI) {
            this.rotation += stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
        } else {
            // reset rotation angle;
            this.rotation = 0;
            //this.x = this.originalXPos;
        }
    }
}

class RotateYText extends DrawTextObject {
    z = 0;
    originalXPos;
    constructor(mapX, mapY, text, font, fillStyle) {
        super(mapX, mapY, text, font, fillStyle);
        this.originalXPos = mapX;
        //console.log("card width: ", this.boundariesBox.width);
        //setInterval(() => {
        //    this.rotate();
        //}, 100);
        
    }
    
    rotate = () => {
        const step = 40,
            stepRotation = Math.PI / step, // 3.14 / 10
            cardWidth = this.boundariesBox.width; // 70 / 10
        const card = this,
            currentRotation = card.rotation;
        if (currentRotation < Math.PI/2) {
            card.rotation += stepRotation;
            console.log(this.rotation);
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
        } else if (currentRotation < Math.PI) {
            console.log(this.rotation);
            card.rotation -= stepRotation;
            console.log(card.rotation);
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
            //this.bgColor = "rgba(133,133,133,1)";
        } else if (currentRotation < 3*Math.PI/2) {
            this.rotation -= stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
            //this.bgColor = "rgba(133,133,133,1)"
        } else if (currentRotation < 2 * Math.PI) {
            this.rotation -= stepRotation;
            this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(card.rotation)) / 2);
            //this.bgColor = "rgba(0,0,0,1)";
        } else {
            // reset rotation angle;
            this.rotation = 0;
            //this.x = this.originalXPos;
        }
    }

    rotateAnticlockwise = () => {
        const step = 40,
            stepRotation = Math.PI / step, // 3.14 / 10
            cardWidth = this.boundariesBox.width; // 70 / 10
        
        this.rotation += stepRotation;
        this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(this.rotation)) / 2);
    }
    rotateClockWise = () => {
        const step = 40,
            stepRotation = Math.PI / step, // 3.14 / 10
            cardWidth = this.boundariesBox.width; // 70 / 10
            
        this.rotation -= stepRotation;
        this.x = this.originalXPos + ((cardWidth - cardWidth * Math.cos(this.rotation)) / 2);
    }
}

const createRotateYDrawObjectInstance = (x, y, w, h, bgColor) => {
    const renderObject = new RotateYRect(x, y, w, h, bgColor);
    return renderObject;
}

const drawRotateYObject = (renderObject, gl, pageData, program, vars) => {
    const [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
        x = renderObject.x - xOffset,
        y = renderObject.y - yOffset,
        z = renderObject.z,
        scale = [1, 1, 1],
        rotation = renderObject.rotation,
        blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
        { 
            u_translation: translationLocation,
            u_rotation: rotationRotation,
            u_scale: scaleLocation,
            u_resolution: resolutionUniformLocation,
            u_color: colorUniformLocation,
            a_position: positionAttributeLocation,
            u_fade_min: fadeMinLocation
        } = vars;
        
    let verticesNumber = 0;
    gl.useProgram(program);
    // set the resolution
    const depth = 1000;
    gl.uniform4f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height, depth, 1);
    gl.uniform3f(translationLocation, x, y, z);
    gl.uniform3f(scaleLocation, scale[0], scale[1], scale[2]);
    gl.uniform1f(rotationRotation, rotation);
    gl.uniform1f(fadeMinLocation, 0);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    const x1 = 0,
        x2 = 0 + renderObject.width,
        y1 = 0,
        y2 = 0 + renderObject.height;
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array([
            x1, y1, z,
            x2, y1, z,
            x1, y2, z,
            x1, y2, z,
            x2, y1, z,
            x2, y2, z]), gl.STATIC_DRAW);
    verticesNumber += 6;
    //Tell the attribute how to get data out of positionBuffer
    const size = 3,
        type = gl.FLOAT, // data is 32bit floats
        normalize = false,
        stride = 0, // move forward size * sizeof(type) each iteration to get next position
        offset = 0; // start of beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    const colorArray = renderObject.bgColor.replace("rgba(", "").replace(")", "").split(",").map((/** @param {string} */item) => Number(item.trim()));
    gl.uniform4f(colorUniformLocation, colorArray[0]/255, colorArray[1]/255, colorArray[2]/255, colorArray[3]);
    
    if (blend) {
        gl.blendFunc(blend[0], blend[1]);
    }
    
    if (renderObject.isMaskAttached) {
        gl.stencilFunc(gl.EQUAL, renderObject._maskId, 0xFF);
    } else if (renderObject._isMask) {
        gl.stencilFunc(gl.ALWAYS, renderObject.id, 0xFF);
    }
    return Promise.resolve([verticesNumber, gl.TRIANGLES]);
}

const createRotateYTextInstance = (mapX, mapY, text, font, fillStyle) => {
    const renderObject = new RotateYText(mapX, mapY, text, font, fillStyle);
    return renderObject;
}

const drawRotateYText = (renderObject, gl, pageData, program, vars) => {
    const { u_translation: translationLocation,
        u_rotation: rotationRotation,
        u_scale: scaleLocation,
        u_resolution: resolutionUniformLocation,
        a_position: positionAttributeLocation,
        a_texCoord: texCoordLocation,
        u_image: u_imageLocation } = vars;

    const {width:boxWidth, height:boxHeight} = renderObject.boundariesBox,
        image_name = renderObject.text,
        [ xOffset, yOffset ] = renderObject.isOffsetTurnedOff === true ? [0,0] : pageData.worldOffset,
        x = renderObject.x - xOffset,
        y = renderObject.y - yOffset - boxHeight,
        z = renderObject.z,
        blend = renderObject.blendFunc ? renderObject.blendFunc : [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

    const rotation = renderObject.rotation,
        scale = [1, 1, 1];
    const vecX1 = 0,
        vecY1 = 0,
        vecX2 = 0 + boxWidth,
        vecY2 = 0 + boxHeight;
    const verticesBufferData = [
        vecX1, vecY1, z,
        vecX2, vecY1, z,
        vecX1, vecY2, z,
        vecX1, vecY2, z,
        vecX2, vecY1, z,
        vecX2, vecY2, z
    ],
    texturesBufferData = [
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1
    ];
    
    let verticesNumber = 0;

    gl.useProgram(program);
    // set the resolution
    const depth = 1000;
    gl.uniform4f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height, depth, 1);
    gl.uniform3f(translationLocation, x, y, z);
    gl.uniform3f(scaleLocation, scale[0], scale[1], scale[2]);
    gl.uniform1f(rotationRotation, rotation);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBufferData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    //Tell the attribute how to get data out of positionBuffer
    const size = 3,
        type = gl.FLOAT, // data is 32bit floats
        normalize = false,
        stride = 0, // move forward size * sizeof(type) each iteration to get next position
        offset = 0; // start of beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    //textures buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturesBufferData), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    verticesNumber += 6;
    // remove box
    // fix text edges
    gl.blendFunc(blend[0], blend[1]);
    //
    //var currentTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
    
    let textureStorage = renderObject._textureStorage;
    if (!textureStorage) {
        //const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        textureStorage = new TextureStorage(gl.createTexture());
        renderObject._textureStorage = textureStorage;
    }
    if (textureStorage._isTextureRecalculated === true) {
        textureStorage._isTextureRecalculated = false;
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, textureStorage._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderObject._textureCanvas);
        // LINEAR filtering is better for images and tiles, but for texts it produces a small blur
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // for textures not power of 2 (texts for example)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, textureStorage._texture);
    }
    gl.uniform1i(u_imageLocation, textureStorage._textureIndex);
    gl.depthMask(false);
    return Promise.resolve([verticesNumber, gl.TRIANGLES]);
};

export { RotateYRect, createRotateYDrawObjectInstance, drawRotateYObject, RotateYText, createRotateYTextInstance, drawRotateYText }