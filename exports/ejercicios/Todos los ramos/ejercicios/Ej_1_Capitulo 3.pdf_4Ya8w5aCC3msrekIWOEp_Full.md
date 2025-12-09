--- Page 1 ---
EAA1520 - Inferencia Estad´ ıstica  M. Ignacia Vicu˜ na - Felipe Ossa - Ricardo Olea 2do Semestre 2023 Cap´ ıtulo 3  : ,   1

--- Page 2 ---
Contenidos  c  1. Definici´ on e interpretaci´ on de IC 2. Construcci´ on de IC 3. IC para par´ ametros de una poblaci´ on Normal 4. IC asint´ oticos para cualquier poblaci´ on 5. IC para par´ ametros de dos poblaciones Normales 6. IC asint´ oticos para par´ ametros de dos poblaciones  : ,   2

--- Page 3 ---
Intervalos de confianza  Introducci´ on  I   Una estimaci´ on puntual, no proporciona por s´ ı mismo informaci´ on alguna sobre la precisi´ on y confiabilidad de la estimaci´ on.  I   Una medida de incerteza de  ˆ θ   es Var( ˆ θ ), sin embargo, depende de   θ  el cual es desconocido. En la pr´ actica, uno reporta la estimaci´ on de Var( ˆ θ ): ̂   Var( ˆ θ ).  I   Otra alternativa, es calcular un   intervalo de confianza .  : ,   3

--- Page 4 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  La construcci´ on de Intervalos de Confianza (IC) se sustenta en la siguiente propiedad: “Todo estimador del par´ ametro desconocido   θ   es una variable aleatoria. por lo cual debe tener asociada alguna distribuci´ on de probabilidad” Las distribuciones muestrales m´ as usuales son: Normal, Chi-cuadrado, T- Student, Fisher.  : ,   4

--- Page 5 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Supongamos que   Y 1 ,   Y 2 , ...,   Y n   es una m.a de tama˜ no   n   de la poblaci´ on Normal( μ, σ 2 ). Sabemos que el EMV de   μ   es ¯ Y   el cual tiene distribuci´ on Normal( μ,   σ 2  n   ), entonces podemos decir  P  (  ¯ Y   −   2   σ  √ n   ≤   μ   ≤   ¯ Y   + 2   σ  √ n  )  = 0 . 9544 Dado que   ¯ Y   es una v.a entonces el intervalo resulta ser un   Intervalo Aleatorio.  : ,   5

--- Page 6 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Adem´ as como la inferencia cl´ asica asume que el par´ ametro   μ   es constante, entonces dicha probabilidad se interpreta como: “La probabilidad que el intervalo aleatorio  (   ¯ Y   −   2   σ √ n   ,   ¯ Y   + 2   σ √ n  )  contenga al par´ ametro   μ   es de un 95,44%”  : ,   6

--- Page 7 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Bajo la interpretaci´ on frecuentista de probabilidad, afirmamos que: “Cualesquiera sea el verdadero valor de   μ , de cada 100 intervalos aleatorios generados en forma equivalente al anterior, aproximadamente el 95% de ellos deber´ ıan contener la media   μ ”  : ,   7

--- Page 8 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Interpretaci´ on frecuentista, l l l l l l l l ll l l l l l l l l l l l l l l l l l l l l l l l l l l l ll l l l l l l l l l l l l l l l l l l ll l l l l l l l l l ll ll l l l l l l l l l l l l l l l l l l l l l l l l l l l l  0   20   40   60   80   100 2   3   4   5   6  Construcción de intervalos de confianza  t li  l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l  : ,   8

--- Page 9 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Supongamos que se extrae una muestra de tama˜ no   n   = 36, y se tiene que  σ   = 3 y ¯ y   = 12 . 1. En tal caso, el intervalo resulta ser (11 . 1 ,   13 . 1) el cual es una realizaci´ on del intervalo aleatorio (  ¯ Y   −   1 ,   ¯ Y   + 1) del ejemplo. Note que es incorrecto afirmar que la probabilidad de que   μ   pertenezca al intervalo (11 . 1 ,   13 . 1) es 95.44%  : ,   9

--- Page 10 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Sin embargo, la probabilidad del 95.44% del IC aleatorio induce una pseudo- probabilidad llamada Probabilidad Fiducial, o, en su expresi´ on m´ as com´ un:  Confianza  S´ ı entonces, es correcto afirmar que, “Con una confianza del 95.44% se puede afirmar que el intervalo (11 . 1 ,   13 . 1) contiene a la media   μ ”  : ,   10

