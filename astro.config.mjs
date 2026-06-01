// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://oss.munim.io",
  integrations: [
    starlight({
      title: "Munim · OSS",
      description:
        "Small, sharp open-source tools for building with LLMs — by Abdulmunim Jemal.",
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: false,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/abdulmunimjemal",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/abdulmunimjemal/oss-munim/edit/main/",
      },
      customCss: [
        "@fontsource-variable/bricolage-grotesque",
        "@fontsource-variable/hanken-grotesk",
        "@fontsource/ibm-plex-mono/400.css",
        "@fontsource/ibm-plex-mono/500.css",
        "@fontsource/ibm-plex-mono/600.css",
        "./src/styles/theme.css",
      ],
      lastUpdated: true,
      expressiveCode: {
        // Render terminal-output samples (ansi/console) as realistic terminal
        // windows — macOS title bar + traffic-light dots. Shell blocks already
        // get a terminal frame by default.
        defaultProps: {
          overridesByLang: {
            "ansi,console,shellsession,shell-session,output": {
              frame: "terminal",
            },
          },
        },
        styles: {
          frames: {
            frameBoxShadowCssValue: "0 16px 40px -22px rgba(0, 0, 0, 0.8)",
          },
        },
      },
      sidebar: [
        {
          label: "codescope",
          items: [
            { label: "Introduction", link: "/codescope/" },
            { label: "Quick start", link: "/codescope/quick-start/" },
            { label: "MCP tools", link: "/codescope/mcp-tools/" },
            { label: "CLI", link: "/codescope/cli/" },
            { label: "Languages", link: "/codescope/languages/" },
            { label: "How it works", link: "/codescope/how-it-works/" },
            { label: "Benchmarks", link: "/codescope/benchmarks/" },
            { label: "Programmatic API", link: "/codescope/api/" },
          ],
        },
        {
          label: "promptsize",
          items: [
            { label: "Introduction", link: "/promptsize/" },
            { label: "Quick start", link: "/promptsize/quick-start/" },
            { label: "Why promptsize", link: "/promptsize/why/" },
            { label: "CLI", link: "/promptsize/cli/" },
            { label: "Configuration", link: "/promptsize/configuration/" },
            { label: "GitHub Action", link: "/promptsize/github-action/" },
            { label: "Programmatic API", link: "/promptsize/api/" },
          ],
        },
        {
          label: "passmuster",
          items: [
            { label: "Introduction", link: "/passmuster/" },
            { label: "Quick start", link: "/passmuster/quick-start/" },
            { label: "Checks", link: "/passmuster/checks/" },
            { label: "Retry with feedback", link: "/passmuster/retry-feedback/" },
            { label: "API", link: "/passmuster/api/" },
          ],
        },
        {
          label: "tokcost",
          items: [
            { label: "Introduction", link: "/tokcost/" },
            { label: "Quick start", link: "/tokcost/quick-start/" },
            { label: "CLI", link: "/tokcost/cli/" },
            { label: "Models & pricing", link: "/tokcost/models/" },
            { label: "Library API", link: "/tokcost/api/" },
          ],
        },
        {
          label: "heyllm",
          items: [
            { label: "Introduction", link: "/heyllm/" },
            { label: "Quick start", link: "/heyllm/quick-start/" },
            { label: "CLI", link: "/heyllm/cli/" },
            { label: "Configuration", link: "/heyllm/configuration/" },
            { label: "Recipes", link: "/heyllm/recipes/" },
          ],
        },
        {
          label: "dotcheck",
          items: [
            { label: "Introduction", link: "/dotcheck/" },
            { label: "Quick start", link: "/dotcheck/quick-start/" },
            { label: "CLI", link: "/dotcheck/cli/" },
            { label: "CI", link: "/dotcheck/ci/" },
            { label: "API", link: "/dotcheck/api/" },
          ],
        },
        {
          label: "gitsweep",
          items: [
            { label: "Introduction", link: "/gitsweep/" },
            { label: "Quick start", link: "/gitsweep/quick-start/" },
            { label: "How it works", link: "/gitsweep/how-it-works/" },
            { label: "CLI", link: "/gitsweep/cli/" },
          ],
        },
        {
          label: "agentwatch",
          items: [
            { label: "Introduction", link: "/agentwatch/" },
            { label: "Quick start", link: "/agentwatch/quick-start/" },
            { label: "Recording", link: "/agentwatch/recording/" },
            { label: "CLI", link: "/agentwatch/cli/" },
            { label: "API", link: "/agentwatch/api/" },
          ],
        },
        {
          label: "readmecast",
          items: [
            { label: "Introduction", link: "/readmecast/" },
            { label: "Quick start", link: "/readmecast/quick-start/" },
            { label: "Markdown format", link: "/readmecast/markdown-format/" },
            { label: "CLI", link: "/readmecast/cli/" },
            { label: "Programmatic API", link: "/readmecast/api/" },
          ],
        },
        {
          label: "shipcard",
          items: [
            { label: "Introduction", link: "/shipcard/" },
            { label: "Quick start", link: "/shipcard/quick-start/" },
            { label: "CLI", link: "/shipcard/cli/" },
            { label: "Customization", link: "/shipcard/customization/" },
            { label: "Programmatic API", link: "/shipcard/api/" },
          ],
        },
      ],
    }),
  ],
});
