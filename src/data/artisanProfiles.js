const STATE_BY_CODE = {
  an: "Andaman and Nicobar Islands",
  ap: "Andhra Pradesh",
  ar: "Arunachal Pradesh",
  as: "Assam",
  br: "Bihar",
  ch: "Chandigarh",
  ct: "Chhattisgarh",
  dd: "Dadra and Nagar Haveli",
  dl: "Delhi",
  ga: "Goa",
  gj: "Gujarat",
  hp: "Himachal Pradesh",
  hr: "Haryana",
  jh: "Jharkhand",
  jk: "Jammu and Kashmir",
  ka: "Karnataka",
  kl: "Kerala",
  la: "Ladakh",
  ld: "Lakshadweep",
  mh: "Maharashtra",
  ml: "Meghalaya",
  mn: "Manipur",
  mp: "Madhya Pradesh",
  mz: "Mizoram",
  nl: "Nagaland",
  or: "Odisha",
  pb: "Punjab",
  py: "Puducherry",
  rj: "Rajasthan",
  sk: "Sikkim",
  tg: "Telangana",
  tn: "Tamil Nadu",
  tr: "Tripura",
  up: "Uttar Pradesh",
  ut: "Uttarakhand",
  wb: "West Bengal",
};

const STATE_ART_FORMS = {
  "Andaman and Nicobar Islands": "Shell Craft / Cane Work / Island Photography",
  "Andhra Pradesh": "Kalamkari / Kondapalli Toys / Leather Puppetry",
  "Arunachal Pradesh": "Bamboo Craft / Thangka Painting / Tribal Textiles",
  Assam: "Muga Silk / Bell Metal / Mask Making",
  Bihar: "Madhubani / Sujani Embroidery / Tikuli Art",
  Chandigarh: "Modern Painting / Public Art / Ceramic Craft",
  Chhattisgarh: "Dhokra / Terracotta / Tribal Painting",
  "Dadra and Nagar Haveli": "Warli Painting / Bamboo Craft / Tribal Weaving",
  Delhi: "Contemporary Art / Zardozi / Installation Art",
  Goa: "Azulejo Tiles / Coconut Craft / Coastal Painting",
  Gujarat: "Rogan Art / Kutch Embroidery / Patola",
  Haryana: "Phulkari / Pottery / Folk Painting",
  "Himachal Pradesh": "Miniature Painting / Wool Weaving / Wood Carving",
  "Jammu and Kashmir": "Pashmina / Papier Mache / Carpet Weaving",
  Jharkhand: "Sohrai Painting / Dokra / Bamboo Craft",
  Karnataka: "Bidriware / Mysore Painting / Rosewood Carving",
  Kerala: "Mural Painting / Coir Craft / Kathakali Masks",
  Ladakh: "Thangka Painting / Pashmina / Metal Craft",
  Lakshadweep: "Coconut Craft / Mat Weaving / Island Photography",
  "Madhya Pradesh": "Gond Art / Chanderi Weaving / Stone Craft",
  Maharashtra: "Warli / Paithani / Kolhapuri Craft",
  Manipur: "Longpi Pottery / Textile Weaving / Bamboo Craft",
  Meghalaya: "Cane Craft / Eri Silk / Tribal Jewellery",
  Mizoram: "Puan Weaving / Bamboo Craft / Woodwork",
  Nagaland: "Naga Weaving / Beadwork / Wood Carving",
  Odisha: "Pattachitra / Ikat / Dhokra",
  Puducherry: "Auroville Pottery / Handmade Paper / Coastal Art",
  Punjab: "Phulkari / Wood Inlay / Folk Painting",
  Rajasthan: "Blue Pottery / Bandhani / Block Print",
  Sikkim: "Thangka Painting / Carpet Weaving / Bamboo Craft",
  "Tamil Nadu": "Tanjore Painting / Bronze Casting / Kanchipuram Silk",
  Telangana: "Cheriyal Scrolls / Bidriware / Pearl Craft",
  Tripura: "Bamboo Craft / Cane Work / Tribal Textiles",
  "Uttar Pradesh": "Chikankari / Zardozi / Brassware",
  Uttarakhand: "Aipan Art / Ringaal Craft / Wool Weaving",
  "West Bengal": "Kantha / Terracotta / Dokra",
};

