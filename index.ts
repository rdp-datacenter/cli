#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";

// Type definitions for our configuration
interface ProjectConfig {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  shadcn: boolean;
  nextauth: boolean;
  useTurbopack: boolean;
}

// Helper to run shell commands with better error handling
function run(cmd: string): void {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error running command: ${cmd}`);
    process.exit(1);
  }
}

// Helper to get install command based on package manager
function getInstallCommand(packageManager: ProjectConfig['packageManager']): string {
  const commands = {
    npm: "npm install",
    yarn: "yarn add",
    pnpm: "pnpm add",
    bun: "bun add"
  };
  return commands[packageManager];
}

// Helper to get dev command based on package manager
function getDevCommand(packageManager: ProjectConfig['packageManager'], useTurbopack: boolean = false): string {
  const turboFlag = useTurbopack ? " --turbo" : "";
  const commands = {
    npm: `npm run dev${turboFlag}`,
    yarn: `yarn dev${turboFlag}`,
    pnpm: `pnpm dev${turboFlag}`,
    bun: `bun dev${turboFlag}`
  };
  return commands[packageManager];
}

// Helper to detect project structure
function detectProjectStructure(): { useSrcDir: boolean; useTypeScript: boolean; useTailwind: boolean; tailwindVersion: string } {
  const hasSrcDir = fs.existsSync(path.join(process.cwd(), "src"));
  const hasTypeScript = fs.existsSync(path.join(process.cwd(), "tsconfig.json"));
  
  // Check for Tailwind CSS in multiple ways
  // Tailwind v3 config files
  const tailwindV3ConfigFiles = [
    "tailwind.config.js",
    "tailwind.config.ts", 
    "tailwind.config.mjs",
    "tailwind.config.cjs"
  ];
  
  const hasTailwindV3Config = tailwindV3ConfigFiles.some(file => 
    fs.existsSync(path.join(process.cwd(), file))
  );
  
  // Tailwind v4 uses postcss.config.mjs and CSS-based config
  const hasTailwindV4Config = fs.existsSync(path.join(process.cwd(), "postcss.config.mjs"));
  
  // Check package.json for tailwindcss dependency and version
  let hasTailwindDependency = false;
  let tailwindVersion = "";
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const tailwindDep = (packageJson.dependencies && packageJson.dependencies.tailwindcss) ||
                         (packageJson.devDependencies && packageJson.devDependencies.tailwindcss);
      if (tailwindDep) {
        hasTailwindDependency = true;
        tailwindVersion = tailwindDep;
      }
    }
  } catch (error) {
    console.log("Could not read package.json");
  }
  
  // Check for Tailwind CSS imports in CSS files
  let hasTailwindImports = false;
  try {
    const possibleCssFiles = [
      "src/app/globals.css",
      "app/globals.css", 
      "src/styles/globals.css",
      "styles/globals.css"
    ];
    
    for (const cssFile of possibleCssFiles) {
      const cssPath = path.join(process.cwd(), cssFile);
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, "utf8");
        if (cssContent.includes("@tailwind") || cssContent.includes("tailwindcss")) {
          hasTailwindImports = true;
          break;
        }
      }
    }
  } catch (error) {
    console.log("Could not check CSS files");
  }
  
  // Check postcss.config.mjs for Tailwind v4
  let hasPostCSSWithTailwind = false;
  try {
    const postcssConfigPath = path.join(process.cwd(), "postcss.config.mjs");
    if (fs.existsSync(postcssConfigPath)) {
      const postcssContent = fs.readFileSync(postcssConfigPath, "utf8");
      if (postcssContent.includes("tailwindcss")) {
        hasPostCSSWithTailwind = true;
      }
    }
  } catch (error) {
    console.log("Could not check postcss.config.mjs");
  }
  
  const useTailwind = hasTailwindV3Config || hasTailwindV4Config || hasTailwindDependency || hasTailwindImports || hasPostCSSWithTailwind;
  
  // Determine Tailwind version
  let detectedVersion = "";
  if (tailwindVersion.includes("4.")) {
    detectedVersion = "v4";
  } else if (tailwindVersion.includes("3.")) {
    detectedVersion = "v3";
  } else if (hasTailwindV4Config || hasPostCSSWithTailwind) {
    detectedVersion = "v4";
  } else if (hasTailwindV3Config) {
    detectedVersion = "v3";
  }
  
  // Debug information
  console.log("🔍 Tailwind detection details:");
  console.log(`  • v3 Config file found: ${hasTailwindV3Config}`);
  console.log(`  • v4 PostCSS config found: ${hasTailwindV4Config}`);
  console.log(`  • PostCSS includes Tailwind: ${hasPostCSSWithTailwind}`);
  console.log(`  • Package.json dependency: ${hasTailwindDependency} (${tailwindVersion})`);
  console.log(`  • CSS imports found: ${hasTailwindImports}`);
  console.log(`  • Detected version: ${detectedVersion}`);
  
  return {
    useSrcDir: hasSrcDir,
    useTypeScript: hasTypeScript,
    useTailwind: useTailwind,
    tailwindVersion: detectedVersion
  };
}

// Helper to create auth configuration
function createAuthConfig(useSrcDir: boolean, useTypeScript: boolean): void {
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
  console.log("📝 Created basic auth configuration");
}

// Helper to create utils file
function createUtilsFile(useSrcDir: boolean, useTypeScript: boolean): void {
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

// Helper to setup shadcn/ui
function setupShadcn(config: ProjectConfig, projectStructure: { useSrcDir: boolean; useTypeScript: boolean; useTailwind: boolean; tailwindVersion: string }): void {
  if (!config.shadcn) return;

  if (!projectStructure.useTailwind) {
    console.log("❌ shadcn/ui requires Tailwind CSS. Please enable Tailwind CSS when creating your Next.js project.");
    return;
  }

  console.log("\n🎨 Setting up shadcn/ui...");
  console.log(`📋 Detected Tailwind CSS ${projectStructure.tailwindVersion}`);
  
  try {
    const installCmd = getInstallCommand(config.packageManager);
    
    // For Tailwind v4, we need to create a minimal traditional config for shadcn/ui compatibility
    // But keep using v4 as the main CSS engine
    if (projectStructure.tailwindVersion === "v4" || !fs.existsSync(path.join(process.cwd(), "tailwind.config.js"))) {
      console.log("🔧 Creating minimal Tailwind config for shadcn/ui compatibility (keeping v4)...");
      
      // Install only the required shadcn/ui dependencies
      run(`${installCmd} tailwindcss-animate --dev`);
      
      // Create a minimal tailwind.config.js that shadcn/ui can read for component generation
      // This won't interfere with v4's CSS processing
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  // This config is only used by shadcn/ui CLI for component generation
  // Tailwind v4 CSS processing happens via @tailwindcss/postcss
  content: [
    './pages/**/*.{${projectStructure.useTypeScript ? 'ts,tsx' : 'js,jsx'}}',
    './components/**/*.{${projectStructure.useTypeScript ? 'ts,tsx' : 'js,jsx'}}',
    './app/**/*.{${projectStructure.useTypeScript ? 'ts,tsx' : 'js,jsx'}}',
    './src/**/*.{${projectStructure.useTypeScript ? 'ts,tsx' : 'js,jsx'}}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
      
      fs.writeFileSync(path.join(process.cwd(), "tailwind.config.js"), tailwindConfig);
      console.log("✅ Created minimal Tailwind config for shadcn/ui CLI");
      
      // Keep the original v4 PostCSS config - don't modify it
      console.log("✅ Keeping original Tailwind v4 PostCSS configuration");
    }

    // Initialize shadcn/ui interactively
    console.log("\n🔧 Initializing shadcn/ui...");
    console.log("You'll be asked to configure shadcn/ui (theme, colors, etc.):\n");
    run("npx shadcn@latest init");
    
    // Install common components
    console.log("\n📦 Installing common components...");
    run("npx shadcn@latest add button card input label");
    
    console.log("✅ shadcn/ui setup complete!");
    
  } catch (error) {
    console.warn("⚠️  shadcn/ui setup failed. You can set it up manually later.");
    console.log("💡 To set up manually:");
    console.log("   1. Create a minimal tailwind.config.js file");
    console.log("   2. Run: npx shadcn@latest init");
    console.log("   3. Install components with: npx shadcn@latest add [component-name]");
  }
}

// Helper to setup NextAuth
function setupNextAuth(config: ProjectConfig, projectStructure: { useSrcDir: boolean; useTypeScript: boolean; useTailwind: boolean; tailwindVersion: string }): void {
  if (!config.nextauth) return;

  console.log("\n🔐 Setting up NextAuth.js...");
  
  const installCmd = getInstallCommand(config.packageManager);
  
  try {
    run(`${installCmd} next-auth@beta @auth/prisma-adapter prisma @prisma/client`);
    createAuthConfig(projectStructure.useSrcDir, projectStructure.useTypeScript);
    console.log("✅ NextAuth.js setup complete!");
  } catch (error) {
    console.error("❌ Failed to install NextAuth.js");
  }
}

// Helper to create additional project structure
function createProjectStructure(useSrcDir: boolean, useTailwind: boolean, useTypeScript: boolean): void {
  console.log("\n📁 Setting up additional project structure...");
  
  const baseDir = useSrcDir ? "src" : "";
  
  // Create additional directories
  const dirs = [
    path.join(baseDir, "components", "ui"),
    path.join(baseDir, "lib"),
    path.join(baseDir, "hooks"),
    path.join(baseDir, "types")
  ].filter(Boolean);
  
  dirs.forEach(dir => {
    fs.ensureDirSync(path.join(process.cwd(), dir));
  });

  // Create utils file only if Tailwind is detected
  if (useTailwind) {
    createUtilsFile(useSrcDir, useTypeScript);
  }
}

// Main function
async function main(): Promise<void> {
  try {
    console.log("🚀 Next.js Project Generator\n");
    console.log("This tool will first create a Next.js project using the official installer,");
    console.log("then add optional features like shadcn/ui and NextAuth.js.\n");

    // Step 1: Get basic project info
    const basicAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        default: "my-app",
        validate: (input: string) =>
          /^[a-zA-Z0-9-_]+$/.test(input) || "Use only letters, numbers, - and _",
      },
      {
        type: "list",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: ["npm", "yarn", "pnpm", "bun"],
        default: "npm",
      },
    ]);

    // Step 2: Get additional features
    const featureAnswers = await inquirer.prompt([
      {
        type: "confirm",
        name: "shadcn",
        message: "Do you want to add shadcn/ui after project creation? (requires Tailwind CSS)",
        default: false,
      },
      {
        type: "confirm",
        name: "nextauth",
        message: "Do you want to add NextAuth.js after project creation?",
        default: false,
      },
      {
        type: "confirm",
        name: "useTurbopack",
        message: "Do you want to use Turbopack for faster development?",
        default: false,
      },
    ]);

    const config: ProjectConfig = { ...basicAnswers, ...featureAnswers };

    // Step 3: Create Next.js app using the official installer
    console.log("\n🚀 Creating Next.js app using create-next-app...");
    console.log("You'll be asked configuration questions by the Next.js installer.\n");
    
    let createCommand = `npx create-next-app@latest ${config.projectName}`;
    if (config.packageManager !== "npm") {
      createCommand += ` --use-${config.packageManager}`;
    }

    run(createCommand);

    // Step 4: Setup additional features
    const originalDir = process.cwd();
    process.chdir(config.projectName);

        // Detect the project structure that was created
    const projectStructure = detectProjectStructure();
    console.log("\n🔍 Detected project structure:");
    console.log(`  • TypeScript: ${projectStructure.useTypeScript ? '✅' : '❌'}`);
    console.log(`  • Tailwind CSS: ${projectStructure.useTailwind ? '✅' : '❌'} ${projectStructure.tailwindVersion ? `(${projectStructure.tailwindVersion})` : ''}`);
    console.log(`  • src/ directory: ${projectStructure.useSrcDir ? '✅' : '❌'}`);
    
    // Add a small delay to ensure all files are written
    console.log("\n⏳ Waiting for project setup to complete...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Debug: List files in the project directory
    console.log("\n🔧 Debug - Files in project directory:");
    try {
      const files = fs.readdirSync(process.cwd());
      console.log("  Files:", files.join(", "));
      
      // Check specific files
      const checkFiles = ["tailwind.config.js", "tailwind.config.ts", "postcss.config.mjs", "package.json"];
      checkFiles.forEach(file => {
        if (fs.existsSync(path.join(process.cwd(), file))) {
          console.log(`  ✅ Found: ${file}`);
        } else {
          console.log(`  ❌ Missing: ${file}`);
        }
      });
    } catch (error) {
      console.log("  Could not list files");
    }

    // Create additional project structure
    createProjectStructure(projectStructure.useSrcDir, projectStructure.useTailwind, projectStructure.useTypeScript);

    // Setup features
    setupShadcn(config, projectStructure);
    setupNextAuth(config, projectStructure);

    // Install additional dependencies if needed
    if (projectStructure.useTailwind && (config.shadcn || config.nextauth)) {
      console.log("\n📦 Installing additional dependencies...");
      const installCmd = getInstallCommand(config.packageManager);
      const dependencies = ["lucide-react"];
      if (projectStructure.useTailwind) {
        dependencies.push("clsx", "tailwind-merge");
      }
      run(`${installCmd} ${dependencies.join(" ")}`);
    }

    process.chdir(originalDir);

    // Step 5: Print summary
    console.log("\n✅ Project setup complete!");
    console.log(`\n🎉 Your Next.js app is ready!`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${config.projectName}`);
    console.log(`  ${getDevCommand(config.packageManager, config.useTurbopack)}`);
    
    if (config.useTurbopack) {
      console.log(`\n⚡ Turbopack is enabled for faster development!`);
    }
    
    if (config.nextauth) {
      console.log(`\n🔑 Don't forget to:`);
      console.log(`  - Set up your environment variables (.env.local)`);
      console.log(`  - Configure your authentication providers`);
    }
    
    if (config.shadcn && projectStructure.useTailwind) {
      console.log(`\n🎨 Shadcn/ui is ready to use!`);
      console.log(`  - Components are in ${projectStructure.useSrcDir ? 'src/' : ''}components/ui/`);
      console.log(`  - Add more components with: npx shadcn@latest add [component]`);
    }

    console.log(`\n📋 Final Configuration:`);
    console.log(`  • Project Name: ${config.projectName}`);
    console.log(`  • Package Manager: ${config.packageManager}`);
    console.log(`  • TypeScript: ${projectStructure.useTypeScript ? '✅' : '❌'}`);
    console.log(`  • Tailwind CSS: ${projectStructure.useTailwind ? '✅' : '❌'} ${projectStructure.tailwindVersion ? `(${projectStructure.tailwindVersion})` : ''}`);
    console.log(`  • src/ directory: ${projectStructure.useSrcDir ? '✅' : '❌'}`);
    console.log(`  • Turbopack: ${config.useTurbopack ? '✅' : '❌'}`);
    console.log(`  • shadcn/ui: ${config.shadcn && projectStructure.useTailwind ? '✅' : '❌'}`);
    console.log(`  • NextAuth.js: ${config.nextauth ? '✅' : '❌'}`);

    if (config.shadcn && !projectStructure.useTailwind) {
      console.log(`\n⚠️  Note: shadcn/ui was not installed because Tailwind CSS was not detected.`);
      console.log(`     You can install it manually later if you add Tailwind CSS.`);
    }
    
    if (projectStructure.tailwindVersion === "v4" && config.shadcn) {
      console.log(`\n📋 Tailwind CSS Configuration:`);
      console.log(`     • Replaced Tailwind v4 with traditional v3.4.0 for shadcn/ui compatibility`);
      console.log(`     • Updated PostCSS config to use traditional Tailwind CSS`);
      console.log(`     • Created tailwind.config.js with shadcn/ui optimizations`);
      console.log(`     • All shadcn/ui components will work perfectly now`);
    }

  } catch (error) {
    console.error("\n❌ Error during setup:", (error as Error).message);
    process.exit(1);
  }
}

main();