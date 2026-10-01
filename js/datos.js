/* WhatsApp: 52 (México) + 1 + número a 10 dígitos, todo junto, sin espaciod */
var WA_NUMBER = '5217721646924';

/* Conexión del seguimiento de órdenes. NO cambiar,
   a menos que cambien la base de datos. */
var SUPABASE_URL = 'https://hhotnexzmehphsrnpihb.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_vlwTA8RfDF_vKdp9GYwHDg_arsusIC-';

/* Texto que se pone en un modelo del catálogo si no tiene descripción propia */
var GENERIC = 'Mantenimiento preventivo: se desarma y limpia la consola componente por componente, con revisión general de funcionamiento.';

/* EQUIPOS QUE REPARAMOS (sección Servicios)
   n   = nombre del equipo
   c   = categoría: 'consolas', 'computo', 'moviles' u 'otros'
   img = nombre de la foto en la carpeta img/ (sin ".webp").
         Pon null si no tiene foto.
   d   = descripción corta
   Para agregar uno: copia una línea completa y cambia los textos. */
var DEVICES = [
  {n:'Xbox', c:'consolas', img:'d-xbox', d:'Fallas de encendido, lectores, discos duros y más.'},
  {n:'PlayStation', c:'consolas', img:'d-playstation', d:'PS4 y PS5: ventilación, HDMI, fuente de poder y software.'},
  {n:'Nintendo Switch', c:'consolas', img:'d-nintendo-switch', d:'Joy-Con drift, pantalla, batería, carga y conexión.'},
  {n:'Nintendo DS', c:'consolas', img:'d-nintendo-ds', d:'Pantallas, botones, batería, cargadores y software.'},
  {n:'Controles', c:'consolas', img:'d-controles', d:'Drift, botones, gatillos y conexión inalámbrica.'},
  {n:'Laptops', c:'computo', img:'d-laptop', d:'Pantalla, teclado, batería, encendido y rendimiento.'},
  {n:'PC de escritorio', c:'computo', img:'d-pc', d:'Fuente, tarjeta madre, RAM, discos duros y virus.'},
  {n:'Celulares', c:'moviles', img:'d-celular', d:'Pantalla, batería, puerto de carga, software y datos.'},
  {n:'Tabletas', c:'moviles', img:'d-tableta', d:'iPad, Samsung y más: pantalla, batería y sistema.'},
  {n:'Misceláneos', c:'otros', img:null, d:'Audio, proyectores, monitores, fuentes de poder y más.'}
];
/* Nombre de cada categoría en la etiqueta de la tarjeta */
var CAT_LABEL = {consolas:'Consola', computo:'Cómputo', moviles:'Móvil', otros:'Otros'};

/* CATÁLOGO Y PRECIOS (sección Precios)
   Cada marca tiene:
     label   = nombre del botón de la marca
     gallery = fotos de arriba: ['nombre-de-la-foto', 'texto que aparece']
     items   = la lista de modelos. En cada modelo:
        n   = nombre del modelo
        p   = precio en pesos (pon null para que diga "Cotización")
        img = foto del modelo (opcional)
        m   = texto grande que se muestra si NO hay foto (opcional)
        d   = qué incluye el servicio (si no lo pones, usa el texto de arriba)
        k   = otras palabras con las que la gente lo busca (opcional)
        w   = garantía (si no lo pones, dice "3 meses") */
