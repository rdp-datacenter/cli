import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import type { ProjectConfig, ProjectStructure } from "../types/index.js";
import { getDevCommand } from "./commands.js";

// Helper to display banner
export function displayBanner(): void {
  console.clear();
  
  const banner = figlet.textSync('RDP CLI', {
    font: 'Big',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  console.log(gradient.rainbow(banner));
  console.log(gradient(['#FF6B6B', '#4ECDC4', '#45B7D1'])('🚀 Next.js Project Generator with superpowers!\n'));
  console.log(chalk.dim('This tool will create a Next.js project with optional features like'));
  console.log(chalk.dim('shadcn/ui, NextAuth.js, and Turbopack for an amazing developer experience.\n'));
}

// Helper to display project summary
export function displayProjectSummary(config: ProjectConfig, projectStructure: ProjectStructure): void {
  console.log(chalk.green.bold("\n✨ Project setup complete!"));
  console.log(gradient(['#FF6B6B', '#4ECDC4'])(`\n🎉 Your Next.js app "${config.projectName}" is ready!\n`));
  
  // Next steps box
  console.log(chalk.bgBlue.white.bold(' NEXT STEPS '));
  console.log(chalk.cyan(`  cd ${config.projectName}`));
  console.log(chalk.cyan(`  ${getDevCommand(config.packageManager, config.useTurbopack)}`));
  
  if (config.useTurbopack) {
    console.log(chalk.yellow(`\n⚡ Turbopack is enabled for lightning-fast development!`));
  }
  
  if (config.nextauth) {
    console.log(chalk.red(`\n🔑 NextAuth.js is configured and ready!`));
    console.log(chalk.dim(`  • Auth config: ${projectStructure.useSrcDir ? 'src/' : ''}lib/auth.${projectStructure.useTypeScript ? 'ts' : 'js'}`));
    console.log(chalk.dim(`  • API route: ${projectStructure.useSrcDir ? 'src/' : ''}app/api/auth/[...nextauth]/route.${projectStructure.useTypeScript ? 'ts' : 'js'}`));
    console.log(chalk.dim(`  • Environment: .env.local (with NEXTAUTH_SECRET & NEXTAUTH_URL)`));
    console.log(chalk.dim(`  • Next steps:`));
    console.log(chalk.dim(`    - Add your provider credentials to .env.local`));
    console.log(chalk.dim(`    - Configure additional providers in auth.${projectStructure.useTypeScript ? 'ts' : 'js'}`));
    console.log(chalk.dim(`    - Test authentication at: /api/auth/signin`));
  }
  
  if (config.shadcn && projectStructure.useTailwind) {
    console.log(chalk.magenta(`\n🎨 Shadcn/ui is ready to use!`));
    console.log(chalk.dim(`  • Components are in ${projectStructure.useSrcDir ? 'src/' : ''}components/ui/`));
    console.log(chalk.dim(`  • Add more: npx shadcn@latest add [component]`));
  }

  // Configuration summary box
  console.log(chalk.bgGreen.white.bold('\n CONFIGURATION SUMMARY '));
  const configs = [
    [`Project Name`, config.projectName],
    [`Package Manager`, config.packageManager],
    [`TypeScript`, projectStructure.useTypeScript ? '✅' : '❌'],
    [`Tailwind CSS`, projectStructure.useTailwind ? `✅ (${projectStructure.tailwindVersion})` : '❌'],
    [`src/ directory`, projectStructure.useSrcDir ? '✅' : '❌'],
    [`Turbopack`, config.useTurbopack ? '✅' : '❌'],
    [`shadcn/ui`, config.shadcn && projectStructure.useTailwind ? '✅' : '❌'],
    [`NextAuth.js`, config.nextauth ? '✅' : '❌']
  ];
  
  configs.forEach(([key, value]) => {
    console.log(`  ${chalk.bold(key.padEnd(16))}: ${value}`);
  });

  if (config.shadcn && !projectStructure.useTailwind) {
    console.log(chalk.yellow(`\n⚠️  Note: shadcn/ui was not installed because Tailwind CSS was not detected.`));
    console.log(chalk.dim(`     You can install it manually later if you add Tailwind CSS.`));
  }

  console.log(gradient(['#FF6B6B', '#4ECDC4'])('\n🚀 Happy coding! May your builds be fast and your bugs be few! 🐛✨\n'));
}

// Helper to display project analysis
export function displayProjectAnalysis(projectStructure: ProjectStructure): void {
  console.log(chalk.bgMagenta.white.bold('\n 🔍 PROJECT ANALYSIS '));
  console.log(`  ${chalk.bold('TypeScript')}: ${projectStructure.useTypeScript ? chalk.green('✅') : chalk.red('❌')}`);
  console.log(`  ${chalk.bold('Tailwind CSS')}: ${projectStructure.useTailwind ? chalk.green(`✅ ${projectStructure.tailwindVersion ? `(${projectStructure.tailwindVersion})` : ''}`) : chalk.red('❌')}`);
  console.log(`  ${chalk.bold('src/ directory')}: ${projectStructure.useSrcDir ? chalk.green('✅') : chalk.red('❌')}`);
}