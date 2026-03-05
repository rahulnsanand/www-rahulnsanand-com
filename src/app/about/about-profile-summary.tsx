import Image from "next/image";
import Link from "next/link";

const PRIMARY_LINKS = [
  { href: "/projects", label: "View Projects" },
  { href: "/blogs", label: "Read Blogs" },
  { href: "/contact", label: "Contact Rahul" },
] as const;

export function AboutProfileSummary() {
  return (
    <div className="px-1 lg:w-[300px]">
      <Image
        src="https://github.com/rahulnsanand.png"
        alt="Rahul NS Anand profile photo"
        width={144}
        height={144}
        className="h-36 w-36 rounded-full border border-[rgb(var(--line))] object-cover"
        priority
      />
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[rgb(var(--text))] sm:text-4xl">
        Rahul NS Anand
      </h1>
      <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted))]">
        I build software products with a product mindset, clear architecture, and an obsession for
        maintainable execution.
      </p>

      <dl className="mt-7 space-y-2 text-xs text-[rgb(var(--muted))]">
        <div className="flex gap-2">
          <dt className="font-medium text-[rgb(var(--text))]">Based:</dt>
          <dd>India</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[rgb(var(--text))]">Focus:</dt>
          <dd>Product Engineering</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[rgb(var(--text))]">Interests:</dt>
          <dd>Systems, UX, Developer Experience</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-wrap gap-2">
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
