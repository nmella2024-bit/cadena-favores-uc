---
title: "Ejercicio 2"
topic: "General"
number: "2"
originalUrl: "exports/downloads/Todos los ramos/Examen 2020-2 Parte 1_30p7sdMk1JldEINijCGC.pdf"
sourceFile: "Examen 2020-2 Parte 1_30p7sdMk1JldEINijCGC.pdf"
---

(15 pts):  Ahora estamos listos para construir un modelo de decisiones que tome en cuenta de mejor manera la in- certidumbre. Vamos a suponer aqu´ ı, que “se sabe” que los rendimientos del proceso, los par´ ametros   R km , pueden ser modelados siguiendo una distribuci´ on Normal cuya media la asumiremos igual a los datos que vienen en el c´ odigo, y que llamaremos  ¯ R km , pero la desviaci´ on est´ andar depende de qu´ e tan bien estimado est´ e el modelo del rendimiento, as´ ı que la asumiremos igual a   σ km   =   β   ×   ¯ R km , donde   β   representa el coefi- ciente de variaci´ on. Para que el modelo normal tenga sentido, es bueno asumir que se cumpla, al menos, que ¯ R km (1   −   3 β )   >   0 (¿por qu´ e?), lo que implica que   β   debiera ser   <   1 / 3, lo que asumiremos de aqu´ ı en adelante. 3

--- Page 4 ---
Observen que en este proceso industrial, el aserradero debe decidir qu´ e tipo de troncos proveer y procesar, eso es la planificaci´ on. Sin embargo, cuando la incertidumbre se manifieste en el futuro, ah´ ı se sabr´ a si el proceso tuvo ´ exito en satisfacer demanda o no. Esto hace la situaci´ on modelable mediante un esquema de Optimizaci´ on Bajo Incertidumbre de 2 etapas con Recurso. Les pedimos aqu´ ı que formulen este modelo es- toc´ astico de 2 etapas y lo codifiquen como un modelo de SAA usando como base el modelo de   Tactico2.py , con el costo de demanda insatisfecha determinado por ustedes en la