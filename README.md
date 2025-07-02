# 🚀 RDP CLI

A powerful CLI tool to quickly scaffold Next.js projects with popular features like shadcn/ui, NextAuth.js, and Turbopack. Built with TypeScript and designed to work seamlessly with Next.js 15 and Tailwind CSS v4.

## ✨ Features

- 🎯 **Interactive Setup** - Uses the official `create-next-app` for base project creation
- 🎨 **shadcn/ui Integration** - Automatically sets up shadcn/ui with Tailwind CSS v4 compatibility
- 🔐 **NextAuth.js Support** - Optional authentication setup with popular providers
- ⚡ **Turbopack Ready** - Optional Turbopack support for faster development
- 📦 **Multi Package Manager** - Supports npm, yarn, pnpm, and bun
- 🔧 **Smart Detection** - Automatically detects project structure and adapts configuration
- 🌟 **Modern Stack** - Full TypeScript support and Next.js 15 compatibility

## 🚀 Quick Start

### Usage

```bash
npx create-rdp-app
```

### Global Installation (Optional)

```bash
npm install -g create-rdp-app
create-rdp-app
```

## 📋 What It Does

1. **🎯 Project Setup** - Asks for basic project configuration
2. **🛠️ Next.js Creation** - Uses official `create-next-app` with your preferences
3. **🔍 Smart Detection** - Analyzes the created project structure
4. **🎨 Feature Installation** - Adds requested features like shadcn/ui and NextAuth.js
5. **✅ Ready to Go** - Complete setup with all dependencies installed

## 🎨 Supported Features

### Core Configuration
- ✅ TypeScript / JavaScript
- ✅ ESLint
- ✅ Tailwind CSS (v3 & v4 compatible)
- ✅ src/ directory structure
- ✅ App Router / Pages Router
- ✅ Custom import aliases
- ✅ Multiple package managers

### Optional Additions
- 🎨 **shadcn/ui** - Beautiful UI components (requires Tailwind CSS)
- 🔐 **NextAuth.js** - Complete authentication solution
- ⚡ **Turbopack** - Next.js 14+ fast refresh and bundling

## 🔧 Requirements

- **Node.js** 16.0.0 or higher
- **Package Manager** - npm, yarn, pnpm, or bun

## 📚 Example Usage

```bash
$ npx create-rdp-app

🚀 Next.js Project Generator

This tool will first create a Next.js project using the official installer,
then add optional features like shadcn/ui and NextAuth.js.

? What is your project name? my-awesome-app
? Which package manager would you like to use? yarn
? Do you want to add shadcn/ui after project creation? Yes
? Do you want to add NextAuth.js after project creation? No
? Do you want to use Turbopack for faster development? Yes

🚀 Creating Next.js app using create-next-app...
# ... Next.js installation questions ...

🔍 Detected project structure:
  • TypeScript: ✅
  • Tailwind CSS: ✅ (v4)
  • src/ directory: ✅

🎨 Setting up shadcn/ui...
# ... shadcn/ui configuration ...

✅ Project setup complete!
```

## 🎯 Tailwind CSS v4 Compatibility

This tool is specifically designed to work with Next.js 15's default Tailwind CSS v4 setup:

- **✅ Preserves v4 Configuration** - Keeps your `postcss.config.mjs` with `@tailwindcss/postcss`
- **✅ shadcn/ui Compatible** - Creates minimal `tailwind.config.js` only for component generation
- **✅ Best of Both Worlds** - Modern v4 features + beautiful UI components

## 🛠️ Manual Setup (if needed)

If you prefer to set up features manually:

### shadcn/ui Setup
```bash
yarn add -D tailwindcss-animate
npx shadcn@latest init
npx shadcn@latest add button card input label
```

### NextAuth.js Setup
```bash
yarn add next-auth@beta @auth/prisma-adapter prisma @prisma/client
```

## 📁 Project Structure

After running `create-rdp-app`, your project will have:

```
my-app/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/           # shadcn/ui components (if selected)
│   ├── lib/
│   │   ├── utils.ts      # Tailwind utilities
│   │   └── auth.ts       # NextAuth config (if selected)
│   ├── hooks/
│   └── types/
├── components.json       # shadcn/ui config
├── tailwind.config.js    # Minimal config for shadcn/ui
├── postcss.config.mjs    # Tailwind v4 config
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/rdp-datacenter/cli.git create-rdp-app
cd create-rdp-app
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

4. Test locally
```bash
npm link
create-rdp-app
```

## 📄 License

MIT License - see the [LICENCE](LICENCE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS

---

**Happy coding! 🚀**