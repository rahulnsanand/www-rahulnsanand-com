import Link from "next/link";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { aboutContent } from "@/lib/about";

export function AboutProfileSummary() {
  const { profile } = aboutContent;

  return (
    <div className="about-profile">
      <FadeInImage
        src={profile.avatarUrl}
        alt={`${profile.name} profile photo`}
        width={144}
        height={144}
        frameClassName="about-profile-avatar-frame"
        imageClassName="about-profile-avatar"
        placeholderClassName="about-profile-avatar-placeholder"
        priority
      />
      <h1 className="about-profile-name">
        {profile.name}
      </h1>
      
      <div className="about-profile-links">
        {profile.primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="about-profile-link"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
