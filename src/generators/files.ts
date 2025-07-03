import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";

// Helper to create auth configuration
export function createAuthConfig(useSrcDir: boolean, useTypeScript: boolean): void {
  const authConfigDir = useSrcDir ? 
    path.join(process.cwd(), "src", "lib") : 
    path.join(process.cwd(), "lib");
  
  fs.ensureDirSync(authConfigDir);
  
  const fileExtension = useTypeScript ? "ts" : "js";
  const basicAuthConfig = `import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
})`;
  
  fs.writeFileSync(path.join(authConfigDir, `auth.${fileExtension}`), basicAuthConfig);
  console.log(chalk.green("✅ Created basic auth configuration"));
}

// Helper to create NextAuth API route
export function createNextAuthApiRoute(useSrcDir: boolean, useTypeScript: boolean): void {
  const baseDir = useSrcDir ? "src" : "";
  const fileExtension = useTypeScript ? "ts" : "js";
  
  // Create the API route directory structure
  const apiRouteDir = path.join(process.cwd(), baseDir, "app", "api", "auth", "[...nextauth]");
  fs.ensureDirSync(apiRouteDir);
  
  // Determine the correct import path based on src directory usage
  const importPath = useSrcDir ? "@/lib/auth" : "@/lib/auth";
  
  const routeContent = `import { handlers } from "${importPath}" // Referring to the auth.ts we just created

export const { GET, POST } = handlers`;
  
  fs.writeFileSync(
    path.join(apiRouteDir, `route.${fileExtension}`), 
    routeContent
  );
  
  console.log(chalk.green("✅ Created NextAuth API route"));
}

// Helper to create or update .env.local file after npx auth secret
export function createEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  
  // Read existing .env.local (should exist after npx auth secret)
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  // Additional NextAuth.js configuration to append
  const additionalConfig = `
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000

# Add your provider credentials here
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret

# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database (if using database sessions)
# DATABASE_URL="your_database_url"

# Email provider (if using email authentication)
# EMAIL_SERVER_USER=your_email_username
# EMAIL_SERVER_PASSWORD=your_email_password
# EMAIL_SERVER_HOST=your_smtp_host
# EMAIL_SERVER_PORT=587
# EMAIL_FROM=noreply@example.com
`;
  
  // Check if we already have NextAuth configuration (avoid duplicates)
  if (!envContent.includes("NEXTAUTH_URL")) {
    envContent += additionalConfig;
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green("✅ Updated .env.local with NextAuth configuration"));
  } else {
    console.log(chalk.yellow("⚠️  NextAuth configuration already exists in .env.local"));
  }
}

// Helper to create theme provider component
export function createThemeProvider(useSrcDir: boolean, useTypeScript: boolean): void {
  const baseDir = useSrcDir ? "src" : "";
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  
  const componentsDir = path.join(process.cwd(), baseDir, "components");
  fs.ensureDirSync(componentsDir);
  
  const themeProviderContent = useTypeScript ? 
    `"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
 
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}` :
    `"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
 
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}`;
  
  fs.writeFileSync(
    path.join(componentsDir, `theme-provider.${fileExtension}`), 
    themeProviderContent
  );
  
  console.log(chalk.green("✅ Created theme provider component"));
}

// Helper to update layout.tsx with theme provider
export function updateLayoutWithThemeProvider(useSrcDir: boolean, useTypeScript: boolean): void {
  const baseDir = useSrcDir ? "src" : "";
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  const layoutPath = path.join(process.cwd(), baseDir, "app", `layout.${fileExtension}`);
  
  if (!fs.existsSync(layoutPath)) {
    console.log(chalk.yellow("⚠️  Layout file not found, skipping theme provider integration"));
    return;
  }
  
  let layoutContent = fs.readFileSync(layoutPath, "utf8");
  
  // Check if ThemeProvider is already imported
  if (layoutContent.includes("ThemeProvider")) {
    console.log(chalk.yellow("⚠️  ThemeProvider already exists in layout"));
    return;
  }
  
  // Add import for ThemeProvider
  const importStatement = 'import { ThemeProvider } from "@/components/theme-provider"';
  
  // Find where to insert the import (after existing imports)
  const importRegex = /^import.*from.*$/gm;
  const imports = layoutContent.match(importRegex) || [];
  
  if (imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = layoutContent.indexOf(lastImport) + lastImport.length;
    layoutContent = 
      layoutContent.slice(0, lastImportIndex) + 
      '\n' + importStatement + 
      layoutContent.slice(lastImportIndex);
  } else {
    // No imports found, add at the top
    layoutContent = importStatement + '\n\n' + layoutContent;
  }
  
  // Add suppressHydrationWarning to html tag
  layoutContent = layoutContent.replace(
    /<html([^>]*)>/,
    '<html$1 suppressHydrationWarning>'
  );
  
  // Wrap children with ThemeProvider
  if (layoutContent.includes('{children}')) {
    layoutContent = layoutContent.replace(
      '{children}',
      `<ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>`
    );
  }
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log(chalk.green("✅ Updated layout with theme provider"));
}

