function setup() {
    createCanvas(720, 400);
}

function draw() {
    background(200);

    push();
    translate(width * 0.5, height * 0.5);
    rotate(0.52);
    let largeurFace = 250;
    polygon(0, 0, largeurFace, 3);
    pop();

    let distanceLine = 115;
    let alpha1 = degreToRad(-30);
    let x2 = width * 0.5 - largeurFace / 3 - 9;
    let y2 = height * 0.5 - largeurFace / 3 - 9;
    //Calcul des points à dessiner pour le faisceau laser entrant en fonction de l'angle
    let x1;
    let y1;
    if (alpha1 < 0) {
        x1 = x2 + cos(angleToAlpha(alpha1, degreToRad(60))) * distanceLine;
        y1 = y2 - sin(angleToAlpha(alpha1, degreToRad(60))) * distanceLine;
    } else {
        x1 = x2 - cos(angleToAlpha(alpha1, degreToRad(60))) * distanceLine;
        y1 = y2 - sin(angleToAlpha(alpha1, degreToRad(60))) * distanceLine;
    }
    let n = 1.5;
    //Faisceau laser
    push();
    line(x1, y1, x2, y2);
    pop();

    //Faisceau interne
    let alpha2 = asin(sin(alpha1) / n);
    console.log(radToDegre(alpha2));
    let x3 = x2 + cos(((alpha2))) * distanceLine;
    let y3 = y2 - sin(((alpha2))) * distanceLine;
    line(x2, y2, x3, y3);


}

function polygon(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function angleToAlpha(angle, decalage) {
    if (angle < 0) {
        return -angle + degreToRad(90) + decalage;
    }
    return angle + degreToRad(90) - decalage;
}

function radToDegre(angle) {
    return angle / Math.PI * 180;
}

function degreToRad(angle) {
    return angle * Math.PI / 180;
}