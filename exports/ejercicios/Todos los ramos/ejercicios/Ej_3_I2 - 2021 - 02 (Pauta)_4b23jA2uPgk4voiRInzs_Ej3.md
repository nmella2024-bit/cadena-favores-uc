---
title: "Ejercicio 3"
topic: "General"
number: "3"
originalUrl: "exports/downloads/Todos los ramos/I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
sourceFile: "I2 - 2021 - 02 (Pauta)_4b23jA2uPgk4voiRInzs.pdf"
---

Durante las apelaciones de 1ra instancia, a cada ayudante se le asigna una sola pregunta a revisar, para mantener la misma mano en este proceso de revisi´ on. Suponga que una pregunta en particular, la probabilidad que una apelaci´ on logre puntaje completo es igual a   [p] . ¿Cu´ al es la probabilidad que el ayudante asigne puntaje completo por 3ra vez, despu´ es de vig´ esima revisi´ on en esa pregunta?  Soluci´ on  Sea X el n´ umero de pruebas revisadas hasta observar por 3ra vez un caso que amerita puntaje completo.  X   ∼   Bin-Neg( k   = 3 , p   =   [p] ) Se pide   P   ( X >   20) =   1 - pnbinom(20-3, size = 3, prob = p) .  ## EJEMPLO: p = 0.07 pnbinom(20-3, size = 3, prob = p, lower.tail = F) [1] 0.8389971 1-pnbinom(20-3, size = 3, prob = p, lower.tail = T) [1] 0.8389971  Sea Y el n´ umero de pruebas que ameritan puntaje completo entre las primeras 20 revisiones.  Y   ∼   Binomial( n   = 20 , p   =   [p] ) Se pide   P   ( Y   ≤   2) =   pbinom(3-1, size = 20, prob = p) .  ## EJEMPLO: p = 0.07 pbinom(3-1, size = 20, prob = p, lower.tail = T) [1] 0.8389971 1-pbinom(3-1, size = 20, prob = p, lower.tail = F) [1] 0.8389971  Puntaje: Respuesta correcta con margen de error   ± 0 . 005   [1.0 puntos]. Responder correctamente el complemento   ± 0 . 005   [0.5 puntos]. Sin respuesta en canvas, pero respaldo correcto   ± 0 . 005   [0.5 puntos]. Para otros casos correctamente justificados por parte del alumno, los ayudantes podr´ an asignar m´ aximo [0.5 puntos].  EYP1113 - Probabilidad y Estad´ ıstica Segundo Semestre 2021  3   Profesores: Ricardo Aravena Cuevas Ricardo Olea Ortega Felipe Ossa Monge Pilar Tello Hern´ andez

--- Page 4 ---