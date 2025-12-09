---
title: "Ejercicio 4"
topic: "General"
number: "4"
originalUrl: "exports/downloads/Todos los ramos/I2 2012-TAV_1rq7az8S2ggaG0PGmSnF.pdf"
sourceFile: "I2 2012-TAV_1rq7az8S2ggaG0PGmSnF.pdf"
---

Usando transformadas de Laplace resuelva los siguientes problemas:  a )   y ′′   + 4 y   =   g ( t );   y (0) =   y ′ (0) = 0 ,   donde  g ( t )   =      0   0   ≤   t <   5 ( t   −   5) / 5   5   ≤   t <   10 1   t   ≥   10  Soluci´ on   : Escribimos  g ( t )   =   1 5  [ u 5 ( t ) ( t   −   5)   −   u 10 ( t ) ( t   −   10)] Luego,aplicando Transformada de Laplace y usando las condiciones iniciales tenemos que ( s 2 +4)   L{ y ( t ) } ( s )   =   e − 5 s   −   e − 10 s  5 s 2   ⇒   L{ y ( t ) } ( s )   =  1 5  ( e − 5 s   −   e − 10 s )   1  s   ( s 2   + 4)   .  Por fracciones parciales, 1  s   ( s 2   + 4)   =   1 4  (   1  s 2   −   1  s 2   + 4  )  =   1 4   L          t   +  1 2  sen(2 t )  ︸   ︷︷   ︸  h ( t )          ( s ) Y la soluci´ on es, pues,  y ( t )   =   1 5  [ u 5 ( t )   h ( t   −   5)   −   u 10 ( t )   h ( t   −   10)]

--- Page 6 ---
b )   2 y ′′   +   y ′   + 2 y   =   δ ( t   −   5);   y (0) =   y ′ (0) = 0 ,   donde   δ ( t ) denota el   delta de Dirac .  Soluci´ on   : Aplicamos Transformada de Laplace y usamos las condiciones iniciales para obtener (2 s 2   +   s   + 2)   L{ y ( t ) } ( s )   =   e − 5 s   ⇒   L{ y ( t ) } ( s )   =   e − 5 s   1 2 s 2   +   s   + 2   .  Completando cuadrados,  L{ y ( t ) } ( s )   =   e − 5 s  2   ·   1  ( s   +   1 4  ) 2   +   15 16  .  Tenemos que  L − 1  {  1  ( s   +   1 4  ) 2   +   15 16  }  =   4  √ 15   e − t/ 4   sin  ( √ 15 4   t  )  y por tanto,  y ( t )   =   2  √ 15   u 5 ( t )   e − t/ 4   sin  ( √ 15 4   ( t   −   5)  )