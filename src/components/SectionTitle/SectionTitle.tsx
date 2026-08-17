import type { ReactNode } from "react";
import css from "./SectionTitle.module.css";

interface SectionTitleProps {
  children: ReactNode;
  id?: string;
  as?: "h1" | "h2";
}

export default function SectionTitle({ children, id, as: Heading = "h2" }: SectionTitleProps) {
  return (
    <Heading id={id} className={css.title}>
      {children}
    </Heading>
  );
}
