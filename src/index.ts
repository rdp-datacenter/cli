#!/usr/bin/env node

import chalk from "chalk";
import type { ProjectConfig } from "./types/index.js";
import { displayBanner, displayProjectSummary, displayProjectAnalysis } from "./utils/ui.js";
import { getBasicProjectInfo, getFeatureOptions } from "./utils/prompts.js";
import { runInteractive, getInstallCommand, run } from "./utils/commands.js";
import { detectProjectStructure } from "./utils/detector.js";
import { createProjectStructure } from "./generators/files.js";
import { setupShadcn } from "./setup/shadcn.js";
import { setupNextAuth } from "./setup/nextauth.js";

// Main function
async function main(): Promise<void> {
  try {
    displayBanner();

    // Step 1: Get basic project info
    const basicAnswers = await getBasicProjectInfo();

    // Step 2: Get additional features
    const featureAnswers = await getFeatureOptions();

    const config: ProjectConfig = { ...basicAnswers, ...featureAnswers };

    // Step 3: Create Next.js app
    console.log(chalk.bgCyan.black.bold('\n 🚀 CREATING NEXT.JS PROJECT '));
    console.log(chalk.dim('The Next.js installer will ask you some configuration questions...\n'));
    
    let createCommand = `npx create-next-app@latest ${config.projectName}`;
    if (config.packageManager !== "npm") {
      createCommand += ` --use-${config.packageManager}`;
    }

    await runInteractive(createCommand);

    // Step 4: Setup additional features
    const originalDir = process.cwd();
    process.chdir(config.projectName);

    console.log(chalk.yellow("\n⏳ Analyzing the created project..."));
    const projectStructure = await detectProjectStructure();
    displayProjectAnalysis(projectStructure);

    createProjectStructure(projectStructure.useSrcDir, projectStructure.useTailwind, projectStructure.useTypeScript);
    await setupShadcn(config, projectStructure);
    setupNextAuth(config, projectStructure);

    // Install additional dependencies
    if (projectStructure.useTailwind && (config.shadcn || config.nextauth)) {
      const installCmd = getInstallCommand(config.packageManager);
      const dependencies = ["lucide-react"];
      if (projectStructure.useTailwind) {
        dependencies.push("clsx", "tailwind-merge");
      }
      run(`${installCmd} ${dependencies.join(" ")}`, "Installing additional dependencies");
    }

    process.chdir(originalDir);

    // Step 5: Display summary
    displayProjectSummary(config, projectStructure);

  } catch (error) {
    console.error(chalk.red.bold("\n💥 Setup failed:"), chalk.red((error as Error).message));
    process.exit(1);
  }
}

main();