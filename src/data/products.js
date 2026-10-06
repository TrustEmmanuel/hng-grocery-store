export const categories = [
  {
    slug: "staples",
    name: "Nigerian Staples",
    blurb: "Garri, grains, oils, and the cubes that start dinner.",
  },
  {
    slug: "drinks",
    name: "Drinks & Beverages",
    blurb: "Cold bottles, tinned milk, and water for the house.",
  },
  {
    slug: "bakery",
    name: "Bread & Bakery",
    blurb: "Agege loaves, butter bread, and a meat pie for later.",
  },
  {
    slug: "household",
    name: "Household Essentials",
    blurb: "Washing-up, detergent, soap, and tissue.",
  },
];

const ARTS = {
  garri: { form: "sack", swatch: "#F3E4C4", body: "#E6C56B", cap: "#8C6230", ink: "#3E2B0E", label: "GARRI" },
  semovita: { form: "sack", swatch: "#F6EFE2", body: "#F4F0E6", cap: "#C4A15A", ink: "#6B4E16", label: "SEMO" },
  rice: { form: "sack", swatch: "#F4F0E6", body: "#F7F4EC", cap: "#2F6B4F", ink: "#1E4D3A", label: "RICE" },
  beans: { form: "sack", swatch: "#F0E4D4", body: "#C4A882", cap: "#6E4E32", ink: "#3A2918", label: "BEANS" },
  palm: { form: "bottle", swatch: "#F8E4D4", body: "#E07030", cap: "#8A3412", ink: "#6A2A0C", label: "PALM" },
  groundnut: { form: "bottle", swatch: "#F8F0DC", body: "#F0D48A", cap: "#C45C26", ink: "#6A4010", label: "OIL" },
  maggi: { form: "carton", swatch: "#FDECC2", body: "#F0B429", cap: "#C4312E", ink: "#7A1C16", label: "MAGGI" },
  sugar: { form: "sack", swatch: "#F7F3EA", body: "#FBF8F2", cap: "#2A6B9A", ink: "#1A4E78", label: "SUGAR" },
  tomato: { form: "tin", swatch: "#F8E6E2", body: "#D64532", cap: "#F2E4C4", ink: "#FFF8EE", label: "PASTE" },
  indomie: { form: "pouch", swatch: "#F8EEDD", body: "#E10600", cap: "#F2C200", ink: "#241C14", label: "INDO" },
  coke: { form: "bottle", swatch: "#F6E4E2", body: "#C81E1E", cap: "#6E1210", ink: "#FFF6F2", label: "COLA" },
  fanta: { form: "bottle", swatch: "#FDE8D0", body: "#F07818", cap: "#C45500", ink: "#FFF6EC", label: "FANTA" },
  sprite: { form: "bottle", swatch: "#E5F2E6", body: "#1F8A4C", cap: "#0E5C32", ink: "#F4FFF6", label: "SPRITE" },
  peak: { form: "tin", swatch: "#EEF3F8", body: "#F4F7FB", cap: "#1E4D8C", ink: "#16386A", label: "PEAK" },
  milo: { form: "tin", swatch: "#F6EBD4", body: "#6B3A22", cap: "#E0B040", ink: "#F8E7B8", label: "MILO" },
  water: { form: "bottle", swatch: "#E7F1F6", body: "#D7EBF3", cap: "#2E86AB", ink: "#1A5670", label: "WATER" },
  fivealive: { form: "bottle", swatch: "#FDE8EE", body: "#E23B6A", cap: "#8E1D42", ink: "#FFF5F7", label: "PULPY" },
  hollandia: { form: "bottle", swatch: "#F4F7E8", body: "#F7F4EA", cap: "#3E7A56", ink: "#1E4D3A", label: "YOGH" },
  agege: { form: "loaf", swatch: "#F7EDD8", body: "#E2B15A", cap: "#C4843A", ink: "#6A4014", label: "AGEGE" },
  butterbread: { form: "loaf", swatch: "#F8F1E2", body: "#F0D7A2", cap: "#D9A15A", ink: "#7A5420", label: "BUTTER" },
  meatpie: { form: "pouch", swatch: "#F6E6D4", body: "#D4924A", cap: "#8C4E24", ink: "#4A2A12", label: "PIE" },
  chinchin: { form: "pouch", swatch: "#F8EFDC", body: "#F2D48A", cap: "#C45C26", ink: "#6A3A10", label: "CHIN" },
  morningfresh: { form: "bottle", swatch: "#E5F4EA", body: "#B7E38A", cap: "#2F6B4F", ink: "#1A4030", label: "FRESH" },
  omo: { form: "carton", swatch: "#E8F0F8", body: "#2F6FED", cap: "#F4F7FB", ink: "#F7FAFF", label: "OMO" },
  tissue: { form: "carton", swatch: "#F6F3EE", body: "#FBF8F3", cap: "#7EB0D4", ink: "#3A6A8C", label: "TISSUE" },
  dettol: { form: "bar", swatch: "#E7F6EF", body: "#F4FBF7", cap: "#1F8A4C", ink: "#14663A", label: "DETTOL" },
};

