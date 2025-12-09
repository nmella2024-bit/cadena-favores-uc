---
title: "Ejercicio 3"
topic: "General"
number: "3"
originalUrl: "exports/downloads/Todos los ramos/I2 2013-2_0daM7HmG7vo6w4vlsJnw.pdf"
sourceFile: "I2 2013-2_0daM7HmG7vo6w4vlsJnw.pdf"
---

a) Calcule la siguiente integral  ∫   1 0  ∫   π/ 2 arcsin( y )  cos( x ) √ 1 + cos 2 ( x ) dxdy.

--- Page 5 ---
b) Sea   g   :   R   −→   R   una funci´ on continua tal que   g (0) = 1. Considere  F   :   R 2   −→   R 2   dada por  F   ( x, y ) =  ( ∫   y x  g ( t ) dt,  ∫   x 2  y  g ( t ) dt  )  .  Demuestre que esta funci´ on admite inversa   F   − 1   en una vecindad de (0 ,   0). Determine la matriz Jacobiana de   F   − 1   en el punto (0 ,   0).  Soluci´ on : a) Tenemos  I   :=  ∫   1 0  ∫   π/ 2 arcsin( y )  cos( x ) √ 1 + cos 2 ( x ) dxdy   =  ∫  Ω  cos( x ) √ 1 + cos 2 ( x ) dxdy  donde Ω :=   { ( x, y )   ∈   R 2   |   0   < y <   1 ,   arcsin ( y )   < x < π/ 2 }   .  [ 1 pt]  Como Ω =   { ( x, y )   ∈   R 2   |   0   < x < π/ 2 ,   0   < y <   sin ( x ) }   ,  tenemos  I   =  ∫   π/ 2 0  ( ∫   sin ( x ) 0  cos( x ) √ 1 + cos 2 ( x ) dy  )  dx.  [ 1 pt]  Calculando las integrales, obtenemos  I   =  ∫   π/ 2 0  sin ( x ) cos( x ) √ 1 + cos 2 ( x ) dx   =  ∫   1 0  t √ 1 +   t 2   dt   =  1 2  ∫   1 0  √ 1 +   s ds   =  1 3 (2 3 / 2   −   1) .  [ 1 pt]  b) Sea   J F   ( x, y ) la matriz Jacobiana de   F   en el punto ( x, y )   ∈   R 2 . Tenemos  J F   ( x, y ) =  (   − g ( x )   g ( y ) 2 xg ( x 2 )   − g ( y )  )  .  Entonces,  J F   (0 ,   0) =  (   − 1   1 0   − 1  )  .  [ 1 pt]  Como   det   J F   (0 ,   0) = 1 ̸   = 0, la funci´ on   F   admite funci´ on inversa   F   − 1   en vecindad de (0 ,   0).  [ 1 pt]  Sea   J F   − 1   ( x, y ) la matriz Jacobiana de   F   − 1   en el punto ( x, y )   ∈   R 2 . Entonces  J F   − 1   (0 ,   0) = ( J F   (0 ,   0)) − 1   =  (   − 1   − 1 0   − 1  )  .  [ 1 pt]

--- Page 6 ---
2.