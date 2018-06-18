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
    fill(150);
    translate(width * 0.5 - l / 2, height * 0.5 - h / 2); //Positionnement au centre du futur triangle
    triangle(pA.x, pA.y, pB.x, pB.y, pC.x, pC.y); //Dessin du triangle
    stroke(255);
    /* Tableau contenant tous les points du triangle */
    let tabPoint = pointsTriangle(pA, pB, pC, l);

    /* Faisceau laser */
    let nOut = 1; //On considère qu'il s'agit d'air dehors du prisme
    let lengthLaser = 200; //Longueur du laser en pixels (ce n'est pas la longueur d'onde)
    let alphaIn = degreToRad(document.getElementById('radius').innerText);
    let pLaser2 = new Point(l / 4, h / 2); //Point d'arrivée du laser
    let pLaser1 = new Point(pLaser2.x + Math.cos(alphaIn - (Math.PI - pLaser2.getDecalageFace(l, h))) * lengthLaser,
        pLaser2.y + Math.sin(alphaIn - (Math.PI - pLaser2.getDecalageFace(l, h))) * lengthLaser); //Calcul du point de départ du laser
    line(pLaser1.x, pLaser1.y, pLaser2.x, pLaser2.y); //Dessin du laser

    let nIn = document.getElementById('n').innerText;
    let alphaCrit = Math.asin(nOut / nIn); //Angle critique pour la reflexion interne totale
    let pointLast = pLaser2; //Définition de variable pour la boucle
    let alphaLast = alphaIn; //Définition de variable pour la boucle
    let alpha3; //Définition de variable pour la boucle
    let pX; //Définition de variable pour la boucle
    let alpha2 = Math.asin(Math.sin(alphaLast) * nOut / nIn); //Calcul de l'angle théorique d'entrée
    do {
        pX = nextPoint(alpha2, tabPoint, pointLast, pointLast.getDecalageFace(l, h)); //On récupère le prochain point à dessiner
        line(pointLast.x, pointLast.y, pX.x, pX.y);
        if(findAngle(pointLast,pX)+pX.getDecalageFace(l,h)==0) { //Si l'angle atteint un des 3 angles du triangles
            alpha3 = 0;
        } else {
            alpha3 = findAngle(pointLast, pX) - pX.getDecalageFace(l, h); //On cherche l'angle d'arrivé avec le prochin côté
            while (alpha3 > 1 / 2 * Math.PI) { //L'angle ne peut être plus grand que 90°
                alpha3 -= Math.PI;
            }
            while (alpha3 < -1 / 2 * Math.PI) { //L'angle ne peut être plus petit que -90°
                alpha3 += Math.PI;
            }
            if (pX.y == h) { //Si on touche la parois du bas
                alpha2 = -(findAngle(pointLast, pX) + pX.getDecalageFace(l, h));
            } else {
                alpha2 = -(findAngle(pointLast, pX) - pX.getDecalageFace(l, h));
            }
        }
        pointLast = pX;
    } while (Math.abs(alpha3) > alphaCrit); //Tant qu'on est plus grand que alphacritique, il y a reflexion interne totale
    let alphaOut =  -Math.PI + pX.getDecalageFace(l, h) + Math.asin(Math.sin(alpha3) * nIn / nOut); //Calcul de l'angle sortant à dessiner

    let pOut;
    /* Direction du rayon sortant,si on sort de la face du bas, elle ne sera pas la même que si l'on sort de la face de droite */
    if(pX.y == h) {
        pOut = new Point(pX.x + Math.cos(alphaOut) * l * 10, pX.y + Math.sin(alphaOut) * l * 10); // *10 pour un trait "infini"
    } else {
        pOut = new Point(pX.x - Math.cos(alphaOut) * l * 10, pX.y - Math.sin(alphaOut) * l * 10); // *10 pour un trait "infini"
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

/**
 * Calcul la pente entre 2 points, = à l'angle
 * @param p1
 * @param p2
 * @returns {number}
 */
function findAngle(p1, p2) {
    let x = p2.x - p1.x;
    let y = p2.y - p1.y;
    return Math.atan(y / x);
}

/**
 * Retourne le prochain point en approximant au mieux l'angle
 * @param alpha2 angle a approximer
 * @param tabPoint les points du triangle
 * @param pDepart point de départ du trait
 * @param decalage décalage avec la normale
 * @returns {*}
 */
function nextPoint(alpha2, tabPoint, pDepart, decalage) {
    let iActuel = 0;
    let alphaActuel = findAngle(pDepart, tabPoint[iActuel], decalage) - decalage;
    for (let i = 1; i < tabPoint.length; ++i) {
        let alphaTemp = findAngle(pDepart, tabPoint[i], decalage) - decalage;
        if (Math.abs(alphaTemp - alpha2) < Math.abs(alphaActuel - alpha2)) {
            iActuel = i;
            alphaActuel = alphaTemp;
        }
    }
    return tabPoint[iActuel];
}

/**
 * Convertis un angle de degré à radian
 * @param angle
 * @returns {number}
 */
function degreToRad(angle) {
    return angle * Math.PI / 180;
}