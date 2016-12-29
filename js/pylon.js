//make the battery better: funny side pipe things, cap clips, 2 top attenas (wires attach to pole), could sit ona bar...
//battery pack 2: square pack, extra box protusion (cap / side), attach via bar
//tbar version 1: equal balance, top discs (semicircles flattened), vertical spring things, side protusions
//tbar version 2: complete one side balance, 
//nails, foot holds 
//make the central pole more fancy with ringlets -> output/takes a wire
//make springs as wires

//ground
//skydome colors

//touch events on mobile


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

    construct_cylinder( NUM_CYLINDER_POINTS, 
                        this.CENTRAL_POLE_RADIUS, 
                        this.CENTRAL_POLE_RADIUS, 
                        this.central_pole_height, 
                        vec3.fromValues(0,0.5*this.central_pole_height,0), 
                        central_pole_vb, 
                        central_pole_normal, 
                        colors, 
                        central_pole_indices, 
                        1.0);
    
    var arrays = {  position:central_pole_vb, 
                    normal:central_pole_normal,
                    vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
                    indices: Uint16Array.from(central_pole_indices)
                };
    this.central_pole_bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
}

//*********************************************************
function construct_cuboid(vb, normals, colors, indices, dim, center_pos) {

    var v_offset = vb.length/3;

    const BOX_POSITION = [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1];
    const NUM_VERTS = BOX_POSITION.length/3;

    for (var c_vert=0; c_vert<NUM_VERTS; ++c_vert) {
        var idx0 = c_vert*3 + 0,
            idx1 = c_vert*3 + 1,
            idx2 = c_vert*3 + 2;

        vb.push(BOX_POSITION[idx0] * 0.5*dim[0] + center_pos[0]);
        vb.push(BOX_POSITION[idx1] * 0.5*dim[1] + center_pos[1]);
        vb.push(BOX_POSITION[idx2] * 0.5*dim[2] + center_pos[2]);

        normals.push(0);normals.push(0);normals.push(0);
        colors.push(255);colors.push(0);colors.push(0);
    }

    var box_indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    for (var c_index=0; c_index<box_indices.length; ++c_index) {
        indices.push(box_indices[c_index] + v_offset);
    }
}

