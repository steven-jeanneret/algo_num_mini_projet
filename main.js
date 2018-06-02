function pointsFace(x, y, angle,l) {
    let pX = [];
    let pY = [];
    for (let i = 0; i <= l; i++) {
        pX.push(x + Math.cos(angle) * i);
        pY.push(y + Math.sin(angle) * i);
    }
    return [pX, pY];
}

function setup() {
    var canvas = createCanvas(document.getElementById('container').offsetWidth, 500);
    canvas.parent('container');
    background(200); //Couleur d'arrière plan
    /* valeur pour le triangle */
    let l = 150; //largeur d'une face
    let h = Math.sqrt(l * l - (l / 2) * (l / 2)); //Hauteur du triangle
    // les 3 sommets du triangle
    let xa = l / 2;
    let ya = 0;
    let xb = l;
    let yb = h;
    let xc = 0;
    let yc = h;

    /* Tableau de points de la 2ème face (à droite) */
    let p = pointsFace(xa, ya, degreToRad(60),l);

    let pX2 = p[0];
    let pY2 = p[1];

    p = pointsFace(xc, yc, degreToRad(0),l);
    let pX3 = p[0];
    let pY3 = p[1];

    /* Coordonnées du faisceau laser */
    let n1 = 1;
    let length = 200;
    let alpha1 = degreToRad(document.getElementById('radius').innerText);
    let x2 = l / 4;
    let y2 = h / 2;
    let x1;
    let y1;
    if (alpha1 < 0) {
        x1 = x2 + Math.cos(angleToAlpha(alpha1, degreToRad(60))) * length;
        y1 = y2 - Math.sin(angleToAlpha(alpha1, degreToRad(60))) * length;
    } else {
        x1 = x2 - Math.cos(angleToAlpha(alpha1, degreToRad(60))) * length;
        y1 = y2 - Math.sin(angleToAlpha(alpha1, degreToRad(60))) * length;
    }


    /* Calcul premier angle entrant dans le prisme */
    let n2 = document.getElementById('n').innerText;
    let alpha2 = Math.asin(Math.sin(alpha1) * n1 / n2);

    console.log("angle : " + radToDegre(alpha2));
    let x;

    if (alpha2 == 0) {
        x = [xb,yb];
    } else if (alpha2 < 0) {
        x = faisceauInterne(alpha2, pX2, pY2, x2, y2);
    } else {
        x = faisceauInterne(alpha2, pX3, pY3, x2, y2);
    }
    let x3 = x[0];
    let y3 = x[1];

    //TODO refraction interne
    /*let c = 0;
    c = color(255, 0, 0); si < crit*/
    //TODO couleur de sortie (longueur d'onde)


    //Partie dessin
    push();
    stroke(0);
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2);
    triangle(xa, ya, xb, yb, xc, yc); //Dessin du triangle
    line(x1, y1, x2, y2); //Dessin du faisceau laser
    stroke(c);
    line(x2, y2, x3, y3, color(255, 0, 0)); //Dessin du rayon interne
}

function faisceauInterne(alpha2, pX, pY, x, y) {
    /*  Faisceau interne  */
    let alphaActuel = 0;
    let iActuel = 0;
    for (let i = 0; i < pX.length; i++) {
        let alphaTemp = findAngle(x, y, pX[i], pY[i]);
        if (Math.abs(alphaTemp - alpha2) < Math.abs(alphaActuel - alpha2)) {
            iActuel = i;
            alphaActuel = alphaTemp;
        }
    }
    console.log(radToDegre(findAngle(x, y, pX[iActuel], pY[iActuel])));
    return [pX[iActuel], pY[iActuel]];
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