const fs = require('fs');
const path = require('path');

const DOCS_ROUTE_BASE = '/docs';
const MARKDOWN_EXTENSION = '.md';
const SUMMARY_OUTPUT_FILE = 'llms.txt';
const FULL_OUTPUT_FILE = 'llms-full.txt';

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, '\n');
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeRoutePath(value) {
  if (!value || value === '/') {
    return '/';
  }

  const normalized = `/${value}`.replace(/\/+/g, '/');
  return normalized === '/' ? normalized : normalized.replace(/\/$/, '');
}

function joinSiteUrl(siteUrl, baseUrl, routePath) {
  const normalizedRoute = normalizeRoutePath(routePath);
  const normalizedBaseUrl =
    baseUrl && baseUrl !== '/' ? `/${trimSlashes(baseUrl)}` : '';
  const origin = (siteUrl || '').replace(/\/$/, '');

  return origin
    ? `${origin}${normalizedBaseUrl}${normalizedRoute}`
    : `${normalizedBaseUrl}${normalizedRoute}`;
}

function toMarkdownRoutePath(routePath) {
  return `${normalizeRoutePath(routePath)}${MARKDOWN_EXTENSION}`;
}

function joinMarkdownUrl(siteMetadata, routePath, hash = '') {
  const markdownRoute = toMarkdownRoutePath(routePath);
  const routeWithHash = hash ? `${markdownRoute}#${hash}` : markdownRoute;

  return joinSiteUrl(siteMetadata.url, siteMetadata.baseUrl, routeWithHash);
}

function splitMarkdownTarget(target) {
  const hashIndex = target.indexOf('#');

  if (hashIndex === -1) {
    return {targetPath: target, targetHash: ''};
  }

  return {
    targetPath: target.slice(0, hashIndex),
    targetHash: target.slice(hashIndex + 1),
  };
}

function isDocsRoutePath(value) {
  const normalized = normalizeRoutePath(value.replace(/\.(md|mdx)$/i, ''));
  return (
    normalized === DOCS_ROUTE_BASE ||
    normalized.startsWith(`${DOCS_ROUTE_BASE}/`)
  );
}

function hasNonMarkdownExtension(targetPath) {
  return (
    !!path.posix.extname(targetPath) &&
    !/\.(md|mdx)$/i.test(targetPath)
  );
}

function parseScalar(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function extractFrontMatter(rawContent) {
  const normalized = normalizeNewlines(rawContent);
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return {frontMatter: {}, body: normalized};
  }

  const frontMatter = {};

  for (const line of match[1].split('\n')) {
    const propertyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!propertyMatch) {
      continue;
    }

    frontMatter[propertyMatch[1]] = parseScalar(propertyMatch[2]);
  }

  return {
    frontMatter,
    body: normalized.slice(match[0].length),
  };
}

function getFirstMarkdownHeading(content) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  return headingMatch ? normalizeWhitespace(headingMatch[1]) : '';
}

function stripLeadingHeading(content) {
  return content.trimStart().replace(/^#\s+.+\n+/, '').trim();
}

function isPublished(frontMatter) {
  return !frontMatter.draft && !frontMatter.hidden && !frontMatter.unlisted;
}

function toDocRoute(relativePath) {
  const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, '');
  const withoutIndex = withoutExtension.replace(/\/index$/i, '');

  return normalizeRoutePath(
    withoutIndex ? `${DOCS_ROUTE_BASE}/${withoutIndex}` : DOCS_ROUTE_BASE,
  );
}

