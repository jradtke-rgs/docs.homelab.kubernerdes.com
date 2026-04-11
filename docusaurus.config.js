// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kubernerdes Homelab',
  tagline: 'SUSE Rancher on NUC — Community, Carbide, and Enclave',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.homelab.kubernerdes.com',
  baseUrl: '/',

  organizationName: 'jradtke-rgs',
  projectName: 'docs.homelab.kubernerdes.com',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/jradtke-rgs/docs.homelab.kubernerdes.com/edit/main/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Kubernerdes Homelab',
        logo: {
          alt: 'Kubernerdes Homelab Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/docs/getting-started',
            label: 'Getting Started',
            position: 'left',
          },
          {
            to: '/docs/day-0',
            label: 'Day 0',
            position: 'left',
          },
          {
            to: '/docs/day-1',
            label: 'Day 1',
            position: 'left',
          },
          {
            to: '/docs/day-2',
            label: 'Day 2',
            position: 'left',
          },
          {
            href: 'https://github.com/jradtke-rgs/homelab.kubernerdes.com',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Homelab Docs',
            items: [
              {label: 'Getting Started', to: '/docs/getting-started'},
              {label: 'Day 0 — Design', to: '/docs/day-0'},
              {label: 'Day 1 — Build', to: '/docs/day-1'},
              {label: 'Day 2 — Operate', to: '/docs/day-2'},
            ],
          },
          {
            title: 'Environments',
            items: [
              {label: 'Community', to: '/docs/day-0/environments'},
              {label: 'Carbide', to: '/docs/day-0/environments'},
              {label: 'Enclave', to: '/docs/day-0/environments'},
            ],
          },
          {
            title: 'Source',
            items: [
              {
                label: 'homelab.kubernerdes.com',
                href: 'https://github.com/jradtke-rgs/homelab.kubernerdes.com',
              },
              {
                label: 'docs.homelab.kubernerdes.com',
                href: 'https://github.com/jradtke-rgs/docs.homelab.kubernerdes.com',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Kubernerdes Homelab. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'yaml', 'nginx'],
      },
    }),
};

export default config;
