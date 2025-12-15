export interface SDGData {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  icon: string;
  targets: string[];
  howToHelp: string[];
}

export const sdgData: SDGData[] = [
  {
    id: 1,
    title: "No Poverty",
    shortTitle: "Poverty",
    description: "End poverty in all its forms everywhere. More than 700 million people still live in extreme poverty and struggle to fulfill basic needs.",
    color: "from-red-600 to-red-700",
    icon: "HandHeart",
    targets: [
      "Eradicate extreme poverty for all people everywhere",
      "Reduce at least by half the proportion of people living in poverty",
      "Implement social protection systems for all"
    ],
    howToHelp: [
      "Support local businesses and fair trade products",
      "Volunteer with organizations fighting poverty",
      "Advocate for policies that address inequality"
    ]
  },
  {
    id: 2,
    title: "Zero Hunger",
    shortTitle: "Hunger",
    description: "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    color: "from-amber-500 to-amber-600",
    icon: "Wheat",
    targets: [
      "End hunger and ensure access to safe, nutritious food",
      "End all forms of malnutrition",
      "Double agricultural productivity of small-scale food producers"
    ],
    howToHelp: [
      "Reduce food waste in your household",
      "Support local farmers and sustainable agriculture",
      "Donate to food banks and hunger relief organizations"
    ]
  },
  {
    id: 3,
    title: "Good Health and Well-being",
    shortTitle: "Health",
    description: "Ensure healthy lives and promote well-being for all at all ages.",
    color: "from-green-500 to-green-600",
    icon: "Heart",
    targets: [
      "Reduce maternal mortality ratio",
      "End preventable deaths of newborns and children",
      "End epidemics of major communicable diseases"
    ],
    howToHelp: [
      "Promote vaccination and preventive healthcare",
      "Support mental health awareness",
      "Advocate for universal healthcare access"
    ]
  },
  {
    id: 4,
    title: "Quality Education",
    shortTitle: "Education",
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    color: "from-red-500 to-rose-600",
    icon: "GraduationCap",
    targets: [
      "Ensure all children complete free primary and secondary education",
      "Ensure equal access to quality pre-primary education",
      "Eliminate gender disparities in education"
    ],
    howToHelp: [
      "Volunteer as a tutor or mentor",
      "Donate books and school supplies",
      "Support scholarships for underprivileged students"
    ]
  },
  {
    id: 5,
    title: "Gender Equality",
    shortTitle: "Gender",
    description: "Achieve gender equality and empower all women and girls.",
    color: "from-orange-500 to-orange-600",
    icon: "Users",
    targets: [
      "End all forms of discrimination against women and girls",
      "Eliminate all forms of violence against women and girls",
      "Ensure women's full participation in leadership"
    ],
    howToHelp: [
      "Challenge gender stereotypes and biases",
      "Support women-owned businesses",
      "Advocate for equal pay and opportunities"
    ]
  },
  {
    id: 6,
    title: "Clean Water and Sanitation",
    shortTitle: "Water",
    description: "Ensure availability and sustainable management of water and sanitation for all.",
    color: "from-cyan-500 to-cyan-600",
    icon: "Droplets",
    targets: [
      "Achieve universal access to safe drinking water",
      "Achieve access to adequate sanitation and hygiene",
      "Improve water quality by reducing pollution"
    ],
    howToHelp: [
      "Conserve water in daily activities",
      "Support clean water initiatives",
      "Avoid polluting water sources"
    ]
  },
  {
    id: 7,
    title: "Affordable and Clean Energy",
    shortTitle: "Energy",
    description: "Ensure access to affordable, reliable, sustainable and modern energy for all.",
    color: "from-yellow-400 to-yellow-500",
    icon: "Sun",
    targets: [
      "Ensure universal access to modern energy services",
      "Increase share of renewable energy",
      "Double the global rate of energy efficiency improvement"
    ],
    howToHelp: [
      "Switch to renewable energy sources",
      "Reduce energy consumption at home",
      "Support clean energy policies"
    ]
  },
  {
    id: 8,
    title: "Decent Work and Economic Growth",
    shortTitle: "Work",
    description: "Promote sustained, inclusive and sustainable economic growth, full employment and decent work for all.",
    color: "from-rose-600 to-rose-700",
    icon: "Briefcase",
    targets: [
      "Sustain per capita economic growth",
      "Achieve full and productive employment",
      "Eradicate forced labour and child labour"
    ],
    howToHelp: [
      "Support fair trade and ethical businesses",
      "Advocate for workers' rights",
      "Mentor young professionals"
    ]
  },
  {
    id: 9,
    title: "Industry, Innovation and Infrastructure",
    shortTitle: "Innovation",
    description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
    color: "from-orange-600 to-orange-700",
    icon: "Factory",
    targets: [
      "Develop quality, reliable infrastructure",
      "Promote inclusive and sustainable industrialization",
      "Increase access to financial services and markets"
    ],
    howToHelp: [
      "Support local innovation and startups",
      "Advocate for sustainable infrastructure",
      "Invest in technology education"
    ]
  },
  {
    id: 10,
    title: "Reduced Inequalities",
    shortTitle: "Equality",
    description: "Reduce inequality within and among countries.",
    color: "from-pink-500 to-pink-600",
    icon: "Scale",
    targets: [
      "Achieve income growth for the bottom 40%",
      "Empower and promote social inclusion",
      "Ensure equal opportunity and reduce inequalities"
    ],
    howToHelp: [
      "Support marginalized communities",
      "Advocate for inclusive policies",
      "Challenge discriminatory practices"
    ]
  },
  {
    id: 11,
    title: "Sustainable Cities and Communities",
    shortTitle: "Cities",
    description: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
    color: "from-amber-600 to-amber-700",
    icon: "Building2",
    targets: [
      "Ensure access to adequate housing and basic services",
      "Provide sustainable transport systems",
      "Reduce environmental impact of cities"
    ],
    howToHelp: [
      "Use public transportation",
      "Support urban green spaces",
      "Participate in community planning"
    ]
  },
  {
    id: 12,
    title: "Responsible Consumption and Production",
    shortTitle: "Consumption",
    description: "Ensure sustainable consumption and production patterns.",
    color: "from-amber-500 to-yellow-600",
    icon: "Recycle",
    targets: [
      "Implement sustainable consumption programs",
      "Halve global food waste",
      "Reduce waste generation through prevention and recycling"
    ],
    howToHelp: [
      "Reduce, reuse, and recycle",
      "Choose sustainable products",
      "Minimize food waste"
    ]
  },
  {
    id: 13,
    title: "Climate Action",
    shortTitle: "Climate",
    description: "Take urgent action to combat climate change and its impacts.",
    color: "from-green-600 to-green-700",
    icon: "Thermometer",
    targets: [
      "Strengthen resilience to climate-related hazards",
      "Integrate climate measures into policies",
      "Improve education on climate change mitigation"
    ],
    howToHelp: [
      "Reduce your carbon footprint",
      "Support climate policies",
      "Plant trees and protect forests"
    ]
  },
  {
    id: 14,
    title: "Life Below Water",
    shortTitle: "Oceans",
    description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development.",
    color: "from-blue-500 to-blue-600",
    icon: "Fish",
    targets: [
      "Prevent and reduce marine pollution",
      "Sustainably manage marine ecosystems",
      "End overfishing and illegal fishing"
    ],
    howToHelp: [
      "Reduce plastic use",
      "Choose sustainable seafood",
      "Support ocean conservation efforts"
    ]
  },
  {
    id: 15,
    title: "Life on Land",
    shortTitle: "Land",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems, manage forests, combat desertification, halt biodiversity loss.",
    color: "from-green-500 to-emerald-600",
    icon: "TreePine",
    targets: [
      "Ensure conservation of terrestrial ecosystems",
      "Promote sustainable forest management",
      "Combat desertification and restore degraded land"
    ],
    howToHelp: [
      "Plant trees and support reforestation",
      "Protect local wildlife habitats",
      "Support sustainable land use practices"
    ]
  },
  {
    id: 16,
    title: "Peace, Justice and Strong Institutions",
    shortTitle: "Peace",
    description: "Promote peaceful and inclusive societies, provide access to justice for all and build effective institutions.",
    color: "from-blue-600 to-blue-700",
    icon: "Scale",
    targets: [
      "Significantly reduce all forms of violence",
      "End abuse and exploitation of children",
      "Promote the rule of law and ensure equal access to justice"
    ],
    howToHelp: [
      "Support human rights organizations",
      "Participate in civic activities",
      "Advocate for transparent governance"
    ]
  },
  {
    id: 17,
    title: "Partnerships for the Goals",
    shortTitle: "Partnerships",
    description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
    color: "from-indigo-500 to-indigo-600",
    icon: "Handshake",
    targets: [
      "Strengthen domestic resource mobilization",
      "Enhance global partnership for sustainable development",
      "Encourage effective partnerships"
    ],
    howToHelp: [
      "Collaborate with organizations working on SDGs",
      "Share knowledge and resources",
      "Support international cooperation initiatives"
    ]
  }
];
