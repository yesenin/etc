import Link from "next/link";

const sections = [
  {
    href: "/serbian/pronouns",
    title: "Prisvojne zamenice",
    description: "Притяжательные местоимения: обучение и игра на время.",
  },
  {
    href: "/rechnik",
    title: "Rečnik",
    description: "Словарь существительных и местоимений: значение и падежи из Викисловаря.",
  },
];

export default function SerbianPage(): React.ReactElement {
  return (
    <div className="flex min-h-dvh justify-center bg-zinc-50 px-4 py-6 sm:py-10 font-sans text-zinc-900">
      <main className="flex w-full max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl">Srpski</h1>
          <p className="text-sm text-zinc-500">Тренажёры по сербскому языку.</p>
        </header>

        <nav className="flex flex-col gap-3">
          {sections.map(({ href, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-900"
            >
              <span className="font-serif text-xl">{title}</span>
              <span className="text-sm text-zinc-500">{description}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
