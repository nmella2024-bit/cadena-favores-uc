---
title: "Ejercicio 7"
topic: "General"
number: "7"
originalUrl: "exports/downloads/Todos los ramos/I2 2022-2_2XzP1IAGP2tCpoHK3CjO.pdf"
sourceFile: "I2 2022-2_2XzP1IAGP2tCpoHK3CjO.pdf"
---

Considere una matriz   A   =   M R   donde   M   es una matriz invertible y  R   =      1   0   3   2 0   1   1   0 0   0   0   0      .  (a) Encuentre una base de Col( A T   ). (b) Encuentre una base de Nul( A ).  Soluci´ on  (a) Ya que   M   es invertible,   M   es producto de matrices elementales. Esto implica que  R   es la forma escalonada reducida de   A . Como las filas de   R   son combinaciones lineales de las filas   A , entonces Col( A T   ) = Fil( A ) = Fil( R ). Por lo tanto una base del espacio es              1 0 3 2        ,       0 1 1 0              (b) Un vector   x   pertenece a Nul( A ) si   Ax   = 0, es decir,   M Rx   = 0.   Como   M   es invertible, tenemos  Ax   = 0   ⇔   M Rx   = 0   ⇔   M   − 1 M Rx   =   M   − 1 0   ⇔   Rx   = 0 es decir, Nul( A ) = Nul( R ). De esta forma,  x   =       x 1  x 2  x 3  x 4        ∈   Nul( R )   ⇔     x 1   =   − 3 x 3   −   2 x 4  x 2   =   − x 3  ,   x 3 , x 4   ∈   R .  ⇔   x   =   x 3       − 3  − 1 1 0        +   x 4       − 2 0 0 1        .  Por lo tanto, una base de Nul( A ) es              − 3  − 1 1 0        ,       − 2 0 0 1              Puntaje  •   1 puntos por justificar correctamente que Col( A T   ) = Fil( A ) = Fil( R ).  •   2 puntos por determinar la base de Col( A T   ).  •   1 puntos por justificar que Nul( A ) = Nul( R ).  •   2 puntos por determinar la base de Nul( A ).

--- Page 7 ---