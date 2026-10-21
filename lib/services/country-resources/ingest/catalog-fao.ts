/**
 * Catálogo de FAOSTAT: códigos de producto que cuentan como recurso.
 * Se excluyen los agregados (cereales totales, carne total…), los subproductos
 * (despojos, grasas, sueros) y los derivados lácteos, para no contar dos veces.
 */

import { ResourceCategory } from '../types';

type FaoEntry = [code: number, nameEs: string, aliases?: string[]];

/** Cultivos y aceites vegetales (dominio QCL, elemento 5510 «Production», toneladas). */
const CROPS: FaoEntry[] = [
  // Cereales
  [15, 'Trigo', ['wheat']], [27, 'Arroz', ['arroz con cáscara', 'paddy']], [44, 'Cebada'], [56, 'Maíz', ['corn', 'maize']],
  [71, 'Centeno'], [75, 'Avena'], [79, 'Mijo'], [83, 'Sorgo'], [89, 'Alforfón', ['trigo sarraceno']],
  [92, 'Quinua', ['quinoa']], [94, 'Fonio'], [97, 'Triticale'], [101, 'Alpiste'], [103, 'Mezcla de granos'],
  [108, 'Otros cereales'],
  // Raíces y tubérculos
  [116, 'Patatas', ['papas']], [122, 'Batatas', ['boniatos', 'camote']], [125, 'Yuca', ['mandioca', 'cassava']],
  [135, 'Yautía'], [136, 'Taro'], [137, 'Ñames'], [149, 'Otras raíces y tubérculos'],
  // Azúcar
  [156, 'Caña de azúcar'], [157, 'Remolacha azucarera'], [161, 'Otros cultivos azucareros'],
  [162, 'Azúcar en bruto', ['azúcar', 'sugar']],
  // Legumbres
  [176, 'Judías secas', ['frijoles', 'alubias', 'porotos']], [181, 'Habas secas'], [187, 'Guisantes secos', ['arvejas']],
  [191, 'Garbanzos'], [195, 'Caupí'], [197, 'Guandú'], [201, 'Lentejas'], [203, 'Guisante bambara'],
  [205, 'Vezas'], [210, 'Altramuces', ['lupino']], [211, 'Otras legumbres'],
  // Frutos secos
  [216, 'Nueces de Brasil'], [217, 'Anacardos', ['cajú', 'marañón']], [220, 'Castañas'], [221, 'Almendras'],
  [222, 'Nueces'], [223, 'Pistachos'], [224, 'Nueces de cola'], [225, 'Avellanas'], [226, 'Nueces de areca'],
  [234, 'Otros frutos secos'],
  // Oleaginosas
  [236, 'Soja', ['soya', 'soybeans']], [242, 'Cacahuetes', ['maní', 'peanuts']], [249, 'Cocos'],
  [254, 'Fruto de palma aceitera'], [256, 'Palmiste'], [260, 'Aceitunas', ['olivas']], [263, 'Karité'],
  [265, 'Ricino'], [267, 'Pipas de girasol', ['girasol']], [270, 'Colza', ['canola']], [275, 'Nueces de tung'],
  [277, 'Jojoba'], [280, 'Cártamo'], [289, 'Sésamo', ['ajonjolí']], [292, 'Mostaza'], [296, 'Semilla de amapola'],
  [299, 'Semilla de melón'], [305, 'Semilla de árbol del sebo'], [310, 'Fruto de kapok'], [311, 'Semilla de kapok'],
  [328, 'Algodón sin desmotar', ['algodón']], [329, 'Semilla de algodón'], [333, 'Linaza'], [336, 'Semilla de cáñamo'],
  [339, 'Otras oleaginosas'],
  // Aceites vegetales
  [237, 'Aceite de soja'], [244, 'Aceite de cacahuete'], [252, 'Aceite de coco'], [257, 'Aceite de palma'],
  [258, 'Aceite de palmiste'], [261, 'Aceite de oliva', ['aove', 'olive oil']], [268, 'Aceite de girasol'],
  [271, 'Aceite de colza', ['aceite de canola']],
  // Hortalizas
  [358, 'Coles', ['repollo']], [366, 'Alcachofas'], [367, 'Espárragos'], [372, 'Lechugas y achicorias'],
  [373, 'Espinacas'], [378, 'Hojas de yuca'], [388, 'Tomates', ['jitomate']], [393, 'Coliflores y brócolis'],
  [394, 'Calabazas'], [397, 'Pepinos'], [399, 'Berenjenas'], [401, 'Pimientos y chiles verdes'],
  [402, 'Cebolletas'], [403, 'Cebollas'], [406, 'Ajos'], [407, 'Puerros'], [414, 'Otras judías verdes'],
  [417, 'Guisantes verdes'], [420, 'Habas verdes'], [423, 'Judías verdes'], [426, 'Zanahorias y nabos'],
  [430, 'Okra', ['quimbombó']], [446, 'Maíz verde', ['elote', 'choclo']], [449, 'Setas y trufas', ['champiñones']],
  [459, 'Raíz de achicoria'], [461, 'Algarrobas'], [463, 'Otras hortalizas'],
  // Frutas
  [486, 'Bananas', ['plátanos']], [489, 'Plátanos macho'], [490, 'Naranjas', ['cítricos']],
  [495, 'Mandarinas y clementinas', ['cítricos']], [497, 'Limones y limas', ['cítricos']],
  [507, 'Pomelos', ['toronjas', 'cítricos']], [512, 'Otros cítricos'], [515, 'Manzanas'], [521, 'Peras'],
  [523, 'Membrillos'], [526, 'Albaricoques', ['damascos']], [530, 'Guindas'], [531, 'Cerezas'],
  [534, 'Melocotones y nectarinas', ['duraznos']], [536, 'Ciruelas'], [541, 'Otras frutas de hueso'],
  [542, 'Otras frutas de pepita'], [544, 'Fresas', ['frutillas']], [547, 'Frambuesas'],
  [549, 'Grosellas espinosas'], [550, 'Grosellas'], [552, 'Arándanos'], [554, 'Arándanos rojos'],
  [558, 'Otras bayas'], [560, 'Uvas'], [564, 'Vino', ['wine']], [567, 'Sandías'], [568, 'Melones'],
  [569, 'Higos'], [571, 'Mangos y guayabas'], [572, 'Aguacates', ['palta']], [574, 'Piñas', ['ananá']],
  [577, 'Dátiles'], [587, 'Caquis'], [591, 'Fruto del anacardo'], [592, 'Kiwis'], [600, 'Papayas'],
  [603, 'Otras frutas tropicales'], [619, 'Otras frutas'],
  // Estimulantes y especias
  [656, 'Café', ['café verde', 'coffee']], [661, 'Cacao', ['cacao en grano', 'cocoa']], [667, 'Té', ['hojas de té', 'tea']],
  [671, 'Yerba mate'], [677, 'Lúpulo'], [687, 'Pimienta'], [689, 'Pimientos y chiles secos', ['pimentón']],
  [692, 'Vainilla'], [693, 'Canela'], [698, 'Clavo'], [702, 'Nuez moscada y cardamomo'],
  [711, 'Anís, cilantro, comino y similares'], [720, 'Jengibre'], [723, 'Otras especias'], [748, 'Menta'],
  [754, 'Pelitre'], [826, 'Tabaco', ['tabaco en rama']],
  // Fibras y caucho
  [767, 'Algodón (fibra)', ['algodón']], [771, 'Lino'], [777, 'Cáñamo (fibra)'], [778, 'Fibra de kapok'],
  [780, 'Yute'], [782, 'Kenaf'], [788, 'Ramio'], [789, 'Sisal'], [800, 'Fibras de agave'], [809, 'Abacá'],
  [813, 'Fibra de coco'], [821, 'Otras fibras'], [836, 'Caucho natural', ['hule', 'rubber']],
];

