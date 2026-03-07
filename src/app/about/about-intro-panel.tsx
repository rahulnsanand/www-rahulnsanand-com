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
import { aboutContent } from "@/lib/about";

const socialLinks = [
  { href: "https://github.com/rahulnsanand", label: "GitHub", icon: GithubLogo },
  { href: "https://www.youtube.com/@rahulnsanand", label: "YouTube", icon: YoutubeLogo },
  { href: "https://www.linkedin.com/in/rahulnsanand", label: "LinkedIn", icon: LinkedinLogo },
  { href: "https://medium.com/@rahulnsanand", label: "Medium", icon: MediumLogo },
  { href: "https://dev.to/rahulnsanand", label: "Dev.to", icon: DevToLogo },
  { href: "https://leetcode.com/rahulnsanand", label: "LeetCode", icon: Code },
] as const;

export function AboutIntroPanel() {
  const { profile } = aboutContent;

  return (
    <header className="about-intro-panel">
      <h1 className="about-intro-name">{profile.name}</h1>
      <p className="about-intro-role">Software Engineer | Problem Solver</p>

      <div className="about-intro-actions">
        <div className="about-intro-socials" aria-label="Social profiles">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              className="about-intro-social-link u-theme-fade-target u-focus-ring-target"
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.label}
            >
              <social.icon size={17} weight="duotone" aria-hidden="true" />
            </a>
          ))}
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