function humanizeFallbackTitle(relativePath) {
  const filename = path.basename(relativePath, path.extname(relativePath));
  return filename.replace(/[-_]/g, ' ');
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readCategoryMetadata(dirPath) {
  const categoryFilePath = path.join(dirPath, '_category_.json');

  if (!fs.existsSync(categoryFilePath)) {
    return null;
  }

  const categoryData = readJsonFile(categoryFilePath);
  const generatedIndexSlug =
    categoryData.link?.type === 'generated-index' &&
    typeof categoryData.link.slug === 'string'
      ? normalizeRoutePath(`${DOCS_ROUTE_BASE}${categoryData.link.slug}`)
      : null;

  return {
    label: categoryData.label || path.basename(dirPath),
    position:
      typeof categoryData.position === 'number'
        ? categoryData.position
        : Number.POSITIVE_INFINITY,
    description: normalizeWhitespace(categoryData.link?.description || ''),
    routePath: generatedIndexSlug,
  };
}

function compareItems(a, b) {
  const aPosition =
    typeof a.position === 'number' ? a.position : Number.POSITIVE_INFINITY;
  const bPosition =
    typeof b.position === 'number' ? b.position : Number.POSITIVE_INFINITY;

  if (aPosition !== bPosition) {
    return aPosition - bPosition;
  }

  if (a.type !== b.type) {
    return a.type === 'category' ? -1 : 1;
  }

  const aName = a.title || a.label || '';
  const bName = b.title || b.label || '';

  return aName.localeCompare(bName);
}

function rewriteRelativeDocLinks(content, docNode, siteMetadata) {
  const segments = content.split(/(```[\s\S]*?```)/g);

  return segments
    .map((segment) => {
      if (segment.startsWith('```')) {
        return segment;
      }

      return segment.replace(
        /(!?\[[^\]]*]\()([^)]+)(\))/g,
        (fullMatch, prefix, target, suffix) => {
          const trimmedTarget = target.trim();
          const {targetPath, targetHash} = splitMarkdownTarget(trimmedTarget);
          const currentDocUrl = joinMarkdownUrl(siteMetadata, docNode.routePath);

          if (trimmedTarget.startsWith('#')) {
            return `${prefix}${currentDocUrl}${trimmedTarget}${suffix}`;
          }

          if (
            /^(https?:|mailto:|tel:|data:|javascript:)/i.test(targetPath)
          ) {
            return fullMatch;
          }

          if (targetPath.startsWith('/')) {
            if (
              !isDocsRoutePath(targetPath) ||
              hasNonMarkdownExtension(targetPath)
            ) {
              return fullMatch;
            }

            const resolvedRoute = normalizeRoutePath(
              targetPath.replace(/\.(md|mdx)$/i, ''),
            );
            const absoluteUrl = joinMarkdownUrl(
              siteMetadata,
              resolvedRoute,
              targetHash,
            );

            return `${prefix}${absoluteUrl}${suffix}`;
          }

          if (!targetPath) {
            return fullMatch;
          }

          if (hasNonMarkdownExtension(targetPath)) {
            return fullMatch;
          }

          const resolvedRelativePath = path.posix.normalize(
            path.posix.join(path.posix.dirname(docNode.relativePath), targetPath),
          );
          const resolvedRoute = toDocRoute(resolvedRelativePath);
          const absoluteUrl = joinMarkdownUrl(
            siteMetadata,
            resolvedRoute,
            targetHash,
          );

          return `${prefix}${absoluteUrl}${suffix}`;
        },
      );
    })
    .join('');
}

function readDocNode(filePath, relativePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const {frontMatter, body} = extractFrontMatter(rawContent);

  if (!isPublished(frontMatter)) {
    return null;
  }

  const content = stripLeadingHeading(body);
  const title =
    normalizeWhitespace(frontMatter.title || '') ||
    getFirstMarkdownHeading(body) ||
    humanizeFallbackTitle(relativePath);
  const description = normalizeWhitespace(frontMatter.description || '');

  return {
    type: 'doc',
    relativePath: relativePath.replace(/\\/g, '/'),
    routePath: toDocRoute(relativePath.replace(/\\/g, '/')),
    title,
    description,
    position:
      typeof frontMatter.sidebar_position === 'number'
        ? frontMatter.sidebar_position
        : Number.POSITIVE_INFINITY,
    content,
  };
}

function readCategoryNode(docsDir, dirPath) {
  const relativeDirPath = path.relative(docsDir, dirPath).replace(/\\/g, '/');
  const categoryMetadata = readCategoryMetadata(dirPath);
  const defaultLabel =
    relativeDirPath === '' ? 'Docs' : humanizeFallbackTitle(relativeDirPath);
  const children = [];

  for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
    if (entry.name === '_category_.json' || entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      children.push(readCategoryNode(docsDir, entryPath));
      continue;
    }

    if (!/\.(md|mdx)$/i.test(entry.name)) {
      continue;
    }

    const relativePath = path.relative(docsDir, entryPath);
    const docNode = readDocNode(entryPath, relativePath);
    if (docNode) {
      children.push(docNode);
    }
  }

  children.sort(compareItems);

  return {
    type: 'category',
    label: categoryMetadata?.label || defaultLabel,
    description: categoryMetadata?.description || '',
    routePath: categoryMetadata?.routePath || null,
    position: categoryMetadata?.position || Number.POSITIVE_INFINITY,
    children,
  };
}