--- Page 11 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Definici´ on: Intervalo de Confianza  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de la poblaci´ on   f   ( y   , θ ). Se llama Intervalo de Confianza (1   −   α )   ·   100% para el par´ ametro desconocido   θ   a una realizaci´ on de un intervalo aleatorio que con probabilidad de (1   −   α ) contiene el par´ ametro   θ  Niveles de confianza usuales: 90% ,   95% ,   98%  : ,   11

--- Page 12 ---
Definici´ on e interpretaci´ on de IC  Intervalos de confianza  Definici´ on e interpretaci´ on  Los IC pueden ser bilterales o unilaterales, por ejemplo, en el caso que el par´ ametro   θ   representa la media de una distribuci´ on entonces el formato de los respectivos IC ser´ a de la siguiente forma:  I   ( ˆ θ   −   ee ,   ˆ θ   +   ee ) Bilateral Sim´ etrico  I   ( ˆ θ   −   ee ,   ∞ ) Unilateral Inferior (izquierdo) o cota inferior  I   ( −∞ ,   ˆ θ   +   ee ) Unilateral Superior (derecho) o cota superior  ee   : error de estimaci´ on, error muestreo, precisi´ on  : ,   12

--- Page 13 ---
Construcci´ on de IC  Intervalos de confianza  Construcci´ on de un IC v´ ıa Pivote  Un m´ etodo ´ util para construir los IC es el   M´ etodo Pivotal  Los Pivotes son v.a construidas a partir de las distribuciones muestrales, los cuales tienen la siguiente propiedad:  I   Es una funci´ on de los datos y del par´ ametro de inter´ es  I   La distribuci´ on de probabilidad dado el (los) par´ ametros no depende de dichos par´ ametros  : ,   13

--- Page 14 ---
Construcci´ on de IC  Intervalos de confianza  Construcci´ on de un IC v´ ıa Pivote  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de una poblaci´ on   f   ( y   , θ ). Sea la funci´ on   Q   =   q ( Y 1 ,   Y 2 , ...,   Y n , θ ) la cual depende simult´ aneamente de la m.a y del par´ ametro   θ . Si la distribuci´ on de   Q   es independiente del par´ ametro   θ   entonces   Q   es una   Cantidad Pivotal o Pivote  : ,   14

--- Page 15 ---
Construcci´ on de IC  Intervalos de confianza  Construcci´ on de un IC v´ ıa Pivote  Ejemplos  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de una poblaci´ on Normal( μ, σ 2 ). Interesa estimar el par´ ametro   μ , en este caso  I   Un pivote para   μ   asumiendo   σ   conocido es  Z   =   ¯ Y   −   μ σ/ √ n   ≈   N (0 ,   1)  I   Un pivote para   μ   asumiendo   σ   desconocido es  T   =   ¯ Y   −   μ  S / √ n   ≈   t ( n   −   1)  : ,   15

--- Page 16 ---
Construcci´ on de IC  Intervalos de confianza  Construcci´ on de un IC v´ ıa Pivote  Si se quiere estimar   σ 2   y   μ   es desconocido, entonces un pivote para   σ 2   es  W   =  ( n   −   1) S 2  σ 2   ≈   χ 2 ( n   −   1)  : ,   16

--- Page 17 ---
IC para par´ ametros de una poblaci´ on Normal  Intervalos de confianza  IC para   σ   con   μ   desconocido  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de la poblaci´ on   N ( μ, σ 2 ), entonces un IC(1   −   α )% para   σ 2   est´ a dado por  (  ( n   −   1) S 2  χ 2 1 − α/ 2 ( n   −   1)   ,   ( n   −   1) S 2  χ 2  α/ 2 ( n   −   1)  )  donde   X   2 1 − α/ 2   corresponde al percentil 1 − α/ 2 de una distribuci´ on   χ 2 ( n − 1) y   S 2   =  ∑ n i =1 ( Y i   −   ¯ Y   ) 2  n − 1  : ,   17

--- Page 18 ---
IC para par´ ametros de una poblaci´ on Normal  Intervalos de confianza  IC para   μ   con   σ   conocido  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de una poblaci´ on N( μ, σ 2 ), en- tonces el IC de (1   −   α )% para   μ   es  (  ¯ y   −   z 1 − α/ 2  σ  √ n   ,   ¯ y   +   z 1 − α/ 2  σ  √ n  )  donde   z 1 − α/ 2   es el percentil 1   −   α/ 2 de una   N (0 ,   1)  : ,   18

