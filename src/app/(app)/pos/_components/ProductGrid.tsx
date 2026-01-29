"use client";

import Image from "next/image";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string | null;
  category: Category | null;
}

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  // Inject headers into the list
  const gridItems: Array<
    | { type: "header"; categoryName: string; categoryId: string }
    | { type: "product"; product: Product }
  > = [];

  let lastCategoryId: string | undefined = undefined;

  products.forEach((product) => {
    const currentCategoryId = product.category?.id ?? "uncategorized";
    const currentCategoryName = product.category?.name ?? "Other";

    if (currentCategoryId !== lastCategoryId) {
      gridItems.push({
        type: "header",
        categoryName: currentCategoryName,
        categoryId: currentCategoryId,
      });
      lastCategoryId = currentCategoryId;
    }
    gridItems.push({ type: "product", product });
  });

  if (products.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center text-[#8D6E63] opacity-60">
        <p className="text-xl font-bold">ไม่พบสินค้า</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {gridItems.map((item, index) => {
        if (item.type === "header") {
          return (
            <div
              key={`header-${item.categoryId}-${index}`}
              className="col-span-full mt-4 mb-2 flex items-center gap-4 first:mt-0"
            >
              <h2 className="text-xl font-black tracking-wider text-[#3E2723] uppercase">
                {item.categoryName}
              </h2>
              <div className="h-px flex-1 bg-[#D7CCC8]/50"></div>
            </div>
          );
        }

        const { product } = item;
        return (
          <button
            key={product.id}
            onClick={() => onSelect(product)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#D7CCC8]/30 bg-white transition-all duration-300 hover:border-[#3E2723] hover:shadow-lg hover:shadow-[#3E2723]/5"
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
              <div className="flex flex-col items-center justify-center gap-2">
                {/* Category Tag (Optional since we have headers now, but nice to keep) */}
                {/* 
                <p className="mb-1 text-[10px] font-bold tracking-widest text-[#8D6E63] uppercase">
                  {product.category?.name ?? "Item"}
                </p>
                */}

                {/* Product Name */}
                <h3 className="line-clamp-2 text-center text-base leading-tight font-bold text-[#3E2723] transition-colors group-hover:text-[#5D4037]">
                  {product.nameTh ?? product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-center text-xs text-[#8D6E63]">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price - Bottom aligned */}
              <div className="mt-4 flex items-baseline justify-between border-t border-[#D7CCC8]/30 pt-3">
                <span className="text-md font-medium text-[#8D6E63]">
                  ราคา
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-md font-semibold text-[#3E2723]">
                    ฿
                  </span>
                  <span className="text-xl font-bold text-[#3E2723]">
                    {product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
