
function translation(x, y, z) {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    ];
}
function identity() {
    return[
    1,0,0,0, 
    0,1,0,0, 
    0,0,1,0, 
    0,0,0,1];
};


function perspective(x,y,z){
    return[
    1,0,0,x, 
    0,1,0,y, 
    0,0,1,z, 
    0,0,0,1];
};

function rotationX(t) {
    let c = Math.cos(t), s = Math.sin(t);
    return [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    ];
}


function rotationY(t) {
    let c = Math.cos(t), s = Math.sin(t);
    return [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    ];
}


function rotationZ(t) {
    let c = Math.cos(t), s = Math.sin(t);
    return [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}


function scale(x, y, z) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ];
}


function multiply(a, b) {
    let dst = new Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            dst[i * 4 + j] = 0;
            for (let k = 0; k < 4; k++) {
                dst[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return dst;
}


function transpose(m) {
    return [
        m[0], m[4], m[8],  m[12],
        m[1], m[5], m[9],  m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
}
