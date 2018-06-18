function setup() {
    /* valeur pour le triangle */
    let l = 150; //largeur d'une face
    let h = Math.sqrt(l * l - (l / 2) * (l / 2)); //Hauteur du triangle
    // les 3 sommets du triangle
    let pTriXA = l / 2;
    let pTriYA = 0;
    let pTriXB = l;
    let pTriYB = h;
    let pTriXC = 0;
    let pTriYC = h;

    var canvas = createCanvas(document.getElementById('container').offsetWidth, 500);
    canvas.parent('container');
    background(200); //Couleur d'arrière plan
    push(); //S'assure qu'il n'y a pas de translation ou autres d'avant
    stroke(0); //Couleur des traits en noir
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2); //Positionnement au centre du futur triangle
    triangle(pTriXA, pTriYA, pTriXB, pTriYB, pTriXC, pTriYC); //Dessin du triangle

    /* Tableau de points des faces  */
    let p = pointsFace(pTriXC,pTriYC,degreToRad(60),l);
    let tabPX0 = p[0];
    let tabPY0 = p[1];

    p = pointsFace(pTriXA, pTriYA, degreToRad(60), l);
    let tabPX1 = p[0];
    let tabPY1 = p[1];

    p = pointsFace(pTriXC, pTriYC, degreToRad(0), l);
    let tabPX2 = p[0];
    let tabPY2 = p[1];

    /* Coordonnées du faisceau laser */
    let nOut = 1;
    let lengthLaser = 200; //Longueur du laser en pixels (ceci n'est pas la longueur d'onde)
    let alphaInTri = degreToRad(document.getElementById('radius').innerText);
    let pX2 = l / 4; //Point d'arrivé du laser sur le triangle
    let pY2 = h / 2; //Point d'arrivé du laser sur le triangle

    let pX1; //Point de départ du laser
    let pY1; //Point de départ du laser
    if (alphaInTri < 0) {
        pX1 = pX2 + Math.cos(angleToAlpha(alphaInTri, degreToRad(60))) * lengthLaser;
        pY1 = pY2 - Math.sin(angleToAlpha(alphaInTri, degreToRad(60))) * lengthLaser;
    } else {
        pX1 = pX2 - Math.cos(angleToAlpha(alphaInTri, degreToRad(60))) * lengthLaser;
        pY1 = pY2 - Math.sin(angleToAlpha(alphaInTri, degreToRad(60))) * lengthLaser;
    }
    line(pX1, pY1, pX2, pY2); //Dessin du faisceau laser jusqu'au triangle

    let n2 = document.getElementById('n').innerText;

    let alphaCrit = Math.asin(nOut / n2); //Angle critique pour la sortie

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
    let xA = pX2;
    let yA = pY2;
    let decalage;
    let alpha2 = Math.asin(Math.sin(alphaInTri) * nOut / n2);
    let cpt = 10; //Nombre de traits interne max

    let alphaOut = Math.asin(Math.sin(alpha2) * n2 / nOut); //Si on peut sortir?
    do {
        console.log("Attempt : " + (10-cpt));
        console.log("angle : " + radToDegre(alpha2));
        decalage = getDecalage(lastFace);
        if (alpha2 < 0) {
            newFace = (lastFace + 1) % 3;
        } else {
            newFace = (lastFace + 2) % 3;
        }
        console.log("from : " + lastFace + " to : " + newFace);
        if(newFace == 0) {
            pXa = tabPX1;
            pYa = tabPY1;
        } else if(newFace == 1) {
            pXa = tabPX2;
            pYa = tabPY2;
        } else {
            pXa = tabPX2;
            pYa = tabPY2;
        }
        x = faisceauInterne(alpha2, pXa, pYa, xA, yA, decalage);
        // }
        let x3 = x[0];
        let y3 = x[1];
        console.log(xA + " : " + yA);
        console.log(x3 + " : " + y3);
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

        if (newFace == 0) {
            decalage = 180 - getDecalage(newFace);
            xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            if (alphaOut < 0) {
                yFinal = yA - Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            } else {
                yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            }
        } else if (newFace == 1) {
            decalage = getDecalage(newFace);
            if (alphaOut < 0) {
                xFinal = xA - Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            } else {
                xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            }
            yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
        } else {
            decalage = getDecalage(newFace);
            xFinal = xA + Math.cos(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
            yFinal = yA + Math.sin(angleToAlpha(alphaOut, degreToRad(decalage))) * lengthLaser;
        }
        line(xA, yA, xFinal, yFinal, color(255, 0, 0)); //Dessin du rayon sortant
        break;
    } while (Math.abs(alphaOut) > alphaCrit && cpt > 0) ;
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
        return -90;
    } else {
        return 150;
    }
}

function pointsFace(x, y, angle, l) {
    let pX = [];
    let pY = [];
    for (let i = 0; i <= l; ++i) {
        pX.push(x + Math.cos(angle) * i);
        pY.push(y + Math.sin(angle) * i);""
    }
    return [pX, pY];
}

/*  Faisceau interne  */""
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
    if(isNaN(radToDegre(findAngle(x, y, pX[iActuel], pY[iActuel], decalage)))) {
        console.log("NaN : x : " + x + " y : " + y);
        console.log("NaN : pX : " + pX[iActuel] + "pY : " + pY[iActuel]);

    } else {
        console.log(radToDegre(findAngle(x, y, pX[iActuel], pY[iActuel], decalage)));
    }
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