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
      sidebar: [
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
            { label: "Usage", link: "/tokcost/usage/" },
            { label: "Library API", link: "/tokcost/api/" },
          ],
        },
        {
          label: "heyllm",
          items: [
            { label: "Introduction", link: "/heyllm/" },
            { label: "Usage", link: "/heyllm/usage/" },
            { label: "Configuration", link: "/heyllm/configuration/" },
          ],
        },
        {
          label: "dotcheck",
          items: [
            { label: "Introduction", link: "/dotcheck/" },
            { label: "Usage", link: "/dotcheck/usage/" },
            { label: "CI", link: "/dotcheck/ci/" },
            { label: "API", link: "/dotcheck/api/" },
          ],
        },
        {
          label: "gitsweep",
          items: [
            { label: "Introduction", link: "/gitsweep/" },
            { label: "Usage", link: "/gitsweep/usage/" },
          ],
        },
      ],
    }),
  ],
});
