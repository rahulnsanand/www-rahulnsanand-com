export function Homepage() {
  return (
    <section className="home-page">
      <div className="home-stack">
        <h1 className="home-title">
          I&apos;m{" "}
          <span className="home-name">
            Rahul Anand
            <svg
              className="home-name-underline"
              viewBox="0 0 460 56"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="home-name-underline-main"
                d="M10 36 C 82 50, 154 16, 226 30 C 294 43, 360 24, 450 34"
              />
              <path
                className="home-name-underline-detail"
                d="M18 40 C 88 54, 160 22, 228 34 C 296 46, 362 28, 444 38"
              />
            </svg>
          </span>
        </h1>
        <p className="home-copy">
          Software Engineer 2 building AI and personal data tools with a focus
          on thoughtful design and reliable systems.
        </p>
      </div>
    </section>
  );
}
