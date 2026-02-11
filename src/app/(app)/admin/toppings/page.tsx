"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ToppingsTable } from "./_components/ToppingsTable";
import { ToppingModal } from "./_components/ToppingModal";
import { useToast } from "@/components/Toast";

interface ToppingFormData {
  name: string;
  nameTh: string;
  price: number;
  recipe: Array<{ ingredientId: string; amountUsed: number }>;
}

interface Topping {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
  isActive: boolean;
  recipe?: Array<{
    ingredientId: string;
    amountUsed: number;
    ingredient: { name: string; unit: string };
  }>;
}

export default function ToppingsPage() {
  const { showToast } = useToast();
  const utils = api.useUtils();
  const [showModal, setShowModal] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);

  const { data: toppings, isLoading } = api.toppings.getAllAdmin.useQuery();

  const createMutation = api.toppings.create.useMutation({
    onSuccess: async (newTopping) => {
      // After creating topping, update its recipe if needed
      if (editingTopping?.recipe && editingTopping.recipe.length > 0) {
        await updateRecipeMutation.mutateAsync({
          toppingId: newTopping.id,
          recipe: editingTopping.recipe,
        });
      }
      showToast("เพิ่มท็อปปิ้งเรียบร้อย", "success");
      void utils.toppings.getAllAdmin.invalidate();
      setShowModal(false);
      setEditingTopping(null);
    },
    onError: (error) => showToast(error.message, "error"),
  });

  const updateMutation = api.toppings.update.useMutation({
    onSuccess: () => {
      showToast("บันทึกข้อมูลเรียบร้อย", "success");
      void utils.toppings.getAllAdmin.invalidate();
      setShowModal(false);
      setEditingTopping(null);
    },
    onError: (error) => showToast(error.message, "error"),
  });

  const deleteMutation = api.toppings.delete.useMutation({
    onSuccess: () => {
      showToast("ลบท็อปปิ้งเรียบร้อย", "success");
      void utils.toppings.getAllAdmin.invalidate();
    },
    onError: (error) => showToast(error.message, "error"),
  });

  const updateRecipeMutation = api.toppings.updateRecipe.useMutation();

  const handleDelete = (topping: Topping) => {
    if (confirm(`ต้องการลบ "${topping.name}" หรือไม่?`)) {
      deleteMutation.mutate({ id: topping.id });
    }
  };

  const handleSave = async (data: ToppingFormData) => {
    if (editingTopping?.id) {
      // Update existing
      await updateMutation.mutateAsync({
        id: editingTopping.id,
        name: data.name,
        nameTh: data.nameTh || undefined,
        price: data.price,
      });

      // Update recipe
      await updateRecipeMutation.mutateAsync({
        toppingId: editingTopping.id,
        recipe: data.recipe,
      });

      setShowModal(false);
      setEditingTopping(null);
      void utils.toppings.getAllAdmin.invalidate();
    } else {
      // Create new
      // We need to pass the recipe to the create mutation handler logic,
      // but the create mutation only takes basic info.
      // So use a workaround: create first, then update recipe.
      // Store the recipe in a temp variable or handle it in success callback?
      // Actually handleSave execution flow:

      try {
        const newTopping = await createMutation.mutateAsync({
          name: data.name,
          nameTh: data.nameTh || undefined,
          price: data.price,
        });

        if (data.recipe.length > 0) {
          await updateRecipeMutation.mutateAsync({
            toppingId: newTopping.id,
            recipe: data.recipe,
          });
        }

        showToast("เพิ่มท็อปปิ้งเรียบร้อย", "success");
        void utils.toppings.getAllAdmin.invalidate();
        setShowModal(false);
        setEditingTopping(null);
      } catch {
        // Error handled in mutation default, but async might throw
      }
    }
  };

  const handleToggleActive = (topping: Topping) => {
    updateMutation.mutate({
      id: topping.id,
      isActive: !topping.isActive,
    });
  };

  const handleEdit = (topping: Topping) => {
    // Transform recipe data to match form expectations
    // The query returns recipe as { ingredientId, amountUsed, ingredient: {...} }
    // The form expects { ingredientId, amountUsed }
    const formattedTopping = {
      ...topping,
      recipe:
        topping.recipe?.map((r) => ({
          ingredientId: r.ingredientId,
          amountUsed: r.amountUsed,
          ingredient: r.ingredient,
        })) ?? [],
    };
    setEditingTopping(formattedTopping);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTopping(null);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            จัดการท็อปปิ้ง
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            เพิ่มและแก้ไขรายการท็อปปิ้งสำหรับเครื่องดื่ม
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E2723] px-5 py-2.5 font-bold text-white shadow-lg transition hover:bg-[#2D1B18] active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          เพิ่มท็อปปิ้ง
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <ToppingsTable
            toppings={toppings ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>
      </main>

      {/* Modal */}
      <ToppingModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTopping(null);
        }}
        topping={editingTopping}
        onSave={handleSave}
        isLoading={
          createMutation.isPending ||
          updateMutation.isPending ||
          updateRecipeMutation.isPending
        }
      />
    </div>
  );
}
