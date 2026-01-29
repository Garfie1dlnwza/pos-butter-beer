"use client";

import { api } from "@/trpc/react";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "STAFF";
  image: string | null;
}

interface UserFormData {
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
}

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const utils = api.useUtils();
  const { data: users, isLoading } = api.users.getAll.useQuery();

  const createMutation = api.users.create.useMutation({
    onSuccess: () => {
      void utils.users.getAll.invalidate();
      setShowCreateModal(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateMutation = api.users.update.useMutation({
    onSuccess: () => {
      void utils.users.getAll.invalidate();
      setEditingUser(null);
    },
  });

  const deleteMutation = api.users.delete.useMutation({
    onSuccess: () => {
      void utils.users.getAll.invalidate();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreate = (data: UserFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: Partial<UserFormData>) => {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      name: data.name,
      role: data.role,
    });
  };

  const handleDelete = (user: User) => {
    if (
      confirm(
        `ต้องการลบผู้ใช้ "${user.name ?? user.email}" หรือไม่?\n\nผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก`,
      )
    ) {
      deleteMutation.mutate({ id: user.id });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold uppercase tracking-widest text-[#3E2723]">
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
            จัดการผู้ใช้งาน
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            เพิ่มและแก้ไขผู้ใช้ที่สามารถเข้าสู่ระบบ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          เพิ่มผู้ใช้
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D7CCC8]/30 bg-[#EFEBE9]">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                  ผู้ใช้
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                  อีเมล
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                  บทบาท
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#D7CCC8]/20 transition hover:bg-[#FBF9F8]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name ?? ""}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7CCC8] text-sm font-bold text-[#5D4037]">
                          {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "?"}
                        </div>
                      )}
                      <span className="font-medium text-[#3E2723]">
                        {user.name ?? "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#5D4037]">
                    {user.email ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "ADMIN" ? "แอดมิน" : "พนักงาน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="rounded-lg bg-[#EFEBE9] px-3 py-1.5 text-sm font-medium text-[#5D4037] transition hover:bg-[#D7CCC8]"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[#8D6E63]"
                  >
                    ยังไม่มีผู้ใช้ในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>หมายเหตุ:</strong> ผู้ใช้ที่เพิ่มในนี้จะสามารถเข้าสู่ระบบด้วย
            Google ได้ โดยใช้อีเมลที่กำหนด
          </p>
        </div>
      </main>

      {/* Create Modal */}
      <UserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Modal */}
      <UserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}

// Modal Component
function UserModal({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (data: UserFormData) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setEmail(user.email ?? "");
        setName(user.name ?? "");
        setRole(user.role);
      } else {
        setEmail("");
        setName("");
        setRole("STAFF");
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isEditing = !!user;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ email, name, role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-xl font-bold text-[#3E2723]">
          {isEditing ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              อีเมล (Google Account)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditing}
              className="w-full rounded-lg border border-[#D7CCC8] px-4 py-2.5 text-[#3E2723] transition focus:border-[#8D6E63] focus:ring-2 focus:ring-[#8D6E63]/20 focus:outline-none disabled:bg-gray-100"
              placeholder="example@gmail.com"
              required
            />
            {isEditing && (
              <p className="mt-1 text-xs text-[#8D6E63]">
                ไม่สามารถแก้ไขอีเมลได้
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              ชื่อ
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#D7CCC8] px-4 py-2.5 text-[#3E2723] transition focus:border-[#8D6E63] focus:ring-2 focus:ring-[#8D6E63]/20 focus:outline-none"
              placeholder="ชื่อผู้ใช้"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              บทบาท
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}
              className="w-full rounded-lg border border-[#D7CCC8] px-4 py-2.5 text-[#3E2723] transition focus:border-[#8D6E63] focus:ring-2 focus:ring-[#8D6E63]/20 focus:outline-none"
            >
              <option value="STAFF">พนักงาน (Staff)</option>
              <option value="ADMIN">แอดมิน (Admin)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-medium text-[#5D4037] transition hover:bg-[#EFEBE9]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[#3E2723] px-4 py-2 font-medium text-white transition hover:bg-[#2D1B18] disabled:opacity-50"
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
