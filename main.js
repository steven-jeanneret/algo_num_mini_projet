function setup() {
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

    var canvas = createCanvas(document.getElementById('container').offsetWidth, 500);
    canvas.parent('container');
    background(200); //Couleur d'arrière plan
    push(); //S'assure qu'il n'y a pas de translation ou autres d'avant
    stroke(0); //Couleur des traits en noir
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2); //Positionnement au centre du futur triangle
    triangle(xa, ya, xb, yb, xc, yc); //Dessin du triangle

    /* Tableau de points des faces  */
    let p = pointsFace(xc,yc,degreToRad(60),l);
    let pX2 = p[0];
    let pY2 = p[1];

    p = pointsFace(xa, ya, degreToRad(60), l);
    let pX1 = p[0];
    let pY1 = p[1];

    p = pointsFace(xc, yc, degreToRad(0), l);
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
    line(x1, y1, x2, y2); //Dessin du faisceau laser

    /* Calcul premier angle entrant dans le prisme */
    let n2 = document.getElementById('n').innerText;

    let alphaCrit = Math.asin(n1 / n2); //Agira pour la sortie uniquement

    let x;
    /*
        Face :
        0 sommet A à B (face de droite)
        1 sommet B à C (face du bas)
        2 sommet C à A (face de gauche)
     */
    let lastFace = "2";
    let newFace;
    let pXa;
    let pYa;
    let xA = x2;
    let yA = y2;
    let decalage;
    let alpha2 = Math.asin(Math.sin(alpha1) * n1 / n2);;
    let cpt = 10; //Nombre de traits interne max

    let alphaOut = Math.asin(Math.sin(alpha2) * n2 / n1); //Si on peut sortir?
    do {

        console.log("angle : " + radToDegre(alpha2));
        decalage = getDecalage(lastFace);
        // if (alpha2 == 0) {
        //     x = [xb, yb];
        //     newFace = (lastFace + 1) % 3;
        // } else {
        if (alpha2 < 0) {
            newFace = (lastFace + 1) % 3;
        } else {
            newFace = (lastFace + 2) % 3;
        }

        if(newFace == 0) {
            pXa = pX1;
            pYa = pY1;
        } else if(newFace == 1) {
            pXa = pX3;
            pYa = pY3;
        } else {
            pXa = pX3;
            pYa = pY3;
        }
        x = faisceauInterne(alpha2, pXa, pYa, xA, yA, decalage);
        // }
        let x3 = x[0];
        let y3 = x[1];
        line(xA, yA, x3, y3, color(255, 0, 0)); //Dessin du rayon interne
        lastFace = newFace;
        xA = x3;
        yA = y3;
        alpha2 = (degreToRad(90) - alpha2);
        cpt--;
        if(Math.abs(alphaOut) > alphaCrit) {
            stroke(color(255,0,0));
        }
        let xFinal;
        let yFinal;

        yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
        if (newFace == 0) {
            decalage = 180 - getDecalage(newFace);
            xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            if (alphaOut < 0) {
                yFinal = yA - Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            } else {
                yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            }
        } else if (newFace == 1) {
            decalage = getDecalage(newFace);
            if (alphaOut < 0) {
                xFinal = xA - Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            } else {
                xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            }
            yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
        } else {
            decalage = getDecalage(newFace);
            xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
            yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * length;
        }

        console.log("xFinal : " + xFinal + "yFinal : " + yFinal);
        console.log("xA : " + xA + "yA : " + yA)
        line(xA, yA, xFinal, yFinal, color(255, 0, 0)); //Dessin du rayon sortant
    } while (Math.abs(alphaOut) > alphaCrit && cpt > 0) ;
    console.log("cpt : " + cpt);
//TODO refraction interne
    /*let c = 0;
    c = color(255, 0, 0); si < crit*/

    console.log("alpha out : " + radToDegre(alphaOut));

//TODO couleur de sortie (longueur d'onde)
// stroke(c);
}

function getDecalage(lastFace) {
    if (lastFace == 2) {
        return 30;
    } else if (lastFace == 1) {
        return 90;
    } else {
        return 330;
    }
}

function pointsFace(x, y, angle, l) {
    let pX = [];
    let pY = [];
    for (let i = 0; i <= l; ++i) {
        pX.push(x + Math.cos(angle) * i);
        pY.push(y + Math.sin(angle) * i);
    }
    return [pX, pY];
}

/*  Faisceau interne  */
function faisceauInterne(alpha2, pX, pY, x, y, decalage) {
    let alphaActuel = 0;
    let iActuel = 0;
    for (let i = 0; i < pX.length; i++) {
        let alphaTemp = findAngle(x, y, pX[i], pY[i], decalage);
        if (Math.abs(alphaTemp - alpha2) <= Math.abs(alphaActuel - alpha2)) {
            iActuel = i;
            alphaActuel = alphaTemp;
        }
    }
    console.log(radToDegre(findAngle(x, y, pX[iActuel], pY[iActuel], decalage)));
    return [pX[iActuel], pY[iActuel]];
}

/* trouve l'angle entre 2 points (pente) */
function findAngle(x1, y1, x2, y2, decalage) {
    let x = x2 - x1;
    let y = y2 - y1;
    let angle = Math.atan(y / x);
    if(x<0) {
        angle += degreToRad(180);
    }
    return angle - degreToRad(decalage);
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