---
title: "Ejercicio 7"
topic: "General"
number: "7"
originalUrl: "exports/downloads/Todos los ramos/Examen 2017-1_0ys9C0W4Qc7jTywpc5fU.pdf"
sourceFile: "Examen 2017-1_0ys9C0W4Qc7jTywpc5fU.pdf"
---

Determine la descomposici´ on en valores singulares de la matriz,  A   =     1   0 1   1  − 1   1      .  Soluci´ on:  Primero, calculamos   A T   A   =  [   1   1   − 1 0   1   1  ]     1   0 1   1  − 1   1      =  [   3   0 0   2  ]  .  Claramente, los valores propios de   A T   A   son (en orden descendente) 3 y 2, con vectores propios unitarios correspondientes  v 1   =  [   1 0  ]  ,   v 2   =  [   0 1  ]  .  Con estos vectores como columnas formamos la matriz   V   =  [   1   0 0   1  ]  . Los valores singulares son   σ 1   =   √ 3 y   σ 2   =   √ 2, por lo que la matriz   D   =  [   √ 3   0 0   √ 2  ]  y Σ =     √ 3   0 0   √ 2 0   0    . Para encontrar las columnas de la matriz   U   , comenzamos con los vectores  u 1   =   1  σ 1  A v 1   =   1  √ 3     1   0 1   1  − 1   1    [   1 0  ]  =          1  √ 3 1  √ 3  −   1  √ 3          ,   u 2   =   1  σ 2  A v 2   =   1  √ 2     1   0 1   1  − 1   1    [   0 1  ]  =        0 1  √ 2 1  √ 2         .  Como estos dos vectores no generan   R 3 , debemos encontrar un tercer vector   u 3   que —junto con  u 1   y   u 2 — complete una base ortonormal de   R 3 . Una forma de obtener este tercer vector es tomar  u 3   =   u 1 × u 2   =   1  √ 3 (1 ,   1 ,   − 1) ×   1  √ 2 (0 ,   1 ,   1) =   1  √ 6  ((1 ,   1 ,   − 1)   ×   (0 ,   1 ,   1)) =   1  √ 6 (2 ,   − 1 ,   1) =          √ 2  √ 3  −   1  √ 6 1  √ 6          .  As´ ı,  U   =          1  √ 3   0  √ 2  √ 3 1  √ 3 1  √ 2   −   1  √ 6  −   1  √ 3 1  √ 2 1  √ 6        

--- Page 12 ---
con lo que  A   =   U   Σ V   T   =          1  √ 3   0  √ 2  √ 3 1  √ 3 1  √ 2   −   1  √ 6  −   1  √ 3 1  √ 2 1  √ 6            √ 3   0 0   √ 2 0   0    [   1   0 0   1  ] T  es la descomposici´ on de la matriz   A   en valores singulares.  Puntaje:  Por encontrar los valores singulares de   A   (lo que conlleva calcular   A T   A   y sus valores propios), 1 punto. Por encontrar la matriz   V   , 1 punto. Por encontrar la matriz Σ, 1 punto. Por encontrar los vectores   u 1   y   u 2 , 1,5 ptos. Por encontrar un tercer vector   u 3   que completa una base ortonormal de   R 3 , 1,5 puntos. A lo anterior se le suma el punto base

--- Page 13 ---