const FEATURED_ARTISANS = {
  rj1: {
    id: "rj1",
    name: "Kripal Singh Shekhawat",
    state: "Rajasthan",
    artStyle: "Blue Pottery",
    experience: "42 years",
    rating: 4.9,
    bio: "National Award-winning potter who revived Jaipur's Persian-origin blue pottery tradition, famous for cobalt-and-white floral motifs.",
    profileImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20pottery%20from%20Jaipur%204.jpg",
    imageAlt: "Blue pottery artwork from Jaipur representing Kripal Singh Shekhawat's craft tradition",
    imageCredit: "Representative craft image from Wikimedia Commons",
    workImages: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20pottery%20from%20Jaipur%202.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Pottery%2C%20Jaipur%20School%20of%20Art.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Jaipur%20Blue%20Pottery%20Vase%20with%20Raja-Rani%20Design.jpg",
    ],
  },
  rj2: {
    id: "rj2",
    name: "Anokhi Devi",
    state: "Rajasthan",
    artStyle: "Bandhani Tie-Dye",
    experience: "28 years",
    rating: 4.7,
    bio: "Master of resist-dyeing; her sarees feature intricate dot patterns achieved by hand-tying thousands of tiny fabric knots.",
  },
  br1: {
    id: "br1",
    name: "Ganga Devi",
    state: "Bihar",
    artStyle: "Madhubani Painting",
    experience: "55 years",
    rating: 5,
    bio: "Padma Shri awardee celebrated for two-dimensional Madhubani works depicting mythological stories in bold natural pigments.",
    profileImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Mithila-Madhubani%20Painting.jpg",
    imageAlt: "Madhubani painting representing Ganga Devi's art tradition",
    imageCredit: "Representative craft image from Wikimedia Commons",
  },
  mh1: {
    id: "mh1",
    name: "Jivya Soma Mashe",
    state: "Maharashtra",
    artStyle: "Warli Art",
    experience: "60 years",
    rating: 5,
    bio: "Padma Shri recipient who transformed ancestral Warli tribal geometric motifs into internationally recognised fine-art canvases.",
    profileImage: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20Warli%20painting%20by%20Jivya%20Soma%20Mashe%2C%20Thane%20district.jpg",
    imageAlt: "Warli painting by Jivya Soma Mashe",
    imageCredit: "Artwork image from Wikimedia Commons",
    workImages: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20Warli%20painting%20by%20Jivya%20Soma%20Mashe%2C%20Thane%20district.jpg",
    ],
  },
  mh2: {
    id: "mh2",
    name: "Sulochana Patil",
    state: "Maharashtra",
    artStyle: "Paithani Silk Weaving",
    experience: "35 years",
    rating: 4.8,
    bio: "Third-generation weaver creating Paithani sarees with gold-zari peacock motifs on handlooms that each take up to six months.",
  },
  gj1: {
    id: "gj1",
    name: "Abdul Gafur Khatri",
    state: "Gujarat",
    artStyle: "Rogan Art",
    experience: "40 years",
    rating: 4.9,
    bio: "One of the last surviving masters of Rogan, a 300-year-old craft of castor-oil paint on fabric practiced in Kutch.",
  },
  wb1: {
    id: "wb1",
    name: "Mita Mondal",
    state: "West Bengal",
    artStyle: "Kantha Embroidery",
    experience: "22 years",
    rating: 4.6,
    bio: "Artisan from Murshidabad known for running-stitch kantha quilts that narrate folk tales through layered recycled saris.",
  },
  or1: {
    id: "or1",
    name: "Raghunath Prusti",
    state: "Odisha",
    artStyle: "Pattachitra",
    experience: "48 years",
    rating: 4.9,
    bio: "Nationally awarded for intricate palm-leaf and cloth paintings depicting stories from Jagannath temple mythology.",
  },
  up1: {
    id: "up1",
    name: "Shabana Khatoon",
    state: "Uttar Pradesh",
    artStyle: "Chikankari Embroidery",
    experience: "30 years",
    rating: 4.8,
    bio: "Master of 36 distinct Chikankari stitches on fine muslin, shown at craft fairs and boutique exhibitions.",
  },
  tn1: {
    id: "tn1",
    name: "P. Rengasamy",
    state: "Tamil Nadu",
    artStyle: "Tanjore Painting",
    experience: "36 years",
    rating: 4.9,
    bio: "Third-generation Tanjore artist using gold foil and stone detailing to create luminous devotional panels.",
  },
  ka1: {
    id: "ka1",
    name: "Ibrahim Shareef",
    state: "Karnataka",
    artStyle: "Bidriware",
    experience: "38 years",
    rating: 4.8,
    bio: "Craftsman from Bidar creating silver-inlaid zinc alloy Bidri pieces rooted in Deccan metalwork traditions.",
  },
  jk1: {
    id: "jk1",
    name: "Gulam Rasool Dar",
    state: "Jammu and Kashmir",
    artStyle: "Pashmina Weaving",
    experience: "45 years",
    rating: 5,
    bio: "Master weaver from Srinagar whose pashmina shawls require months of careful handwork.",
  },
};

