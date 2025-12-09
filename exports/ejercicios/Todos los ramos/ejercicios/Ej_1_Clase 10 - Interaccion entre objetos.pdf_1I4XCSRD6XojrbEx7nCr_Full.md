--- Page 1 ---
IIC1103 - Secci´ on 2  Clase 21: Interacci´ on entre objetos Prof. Francisca Cattan  Universidad Cat´ olica de Chile  14 de noviembre

--- Page 2 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos.

--- Page 3 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:

--- Page 4 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:  ▶   Las clases tienen atributos y m´ etodos (funciones).

--- Page 5 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:  ▶   Las clases tienen atributos y m´ etodos (funciones).  ▶   Si   x   es un objeto, accedemos a sus elementos como  x.atributo   y   x.metodo(.   .   .)

--- Page 6 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:  ▶   Las clases tienen atributos y m´ etodos (funciones).  ▶   Si   x   es un objeto, accedemos a sus elementos como  x.atributo   y   x.metodo(.   .   .)  ▶   Los m´ etodos de una clase siempre reciben como primer par´ ametro a   self , que representa al objeto con el que se est´ a trabajando.

--- Page 7 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:  ▶   Las clases tienen atributos y m´ etodos (funciones).  ▶   Si   x   es un objeto, accedemos a sus elementos como  x.atributo   y   x.metodo(.   .   .)  ▶   Los m´ etodos de una clase siempre reciben como primer par´ ametro a   self , que representa al objeto con el que se est´ a trabajando.  ▶   Existe un primer m´ etodo a llamar,   el constructor , que inicializa los objetos de la clase. La sintaxis de este m´ etodo es  init   (self,.   .   .)

--- Page 8 ---
Repaso clases  Python nos permite crear nuestras propias clases, es decir clasificaciones originales de valores y m´ etodos. Las clases comienzan siendo definidas con   class Nombre:  ▶   Las clases tienen atributos y m´ etodos (funciones).  ▶   Si   x   es un objeto, accedemos a sus elementos como  x.atributo   y   x.metodo(.   .   .)  ▶   Los m´ etodos de una clase siempre reciben como primer par´ ametro a   self , que representa al objeto con el que se est´ a trabajando.  ▶   Existe un primer m´ etodo a llamar,   el constructor , que inicializa los objetos de la clase. La sintaxis de este m´ etodo es  init   (self,.   .   .)  ▶   Cuando se crean objetos, deben pasarse como par´ ametros o argumentos las variables definidas en   init   , excepto por  self .

--- Page 9 ---
Metodo str  ▶   El metodo   str   nos ayuda a asociar la representaci´ on en string del objeto.  ▶   Se llama cuando invocamos las funciones print() o str().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo string.

--- Page 10 ---
Metodo str  ▶   El metodo   str   nos ayuda a asociar la representaci´ on en string del objeto.  ▶   Se llama cuando invocamos las funciones print() o str().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo string.  1   class   Animal () :  2   def   __init__ (self,   animal ,   especie ) :  3   self. animal   =   animal  4   self. especie   =   especie  5   def   __str__ (self) :  6   mensaje   =   " Yo   soy   un   {}   chilena   y   mi   especie   es   {} " . format (self. animal ,   self. especie )  7   return   mensaje  8   ani   =   Animal ( " ave " ,   " Caiquen " )  9   print ( ani )  10   s   =   str ( ani )   #   >>   ’ Yo   soy   un   ave   chilena   y   mi   especie   es Caiquen ’

--- Page 11 ---
Metodo str  ▶   El metodo   str   nos ayuda a asociar la representaci´ on en string del objeto.  ▶   Se llama cuando invocamos las funciones print() o str().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo string.  1   class   Animal () :  2   def   __init__ (self,   animal ,   especie ) :  3   self. animal   =   animal  4   self. especie   =   especie  5   def   __str__ (self) :  6   mensaje   =   " Yo   soy   un   {}   chilena   y   mi   especie   es   {} " . format (self. animal ,   self. especie )  7   return   mensaje  8   ani   =   Animal ( " ave " ,   " Caiquen " )  9   print ( ani )  10   s   =   str ( ani )   #   >>   ’ Yo   soy   un   ave   chilena   y   mi   especie   es Caiquen ’  Yo   soy   un   ave   chilena   y   mi   especie   es   Caiquen

