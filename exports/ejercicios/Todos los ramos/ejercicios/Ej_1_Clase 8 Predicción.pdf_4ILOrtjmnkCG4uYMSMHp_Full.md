---
title: "Documento Completo"
topic: "General"
number: "1"
originalUrl: "exports/downloads/Todos los ramos/Clase 8 Predicción.pdf_4ILOrtjmnkCG4uYMSMHp.pdf"
sourceFile: "Clase 8 Predicción.pdf_4ILOrtjmnkCG4uYMSMHp.pdf"
---

--- Page 1 ---
ˇˇ  Econometr´ ıa I - EAE- 250-A  Prediccion Ezequiel Garcia-Lembergman  Instituto de Econom´ ıa - Pontificia Universidad Cat ´ olica de Chile

--- Page 2 ---
Predicci ´ on  Introducci ´ on  •   Hoy vamos a discutir como hacer predicciones con intervalo de confianza.  ◦   ¿Con qu ´ e probabilidad puedo descartar que una acci ´ on caer ´ a a un precio menor a 5 dado sus caracter´ ısticas?  ◦   ¿Con qu ´ e probabilidad puedo estar seguro que una persona con determinadas caracteristicas re-pagara su deuda?  1

--- Page 3 ---
Predicci ´ on  Intervalos de Confianza para la predicci ´ on  •   Suponga que se obtiene los estimadores MCO,   ˆ β   y que se cumplen los supuestos clasicos para una muestra de   n   observaciones.  •   Dado los   ˆ β   y valores para las variables   x   ( x τ   ), es facil construir la prediccion  ˆ y τ   .  •   Queremos obtener intervalos de confianza para una predicci ´ on a partir de la l´ ınea de regresi ´ on de MCO  •   Esto me va a permitir decir no solo la prediccion para un individuo en particular, sino tambien entre que rangos esta la verdadera variable de ese individuo con cierto nivel de confianza.  •   Por ejemplo, si usted tiene que determinar si darle un credito o no a Sofia, estas herramientas van a permitirle decir: dadas las caracteristicas de Sofia, la prediccion es que va a repagar el credito con un 70% de probabilidad. Ademas, con 95% de confianza la probabilidad va a estar entre 50% y 80%.  2

--- Page 4 ---
Predicci ´ on  Ejemplo: Prediccion de Notas en la universidad  •   Suponga que el director de una universidad esta decidiendo que alumnos va a admitir el siguiente anio. Para ello quiere predecir el promedio que los aplicantes obtendran en la universidad (entre 0 y 4). En base a datos de ex alumnos de la universidad, el director estima el siguiente modelo:  NotaUniversidad i   =   β 0   +   β 1 SAT i   +   0 . 40 NotaHighSchool i   +   u  Obtiene por MCO:  •   donde SAT es el puntaje en la SAT que va de 0 a 1500).  •   Al estimar por MCO obtiene:  ˆ NotaUniversidad   =   1   +   0 . 00149 SAT   +   0 . 40 NotaHighSchool  •   Una aplicante, Sofia, tiene   SAT   =   900 y su promedio de notas en el high school era de 3. Su vector de x’s es:   x τ   = ( 1 ,   900 ,   3 ) . Reemplazando en la prediccion, predecimos que va a obtener nota 3 en la universidad.  ˆ NotaUniversidad τ   =   3  3

--- Page 5 ---
Predicci ´ on  Prediccion individual y prediccion promedio  •   Hoy vamos a construir intervalos de confianza para dos tipos de predicciones:  1.   Prediccion individual:   busca predecir el valor de   y   para un individuo en particular. Para el individuo   τ   , Predecir:   y τ   =   x >  τ   β   +   u τ   .  →   Ejemplo: el   y   predicho para un individuo con caracteristicas   x >  τ   . 2.   Prediccion media o promedio:   busca predecir el valor promedio de y: Predecir:   E [ y τ   | X   ] =   x >  τ   β .  →   Ejemplo, el promedio de   y   para los individuos con caracteristicas   x >  τ  •   Ambas alternativas dan lugar a la misma predicci ´ on ( ˆ y τ   ), pero diferentes intervalos de confianza, ya que difieren en la varianza del error de predicci ´ on.  4

--- Page 6 ---
Predicci ´ on  Predicci ´ on individual: intervalos de confianza  •   Definiciones:  ◦   y τ   el valor para el cual se desea construir un intervalo de confianza (e.g:   τ   es un individuo que no esta en la muestra).  ◦   sea   x τ, 1 , ...,   x τ, k   los nuevos valores de las variables independientes  ◦   u τ   el error no observado para el individuo   τ   .  •   Usando los   ˆ β   de nuestra regresion MCO original, el mejor estimador (MELI) de   y τ   es  ˆ y τ   =  ˆ β 0   +  ˆ β 1 x τ, 1   +   ...   +  ˆ β k   x τ, k   =   x >  τ   ˆ β  •   En la practica esto es bien sencillo. ‘’MCO me dio los estimadores   ˆ β , asi que decime los valores para la variable independiente, reemplazo y te doy mi prediccion”.  •   Pero, queremos construir los intervalos de confianza para esa prediccion.  5