/** Ganadería (dominio QCL, elemento 5510, toneladas). */
const LIVESTOCK: FaoEntry[] = [
  [867, 'Carne de vacuno', ['ternera', 'res', 'beef']], [882, 'Leche de vaca', ['leche']],
  [947, 'Carne de búfalo'], [951, 'Leche de búfala', ['leche']],
  [977, 'Carne de ovino', ['cordero']], [982, 'Leche de oveja', ['leche']], [987, 'Lana'],
  [1017, 'Carne de caprino', ['cabrito']], [1020, 'Leche de cabra', ['leche']],
  [1035, 'Carne de cerdo', ['porcino', 'pork']], [1058, 'Carne de pollo', ['aves', 'chicken']],
  [1062, 'Huevos de gallina', ['huevos', 'eggs']], [1069, 'Carne de pato'], [1073, 'Carne de ganso'],
  [1080, 'Carne de pavo'], [1091, 'Huevos de otras aves', ['huevos']], [1097, 'Carne de caballo'],
  [1127, 'Carne de camello'], [1130, 'Leche de camella', ['leche']], [1141, 'Carne de conejo'],
  [1163, 'Carne de caza'], [1176, 'Caracoles'], [1182, 'Miel', ['honey']], [1183, 'Cera de abejas'],
  [1185, 'Capullos de seda'], [1186, 'Seda cruda'],
];

