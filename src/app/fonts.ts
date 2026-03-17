import { Comic_Neue, JetBrains_Mono, Lato, Montserrat } from "next/font/google";

export const headingFont = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading-source",
  weight: ["500", "600", "700"],
});

export const textFont = Lato({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text-source",
  weight: ["300", "400", "700"],
});

export const codeFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code-source",
  weight: ["400", "500", "600", "700"],
});

export const scriptFont = Comic_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script-source",
  weight: ["300", "400", "700"],
});
