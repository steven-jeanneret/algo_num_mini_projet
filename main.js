function setup() {
    var canvas = createCanvas(document.getElementById('container').offsetWidth, 500);
    canvas.parent('container');
    background(200); //Couleur d'arrière plan
    /* valeur pour le triangle */
    l = 150; //largeur d'une face
    h = Math.sqrt(l * l - (l / 2) * (l / 2)); //Hauteur du triangle
    // les 3 sommets du triangle
    xa = l / 2;
    ya = 0;
    xb = l;
    yb = h;
    xc = 0;
    yc = h;

    /* Tableau de points de la 2ème face (à droite) */
    let pX2 = [];
    let pY2 = [];
    for (let i = 1; i < l; i++) {
        pX2.push(xa + Math.cos(degreToRad(60)) * i);
        pY2.push(ya + Math.sin(degreToRad(60)) * i);
    }

    /* Coordonnées du faisceau laser */
    let length = 200;
    let alpha1 = degreToRad(document.getElementById('radius').innerText);
    x2 = l / 4;
    y2 = h / 2;
    if (alpha1 < 0) {
        x1 = x2 + Math.cos(angleToAlpha(alpha1, degreToRad(60))) * length;
        y1 = y2 - Math.sin(angleToAlpha(alpha1, degreToRad(60))) * length;
    } else {
        x1 = x2 - Math.cos(angleToAlpha(alpha1, degreToRad(60))) * length;
        y1 = y2 - Math.sin(angleToAlpha(alpha1, degreToRad(60))) * length;
    }


    /* Calcul premier angle entrant dans le prisme */
    let n = document.getElementById('n').innerText;
    let alpha2 = Math.asin(Math.sin(alpha1) / n);

    /*  Faisceau interne  */
    let alphaActuel = 0;
    let iActuel = 0;
    for (let i = 0; i < pX2.length; i++) {
        let alphaTemp = findAngle(x2, y2, pX2[i], pY2[i]);
        if (Math.abs(alphaTemp - alpha2) < Math.abs(alphaActuel - alpha2)) {
            iActuel = i;
            alphaActuel = alphaTemp;
        }
    }
    x3 = pX2[iActuel];
    y3 = pY2[iActuel];

}

function draw() {
    push();
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2);
    triangle(xa, ya, xb, yb, xc, yc); //Dessin du triangle
    line(x1, y1, x2, y2); //Dessin du faisceau laser
    line(x2, y2, x3, y3); //Dessin du rayon interne
}

/* trouve l'angle entre 2 points (pente) */
function findAngle(x1, y1, x2, y2) {
    let x = x2 - x1;
    let y = y2 - y1;
    let angle = Math.atan(y / x);
    return angle - degreToRad(30);
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