function collectSummaryItems(sectionNode, breadcrumbs = []) {
  const items = [];

  if (sectionNode.routePath && sectionNode.description) {
    items.push({
      label:
        breadcrumbs.length === 0
          ? `${sectionNode.label} overview`
          : `${breadcrumbs.join(' / ')} overview`,
      routePath: sectionNode.routePath,
      description: sectionNode.description,
    });
  }

  for (const child of sectionNode.children) {
    if (child.type === 'doc') {
      items.push({
        label:
          breadcrumbs.length === 0
            ? child.title
            : `${breadcrumbs.join(' / ')} / ${child.title}`,
        routePath: child.routePath,
        description: child.description,
      });
      continue;
    }

    items.push(
      ...collectSummaryItems(child, [...breadcrumbs, child.label]),
    );
  }

  return items;
}

function renderSummaryLines(rootSections, siteMetadata) {
  const summaryFileUrl = joinSiteUrl(
    siteMetadata.url,
    siteMetadata.baseUrl,
    `/${FULL_OUTPUT_FILE}`,
  );
  const lines = [
    `# ${siteMetadata.title}`,
    '',
    `> ${siteMetadata.summary}`,
    '',
    'This file is a curated index of the latest English WebSpatial documentation for LLMs and coding agents.',
    'It excludes legacy 1.0.x docs and localized copies. Follow the linked Markdown pages for the authoritative source.',
    '',
  ];

  for (const sectionNode of rootSections) {
    lines.push(`## ${sectionNode.label}`, '');

    for (const item of collectSummaryItems(sectionNode)) {
      const itemUrl = joinMarkdownUrl(siteMetadata, item.routePath);
      const description = item.description
        ? `: ${item.description}`
        : '';

      lines.push(`- [${item.label}](${itemUrl})${description}`);
    }

    lines.push('');
  }

  lines.push('## Optional', '');
  lines.push(
    `- [Full merged latest English docs](${summaryFileUrl}): Single-file Markdown context with the full contents of the latest English docs merged inline.`,
  );
  lines.push('');

  return lines.join('\n');
}

function renderDocLines(docNode, headingLevel, siteMetadata) {
  const heading = '#'.repeat(headingLevel);
  const sourceUrl = joinMarkdownUrl(siteMetadata, docNode.routePath);
  const content = rewriteRelativeDocLinks(
    docNode.content,
    docNode,
    siteMetadata,
  );
  const lines = [`${heading} ${docNode.title}`, '', `Source: ${sourceUrl}`];

  if (docNode.description) {
    lines.push('', docNode.description);
  }

  if (content) {
    lines.push('', content);
  }

  lines.push('');

  return lines;
}

function renderCategoryLines(categoryNode, headingLevel, siteMetadata) {
  const lines = [];

  if (categoryNode.routePath && categoryNode.description) {
    const overviewHeading = '#'.repeat(headingLevel);
    const overviewUrl = joinMarkdownUrl(siteMetadata, categoryNode.routePath);

    lines.push(
      `${overviewHeading} ${categoryNode.label} overview`,
      '',
      `Source: ${overviewUrl}`,
      '',
      categoryNode.description,
      '',
    );
  }

  const childHeadingLevel = categoryNode.routePath ? headingLevel + 1 : headingLevel;

  for (const child of categoryNode.children) {
    if (child.type === 'doc') {
      lines.push(...renderDocLines(child, childHeadingLevel, siteMetadata));
      continue;
    }

    lines.push(...renderCategoryLines(child, childHeadingLevel, siteMetadata));
  }

  return lines;
}

function renderFullLines(rootSections, siteMetadata) {
  const summaryFileUrl = joinSiteUrl(
    siteMetadata.url,
    siteMetadata.baseUrl,
    `/${SUMMARY_OUTPUT_FILE}`,
  );
  const lines = [
    `# ${siteMetadata.title}`,
    '',
    `> ${siteMetadata.summary}`,
    '',
    'This file merges the latest English WebSpatial documentation into a single Markdown context.',
    'It excludes legacy 1.0.x docs and localized copies. For the lighter linked index, use llms.txt.',
    '',
    `Linked index: ${summaryFileUrl}`,
    '',
    '## Contents',
    '',
  ];

  for (const sectionNode of rootSections) {
    for (const item of collectSummaryItems(sectionNode)) {
      const itemUrl = joinMarkdownUrl(siteMetadata, item.routePath);
      const description = item.description
        ? `: ${item.description}`
        : '';

      lines.push(`- [${item.label}](${itemUrl})${description}`);
    }
  }

  lines.push('');

  for (const sectionNode of rootSections) {
    lines.push(`## ${sectionNode.label}`, '');
    lines.push(...renderCategoryLines(sectionNode, 3, siteMetadata));
  }

  return lines.join('\n');
}

