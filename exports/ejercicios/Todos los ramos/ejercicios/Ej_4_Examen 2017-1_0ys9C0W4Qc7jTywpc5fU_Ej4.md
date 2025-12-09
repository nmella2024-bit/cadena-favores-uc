---
title: "Ejercicio 4"
topic: "General"
number: "4"
originalUrl: "exports/downloads/Todos los ramos/Examen 2017-1_0ys9C0W4Qc7jTywpc5fU.pdf"
sourceFile: "Examen 2017-1_0ys9C0W4Qc7jTywpc5fU.pdf"
---

Determine una base ortogonal para el espacio columna de la siguiente matriz:  A   =       3   − 5   1 1   1   1  − 1   5   − 2 3   − 7   8       Soluci´ on:  En principio, el espacio columna es generado por las tres columnas de   A   (!Obvio!). Debemos determinar si esas tres columnas forman o no una base, o sea, si son o no l.i. Esto puede ser hecho, por ejemplo, escalon´ andola. El escalonamiento arroja tres pivotes, por lo que efectivamente forman una base. Pero esta base no es ortogonal, por lo que debemos obtener una bse ortogonal para el mismo subespacio de   R 4 . Para esto es idel usar el m´ etodo de Gram-Schmidt. En este caso, este m´ etodo funciona como sigue:  a ) Sean   v 1   = (3 ,   1 ,   − 1 ,   3),   v 2   = ( − 5 ,   1 ,   5 ,   − 7) y   v 3   = (1 ,   1 ,   − 2 ,   8) los tres vectores que for- man la base original del espacio columna. Buscamos un conjunto   { w 1 ,   w 2 ,   w 3 }   tal que Gen   { w 1 ,   w 2 ,   w 3 }   = Gen   { v 1 ,   v 2 ,   v 3 } .  b ) Tomamos   w 1   =   v 1   = (3 ,   1 ,   − 1 ,   3).  c ) Tomamos   w 2   =   v 2   −   v 2   ·   w 1  || w 1 || 2   w 1   = ( − 5 ,   1 ,   5 ,   − 7)   −  − 40 20  (3 ,   1 ,   − 1 ,   3) = ( − 5 ,   1 ,   5 ,   − 7) + 2(3 ,   1 ,   − 1 ,   3) = (1 ,   3 ,   3 ,   − 1) .  d   ) Tomamos  w 3   =   v 3   −   v 3   ·   w 1  || w 1 || 2   w 1   −   v 3   ·   w 2  || w 2 || 2   w 2   = (1 ,   1 ,   − 2 ,   8)   −   30 20 (3 ,   1 ,   − 1 ,   3)   −  − 10 20  (1 ,   3 ,   3 ,   − 1) = (1 ,   1 ,   − 2 ,   8)   −  ( 9 2 ,   3 2 ,   − 3 2 ,   9 2  )  +  ( 1 2 ,   3 2 ,   3 2 ,   − 1 2  )  = ( − 3 ,   1 ,   1 ,   3) As´ ı, la base buscada es  { w 1 ,   w 2 ,   w 3 }   =   { (3 ,   1 ,   − 1 ,   3) ,   (1 ,   3 ,   3 ,   − 1) ,   ( − 3 ,   1 ,   1 ,   3) }   .

--- Page 8 ---
Puntaje:  Por indicar que la forma de obtener la base ortogonal es usando Gram-Schmidt, 0,5 ptos. Por obtener el primer vector de la nueva base como el primero de la original, 0,5 puntos. Por plantear correctamente el c´ alculo que deber´ ıa dar el segundo vector de la nueva base, 1 punto. Por llevar a cabo correctamente los c´ alculos que permiten obtener dicho segundo vector, 1 punto. Por plantear correctamente el c´ alculo que deber´ ıa dar el tercer vector de la nueva base, 1,5 puntos. Por llevar a cabo correctamente los c´ alculos que permiten obtener dicho segundo vector, 1,5 puntos.

--- Page 9 ---