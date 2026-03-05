import Image from "next/image";
import Link from "next/link";

const PRIMARY_LINKS = [
  { href: "/projects", label: "View Projects" },
  { href: "/blogs", label: "Read Blogs" },
  { href: "/contact", label: "Contact Rahul" },
] as const;

export function AboutProfileSummary() {
  return (
    <div className="px-1 text-center lg:w-[300px]">
      <Image
        src="https://github.com/rahulnsanand.png"
        alt="Rahul NS Anand profile photo"
        width={144}
        height={144}
        className="mx-auto h-36 w-36 rounded-full border border-[rgb(var(--line))] object-cover"
        priority
      />
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[rgb(var(--text))] sm:text-4xl">
        Rahul NS Anand
      </h1>
      
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {PRIMARY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted))] transition hover:border-[rgb(var(--brand)/0.45)] hover:text-[rgb(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
