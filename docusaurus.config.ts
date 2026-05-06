import {darkTheme} from './src/css/prism-theme/xdark';
import {lightTheme} from './src/css/prism-theme/xlight';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {Options as IdealImageOptions} from '@docusaurus/plugin-ideal-image';
import tdk from './src/data/tdk';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const BASE_URL = process.env.BASE_URL || '/';

const isProd = BASE_URL == '/';

const normalizeSidebarHref = (href: unknown): string | undefined =>
  typeof href === 'string' ? href.replace(/\/$/, '') : undefined;

const getSidebarCategoryHref = (item: any): string | undefined =>
  normalizeSidebarHref(item.href) ??
  normalizeSidebarHref(item.link?.href) ??
  normalizeSidebarHref(item.link?.slug);

const isReactSdkCategoryHref = (href: string | undefined): boolean =>
  typeof href === 'string' && /\/api\/react-sdk$/.test(href);

const expandSidebarCategories = (
  items: any[],
  parentCategoryHref?: string,
): any[] =>
  items.map((item) => {
    if (item.type !== 'category') {
      return item;
    }

    const itemHref = getSidebarCategoryHref(item);
    const shouldDefaultCollapse = isReactSdkCategoryHref(parentCategoryHref);

    return {
      ...item,
      collapsed: shouldDefaultCollapse ? true : item.collapsed ?? false,
      items: Array.isArray(item.items)
        ? expandSidebarCategories(item.items, itemHref)
        : item.items,
    };
  });

const config: Config = {
  trailingSlash: false,
  onBrokenLinks: 'throw', // 发现死链就 fail‐fast
  onBrokenAnchors: 'throw', // 发现失效锚点也直接失败

  staticDirectories: ['static'],

  headTags: [
    // {
    //   tagName: 'link',
    //   attributes: {
    //     rel: 'preconnect',
    //     href: '//rsms.me/',
    //   },
    // },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: '//fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: '//fonts.gstatic.com',
        crossorigin: 'true',
      },
    },
    {
      tagName: 'script',
      attributes: {
        async: 'true',
        src: `https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}`,
      },
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.GA_ID}');
      `,
    },
  ],

  stylesheets: [
    // {
    //   href: '//rsms.me/inter/inter.css',
    //   type: 'text/css',
    // },

    {
      href: '//fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
      type: 'text/css',
    },
  ],
  plugins: [
    'docusaurus-plugin-sass',
    require.resolve('./plugins/llms'),
    '@docusaurus/theme-live-codeblock',
    [
      'ideal-image',
      {
        quality: 70,
        max: 1920,
        min: 640,
        steps: 2,
        // Use false to debug, but it incurs huge perf costs
        // disableInDev: false,
        disableInDev: true,
      } satisfies IdealImageOptions,
    ],
  ],
  title: 'WebSpatial',
  favicon: 'img/favicon.svg',
  customFields: {
    llmsSummary: tdk.index.description,
    llmsBaseUrl: '/',
  },

  // Set the production url of your site here
  url: 'https://webspatial.dev',
  // Set the pathname under which the site is served.
  // Use '/' for normal Cloudflare Pages deployment and override BASE_URL for subpath testing.
  baseUrl: BASE_URL,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
      'zh-Hans': {
        label: '中文',
        htmlLang: 'zh-Hans',
        path: 'zh-Hans',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          sidebarItemsGenerator: async ({
            defaultSidebarItemsGenerator,
            ...args
          }: any) => {
            const items = await defaultSidebarItemsGenerator(args);
            return expandSidebarCategories(items);
          },
          lastVersion: 'current',
          versions: {
            current: {
              label: 'latest',
              badge: false,
            },
            '1.0.x': {
              label: '1.0.x',
              path: '1.0.x',
              banner: 'unmaintained',
              badge: false,
            },
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: false,
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {sync: true, converters: ['pnpm', 'yarn']},
            ],
          ],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogTitle: tdk.blog.title,
          blogDescription: tdk.blog.description,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: [
            // './src/css/codeblock.scss',
            './src/css/custom.scss',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    algolia: {
      // todo: test only, to be replaced
      appId: 'LIUME5J8UD',
      apiKey: 'b7d539514fa1d4e67dbbaf010aeb004c', //'56e68bd6f98ae749cbb893fb483e5284',
      indexName: 'webspatial',
      contextualSearch: false,
      searchParameters: {
        facetFilters: ['docusaurus_tag:docs-default-current'],
      },
    },
    liveCodeBlock: {
      /**
       * The position of the live playground, above or under the editor
       * Possible values: "top" | "bottom"
       */
      playgroundPosition: 'bottom',
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      // title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo.dark.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown',
          dropdownActiveClassDisabled: true,
          position: 'left',
          className: 'xheader-control xheader-version-switch',
        },
        {
          to: '/docs/introduction/getting-started',
          label: 'Docs',
          position: 'left',
          activeBasePath: '/docs/introduction',
          className: 'xheader-section-link',
        },
        {
          to: '/docs/concepts',
          label: 'Concepts',
          position: 'left',
          activeBasePath: '/docs/concepts',
          className: 'xheader-section-link',
        },
        {
          to: '/docs/api',
          label: 'API',
          position: 'left',
          activeBasePath: '/docs/api',
          className: 'xheader-section-link',
        },
        {
          type: 'localeDropdown',
          className: 'xheader-control xheader-locale-switch',
          position: 'right',
        },
        {
          href: 'https://github.com/webspatial/webspatial-sdk',
          // label: 'GitHub',
          h5Label: 'GitHub',
          className: 'xheader-social-link xheader-github-link',
          h5ClassName: '',
          position: 'right',
        },
        {
          href: 'https://discord.gg/nhFhSuhNF2',
          // label: 'Discord',
          h5Label: 'Discord',
          className: 'xheader-social-link xheader-discord-link',
          h5ClassName: '',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Features',
              to: '/docs/introduction/getting-started#features',
            },
            {
              label: 'Compatibility',
              to: '/docs/introduction/getting-started#supported-web-projects',
            },
            {
              label: 'Setup',
              to: '/docs/introduction/getting-started#installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/webspatial/webspatial-sdk/issues',
            },
            {
              label: 'Join Discord',
              href: 'https://discord.gg/nhFhSuhNF2',
            },
            {
              label: 'Watch on YouTube',
              href: 'https://www.youtube.com/@WebSpatial',
            },
          ],
        },
        {
          title: 'News',
          items: [
            {
              label: 'Releases',
              href: 'https://github.com/webspatial/webspatial-sdk/releases',
            },
            {
              label: 'Blog',
              className: 'disabled',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Released under the MIT License. Copyright © ${new Date().getFullYear()} WebSpatial`,
    },
    prism: {
      theme: darkTheme, // lightTheme, //emptyTheme,
      darkTheme: darkTheme, //emptyTheme,
      // theme: prismThemes.github,
      // darkTheme: prismThemes.gruvboxMaterialDark,
      additionalLanguages: ['diff', 'json5', 'ini'],
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: {start: 'highlight-start', end: 'highlight-end'},
        },
        {
          className: 'code-block-diff-add-line',
          line: 'diff-add',
        },
        {
          className: 'code-block-diff-remove-line',
          line: 'diff-remove',
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