--- Page 19 ---
IC para par´ ametros de una poblaci´ on Normal  Intervalos de confianza  IC para   μ   con   σ   desconocido y   n   peque˜ no  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de una poblaci´ on N( μ, σ 2 ), en- tonces el IC de (1   −   α )% para   μ   es  (  ¯ y   −   t 1 − α/ 2 ( n   −   1)   S  √ n   ,   ¯ y   +   t 1 − α/ 2 ( n   −   1)   S  √ n  )  donde   t 1 − α/ 2 ( n   −   1) es el percentil 1   −   α/ 2 de una t-student( n   −   1) y  S 2   =  ∑ n i =1 ( Y i   −   ¯ Y   ) 2  n − 1  : ,   19

--- Page 20 ---
IC para par´ ametros de una poblaci´ on Normal  Intervalos de confianza  IC para   μ   con   σ   desconocido y   n   grande  Sea   Y 1 ,   Y 2 , ...,   Y n   una m.a de tama˜ no   n   de una poblaci´ on N( μ, σ 2 ), para  n   grande, la distribuci´ on t-student se aproxima por la   N (0 ,   1), por lo tanto el IC de (1   −   α )% para   μ   es  (  ¯ y   −   z 1 − α/ 2  S  √ n   ,   ¯ y   +   z 1 − α/ 2  S  √ n  )  : ,   20

--- Page 21 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  IC para   μ   con   σ   desconocido y   n   grande  Nota importante:  De acuerdo al TLC para   n   grande la Normalidad de la poblaci´ on no es nece- saria, por lo tanto podemos levantar este supuesto, pudiendo as´ ı construir IC asint´ oticos para   μ   de otros modelos.  : ,   21

--- Page 22 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  IC asint´ oticos para   θ  Sean   Y 1 , ...,   Y n   provenientes de una poblaci´ on con distribuci´ on   f   ( y   , θ ). El EMV de   θ   distribuye asint´ oticamente N( θ,   CCR ( θ )). Un intervalo aproxi- mado de nivel (1   −   α )% para   θ   est´ a dado por  (  ˆ θ   −   z 1 − α/ 2  √  CCR ( ˆ θ ) ,   ˆ θ   +   z 1 − α/ 2  √  CCR ( ˆ θ )  )  : ,   22

--- Page 23 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  IC asint´ oticos para   μ  Ejemplos  f   ( y   ;   θ )   IC para   μ  Ber( π )  (  p   −   z 1 − α/ 2  √   p (1 − p )  n   ,   p   +   z 1 − α/ 2  √   p (1 − p )  n  )  Poisson( λ )  (  ¯ y   −   z 1 − α/ 2  √   ¯ y n   ,   ¯ y   +   z 1 − α/ 2  √   ¯ y n  )  Exp( λ )  (  ¯ y   −   z 1 − α/ 2   ¯ y √ n   ,   ¯ y   +   z 1 − α/ 2   ¯ y √ n  )  : ,   23

--- Page 24 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  IC asint´ oticos para   g   ( θ )  Sean   Y 1 , ...,   Y n   provenientes de una poblaci´ on con distribuci´ on   f   ( y   , θ ). El EMV de   g   ( θ ) distribuye asint´ oticamente N  (  g   ( θ ) ,   CCR ( θ )   ·  (   ∂ g   ( θ )  ∂θ  ) 2 )  . Un intervalo aproximado de nivel (1   −   α )% para   g   ( θ ) est´ a dado por     g   (ˆ θ )   −   z 1 − α/ 2  √ √ √ √ CCR (ˆ θ )   ·  (  ∂ g   (ˆ θ )  ∂θ  ) 2  ,   g   (ˆ θ ) +   z 1 − α/ 2  √ √ √ √ CCR (ˆ θ )   ·  (  ∂ g   (ˆ θ )  ∂θ  ) 2      : ,   24

--- Page 25 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  IC Unilarerales para   μ  Por ejemplo, un IC Unilateral para   μ   con   σ   desconocido y   n   grande Unilateral Superior   ( −∞ ,   ¯ y   +   z 1 − α   S √ n   ) Unilateral Inferior   (¯ y   −   z 1 − α   S √ n   ,   ∞ )  : ,   25