function id(n) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

const PHOTO_SLUGS = new Set([
  "garri",
  "semovita",
  "rice",
  "beans",
  "palm",
  "groundnut",
  "maggi",
  "sugar",
  "tomato",
  "indomie",
  "coke",
  "fanta",
  "sprite",
  "peak",
  "milo",
  "water",
  "fivealive",
  "hollandia",
  "agege",
  "butterbread",
  "meatpie",
  "chinchin",
  "morningfresh",
  "tissue",
  "dettol",
]);

function item(n, glyph, name, description, price, category, stock) {
  return {
    id: id(n),
    name,
    description,
    price,
    category,
    image_url: PHOTO_SLUGS.has(glyph) ? `/products/${glyph}.jpg` : `glyph://${glyph}`,
    stock_quantity: stock,
  };
}

export const seedProducts = [
  item(1, "garri", "Garri Ijebu 5kg", "Fine, slightly sour Ijebu garri for eba that holds. Washed, toasted, and packed as a 5kg sack.", 4500, "Nigerian Staples", 36),
  item(2, "semovita", "Semovita 2kg", "Golden Penny Semovita for a smooth swallow. 2kg bag, the midweek size.", 3200, "Nigerian Staples", 28),
  item(3, "rice", "Golden Penny Rice 5kg", "Long-grain parboiled rice that cooks separate. A 5kg bag for the household pot.", 9200, "Nigerian Staples", 22),
  item(4, "beans", "Honey Beans 2kg", "Honey beans, cleaned and ready to soak. 2kg, enough for a pot of stew beans.", 3800, "Nigerian Staples", 30),
  item(5, "palm", "Palm Oil 75cl", "Red palm oil with a deep colour for banga, stew, and fried plantain. 75cl bottle.", 2600, "Nigerian Staples", 34),
  item(6, "groundnut", "Groundnut Oil 1L", "Neutral groundnut oil for frying and everyday cooking. 1 litre.", 3400, "Nigerian Staples", 26),
  item(7, "maggi", "Maggi Star Cubes", "The yellow cube that seasons the pot. A pack for the week of soups and rice.", 1250, "Nigerian Staples", 48),
  item(8, "sugar", "Dangote Sugar 1kg", "Granulated sugar in a 1kg pack for tea, pap, and baking.", 1650, "Nigerian Staples", 40),
  item(9, "tomato", "Tomato Paste 400g", "Concentrated tomato paste, 400g tin. Stretch it with fresh pepper and onion.", 900, "Nigerian Staples", 50),
  item(10, "indomie", "Indomie Chicken 70g", "Chicken flavour Indomie, the 70g pack. Boil, stir, and eat.", 300, "Nigerian Staples", 80),
  item(11, "coke", "Coca-Cola 50cl", "Chilled-when-you-want-it Coca-Cola in the 50cl bottle.", 400, "Drinks & Beverages", 60),
  item(12, "fanta", "Fanta Orange 50cl", "Fanta orange, 50cl. The bright one that goes with meat pie.", 400, "Drinks & Beverages", 60),
  item(13, "sprite", "Sprite 50cl", "Sprite lemon-lime, 50cl bottle.", 400, "Drinks & Beverages", 55),
  item(14, "peak", "Peak Milk 400g", "Peak full cream milk powder, 400g tin. For tea, custard, and pap.", 2800, "Drinks & Beverages", 32),
  item(15, "milo", "Milo 400g", "Nestlé Milo, 400g tin. Chocolate malt for morning and after school.", 2950, "Drinks & Beverages", 30),
  item(16, "water", "Eva Water 75cl", "Eva table water, 75cl bottle.", 200, "Drinks & Beverages", 90),
  item(17, "fivealive", "Five Alive Pulpy", "Five Alive pulpy juice drink. Fruit, chill, and a straw if you have one.", 650, "Drinks & Beverages", 24),
  item(18, "hollandia", "Hollandia Yoghurt 1L", "Hollandia yoghurt, 1 litre. Drink it cold or pour it over cereal.", 1800, "Drinks & Beverages", 18),
  item(19, "agege", "Agege Bread", "A sliced Agege loaf, soft in the middle with a little pull on the crust.", 1300, "Bread & Bakery", 20),
  item(20, "butterbread", "Butter Bread", "Butter bread, lightly sweet. Toast it or eat it with eggs.", 950, "Bread & Bakery", 16),
  item(21, "meatpie", "Meat Pie", "A single meat pie, peppered filling, flaky enough for the afternoon.", 600, "Bread & Bakery", 14),
  item(22, "chinchin", "Chin Chin 250g", "Crunchy chin chin, 250g pack. Sweet, salty, and gone quickly.", 850, "Bread & Bakery", 22),
  item(23, "morningfresh", "Morning Fresh 400ml", "Morning Fresh dishwashing liquid, 400ml. Cuts stew pots and oil.", 1450, "Household Essentials", 27),
  item(24, "omo", "Omo Detergent 900g", "Omo washing powder, 900g. For the weekly load.", 2300, "Household Essentials", 25),
  item(25, "tissue", "Tissue 4 Rolls", "Soft tissue, a pack of four rolls for kitchen and bathroom.", 1600, "Household Essentials", 33),
  item(26, "dettol", "Dettol Bar Soap", "Dettol anti-bacterial bar. One bar for the sink.", 750, "Household Essentials", 44),
];

