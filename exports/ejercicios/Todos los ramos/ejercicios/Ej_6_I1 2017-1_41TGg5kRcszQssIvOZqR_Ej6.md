---
title: "Ejercicio 6"
topic: "General"
number: "6"
originalUrl: "exports/downloads/Todos los ramos/I1 2017-1_41TGg5kRcszQssIvOZqR.pdf"
sourceFile: "I1 2017-1_41TGg5kRcszQssIvOZqR.pdf"
---

Reparametrizar la curva   r ( t ) = (cosh( t ) ,   sen( t ) ,   cos( t )) respecto a la longitud de arco medida desde (1 ,   0 ,   1) en la direcci´ on en que se incrementa   t .  Soluci´ on.   Tenemos que  r ′ ( t ) = (sinh( t ) ,   cos( t ) ,   −   sin( t )) ,   ‖ r ′ ( t ) ‖   =  √  sinh 2 ( t ) + 1 ,  como cosh 2 ( t )   −   sinh 2 ( t ) = 1 y cosh( t )   ≥   0, obtenemos que   ‖ r ′ ( t ) ‖   = cosh( t ) .  Luego, como   r (0) = (1 ,   0 ,   1), calculamos la funci´ on longitud de arco:  s ( t ) =  ∫   t  0  ‖ r ′ ( u ) ‖ du   =  ∫   t  0  cosh( u ) du   = sinh( t ) .  As´ ı,  t ( s ) = sinh − 1 ( s ) = arc sinh( s ) = ln( s   +   √ s 2   + 1) .  Por lo tanto, la parametrizaci´ on por longitud de arco o la arcoparametrizaci´ on de la curva es:  r ( s ) = (cosh(arc sinh( s )) ,   sin(arc sinh( s )) ,   cos(arc sinh( s ))) ,   s   ∈   [0 ,   ∞ ) .