export type ServiceCategory = {
  slug: string;
  title: string;
  description: string;
  parent?: string;
  image: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  categorySlug: string;
  image: string;
  popular?: boolean;
  rank?: number;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "wall-designs",
    title: "Wall Designs",
    description:
      "Creative wall painting, feature walls, textures, patterns and decorative finishes.",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "home-painting-decoration",
    title: "Interior Painting",
    description:
      "Complete painting and decoration solutions for every important space in your home.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "bedroom",
    title: "Bedroom",
    description:
      "Comfortable and beautiful bedroom painting and decoration solutions.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "kids-room",
    title: "Kids Room",
    description:
      "Fun, colorful and creative painting ideas for children's rooms.",
    parent: "bedroom",
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "boy",
    title: "Boy",
    description:
      "Creative room painting and decoration ideas designed for boys.",
    parent: "kids-room",
    image:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "girl",
    title: "Girl",
    description:
      "Beautiful and playful room painting ideas designed for girls.",
    parent: "kids-room",
    image:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "bachelor-room",
    title: "Bachelor Room",
    description:
      "Modern and practical painting styles for bachelor bedrooms.",
    parent: "bedroom",
    image:
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "male",
    title: "Male",
    description:
      "Modern masculine room colors, textures and wall designs.",
    parent: "bachelor-room",
    image:
      "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "female",
    title: "Female",
    description:
      "Elegant and stylish room painting and decoration ideas.",
    parent: "bachelor-room",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "master-bedroom",
    title: "Master Bedroom",
    description:
      "Premium painting and decorative finishes for master bedrooms.",
    parent: "bedroom",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "living-room",
    title: "Living Room",
    description:
      "Welcoming colors, feature walls and premium finishes for living rooms.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "study-room",
    title: "Study Room",
    description:
      "Calm and focused colors and wall designs for study spaces.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "balcony",
    title: "Balcony",
    description:
      "Fresh and weather-conscious painting solutions for balconies.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "kitchen",
    title: "Kitchen",
    description:
      "Clean, durable and stylish painting solutions for kitchens.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "dining-room",
    title: "Dining Room",
    description:
      "Warm and elegant colors for memorable dining spaces.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
  },

  {
    slug: "bathroom",
    title: "Bathroom",
    description:
      "Fresh and moisture-conscious painting solutions for bathrooms.",
    parent: "home-painting-decoration",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  },
];

export const defaultServices: ServiceItem[] = [
  {
    id: "wall-feature-paint",
    title: "Feature Wall Painting",
    description:
      "Transform one wall into a beautiful focal point with premium painting.",
    price: 3500,
    unit: "per wall",
    categorySlug: "wall-designs",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 1,
  },

  {
    id: "wall-texture",
    title: "Decorative Texture Finish",
    description:
      "Add depth and character with a premium decorative wall texture.",
    price: 4500,
    unit: "per wall",
    categorySlug: "wall-designs",
    image:
      "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 2,
  },

  {
    id: "boy-room-paint",
    title: "Kids Boy Room Makeover",
    description:
      "Playful colors and creative wall painting for a boy's room.",
    price: 8500,
    unit: "per room",
    categorySlug: "boy",
    image:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 1,
  },

  {
    id: "girl-room-paint",
    title: "Kids Girl Room Makeover",
    description:
      "Colorful and creative painting designed for a girl's room.",
    price: 8500,
    unit: "per room",
    categorySlug: "girl",
    image:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 2,
  },

  {
    id: "master-bedroom-paint",
    title: "Master Bedroom Premium Paint",
    description:
      "Premium wall painting for a calm and elegant master bedroom.",
    price: 12000,
    unit: "per room",
    categorySlug: "master-bedroom",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 1,
  },

  {
    id: "living-room-paint",
    title: "Living Room Painting",
    description:
      "Complete living room painting with carefully selected modern colors.",
    price: 10000,
    unit: "per room",
    categorySlug: "living-room",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    popular: true,
    rank: 1,
  },

  {
    id: "kitchen-paint",
    title: "Kitchen Painting",
    description:
      "Fresh and durable painting for kitchen walls and surfaces.",
    price: 7500,
    unit: "per kitchen",
    categorySlug: "kitchen",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: "study-room-paint",
    title: "Study Room Painting",
    description:
      "Calm and productive color combinations for your study room.",
    price: 7000,
    unit: "per room",
    categorySlug: "study-room",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
];