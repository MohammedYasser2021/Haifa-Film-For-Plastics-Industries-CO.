// Optional real photos: drop hero / machines / rolls / quality (.jpg .png .webp) into src/assets/photos/.
// When a photo exists it replaces the built-in illustration automatically; no code change needed.
const files = import.meta.glob("../assets/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager: true, import: "default" });
export const photo = (name) => {
  const k = Object.keys(files).find((p) => (p.split("/").pop() || "").replace(/\.[^.]+$/, "").toLowerCase() === name);
  return k ? files[k] : null;
};
