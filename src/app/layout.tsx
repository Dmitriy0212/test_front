import { Metadata } from "next";
import { Manrope, Merienda } from "next/font/google";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Layout from "@/components/Layout/Layout";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import "modern-normalize/modern-normalize.css";
import "@/styles/reset.css";
import "@/styles/base.css";
import "@/styles/container.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const merienda = Merienda({
  variable: "--font-merienda",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const TITLE = "Harmoniq";
const DESCRIPTION = "Harmoniq — mindful publishing platform for mental health and well-being";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${merienda.variable}`}>
      <body>
        <TanStackProvider>
          <AuthProvider>
            <Layout>
              {children} {modal}
            </Layout>
          </AuthProvider>
          <ToastProvider />
        </TanStackProvider>
      </body>
    </html>
  );
}
