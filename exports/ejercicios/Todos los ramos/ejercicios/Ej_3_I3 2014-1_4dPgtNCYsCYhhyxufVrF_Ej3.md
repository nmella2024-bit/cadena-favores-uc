---
title: "Ejercicio 3"
topic: "General"
number: "3"
originalUrl: "exports/downloads/Todos los ramos/I3 2014-1_4dPgtNCYsCYhhyxufVrF.pdf"
sourceFile: "I3 2014-1_4dPgtNCYsCYhhyxufVrF.pdf"
---

Sea   P 3 ( R ) es el espacio vectorial de los polinomios con coeficientes reales de grado menor o igual a 3, y       1   1   1   1 0   1   0   0 0   1   2   0 0   1   0   0       ,  la matriz que representa la transformaci´ on lineal   T   :   P 3 ( R )   →   P 3 ( R ) con respecto a las bases   B 1   en dominio y   B 2   en recorrido, dadas por:  B 1   =   { 1 ,   1 +   x,   1 +   x 2 ,   1   −   x 3 }   y   B 2   =   { 1 ,   2 x,   3 x 2 ,   4 x 3 } .  a ) Encuentre una base de Ker (N´ ucleo) de   T   y una base de Im (Rango) de   T   . Soluci´ on: Al escalonar la matriz queda:      1   1   1   1 0   1   0   0 0   1   2   0 0   1   0   0       ∼      1   0   0   1 0   1   0   0 0   0   1   0 0   0   0   0     . El Ker de la matriz est´ a generado por      1 0 0  − 1     . Luego el Ker de la transformaci´ on est´ a generado por 1   −   (1   −   x 3 ) =   x 3 . La Im de la matriz est´ a generada por      1 0 0 0       ,      1 1 1 1       ,      1 0 2 0     . Luego la Im de la transformaci´ on est´ a generada por 1 ,   1+2 x +3 x 2   +4 x 3 ,   1+6 x 2 . 4

--- Page 5 ---
b ) Determine todos los polinomios no nulos   p   en   P 3 ( R ) tales que   T   ( p ) = 6 p . Soluci´ on: Considerando la matriz que representa a la tranformaci´ on lineal se busca a  p ( x ) =   a   +   bx   +   cx 2   +   dx 3   tal que      1   1   1   1 0   1   0   0 0   1   2   0 0   1   0   0       ·   [ p ] B 1   = 6[ p ] B 2   . Se tiene que [ p ] B 1   =      a   −   b   −   c   +   d b c  − d       y [ p ] B 2   =      a b/ 2  c/ 3  d/ 4     . Resolviendo queda   a   =   b   =   d   = 0. Entonces   p ( x ) debe ser un m´ ultiplo no nulo del polinomio   x 2 . Otra manera es que al interpretar la matriz dada se tiene que:  T   (1) = 1,   T   (1 +   x ) = 1 + 2 x   + 3 x 2   + 4 x 3 ,   T   (1 +   x 2 ) = 1 + 6 x 2   y   T   (1   −   x 3 ) = 1. Entonces   T   (1) = 1,   T   ( x ) = 2 x   + 3 x 2   + 4 x 3 ,   T   ( x 2 ) = 6 x 2   y   T   ( x 3 ) = 0. La matriz que representa a   T   con respecto a las bases can´ onicas es      1   0   0   0 0   2   0   0 0   3   6   0 0   4   0   0     . Como es triangular inferior los valores propios son 1, 2, 6 y 0. Se busca entonces el espacio propio   E 6   el cual est´ a generado por el polinomio   x 2 , y se toma un m´ ultiplo no nulo de ´ el. 5

--- Page 6 ---