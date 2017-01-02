//make the poles more elaborate with nodules and spacing and T junc or middle bar
//make the central pole more fancy with ringlets
//make weird subtitles thing

"use strict";

/**
 * This is the function that will take care of image extracting and
 * setting proper filename for the download.
 * IMPORTANT: Call it from within a onclick event.
*/
function downloadCanvas(link, canvasId, filename) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = document.getElementById(canvasId).toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link.obj;
}

/** 
 * The event handler for the link's onclick event. We give THIS as a
 * parameter (=the link element), ID of the canvas and a filename.
*/
document.getElementById('download').addEventListener('click', function() {
    downloadCanvas(this, 'c', 'Pylons.png');
}, false);

//*********************************************************
//Globals
var g_HasInitialised = false;
twgl.setDefaults({attribPrefix: "a_", crossOrigin: ""});
var g_TheCanvas = document.getElementById("c");
var gl = twgl.getWebGLContext(g_TheCanvas, {preserveDrawingBuffer:true}); //make it false to optimiiiise
var gl_ProgramInfos = {};

//camera
var g_CameraPos = vec3.fromValues(-2.6785480976104736,1.6622629165649414,23.57918930053711);
var g_CameraRotMatrix = mat4.fromValues(-0.9998121857643127, -0.0027438306715339422, 0.019060973078012466, 0,
                                        0.000844063819386065, 0.9825995564460754, 0.18571694195270538, 0,
                                        -0.019239187240600586, 0.18569914996623993, -0.9824124574661255, 0,
                                        0, 0, 0, 1);




