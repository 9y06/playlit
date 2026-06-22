"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toneClasses(tone: ToastTone) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (tone === "error") {
    return "border-rose-200 bg-rose-50 text-rose-950";
  }

  return "border-slate-200 bg-white text-slate-950";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = createId();
    setItems((current) => [...current.slice(-2), { ...toast, id }]);

    window.setTimeout(() => {
      removeToast(id);
    }, 2800);
  }, [removeToast]);

  const value = useMemo(
    () => ({
      pushToast,
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 grid gap-2 sm:right-6 sm:top-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto min-w-[16rem] max-w-[20rem] rounded-lg border px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.12)] backdrop-blur ${toneClasses(item.tone)}`}
          >
            <p className="text-sm font-black">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs font-medium opacity-80">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