--- Page 12 ---
Metodo float  ▶   El metodo   float   nos ayuda a asociar la representaci´ on en float del objeto.  ▶   Se llama cuando invocamos a la funci´ on float().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo float.

--- Page 13 ---
Metodo float  ▶   El metodo   float   nos ayuda a asociar la representaci´ on en float del objeto.  ▶   Se llama cuando invocamos a la funci´ on float().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo float.  1   class   Fraccion :  2   def   __init__ (self,   numerador ,   denominador ) :  3   self. numerador   =   numerador  4   self. denominador   =   denominador  5 6   def   __float__ (self) :  7   return   self. numerador   /   self. denominador  8 9   f1   =   Fraccion (10,   5)  10   print ( ’ El   valor   de   f1   es ’ ,   float ( f1 ) )  11   f2   =   Fraccion (22,   9)  12   print ( ’ El   valor   de   f2   es ’ ,   float ( f2 ) )

--- Page 14 ---
Metodo float  ▶   El metodo   float   nos ayuda a asociar la representaci´ on en float del objeto.  ▶   Se llama cuando invocamos a la funci´ on float().  ▶   Al definirlo y usarlo, nos ayuda a controlar c´ omo es la representaci´ on del objeto en el tipo float.  1   class   Fraccion :  2   def   __init__ (self,   numerador ,   denominador ) :  3   self. numerador   =   numerador  4   self. denominador   =   denominador  5 6   def   __float__ (self) :  7   return   self. numerador   /   self. denominador  8 9   f1   =   Fraccion (10,   5)  10   print ( ’ El   valor   de   f1   es ’ ,   float ( f1 ) )  11   f2   =   Fraccion (22,   9)  12   print ( ’ El   valor   de   f2   es ’ ,   float ( f2 ) )  El   valor   de   f1   es   2.0 El   valor   de   f2   es   2.444444444446

--- Page 15 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto?

--- Page 16 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto?  1   class   Libro :  2   def   __init__ (self,   nombre ,   autor ,   genero ) :  3   self. nombre   =   nombre  4   self. autor   =   autor  5   self. genero   =   genero  6 7   class   Biblioteca :  8   def   __init__ (self) :  9   self. cantidad_libros   =   0  10   self. lista_libros   =   []  11   self. lista_autores   =   []  12 13   #   Que   cosas   podriamos   hacer   con   estas   dos   clases ?

--- Page 17 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto?  1   class   Libro :  2   def   __init__ (self,   nombre ,   autor ,   genero ) :  3   self. nombre   =   nombre  4   self. autor   =   autor  5   self. genero   =   genero  6 7   class   Biblioteca :  8   def   __init__ (self) :  9   self. cantidad_libros   =   0  10   self. lista_libros   =   []  11   self. lista_autores   =   []  12 13   def   agregar_libro (self,   libro ) :  14   #   Como   agrego   un   libro   a   la   lista   de   libros ?  15   #   Como   agrego   el   autor   del   libro   a   la   lista   de   autores ?  16   #   Deberia   aumentar   mi   cantidad   de   libros ?

--- Page 18 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto?  1   class   Libro :  2   def   __init__ (self,   nombre ,   autor ,   genero ) :  3   self. nombre   =   nombre  4   self. autor   =   autor  5   self. genero   =   genero  6 7   class   Biblioteca :  8   def   __init__ (self) :  9   self. cantidad_libros   =   0  10   self. lista_libros   =   []  11   self. lista_autores   =   []  12 13   def   agregar_libro (self,   libro ) :  14   self. lista_libros . append ( libro )  15   self. lista_autores . append ( libro . autor )  16   self. cantidad_libros   +=   1

--- Page 19 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto? Es posible acceder a los atributos y m´ etodos de un objeto en cualquier momento. Eso si, requiere de mucho cuidado y conocimiento de tu c´ odigo al momento de desarrollar.

--- Page 20 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto? Es posible acceder a los atributos y m´ etodos de un objeto en cualquier momento. Eso si, requiere de mucho cuidado y conocimiento de tu c´ odigo al momento de desarrollar.  1   class   Estudiante :  2   def   __init__ (self,   nombre ,   numero_alumno ) :  3   self. nombre   =   nombre  4   self. numero_alumno   =   numero_alumno  5   self. cursos_tomados   =   []  6 7   def   asignar (self,   curso_actual ) :  8   self. cursos_tomados . append ( curso_actual )  9   curso_actual . agregar_estudiante (self)   #   que   pasa   aqui ?  10 11   class   CursoActual :  12   def   __init__ (self,   nombre ,   sigla ) :  13   self. nombre   =   nombre  14   self. sigla   =   sigla  15   self. estudiantes   =   []  16 17   def   agregar_estudiante (self,   estudiante ) :  18   self. estudiantes . append ( estudiante )

