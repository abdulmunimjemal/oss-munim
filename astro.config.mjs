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
        baseUrl: "https://github.com/abdulmunimjemal/oss/edit/main/",
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
      ],
    }),
  ],
});