--- Page 26 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Toma de desiciones con IC  Sea   θ   el par´ ametro a estimar. A partir de IC se pueden evaluar supuestos acerca del par´ ametro   θ . Suponga que  I   Interesa evaluar si   θ   =   θ 0  Un IC bilateral para   θ   de nivel de confianza   α   est´ a dado por ( ˆ θ   −   z 1 − α/ 2  √  CCR ( ˆ θ ) ,   ˆ θ   +   z 1 − α/ 2  √  CCR ( ˆ θ )) Si el valor de   θ 0   no est´ a contenido en el IC bilateral, entonces con un nivel de significancia de   α   se puede concluir que   θ   6   =   θ 0 . De lo contrario, si el valor de   θ 0   est´ a contenido en el IC bilateral, entonces con un nivel de significancia de   α   se concluye que   θ   =   θ 0 .  : ,   26

--- Page 27 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Toma de desiciones con IC  I   Interesa evaluar si   θ > θ 0  Un IC unilateral inferior para   θ   de nivel de confianza   α   est´ a dado por ( ˆ θ   −   z 1 − α  √  CCR ( ˆ θ ) ,   ∞ ) Si el valor de   θ 0   no est´ a contenido en el IC unilateral, entonces con un nivel de significancia de   α   se puede concluir que   θ > θ 0 . De lo contrario, si el valor de   θ 0   est´ a contenido en el IC unilateral, entonces con un nivel de significancia de   α   se conlcuye que   θ   ≤   θ 0 .  : ,   27

--- Page 28 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Toma de desiciones con IC  I   Interesa evaluar si   θ < θ 0  Un IC unilateral superior para   θ   de nivel de confianza   α   est´ a dado por ( −∞ ,   ˆ θ   +   z 1 − α  √  CCR ( ˆ θ )) Si el valor de   θ 0   no est´ a contenido en el IC unilateral, entonces con un nivel de significancia de   α   se puede concluir que   θ < θ 0 . De lo contrario, si el valor de   θ 0   est´ a contenido en el IC unilateral, entonces con un nivel de significancia de   α   se concluye que   θ   ≥   θ 0 .  : ,   28

--- Page 29 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Precisi´ on y selecci´ on del tama˜ no muestral  ¿Por qu´ e establecer un nivel de confianza de 95% cuando es posible uno de 99%?  Respuesta:   Por que el precio pagado por un nivel de confianza m´ as alto es un intervalo m´ as amplio. De hecho, el ´ unico intervalo de confianza de 100% para   μ   es ( −∞ ,   ∞ ) el cual no es informativo, porque a´ un antes de un muestreo, sabemos que este intervalo cubre a   μ .  : ,   29

--- Page 30 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Precisi´ on y selecci´ on del tama˜ no muestral  I   Si consideramos que la longitud del intervalo especifica su precisi´ on, entonces el nivel de confianza est´ a inversamente relacionado con su precisi´ on.  I   Una estrategia consiste en especificar el nivel de confianza y la longitud del intervalo y luego determinar el tama˜ no muestral necesario.  : ,   30

--- Page 31 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Precisi´ on y selecci´ on del tama˜ no muestral  Determinaci´ on del tama˜ no muestral  Vimos que un intervalo de confianza para   μ   cuando   σ 2   es conocido es  (  ¯ y   −   z 1 − α/ 2  σ  √ n   ,   ¯ y   +   z 1 − α/ 2  σ  √ n  )  Denotemos por   A   la amplitud del intervalo:   A   = 2   ·   z 1 − α/ 2   σ √ n   = 2   ·   ee  donde “ ee ” es el   Error de Estimaci´ on .  : ,   31

--- Page 32 ---
IC asint´ oticos para cualquier poblaci´ on  Intervalos de confianza  Precisi´ on y selecci´ on del tama˜ no muestral  Por lo tanto, para una precisi´ on   ee   dada, es posible determinar el tama˜ no de muestra necesaria, con   σ   y   α   fijos, dado por  n   =  (   z 1 − α/ 2 σ  ee  ) 2  : ,   32

--- Page 33 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  Introducci´ on  En muchas oportunidades es interesante comparar las medias, proporciones o varianzas de dos poblaciones, por ejemplo:  I   Las ventas medias mensuales de dos tiendas  I   Las medias y varianzas de la producci´ on de dos m´ aquinas  I   Efectividad de un nuevo medicamento, v´ ıa comparaci´ on antes y de- spu´ es del tratamiento  : ,   33