--- Page 21 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto? Es posible acceder a los atributos y m´ etodos de un objeto en cualquier momento. Eso si, requiere de mucho cuidado y conocimiento de tu c´ odigo al momento de desarrollar.  1   class   Estudiante :  2   def   __init__ (self,   nombre ,   numero_alumno ) :  3   self. nombre   =   nombre  4   self. numero_alumno   =   numero_alumno  5   self. cursos_tomados   =   []  6 7   def   asignar (self,   curso_actual ) :  8   self. cursos_tomados . append ( curso_actual )  9   curso_actual . agregar_estudiante (self)   #   que   pasa   aqui ?  10 11   class   CursoActual :  12   def   __init__ (self,   nombre ,   sigla ) :  13   self. nombre   =   nombre  14   self. sigla   =   sigla  15   self. estudiantes   =   []  16 17   def   agregar_estudiante (self,   estudiante ) :  18   self. estudiantes . append ( estudiante )

--- Page 22 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto? Es posible acceder a los atributos y m´ etodos de un objeto en cualquier momento. Eso si, requiere de mucho cuidado y conocimiento de tu c´ odigo al momento de desarrollar.  1   class   Estudiante :  2   def   __init__ (self,   nombre ,   numero_alumno ) :  3   self. nombre   =   nombre  4   self. numero_alumno   =   numero_alumno  5   self. cursos_tomados   =   []  6 7   def   asignar (self,   curso_actual ) :  8   self. cursos_tomados . append ( curso_actual )  9   curso_actual . agregar_estudiante (self)   #   que   pasa   aqui ?  10 11   class   CursoActual :  12   def   __init__ (self,   nombre ,   sigla ) :  13   self. nombre   =   nombre  14   self. sigla   =   sigla  15   self. estudiantes   =   []  16 17   def   agregar_estudiante (self,   estudiante ) :  18   self. estudiantes . append ( estudiante )

--- Page 23 ---
Interaccion entre tipos  ¿Qu´ e pasar´ ıa si yo quiero usar los datos de un objeto en otro objeto? Es posible acceder a los atributos y m´ etodos de un objeto en cualquier momento. Eso si, requiere de mucho cuidado y conocimiento de tu c´ odigo al momento de desarrollar.  1   class   Estudiante :  2   def   __init__ (self,   nombre ,   numero_alumno ) :  3   self. nombre   =   nombre  4   self. numero_alumno   =   numero_alumno  5   self. cursos_tomados   =   []  6 7   def   asignar (self,   curso_actual ) :  8   self. cursos_tomados . append ( curso_actual )  9   curso_actual . agregar_estudiante (self)   #   que   pasa   aqui ?  10 11   class   CursoActual :  12   def   __init__ (self,   nombre ,   sigla ) :  13   self. nombre   =   nombre  14   self. sigla   =   sigla  15   self. estudiantes   =   []  16 17   def   agregar_estudiante (self,   estudiante ) :  18   self. estudiantes . append ( estudiante )

--- Page 24 ---
Interaccion entre tipos  1   class   Estudiante :  2   def   __init__ (self,   nombre ,   numero_alumno ) :  3   self. nombre   =   nombre  4   self. numero_alumno   =   numero_alumno  5   self. cursos_tomados   =   []  6 7   def   asignar (self,   curso_actual ) :  8   self. cursos_tomados . append ( curso_actual )  9   curso_actual . agregar_estudiante (self)   #   que   pasa   aqui ?  10 11   class   CursoActual :  12   def   __init__ (self,   nombre ,   sigla ) :  13   self. nombre   =   nombre  14   self. sigla   =   sigla  15   self. estudiantes   =   []  16 17   def   agregar_estudiante (self,   estudiante ) :  18   self. estudiantes . append ( estudiante )  1   curso   =   CursoActual ( " Intro   a   la   Progra " , ’ IIC1103 ’)  2   bob   =   Estudiante ( " Bob   Ross " ,   21035413)  3   bob . asignar ( curso )  4   curso . estudiantes [0]. nombre   # >>   ’ Bob   Ross ’

