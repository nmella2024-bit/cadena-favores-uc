---
title: "Ejercicio 1"
topic: "General"
number: "1"
originalUrl: "exports/downloads/Todos los ramos/Examen 2012-1_2QQhLS0HSJjWDE5gNAov.pdf"
sourceFile: "Examen 2012-1_2QQhLS0HSJjWDE5gNAov.pdf"
---

Un paracaidista se deja caer de un avi´ on a 3000 [ m ] de altura. La acel- eraci´ on de gravedad es   g   = 9 . 8 [ m/s 2 ] y la desaceleraci´ on debido a la resistencia del aire es proporcional al cuadrado de la velocidad con constante de proporci´ on   ρ   = 0 . 25 [1 /m ]. Determine el tiempo que toma para llegar al piso y la velocidad de impacto.  Soluci´ on : La velocidad   v ( t ) del paracaidista satisface la ecuaci´ on diferencial separa- ble   d v  d t   =   g   −   ρv 2   =   ρ ( κ   −   v )( κ   +   v )   κ   =   √ g/ρ.  [1 pt] . Integrando obtenemos  ∫   d v  ( κ   −   v )( κ   +   v )  =  ∫  ρ d t   ⇒   1 2 κ   ln  (   κ   +   v κ   −   v  )  =   ρt   +   c,  es decir:   κ   +   v κ   −   v   =   Ce 2 κρt   C   =   e 2 κc   =   κ   +   v 0  κ   −   v 0  v 0 =0  =   1 .  Al despejar   v   vemos que la velocidad es dada por  v ( t ) =   κ  ( e 2 κρt   −   1  e 2 κρt   + 1  )  =   κ   tanh( κρt ) .  [2 pt] . Luego de integrar una vez mas obtenemos la altura   y ( t ) del paracaidista como funci´ on del tiempo:  y ( t ) =   y 0   −  ∫   t  0  v ( τ   )d τ   =   y 0   −   κ  ∫   t  0  tanh( κρτ   )d τ   =   y 0   −   1  ρ   ln(cosh( κρt )) .  [1 pt] . El tiempo   t 0   para llegar al piso es por lo tanto dado por la ecuaci´ on   y 0   =   1  ρ   ln(cosh( κρt 0 )), es decir  t 0   =   1  κρ   cosh − 1 ( e y 0 ρ ) =   1  √ 0 . 25   ·   9 . 8  cosh − 1 ( e 3000 · 0 . 25 )  [1 pt] . 1

--- Page 2 ---
La velocidad de impacto es  v ( t 0 ) =   κ   tanh( κρt 0 ) =   √ 9 . 8 / 0 . 25 tanh( t 0  √ 0 . 25   ·   9 . 8)  [1 pt] .