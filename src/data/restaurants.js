/**
 * Lista de restaurantes disponibles en el campus UC
 */
export const restaurants = [
  {
    id: 'subway',
    nombre: 'Subway',
    descripcion: 'Sándwiches y ensaladas frescas',
    categoria: 'Comida Rápida',
    horario: 'Lun-Vie: 9:00-20:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 1, nombre: 'Subway 15cm Italiano', precio: 3490, categoria: 'Sándwiches' },
      { id: 2, nombre: 'Subway 30cm Italiano', precio: 5990, categoria: 'Sándwiches' },
      { id: 3, nombre: 'Subway 15cm Pollo Teriyaki', precio: 3690, categoria: 'Sándwiches' },
      { id: 4, nombre: 'Subway 30cm Pollo Teriyaki', precio: 6290, categoria: 'Sándwiches' },
      { id: 5, nombre: 'Ensalada Veggie', precio: 4290, categoria: 'Ensaladas' },
      { id: 6, nombre: 'Ensalada Pollo', precio: 4790, categoria: 'Ensaladas' },
      { id: 7, nombre: 'Combo Subway + Bebida', precio: 6490, categoria: 'Combos' },
      { id: 8, nombre: 'Galleta Chispas de Chocolate', precio: 990, categoria: 'Postres' },
    ],
  },
  {
    id: 'fork',
    nombre: 'Fork',
    descripcion: 'Comida saludable y bowls',
    categoria: 'Saludable',
    horario: 'Lun-Vie: 10:00-19:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 9, nombre: 'Bowl Mediterráneo', precio: 5490, categoria: 'Bowls' },
      { id: 10, nombre: 'Bowl Asiático', precio: 5690, categoria: 'Bowls' },
      { id: 11, nombre: 'Bowl Proteico', precio: 6290, categoria: 'Bowls' },
      { id: 12, nombre: 'Ensalada Caesar', precio: 4990, categoria: 'Ensaladas' },
      { id: 13, nombre: 'Wrap de Pollo', precio: 4490, categoria: 'Wraps' },
      { id: 14, nombre: 'Jugo Natural', precio: 2490, categoria: 'Bebidas' },
      { id: 15, nombre: 'Smoothie Frutal', precio: 3290, categoria: 'Bebidas' },
    ],
  },
  {
    id: 'little-caesars',
    nombre: 'Little Caesars',
    descripcion: 'Pizza lista para llevar',
    categoria: 'Pizza',
    horario: 'Lun-Vie: 11:00-21:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 16, nombre: 'Pizza Pepperoni Personal', precio: 3990, categoria: 'Pizzas' },
      { id: 17, nombre: 'Pizza Pepperoni Mediana', precio: 6990, categoria: 'Pizzas' },
      { id: 18, nombre: 'Pizza Pepperoni Familiar', precio: 9990, categoria: 'Pizzas' },
      { id: 19, nombre: 'Pizza Vegetariana', precio: 7490, categoria: 'Pizzas' },
      { id: 20, nombre: 'Crazy Bread', precio: 2490, categoria: 'Acompañamientos' },
      { id: 21, nombre: 'Bebida 500ml', precio: 1290, categoria: 'Bebidas' },
      { id: 22, nombre: 'Combo Pizza + Bebida', precio: 8490, categoria: 'Combos' },
    ],
  },
  {
    id: 'las-colombianas',
    nombre: 'Las Colombianas',
    descripcion: 'Empanadas tradicionales',
    categoria: 'Comida Tradicional',
    horario: 'Lun-Vie: 8:00-18:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 23, nombre: 'Empanada de Pino', precio: 1490, categoria: 'Empanadas' },
      { id: 24, nombre: 'Empanada de Queso', precio: 1390, categoria: 'Empanadas' },
      { id: 25, nombre: 'Empanada de Pollo', precio: 1490, categoria: 'Empanadas' },
      { id: 26, nombre: 'Empanada Napolitana', precio: 1590, categoria: 'Empanadas' },
      { id: 27, nombre: 'Combo 3 Empanadas + Bebida', precio: 4990, categoria: 'Combos' },
      { id: 28, nombre: 'Jugo Natural', precio: 1790, categoria: 'Bebidas' },
    ],
  },
  {
    id: 'castano',
    nombre: 'Castaño',
    descripcion: 'Café y pastelería',
    categoria: 'Café',
    horario: 'Lun-Vie: 7:30-20:00',
    ubicacion: 'Varias ubicaciones',
    menu: [
      { id: 29, nombre: 'Café Americano', precio: 1990, categoria: 'Café' },
      { id: 30, nombre: 'Café Latte', precio: 2490, categoria: 'Café' },
      { id: 31, nombre: 'Cappuccino', precio: 2690, categoria: 'Café' },
      { id: 32, nombre: 'Muffin Chocolate', precio: 1890, categoria: 'Pastelería' },
      { id: 33, nombre: 'Brownie', precio: 2190, categoria: 'Pastelería' },
      { id: 34, nombre: 'Sándwich Jamón y Queso', precio: 3290, categoria: 'Sándwiches' },
      { id: 35, nombre: 'Croissant', precio: 1690, categoria: 'Pastelería' },
    ],
  },
  {
    id: 'achoclonados',
    nombre: 'Achoclonados',
    descripcion: 'Café y bebidas dulces',
    categoria: 'Café',
    horario: 'Lun-Vie: 8:00-19:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 36, nombre: 'Café Helado', precio: 2990, categoria: 'Café Frío' },
      { id: 37, nombre: 'Frappé Chocolate', precio: 3490, categoria: 'Frappés' },
      { id: 38, nombre: 'Frappé Vainilla', precio: 3490, categoria: 'Frappés' },
      { id: 39, nombre: 'Chocolate Caliente', precio: 2490, categoria: 'Bebidas Calientes' },
      { id: 40, nombre: 'Té Chai Latte', precio: 2790, categoria: 'Bebidas Calientes' },
      { id: 41, nombre: 'Waffle con Nutella', precio: 3990, categoria: 'Postres' },
    ],
  },
  {
    id: 'el-huerto',
    nombre: 'El Huerto',
    descripcion: 'Comida vegetariana y vegana',
    categoria: 'Vegetariano',
    horario: 'Lun-Vie: 11:00-18:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 42, nombre: 'Bowl Vegano', precio: 5290, categoria: 'Bowls' },
      { id: 43, nombre: 'Hamburguesa Veggie', precio: 4790, categoria: 'Hamburguesas' },
      { id: 44, nombre: 'Ensalada Quinoa', precio: 4490, categoria: 'Ensaladas' },
      { id: 45, nombre: 'Wrap Falafel', precio: 4290, categoria: 'Wraps' },
      { id: 46, nombre: 'Jugo Verde Detox', precio: 2990, categoria: 'Bebidas' },
      { id: 47, nombre: 'Kombucha', precio: 2490, categoria: 'Bebidas' },
    ],
  },
  {
    id: 'jumbo',
    nombre: 'Jumbo Express',
    descripcion: 'Snacks y bebidas',
    categoria: 'Minimarket',
    horario: 'Lun-Vie: 8:00-21:00',
    ubicacion: 'Campus San Joaquín',
    menu: [
      { id: 48, nombre: 'Sándwich Pollo-Palta', precio: 3490, categoria: 'Sándwiches' },
      { id: 49, nombre: 'Ensalada Lista', precio: 3990, categoria: 'Ensaladas' },
      { id: 50, nombre: 'Yogurt con Granola', precio: 2290, categoria: 'Snacks' },
      { id: 51, nombre: 'Papas Fritas', precio: 1490, categoria: 'Snacks' },
      { id: 52, nombre: 'Bebida 500ml', precio: 1290, categoria: 'Bebidas' },
      { id: 53, nombre: 'Agua Mineral', precio: 990, categoria: 'Bebidas' },
      { id: 54, nombre: 'Snack Frutos Secos', precio: 1990, categoria: 'Snacks' },
    ],
  },
];

