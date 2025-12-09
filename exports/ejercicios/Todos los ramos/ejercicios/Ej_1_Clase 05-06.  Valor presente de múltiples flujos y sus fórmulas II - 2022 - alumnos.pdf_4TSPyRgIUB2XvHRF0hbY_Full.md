--- Page 1 ---
Fundamentos de Finanzas  EAA1220  Vincent van Kervel  Nota: parte importante de estos apuntes corresponde a material original  de M. del Sante y de L. Hernández, con cambios de forma y fondo, más  material nuevo  05. Valor presente de múltiples flujos   –   y algunas  fórmulas (II)

--- Page 2 ---
Visto...  •   Principio :   El valor presente (futuro) de varios flujos futuros es la suma del los  valores presentes (futuros) de cada uno *  •   El VP (VF) es una función homogénea de grado 1: VP({ KF 1 ... KF n }) =  K VP({ F 1 ... F n })  •   Flujo constante ( F ) plazo finito ( n ) tasa constante ( r )  𝑉𝑃   𝑟 ,   𝐹 ,   𝑛   =   𝐹  𝑟   [ 1   −   1  1   +   𝑟   𝑛 ]  •   Flujo constante ( F ) plazo infinito ( ∞ ) tasa constante ( r )  𝑉𝑃   𝑟 ,   𝐹 ,   ∞   =   𝐹  𝑟  •   Hay   m   subperíodos en un año, dada una tasa compuesta para cada  subperíodo de   𝑟 𝑚 , entonces la tasa “efectiva anual” compuesta es  1   +   𝑟 𝐸𝐴   =   ( 1   +   𝑟 𝑚 ) 𝑚  •   Dada una tasa efectiva anual compuesta   𝑟 𝐸𝐴 , entonces la tasa   𝑟 𝑚  compuesta para cada subperíodo es  1   +   𝑟 𝑚   =   ( 1   +   𝑟 𝐸𝐴 )   1  𝑚   2  𝑽𝑷   =   𝑭 𝟏  ( 𝟏 + 𝒓 ) 𝟏   +   𝑭 𝟐  ( 𝟏 + 𝒓 ) 𝟐   +   𝑭 𝟑  ( 𝟏 + 𝒓 ) 𝟑   +   𝑭 𝟒  ( 𝟏 + 𝒓 ) 𝟒   + … =   𝒕 = 𝟏  𝑵   𝑭 𝒕  ( 𝟏 + 𝒓 ) 𝒕  *Nunca olvidar coherencia  entre unidad de medida de   r   y  F   (moneda, unidad de tiempo)

--- Page 3 ---
Contenidos  •   Anualidades y perpetuidades   crecientes   a  tasa constante  •   Valor Presente Neto (VPN)  –   También llamado Valor Actual Neto (VAN)  3

--- Page 4 ---
Anualidad creciente  •   Suponemos que el flujo de caja en   t   crece a la tasa  constante   g   con respecto al período anterior:   𝐹 𝑡   =  𝐹 𝑡 − 1 ( 1   +   𝑔 )  •   Nótese que esto implica que   𝐹 𝑡   =   𝐹 1   1   +   𝑔   𝑡 − 1  –   Ejemplos:  •   Los flujos nominales crecen con una (supuesta) inflación constante  •   En el peaje, el tráfico crece a una (supuesta) tasa constante igual a la del PIB  •   Los sueldos en la economía crecen al 1% real anual  •   ¿Cómo calculamos el VP?  •   Fórmula habitual, sólo que los flujos futuros tienen una  estructura...  𝑉𝑃   =   𝐹 1  1   +   𝑟   +   𝐹 1 ( 1   +   𝑔 )  ( 1   +   𝑟 ) 2   +   𝐹 1 ( 1   +   𝑔 ) 2  ( 1   +   𝑟 ) 3   +   ⋯   +   𝐹 1 ( 1   +   𝑔 ) 𝑛 − 1  ( 1   +   𝑟 ) 𝑛   4

--- Page 5 ---
Pregunta ( one - minute   quiz )  5  •   El primer flujo será 100   a fines de año   y crecerá a  una tasa de 10% anual en los años 2 y 3. Sólo hay  3 flujos. La tasa de descuento es 18% anual, ¿cuál  es el valor presente de estos flujos?

