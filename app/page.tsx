import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, DatabaseIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { label: 'Drizzle migrations', icon: DatabaseIcon },
  { label: 'Auth.js sessions', icon: ShieldCheckIcon },
  { label: 'Docker workflow', icon: TerminalIcon },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_34rem),var(--background)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/brand/forgestart-mark.svg"
                alt=""
                width={44}
                height={44}
                className="size-11"
                priority
              />
              <span className="text-sm font-semibold text-muted-foreground">ForgeStart</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              ForgeStart ships the production pieces your Next.js app needs.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              A maintained V2 foundation for teams that want Auth.js, Drizzle, PostgreSQL, Docker
              and a real admin console instead of an empty template.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/dashboard" />} size="lg">
                Open dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button render={<Link href="/auth/login" />} variant="outline" size="lg">
                Sign in
              </Button>
            </div>
          </div>

          <Card className="rounded-lg border bg-card/90 shadow-sm">
            <CardContent className="grid gap-3 p-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 rounded-lg border bg-background p-4"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
