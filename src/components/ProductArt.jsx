import { artForProduct } from "../data/products";

function Label({ art, y, fill }) {
  return (
    <text
      x="80"
      y={y}
      textAnchor="middle"
      fontFamily="Figtree, Segoe UI, sans-serif"
      fontSize="8"
      fontWeight="700"
      letterSpacing="0.6"
      fill={fill || "#241C14"}
    >
      {art.label}
    </text>
  );
}

function Sack({ art }) {
  return (
    <g>
      <path
        d="M58 78l6-20h32l6 20v62c0 10-10 16-22 16s-22-6-22-16V78z"
        fill={art.body}
      />
      <path d="M64 60h32l-4 14H68l-4-14z" fill={art.cap} />
      <path d="M76 52h8v10h-8z" fill={art.cap} />
      <rect x="64" y="104" width="32" height="26" rx="3" fill="#FFF9F0" />
      <Label art={art} y="121" />
    </g>
  );
}

function Bottle({ art }) {
  return (
    <g>
      <rect x="70" y="34" width="20" height="10" rx="2" fill={art.cap} />
      <path d="M74 44h12l3 12h-18l3-12z" fill={art.body} />
      <path
        d="M66 58c-8 8-12 16-12 28v58c0 8 8 14 26 14s26-6 26-14V86c0-12-4-20-12-28H66z"
        fill={art.body}
      />
      <rect x="62" y="108" width="36" height="26" rx="3" fill="#FFF9F0" opacity="0.95" />
      <Label art={art} y="125" />
      <path d="M70 70c6 2 10 8 10 16" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Carton({ art }) {
  return (
    <g>
      <path d="M50 62l30-16 30 16v84l-30 14-30-14V62z" fill={art.body} />
      <path d="M50 62l30 16 30-16" fill="none" stroke={art.cap} strokeWidth="8" />
      <path d="M80 78v82" stroke="#000" strokeOpacity="0.08" />
      <rect x="62" y="96" width="36" height="28" rx="2" fill="#FFF9F0" />
      <Label art={art} y="114" />
    </g>
  );
}

function Loaf({ art }) {
  return (
    <g>
      <path
        d="M42 118c0-28 18-48 38-48s38 20 38 48v22c0 10-16 16-38 16s-38-6-38-16v-22z"
        fill={art.body}
      />
      <path
        d="M58 112c2-16 10-26 22-26s20 10 22 26"
        fill="none"
        stroke={art.cap}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M70 96v28M80 90v36M90 96v28" stroke={art.ink} strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      <text
        x="80"
        y="148"
        textAnchor="middle"
        fontFamily="Figtree, Segoe UI, sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.6"
        fill={art.ink}
      >
        {art.label}
      </text>
    </g>
  );
}

function Tin({ art }) {
  return (
    <g>
      <ellipse cx="80" cy="58" rx="28" ry="10" fill={art.cap} />
      <path d="M52 58h56v78c0 8-12 14-28 14s-28-6-28-14V58z" fill={art.body} />
      <ellipse cx="80" cy="58" rx="28" ry="10" fill={art.cap} />
      <ellipse cx="80" cy="58" rx="16" ry="5" fill="#fff" opacity="0.35" />
      <rect x="58" y="92" width="44" height="28" fill="#FFF9F0" />
      <Label art={art} y="110" />
    </g>
  );
}

function Pouch({ art }) {
  return (
    <g>
      <path
        d="M56 64h48l8 14-6 78c-1 8-8 12-26 12s-25-4-26-12l-6-78 8-14z"
        fill={art.body}
      />
      <path d="M56 64l8-12h32l8 12" fill={art.cap} />
      <path d="M60 70h40" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="64" y="100" width="32" height="24" rx="2" fill="#FFF9F0" />
      <Label art={art} y="116" />
    </g>
  );
}

function Bar({ art }) {
  return (
    <g>
      <rect x="46" y="78" width="68" height="40" rx="8" fill={art.body} stroke={art.cap} strokeWidth="3" />
      <rect x="62" y="90" width="36" height="16" rx="3" fill="#fff" opacity="0.7" />
      <Label art={art} y="101" />
    </g>
  );
}

const FORMS = { sack: Sack, bottle: Bottle, carton: Carton, loaf: Loaf, tin: Tin, pouch: Pouch, bar: Bar };

export function ProductArt({ product, className = "" }) {
  const art = artForProduct(product);
  const Form = FORMS[art.form] || Sack;
  return (
    <div className={`art ${className}`.trim()} style={{ background: art.swatch }} aria-hidden="true">
      <svg viewBox="0 0 160 200">
        <ellipse cx="80" cy="176" rx="34" ry="6" fill="#1A1814" opacity="0.08" />
        <Form art={art} />
      </svg>
    </div>
  );
}