//*********************************************************
//as we all know the stupid cross section width is wrong as we need more clever math to account for angle of each bend
function construct_sectioned_cylinder(vb, normals, colors, indices, num_sections, section_dim, theta, obj_transform_mat) {

    var v_offset = vb.length/3;

    //initial cap
    var p = [
                vec3.fromValues(0,0.5*section_dim[1],0.5*section_dim[2]),
                vec3.fromValues(0,0.5*section_dim[1],-0.5*section_dim[2]),
                vec3.fromValues(0,-0.5*section_dim[1],0.5*section_dim[2]),
                vec3.fromValues(0,-0.5*section_dim[1],-0.5*section_dim[2]),
            ];
    for (var i=0; i<4; ++i) {
        vec3.transformMat4(p[i],p[i],obj_transform_mat);
        vb.push(p[i][0]);vb.push(p[i][1]);vb.push(p[i][2]);
    }

    indices.push(v_offset+0);indices.push(v_offset+1);indices.push(v_offset+2);
    indices.push(v_offset+2);indices.push(v_offset+1);indices.push(v_offset+3);

    for (var i=0; i<4*3; ++i) { normals.push(0); colors.push(255); }

    var per_section_theta = theta/num_sections;
    var last_pos = vec3.fromValues(0,0,0);
    for (var c_section=0; c_section<num_sections+1; ++c_section) {

        //work out the cur pos
        var right_vec = vec3.fromValues(1,0,0);

        //rotate around z by current theta
        var cur_theta = c_section * per_section_theta;
        var cos = Math.cos(cur_theta);
        var sin = Math.sin(cur_theta);
        var vx = cos*right_vec[0] + sin*right_vec[1];
        var vy = sin*right_vec[0] - cos*right_vec[1];
        right_vec[0] = vx;
        right_vec[1] = vy;

        var cur_pos = vec3.create();
        var length_vec = vec3.create();
        vec3.mul(length_vec, right_vec, vec3.fromValues(section_dim[0],section_dim[0],section_dim[0]));
        vec3.add(cur_pos,last_pos,length_vec);

        //work out the normal vector
        //a bit dumb - we work out the NEXT pos
        var total_dir = vec3.clone(right_vec);
        if (c_section < num_sections) {
            var next_right_vec = vec3.fromValues(1,0,0);
            var next_theta = (c_section+1) * per_section_theta;
            cos = Math.cos(next_theta);
            sin = Math.sin(next_theta);
            vx = cos*next_right_vec[0] + sin*next_right_vec[1];
            vy = sin*next_right_vec[0] - cos*next_right_vec[1];
            next_right_vec[0] = vx;
            next_right_vec[1] = vy;

            vec3.add(total_dir, right_vec, next_right_vec);
            vec3.normalize(total_dir,total_dir);
        }

        var normal_vec = vec3.fromValues(-total_dir[1],total_dir[0],total_dir[2]);

        v_offset = vb.length/3;
        
        //push the square        
        var p = [
                vec3.fromValues(cur_pos[0] + 0.5*section_dim[1]*normal_vec[0],cur_pos[1] + 0.5*section_dim[1]*normal_vec[1],cur_pos[2] + 0.5*section_dim[2]),
                vec3.fromValues(cur_pos[0] + 0.5*section_dim[1]*normal_vec[0],cur_pos[1] + 0.5*section_dim[1]*normal_vec[1],cur_pos[2] - 0.5*section_dim[2]),
                vec3.fromValues(cur_pos[0] - 0.5*section_dim[1]*normal_vec[0],cur_pos[1] - 0.5*section_dim[1]*normal_vec[1],cur_pos[2] + 0.5*section_dim[2]),
                vec3.fromValues(cur_pos[0] - 0.5*section_dim[1]*normal_vec[0],cur_pos[1] - 0.5*section_dim[1]*normal_vec[1],cur_pos[2] - 0.5*section_dim[2]),
            ];
        for (var i=0; i<4; ++i) {
            vec3.transformMat4(p[i],p[i],obj_transform_mat);
            vb.push(p[i][0]);vb.push(p[i][1]);vb.push(p[i][2]);
        }
        
        //ok need to link up the tunnel...
        indices.push(v_offset-4);indices.push(v_offset+0);indices.push(v_offset-3);
        indices.push(v_offset-3);indices.push(v_offset+0);indices.push(v_offset+1);

        indices.push(v_offset-2);indices.push(v_offset-1);indices.push(v_offset+2);
        indices.push(v_offset+2);indices.push(v_offset-1);indices.push(v_offset+3);

        indices.push(v_offset-4);indices.push(v_offset-2);indices.push(v_offset+0);
        indices.push(v_offset+0);indices.push(v_offset-2);indices.push(v_offset+2);

        indices.push(v_offset-3);indices.push(v_offset+1);indices.push(v_offset-1);
        indices.push(v_offset+1);indices.push(v_offset+3);indices.push(v_offset-1);

        for (var i=0; i<4*3; ++i) { normals.push(0); colors.push(0); }

        last_pos = cur_pos;
    }

    //cap
    indices.push(v_offset+0);indices.push(v_offset+2);indices.push(v_offset+1);
    indices.push(v_offset+2);indices.push(v_offset+3);indices.push(v_offset+1);
}

//*********************************************************
function construct_tbars() {
    //make a couple of tbars (basically take top third of pole, top 2/3 of top third) = rects
    var tbar_dim = vec3.fromValues(0.4*this.central_pole_height, 0.15, 0.15);

    var tbar_h = 0.333333*this.central_pole_height - 0.5;
    var tbar_height = [0.666666666*this.central_pole_height + tbar_h, 
                       0.666666666*this.central_pole_height + 0.8*tbar_h];
    
    var tbar_center = [vec3.fromValues( (Math.random()*2.0 - 1.0)*0.2 * (-0.5*tbar_dim[0]), tbar_height[0], 0 ),
                        vec3.fromValues( (Math.random()*2.0 - 1.0)*0.2 * (-0.5*tbar_dim[0]), tbar_height[1], 0 )];

    this.tbar_bufferInfo = new Array(2);

    for (var i=0; i<2; ++i) {

        var tbar_verts = new Array();
        var normals = new Array();
        var colors = new Array();
        var indices = new Array();

        construct_cuboid(tbar_verts, normals, colors, indices, tbar_dim, tbar_center[i]);

        var tbar_arrays = {  position:tbar_verts, 
                            normal:normals,
                            vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
                            indices:Uint16Array.from(indices)};
        this.tbar_bufferInfo[i] = twgl.createBufferInfoFromArrays(gl, tbar_arrays);
    }
}

