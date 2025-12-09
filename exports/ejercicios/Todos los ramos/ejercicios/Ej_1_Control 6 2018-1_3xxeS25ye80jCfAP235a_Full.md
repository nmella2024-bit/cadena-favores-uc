---
title: "Documento Completo"
topic: "General"
number: "1"
originalUrl: "exports/downloads/Todos los ramos/Control 6 2018-1_3xxeS25ye80jCfAP235a.pdf"
sourceFile: "Control 6 2018-1_3xxeS25ye80jCfAP235a.pdf"
---

--- Page 1 ---
Facultad de Ingenier´ ıa   Curso:   Modelos Estoc´ asticos Departamento de Ingenier´ ıa Industrial y de Sistemas   Profesor:   Ignacio Solis  Pontificia Universidad Cat´ olica de Chile  C ontrol 5: CMTD  ICS2123 - Modelos estoc´ asticos Primer Semestre 2018  Jose y su amiga Daniela tienen trabajos que los hacen moverse dentro de dos sectores de la ciudad: sector norte y sector sur. Cada d´ ıa Jos´ e y Daniela se pueden mover, de forma independiente, a otro sector de la cuidad. Los movimientos tanto de Jos´ e como de Daniela se pueden modelar como cadenas de Markov en tiempo discreto. Las probabilidades de transici´ on de un d´ ıa a otro para cada uno de ellos son: Jos´ e   Daniela Norte   Sur   Norte   Sur Norte   0   1   0.5   0.5 Sur   0.4   0.6   1   0 Cada vez que Jos´ e y Daniela se encuentran en el mismo sector de la ciudad, Jos´ e la invita a almorzar. Modele los movimientos de ambos en una ´ unica CMTD y calcule la probabilidad de que en el largo plazo ambos se junten a almorzar.  Soluci´ on  El problema se puede modelar como una CMTD bidimensional. Consideramos   X n   = ( J n ,   D, n ) con   J n   la posici´ on de Jos´ e y   D n   la posici´ on de Daniela en un d´ ıa n. De este modo los estados posibles son cuatro: (N,N), (N,S), (S,N), (S,S). La matriz de transici´ on en una etapa quedar´ ıa definida por  N N   N S   SN   SS         N N   0   0   0 , 5   0 , 5  N S   0   0   1   0  SN   0 , 4 ·   0 , 5   0 , 4 ·   0 , 5   0 , 6 ·   0 , 5   0 , 6 ·   0 , 5  SS   0 , 4   0   0 , 6   0 Entonces la matriz nos queda  N N   N S   SN   SS         N N   0   0   0 , 5   0 , 5  N S   0   0   1   0  SN   0 , 2   0 , 2   0 , 3   0 , 3  SS   0 , 4   0   0 , 6   0 De la matriz anterior se puede observar que la cadena es recurrente positiva, por lo que existe probabilidad l´ ımite y hay distribuci´ on estacionaria. Por lo tanto, la probabilidad que nos piden encontrar es la suma de  π N N   =   π 1   y   π SS   =   π 4 . Luego se plantean las ecuaciones del estado estacionario 1

--- Page 2 ---
Π 1   = 0 , 2Π 3   + 0 , 4Π 4  Π 2   = 0 , 2Π 3  Π 3   = 0 , 5Π 1   + Π 2   + 0 , 3Π 3   + 0 , 6Π 4  Π 4   = 0 , 5Π 1   + 0 , 3Π 3  1 = Π 1   + Π 2   + Π 3   + Π 4  Resolviendo el sistema de ecuaciones se obtiene Π 1   =   4 21 Π 2   =   2 21 Π 3   =  10 21 Π 4   =   5 21 Luego, la probabilidad de que Jos´ e y Daniela se encuentren para almorzar estar´ a dada por Π 1   + Π 4   =   4 21  +  5 21  =   9 21  =  3 7 2

