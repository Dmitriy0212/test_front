import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
