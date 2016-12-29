//make a cylinder battery pack
//make the poles more elaborate with nodules and spacing and T junc or middle bar
//make the central pole more fancy with ringlets

"use strict";

//*********************************************************
//Globals
var g_HasInitialised = false;
twgl.setDefaults({attribPrefix: "a_", crossOrigin: ""});
var g_TheCanvas = document.getElementById("c");
var gl = twgl.getWebGLContext(g_TheCanvas);
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
var g_MouseDown = false;
var g_LastMouseX = null;
var g_LastMouseY = null;
g_TheCanvas.addEventListener('mousedown',function(event) 
{
    g_MouseDown = true;
    g_LastMouseX = event.clientX;
    g_LastMouseY = event.clientY;
});
g_TheCanvas.addEventListener('mouseup',function(event) 
{
    g_MouseDown = false;
});
g_TheCanvas.addEventListener('mousemove',function(event) 
{
    if (!g_MouseDown) 
    {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - g_LastMouseX;
    var newRotationMatrix = mat4.create();
    mat4.rotate(newRotationMatrix, newRotationMatrix, (deltaX/180.0 * Math.PI)/10, [0, 1, 0]);

    var deltaY = newY - g_LastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, (-deltaY/180.0 * Math.PI)/10, [1, 0, 0]);

    mat4.multiply(g_CameraRotMatrix, newRotationMatrix, g_CameraRotMatrix);
    
    g_LastMouseX = newX;
    g_LastMouseY = newY;

    //console.log("deltaX = " + deltaX + ", deltaY = " + deltaY);
});


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

        if (g_TheCanvas.getContext) {
            // get context
            var ctx = g_TheCanvas.getContext('2d');

            // scale 2x
            if(window.devicePixelRatio == 2) {
                g_TheCanvas.width = 320*2;
                g_TheCanvas.height = 480*2;
                
            }
        }

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
    var STEP = 0.2;

    var x_vector = [g_CameraRotMatrix[0], g_CameraRotMatrix[4], g_CameraRotMatrix[8]];
    var y_vector = [g_CameraRotMatrix[1], g_CameraRotMatrix[5], g_CameraRotMatrix[9]];
    var z_vector = [g_CameraRotMatrix[2], g_CameraRotMatrix[6], g_CameraRotMatrix[10]];
    
    if (g_CurrentlyPressedKeys[87]) //'w'
    {
        g_CameraPos[0] += STEP*z_vector[0];
        g_CameraPos[1] += STEP*z_vector[1];
        g_CameraPos[2] += STEP*z_vector[2];
    }
    else if (g_CurrentlyPressedKeys[83]) //'s'
    {
        g_CameraPos[0] += -STEP*z_vector[0];
        g_CameraPos[1] += -STEP*z_vector[1];
        g_CameraPos[2] += -STEP*z_vector[2];
    }
    if (g_CurrentlyPressedKeys[65]) //'a'
    {
        g_CameraPos[0] += STEP*x_vector[0];
        g_CameraPos[1] += STEP*x_vector[1];
        g_CameraPos[2] += STEP*x_vector[2];
    }
    else if (g_CurrentlyPressedKeys[68]) //'d'
    {
        g_CameraPos[0] += -STEP*x_vector[0];
        g_CameraPos[1] += -STEP*x_vector[1];
        g_CameraPos[2] += -STEP*x_vector[2];
    }
    if (g_CurrentlyPressedKeys[81]) //'q'
    {
        g_CameraPos[0] += STEP*y_vector[0];
        g_CameraPos[1] += STEP*y_vector[1];
        g_CameraPos[2] += STEP*y_vector[2];
    }
    else if (g_CurrentlyPressedKeys[69]) //'e'
    {
        g_CameraPos[0] += -STEP*y_vector[0];
        g_CameraPos[1] += -STEP*y_vector[1];
        g_CameraPos[2] += -STEP*y_vector[2];
    }
}

//*******************************************************************************************************
//Render function
var g_ShadersLoaded = false;
function render(time) {

  time *= 0.0001;
  twgl.resizeCanvasToDisplaySize(gl.canvas);
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