---
title: "Ejercicio 2"
topic: "General"
number: "2"
originalUrl: "exports/downloads/Todos los ramos/I3 2017-2_1fJL13a0z7vpzOc8dFf8.pdf"
sourceFile: "I3 2017-2_1fJL13a0z7vpzOc8dFf8.pdf"
---

Calcule la soluci´ on del sistema  y ′′  1   −   2   y ′  1   −   2   y 2   =   0  y ′  1   −   2 y 1   +   y ′  2   =   − 2 e − x  con condici´ on inicial   y 1 (0) = 3,   y ′  1 (0) = 2,   y 2 (0) = 0. Se sugiere utilizar transformada de Laplace.  Soluci´ on.   La idea es aplicar TL a cada ecuaci´ on.  s 2 Y 1 [ s ]   −   y 1 (0) s   −   y ′  1 (0)   −   2 sY 1 [ s ] + 2 y 1 (0))   −   2 Y 2 [ s ]   =   0  sY 1 [ s ]   −   y 1 (0)   −   2 Y 1 [ s ] +   sY 2 [ s ]   −   y 2 (0)   =   − L [2 e − x ]( s ) =   −   2  s   + 1  Agregando las condiciones iniciales se obtiene que  ( s 2   −   2 s ) Y 1 [ s ]   −   2 Y 2 [ s ]   =   3 s   −   4 ( s   −   2) Y 1 [ s ] +   sY 2 [ s ]   =   3 s   + 1  s   + 1  Solucionamos el sistema algebraico,  Y 1 [ s ]   =   3 s 3   −   s 2   + 2 s   + 2 ( s 2   + 2)( s   −   2)( s   + 1)  Y 2 [ s ]   =   2 s   + 4 ( s   + 1)( s 2   + 2)  =   2  s 2   + 2  +   2 ( s   + 1)( s 2   + 2) Para   y 2   se obtiene directamente que  y 2 ( x ) =   2  √ 2   L − 1  [   √ 2  s 2   + 2  ]  ( x ) +   2  √ 2   L − 1  [   √ 2 ( s 2   + 2)   ·   1  s   + 1  ]  ( x ) Luego,   y 2 ( x ) =   √ 2 sen( √ 2 x ) +   √ 2 ( h   ∗   g )( x ) donde   h ( x ) =   e − x   y   g ( x ) = sen( √ 2 x ). Calculando la convoluci´ on se obtiene que ( h   ∗   g )( x ) =   e − x  ∫   x  0  e t sen( √ 2 t )   dt   =  1 3  sen( √ 2 x )   − √ 2 3   cos( √ 2 x ) +  √ 2 3   e − x  y por lo tanto,  y 2 ( x ) =  4 3  √ 2 sen( √ 2 x )   −   2 3  cos( √ 2 x ) +  2 3   e − x  Basta con calcular una de ellas por Laplace. Aqui se muestra la forma de calcular   y 2 . 2

--- Page 3 ---