//make the battery better: bottom slightly narrower, rings to attach to central pole. fans/camber at end, 'side protrusions', 2 top attenas (wires attach to pole), could sit ona bar...
//battery pack 2: square pack, extra box protusion (cap / side), attach via bar
//tbar version 1: equal balance, top discs (semicircles flattened), vertical spring things, side protusions
//tbar version 2: complete one side balance, 
//nails, foot holds 
//make the central pole more fancy with ringlets -> output/takes a wire
//make springs as wires

//ground
//skydome colors


"use strict";

//*********************************************************
function construct_central_pole() {
    //make central pole out of this height
    var central_pole_vb = new Array();
    var central_pole_normal = new Array();
    var central_pole_indices = new Array();
    var colors = new Array();

    const NUM_CYLINDER_POINTS = 50;
    this.CENTRAL_POLE_RADIUS = 0.2;
    var theta = 2.0*Math.PI / NUM_CYLINDER_POINTS;
    for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {
        var cos = Math.cos(i*theta);
        var sin = Math.sin(i*theta);
        var x = this.CENTRAL_POLE_RADIUS*cos;
        var z = this.CENTRAL_POLE_RADIUS*sin;

        central_pole_vb.push(x); central_pole_vb.push(0); central_pole_vb.push(z);
        central_pole_vb.push(x); central_pole_vb.push(this.central_pole_height); central_pole_vb.push(z);

        // central_pole_normal.push(cos); central_pole_normal.push(0); central_pole_normal.push(sin);
        // central_pole_normal.push(cos); central_pole_normal.push(0); central_pole_normal.push(sin);
        central_pole_normal.push(0); central_pole_normal.push(0); central_pole_normal.push(0);
        central_pole_normal.push(0); central_pole_normal.push(0); central_pole_normal.push(0);

        colors.push(255);colors.push(255);colors.push(0);
        colors.push(255);colors.push(255);colors.push(0);

        var orig = i*2; //current bottom
        var orig_up = orig+1;
        var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
        var orig_up_right = orig_right+1;
        central_pole_indices.push(orig); central_pole_indices.push(orig_up); central_pole_indices.push(orig_up_right);
        central_pole_indices.push(orig); central_pole_indices.push(orig_up_right); central_pole_indices.push(orig_right);
    }

    //caps
    central_pole_vb.push(0); central_pole_vb.push(0); central_pole_vb.push(0);
    central_pole_vb.push(0); central_pole_vb.push(this.central_pole_height); central_pole_vb.push(0);

    central_pole_normal.push(0); central_pole_normal.push(0); central_pole_normal.push(0);
    central_pole_normal.push(0); central_pole_normal.push(0); central_pole_normal.push(0);

    colors.push(255);colors.push(255);colors.push(0);
    colors.push(255);colors.push(255);colors.push(0);

    var idx_pole_0 = 2*NUM_CYLINDER_POINTS;
    var idx_pole_1 = idx_pole_0+1;
    
    for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {

        var orig = i*2; //current bottom
        var orig_up = orig+1;
        var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
        var orig_up_right = orig_right+1;

        central_pole_indices.push(idx_pole_0); central_pole_indices.push(orig); central_pole_indices.push(orig_right);
        central_pole_indices.push(idx_pole_1); central_pole_indices.push(orig_up_right); central_pole_indices.push(orig_up);
    }

    var arrays = {  position:central_pole_vb, 
                    normal:central_pole_normal,
                    vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
                    indices: Uint16Array.from(central_pole_indices)
                };
    this.central_pole_bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

//*********************************************************
function construct_tbars() {
    //make a couple of tbars (basically take top third of pole, top 2/3 of top third) = rects
    var tbar_dim = vec3.fromValues(0.4*this.central_pole_height, 0.15, 0.15);

    var tbar_h = 0.333333*this.central_pole_height - 0.5;
    var tbar_height = [0.666666666*this.central_pole_height + tbar_h, 
                       0.666666666*this.central_pole_height + 0.8*tbar_h];
    
    var tbar_center = [vec2.fromValues( (Math.random()*2.0 - 1.0)*0.2 * (0.5*tbar_dim[0]), tbar_height[0] ),
                        vec2.fromValues( (Math.random()*2.0 - 1.0)*0.2 * (0.5*tbar_dim[0]), tbar_height[1] )];

    var box_position = [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1];
    var box_indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    const NUM_VERTS = box_position.length/3;

    this.tbar_bufferInfo = new Array(2);

    for (var i=0; i<2; ++i) {

        var normals = new Array();
        var colors = new Array();

        var tbar_verts = box_position.slice();
        for (var c_vert=0; c_vert<NUM_VERTS; ++c_vert) {
            var idx0 = c_vert*3 + 0,
                idx1 = c_vert*3 + 1,
                idx2 = c_vert*3 + 2;

            tbar_verts[idx0] = box_position[idx0] * 0.5*tbar_dim[0] + tbar_center[i][0];
            tbar_verts[idx1] = box_position[idx1] * 0.5*tbar_dim[1] + tbar_center[i][1];
            tbar_verts[idx2] = box_position[idx2] * 0.5*tbar_dim[2];

            normals.push(0);normals.push(0);normals.push(0);
            colors.push(255);colors.push(0);colors.push(0);
        }

        var tbar_arrays = {  position:tbar_verts, 
                            normal:normals,
                            vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
                            indices:Uint16Array.from(box_indices)};
        this.tbar_bufferInfo[i] = twgl.createBufferInfoFromArrays(gl, tbar_arrays);
    }
}

//*********************************************************
function construct_battery() {

    var battery_vb = new Array();
    var battery_normal = new Array();
    var battery_indices = new Array();
    var colors = new Array();

    const NUM_CYLINDER_POINTS = 50;
    this.BATTERY_RADIUS = 0.35;
    const BATTERY_HEIGHT = 0.15*this.central_pole_height;

    var battery_pos = vec2.fromValues( this.CENTRAL_POLE_RADIUS + this.BATTERY_RADIUS, 0.7*this.central_pole_height);

    var theta = 2.0*Math.PI / NUM_CYLINDER_POINTS;
    for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {
        var cos = Math.cos(i*theta);
        var sin = Math.sin(i*theta);
        var x = this.BATTERY_RADIUS*cos;
        var z = this.BATTERY_RADIUS*sin;

        battery_vb.push(x + battery_pos[0]); battery_vb.push(-0.5*BATTERY_HEIGHT + battery_pos[1]); battery_vb.push(z);
        battery_vb.push(x + battery_pos[0]); battery_vb.push(0.5*BATTERY_HEIGHT + battery_pos[1]); battery_vb.push(z);

        battery_normal.push(0); battery_normal.push(0); battery_normal.push(0); 
        battery_normal.push(0); battery_normal.push(0); battery_normal.push(0); 

        colors.push(255);colors.push(0);colors.push(255);
        colors.push(255);colors.push(0);colors.push(255);

        var orig = i*2; //current bottom
        var orig_up = orig+1;
        var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
        var orig_up_right = orig_right+1;
        battery_indices.push(orig); battery_indices.push(orig_up); battery_indices.push(orig_up_right);
        battery_indices.push(orig); battery_indices.push(orig_up_right); battery_indices.push(orig_right);
    }

    //caps
    battery_vb.push(battery_pos[0]); battery_vb.push(-0.5*BATTERY_HEIGHT + battery_pos[1]); battery_vb.push(0);
    battery_vb.push(battery_pos[0]); battery_vb.push(0.5*BATTERY_HEIGHT + battery_pos[1]); battery_vb.push(0);

    battery_normal.push(0); battery_normal.push(0); battery_normal.push(0); 
    battery_normal.push(0); battery_normal.push(0); battery_normal.push(0); 

    colors.push(255);colors.push(0);colors.push(255);
    colors.push(255);colors.push(0);colors.push(255);

    var idx_pole_0 = 2*NUM_CYLINDER_POINTS;
    var idx_pole_1 = idx_pole_0+1;
    
    for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {

        var orig = i*2; //current bottom
        var orig_up = orig+1;
        var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
        var orig_up_right = orig_right+1;

        battery_indices.push(idx_pole_0); battery_indices.push(orig); battery_indices.push(orig_right);
        battery_indices.push(idx_pole_1); battery_indices.push(orig_up_right); battery_indices.push(orig_up);
    }

    var arrays = {  position:battery_vb, 
                    normal:battery_normal,
                    vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
                    indices:Uint16Array.from(battery_indices)};
    this.battery_bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

//*********************************************************
function Pylon(central_pole_height) {
    this.central_pole_height = central_pole_height;

    this.construct_central_pole = construct_central_pole;
    this.construct_central_pole();

    this.construct_tbars = construct_tbars;
    this.construct_tbars();

    this.construct_battery = construct_battery;
    this.construct_battery();
}