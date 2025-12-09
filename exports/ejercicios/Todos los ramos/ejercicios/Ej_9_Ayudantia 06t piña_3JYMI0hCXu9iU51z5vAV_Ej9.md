---
title: "Ejercicio 9"
topic: "General"
number: "9"
originalUrl: "exports/downloads/Todos los ramos/Ayudantia 06t piña_3JYMI0hCXu9iU51z5vAV.pdf"
sourceFile: "Ayudantia 06t piña_3JYMI0hCXu9iU51z5vAV.pdf"
---

Considere la serie armónica   ∞ ∑  k =1 1  k   . Demuestre que   R n   =   S n   −   ln( n )   es una sucesión positiva y decreciente donde   S n   =   n ∑  k =1 1  k   . Solución: Se tiene que   S n   =   n ∑  k =1 1  k   y   R n   =   S n   −   ln( n ) . Veamos el siguiente gráfico:  Podemos notar que el área bajo la curva   f   ( x ) =   1  x   (achurada) es menor que el área de los rectángulos, que representan a la serie   S n   =   n ∑  k =1 1  k   . Por esta razón, se tiene que (comparación serie-integral):  n ∑  k =1  1  k  >  ∫   n  1  1  x d x   = ln( n )  Donde se tiene que:  n ∑  k =1  1  k  >   ln( n )  R n   =  n ∑  k =1  1  k   −   ln( n )   >   0  Por lo que queda demostrado que   R n   es una sucesión positiva. Luego, debemos demostrar que   R n   sea decreciente. De esta forma, se quiere probar una de las tres opciones siguientes: a)   R n +1   < R n  b)   R n +1  R n   <   1  c)   R n   →   R ( x ) :   R ′ ( x )   <   0  Para este caso usaremos la primera opción (note que en este caso no es tan sencillo derivar debido a la formulación de   R n : se compone de una sumatoria y una función). Luego, 20

--- Page 21 ---
R n +1   < R n  R n +1   −   R n   <   0  S n +1   −   ln( n   + 1)  ︸   ︷︷   ︸  R n +1  −   [ S n   −   ln( n )]  ︸   ︷︷   ︸  R n  <   0  S n   +   1  n   + 1   −   ln( n   + 1)   −   S n   + ln( n )   <   0 1  n   + 1   −   ln  ( n   + 1  n  )  <   0  Para que esto se cumpla   ∀ n   ∈   N , se debe cumplir su versión continua   ∀ x   ≥   1 .  1  x   + 1   −   ln  ( x   + 1  x  )  <   0  Análogamente, queremos que   ∀ x   ≥   1 :  ln  ( x   + 1  x  )  −   1  x   + 1   >   0  Sea   f   ( x ) = ln   ( x +1  x  )   −   1  x +1   . Para asegurarnos que   f   ( x )   sea siempre positiva y se cumpla siempre la relación anterior tenemos dos casos: 1.   Caso 1:   f   ( x 0 )   >   0   y   f   ′ ( x )   >   0   para algún   x 0   ≥   1   y   ∀ x   ≥   x 0  2.   Caso 2:   f   ( x 0 )   >   0   y   f   ′ ( x )   <   0   y   l´ ım  x →∞   f   ( x 0 )   ≥   0   para algún   x 0   ≥   1   y   ∀ x   ≥   x 0  Partamos con el Caso 1. Sea   x 0   = 1   y   x   ≥   1 :  f   ( x 0 ) =   f   (1) = ln(2)   −   1 2   ≈   0 , 193   >   0   se cumple  f   ′ ( x ) =   −   1  x ( x   + 1) 2   >   0   no se cumple para   x   ≤   1  Veamos el Caso 2. Sea   x 0   = 1   y   x   ≥   1 :  f   ( x 0 ) =   f   (1) = ln(2)   −   1 2   ≈   0 , 193   >   0   se cumple  f   ′ ( x ) =   −   1  x ( x   + 1) 2   <   0   se cumple para   x   ≤   1  21

--- Page 22 ---
l´ ım  x →∞   f   ( x ) = l´ ım  x →∞   ln  ( x   + 1  x  )  −   1  x   + 1  = l´ ım  x →∞   ln  (  1 +  1  x  )  −   1  x   + 1  = 0 − 0   ≤   0   se cumple Por lo tanto, se tiene que:  ln  ( x   + 1  x  )  −   1  x   + 1   >   0  Y, del mismo modo,  ln  ( n   + 1  n  )  −   1  n   + 1   >   0 1  n   + 1   −   ln  ( n   + 1  n  )  <   0  R n +1   −   R n   <   0  Finalmente,   R n   es decreciente. 22

--- Page 23 ---