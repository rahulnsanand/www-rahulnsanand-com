type ContentPageProps = Readonly<{
  title: string;
  copy: string;
  accentText: string;
}>;

export function ContentPage({ title, copy, accentText }: ContentPageProps) {
  return (
    <section className="content-page relative">
      <div
        className="pointer-events-none fixed -bottom-[0.2em] left-0 z-0 text-left text-[16vw] font-semibold leading-none tracking-[-0.06em] text-[rgb(var(--brand)/0.12)] sm:text-[9rem]"
        aria-hidden="true"
      >
        {accentText}
      </div>
      <h1 className="content-title">{title}</h1>
      <p className="content-copy">{copy}</p>
    </section>
  );
}
