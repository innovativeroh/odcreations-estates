export interface Property {
  id: string;
  title: string;
  location: string;
  size: string;
  beds: number;
  baths: number;
  yearBuilt: number;
  price: string;
  returnRate: string;
  rentalYield: string;
  appreciation: string;
  minInvestment: string;
  image: string;
  gallery: string[];
  badge?: { text: string; type: string };
  description: string;
  mapIframe: string;
}

export const propertiesData: Property[] = [
  {
    id: "1",
    title: "Sunset Villa",
    location: "Beverly Hills, CA",
    size: "4,200 sq.ft.",
    beds: 5,
    baths: 5,
    yearBuilt: 2021,
    price: "26,00,00,000",
    returnRate: "7%",
    rentalYield: "4.2%",
    appreciation: "2.8%",
    minInvestment: "8,00,000",
    image: "/property-1.png",
    gallery: ["/property-1.png", "/property-2.png", "/property-3.png"],
    badge: { text: "New", type: "white" },
    description: "Located in the heart of Beverly Hills, Sunset Villa offers an unparalleled luxury living experience. This architectural masterpiece features soaring high ceilings, vast floor-to-ceiling glass doors, and a bespoke zero-edge infinity pool looking out over the canyon. Designed with sustainable premium materials, this property is fully optimized for fractional real estate investment, offering stable rental yields from high-profile tenants and a strong history of capital appreciation.",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.2610747425114!2d-118.41164922379515!3d34.088439115787624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c7c379ea714778!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1704443900000!5m2!1sen!2sus"
  },
  {
    id: "2",
    title: "Glasshouse Retreat",
    location: "Austin, TX",
    size: "3,500 sq.ft.",
    beds: 4,
    baths: 4,
    yearBuilt: 2022,
    price: "15,00,00,000",
    returnRate: "6.5%",
    rentalYield: "4.0%",
    appreciation: "2.5%",
    minInvestment: "4,00,000",
    image: "/property-2.png",
    gallery: ["/property-2.png", "/property-3.png", "/property-4.png"],
    badge: { text: "Funded", type: "orange" },
    description: "A sanctuary of modern architecture nestled quietly in the rolling hills of Austin, Texas. The Glasshouse Retreat is a study in visual transparency and minimalist engineering. Every room enjoys unbounded landscape views, with glass structural frames seamlessly connecting indoor living spaces with custom outdoor decks and native woodland. Highly attractive to Austin's fast-growing technology executive demographic.",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110287.76634594248!2d-97.85032895664061!3d30.307982299999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b599a0cc58f1%3A0xcd306c5990264157!2sAustin%2C%20TX!5e0!3m2!1sen!2sus!4v1704444000000!5m2!1sen!2sus"
  },
  {
    id: "3",
    title: "Skyline Residence",
    location: "Los Angeles, CA",
    size: "4,800 sq.ft.",
    beds: 5,
    baths: 6,
    yearBuilt: 2020,
    price: "34,00,00,000",
    returnRate: "8.02%",
    rentalYield: "4.82%",
    appreciation: "3.2%",
    minInvestment: "12,00,000",
    image: "/property-3.png",
    gallery: ["/property-3.png", "/property-4.png", "/property-1.png"],
    badge: { text: "Popular", type: "green" },
    description: "Perched dramatically above the Los Angeles skyline, this ultra-modern estate offers explosive panoramic views of the city basin all the way to the Pacific Ocean. Built to the highest architectural standards, the residence features open-concept hosting spaces, a private screening room, and multi-level infinity terrace features. Its strong historical rental yield and highly liquid fractional pool make it a favorite for aggressive portfolio builders.",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.73882772595!2d-118.35338162380068!3d34.050630617277215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2b9a76d8b6711%3A0x7d6f51cb3206dfd8!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1704444100000!5m2!1sen!2sus"
  },
  {
    id: "4",
    title: "Palmview Estate",
    location: "Miami, FL",
    size: "5,000 sq.ft.",
    beds: 4,
    baths: 5,
    yearBuilt: 2023,
    price: "31,00,00,000",
    returnRate: "7.2%",
    rentalYield: "4.5%",
    appreciation: "2.7%",
    minInvestment: "8,00,000",
    image: "/property-4.png",
    gallery: ["/property-4.png", "/property-1.png", "/property-2.png"],
    badge: undefined,
    description: "Embodying the vibrant lifestyle of coastal Miami, Palmview Estate is a spacious luxury sanctuary situated on a private canal inlet. The layout is optimized for outdoor entertainment, with a sprawling pool terrace, outdoor kitchen, and private boat slip features. Strong year-round luxury vacation demand ensures consistent and resilient yield profiles for long-term real estate investors.",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114964.85338274712!2d-80.299499!3d25.7823907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a58747d4b3%3A0x9590c67990b78e63!2sMiami%2C%20FL!5e0!3m2!1sen!2sus!4v1704444200000!5m2!1sen!2sus"
  }
];
