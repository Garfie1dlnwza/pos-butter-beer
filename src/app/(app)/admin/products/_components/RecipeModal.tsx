"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

interface RecipeModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

export function RecipeModal({
  productId,
  productName,
  onClose,
}: RecipeModalProps) {
  const { showToast } = useToast();
  const utils = api.useUtils();

  // Fetch product with current recipe
  const { data: product, isLoading: loadingProduct } =
    api.products.getById.useQuery({ id: productId }, { enabled: !!productId });

  // Fetch all ingredients
  const { data: ingredients, isLoading: loadingIngredients } =
    api.ingredients.getAll.useQuery();

  // Recipe state: ingredientId -> amountUsed
  const [recipe, setRecipe] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize recipe from product data
  useEffect(() => {
    if (product?.recipe) {
      const recipeMap: Record<string, number> = {};
      for (const item of product.recipe) {
        recipeMap[item.ingredientId] = item.amountUsed;
      }
      setRecipe(recipeMap);
    }
  }, [product]);

  const updateRecipe = api.products.updateRecipe.useMutation({
    onSuccess: () => {
      showToast("บันทึกสูตรเรียบร้อย", "success");
      void utils.products.invalidate();
      onClose();
    },
    onError: (error) => {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    const recipeItems = Object.entries(recipe)
      .filter(([, amount]) => amount > 0)
      .map(([ingredientId, amountUsed]) => ({
        ingredientId,
        amountUsed,
      }));

    updateRecipe.mutate({
      productId,
      recipe: recipeItems,
    });
  };

  const handleAmountChange = (ingredientId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setRecipe((prev) => ({
      ...prev,
      [ingredientId]: amount,
    }));
  };

  // Calculate estimated cost from recipe
  const estimatedCost =
    ingredients?.reduce((total, ing) => {
      const amount = recipe[ing.id] ?? 0;
      return total + amount * ing.costPerUnit;
    }, 0) ?? 0;

  if (loadingProduct || loadingIngredients) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">📋 จัดการสูตร</h2>
          <p className="mt-1 text-sm text-amber-100">{productName}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <p className="mb-4 text-sm text-gray-500">
              กำหนดปริมาณวัตถุดิบที่ใช้ต่อ 1 ชิ้น (ใส่ 0 หรือเว้นว่างถ้าไม่ใช้)
            </p>

            <div className="grid gap-3">
              {ingredients?.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{ing.name}</p>
                    <p className="text-xs text-gray-500">
                      ต้นทุน: {ing.costPerUnit.toFixed(2)} บาท/{ing.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={recipe[ing.id] ?? ""}
                      onChange={(e) =>
                        handleAmountChange(ing.id, e.target.value)
                      }
                      placeholder="0"
                      className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="w-16 text-sm text-gray-500">
                      {ing.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {ingredients?.length === 0 && (
              <p className="py-8 text-center text-gray-500">
                ยังไม่มีวัตถุดิบ กรุณาเพิ่มวัตถุดิบก่อน
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ต้นทุนโดยประมาณ</p>
              <p className="text-2xl font-bold text-amber-700">
                ฿{estimatedCost.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
