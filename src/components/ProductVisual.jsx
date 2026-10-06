import { useState } from "react";
import { ProductArt } from "./ProductArt";

const FOCUS = {
  water: "center 18%",
  milo: "center 80%",
  palm: "center 78%",
  morningfresh: "70% center",
  chinchin: "center 38%",
  garri: "center 72%",
  maggi: "center 50%",
  dettol: "center 72%",
  fivealive: "center 46%",
  groundnut: "center 42%",
  coke: "center 38%",
};

const CONTAIN = new Set(["coke", "fanta", "sprite", "water", "groundnut"]);

export function isPhoto(src) {
  return typeof src === "string" && (src.startsWith("/") || src.startsWith("http"));
}

export function ProductVisual({ product }) {
  const [failed, setFailed] = useState(false);
  const src = product.image_url || "";

  if (!isPhoto(src) || failed) {
    return <ProductArt product={product} />;
  }

  const slug = src.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "") || "";
  const focus = FOCUS[slug];

  return (
    <div className="photo-frame">
      <img
        src={src}
        alt=""
        className={CONTAIN.has(slug) ? "is-contain" : undefined}
        style={focus ? { objectPosition: focus } : undefined}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