--- Page 34 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  IC para diferencia de medias con   σ 2  X   6   =   σ 2  Y  Sea   X 1 , ...,   X n   una muestra aleatoria con distribuci´ on Normal( μ X   , σ 2  x   ). Sea  Y 1 , ...,   Y m   una muestra aleatoria con distribuci´ on Normal( μ Y   , σ 2  y   ) indepen- diente a la anterior.  Varianzas cononocidas  Un estimador natural es  ¯ X   −   ¯ Y   que el EMV de   μ X   −   μ Y   . Adem´ as, ¯ X   −   ¯ Y   ∼   N  (  μ X   −   μ Y   ,  σ 2  x  n   +   σ 2  y  m  )  Luego un IC para   μ X   −   μ Y   es:  (  ¯ X   −   ¯ Y   −   z 1 −   α  2  √   σ 2  x  n   +   σ 2  y  m   ,   ¯ X   −   ¯ Y   +   z 1 −   α  2  √   σ 2  x  n   +   σ 2  y  m  )  : ,   34

--- Page 35 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  IC para diferencia de medias con   σ 2  X   6   =   σ 2  Y  Varianzas desconocidas En el caso que las poblaciones tengan varianzas desconocidas, se tiene que ¯ X   −   ¯ Y   −   ( μ X   −   μ Y   )  √   S 2  X  n   +   S 2  Y  m  ∼   t g  donde   g   =     (   S 2  x n   +   S 2  y m  ) 2 ( S 2  x   / n ) 2  n − 1   +   ( S 2  y   / m ) 2  m − 1     El intervalo de confianza para estimar   μ x   −   μ y   est´ a dado por  (  X   −   Y   −   t g   , 1 − α/ 2  √   S 2  x  n   +   S 2  y  m   ,   X   −   Y   −   t g   , 1 − α/ 2  √   S 2  x  n   +   S 2  y  m  )  : ,   35

--- Page 36 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  IC para diferencia de medias con   σ 2  X   =   σ 2  Y   =   σ 2  σ 2 conocido: Ahora si las poblaciones tienen varianzas iguales tal que   σ 2  x   =   σ 2  y   =   σ 2  entonces un IC para   μ X   −   μ Y   es:  (  ¯ X   −   ¯ Y   −   z 1 −   α  2   σ  √   1  n   +  1  m   ,   ¯ X   −   ¯ Y   +   z 1 −   α  2   σ  √   1  n   +  1  m  )  ¯ X   −   ¯ Y   ∼   N  (  μ X   −   μ Y   , σ 2  (   1  n   +  1  m  ))  : ,   36

--- Page 37 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  IC para diferencia de medias con   σ 2  X   =   σ 2  Y   =   σ 2  σ 2 desconocido: Se estima   σ 2   a partir de los datos de las dos muestras,  S 2  p   =  ( n   −   1) S 2  X   + ( m   −   1) S 2  Y  m   +   n   −   2 donde,  S 2  X   =  ∑ n i =1 ( X i   −   ¯ X   ) 2  n   −   1  S 2  Y   =  ∑ m i =1 ( Y i   −   ¯ Y   ) 2  m   −   1  : ,   37

--- Page 38 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  IC para diferencia de medias con   σ 2  X   =   σ 2  Y   =   σ 2  La funci´ on pivote est´ a dada por:  T   =  (  ¯ X   −   ¯ Y   )   −   ( μ X   −   μ Y   )  S p  √   1  n   +   1  m  ∼   t m + n − 2  Luego un IC para   μ X   −   μ Y   es:  (  ¯ X   −   ¯ Y   −   t n + m − 2 , 1 −   α  2   S p  √   1  n   +  1  m   ,   ¯ X   −   ¯ Y   +   t n + m − 2 , 1 −   α  2   S p  √   1  n   +  1  m  )  : ,   38

