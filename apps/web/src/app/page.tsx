import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@avex/constants';
import { Building2, Sparkles, CheckCircle2, ShieldCheck, Zap, Layers, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground border border-border">
                {APP_VERSION}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center items-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sprint 01 — Production Foundation Live</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {APP_TAGLINE}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enterprise-grade, multi-tenant AI business management platform built for scalability, 
            performance, and security.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="px-6">
                Launch Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-6">
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>

        {/* Foundation Verification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Card>
            <CardHeader className="pb-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-primary mb-2">
                <Layers className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Modular Monorepo</CardTitle>
              <CardDescription>
                Turborepo architecture with strict module boundaries and shared packages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Next.js 15 App Router & React 19</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Feature-based directory isolation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-primary mb-2">
                <Zap className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Design System</CardTitle>
              <CardDescription>
                Clean, accessible UI built with Tailwind CSS variables and primitives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Dark, Light & System theme persistence</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Linear & Vercel design principles</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-primary mb-2">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Strict Standard</CardTitle>
              <CardDescription>
                TypeScript strict checking, clean error boundaries, and skeleton loaders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Zero-any strict type safety</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Global 404 & Error boundaries</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground space-y-2 sm:space-y-0">
          <div>© 2026 AVEX CRM. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <span>Status: Foundation Active</span>
            <span>•</span>
            <span>Sprint 01 Completed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