function renderStandaloneDocMarkdown(docNode, siteMetadata) {
  const content = rewriteRelativeDocLinks(
    docNode.content,
    docNode,
    siteMetadata,
  );
  const lines = [`# ${docNode.title}`];

  if (docNode.description) {
    lines.push('', docNode.description);
  }

  if (content) {
    lines.push('', content);
  }

  return lines.join('\n');
}

function renderStandaloneCategoryMarkdown(categoryNode, siteMetadata) {
  const lines = [`# ${categoryNode.label} overview`];

  if (categoryNode.description) {
    lines.push('', categoryNode.description);
  }

  const childItems = categoryNode.children.flatMap((child) => {
    if (child.type === 'doc') {
      return [
        {
          label: child.title,
          routePath: child.routePath,
          description: child.description,
        },
      ];
    }

    return collectSummaryItems(child);
  });

  if (childItems.length > 0) {
    lines.push('', '## Contents', '');

    for (const item of childItems) {
      const itemUrl = joinMarkdownUrl(siteMetadata, item.routePath);
      const description = item.description
        ? `: ${item.description}`
        : '';

      lines.push(`- [${item.label}](${itemUrl})${description}`);
    }
  }

  return lines.join('\n');
}

function collectLlmsData(context) {
  const docsDir = path.join(context.siteDir, 'docs');
  const topLevelSections = fs
    .readdirSync(docsDir, {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => readCategoryNode(docsDir, path.join(docsDir, entry.name)))
    .sort(compareItems);
  const siteMetadata = {
    title: context.siteConfig.title || 'Documentation',
    summary: normalizeWhitespace(
      context.siteConfig.customFields?.llmsSummary ||
        'Latest English project documentation for AI systems.',
    ),
    url: context.siteConfig.url || '',
    baseUrl:
      context.siteConfig.customFields?.llmsBaseUrl ||
      context.siteConfig.baseUrl ||
      '/',
  };

  return {topLevelSections, siteMetadata};
}

function getBuildFilePathForRoute(outDir, baseUrl, routePath) {
  return path.join(
    outDir,
    trimSlashes(baseUrl || ''),
    trimSlashes(routePath),
  );
}

function writeMarkdownFilesForNode(node, outDir, outputBaseUrl, siteMetadata) {
  if (node.type === 'doc') {
    writeFile(
      getBuildFilePathForRoute(
        outDir,
        outputBaseUrl,
        toMarkdownRoutePath(node.routePath),
      ),
      renderStandaloneDocMarkdown(node, siteMetadata),
    );
    return;
  }

  if (node.routePath && node.description) {
    writeFile(
      getBuildFilePathForRoute(
        outDir,
        outputBaseUrl,
        toMarkdownRoutePath(node.routePath),
      ),
      renderStandaloneCategoryMarkdown(node, siteMetadata),
    );
  }

  for (const child of node.children) {
    writeMarkdownFilesForNode(child, outDir, outputBaseUrl, siteMetadata);
  }
}

function generateMarkdownFiles(context, outDir) {
  if (context.i18n.currentLocale !== context.i18n.defaultLocale) {
    return;
  }

  const {topLevelSections, siteMetadata} = collectLlmsData(context);
  const outputBaseUrl = context.siteConfig.baseUrl || context.baseUrl || '/';

  for (const sectionNode of topLevelSections) {
    writeMarkdownFilesForNode(
      sectionNode,
      outDir,
      outputBaseUrl,
      siteMetadata,
    );
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${content.trim()}\n`);
}

function generateLlmsFiles(context) {
  const staticDir = path.join(context.siteDir, 'static');
  const {topLevelSections, siteMetadata} = collectLlmsData(context);
  const summaryContent = renderSummaryLines(topLevelSections, siteMetadata);
  const fullContent = renderFullLines(topLevelSections, siteMetadata);

  writeFile(path.join(staticDir, SUMMARY_OUTPUT_FILE), summaryContent);
  writeFile(path.join(staticDir, FULL_OUTPUT_FILE), fullContent);
}

module.exports = function llmsPlugin(context) {
  return {
    name: 'webspatial-llms-plugin',

    async loadContent() {
      generateLlmsFiles(context);
      return null;
    },

    postBuild({outDir}) {
      generateMarkdownFiles(context, outDir);
    },

    extendCli(cli) {
      cli
        .command('generate-llms-files')
        .description(
          'Generate llms.txt and llms-full.txt from the latest English docs',
        )
        .action(() => {
          generateLlmsFiles(context);
        });
    },
  };
};

module.exports.generateLlmsFiles = generateLlmsFiles;
module.exports.generateMarkdownFiles = generateMarkdownFiles;
