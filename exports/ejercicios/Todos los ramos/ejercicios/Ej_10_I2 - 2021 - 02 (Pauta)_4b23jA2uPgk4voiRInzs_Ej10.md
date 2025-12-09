---
title: "Ejercicio 10"
topic: "General"
number: "10"
originalUrl: "exports/downloads/Todos los ramos/I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
sourceFile: "I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
---

Suponga que los puntajes obtenido en matem´ atica se comportan como una variable aleatoria Log-Normal. Basado en los percentiles   [p]   % y   [q]   %, calcule la probabilidad que un alumno cualquiera obtenga m´ as de  [x]   puntos en la prueba PSU matem´ atica.  Soluci´ on  ## EJEMPLO: X = Base$PSU_M p = 0.25 q = 0.85 xp = quantile(X, p, na.rm = T) xq = quantile(X, q, na.rm = T) zeta = (log(xp)-log(xq))/(qnorm(p)-qnorm(q)) lambda = log(xp)-zeta*qnorm(p) x = 690 plnorm(x, meanlog = lambda, sdlog = zeta, lower.tail = F) [1] 0.258903  Puntaje: Respuesta correcta con margen de error   ± 0 . 005   [1.0 puntos]. Sin respuesta en canvas, pero respaldo correcto   ± 0 . 005   [0.5 puntos]. Para otros casos correctamente justificados por parte del alumno, los ayudantes podr´ an asignar m´ aximo [0.5 puntos].  EYP1113 - Probabilidad y Estad´ ıstica Segundo Semestre 2021  11   Profesores: Ricardo Aravena Cuevas Ricardo Olea Ortega Felipe Ossa Monge Pilar Tello Hern´ andez

--- Page 12 ---