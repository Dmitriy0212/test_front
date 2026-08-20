import { ReactNode } from "react";

// Toaster уже змонтований глобально в кореневому layout.tsx (ToastProvider) —
// свій тут дублював його з ідентичним конфігом (FE-48)
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
