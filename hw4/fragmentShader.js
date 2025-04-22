fragmentShader =
`
precision mediump float;
uniform mat4 uA[`+NQ+`], uB[`+NQ+`], uC[`+NQ+`]; 
varying vec3 vPos;
uniform float uFL;
// uniform vec3 uL; // light source


vec2 rayQ(vec3 V, vec3 W, mat4 Q) {
    float A = dot( vec4(W, 0.),        Q * vec4(W, 0.0) ); 
    float B = 2.0 * dot( vec4(W, 0.),  Q * vec4(V, 1.0)); 
    float C = dot( vec4(V, 1.), Q * vec4(V, 1.0));  

    float discriminant = B * B - 4.0 * A * C;

    if (discriminant > 0.0) {
        float sqrtDisc = sqrt(discriminant);
        float t1 = (-B - sqrtDisc) / (2.0 * A);
        float t2 = (-B + sqrtDisc) / (2.0 * A);
        return vec2(t1, t2); 
    }
    return vec2(-1.0, -1.0); // No intersection
}

vec3 getNormal(mat4 Q, vec3 P) {
    vec3 N = vec3(0.0);
    N[0] = 2.0 * Q[0][0] * P[0] + Q[0][1] * P[1] + Q[0][2] * P[2] + Q[0][3];
    N[1] = 2.0 * Q[1][1] * P[1] + Q[0][1] * P[0] + Q[1][2] * P[2] + Q[1][3];
    N[2] = 2.0 * Q[2][2] * P[2] + Q[0][2] * P[0] + Q[1][2] * P[1] + Q[2][3];
    return normalize(N);
}


mat3 rayQ3(vec3 V, vec3 W, mat4 A, mat4 B, mat4 C, int inOut) {
    vec2 t1 = rayQ(V, W, A);
    vec2 t2 = rayQ(V, W, B);
    vec2 t3 = rayQ(V, W, C);
    if (t1 == vec2(-1.0) || t2 == vec2(-1.0) || t3 == vec2(-1.0)) {
        return mat3(-1.0);
    }

    float tInMax = max(max(t1.x, t2.x), t3.x);
    float tOutMin = min(min(t1.y, t2.y), t3.y);

    vec3 P = vec3(0.0);
    vec3 N = vec3(0.0);

    if (tInMax >= tOutMin) return mat3(vec3(-1.0, -1.0, 0.0), vec3(0.0), vec3(0.0)); // No valid intersection

    P = V + (inOut == 0 ? tInMax : tOutMin) * W;

    if (inOut == 0) {
        N = (tInMax == t1.x) ? getNormal(A, P) :
            (tInMax == t2.x) ? getNormal(B, P) :
                               getNormal(C, P);
    } else {
        N = (tOutMin == t1.y) ? getNormal(A, P) :
            (tOutMin == t2.y) ? getNormal(B, P) :
                                getNormal(C, P);
    }

    return mat3(vec3(tInMax, tOutMin, 0.0), P, N);
}



void main() {
    vec3 V = vec3(0.); // Camera
    vec3 W = normalize(vec3(vPos.xy, -uFL)); // Ray direction
    vec3 L = vec3(1.0); // light

    vec3 color = vec3(0.0, .0, .0); 
    bool hitObject = false;

    vec3 P = vec3(0.0);
    vec3 N = vec3(0.0);

    vec3 specularColor = vec3(1.0); // Specular white
    float shininess = 36.0; //  sharpness of the reflection

    for (int i = 0; i < ${NQ}; i++) {
        mat3 result = rayQ3(V, W, uA[i], uB[i], uC[i], 0); // Only calculate intersection / reflection
        vec2 tInOut = result[0].xy;
        vec3 material = vec3(1.,.2,0.5);
        color = .2 * material ;

        if (tInOut.x >= 0.0 && tInOut.y >= 0.0) {
            P = result[1];
            N = result[2];
            hitObject = true;
        }
   
        if (hitObject) {
            vec3 L = normalize(L - P);
            vec3 d = material * max(0., dot(N,L));

            // vec3 V_dir = normalize(-W); 
            vec3 R = W - 2. * N * dot(N, W);
            vec3 s = material * pow(max(0., dot(R, L)), shininess) ;

            color  += s + d;// getMaterialColor(i) * diffuse  + specularColor * specular;
            }
    }
    

    if (!hitObject) {
        gl_FragColor = vec4(91/255, 160/255, 187/255, 1); // test
    } else {
        gl_FragColor = vec4(color, 1.0); // Object hit, return color
    }
}

`





