import LoginForm from './login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent),transparent_32rem),var(--background)] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-card shadow-sm md:grid-cols-[1fr_440px]">
        <section className="hidden border-r bg-sidebar p-10 text-sidebar-foreground md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              NS
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight">Next Starter V2</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-sidebar-foreground/70">
              A professional starter console with Auth.js, Drizzle, PostgreSQL and Docker-first
              local development.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {['Drizzle', 'Auth.js', 'Docker'].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-sm border-0 bg-transparent shadow-none ring-0">
            <CardHeader className="px-1">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to manage your starter workspace.</CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <LoginForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