//*********************************************************
function construct_cylinder(NUM_CYLINDER_POINTS, 
                            RADIUS, 
                            BOTTOM_RADIUS, 
                            HEIGHT, 
                            center_pos, 
                            vb, 
                            normals, 
                            colors, 
                            indices, 
                            JAG_RADIUS_RATIO) {

    var v_offset = vb.length/3;
    
    var theta = 2.0*Math.PI / NUM_CYLINDER_POINTS;
    for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {
        var cos = Math.cos(i*theta);
        var sin = Math.sin(i*theta);
        var x = RADIUS*cos;
        var z = RADIUS*sin;
        var bx = BOTTOM_RADIUS*cos;
        var bz = BOTTOM_RADIUS*sin;

        if (i%2 == 0) {
            x *= JAG_RADIUS_RATIO;
            z *= JAG_RADIUS_RATIO;
            bx *= JAG_RADIUS_RATIO;
            bz *= JAG_RADIUS_RATIO;
        }

        //outer body
        vb.push(bx + center_pos[0]); vb.push(-0.5*HEIGHT + center_pos[1]); vb.push(bz + center_pos[2]);
        vb.push(x + center_pos[0]); vb.push(0.5*HEIGHT + center_pos[1]); vb.push(z + center_pos[2]);

        normals.push(0); normals.push(0); normals.push(0); 
        normals.push(0); normals.push(0); normals.push(0); 

        colors.push(255);colors.push(0);colors.push(255);
        colors.push(255);colors.push(0);colors.push(255);

        //indices
        var orig = i*2; //current bottom
        var orig_up = orig+1;
        var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
        var orig_up_right = orig_right+1;
        indices.push(v_offset + orig); indices.push(v_offset + orig_up); indices.push(v_offset + orig_up_right);
        indices.push(v_offset + orig); indices.push(v_offset + orig_up_right); indices.push(v_offset + orig_right);
    }

    //caps
    {
        vb.push(center_pos[0]); vb.push(-0.5*HEIGHT + center_pos[1]); vb.push(0 + center_pos[2]);
        vb.push(center_pos[0]); vb.push(0.5*HEIGHT + center_pos[1]); vb.push(0 + center_pos[2]);

        normals.push(0); normals.push(0); normals.push(0); 
        normals.push(0); normals.push(0); normals.push(0); 

        colors.push(255);colors.push(0);colors.push(255);
        colors.push(255);colors.push(0);colors.push(255);

        var idx_pole_0 = 2*NUM_CYLINDER_POINTS;
        var idx_pole_1 = idx_pole_0+1;
        
        for (var i=0; i<NUM_CYLINDER_POINTS; ++i) {

            var orig = i*2; //current bottom
            var orig_up = orig+1;
            var orig_right = ((i+1)*2) % (2*NUM_CYLINDER_POINTS);
            var orig_up_right = orig_right+1;

            indices.push(v_offset + idx_pole_0); indices.push(v_offset + orig); indices.push(v_offset + orig_right);
            indices.push(v_offset + idx_pole_1); indices.push(v_offset + orig_up_right); indices.push(v_offset + orig_up);
        }
    }
}

