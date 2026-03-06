import { FadeInImage } from "@/components/ui/fade-in-image";
const LOGO_WIDTH = 54;
const LOGO_HEIGHT = 32;

export function ThemeLogo() {
  return (
    <span className="site-logo-stack" aria-label="Rahul NS Anand logo">
      <FadeInImage
        src="/logo-light.png"
        alt="Rahul NS Anand logo"
        frameClassName="site-logo-variant site-logo-variant--light"
        imageClassName="site-logo-image"
        placeholderClassName="site-logo-placeholder"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
      />
      <FadeInImage
        src="/logo-dark.png"
        alt=""
        aria-hidden="true"
        frameClassName="site-logo-variant site-logo-variant--dark"
        imageClassName="site-logo-image"
        placeholderClassName="site-logo-placeholder"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
      />
    </span>
  );
}
