import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ImageUpload } from "./ImageUpload";
import { api } from "@/trpc/react";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

interface ProductFormData {
  name: string;
  nameTh: string;
  description: string;
  price: number;
  categoryId: string | null;
  image: string | null;
  recipe: Array<{ ingredientId: string; amountUsed: number }>;
}

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  description: string | null;
  price: number;
  categoryId: string | null;
  category: Category | null;
  image: string | null;
  isActive: boolean;
  recipe?: Array<{ ingredientId: string; amountUsed: number }>;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (data: ProductFormData) => void;
  onDeleteImage?: () => void;
  isLoading: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  onDeleteImage,
  isLoading,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    nameTh: "",
    description: "",
    price: "",
    categoryId: "" as string | null,
    image: null as string | null,
    recipe: [] as Array<{ ingredientId: string; amountUsed: number }>,
  });

  // Fetch categories & ingredients
  const { data: categoriesData } = api.categories.getAll.useQuery();
  const { data: ingredientsData } = api.ingredients.getAll.useQuery();

  const categories = categoriesData as
    | { id: string; name: string }[]
    | undefined;

  const ingredients = ingredientsData as Ingredient[] | undefined;

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product?.name ?? "",
        nameTh: product?.nameTh ?? "",
        description: product?.description ?? "",
        price: product?.price?.toString() ?? "",
        categoryId: product?.categoryId ?? "",
        image: product?.image ?? null,
        recipe: product?.recipe ?? [],
      });
    }
  }, [isOpen, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      nameTh: formData.nameTh,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.categoryId === "" ? null : formData.categoryId,
      image: formData.image,
      recipe: formData.recipe,
    });
  };

  const handleImageChange = (url: string | null) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleImageDelete = () => {
    if (product?.image) {
      onDeleteImage?.();
    }
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      recipe: [...prev.recipe, { ingredientId: "", amountUsed: 0 }],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipe: prev.recipe.filter((_, i) => i !== index),
    }));
  };

  const handleRecipeChange = (
    index: number,
    field: "ingredientId" | "amountUsed",
    value: string | number,
  ) => {
    setFormData((prev) => {
      const newRecipe = [...prev.recipe];
      const currentItem = newRecipe[index];
      if (!currentItem) return prev; // Should not happen

      const updatedItem = { ...currentItem };

      if (field === "ingredientId" && typeof value === "string") {
        updatedItem.ingredientId = value;
      } else if (field === "amountUsed" && typeof value === "number") {
        updatedItem.amountUsed = value;
      }

      newRecipe[index] = updatedItem;
      return { ...prev, recipe: newRecipe };
    });
  };

  // Calculate Total Cost
  const totalCost = formData.recipe.reduce((sum, item) => {
    const ingredient = ingredients?.find((i) => i.id === item.ingredientId);
    return sum + (ingredient?.costPerUnit ?? 0) * item.amountUsed;
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex max-h-[70vh] gap-6 overflow-y-auto p-1">
          {/* Left Column: Basic Info */}
          <div className="flex-1 space-y-5">
            {/* Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5D4037]">
                รูปภาพสินค้า
              </label>
              <ImageUpload
                value={formData.image}
                onChange={handleImageChange}
                onDelete={handleImageDelete}
                disabled={isLoading}
              />
            </div>

            {/* Name EN */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                ชื่อสินค้า (EN)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                placeholder="Butter Beer Latte"
                required
              />
            </div>

            {/* Name TH */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                ชื่อสินค้า (TH)
              </label>
              <input
                type="text"
                value={formData.nameTh}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nameTh: e.target.value }))
                }
                className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                placeholder="เนยเบียร์ลาเต้"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                รายละเอียดสินค้า
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                placeholder="รายละเอียดสินค้า..."
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                  ราคา (฿)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] placeholder-[#BDBDBD] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                  placeholder="55"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#5D4037]">
                  หมวดหมู่
                </label>
                <select
                  value={formData.categoryId ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value || null,
                    }))
                  }
                  className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] transition outline-none focus:border-[#8D6E63] focus:bg-white"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Recipe (Ingredients) */}
          <div className="w-[400px] space-y-4 border-l border-[#E0E0E0] pl-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#3E2723]">สูตรการผลิต (Recipe)</h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="cursor-pointer rounded-lg bg-[#EFEBE9] px-3 py-1.5 text-xs font-bold text-[#5D4037] transition hover:bg-[#D7CCC8]"
              >
                + เพิ่มวัตถุดิบ
              </button>
            </div>

            {/* Total Cost Display */}
            <div className="flex items-center justify-between rounded-xl bg-[#FFF8E1] px-4 py-3">
              <span className="text-sm font-medium text-[#8D6E63]">
                ต้นทุนต่อแก้ว
              </span>
              <span className="text-lg font-bold text-[#3E2723]">
                ฿
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="space-y-2">
              {formData.recipe.length > 0 && (
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[#8D6E63]">
                  <div className="col-span-6">วัตถุดิบ</div>
                  <div className="col-span-3 text-right">ปริมาณ</div>
                  <div className="col-span-2 text-center">หน่วย</div>
                  <div className="col-span-1"></div>
                </div>
              )}

              {formData.recipe.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D7CCC8] bg-[#FAFAFA] py-8 text-center">
                  <p className="mb-1 text-sm text-[#8D6E63]">
                    ยังไม่มีวัตถุดิบ
                  </p>
                  <p className="text-xs text-[#BDBDBD]">
                    เชื่อมต่อวัตถุดิบเพื่อคำนวณต้นทุนอัตโนมัติ
                  </p>
                </div>
              ) : (
                formData.recipe.map((item, index) => {
                  const currentIngredient = ingredients?.find(
                    (i) => i.id === item.ingredientId,
                  );
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 items-center gap-2"
                    >
                      <div className="col-span-6">
                        <select
                          value={item.ingredientId}
                          onChange={(e) =>
                            handleRecipeChange(
                              index,
                              "ingredientId",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-[#E0E0E0] bg-white p-2 text-sm text-[#3E2723] transition outline-none focus:border-[#8D6E63]"
                        >
                          <option value="">เลือกวัตถุดิบ</option>
                          {ingredients?.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amountUsed}
                          onChange={(e) =>
                            handleRecipeChange(
                              index,
                              "amountUsed",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full rounded-lg border border-[#E0E0E0] p-2 text-right text-sm text-[#3E2723] transition outline-none focus:border-[#8D6E63]"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2 text-center text-xs text-[#8D6E63]">
                        {currentIngredient?.unit ?? "-"}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[#D7CCC8] py-3 text-sm font-semibold text-[#8D6E63] transition hover:bg-[#F5F5F5]"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl bg-[#3E2723] py-3 text-sm font-bold text-white transition hover:bg-[#2D1B18] disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
