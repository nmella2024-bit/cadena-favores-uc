---
title: "Documento Completo"
topic: "General"
number: "1"
originalUrl: "exports/downloads/Todos los ramos/Clase 5 - Funciones recursivas.pdf_1vTbk9DDKtwTYyKoovMp.pdf"
sourceFile: "Clase 5 - Funciones recursivas.pdf_1vTbk9DDKtwTYyKoovMp.pdf"
---

--- Page 1 ---
IIC1103  Clase 5: Funciones recursivas. Nicol´ as Alvarado - Francisca Cattan  Universidad Cat´ olica de Chile  8 de enero, 2024

--- Page 2 ---
En la clase pasada...  ▶   Aprendimos a hacer importar m´ odulos usando la instrucci´ on import. En particular, se usaron los m´ odulos   math, random .  ▶   Aprendimos a escribir funciones propias con la siguiente estructura:  1   def   nombre_funcion ( x1 ,   x2 ,   ...) :  2   # funcionamiento  3   return   output

--- Page 3 ---
Funciones recursivas  Qu´ e es para ustedes la recursi´ on?

--- Page 4 ---
Funciones recursivas  Qu´ e es para ustedes la recursi´ on? La   recursi´ on   es la estrategia de implementaci´ on de funciones en la cual se usa la misma definici´ on de la funci´ on, como parte del funcionamiento de la misma.

--- Page 5 ---
Funciones recursivas  Qu´ e es para ustedes la recursi´ on? La   recursi´ on   es la estrategia de implementaci´ on de funciones en la cual se usa la misma definici´ on de la funci´ on, como parte del funcionamiento de la misma.  1   def   fun ( n ) :  2   if   n ==0   or   n ==1:  3   return   1  4   else :  5   return   n * fun (n -1)

--- Page 6 ---
Funciones recursivas  Importante!!!!  ▶   Las llamadas a funci´ on se repiten.  ▶   La recursi´ on   debe   terminar en alg´ un momento.

--- Page 7 ---
Funciones recursivas  Probemos el ejemplo anterior en colab sin las l´ ıneas 2 y 3.

--- Page 8 ---
Funciones recursivas  Un par de observaciones:  ▶   Las funciones recursivas deben tener casos base.  ▶   Una funci´ on recursiva funcionar´ a bien en cuanto las llamadas recursivas lleguen a casos base.

--- Page 9 ---
Funciones recursivas  En general tenemos la siguiente estructura:  1   def   recursion () :  2   ...  3   recursion ()   # llamada   recursiva  4   ...

--- Page 10 ---
Funciones recursivas  Veamos algunos ejemplos:  1   def   fun ( n ) :  2   if   n !=0:  3   return   n   +   fun (n -1)  4   else :  5   return   0

--- Page 11 ---
Funciones recursivas  Veamos algunos ejemplos:  1   def   fun ( n ) :  2   if   n !=0:  3   return   n   +   fun (n -1)  4   else :  5   return   0  1   def   fun ( n ) :  2   if   n   ==   0:  3   return   0  4   elif   n   ==   1:  5   return   1  6   else :  7   return   fun (n -1) +   fun (n -2)  8   for   i   in   range (10) :  9   print ( fun ( i ) )

--- Page 12 ---
Funciones recursivas  Otro ejemplo:  1   def   fun (n ,   x ) :  2   if   x   ==   0:  3   imprimir   =   " * _ "   *   (n -1)   +   " * "  4   print ( imprimir )  5   fun (n ,   x   +   1)  6   elif   x   ==   n :  7   return  8   elif   n   >   x :  9   imprimir   =   " _ " *( n -( n   -   x ) ) + " * _ "   *   (( n   -   x ) -1)   +   " * "  10   print ( imprimir )  11   fun (n ,   x   +   1)  12   a   =   int ( input () )  13   fun (a ,   0)

--- Page 13 ---
Funciones recursivas  Resolvamos algunos ejercicios:  ▶   Escriba una funci´ on recursiva que reste de 3 unidades a un entero positivo y llegue a 0.  ▶   Escriba una funci´ on recursiva que calcule la potencia positiva de un n´ umero.  ▶   Escriba una funci´ on recursiva que encuentre el m´ aximo com´ un divisor entre dos n´ umeros.  ▶   Escriba una funci´ on recursiva que calcule la suma arm´ onica.

--- Page 14 ---
Funciones recursivas  Sigamos con ejemplos:  1   def   fun1 (n ,   k ) :  2   if   k   ==   0   or   k   ==   n :  3   return   1  4   else :  5   return   fun1 (n -1 ,   k -1)   +   fun1 (n -1 ,   k )  6   def   fun2 ( n ) :  7   a   =   []  8   for   i   in   range ( n ) :  9   b =   []  10   for   j   in   range ( i   +   1) :  11   b . append ( fun1 (i ,   j ) )  12   a . append ( b )  13   return   a

--- Page 15 ---
Funciones recursivas  Sigamos con ejemplos:  1   def   fun1 (x ,   y = None ) :  2   if   y   is   None :  3   y   =   x   -   1  4   if   x   <   2:  5   return   False  6   elif   y   ==   1:  7   return   True  8   elif   x   %   y   ==   0:  9   return   False  10   else :  11   return   fun1 (x ,   y   -   1)  12   def   fun2 ( inicio ,   fin ) :  13   if   inicio   <=   fin :  14   if   fun1 ( inicio ) :  15   print ( inicio )  16   fun2 ( inicio   +   1 ,   fin )

--- Page 16 ---
Funciones recursivas  Resolvamos algunos ejercicios:  ▶   Escriba una funci´ on que reciba un intervalo de n´ umeros y los imprima de mayor a menor. Su funci´ on debe ser recursiva.  ▶   Escriba una funci´ on recursiva que encuentre el minimo com´ un multiplo entre dos n´ umeros.  ▶   Escriba una funci´ on recursiva que reciba como input dos strings. La funcion debe retornar la concatenaci´ on del primer string con el segundo, repetidas veces hasta superar 7 veces el largo del primer string.

