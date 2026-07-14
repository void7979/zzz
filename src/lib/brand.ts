export const brandAssets = {
  logo: "/brand/rupiya-logo.png",
  hero: "/images/rupiya-interior-hero.jpg",
  seating: "/images/rupiya-interior-seating.jpg",
  wide: "/images/rupiya-interior-wide.jpg",
  cactus: "/images/rupiya-cactus-vibe.jpg",
} as const;

export const brandGallery = [
  {
    src: brandAssets.hero,
    altFa: "فضای داخلی روپیا با نور گرم و نشیمن لوکس",
    altEn: "RUPIYA interior with warm lighting and elegant seating",
  },
  {
    src: brandAssets.wide,
    altFa: "سالن اصلی کافه روپیا با میزهای چوبی گرد",
    altEn: "RUPIYA main hall with round wooden tables",
  },
  {
    src: brandAssets.seating,
    altFa: "نشیمن آرام روپیا برای گفتگو و قهوه",
    altEn: "Quiet RUPIYA seating for conversation and coffee",
  },
  {
    src: brandAssets.cactus,
    altFa: "جزئیات معماری و فضای سبز داخلی روپیا",
    altEn: "Architectural detail and greenery inside RUPIYA",
  },
] as const;
