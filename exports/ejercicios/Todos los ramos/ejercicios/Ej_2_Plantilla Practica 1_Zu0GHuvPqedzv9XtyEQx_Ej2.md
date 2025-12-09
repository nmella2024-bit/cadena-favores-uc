---
title: "Ejercicio 2"
topic: "General"
number: "2"
originalUrl: "exports/downloads/Todos los ramos/Plantilla Practica 1_Zu0GHuvPqedzv9XtyEQx.pdf"
sourceFile: "Plantilla Practica 1_Zu0GHuvPqedzv9XtyEQx.pdf"
---

TUTORIAL: Tablas  Hacer tablas en L A T E Xes muy engorroso, por lo que presentamos 3 alternativas. Sin embargo, es necesario aclarar que para que se respete el formato de las tablas,   se tiene que poner el catión SOBRE la tabla. 2.1.   Generador online  Hay muchas páginas para generar tablas automáticamente, una alternativa es tablesgenerator, sin embargo, este método genera muchas líneas innecesarias y cuando se incorporan párrafos muy grandes hay que ajustar las palabras.  2.2.   Insertar una imagen como tabla  Se puede incorporar una imagen (De Excel, por ejemplo) como si fuera una tabla. El único inconveniente es que no va a permitir seleccionar el texto en el pdf generado. Al igual que con las imágenes, hay un comando personalizado y un código manual comentado. 1  \tableimage[label]{Titulo}{tamaño}{ruta_imagen}{Texto_referencia} Ejemplo: \tableimage[referencia3]{Tabla de referencia 1}{height=3cm}{img/tablaejemplo.png}{Texto}  Tabla 2-1: Titulo de la tabla de referencia  Fuente de los datos  1 Si no se quiere incluir el texto opcional, pueden dejar vacío la última celda ({})  6

--- Page 8 ---
2.3.   Usar plantilas  Pueden copiar y modificar el codigo siguiente:  Tabla 2-2: Tabla de referencia 2  Texto   Texto   Texto  Textoblabla   Textoblabla   Textoblabla Texto   Texto   Texto  Fuente de los datos.  Tabla 2-3: Tabla de referencia 3  Texto   Texto   Texto  Textoblabla   Textoblabla   Textoblabla Texto   Texto   Texto  Fuente de los datos.  7

--- Page 9 ---