var CATALOG = {
  xbox:{label:'Xbox', gallery:[['c-xbox-clasico-360-one','Xbox Clásico, 360 y One'],['c-xbox-series-x','Xbox Series X'],['c-xbox-series-s','Xbox Series S']],
    items:[
      {n:'Xbox Clásico', m:'XBOX', p:500, k:'original xbox clasico'},
      {n:'Xbox 360', m:'360', p:500, k:'360'},
      {n:'Xbox One', p:500, img:'x-xbox-one', d:'Mantenimiento completo, limpieza de componentes, cambio de pasta térmica y revisión de HDD.', k:'one s x'},
      {n:'Xbox Series X', p:800, img:'x-xbox-series-x', d:'Limpieza de disipador, cambio de pasta térmica, revisión de fuente de poder y ventilación.', k:'series x'},
      {n:'Xbox Series S', m:'SERIES S', p:500, k:'series s'}
    ]},
  nintendo:{label:'Nintendo', gallery:[['c-nintendo-snes-n64-gcn','SNES, N64 y GameCube'],['c-nintendo-wii-wiiu-switch','Wii, Wii U y Switch'],['c-nintendo-switch-lite-oled-2','Switch Lite, OLED y Switch 2']],
    items:[
      {n:'SNES', m:'SNES', p:500, k:'super nintendo super nes'},
      {n:'Nintendo 64', m:'N64', p:500, k:'n64'},
      {n:'GameCube', p:500, img:'x-gamecube', d:'Mantenimiento preventivo completo, limpieza interna, cambio de pasta térmica y revisión de lector óptico.', k:'gc gcn cube'},
      {n:'Wii U', m:'Wii U', p:500, k:'wiiu wii'},
      {n:'Switch Lite / OLED / 2', p:500, img:'x-nintendo-switch', d:'Limpieza profunda, revisión de ventilación, cambio de pasta térmica y diagnóstico de batería.', k:'switch lite oled switch 2 nintendo switch'}
    ]},
  playstation:{label:'PlayStation', gallery:[['c-playstation-ps1-ps2-ps3','PS1, PS2 y PS3'],['c-playstation-ps3-fat-slim','PS3 Fat y Slim'],['c-playstation-ps4-fat-slim','PS4 Fat y Slim'],['c-playstation-ps4pro-ps5fat','PS4 Pro y PS5 Fat'],['c-playstation-ps5-pro','PS5 Pro']],
    items:[
      {n:'PlayStation 1', p:500, img:'x-ps1', d:'Mantenimiento de lector óptico, limpieza de placa y revisión de fuente de poder.', k:'ps1 psx ps one'},
      {n:'PlayStation 2', m:'PS2', p:500, k:'ps2'},
      {n:'PlayStation 3', m:'PS3', p:500, k:'ps3 fat slim'},
      {n:'PlayStation 4', m:'PS4', p:500, k:'ps4 fat slim pro'},
      {n:'PlayStation 5', p:800, img:'x-ps5-slim', d:'Limpieza de disipador, cambio de metal líquido, revisión de ventiladores y puertos.', k:'ps5 slim pro fat'}
    ]},
  laptops:{label:'Laptops', gallery:[['c-laptops','Básicas, gama media y gama alta']],
    items:[
      {n:'Laptops (todas las gamas)', m:'LAPTOP', p:null, d:'Básicas, de gama media, gamer y gama alta. El mantenimiento se cotiza según marca, modelo y diagnóstico. Escríbenos y te damos el costo exacto.', k:'laptop portatil computadora gamer hp dell lenovo asus acer mac', w:'según servicio'}
    ]}
};

/* RESEÑAS (sección Opiniones)
   n = nombre de la persona   t = lo que escribió */
var REVIEWS = [
  {n:'Osmar de Jesús Jiménez Rubio', t:'Excelente servicio. Te atienden rápidamente y, al solicitar sus servicios, te explican y detallan los costos para que tomes la mejor decisión. Al entregarte tu producto reparado, te muestran su funcionamiento para que estés seguro de la reparación o mantenimiento. Ofrecen garantía en caso de cualquier falla posterior, sin costo adicional. Cuentan con un gran catálogo de dispositivos que reparan, lo cual los convierte en una excelente opción. Los costos son bastante buenos y justificados, con una excelente relación calidad-precio.'},
  {n:'Antonio C.', t:'Excelente servicio. Llevé mi Nintendo Switch a reparación porque dejó de leer los cartuchos. Me dieron un diagnóstico correcto y oportuno, solucionaron el problema y los precios de la reparación son extremadamente accesibles. La consola quedó al 100 %. Sin duda, elegí la mejor opción para reparación. 100 % recomendable y honestos, que es lo más importante hoy en día.'},
  {n:'Jesús Azael Hernández Bautista', t:'Recomiendo ampliamente este lugar. Muy buena atención al cliente, resuelven todas tus dudas. Desde la recepción hasta la entrega de tus equipos fueron muy amables. Los recomiendo 10/10 😊'},
  {n:'Lino Ángeles', t:'Ofrecen un muy buen servicio, atienden rápido y me explicaron qué tenía mi consola. Llevaré próximamente más de mis equipos a revisión.'},
  {n:'Danxs Cardoso Pérez', t:'Excelente servicio, son muy amables y te atienden en cuanto llegas. Llevé mi Nintendo Switch y la repararon bien, con un precio muy accesible. Recomiendo mucho el lugar.'},
  {n:'Luis Ricardo Cano Valadez', t:'Excelente servicio, no confiaría a nadie más mis consolas y reparaciones. Muy amables, muy eficientes; el servicio al cliente es muy bueno. Resolvieron todas mis dudas y exigencias. Muchas gracias 🫂'}
];
