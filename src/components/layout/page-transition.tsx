import "./page-transition.module.css";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return <div className="page-transition-root">{children}</div>;
}