--- Page 7 ---
Predicci ´ on  Predicci ´ on individual  •   Definiendo el error de prediccion como   ˆ e τ   =   y   −   y τ   .  •   El intervalo para   y τ   es  ˆ y τ   −   t α/ 2 s . e . (ˆ e τ   )   ≤   y τ   ≤   ˆ y τ   +   t α/ 2 s . e . (ˆ e τ   )  donde  s . e . (ˆ e τ   ) =  √  ˆ σ 2 ( x >  τ   ( X   > X   ) − 1 x τ   +   1 )  •   Noten que los dos limites son calculables con los datos. Es decir, me permite decir: para un individuo con caracteristicas   x τ   , predigo el valor   ˆ y τ   . Ademas, con 1   −   α % de confianza, el valor verdadero   y τ   se encuentra entre los limites.  6

--- Page 8 ---
Predicci ´ on  Ejemplo: Prediccion de Notas en la universidad  •   Suponga que el director de una universidad esta decidiendo que alumnos va a admitir el siguiente anio. Para ello quiere predecir el GPA que los aplicantes obtendran en la universidad. En base a datos de ex alumnos de la universidad, el director hace la siguiente regresion MCO.  ˆ NotaUniversidad i   =   1   +   0 . 00149 SAT   +   0 . 40 NotaHighSchool i  •   donde SAT es el puntaje en la SAT (de 0 a 1500).  •   Una aplicante, Sofia, tiene   SAT   =   900 y su GPA en el high school era de 3. Eso les da una prediccion de la nota en la universidad de   ˆ y sofia   =   3.  •   Suponga que, ademas, cuenta con los siguientes datos: √ ˆ σ 2 ( x >  τ   ( X   > X   ) − 1 x τ   ) +   1 ) =   0 . 204  •   Construya el intervalo de confianza para   α   =   5%.  •   Nota de sofia en la universidad: 2 . 6   <   NotaUniversidad sofia   <   3 . 4.  •   Entonces, puede concluir que la prediccion para Sofia es 3. Ademas, con 95% de confianza Sofia obtendra un GPA en la universidad entre 2.6 y 3.4.  7

--- Page 9 ---
Predicci ´ on  Predicci ´ on individual en Modelo Simple  •   Se puede demostrar que en el modelo simple de una variable explicativa:  ˆ y τ   −   t α/ 2 s . e . (ˆ e τ   )   ≤   y τ   ≤   ˆ y τ   +   t α/ 2 s . e . (ˆ e τ   )  con   s . e . (ˆ e τ   ) =  √  ˆ σ 2  (   ( x τ   1   − x ) 2  ∑ n i = 1   ( x i   − x ) 2   +   1  n   +   1  )  .  •   Esto implica que la incertidumbre de la predicci ´ on es menor cuando:  ◦   x τ   1   est ´ a cerca de   x  ◦   El tama ˜ no de la muestra es m ´ as grande  ◦   El valor de   σ 2   es menor  8

--- Page 10 ---
Predicci ´ on  Predicci ´ on promedio  •   Ahora se busca encontrar un intervalo de confianza para la persona promedio de la poblacion.  •   Como antes, el mejor estimador (MELI) de   E [ y τ   | X   ]   tambi ´ en es  ˆ y τ   =   x >  τ   ˆ β  •   Sea    τ   el error de predicci ´ on   τ   =   E [ y τ   | X   ]   −   ˆ y τ   =   x >  τ   ( β   −   ˆ β )  •   Se puede demostar que:  Var   [  τ   | X   ] =   σ 2 x >  τ   ( X   > X   ) − 1 x τ  →   Noten que ahora la varianza sera menor porque no esta el error no observable   u .  •   El intervalo de confianza para   E [ y τ   | X   ]   al 1   −   α   es  ˆ y τ   −   t α/ 2 s . e . (ˆ  τ   )   ≤   E [ y τ   | X   ]   ≤   ˆ y τ   +   t α/ 2 s . e . (ˆ  τ   )  donde   s . e . (ˆ  τ   ) =   √ ˆ σ 2 x >  τ   ( X   > X   ) − 1 x τ   .  9

--- Page 11 ---
Predicci ´ on  Conclusiones  •   Podemos construir predicciones y sus intervalos de confianza (que difieren dependiendo de si son individuales o promedios)  •   Mientr ´ as m ´ as poder explicativo tiene nuestro modelo, m ´ as precisas ser ´ an las predicciones.  10

