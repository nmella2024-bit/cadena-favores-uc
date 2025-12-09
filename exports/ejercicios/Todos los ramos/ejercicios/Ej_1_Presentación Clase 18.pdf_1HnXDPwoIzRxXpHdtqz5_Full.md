--- Page 1 ---
(PUC)   Clase 18   Agosto 2022   1 / 10  Sistemas de coordenadas  Introducci´ on al ´ Algebra Lineal - MAT1279-1299  Facultad de Matem´ aticas, Pontificia Universidad Cat´ olica de Chile  Agosto 2022

--- Page 2 ---
Sistemas de coordenadas  Teorema. (Teorema de representaci´ on ´ unica)  Sea   B   =   { b 1 , . . . ,   b n }   una base para un espacio vectorial   V   . As´ ı, para cada   x   en   V   , existe un conjunto ´ unico de escalares   c 1 , . . . ,   c n   tal que  x   =   c 1 b 1   +   · · ·   +   c n b n   .  (PUC)   Clase 18   Agosto 2022   2 / 10

--- Page 3 ---
Sistemas de coordenadas  Definici´ on.  Suponga que   B   =   { b 1 , . . . ,   b n }   es una base para   V   y que   x   est´ a en   V   . Las   coordenadas de x respecto de la base   B   (o las   B -coordenadas de x ) son los pesos   c 1 , . . . ,   c n   tales que   x   =   c 1 b 1   +   · · ·   +   c n b n . Si   c 1 , . . . ,   c n   son las   B -coordenadas de   x , entonces el vector en   R n  [ x ]  B   =      c 1  . . .  c n      es el   vector de coordenadas de x (respecto de   B ), o el vector de  B -coordenadas de x . El mapeo   x   7   →   [ x ]  B   es el   mapeo de coordenadas (determinado por   B )  (PUC)   Clase 18   Agosto 2022   3 / 10

--- Page 4 ---
Sistemas de coordenadas  EJEMPLO 1   Considere una base   B   =   { b 1 ,   b 1 }   para   R 2 , donde  b 1   =  [ 1 0  ]  y   b 2   =  [ 1 2  ]  . Suponga que   x   en   R 2   tiene el vector coordenadas   [ x ]  B   =  [ − 2 3  ]  . Determine   x .  EJEMPLO 2   Las entradas en el vector   x   =  [ 1 6  ]  son las coordenadas de   x   respecto de la base est´ andar   E   =   { e 1 ,   e 1 } , ya que  [ 1 6  ]  = 1   ·  [ 1 0  ]  6   ·  [ 0 1  ]  = 1   ·   e 1   + 6   ·   e 2  Si   E   =   { e 1 ,   e 2 } , entonces   [ x ]  E   =   x  (PUC)   Clase 18   Agosto 2022   4 / 10

--- Page 5 ---
Sistemas de coordenadas  Coordenadas en   R n  EJEMPLO 3   Sean   b 1   =  [ 2 1  ]  ,   b 2   =  [ − 1 1  ]  ,   x   =  [ 4 5  ]  y   B   =   { b 1 ,   b 2 } . Determine el vector de coordenadas   [ x ]  B   de   x   respecto de   B .  (PUC)   Clase 18   Agosto 2022   5 / 10

--- Page 6 ---
Sistemas de coordenadas  Coordenadas en   R n  Sean   B   =   { b 1 , . . . ,   b n }   una base de   R n   y  P B   =   [ b 1   b 2   · · ·   b n  ]   .  La ecuaci´ on vectorial  x   =   c 1 b 1   +   x 2 b 2   +   · · ·   +   c n b n  es equivalente a  x   =   P B  [ x ]  B  P B   se llama   matriz de cambio de coordenadas   de   B   a la base est´ andar en   R n . Como las columnas de   P B   forman una base de   R n , entonces   P B   es invertible. Entonces  P − 1  B   x   =   [ x ]  B  (PUC)   Clase 18   Agosto 2022   6 / 10

--- Page 7 ---
Sistemas de coordenadas  El mapeo de coordenadas  La elecci´ on de una base   B   =   { b 1 , . . . ,   b n }   de un espacio vectorial   V  introduce un sistema de coordenadas en   V   . El mapeo de coordenadas  x   7   →   [ x ]  B   conecta al espacio   V   , posiblemente desconocido, con el conocido espacio   R n . V  [ ] B  [ x ] B x  El mapeo de coordenadas de   V   sobre   .  (PUC)   Clase 18   Agosto 2022   7 / 10

--- Page 8 ---
Sistemas de coordenadas  El mapeo de coordenadas  Teorema.  Sea   B   =   { b 1 , . . . ,   b n }   una base para un espacio vectorial   V   . As´ ı, el mapeo de coordenadas   x   7   →   [ x ]  B   es una transformaci´ on lineal uno a uno y sobreyectiva de   V   en   R n . El mapeo de coordenadas en el teorema anterior es un importante ejemplo de un isomorfismo de   V   en   R n . En general, una transformaci´ on lineal uno a uno de un espacio vectorial V en un espacio vectorial   W   se llama isomorfismo de   V   en   W   (el t´ ermino proviene de los vocablos griegos iso, que significa “lo mismo”, y morf´ e, que significa “forma” o “estructura”). La notaci´ on y la terminolog´ ıa para   V   y   W   pueden diferir, pero los dos espacios son indistinguibles como espacios vectoriales. Cada c´ alculo de espacio vectorial en   V   se reproduce con exactitud en   W   , y viceversa. En particular, cualquier espacio vectorial real con una base de   n   vectores es indistinguible de   R n .  (PUC)   Clase 18   Agosto 2022   8 / 10

--- Page 9 ---
Sistemas de coordenadas  El mapeo de coordenadas  EJEMPLO 4   Sea   B   la base est´ andar del espacio   P 3   de polinomios; es decir, sea   B   =   { 1 ,   t ,   t 2 ,   t 3 } . Un elemento t´ ıpico   p   de   P 3   tiene la forma  p ( t ) =   a 0   +   a 1 t   +   a 2 t 2   +   a 3 t 3  Como   p   ya es combinaci´ on lineal de los elementos de la base se sigue que  [ p ]  B   =       a 0  a 1  a 2  a 3        .  As´ ı, el mapeo de coordenadas   p   7   →   [ p ]  B   es un isomorfismo de   P 3  sobre   R 4 .  (PUC)   Clase 18   Agosto 2022   9 / 10

--- Page 10 ---
Sistemas de coordenadas  El mapeo de coordenadas  EJEMPLO 5   Utilice vectores de coordenadas para comprobar que los polinomios 1 + 2 t 2 , 4 +   t   + 5 t 2   y 3 + 2 t   son linealmente dependientes en   P 2 .  EJEMPLO 6   Sea  v 1   =     3 6 2      ,   v 2   =     − 1 0 1      ,   x   =     3 12 7      .  B   =   { v 1 ,   v 2 }   es una base para   H   = Gen { v 1 ,   v 2 } . Determine si   x   se encuentra en   H   y, si lo est´ a, encuentre el vector de coordenadas de   x  respecto de   B .  (PUC)   Clase 18   Agosto 2022   10 / 10

