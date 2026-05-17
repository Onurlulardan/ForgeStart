import RegisterForm from './register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_bottom_left,var(--accent),transparent_32rem),var(--background)] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-card shadow-sm md:grid-cols-[1fr_460px]">
        <section className="hidden border-r bg-sidebar p-10 text-sidebar-foreground md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              NS
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight">Start from a real app</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-sidebar-foreground/70">
              Clone, compose up, migrate, seed and ship with a maintained Next.js starter baseline.
            </p>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-4 text-sm">
            Production-like database, authentication and authorization flows are already wired.
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-sm border-0 bg-transparent shadow-none ring-0">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Use this starter as a clean foundation for your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <RegisterForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
