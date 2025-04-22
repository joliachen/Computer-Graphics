let fragmentShader = `
precision mediump float;
uniform float uTime, uFL;
varying vec3  vPos;
uniform mat4 uA[`+NQ+`], uB[`+NQ+`], uC[`+NQ+`];


vec4 transform(mat4 M, vec4 V) {
    vec4 result = vec4(0.0);
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            result[i] += M[i][j] * V[j];
        }
    }
    return result;
}

vec2 rayQ(vec3 V, vec3 W, mat4 Q) {

    float a = dot(vec4(W, 0.0), transform(Q, vec4(W, 0.0)));
    float b = dot(vec4(W, 0.0), transform(Q, vec4(V, 1.0))) + dot(vec4(V, 1.0), transform(Q, vec4(W, 0.0)));
    float c = dot(vec4(V, 1.0), transform(Q, vec4(V, 1.0)));
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant >= 0.0) {
        float r1 = (-b - sqrt(discriminant)) / (2.0 * a);
        float r2 = (-b + sqrt(discriminant)) / (2.0 * a);
        return vec2(r1, r2);
    } 
    return vec2(-1.0);
}

vec3 getNormal(mat4 Q, vec3 P) {
    vec3 N = vec3(0.0);
    N[0] = 2.0 * Q[0][0] * P[0] + Q[0][1] * P[1] + Q[0][2] * P[2] + Q[0][3];
    N[1] = 2.0 * Q[1][1] * P[1] + Q[0][1] * P[0] + Q[1][2] * P[2] + Q[1][3];
    N[2] = 2.0 * Q[2][2] * P[2] + Q[0][2] * P[0] + Q[1][2] * P[1] + Q[2][3];
    return normalize(N);
}

mat3 rayQ3(vec3 V, vec3 W, mat4 A, mat4 B, mat4 C, int inOut) {
    mat3 R = mat3(-1.0);
    vec2 res1 = rayQ(V, W, A), res2 = rayQ(V, W, B), res3 = rayQ(V, W, C);
    if (res1 == vec2(-1.0) || res2 == vec2(-1.0) || res3 == vec2(-1.0)) {
        return R;
    }


    R[0].x = max(max(res1[0], res2[0]), res3[0]);
    R[0].y = min(min(res1[1], res2[1]), res3[1]);


    if (inOut == 0) {
        R[1] = V + W * R[0].x;
        if (R[0].x == res1[0]) R[2] = getNormal(A, R[1]);
        if (R[0].x == res2[0]) R[2] = getNormal(B, R[1]);
        if (R[0].x == res3[0]) R[2] = getNormal(C, R[1]);
    }
    else {
        R[1] = V + W * R[0].y;
        if (R[0].y == res1[1]) R[2] = getNormal(A, R[1]);
        if (R[0].y == res2[1]) R[2] = getNormal(B, R[1]);
        if (R[0].y == res3[1]) R[2] = getNormal(C, R[1]);
    }
    return R;
}

void main(void) {
    vec3 rgb = vec3(0.0, 0.0, 0.05);
    vec3 V = vec3(0.0, 0.0, -uFL);
    vec3 W = normalize(vec3(vPos.xy, uFL));
    vec3 L = normalize(vec3(1.0, 1.0, -1.0));

    for (int i = 0 ; i < `+NQ+` ; i++) {
        mat4 A = uA[i], B = uB[i], C = uC[i];
        mat3 R = rayQ3(V, W, A, B, C, 0);
        if (R != mat3(-1.0)) {
            vec3 P = R[1];
            vec3 N = R[2];
            rgb = vec3(1.0) * (0.1 + max(0., 0.5 * dot(N, L)));
        }
    }

    gl_FragColor = vec4(sqrt(rgb), 1.0);
}
`;
