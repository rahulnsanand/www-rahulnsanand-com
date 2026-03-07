import "./content-page.module.css";
import { FooterAccentText } from "@/components/layout/site-footer-accent";

type ContentPageProps = Readonly<{
  title: string;
  copy: string;
  accentText: string;
}>;

export function ContentPage({ title, copy, accentText }: ContentPageProps) {
  return (
    <section className="content-page relative">
      <FooterAccentText text={accentText} />
      <h1 className="content-title">{title}</h1>
      <p className="content-copy u-theme-fade-target">{copy}</p>
    </section>
  );
}
