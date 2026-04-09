export const offersData = [
  {
    id: "OFF-001",
    title: "Festival Fever",
    description: "Get 20% off on all music festival tickets this season. Limited seats - book before they run out!",
    discount: "20% OFF",
    discountValue: 20,
    discountType: "percentage",
    category: "Music Festival",
    icon: "🎪",
    code: "FEST20",
    validTill: "2026-04-30",
    isNew: true,
    theme: "purple",
  },
  {
    id: "OFF-002",
    title: "Sports Mania",
    description: "Flat Rs. 300 off on IPL and all cricket match tickets. Catch the live action at a steal!",
    discount: "Rs. 300 OFF",
    discountValue: 300,
    discountType: "flat",
    category: "Sports",
    icon: "🏏",
    code: "IPL300",
    validTill: "2026-05-15",
    isNew: false,
    theme: "blue",
  },
  {
    id: "OFF-003",
    title: "Concert Special",
    description: "Buy 2 concert tickets and get 1 absolutely free on select live shows across India.",
    discount: "BUY 2 GET 1",
    discountValue: 33.33,
    discountType: "percentage",
    category: "Concert",
    icon: "🎤",
    code: "LIVE3FOR2",
    validTill: "2026-04-20",
    isNew: true,
    theme: "rose",
  },
  {
    id: "OFF-004",
    title: "Weekend Blast",
    description: "15% off on all weekend event tickets. New offer drops every Friday - do not miss out.",
    discount: "15% OFF",
    discountValue: 15,
    discountType: "percentage",
    category: "All Events",
    icon: "🎟️",
    code: "WKND15",
    validTill: "2026-04-07",
    isNew: false,
    theme: "orange",
  },
];

export const getOfferByCode = (code) => {
  return offersData.find(offer => offer.code.toUpperCase() === (code || '').toUpperCase());
};

export const isOfferValid = (offer) => {
  if (!offer) return false;
  return new Date() <= new Date(offer.validTill);
};

export const calculateDiscount = (offer, amount) => {
  if (!offer || !isOfferValid(offer)) return 0;
  
  if (offer.discountType === 'percentage') {
    return Math.round(amount * (offer.discountValue / 100));
  } else if (offer.discountType === 'flat') {
    return Math.min(offer.discountValue, amount);
  }
  return 0;
};