/**
 * Puntos de entrega disponibles en el campus
 */
export const PUNTOS_ENTREGA = [
  { id: 1, nombre: 'Castaño Ingeniería' },
  { id: 2, nombre: 'Castaño College' },
  { id: 3, nombre: 'Biblioteca' },
  { id: 4, nombre: 'Comedor Comercial' },
  { id: 5, nombre: 'Patio de Los Naranjos' },
  { id: 6, nombre: 'Escuela de Ingeniería' },
  { id: 7, nombre: 'Facultad de Economía' },
  { id: 8, nombre: 'Casa Central' },
  { id: 9, nombre: 'Gimnasio PENTA' },
  { id: 10, nombre: 'Metro San Joaquín' },
];

/**
 * Cargo fijo por delivery
 */
export const DELIVERY_FEE = 500;

/**
 * Obtiene un restaurante por ID
 * @param {string} id - ID del restaurante
 * @returns {Object|null} Restaurante encontrado o null
 */
export const getRestaurantById = (id) => {
  return restaurants.find((r) => r.id === id) || null;
};

/**
 * Obtiene restaurantes por categoría
 * @param {string} categoria - Categoría del restaurante
 * @returns {Array} Lista de restaurantes de la categoría
 */
export const getRestaurantsByCategory = (categoria) => {
  if (!categoria || categoria === 'all') return restaurants;
  return restaurants.filter((r) => r.categoria === categoria);
};

/**
 * Obtiene todas las categorías únicas
 * @returns {Array} Lista de categorías
 */
export const getCategories = () => {
  const categories = [...new Set(restaurants.map((r) => r.categoria))];
  return categories.sort();
};
