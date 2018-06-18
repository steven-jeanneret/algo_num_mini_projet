class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /*Donne le décalage entre la normale de la face actuel et l'horizontal */
    getDecalageFace(l, h) {
        // on s'assure que ce n'est pas un des 2 points de construction du triangle de la face du bas */
        if (this.y == h && !(this.x == 0 || this.x == l)) {
            return degreToRad(-90)
        }
        else if (this.x < l / 2) {
            return degreToRad(30);
        }
        return degreToRad(-30);
    }
}

function setup() {
    /* valeur pour le triangle */
    let l = 150; //Longueur d'une face
    let h = Math.sqrt(l * l - (l / 2) * (l / 2)); //Hauteur du triangle
    //Les 3 sommets du triangle
    let pA = new Point(l / 2, 0); //Point du haut
    let pB = new Point(l, h); //Point de droite
    let pC = new Point(0, h); //Point de gauche

    /* Création de la zone dessinable */
    let canvas = createCanvas(document.getElementById('container').offsetWidth, 500);
    canvas.parent('container');
    push(); //S'assure qu'il n'y a pas de transition d'avant
    background(0); //Couleur d'arrière plan
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2); //Positionnement au centre du futur triangle
    triangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y); //Dessin du triangle
    stroke(255, 0, 0);
    /* Tableau contenant tous les points du triangle */
    let tabPoint = pointsTriangle(pA, pB, pC, l);

    /* Faisceau laser */
    let nOut = 1; //On considère qu'il s'agit d'air dehors du prisme
    let lengthLaser = 200; //Longueur du laser en pixels (ce n'est pas la longueur d'onde)
    let alphaIn = degreToRad(document.getElementById('radius').innerText);
    let pLaser2 = new Point(l / 4, h / 2);
    let pLaser1 = new Point(pLaser2.x + Math.cos(alphaIn - (Math.PI - pLaser2.getDecalageFace(l, h))) * lengthLaser, pLaser2.y + Math.sin(alphaIn - (Math.PI - pLaser2.getDecalageFace(l, h))) * lengthLaser);
    line(pLaser1.x, pLaser1.y, pLaser2.x, pLaser2.y);

    let nIn = document.getElementById('n').innerText;
    let alphaCrit = Math.asin(nOut / nIn);
    let pointLast = pLaser2;
    let alphaLast = alphaIn;
    let alpha3;
    let pX;

    let alpha2 = Math.asin(Math.sin(alphaLast) * nOut / nIn);
    do {
        pX = nextPoint(alpha2, tabPoint, pointLast, pointLast.getDecalageFace(l, h));
        line(pointLast.x, pointLast.y, pX.x, pX.y);
        if(findAngle(pointLast,pX)+pX.getDecalageFace(l,h)==0) {
            alpha3 = 0;
        } else {
            alpha3 = findAngle(pointLast, pX) - pX.getDecalageFace(l, h);
            while (alpha3 > 1 / 2 * Math.PI) {
                alpha3 -= Math.PI;
            }
            while (alpha3 < -1 / 2 * Math.PI) {
                alpha3 += Math.PI;
            }
            if (pX.y == h) {
                alpha2 = -(findAngle(pointLast, pX) + pX.getDecalageFace(l, h));
            } else {
                alpha2 = -(findAngle(pointLast, pX) - pX.getDecalageFace(l, h));
            }
        }
        pointLast = pX;
    } while (Math.abs(alpha3) > alphaCrit); //On fait un module de 2pi pour être sur de pas avoir une valeur au dela d'un tour.
    let alphaOut =  -Math.PI + pX.getDecalageFace(l, h) + Math.asin(Math.sin(alpha3) * nIn / nOut); //Calcul de l'angle sortant à dessiner

    let pOut;
    /* Direction du rayon sortant,si on sort de la face du bas, elle ne sera pas la même que si l'on sort de la face de droite */
    if(pX.y == h) {
        pOut = new Point(pX.x + Math.cos(alphaOut) * l, pX.y + Math.sin(alphaOut) * l);
    } else {
        pOut = new Point(pX.x - Math.cos(alphaOut) * l, pX.y - Math.sin(alphaOut) * l);
    }

    line(pX.x, pX.y, pOut.x, pOut.y);
}

/**
 * Retourne un tableau contenant les coordonnées en points du triangle
 * @param pA le point en haut
 * @param pB le point à droite
 * @param pC le point à gauche
 * @param l la longueur des côtés
 * @returns {*[]}
 */
function pointsTriangle(pA, pB, pC, l) {
    let tabPointA = pointsFace(pA, degreToRad(60), l);
    let tabPointB = pointsFace(pB, degreToRad(180), l);
    let tabPointC = pointsFace(pC, degreToRad(-60), l);
    return tabPointA.concat(tabPointB, tabPointC);
}

/**
 * Retourne un tableau contenant les coordonnées d'une face d'un triangle
 * @param p
 * @param angle
 * @param l
 * @returns {Array}
 */
function pointsFace(p, angle, l) {
    let tabPointFace = [];
    for (let i = 0; i < l; ++i) {
        tabPointFace.push(new Point(p.x + Math.cos(angle) * i, p.y + Math.sin(angle) * i));
    }
    return tabPointFace;
}

function findAngle(p1, p2) {
    let x = p2.x - p1.x;
    let y = p2.y - p1.y;
    return Math.atan(y / x);
}

function nextPoint(alpha2, tabPoint, pLaser2, decalage) {
    let iActuel = 0;
    let alphaActuel = findAngle(pLaser2, tabPoint[iActuel], decalage) - decalage;
    for (let i = 1; i < tabPoint.length; ++i) {
        let alphaTemp = findAngle(pLaser2, tabPoint[i], decalage) - decalage;
        if (Math.abs(alphaTemp - alpha2) < Math.abs(alphaActuel - alpha2)) {
            iActuel = i;
            alphaActuel = alphaTemp;
        }
    }
    return tabPoint[iActuel];
}

/**
 * Convertis un angle de radian à degré
 * @param angle
 * @returns {number}
 */
function radToDegre(angle) {
    return angle / Math.PI * 180;
}

/**
 * Convertis un angle de degré à radian
 * @param angle
 * @returns {number}
 */
function degreToRad(angle) {
    return angle * Math.PI / 180;
}