--- Page 6 ---
Anualidad creciente a tasa constante (n °  finito de flujos):   fórmula  •   Suponemos que el flujo de caja en   t   crece a la tasa  constante   g   con respecto al período anterior:   𝐹 𝑡   =  𝐹 1   1   +   𝑔   𝑡 − 1  •   Usando progresiones geométricas se obtiene:  𝑉𝑃   𝑟 ,   𝐹 1 ,   𝑛 ,   𝑔   =   𝐹 1  𝑟   −   𝑔   1   −   1   +   𝑔  1   +   𝑟  𝑛  •   Verificamos ejercicio...  𝑉𝑃   18% ,   100 , 3 , 10%   =   100  18%   −   10%   1   −   1   +   10%  1   +   18%  3  =   237 . 4  6

--- Page 7 ---
Perpetuidad creciente a tasa constante (infinitos  flujos):   fórmula   existe sólo si   r   >   g  𝑉𝑃   𝑟 ,   𝐹 1 ,   ∞ ,   𝑔   =   𝐹 1  𝑟   −   𝑔   1   −   1   +   𝑔  1   +   𝑟  ∞  ⇒  𝑉𝑃   𝑟 ,   𝐹 1 ,   ∞ ,   𝑔   =   𝐹 1  𝑟   −   𝑔  7  0

--- Page 8 ---
La acción de Enelda S.A. pagará $10 de dividendos (flujo de caja para  el accionista) a fines de año. El dividendo crecerá a una tasa anual de  4%. Si la tasa de descuento es 8% anual, ¿cuál debe ser el precio de la  acción de Enelda?  8

--- Page 9 ---
Ejercicio de clases  •   Julia acaba de cumplir 30 años y está preocupada por el monto de su  jubilación.  •   Su sueldo   anual   es de $15 millones (fines de año) y se espera crezca un  3% por año por los siguientes 29 años.  •   A fines de cada periodo (fin de año) le descuentan su aporte a la AFP  que es de un 10%. Luego del retiro del 10%, Julia ya no ahorra más  para su jubilación.  •   Julia planea trabajar 30 años más (espera jubilarse justo al cumplir 60  años) y espera vivir hasta los 90.  •   La tasa de interés es de 5% anual compuesta.  ¿Qué jubilación   anual recibiría   Julia?  9

--- Page 10 ---
Concepto importante:  Valor Presente (Actual) Neto  VPN o VAN  10  •   VPN o VAN es   un criterio   para tomar decisiones de  inversión (o evaluar proyectos, negocios),   donde   se  considera tanto la inversión como   los flujos que generará  dicha inversión =>  •   Tendremos   flujos positivos y negativos que descontar.  Si:   VAN > 0      se crea valor . La inversión conviene .  VAN = 0      indiferente  VAN < 0      destruye valor. No conviene   realizar la inversión  SI VAN > 0   EL   PROYECTO CREA VALOR (RIQUEZA)  VAN   =   -   INVERSIÓN (VP) +   VALOR PRESENTE DE LOS FLUJOS FUTUROS

--- Page 11 ---
Comprar   un   departamento   para   inversión   cuesta   3000   UF .   Puede  arrendarlo   a   perpetuidad   en   120   UF   anuales   (neto   de   mantención   e  impuestos) .   Tasa   de   costo   de   oportunidad= 3 % /año   en   UF .   ¿VPN?  A.   4000  B.   3000  C.   1000  D.   - 1000  11

--- Page 12 ---
Ejercicio de clases   –   VPN  •   Un   inversionista evalúa la   adquisición de un terreno cuyo  costo es de   UF 1.000.000 (incluye comisión del corredor).  •   Pretende subdividirlo   en   dos paños iguales  –   El primero espera venderlo   en un año más, en una cifra estimada  de   UF 624.000.  –   Por el segundo, espera   recibir UF 864.000 justo dos años después  de la compra .  •   Ambas   transacciones se harían a través de   un corredor de  propiedades   que cobra una comisión del 5% sobre el valor  de la venta .  •   ¿Conviene   esta operación si negocios inmobiliarios  similares rinden aproximadamente un 20% anual?  12

--- Page 13 ---
Visto...  •   Cómo trabajar con anualidades y  perpetuidades crecientes a tasas constantes  •   Valor presente neto como criterio para  invertir  –   Para VPN>0 la inversión debe rentar más que  el costo de oportunidad  13

