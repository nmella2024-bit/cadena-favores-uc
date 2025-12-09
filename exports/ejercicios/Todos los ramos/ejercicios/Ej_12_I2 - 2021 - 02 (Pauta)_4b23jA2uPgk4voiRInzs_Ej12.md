---
title: "Ejercicio 12"
topic: "General"
number: "12"
originalUrl: "exports/downloads/Todos los ramos/I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
sourceFile: "I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
---

Suponga que los puntajes en la prueba de lenguaje y ciencia se comportan seg´ un una Normal Bivariada. Considerando solo los registros que tienen informaci´ on en ambos casos, calcule la probabilidad que un alumno obtenga m´ as de   [x]   puntos en lenguaje, dado que presenta   [y]   puntos en ciencias.  Soluci´ on  ## EJEMPLO: X = Base$PSU_L Y = Base$PSU_C Data = as.data.frame(na.omit(cbind(X,Y))) mu.x = mean(Data$X) mu.y = mean(Data$Y) sigma.x = sd(Data$X) sigma.y = sd(Data$Y) rho = cor(Data$X, Data$Y) x = 680 y = 790 mu = mu.x+(y - mu.y)*sigma.x*rho/sigma.y sigma = sigma.x*sqrt(1-rho^2) pnorm(x, mean = mu, sd = sigma, lower.tail = F) [1] 0.8188135  Puntaje: Respuesta correcta con margen de error   ± 0 . 005   [1.0 puntos]. Sin respuesta en canvas, pero respaldo correcto   ± 0 . 005   [0.5 puntos]. Para otros casos correctamente justificados por parte del alumno, los ayudantes podr´ an asignar m´ aximo [0.5 puntos].  EYP1113 - Probabilidad y Estad´ ıstica Segundo Semestre 2021  13   Profesores: Ricardo Aravena Cuevas Ricardo Olea Ortega Felipe Ossa Monge Pilar Tello Hern´ andez