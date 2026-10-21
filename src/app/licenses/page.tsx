import type { Metadata } from "next";
import OpenSourcePage from "@/components/OpenSourcePage";

export const metadata: Metadata = {
  title: "Open source & credits — Black Box",
  description:
    "Black Box is open source (MIT) and built on open source software, the open-weight Gemma 4 model, and freely licensed fonts and design guidance. Full credits and license sources.",
};

export default function Licenses() {
  return <OpenSourcePage />;
}
