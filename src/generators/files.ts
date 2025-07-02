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