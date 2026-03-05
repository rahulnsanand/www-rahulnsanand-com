type ContentPageProps = Readonly<{
  title: string;
  copy: string;
}>;

export function ContentPage({ title, copy }: ContentPageProps) {
  return (
    <section className="content-page">
      <h1 className="content-title">{title}</h1>
      <p className="content-copy">{copy}</p>
    </section>
  );
}