export const featuredNames = [
  "Indomie Chicken 70g",
  "Coca-Cola 50cl",
  "Agege Bread",
  "Maggi Star Cubes",
  "Semovita 2kg",
  "Golden Penny Rice 5kg",
  "Garri Ijebu 5kg",
  "Palm Oil 75cl",
];

const keywordArts = [
  [/garri/, ARTS.garri],
  [/semo/, ARTS.semovita],
  [/rice/, ARTS.rice],
  [/bean/, ARTS.beans],
  [/palm/, ARTS.palm],
  [/groundnut/, ARTS.groundnut],
  [/maggi/, ARTS.maggi],
  [/sugar/, ARTS.sugar],
  [/tomato/, ARTS.tomato],
  [/indomie|noodle/, ARTS.indomie],
  [/coca|coke/, ARTS.coke],
  [/fanta/, ARTS.fanta],
  [/sprite/, ARTS.sprite],
  [/peak/, ARTS.peak],
  [/milo/, ARTS.milo],
  [/water|eva/, ARTS.water],
  [/five alive|pulpy/, ARTS.fivealive],
  [/hollandia|yoghurt|yogurt/, ARTS.hollandia],
  [/agege/, ARTS.agege],
  [/butter bread/, ARTS.butterbread],
  [/meat pie|meatpie/, ARTS.meatpie],
  [/chin/, ARTS.chinchin],
  [/morning fresh|dishwash/, ARTS.morningfresh],
  [/omo|detergent/, ARTS.omo],
  [/tissue|towel/, ARTS.tissue],
  [/dettol|soap/, ARTS.dettol],
];

export function artForProduct(product) {
  const glyph = String(product.image_url || "").replace("glyph://", "");
  if (ARTS[glyph]) return ARTS[glyph];
  const name = product.name.toLowerCase();
  for (const [pattern, art] of keywordArts) {
    if (pattern.test(name)) return art;
  }
  return {
    form: "sack",
    swatch: "#E7EFE8",
    body: "#D5E4D6",
    cap: "#1E4D3A",
    ink: "#1E4D3A",
    label: product.name.slice(0, 8).toUpperCase(),
  };
}

export function pickFeatured(products) {
  const chosen = featuredNames
    .map((name) => products.find((product) => product.name === name))
    .filter(Boolean);
  return chosen.length >= 4 ? chosen : products.slice(0, 8);
}

export function categoryBySlug(slug) {
  return categories.find((category) => category.slug === slug) || null;
}
