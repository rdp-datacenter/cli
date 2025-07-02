import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import type { ProjectConfig, ProjectStructure } from "../types/index.js";
import { getInstallCommand, run, runInteractive } from "../utils/commands.js";
import { createThemeProvider, updateLayoutWithThemeProvider } from "../generators/files.js";

// Helper to setup shadcn/ui
export async function setupShadcn(config: ProjectConfig, projectStructure: ProjectStructure): Promise<void> {
  if (!config.shadcn) return;

  if (!projectStructure.useTailwind) {
    console.log(chalk.red("❌ shadcn/ui requires Tailwind CSS. Please enable Tailwind CSS when creating your Next.js project."));
    return;
  }

  console.log(chalk.magenta("\n🎨 Setting up shadcn/ui..."));
  console.log(chalk.blue(`📋 Detected Tailwind CSS ${projectStructure.tailwindVersion}`));
  
  try {
    const installCmd = getInstallCommand(config.packageManager);
    
    if (projectStructure.tailwindVersion === "v4" || !fs.existsSync(path.join(process.cwd(), "tailwind.config.js"))) {
      console.log(chalk.yellow("🔧 Creating minimal Tailwind config for shadcn/ui compatibility..."));
      
      run(`${installCmd} tailwindcss-animate --dev`, "Installing shadcn/ui dependencies");
      
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
      console.log(chalk.green("✅ Created minimal Tailwind config for shadcn/ui CLI"));
    }

    console.log(chalk.cyan("\n🔧 Initializing shadcn/ui..."));
    console.log(chalk.dim("You'll be asked to configure shadcn/ui (theme, colors, etc.):\n"));
    await runInteractive("npx shadcn@latest init");
    
    console.log(chalk.cyan("\n📦 Installing common components..."));
    run("npx shadcn@latest add button card input label", "Installing UI components");
    
    // Install next-themes for dark/light mode support
    console.log(chalk.cyan("\n🌙 Setting up theme support..."));
    run(`${installCmd} next-themes`, "Installing next-themes");
    
    // Create theme provider component
    createThemeProvider(projectStructure.useSrcDir, projectStructure.useTypeScript);
    
    // Update layout with theme provider
    updateLayoutWithThemeProvider(projectStructure.useSrcDir, projectStructure.useTypeScript);
    
    console.log(chalk.green("✅ shadcn/ui setup complete with theme support!"));
    console.log(chalk.dim("   • UI components installed"));
    console.log(chalk.dim("   • Dark/light mode theme provider configured"));
    console.log(chalk.dim("   • Layout updated with theme support"));
    
  } catch (error) {
    console.log(chalk.yellow("⚠️  shadcn/ui setup failed. You can set it up manually later."));
    console.log(chalk.dim("💡 To set up manually:"));
    console.log(chalk.dim("   1. Create a minimal tailwind.config.js file"));
    console.log(chalk.dim("   2. Run: npx shadcn@latest init"));
    console.log(chalk.dim("   3. Install components with: npx shadcn@latest add [component-name]"));
    console.log(chalk.dim("   4. Install next-themes for theme support"));
  }
}