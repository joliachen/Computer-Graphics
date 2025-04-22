/*
Logic: 
We need a series of continuous points to draw points
*/

//  Matrix x Vector
const matrixMultiply = (matrix, vector) => {
    return vector.map((_, i) => 
        matrix[i].reduce((sum, m, j) => sum + m * vector[j], 0)
    );
};

// Curve calculation functions
const Curves = {
    matrices: {
        bezier: [
            [-1, 3, -3, 1],
            [3, -6, 3, 0],
            [-3, 3, 0, 0],
            [1, 0, 0, 0]
        ],
        hermite: [
            [2, -2, 1, 1],
            [-3, 3, -2, -1],
            [0, 0, 1, 0],
            [1, 0, 0, 0]
        ],
        catmullRom: [
            [-0.5, 1.5, -1.5, 0.5],
            [1, -2.5, 2, -0.5],
            [-0.5, 0, 0.5, 0],
            [0, 1, 0, 0]
        ],
        bSpline: [
            [-1/6, 3/6, -3/6, 1/6],
            [3/6, -6/6, 3/6, 0],
            [-3/6, 0, 3/6, 0],
            [1/6, 4/6, 1/6, 0]
        ]
    },



    // Calculate point on curve
    calculatePoint: (t, points, matrix) => {
        const [p0, p1, p2, p3] = points;
        const tVector = [Math.pow(t, 3), Math.pow(t, 2), t, 1]; // [t^3, t^2, t, 1]
        const xCoeffs = matrixMultiply(matrix, [p0.x, p1.x, p2.x, p3.x]);
        const yCoeffs = matrixMultiply(matrix, [p0.y, p1.y, p2.y, p3.y]);
        
        return { // array.reduce(callback, initialValue）     
            // calllback: accumulator, currenValue, index (current index)
            // .reduce returns an accumulated result
            x: tVector.reduce((sum, ti, i) => sum + ti * xCoeffs[i], 0),
            y: tVector.reduce((sum, ti, i) => sum + ti * yCoeffs[i], 0)
        };
    },


    calculateDerivative: (point1, point2) => ({
        x: (point2.x - point1.x) * 0.5,
        y: (point2.y - point1.y) * 0.5
    }),


    getCurvePoints: (points, type, matchDerivatives = true, resolution = 50) => {
        if (points.length < 2) return [];
        const curvePoints = [];
        const matrix = Curves.matrices[type];
        
        switch(type) {
            case 'hermite':
    
                for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i];
                    const p1 = points[i + 1];
                    let r0, r1;

                    if (matchDerivatives) {
                        r0 = i > 0 ? 
                            Curves.calculateDerivative(points[i-1], p1) : // derivative of the previous segment
                            Curves.calculateDerivative(p0, p1);
                        
                        r1 = i < points.length - 2 ?
                            Curves.calculateDerivative(p0, points[i+2]) :
                            Curves.calculateDerivative(p0, p1);
                        console.log(r1);
                    } else {
                        // Independent derivatives for each segment
                        // r0 = Curves.calculateDerivative(p0, p1);
                        // r1 = Curves.calculateDerivative(p0, p1);
                        r0 = { x: points[i].x * .3, y: points[i].y * -.3 };
                        r1 = { x: points[i].x * .3, y: points[i].y * .3 };
                    }
                    
                    for (let step = 0; step <= resolution; step++) {
                        const t = step / resolution;
                        curvePoints.push(Curves.calculatePoint(t, 
                            [p0, p1, r0, r1], matrix));
                    }
                }
                break;

                
                /* bezier
                 Logic: Match derivatives: In order to match derivative, P1 and P2 should be defined based on the position of 
                 P0 and P3. 
                 Not match:  Every 4 points become a group to define the spline
                 */
                case 'bezier':
                if (matchDerivatives) {
                    for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i];        
                        const p3 = points[i + 1];   
                        let p1, p2;

                        if (i === 0) {
                            // P1 and P2 at 1/3 and 2/3
                            const dx = p3.x - p0.x;
                            const dy = p3.y - p0.y;
                            p1 = { 
                                x: p0.x + dx/3, 
                                y: p0.y + dy/3 
                            };
                            p2 = { 
                                x: p0.x + 2*dx/3, 
                                y: p0.y + 2*dy/3 
                            };
                        } else {
                            // Following segments
                            const prevP1 = curvePoints[curvePoints.length - 1].p1;
                            const prevP2 = curvePoints[curvePoints.length - 1].p2;
                            
                            //  P2  P0' P1'    P1' and P2 symmetric
                            p1 = {
                                x: 2 * p0.x - prevP2.x,
                                y: 2 * p0.y - prevP2.y
                            };
                            
                            // P2' position
                            const dx = p3.x - p0.x;
                            const dy = p3.y - p0.y;
                            ratio = .8;
                            // P2' is at the same side of P0' P3'
                            p2 = {
                                x: p1.x + dx * ratio,
                                y: p1.y + dy * ratio
                            };
                        }

    
                        for (let step = 0; step <= resolution; step++) {
                            const t = step / resolution;
                            const point = Curves.calculatePoint(t, [p0, p1, p2, p3], matrix);
       
                            curvePoints.push({
                                ...point,
                                p1: p1,
                                p2: p2
                            });
                        }
                    }
                } else {
                    // not match: every 4 points define a spline
                    for (let i = 0; i < points.length - 3; i += 3) {
                        for (let step = 0; step <= resolution; step++) {
                            const t = step / resolution;
                            curvePoints.push(Curves.calculatePoint(t, 
                                points.slice(i, i + 4), matrix));
                        }
                    }
                }
                break;

            
            
            case 'bSpline':
            case 'catmullRom':
                if (matchDerivatives){ // already makes sure C^2 continuity
                    if (points.length < 4) return [];
                
                for (let i = 0; i < points.length - 3; i++) {
                    for (let step = 0; step <= resolution; step++) {
                        const t = step / resolution;
                        curvePoints.push(Curves.calculatePoint(t, 
                            points.slice(i, i + 4), matrix));
                    }
                }
                break;
                }else{ // not matching: P0 P1 P2 P3 ---> generate curve between P1 and P2
                    for (let i = 0; i < points.length - 3; i += 3) {
                        for (let step = 0; step <= resolution; step++) {
                            const t = step / resolution;
                            curvePoints.push(Curves.calculatePoint(t, 
                                points.slice(i, i + 4), matrix));
                        }
                    }
                }
 
        }
        
        return curvePoints;
    },

    // Draw functions for canvas
    draw: {
        // Draw a point
        point: (ctx, point, style = {}) => {
            const { 
                radius = 6, 
                fill = '#0066cc', 
                stroke = '#ffffff', 
                lineWidth = 2 
            } = style;

            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        },

        // Draw a curve
        curve: (ctx, points, style = {}) => {
            const { 
                strokeStyle = '#000000', 
                lineWidth = 2 
            } = style;

            if (points.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        },

        // Draw control polygon
        controlPolygon: (ctx, points, style = {}) => {
            const { 
                strokeStyle = '#cccccc', 
                lineWidth = 1 
            } = style;

            if (points.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    }
};

// Export the Curves object
window.Curves = Curves;