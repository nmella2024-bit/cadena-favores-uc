---
title: "Ejercicio 1"
topic: "General"
number: "1"
originalUrl: "exports/downloads/Todos los ramos/I3 2017-2_1fJL13a0z7vpzOc8dFf8.pdf"
sourceFile: "I3 2017-2_1fJL13a0z7vpzOc8dFf8.pdf"
---

Resuelva el problema de valor inicial  y ′′   −   y   =   e x f   ( x )   ,   y (0) = 0   ,   y ′ (0) = 1 donde   f   ( x ) es la funci´ on definida en todo   R   por   f   ( x ) =  {  1   si 2   ≤   x  0   si   x <   2  Soluci´ on.  Aplicando TL a la ecuaci´ on se obtiene que  s 2 Y   ( s )   −   sy (0)   −   y ′ (0)   −   Y   ( s ) =   L ( e x f   ( x ))   ⇒   ( s 2   −   1) Y   ( s )   −   sy (0)   −   y ′ (0) =   F   ( s   −   1) donde   F   ( s ) =   L [ f   ]( s ) =   1  s   e − 2 s . Aplicando las condiciones iniciales se obtiene la ecuaci´ on equivalente  Y   ( s ) =   1  s 2   −   1  (1 +   F   ( s   −   1)) =   1  s 2   −   1  +   1 ( s   −   1) 2 ( s   + 1)   e − 2( s − 1)   .  Ahora calculamos las trasformadas inversas.   De la descomposici´ on   1  s 2 − 1   =   1 2  (   1  s − 1   −   1  s +1  )   se obtiene que  L − 1  [   1  s 2   −   1  ]  ( x ) =  1 2  ( e x   −   e − x ) =   senh( x )   (1)  El otro factor es igual a  [   1 ( s   −   1) 2  ]  ·   e 4  [   1 ( s   + 1)   e − 2( s +1)  ]  =   e 4   L [ h 1   ∗   h 2 ]( s )  donde   h 1 ( x ) =   e x x ,   h 2 ( x ) =   e − x u 2 ( x ). Ahora se calcula la convoluci´ on.   Si   x <   2 la funci´ on   u 2 ( x ) = 0, luego ( h 1   ∗   h 2 )( x ) = 0 para  x <   2. Para   x   ≥   2 se tiene que ( h 1   ∗   h 2 )( x )   =  ∫   x  0  e x − t ( x   −   t ) e − t u 2 ( t )   dt   =   e x  ∫   x  2  e − 2 t ( x   −   t )   dt  =   1 2  ( x   −   2) e x − 4   +  1 4   e − x   −   1 4   e x − 4   .  Resumiendo la soluci´ on   y ( x ) se define a pedazos  y ( x )   =   senh( x )   ,   si   x <   2  y ( x )   =   senh( x ) +  (   x  2   −   5 4  )  e x   +  1 4   e − x +4   si   x   ≥   2 1

--- Page 2 ---