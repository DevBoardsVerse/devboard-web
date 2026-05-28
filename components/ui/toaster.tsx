"use client";
import * as Toast from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { create } from "zustand";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastStore {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) =>
    set((s) => ({
      toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }],
    })),
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(t: Omit<ToastItem, "id">) {
  useToastStore.getState().add(t);
}

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          open
          onOpenChange={(open) => !open && remove(t.id)}
          className={cn(
            "glass rounded-lg p-4 shadow-lg flex flex-col gap-1 w-80 animate-slide-in-right",
            t.variant === "destructive" && "border-destructive/50"
          )}
        >
          <Toast.Title className="text-sm font-semibold text-foreground">
            {t.title}
          </Toast.Title>
          {t.description && (
            <Toast.Description className="text-xs text-muted-foreground">
              {t.description}
            </Toast.Description>
          )}
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" />
    </Toast.Provider>
  );
}