export type Spice = {
  id: string;
  name: string;
  nameTwi: string;
  nameGa: string;
  category: "local" | "mixed" | "bulk";
  pricePerOlonka: number;
  unit: string;
  emoji: string;
  description: string;
  stock: number;
  image?: string;
};

export const SPICES: Spice[] = [
  { id: "ginger", name: "Ginger", nameTwi: "Akakayi", nameGa: "Ginger", category: "local", pricePerOlonka: 50, unit: "olonka", emoji: "🫚", description: "Fresh local ginger roots", stock: 120 },
  { id: "prekese", name: "Prekese", nameTwi: "Prekese", nameGa: "Prekese", category: "local", pricePerOlonka: 40, unit: "olonka", emoji: "🫘", description: "Dried prekese pods for soup", stock: 5 },
  { id: "anise", name: "Anise Seeds", nameTwi: "Nkitinkiti", nameGa: "Anise", category: "local", pricePerOlonka: 35, unit: "olonka", emoji: "🌾", description: "Fragrant anise seeds", stock: 80 },
  { id: "jollof-mix", name: "Jollof Mix", nameTwi: "Jollof Mix", nameGa: "Jollof Mix", category: "mixed", pricePerOlonka: 60, unit: "olonka", emoji: "🌶️", description: "Ready jollof spice blend", stock: 45 },
  { id: "kelewele-mix", name: "Kelewele Mix", nameTwi: "Kelewele Mix", nameGa: "Kelewele Mix", category: "mixed", pricePerOlonka: 45, unit: "olonka", emoji: "🧡", description: "Spicy kelewele seasoning", stock: 55 },
  { id: "garlic", name: "Garlic", nameTwi: "Garlic", nameGa: "Garlic", category: "local", pricePerOlonka: 55, unit: "olonka", emoji: "🧄", description: "Fresh garlic bulbs", stock: 90 },
  { id: "hwentia", name: "Negro Pepper", nameTwi: "Hwentia", nameGa: "Hwentia", category: "local", pricePerOlonka: 70, unit: "olonka", emoji: "⚫", description: "Hwentia / grains of selim", stock: 40 },
  { id: "curry", name: "Curry Powder", nameTwi: "Curry", nameGa: "Curry", category: "mixed", pricePerOlonka: 30, unit: "olonka", emoji: "🟡", description: "Mild curry powder", stock: 100 },
  { id: "thyme", name: "Thyme", nameTwi: "Thyme", nameGa: "Thyme", category: "local", pricePerOlonka: 25, unit: "olonka", emoji: "🌿", description: "Dried thyme leaves", stock: 70 },
  { id: "shito-mix", name: "Shito Mix", nameTwi: "Shito Mix", nameGa: "Shito Mix", category: "mixed", pricePerOlonka: 50, unit: "olonka", emoji: "🔥", description: "Base spices for shito", stock: 35 },
  { id: "shito-pepper", name: "Shito Pepper", nameTwi: "Makoh", nameGa: "Shito Pepper", category: "local", pricePerOlonka: 40, unit: "olonka", emoji: "🌶️", description: "Dried chili for shito", stock: 60 },
  { id: "cloves", name: "Cloves", nameTwi: "Pepre", nameGa: "Cloves", category: "local", pricePerOlonka: 80, unit: "olonka", emoji: "🟤", description: "Whole cloves", stock: 25 },
  { id: "bay-leaf", name: "Bay Leaves", nameTwi: "Bay Leaf", nameGa: "Bay Leaf", category: "local", pricePerOlonka: 20, unit: "olonka", emoji: "🍃", description: "Dried bay leaves", stock: 50 },
  { id: "nutmeg", name: "Nutmeg", nameTwi: "Warekesɛ", nameGa: "Nutmeg", category: "local", pricePerOlonka: 65, unit: "olonka", emoji: "🟤", description: "Whole nutmeg", stock: 30 },
  { id: "peppercorn", name: "Black Pepper", nameTwi: "Pεperε", nameGa: "Black Pepper", category: "local", pricePerOlonka: 55, unit: "olonka", emoji: "⬛", description: "Whole black pepper", stock: 75 },
  { id: "turmeric", name: "Turmeric", nameTwi: "Turmeric", nameGa: "Turmeric", category: "local", pricePerOlonka: 35, unit: "olonka", emoji: "🟠", description: "Ground turmeric", stock: 85 },
  { id: "suuya-mix", name: "Suuya Mix", nameTwi: "Suuya Mix", nameGa: "Suuya Mix", category: "mixed", pricePerOlonka: 48, unit: "olonka", emoji: "🥩", description: "Street suuya spice blend", stock: 40 },
  { id: "egusi", name: "Egusi / Agushi", nameTwi: "Agushi", nameGa: "Agushi", category: "local", pricePerOlonka: 45, unit: "olonka", emoji: "🌱", description: "Ground melon seeds", stock: 55 },
  { id: "dawadawa", name: "Dawadawa", nameTwi: "Dawadawa", nameGa: "Dawadawa", category: "local", pricePerOlonka: 30, unit: "olonka", emoji: "🟤", description: "Fermented locust beans", stock: 20 },
  { id: "bulk-ginger", name: "Ginger (Sack)", nameTwi: "Akakayi Sack", nameGa: "Ginger Sack", category: "bulk", pricePerOlonka: 280, unit: "sack", emoji: "🫚", description: "Wholesale sack of ginger", stock: 15 },
];

export const STALL_LOCATIONS = [
  "Lane 1", "Lane 2", "Lane 3", "Agbogbloshie", "Okaishie", "Kantamanto",
  "Makola Market Main", "Kaneshie", "Mallam", "Circle",
];

export const ADMIN_PHONE = "0548161539";
export const ADMIN_PHONE_INTL = "233548161539";
export const WHATSAPP_NUMBER = ADMIN_PHONE_INTL;
export const CALL_NUMBER = ADMIN_PHONE;

export const SUPER_ADMIN_EMAIL = "piitukaduut21@gmail.com";
export const SUPER_ADMIN_PASSWORD = "Dominion4244";
export const ADMIN_EMAIL = "admin@makola.com";
export const ADMIN_PASSWORD = "admin123";

export type Role = "BUYER" | "RIDER" | "ADMIN" | "SUPER_ADMIN";

export function isSuperAdmin(email?: string | null) {
  return (email || "").toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
}