/**
 * Cabaña ganadera (dominio QCL, elementos «Stocks»: 5111 en cabezas, 5112 en miles de cabezas,
 * 5114 en número de colmenas). Son existencias, no producción anual.
 */
const STOCKS: FaoEntry[] = [
  [866, 'Cabaña bovina', ['vacas', 'ganado vacuno', 'cattle', 'reses']],
  [946, 'Cabaña de búfalos', ['búfalos']],
  [976, 'Cabaña ovina', ['ovejas', 'sheep']],
  [1016, 'Cabaña caprina', ['cabras', 'goats']],
  [1034, 'Cabaña porcina', ['cerdos', 'pigs', 'porcino']],
  [1057, 'Pollos y gallinas', ['aves de corral', 'poultry', 'gallinas']],
  [1068, 'Patos', ['aves de corral']],
  [1072, 'Gansos', ['aves de corral']],
  [1079, 'Pavos', ['aves de corral']],
  [1096, 'Caballos', ['equinos', 'horses']],
  [1107, 'Asnos', ['burros', 'equinos']],
  [1110, 'Mulos y burdéganos', ['equinos']],
  [1126, 'Camellos', ['dromedarios', 'camels']],
  [1140, 'Conejos y liebres', ['conejos']],
  [1157, 'Llamas, alpacas y otros camélidos', ['llamas', 'alpacas']],
  [1181, 'Colmenas', ['abejas', 'apicultura', 'bees']],
];

/** Productos forestales (dominio FO). Los agregados oficiales sí se usan aquí. */
const FORESTRY: FaoEntry[] = [
  [1861, 'Madera en rollo', ['madera', 'roundwood', 'timber']],
  [1865, 'Madera en rollo industrial', ['madera']],
  [1864, 'Leña', ['madera combustible', 'wood fuel']],
  [1872, 'Madera aserrada', ['madera', 'sawnwood']],
  [1875, 'Pulpa de madera', ['celulosa', 'wood pulp']],
  [1630, 'Carbón vegetal'],
];

export interface FaoCatalogEntry {
  code: number;
  nameEs: string;
  category: ResourceCategory;
  aliases?: string[];
}

function toMap(entries: FaoEntry[], category: ResourceCategory): Map<number, FaoCatalogEntry> {
  return new Map(entries.map(([code, nameEs, aliases]) => [code, { code, nameEs, category, aliases }]));
}

/** Dominio QCL (cultivos y ganadería). */
export const FAO_QCL_CATALOG: Map<number, FaoCatalogEntry> = new Map([
  ...toMap(CROPS, 'agriculture'),
  ...toMap(LIVESTOCK, 'livestock'),
]);

/** Dominio QCL, existencias de animales. */
export const FAO_STOCKS_CATALOG: Map<number, FaoCatalogEntry> = toMap(STOCKS, 'livestock');

/** Dominio FO (forestal). */
export const FAO_FO_CATALOG: Map<number, FaoCatalogEntry> = toMap(FORESTRY, 'forestry');
