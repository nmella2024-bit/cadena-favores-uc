---
title: "Ejercicio 4"
topic: "General"
number: "4"
originalUrl: "exports/downloads/Todos los ramos/I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
sourceFile: "I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
---

Estudios muestran que, en espacios cerrados y expuestos al virus por varios minutos, un   [p]   % de las perso- nas se contagian de Covid19. Suponga que durante una evaluaci´ on presencial un total de   [N]   alumnos con ant´ ıgenos negativos, son ex- puestos (involuntariamente) al contagio, dado que uno de los cuidadores esta contagiado (y se ha paseado por todas las salas). Una vez concluida la evaluaci´ on, una muestra de   [n]   alumnos son sometidos a un test de ant´ ıgenos certero. Determine la probabilidad que al menos tres alumnos se hayan contagiados de Covid19  Soluci´ on  Sea   X   el n´ umero de contagiados en la muestra.  X   ∼   Hipergeometrica( n   =   [n] , N   =   [N] , m   =   [N]   ·   [p] / 100) Se pide   P   ( X   ≥   3) =   1 - phyper(2, m = N * p/100, n = N - N * p/100, k = n) .  ## EJEMPLO: N = 150 p = 30 m = N * p/100 n = 12 1-phyper(2, m = m, n = N-m, k = n, lower.tail = T) [1] 0.7580152 phyper(2, m = m, n = N-m, k = n, lower.tail = F) [1] 0.7580152  Puntaje: Respuesta correcta con margen de error   ± 0 . 005   [1.0 puntos]. Responder correctamente el complemento   ± 0 . 005   [0.5 puntos]. Sin respuesta en canvas, pero respaldo correcto   ± 0 . 005   [0.5 puntos]. Para otros casos correctamente justificados por parte del alumno, los ayudantes podr´ an asignar m´ aximo [0.5 puntos].  EYP1113 - Probabilidad y Estad´ ıstica Segundo Semestre 2021  4   Profesores: Ricardo Aravena Cuevas Ricardo Olea Ortega Felipe Ossa Monge Pilar Tello Hern´ andez

--- Page 5 ---