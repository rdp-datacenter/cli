import chalk from "chalk";
import type { ProjectConfig, ProjectStructure } from "../types/index.js";
import { getInstallCommand, run } from "../utils/commands.js";
import { createAuthConfig, createNextAuthApiRoute, createEnvFile } from "../generators/files.js";

// Helper to setup NextAuth
export function setupNextAuth(config: ProjectConfig, projectStructure: ProjectStructure): void {
  if (!config.nextauth) return;

  console.log(chalk.blue("\n🔐 Setting up NextAuth.js..."));
  
  const installCmd = getInstallCommand(config.packageManager);
  
  try {
    run(`${installCmd} next-auth@beta @auth/prisma-adapter prisma @prisma/client`, "Installing NextAuth.js and dependencies");
    
    // Generate NextAuth secret
    console.log(chalk.cyan("🔑 Generating NextAuth secret..."));
    run("npx auth secret", "Generating NEXTAUTH_SECRET");
    
    createAuthConfig(projectStructure.useSrcDir, projectStructure.useTypeScript);
    createNextAuthApiRoute(projectStructure.useSrcDir, projectStructure.useTypeScript);
    createEnvFile();
    
    console.log(chalk.green("✅ NextAuth.js setup complete!"));
    console.log(chalk.dim("   • Auth config created"));
    console.log(chalk.dim("   • API route created at /api/auth/[...nextauth]"));
    console.log(chalk.dim("   • Environment file updated with NEXTAUTH_SECRET"));
    console.log(chalk.dim("   • NEXTAUTH_URL added for local development"));
  } catch (error) {
    console.error(chalk.red("❌ Failed to install NextAuth.js"));
    console.log(chalk.yellow("💡 You can manually generate the secret with: npx auth secret"));
  }
}