"use client";

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
  image: string | null;
  category: string | null;
}

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className="group flex flex-col items-start rounded-[2rem] bg-white p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#3E2723]/10"
        >
          {/* Product Image Placeholder */}
          <div className="relative mb-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-[#D7CCC8]/20 bg-[#F9F6F0] transition-colors group-hover:bg-[#FFF8E1]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="font-[family-name:var(--font-playfair)] text-5xl font-bold text-[#D7CCC8] group-hover:text-[#3E2723]/20">
                B
              </span>
            )}

            {/* Hover Action Indicator */}
            <div className="absolute right-3 bottom-3 flex h-8 w-8 translate-y-4 items-center justify-center rounded-full bg-[#3E2723] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex w-full flex-col items-start px-1">
            <span className="text-[10px] font-black tracking-[0.15em] text-[#8D6E63] uppercase">
              {product.category ?? "Beverage"}
            </span>
            <h3 className="mt-1 line-clamp-1 text-lg font-bold text-[#3E2723]">
              {product.nameTh ?? product.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xs font-bold text-[#3E2723]">฿</span>
              <span className="text-2xl font-black text-[#3E2723]">
                {product.price.toLocaleString()}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
