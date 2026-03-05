export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <main className="w-full max-w-[800px] bg-white px-6 py-12 sm:px-[60px] sm:py-[120px] dark:bg-black">
        <div className="flex flex-col items-start gap-4 text-left sm:gap-6">
          <h1 className="max-w-[320px] text-[32px] leading-10 font-semibold tracking-[-1.92px] [text-wrap:balance] sm:text-[40px] sm:leading-12 sm:tracking-[-2.4px]">
            I&apos;m Rahul Anand
          </h1>
          <p className="max-w-[440px] text-lg leading-8 text-zinc-600 [text-wrap:balance] dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-100"
              href="/llms.txt"
            >
              llms.txt
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
