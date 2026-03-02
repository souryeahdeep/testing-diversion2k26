import Link from 'next/link';

export default function Home() {
  const stats = [
    { value: "0.8s", label: "AI response avg" },
    { value: "99.9%", label: "Git action success" },
    { value: "3,830", label: "PRs analyzed" },
    { value: "5.1x", label: "Faster reviews" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(52,211,153,0.28),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.9))]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-20">
        <div className="w-full max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 text-xs text-green-300">
            v1.0.0 • AI-native GitHub workflow
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            The Fastest{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Git + AI Workspace
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 md:text-xl">
            Built for developers who ship daily. IntelliGit accelerates commits,
            pull requests, reviews, and collaboration from one focused interface.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 border-y border-white/10 py-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/collaborative-tools">
              <button className="rounded-full bg-green-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-green-500">
                Collaborative tool
              </button>
            </Link>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:text-center">
            <span className="font-mono text-zinc-400">$ npm i intelligit</span>
            <span className="hidden text-zinc-600 sm:inline">|</span>
            <span className="font-mono text-zinc-400">$ code --install-extension intelli.git</span>
          </div>
        </div>
      </section>
    </main>
  );
}