--- Page 39 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  Ejemplo  Ejemplo  Dos m´ etodos,   A   y   B , son usados para determinar el calor latente de fusi´ on de hielo. Investigadores quieren saber si existe diferencia entre ambos m´ etodos y ellos consideran que ambos m´ etodos tienen la misma variabilidad. La siguiente tabla contiene el cambio de calor total medido para hielo cuando su temperatura cambia de -0.72 ° C a 0 ° C.  M´ etodo A   79 . 98   80 . 04   80 . 02   80 . 04   80 . 03   80 . 03   80 . 04   79 . 97 80 . 05   80 . 03   80 . 02   80 . 00   80 . 02 M´ etodo B   80 . 02   79 . 94   79 . 98   79 . 97   79 . 97   80 . 03   79 . 95   79 . 97  : ,   39

--- Page 40 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  Ejemplo l l  Método A   Método B 79.94   79.96   79.98   80.00   80.02   80.04  : ,   40

--- Page 41 ---
IC para par´ ametros de dos poblaciones Normales  Intervalos de confianza para dos muestras  Ejemplo  ¯ X A   = 80 . 02 ,   ¯ X B   = 79 . 98 ,   S A   = 0 . 024 ,   S B   = 0 . 031  S 2  p   =   12 S 2  A +7 S 2  B  19   = 0 . 0007178 ,   S p   = 0 . 027 Luego,   S   ¯ X A −   ¯ X B   =   S p  √   1 13   +   1 8   = 0 . 012 Un intervalo de 95% de confianza para   μ A   −   μ B   est´ a dado por: (0 . 015 ,   0 . 065)  : ,   41

--- Page 42 ---
IC asint´ oticos para par´ ametros de dos poblaciones  Intervalos de confianza para dos muestras  IC para diferencia de medias, ambas muestras grandes  Poblaciones no necesariamente Normales, con varianzas desconocidas y distintas, muestras independientes y ambas de tama˜ no grande. Por TLC se tiene que un intervalo de confianza asint´ otico para   μ X   −   μ Y   est´ a dado por  (  ¯ X   −   ¯ Y   −   z 1 − α/ 2  √   S 2 1  n   +   S 2 2  m   ,   ¯ X   −   ¯ Y   +   z 1 − α/ 2  √   S 2 1  n   +   S 2 2  m  )  : ,   42

--- Page 43 ---
IC asint´ oticos para par´ ametros de dos poblaciones  Intervalos de confianza para dos muestras  IC asint´ oticos para   θ 1   −   θ 2  Sean   X 1 , ...,   X n   provenientes de una poblaci´ on con distribuci´ on   f   ( x , θ 1 ) y  Y 1 , ...,   Y m   provenientes de una poblaci´ on con distribuci´ on   f   ( y   , θ 2 ). El EMV de   θ 1   y   θ 2   distribuye asint´ oticamente N( θ 1 ,   CCR (ˆ θ 1 )) y N( θ 2 ,   CCR ( ˆ θ 2 )) respectivamente. Un intervalo aproximado de nivel (1   −   α )% para   θ 1   −   θ 2   est´ a dado por  ( ˆ θ 1 − ˆ θ 2 − z 1 − α/ 2  √  CCR (ˆ θ 1 ) +   CCR (ˆ θ 2 ) ,   ˆ θ 1 − ˆ θ 2 + z 1 − α/ 2  √  CCR (ˆ θ 1 ) +   CCR (ˆ θ 2 )  )  : ,   43

--- Page 44 ---
IC asint´ oticos para par´ ametros de dos poblaciones  Intervalos de confianza para dos muestras  Intervalo de Confianza para   σ 2  X  σ 2  Y  Sea   X 1 ,   X 2 , . . . ,   X n   una muestra aleatoria desde una poblaci´ on   N ( μ X   , σ 2  X   ) e   Y 1 ,   Y 2 , . . . ,   Y m   una muestra aleatoria desde una poblaci´ on   N ( μ Y   , σ 2  Y   ) ambas muestras independientes. Es posible construir un intervalo para comparar dos varianzas a trav´ es del cuociente de varianzas. Luego la funci´ on pivote est´ a dada por  S 2  X  σ 2  X  S 2  Y  σ 2  Y  ∼   F n − 1 , m − 1  : ,   44

--- Page 45 ---
IC asint´ oticos para par´ ametros de dos poblaciones  Intervalos de confianza para dos muestras  Intervalo de Confianza para   σ 2  X  σ 2  Y  El intervalo de confianza para estimar   σ 2  X  σ 2  Y  est´ a dado por  (   S 2  x  S 2  y  1  F n − 1 , m − 1 , 1 − α/ 2  ;   S 2  x  S 2  y  1  F n − 1 , m − 1 ,α/ 2  )  : ,   45

