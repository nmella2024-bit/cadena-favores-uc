---
title: "Ejercicio 2"
topic: "General"
number: "2"
originalUrl: "exports/downloads/Todos los ramos/Examen 2015 s2_3Z7VEajiuOkiEhlwDmAn.pdf"
sourceFile: "Examen 2015 s2_3Z7VEajiuOkiEhlwDmAn.pdf"
---

(60 puntos) La función   insertar , mostrada abajo, utiliza la idea de búsqueda binaria para insertar un número dentro de una una lista de números, suponiendo que dicha lista se encuentra ordenada ascendente- mente. Luego de retornar, la lista sigue estando ordenada ascendentemente. La función recibe en el primer argumento a la lista y en el segundo al elemento a insertar. Así, para insertar el elemento   4   en la lista   lista , se hace el siguiente llamado:  insertar(lista,4)  Abajo se muestra el código de la función con algunas partes reemplazadas con recuadros que debes rellenar, marcados como   1?   ,   2?   y   3?   .  def   comparacion(x,y): return   1? def   insertar(lista, elemento): i   =   0 j   =   len(lista)-1 while i <= j: medio =   2?   // 2 if comparacion(elemento,lista[medio]): j = medio - 1 else: i = medio + 1 lista.insert(   3?   ,elemento)  1. (40 puntos) Di cómo completar en código en cada uno de estos recuadros para que la fun- ción haga lo que se supone debe hacer. (En tu hoja de respuesta, escribe a qué corresponde  1?   ,   2?   y   3?   ) 2. (20 puntos) Escribe la función más simple que puedas para ordenar una lista de números y que use la función   insertar . 8

--- Page 9 ---
Ejemplo solución problema 2  def   comparacion(x,y): return x < y def   insertar(lista, elemento): i=0 j=len(lista)-1 while i <= j: medio = (i + j) // 2 if comparacion(elemento,lista[medio]): j = medio - 1 else: i = medio + 1 lista.insert(i,elemento) def   ordenar(l): ordenada = [] for   x in l: insertar(ordenada,x) return ordenada  Criterios de evaluación problema 2 Nota : en la parte a), no hay puntajes intermedios, los códigos en los recuadros deben ser correctos, por eso se desglosa en los recuadros 1, 2 y 3.  Aspecto   No logrado   Logrado con ob- servaciones Logrado  Completar   código   faltante. No hay puntajes intermedios, el código dentro de los re- cuadros debe ser exacto (40 puntos) Sin código (0 pts)   No hay evaluación con observaciones, código debe ser ex- acto. Primer recuadro ( x<y ) o ( x<=y ) (10 pts) Segundo   re- cuadro   ( i+j ) (10 pts) Tercer   recuadro ( i ) o ( j+1 ) (20 pts) Función   que   llame   a  insertar   para   insertar un elemento en una lista en forma ordenada (20 pts) Sin   código,   o código   tiene errores   mayores (0 pts) Código con errores menores (10 pts) Código   correcto (20 pts) 9

--- Page 10 ---