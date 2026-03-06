import { Homepage } from "@/components/home/homepage";
import { SketchPageShell } from "@/components/background/sketch-page-shell";

export default function Home() {
  return (
    <SketchPageShell page="home">
      <Homepage />
    </SketchPageShell>
  );
}