//*********************************************************
function construct_battery() {

    var battery_vb = new Array();
    var battery_normal = new Array();
    var battery_indices = new Array();
    var colors = new Array();

    //dimensions
    const NUM_CYLINDER_POINTS = 50;
    this.BATTERY_RADIUS = 0.5;
    this.BOTTOM_BATTERY_RADIUS = 0.95*this.BATTERY_RADIUS;
    this.CAP_RADIUS = this.BATTERY_RADIUS + 0.03;

    const BATTERY_HEIGHT = 0.15*this.central_pole_height;
    const CAP_HEIGHT = 0.05*BATTERY_HEIGHT;

    //rings and connector
    const RING_RADIUS = this.BATTERY_RADIUS + 0.02;
    const BOTTOM_RING_RADIUS = this.BOTTOM_BATTERY_RADIUS + 0.02;
    const RING_HEIGHT = 0.1*BATTERY_HEIGHT;
    const RING_HEIGHT_OFFSET_FROM_MIDDLE = 0.5*BATTERY_HEIGHT - 1.5*RING_HEIGHT;
    const CONNECTOR_DIM = vec3.fromValues(this.CENTRAL_POLE_RADIUS + this.BATTERY_RADIUS + 0.3,0.1,0.1);

    //main body and cap
    var battery_pos = vec3.fromValues( -CONNECTOR_DIM[0], 0.7*this.central_pole_height, 0);
    construct_cylinder( NUM_CYLINDER_POINTS, 
                        this.BATTERY_RADIUS, 
                        this.BOTTOM_BATTERY_RADIUS, 
                        BATTERY_HEIGHT, 
                        battery_pos, 
                        battery_vb, 
                        battery_normal, 
                        colors, 
                        battery_indices, 
                        1.0);

    var cap_pos = vec3.fromValues( battery_pos[0], battery_pos[1] + 0.5*BATTERY_HEIGHT + 0.5*CAP_HEIGHT, 0);
    construct_cylinder( NUM_CYLINDER_POINTS, 
                        this.CAP_RADIUS, 
                        this.CAP_RADIUS, 
                        CAP_HEIGHT, 
                        cap_pos, 
                        battery_vb, 
                        battery_normal, 
                        colors, 
                        battery_indices, 
                        1.0);

    //fans
    construct_cylinder( NUM_CYLINDER_POINTS, 
                        this.BATTERY_RADIUS, 
                        this.BOTTOM_BATTERY_RADIUS, 
                        0.5*BATTERY_HEIGHT, 
                        battery_pos, 
                        battery_vb, 
                        battery_normal, 
                        colors, 
                        battery_indices, 
                        1.3);

    //rings and connector
    construct_cylinder( NUM_CYLINDER_POINTS, 
                        RING_RADIUS, 
                        RING_RADIUS, 
                        RING_HEIGHT, 
                        vec3.fromValues(battery_pos[0], battery_pos[1] + RING_HEIGHT_OFFSET_FROM_MIDDLE, battery_pos[2]), 
                        battery_vb, 
                        battery_normal, 
                        colors, 
                        battery_indices, 
                        1.0);
    construct_cylinder( NUM_CYLINDER_POINTS, 
                        BOTTOM_RING_RADIUS, 
                        BOTTOM_RING_RADIUS, 
                        RING_HEIGHT, 
                        vec3.fromValues(battery_pos[0], battery_pos[1] - RING_HEIGHT_OFFSET_FROM_MIDDLE, battery_pos[2]), 
                        battery_vb, 
                        battery_normal, 
                        colors, 
                        battery_indices, 
                        1.0);
    construct_cuboid(   battery_vb, 
                        battery_normal, 
                        colors, battery_indices, 
                        CONNECTOR_DIM, 
                        vec3.fromValues(battery_pos[0] + 0.5*CONNECTOR_DIM[0], battery_pos[1] + RING_HEIGHT_OFFSET_FROM_MIDDLE, battery_pos[2]));
    construct_cuboid(   battery_vb, 
                        battery_normal, 
                        colors, battery_indices, 
                        CONNECTOR_DIM, 
                        vec3.fromValues(battery_pos[0] + 0.5*CONNECTOR_DIM[0], battery_pos[1] - RING_HEIGHT_OFFSET_FROM_MIDDLE, battery_pos[2]));

    //construct a bunch of protrusions from the top
    const NUM_PROTRUSIONS = 5;
    for (var c_protrusion=0; c_protrusion<NUM_PROTRUSIONS; ++c_protrusion) {
        var theta = 2.0*Math.PI/NUM_PROTRUSIONS * c_protrusion;
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);

        var rot_quat = quat.create();
        quat.setAxisAngle(rot_quat, vec3.fromValues(0,1,0), theta);
        var obj_mat = mat4.create();
        var pos = vec3.create();
        vec3.add(pos,battery_pos,vec3.fromValues(this.BATTERY_RADIUS*cos,0.4*BATTERY_HEIGHT,-this.BATTERY_RADIUS*sin));
        mat4.fromRotationTranslation(obj_mat, rot_quat, pos);

        

        construct_sectioned_cylinder(battery_vb, battery_normal, colors, battery_indices, 3, vec3.fromValues(0.1,0.2,0.2), -Math.PI/3.0, obj_mat);
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

    //debug create one protrusion
    // {
    //     var vb = new Array();
    //     var normals = new Array();
    //     var colors = new Array();
    //     var indices = new Array();

    //     var rot_quat = quat.create();
    //     quat.setAxisAngle(rot_quat, vec3.fromValues(0,1,0),Math.PI/4.0);
    //     var obj_mat = mat4.create();
    //     mat4.fromRotationTranslation(obj_mat, rot_quat, vec3.fromValues(0,0,0));
    //     construct_sectioned_cylinder(vb, normals, colors, indices, 2, vec3.fromValues(0.75,0.2,0.2), -Math.PI/2.0, obj_mat);

    //     var arrays = {  position:vb, 
    //                     normal:normals,
    //                     vertcolor : {numComponents:3, data:Uint8Array.from(colors)},
    //                     indices:Uint16Array.from(indices)};
    //     this.protrusion_bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    // }
}