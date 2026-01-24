"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ImageUpload } from "./ImageUpload";
import { api } from "@/trpc/react";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface ProductFormData {
  name: string;
  nameTh: string;
  price: number;
  categoryId: string | null;
  image: string | null;
}

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  price: number;
  categoryId: string | null;
  category: Category | null;
  image: string | null;
  isActive: boolean;
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
    price: "",
    categoryId: "" as string | null,
    image: null as string | null,
  });

  // Fetch categories
  const { data: categoriesData } = api.categories.getAll.useQuery();
  const categories = categoriesData as
    | { id: string; name: string }[]
    | undefined;

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product?.name ?? "",
        nameTh: product?.nameTh ?? "",
        price: product?.price?.toString() ?? "",
        categoryId: product?.categoryId ?? "",
        image: product?.image ?? null,
      });
    }
  }, [isOpen, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      nameTh: formData.nameTh,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.categoryId ?? null,
      image: formData.image,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
