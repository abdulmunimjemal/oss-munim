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
        src: "./src/assets/logo.svg",
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
      customCss: ["./src/styles/theme.css"],
      lastUpdated: true,
      sidebar: [
        {
          label: "Start here",
          items: [{ label: "Open source by Munim", link: "/" }],
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
      ],
    }),
  ],
});
