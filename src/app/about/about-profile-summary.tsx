import Image from "next/image";
import Link from "next/link";

const PRIMARY_LINKS = [
  { href: "/projects", label: "View Projects" },
  { href: "/blogs", label: "Read Blogs" },
  { href: "/contact", label: "Contact Rahul" },
] as const;

export function AboutProfileSummary() {
  return (
    <div className="about-profile">
      <Image
        src="https://github.com/rahulnsanand.png"
        alt="Rahul NS Anand profile photo"
        width={144}
        height={144}
        className="about-profile-avatar"
        priority
      />
      <h1 className="about-profile-name">
        Rahul NS Anand
      </h1>
      
      <div className="about-profile-links">
        {PRIMARY_LINKS.map((link) => (
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