const ARTIST_NAME_POOL = ["Aarav Sharma", "Meera Joshi", "Kabir Khan", "Ananya Das", "Rohan Iyer"];
const ART_FORM_POOL = ["Heritage Painting", "Textile Weaving", "Folk Sculpture", "Handcrafted Decor", "Contemporary Mixed Media"];

function artFormsForState(state) {
  return (STATE_ART_FORMS[state] || "Painting / Handicrafts / Folk Art").split("/").map(item => item.trim()).filter(Boolean);
}

function generatedArtisan(id) {
  const match = id.match(/^([a-z]{2})-artist-(\d+)$/);
  if (!match) return null;

  const state = STATE_BY_CODE[match[1]];
  const index = Number(match[2]) - 1;
  if (!state || index < 0 || index >= ARTIST_NAME_POOL.length) return null;

  const artStyle = ART_FORM_POOL[index];
  const name = `${ARTIST_NAME_POOL[index]} (${state})`;

  return {
    id,
    name,
    state,
    artStyle,
    experience: `${8 + index * 5} years`,
    rating: Number((4.5 + index * 0.1).toFixed(1)),
    bio: `${ARTIST_NAME_POOL[index]} represents ${state}'s creative community through ${artStyle.toLowerCase()}, blending regional traditions with contemporary presentation for KalaShaala visitors.`,
  };
}

export function getArtisanProfile(id) {
  const profile = FEATURED_ARTISANS[id] || generatedArtisan(id);
  if (!profile) return null;

  const forms = artFormsForState(profile.state);
  return {
    ...profile,
    artForms: forms,
    phone: "+91 98765 43210",
    email: `${profile.id}@kalashaala.in`,
    works: forms.concat(profile.artStyle).slice(0, 4).map((form, index) => ({
      id: `${profile.id}-work-${index + 1}`,
      title: `${form} Study ${index + 1}`,
      medium: form,
      year: String(2020 + index),
      motif: `motif-${(index % 4) + 1}`,
      image: profile.workImages?.[index] || profile.profileImage,
      imageAlt: `${form} artwork connected to ${profile.name}`,
      description: `A KalaShaala artwork panel inspired by ${form.toLowerCase()} from ${profile.state}.`,
    })),
  };
}
