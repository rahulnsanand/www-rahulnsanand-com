import "./about-intro-panel.module.css";
import {
  Code,
  DevToLogo,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  MediumLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { aboutContent, type AboutSocialIcon } from "@/lib/about";

const socialIcons = {
  github: GithubLogo,
  youtube: YoutubeLogo,
  linkedin: LinkedinLogo,
  medium: MediumLogo,
  devto: DevToLogo,
  leetcode: Code,
} satisfies Record<AboutSocialIcon, typeof GithubLogo>;

export function AboutIntroPanel() {
  const { profile } = aboutContent;

  return (
    <header className="about-intro-panel">
      <h1 className="about-intro-name">{profile.name}</h1>
      <p className="about-intro-role">{profile.headline}</p>

      <div className="about-intro-actions">
        <div className="about-intro-socials" aria-label="Social profiles">
          {profile.socialLinks.map((social) => {
            const Icon = socialIcons[social.icon];
            return (
              <a
                key={social.href}
                href={social.href}
              className="about-intro-social-link u-theme-fade-target u-focus-ring-target"
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.label}
            >
                <Icon size={17} weight="duotone" aria-hidden="true" />
              </a>
            );
          })}
        </div>

        <Link
          href="/contact"
          className="about-intro-contact u-theme-fade-target u-focus-ring-target"
          aria-label="Contact page"
        >
          <EnvelopeSimple size={17} weight="duotone" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
