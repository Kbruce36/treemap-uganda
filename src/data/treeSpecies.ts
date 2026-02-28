export interface TreeSpecies {
  name: string;
  scientificName: string;
  category: "indigenous" | "exotic" | "fruit" | "medicinal";
  description: string;
}

export const TREE_SPECIES: TreeSpecies[] = [
  {
    name: "Mango",
    scientificName: "Mangifera indica",
    category: "fruit",
    description: "Popular fruit tree widely grown across Uganda for shade and fruit production.",
  },
  {
    name: "Eucalyptus",
    scientificName: "Eucalyptus grandis",
    category: "exotic",
    description: "Fast-growing tree used for timber, firewood, and windbreaks in Uganda.",
  },
  {
    name: "Musizi",
    scientificName: "Maesopsis eminii",
    category: "indigenous",
    description: "Uganda's fastest growing indigenous timber tree, common in tropical forests.",
  },
  {
    name: "Mvule",
    scientificName: "Milicia excelsa",
    category: "indigenous",
    description: "Valued hardwood tree, the national tree of Uganda, prized for its durable timber.",
  },
  {
    name: "Jacaranda",
    scientificName: "Jacaranda mimosifolia",
    category: "exotic",
    description: "Ornamental tree with striking purple flowers, popular in Kampala streets.",
  },
  {
    name: "Avocado",
    scientificName: "Persea americana",
    category: "fruit",
    description: "Nutritious fruit tree widely grown in Ugandan homesteads and gardens.",
  },
  {
    name: "Neem",
    scientificName: "Azadirachta indica",
    category: "medicinal",
    description: "Multipurpose medicinal tree used for shade, medicine, and pest control.",
  },
  {
    name: "Jackfruit",
    scientificName: "Artocarpus heterophyllus",
    category: "fruit",
    description: "Large fruiting tree providing food and shade, common in East Africa.",
  },
  {
    name: "Moringa",
    scientificName: "Moringa oleifera",
    category: "medicinal",
    description: "Highly nutritious 'miracle tree' with edible leaves rich in vitamins.",
  },
  {
    name: "Grevillea",
    scientificName: "Grevillea robusta",
    category: "exotic",
    description: "Silky oak used in agroforestry systems, popular on Ugandan farms.",
  },
  {
    name: "Fig Tree",
    scientificName: "Ficus natalensis",
    category: "indigenous",
    description: "Sacred indigenous tree traditionally important in Ugandan culture.",
  },
  {
    name: "African Tulip",
    scientificName: "Spathodea campanulata",
    category: "indigenous",
    description: "Striking indigenous tree with bright orange flowers, often planted for ornament.",
  },
  {
    name: "Teak",
    scientificName: "Tectona grandis",
    category: "exotic",
    description: "Highly valued timber tree widely planted in Ugandan plantation forests.",
  },
  {
    name: "Whistling Pine",
    scientificName: "Casuarina equisetifolia",
    category: "exotic",
    description: "Wind-resistant tree used for coastal protection and firewood.",
  },
  {
    name: "Acacia",
    scientificName: "Acacia hockii",
    category: "indigenous",
    description: "Drought-tolerant tree important for nitrogen fixation in dry regions.",
  },
  {
    name: "Papaya",
    scientificName: "Carica papaya",
    category: "fruit",
    description: "Fast-growing fruit plant providing vitamin-rich fruit year round.",
  },
  {
    name: "Guava",
    scientificName: "Psidium guajava",
    category: "fruit",
    description: "Hardy fruit tree producing nutritious fruit, common in Ugandan gardens.",
  },
  {
    name: "Orange",
    scientificName: "Citrus sinensis",
    category: "fruit",
    description: "Widely cultivated fruit tree, important for nutrition and income.",
  },
  {
    name: "Musambya",
    scientificName: "Markhamia lutea",
    category: "indigenous",
    description: "Indigenous tree used for timber and traditionally important to Baganda culture.",
  },
  {
    name: "Munyama",
    scientificName: "Albizia coriaria",
    category: "indigenous",
    description: "Indigenous shade tree with nitrogen-fixing properties, supports soil fertility.",
  },
  {
    name: "African Olive",
    scientificName: "Olea europaea subsp. africana",
    category: "indigenous",
    description: "Hardy indigenous tree producing small olives, valued for its wood.",
  },
  {
    name: "Banana",
    scientificName: "Musa acuminata",
    category: "fruit",
    description: "Staple crop of Uganda, important for food security and local economy.",
  },
  {
    name: "Cassia",
    scientificName: "Cassia spectabilis",
    category: "exotic",
    description: "Yellow-flowering shade tree used for erosion control and green manure.",
  },
  {
    name: "Bamboo",
    scientificName: "Bambusa vulgaris",
    category: "indigenous",
    description: "Versatile grass used for construction, furniture, and soil stabilization.",
  },
  {
    name: "Cypress",
    scientificName: "Cupressus lusitanica",
    category: "exotic",
    description: "Conifer grown for timber, windbreaks, and watershed protection in Uganda.",
  },
  {
    name: "Terminalia",
    scientificName: "Terminalia brownii",
    category: "indigenous",
    description: "Multipurpose indigenous tree providing timber, fodder, and medicine.",
  },
  {
    name: "Croton",
    scientificName: "Croton megalocarpus",
    category: "indigenous",
    description: "Fast-growing indigenous tree used for charcoal, timber, and agroforestry.",
  },
  {
    name: "Piliostigma",
    scientificName: "Piliostigma thonningii",
    category: "medicinal",
    description: "Traditional medicinal tree used to treat various ailments in East Africa.",
  },
  {
    name: "African Mahogany",
    scientificName: "Khaya anthotheca",
    category: "indigenous",
    description: "Valuable hardwood timber tree native to Ugandan tropical forests.",
  },
  {
    name: "Umbrella Thorn",
    scientificName: "Vachellia tortilis",
    category: "indigenous",
    description: "Iconic savanna tree providing shade, pods for livestock, and gum arabic.",
  },
];

export const SPECIES_NAMES = TREE_SPECIES.map((s) => s.name);