//*********************************************************
function loadFile(url, data, callback, errorCallback) 
{
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () 
    {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == 4) 
        {
            // If we got HTTP status 200 (OK)
            if (request.status == 200) 
            {
                callback(request.responseText, data)
            }
            else 
            { // Failed
                errorCallback(url);
            }
        }
    };

    request.send(null);    
}
function loadFiles(shaderName, urls, callback, errorCallback) 
{
    var numUrls = urls.length;
    var numComplete = 0;
    var result = [];

    // Callback for a single file
    function partialCallback(text, urlIndex) 
    {
        result[urlIndex] = text;
        numComplete++;

        // When all files have downloaded
        if (numComplete == numUrls) 
        {
            callback(shaderName, result);
        }
    }

    for (var i = 0; i < numUrls; i++) 
    {
        loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

//*********************************************************
function createShaderProgram(shaderName, shaderText) 
{
    console.log("Shader created: " + shaderName);
    gl_ProgramInfos[shaderName] = twgl.createProgramInfo(gl, [shaderText[0], shaderText[1]]);
}


//*******************************************************************************************************
var pylon = new Pylon(10);
var skydome = new Skydome();

var skydome_texture = twgl.createTexture(gl, {
  min: gl.LINEAR,
  mag: gl.LINEAR,
  src: "./assets/skydome.png"//"https://farm6.staticflickr.com/5795/21506301808_efb27ed699_q_d.jpg"
  // crossOrigin: "", // either this or use twgl.setDefaults
});

var uniforms = {
  u_lightWorldPos: [1, 5, -10],
  u_lightColor: [1, 1, 1, 1],
  u_ambient: [0, 0, 0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 1,
  u_specularFactor: 0,
  u_diffuse: skydome_texture,
};

//*******************************************************************************************************
//key functions
//*******************************************************************************************************
var g_CurrentlyPressedKeys = {};
g_TheCanvas.addEventListener('keyup',function(event) 
{
    g_CurrentlyPressedKeys[event.keyCode] = false;
});     
g_TheCanvas.addEventListener('keydown',function(event) 
{
    g_CurrentlyPressedKeys[event.keyCode] = true;
});     

//*******************************************************************************************************
//meese functions
//*******************************************************************************************************
// var g_MouseDown = false;
var g_LastScale = null;
var g_LastMouseX = null;
var g_LastMouseY = null;

function rotate_camera(dx, dy) {

    const SPEED_SCALE = 0.1;
    var newRotationMatrix = mat4.create();
    mat4.rotate(newRotationMatrix, newRotationMatrix, (dx/180.0 * Math.PI) * SPEED_SCALE, [0, 1, 0]);
    mat4.rotate(newRotationMatrix, newRotationMatrix, (-dy/180.0 * Math.PI) * SPEED_SCALE, [1, 0, 0]);

    mat4.multiply(g_CameraRotMatrix, newRotationMatrix, g_CameraRotMatrix);
}

function translate_camera(step) {

    var x_vector = [g_CameraRotMatrix[0], g_CameraRotMatrix[4], g_CameraRotMatrix[8]];
    var y_vector = [g_CameraRotMatrix[1], g_CameraRotMatrix[5], g_CameraRotMatrix[9]];
    var z_vector = [g_CameraRotMatrix[2], g_CameraRotMatrix[6], g_CameraRotMatrix[10]];
    
    g_CameraPos[0] += step[0]*x_vector[0];
    g_CameraPos[1] += step[0]*x_vector[1];
    g_CameraPos[2] += step[0]*x_vector[2];
    
    g_CameraPos[0] += step[1]*y_vector[0];
    g_CameraPos[1] += step[1]*y_vector[1];
    g_CameraPos[2] += step[1]*y_vector[2];

    g_CameraPos[0] += step[2]*z_vector[0];
    g_CameraPos[1] += step[2]*z_vector[1];
    g_CameraPos[2] += step[2]*z_vector[2];
}

//*******************************************************************************************************
//animate
function animate(time) 
{
    if (g_HasInitialised)
    {
        processinput();
        process();
        render(time);
    }
    else
    {
        loadFiles("Basic", ['./js/shaders/Basic.vsh', './js/shaders/Basic.fsh'], createShaderProgram, 
          function (url) {alert('Failed to download "' + url + '"');}); 

        loadFiles("Skydome", ['./js/shaders/Skydome.vsh', './js/shaders/Skydome.fsh'], createShaderProgram, 
          function (url) {alert('Failed to download "' + url + '"');}); 

        //do some madness
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = gl.webkitBackingStorePixelRatio ||
                                    gl.mozBackingStorePixelRatio ||
                                    gl.msBackingStorePixelRatio ||
                                    gl.oBackingStorePixelRatio ||
                                    gl.backingStorePixelRatio || 1;
        var ratio = devicePixelRatio / backingStoreRatio;

        twgl.resizeCanvasToDisplaySize(gl.canvas,ratio);

        //hammer time
        var hammertime = new Hammer(g_TheCanvas);
        hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        hammertime.on('pan', function(ev) {
                        // console.log(ev.eventType + ", " + ev.velocityX);
                        if (ev.eventType == Hammer.INPUT_END) {
                            g_LastMouseX = null;
                            g_LastMouseY = null;
                        }
                        else {
                            if (g_LastMouseX == null) {
                                rotate_camera(ev.deltaX,ev.deltaY);
                            }
                            else {
                                rotate_camera(ev.deltaX - g_LastMouseX,ev.deltaY - g_LastMouseY);
                            }

                            g_LastMouseX = ev.deltaX;
                            g_LastMouseY = ev.deltaY;
                        }
                    });
        hammertime.get('pinch').set({ enable: true });
        hammertime.on('pinch', function(ev) {
                    console.log(ev);
                    if (ev.eventType == Hammer.INPUT_END) {
                        g_LastScale = null;
                    }
                    else {
                        const STEP = 1.0;
                        var step = vec3.create();

                        if (g_LastScale == null) {
                            step[2] = ev.scale > 1.0 ? STEP : -STEP;
                        }
                        else {
                            step[2] = ev.scale - g_LastScale > 0 ? STEP : -STEP;
                        }

                        translate_camera(step);
                        g_LastScale = ev.scale;
                    }
                    
        });

        g_HasInitialised = true;
    }

    requestAnimationFrame(animate);
}

//*******************************************************************************************************
//process
function process()
{
}

//*******************************************************************************************************
//Process inputs
function processinput()
{
    const STEP = 0.2;
    var step = vec3.create();
    
    if (g_CurrentlyPressedKeys[87]) //'w'
    {
        step[2] = STEP;
    }
    else if (g_CurrentlyPressedKeys[83]) //'s'
    {
        step[2] = -STEP;
    }
    if (g_CurrentlyPressedKeys[65]) //'a'
    {
        step[0] = STEP;
    }
    else if (g_CurrentlyPressedKeys[68]) //'d'
    {
        step[0] = -STEP;
    }
    if (g_CurrentlyPressedKeys[81]) //'q'
    {
        step[1] = STEP;
    }
    else if (g_CurrentlyPressedKeys[69]) //'e'
    {
        step[1] = -STEP;
    }

    translate_camera(step);
}

//*******************************************************************************************************
//Render function
var g_ShadersLoaded = false;
function render(time) {

  time *= 0.0001;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.99, 0.5, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  if (!g_ShadersLoaded) {
    if (gl_ProgramInfos["Basic"] != null &&
        gl_ProgramInfos["Skydome"] != null) {
        g_ShadersLoaded = true;
    }
  }

  if (g_ShadersLoaded) {
    var projection = mat4.create();
    mat4.perspective(projection, 30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 1000);

    var eye = g_CameraPos;
    var y_vector = [g_CameraRotMatrix[1], g_CameraRotMatrix[5], g_CameraRotMatrix[9]];
    var z_vector = [g_CameraRotMatrix[2], g_CameraRotMatrix[6], g_CameraRotMatrix[10]];
    var target = vec3.create();
    vec3.add(target, g_CameraPos, z_vector);
    var up = y_vector;

    var view = mat4.create(); //world to view matrix
    mat4.lookAt(view, eye, target, up);
    
    var camera = mat4.create(); //view to world matrix
    mat4.invert(camera, view);
    
    var viewProjection = mat4.create(); //world->clip
    mat4.multiply(viewProjection, projection, view); //goes right to left?

    var world = mat4.create();
    // mat4.fromYRotation(world,time);

    var invworld_transpose = mat4.create();
    mat4.invert(invworld_transpose,world);
    mat4.transpose(invworld_transpose, invworld_transpose);

    var worldViewProj = mat4.create();
    mat4.multiply(worldViewProj, viewProjection, world);

    uniforms.u_viewInverse = camera;
    uniforms.u_world = world;
    uniforms.u_worldInverseTranspose = invworld_transpose;
    uniforms.u_worldViewProjection = worldViewProj;

    // //skydome
    gl.useProgram(gl_ProgramInfos["Skydome"].program);
    twgl.setUniforms(gl_ProgramInfos["Skydome"], uniforms);

    twgl.setBuffersAndAttributes(gl, gl_ProgramInfos["Skydome"], skydome.bufferInfo);
    gl.drawElements(gl.TRIANGLES, skydome.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    //objects
    gl.useProgram(gl_ProgramInfos["Basic"].program);
    twgl.setUniforms(gl_ProgramInfos["Basic"], uniforms);    

    twgl.setBuffersAndAttributes(gl, gl_ProgramInfos["Basic"], pylon.central_pole_bufferInfo);
    gl.drawElements(gl.TRIANGLES, pylon.central_pole_bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    for (var i=0; i<2; ++i) {        
        twgl.setBuffersAndAttributes(gl, gl_ProgramInfos["Basic"], pylon.tbar_bufferInfo[i]);
        gl.drawElements(gl.TRIANGLES, pylon.tbar_bufferInfo[i].numElements, gl.UNSIGNED_SHORT, 0);
    }

    twgl.setBuffersAndAttributes(gl, gl_ProgramInfos["Basic"], pylon.battery_bufferInfo);
    gl.drawElements(gl.TRIANGLES, pylon.battery_bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    //debug render one protrusion
    // twgl.setBuffersAndAttributes(gl, gl_ProgramInfos["Basic"], pylon.protrusion_bufferInfo);
    // gl.drawElements(gl.TRIANGLES, pylon.protrusion_bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  }
}