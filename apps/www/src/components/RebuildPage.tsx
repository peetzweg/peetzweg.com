import { Link } from '@tanstack/react-router';

type RebuildPageProps = {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
};

export function RebuildPage({ children, eyebrow, title }: RebuildPageProps) {
  return (
    <main className="rebuild-page">
      <section>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <div>{children}</div>
      </section>
      <Link to="/">Back</Link>
    </main>
  );
}
