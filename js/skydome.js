"use strict";

//*********************************************************
function Skydome() {

    var skydome_vb = new Array();
    var skydome_texcoord = new Array();
    var skydome_colors = new Array();
    var skydome_indices = new Array();

    const NUM_SKYDOME_POINTS = 50;
    const NUM_SKYDOME_PHI_SECTIONS = 5;
    this.SKYDOME_RADIUS = 50.0;

    var phi = 0.5*Math.PI / NUM_SKYDOME_PHI_SECTIONS;
    for (var c_phi=0; c_phi<NUM_SKYDOME_PHI_SECTIONS; ++c_phi) {

        var theta = 2.0*Math.PI / NUM_SKYDOME_POINTS;

        for (var c_theta=0; c_theta<NUM_SKYDOME_POINTS; ++c_theta) {

            var phi_sin = Math.sin(c_phi * phi);
            var phi_cos = Math.cos(c_phi * phi);

            var theta_cos = Math.cos(c_theta*theta);
            var theta_sin = Math.sin(c_theta*theta);

            var x = this.SKYDOME_RADIUS*phi_cos*theta_cos;
            var y = this.SKYDOME_RADIUS*phi_sin;
            var z = this.SKYDOME_RADIUS*phi_cos*theta_sin;

            skydome_vb.push(x); skydome_vb.push(y); skydome_vb.push(z);

            skydome_texcoord.push(c_theta/NUM_SKYDOME_POINTS); skydome_texcoord.push(1.0-c_phi/NUM_SKYDOME_PHI_SECTIONS);

            // skydome_colors.push(255);skydome_colors.push(0);skydome_colors.push(255);
            skydome_colors.push((1.0-c_phi/NUM_SKYDOME_PHI_SECTIONS)*255);
            skydome_colors.push((1.0-c_phi/NUM_SKYDOME_PHI_SECTIONS)*255);
            skydome_colors.push((1.0-c_phi/NUM_SKYDOME_PHI_SECTIONS)*255);
        
            var orig = c_phi*NUM_SKYDOME_POINTS + c_theta;
            var orig_up = orig+NUM_SKYDOME_POINTS;
            var to_the_right = (c_theta+1) % NUM_SKYDOME_POINTS;
            var orig_right = c_phi*NUM_SKYDOME_POINTS + to_the_right;
            var orig_up_right = orig_right+NUM_SKYDOME_POINTS;

            if (c_phi < NUM_SKYDOME_PHI_SECTIONS-1 ) {
                skydome_indices.push(orig); skydome_indices.push(orig_up_right); skydome_indices.push(orig_up);
                skydome_indices.push(orig); skydome_indices.push(orig_right); skydome_indices.push(orig_up_right);
            }
        }
    }

    //cap
    skydome_vb.push(0); skydome_vb.push(this.SKYDOME_RADIUS); skydome_vb.push(0);
    skydome_texcoord.push(0); skydome_texcoord.push(0);
    skydome_colors.push(255);skydome_colors.push(0);skydome_colors.push(255);

    for (var c_theta=0; c_theta<NUM_SKYDOME_POINTS; ++c_theta) {

        var orig = (NUM_SKYDOME_PHI_SECTIONS-1)*NUM_SKYDOME_POINTS + c_theta;
        var to_the_right = (c_theta+1) % NUM_SKYDOME_POINTS;
        var orig_right = (NUM_SKYDOME_PHI_SECTIONS-1)*NUM_SKYDOME_POINTS + to_the_right;
        var capindex = NUM_SKYDOME_PHI_SECTIONS*NUM_SKYDOME_POINTS;

        skydome_indices.push(orig); skydome_indices.push(orig_right); skydome_indices.push(capindex);
    }

    var arrays = {  position:skydome_vb, 
                    texcoord:skydome_texcoord, 
                    vertcolor : {numComponents:3, data:Uint8Array.from(skydome_colors)},
                    indices:Uint16Array.from(skydome_indices)};
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);  
}