// Helper to create utils file
export function createUtilsFile(useSrcDir: boolean, useTypeScript: boolean): void {
  const baseDir = useSrcDir ? "src" : "";
  const fileExtension = useTypeScript ? "ts" : "js";
  
  const utilsContent = useTypeScript ? 
    `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}` :
    `import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}`;
  
  fs.writeFileSync(
    path.join(process.cwd(), baseDir, "lib", `utils.${fileExtension}`), 
    utilsContent
  );
}

// Helper to create additional project structure
export function createProjectStructure(useSrcDir: boolean, useTailwind: boolean, useTypeScript: boolean): void {
  const spinner = ora("📁 Setting up additional project structure...").start();
  
  const baseDir = useSrcDir ? "src" : "";
  
  const dirs = [
    path.join(baseDir, "components", "ui"),
    path.join(baseDir, "lib"),
    path.join(baseDir, "hooks"),
    path.join(baseDir, "types")
  ].filter(Boolean);
  
  dirs.forEach(dir => {
    fs.ensureDirSync(path.join(process.cwd(), dir));
  });

  if (useTailwind) {
    createUtilsFile(useSrcDir, useTypeScript);
  }
  
  spinner.succeed("Project structure created");
}

// Helper to create custom homepage
export function createCustomHomepage(useSrcDir: boolean, useTypeScript: boolean, useTailwind: boolean, useShadcn: boolean): void {
  const spinner = ora("🏠 Creating custom homepage...").start();
  
  const baseDir = useSrcDir ? "src" : "";
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  const pagePath = path.join(process.cwd(), baseDir, "app", `page.${fileExtension}`);
  
  // Create a modern, beautiful homepage
  const customPageContent = useTypeScript ? 
    createTypescriptHomepage(useTailwind, useShadcn) :
    createJavascriptHomepage(useTailwind, useShadcn);
  
  fs.writeFileSync(pagePath, customPageContent);
  spinner.succeed("Custom homepage created");
}

// TypeScript homepage template
function createTypescriptHomepage(useTailwind: boolean, useShadcn: boolean): string {
  const shadcnImports = useShadcn ? 'import { Button } from "@/components/ui/button"\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"' : '';
  const lucideImports = useShadcn ? 'import { Github, Twitter, Mail, ExternalLink, Zap, Shield, Palette } from "lucide-react"' : '';
  
  if (useTailwind && useShadcn) {
    return `${shadcnImports}
${lucideImports}
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Your
            <br />
            Next.js Project
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
            Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. 
            Your modern web application starts here.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
            What's Included
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Next.js 15</CardTitle>
              </div>
              <CardDescription>
                The latest version with App Router, Server Components, and Turbopack support
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                <CardTitle>shadcn/ui</CardTitle>
              </div>
              <CardDescription>
                Beautiful, accessible components built with Radix UI and Tailwind CSS
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>TypeScript</CardTitle>
              </div>
              <CardDescription>
                Full type safety with the latest TypeScript features and strict mode
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quick Links</CardTitle>
            <CardDescription>
              Essential resources to help you get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between group">
                  Next.js Docs
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between group">
                  shadcn/ui Docs
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between group">
                  Tailwind CSS
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://www.typescriptlang.org/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between group">
                  TypeScript Docs
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>Built with ❤️ using create-rdp-app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}`;
  } else if (useTailwind) {
    return `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Your
            <br />
            Next.js Project
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
            Built with Next.js 15, TypeScript, and Tailwind CSS. 
            Your modern web application starts here.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            What's Included
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">⚡ Next.js 15</h3>
            <p className="text-gray-600">
              The latest version with App Router, Server Components, and Turbopack support
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">🎨 Tailwind CSS</h3>
            <p className="text-gray-600">
              Utility-first CSS framework for rapid UI development
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">🛡️ TypeScript</h3>
            <p className="text-gray-600">
              Full type safety with the latest TypeScript features
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Built with ❤️ using create-rdp-app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}`;
  } else {
    return `export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to Your Next.js Project
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#666', 
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}>
          Built with Next.js 15 and TypeScript. Your modern web application starts here.
        </p>
        <button style={{
          background: '#3b82f6',
          color: 'white',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          Get Started
        </button>
        <button style={{
          background: 'transparent',
          color: '#3b82f6',
          padding: '0.75rem 2rem',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Learn More
        </button>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            What's Included
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              ⚡ Next.js 15
            </h3>
            <p style={{ color: '#666' }}>
              The latest version with App Router, Server Components, and Turbopack support
            </p>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              🛡️ TypeScript
            </h3>
            <p style={{ color: '#666' }}>
              Full type safety with the latest TypeScript features
            </p>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              🚀 Modern Stack
            </h3>
            <p style={{ color: '#666' }}>
              Built with the latest web technologies and best practices
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Built with ❤️ using create-rdp-app</p>
      </footer>
    </div>
  )
}`;
  }
}

