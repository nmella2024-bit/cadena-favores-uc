---
title: "Ejercicio 11"
topic: "General"
number: "11"
originalUrl: "exports/downloads/Todos los ramos/I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
sourceFile: "I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
---

Suponga que los puntajes en la prueba de lenguaje y ranking de ense˜ nanza media se comportan seg´ un una Normal Bivariada. Considerando solo los registros que tienen informaci´ on en ambos casos, calcule la probabilidad que un alumno cualquiera obtenga sobre   [x]   puntos en Ranking y Lenguaje al mismo tiempo.  Soluci´ on  ## EJEMPLO: X = Base$PSU_L Y = Base$RANKING Data = na.omit(cbind(X,Y)) mu = apply(Data, 2, mean) sigma = cov(Data) x = 710 mvtnorm::pmvnorm(lower = c(x,x), upper = c(Inf, Inf), mean = mu, sigma = sigma)[1] [1] 0.09827398  Puntaje: Respuesta correcta con margen de error   ± 0 . 005   [1.0 puntos]. Sin respuesta en canvas, pero respaldo correcto   ± 0 . 005   [0.5 puntos]. Para otros casos correctamente justificados por parte del alumno, los ayudantes podr´ an asignar m´ aximo [0.5 puntos].  EYP1113 - Probabilidad y Estad´ ıstica Segundo Semestre 2021  12   Profesores: Ricardo Aravena Cuevas Ricardo Olea Ortega Felipe Ossa Monge Pilar Tello Hern´ andez

--- Page 13 ---