# Textual mapping: Intro
map a 2D textual to 3D object, present it on the screen. 

It may encounter issue:
3D场景 -> 2D屏幕的映射过程中：
- 纹理是在3D物体表面
- 物体在3D空间中有不同的距离和角度
- 投影到2D屏幕时会产生变形

A. far and close:
近处的物体：
- 一个texel可能覆盖多个像素
- 需要放大 (Magnification)
texture pixel < screen pixel

远处的物体：
- 多个texel对应一个像素
- 需要缩小 (Minification)
texture pixel > screen pixel

...

如果不处理好这种映射关系：

A. 远处（多个texel→1pixel）：
// 会导致：
- 闪烁(flickering)
- 摩尔纹(moiré patterns)
- 混叠(aliasing)

B. 近处（1texel→多个pixel）：
// 会导致：
- 模糊(blurry)
- 像素化(pixelation)

Solution:
// 1. 对于Magnification（放大）：
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// 使用线性插值平滑过渡

// 2. 对于Minification（缩小）：
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
gl.generateMipmap(gl.TEXTURE_2D);

Effect:
    // 在3D场景中常见的情况：

    正视：
    texture: [t][t][t][t]
    screen:  [p][p][p][p]
    mapping: 1:1

    斜视：
    texture: [t][t][t][t]
    screen:  [p][p] 
    mapping: 2:1

    远处：
    texture: [t][t][t][t][t][t][t][t]
    screen:  [    p    ]
    mapping: 8:1


gl.NEAREST: // 最快，质量最差
- 直接取最近的texel

gl.LINEAR: // 中等，平滑过渡
- 取周围4个texel加权平均

gl.LINEAR_MIPMAP_LINEAR: // 最慢，质量最好
- 在两个mipmap级别间做三线性插值


# Mipmap linear interpolation
## 同一Mipmap级别内: Bilinear Filtering
在单个mipmap level内：
P0 P1
P2 P3    

假设要采样的位置在这四个texel之间(u,v)：
- u是水平插值系数 (0-1)
- v是垂直插值系数 (0-1)

步骤：
1. 先在水平方向插值：
   T1 = P0 * (1-u) + P1 * u
   T2 = P2 * (1-u) + P3 * u

2. 然后在垂直方向插值：
   Final = T1 * (1-v) + T2 * v

## Mipmap级别间（Trilinear Filtering）：
假设我们在Level N和Level N+1之间：

Level N:   [计算得到颜色A] (使用上述bilinear filtering)
Level N+1: [计算得到颜色B] (使用上述bilinear filtering)

d = 计算的mipmap级别小数部分
最终颜色 = A * (1-d) + B * d

## Example

Level N (128x128):
P0(1.0, 0.0, 0.0) P1(0.0, 1.0, 0.0)
P2(0.0, 0.0, 1.0) P3(1.0, 1.0, 1.0)

Level N+1 (64x64):
Q0(0.5, 0.0, 0.5) Q1(0.0, 0.5, 0.5)
Q2(0.5, 0.5, 0.0) Q3(0.5, 0.5, 0.5)

采样位置：u=0.3, v=0.7, d=0.4

1. Level N的bilinear:
   T1 = P0*(0.7) + P1*(0.3) = (0.7, 0.3, 0.0)
   T2 = P2*(0.7) + P3*(0.3) = (0.3, 0.3, 0.7)
   A = T1*(0.3) + T2*(0.7) = (0.42, 0.3, 0.49)

2. Level N+1的bilinear:
   S1 = Q0*(0.7) + Q1*(0.3) = (0.35, 0.15, 0.5)
   S2 = Q2*(0.7) + Q3*(0.3) = (0.5, 0.5, 0.15)
   B = S1*(0.3) + S2*(0.7) = (0.455, 0.395, 0.255)

3. 最终trilinear:
   Final = A*(0.6) + B*(0.4)
        = (0.434, 0.338, 0.396)