// JavaScript homepage template
function createJavascriptHomepage(useTailwind: boolean, useShadcn: boolean): string {
  const shadcnImports = useShadcn ? 'import { Button } from "@/components/ui/button"\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"' : '';
  const lucideImports = useShadcn ? 'import { Github, Twitter, Mail, ExternalLink, Zap, Shield, Palette } from "lucide-react"' : '';
  
  if (useTailwind && useShadcn) {
    return `${shadcnImports}
${lucideImports}
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Your
            <br />
            Next.js Project
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
            Built with Next.js 15, JavaScript, Tailwind CSS, and shadcn/ui. 
            Your modern web application starts here.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
            What's Included
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Next.js 15</CardTitle>
              </div>
              <CardDescription>
                The latest version with App Router, Server Components, and Turbopack support
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                <CardTitle>shadcn/ui</CardTitle>
              </div>
              <CardDescription>
                Beautiful, accessible components built with Radix UI and Tailwind CSS
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>JavaScript</CardTitle>
              </div>
              <CardDescription>
                Modern JavaScript with the latest features and ES modules
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>Built with ❤️ using create-rdp-app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}`;
  } else if (useTailwind) {
    return `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Your
            <br />
            Next.js Project
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
            Built with Next.js 15, JavaScript, and Tailwind CSS. 
            Your modern web application starts here.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 hover:border-gray-400 px-8 py-3 rounded-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            What's Included
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">⚡ Next.js 15</h3>
            <p className="text-gray-600">
              The latest version with App Router, Server Components, and Turbopack support
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">🎨 Tailwind CSS</h3>
            <p className="text-gray-600">
              Utility-first CSS framework for rapid UI development
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">📱 JavaScript</h3>
            <p className="text-gray-600">
              Modern JavaScript with the latest features and ES modules
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Built with ❤️ using create-rdp-app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}`;
  } else {
    return `export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to Your Next.js Project
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#666', 
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}>
          Built with Next.js 15 and JavaScript. Your modern web application starts here.
        </p>
        <button style={{
          background: '#3b82f6',
          color: 'white',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          Get Started
        </button>
        <button style={{
          background: 'transparent',
          color: '#3b82f6',
          padding: '0.75rem 2rem',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Learn More
        </button>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            What's Included
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>
            Everything you need to build modern web applications
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              ⚡ Next.js 15
            </h3>
            <p style={{ color: '#666' }}>
              The latest version with App Router, Server Components, and Turbopack support
            </p>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              📱 JavaScript
            </h3>
            <p style={{ color: '#666' }}>
              Modern JavaScript with the latest features and ES modules
            </p>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              🚀 Modern Stack
            </h3>
            <p style={{ color: '#666' }}>
              Built with the latest web technologies and best practices
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Built with ❤️ using create-rdp-app</p>
      </footer>
    </div>
  )
}`;
  }
}