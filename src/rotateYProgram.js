const primitivesVertexShader =  `
    precision mediump float;

    attribute vec4 a_position;

    uniform vec3 u_translation;
    uniform float u_rotation;
    uniform vec3 u_scale;

    uniform vec4 u_resolution;

    void main(void) {
        float c = cos(u_rotation);
        float s = sin(u_rotation);

        mat4 projection = mat4(
            2.0 / u_resolution.x, 0, 0, 0,
            0, -2.0 / u_resolution.y, 0, 0,
            0, 0, 2.0 / u_resolution.z, 0,
            -1, 1, 0, 1
        );
        //mat3 translationMatrix1 = mat3(
        //    1, 0, 0,
        //    0, 1, 0,
        //    u_translation.x, u_translation.y, 1
        //);
        mat4 translationMatrix = mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            u_translation.x,  u_translation.y, u_translation.z, 1
        );
        // y-rotation
        mat4 rotationMatrix = mat4(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
        //mat3 rotationMatrix = mat3(
        //    c, s, 0,
        //    -s, c, 0,
        //    0, 0, 1
        //);

        //mat3 scalingMatrix = mat3(
        //    u_scale.x, 0, 0,
        //    0, u_scale.y, 0,
        //    0, 0, 1
        //);
        mat4 scalingMatrix = mat4(
            u_scale.x, 0, 0, 0,
            0, u_scale.y, 0, 0,
            0, 0, u_scale.z, 0,
            0, 0, 0, 1
        );
        mat4 matrix = projection * translationMatrix * rotationMatrix * scalingMatrix;

        //vec2 position = (matrix * vec3(a_position, 1)).xy;
        //vec2 clipSpace = position / u_resolution * 2.0 - 1.0;
        //gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        gl_Position = matrix * a_position;
    }
`;
const primitivesFragmentShader = `
    precision mediump float;

    uniform vec4 u_color;
    uniform float u_fade_min; 
    uniform float u_fade_max;
    uniform vec4 u_resolution;
    uniform vec3 u_translation;

    void main(void) {
        vec4 p = u_color;
        if (u_fade_min > 0.0) {
            vec2 fix_tr = vec2(u_translation.x, u_resolution.y - u_translation.y); 
            float distance = distance(fix_tr.xy, gl_FragCoord.xy);
            if (u_fade_min <= distance && distance <= u_fade_max) {
                float percent = ((distance - u_fade_max) / (u_fade_min - u_fade_max)) * 100.0;
                p.a = u_color.a * (percent / 100.0);
            }
        }

        gl_FragColor = p;
    }
`;
const primitivesUniforms = ["u_translation", "u_rotation", "u_scale", "u_resolution", "u_fade_min", "u_fade_max", "u_color"];
const primitivesAttributes = ["a_position"];

const imgVertexShader =  `
    attribute vec2 a_texCoord;

    attribute vec4 a_position;

    uniform vec3 u_translation;
    uniform float u_rotation;
    uniform vec3 u_scale;

    uniform vec4 u_resolution;

    varying vec2 v_texCoord;

    void main(void) {
        float c = cos(u_rotation);
        float s = sin(u_rotation);

        mat4 projection = mat4(
            2.0 / u_resolution.x, 0, 0, 0,
            0, -2.0 / u_resolution.y, 0, 0,
            0, 0, 2.0 / u_resolution.z, 0,
            -1, 1, 0, 1
        );
        //mat3 translationMatrix1 = mat3(
        //    1, 0, 0,
        //    0, 1, 0,
        //    u_translation.x, u_translation.y, 1
        //);
        mat4 translationMatrix = mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            u_translation.x,  u_translation.y, u_translation.z, 1
        );
        // y-rotation
        mat4 rotationMatrix = mat4(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
        //mat3 rotationMatrix = mat3(
        //    c, s, 0,
        //    -s, c, 0,
        //    0, 0, 1
        //);

        //mat3 scalingMatrix = mat3(
        //    u_scale.x, 0, 0,
        //    0, u_scale.y, 0,
        //    0, 0, 1
        //);
        mat4 scalingMatrix = mat4(
            u_scale.x, 0, 0, 0,
            0, u_scale.y, 0, 0,
            0, 0, u_scale.z, 0,
            0, 0, 0, 1
        );
        mat4 matrix = projection * translationMatrix * rotationMatrix * scalingMatrix;

        //vec2 position = (matrix * vec3(a_position, 1)).xy;
        //vec2 clipSpace = position / u_resolution * 2.0 - 1.0;
        //gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        
        gl_Position = matrix * a_position;
        
        v_texCoord = a_texCoord;
    }`;
const imgFragmentShader = `
    precision mediump float;

    uniform sampler2D u_image;

    //texCoords passed in from the vertex shader
    varying vec2 v_texCoord;
    void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        gl_FragColor = color;
    }`;
const imgUniforms = ["u_translation", "u_rotation", "u_scale", "u_resolution","u_image"];
const imgAttributes = ["a_position", "a_texCoord"];

export { imgVertexShader, imgFragmentShader, imgUniforms, imgAttributes };

export { primitivesVertexShader, primitivesFragmentShader, primitivesUniforms, primitivesAttributes };
