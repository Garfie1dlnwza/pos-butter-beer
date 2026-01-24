"use client";

import Image from "next/image";

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
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className="group cursor-pointer relative flex flex-col overflow-hidden rounded-xl border border-[#D7CCC8]/30 bg-white transition-all duration-300 hover:border-[#3E2723] hover:shadow-lg hover:shadow-[#3E2723]/5"
        >
          {/* Image Container - Aspect Ratio 1:1 */}
          <div className="relative aspect-square w-full overflow-hidden bg-[#F9F9F9]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              // Minimal Fallback
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#FFF8E1] text-[#D7CCC8] transition-colors group-hover:bg-[#F5F5F5]">
                <span className="text-4xl font-bold opacity-30">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Overlay Gradient on Hover (Subtle) */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/[0.03]" />
          </div>

          {/* Product Details */}
          <div className="flex w-full flex-1 flex-col justify-between p-4">
            <div className="flex flex-col justify-center items-center gap-2">
              {/* Category Tag */}
              <p className="mb-1 text-[10px] font-bold tracking-widest text-[#8D6E63] uppercase">
                {product.category ?? "Item"}
              </p>

              {/* Product Name */}
              <h3 className="line-clamp-2 text-left text-base leading-tight font-bold text-[#3E2723] transition-colors group-hover:text-[#5D4037]">
                {product.nameTh ?? product.name}
              </h3>
            </div>

            {/* Price - Bottom aligned */}
            <div className="mt-4 flex items-baseline justify-between border-t border-[#D7CCC8]/30 pt-3">
              <span className="text-xs font-medium text-[#8D6E63]">Price</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-semibold text-[#3E2723]">฿</span>
                <span className="text-xl font-bold text-[#3E2723]">
                  {product.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
