import type { Metadata } from "next";
import { AboutBody } from "./about-body";
import { SketchPageShell } from "@/components/background/sketch-page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Rahul NS Anand - experience, projects, engineering focus, and the product principles behind his work.",
  alternates: {
    canonical: "https://www.rahulnsanand.com/about",
  },
  openGraph: {
    title: "About | Rahul NS Anand",
    description:
      "About Rahul NS Anand - experience, projects, engineering focus, and the product principles behind his work.",
    url: "https://www.rahulnsanand.com/about",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <SketchPageShell page="about">
      <AboutBody />
    </SketchPageShell>
  );
}
