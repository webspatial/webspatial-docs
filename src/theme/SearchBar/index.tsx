import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useSearchLinkCreator} from '@docusaurus/theme-common';
import OriginalSearchBar from '@theme-original/SearchBar';
import React, {useMemo, type ReactNode} from 'react';

const CURRENT_SEARCH_TAG = 'docs-default-current';
const LEGACY_SEARCH_TAG = 'docs-default-1.0.x';
const LEGACY_DOCS_PREFIX = '/docs/1.0.x';

function stripBaseUrl(pathname: string, baseUrl: string): string {
  if (baseUrl === '/') {
    return pathname;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  if (pathname === normalizedBaseUrl) {
    return '/';
  }

  if (pathname.startsWith(`${normalizedBaseUrl}/`)) {
    return pathname.slice(normalizedBaseUrl.length);
  }

  return pathname;
}

function stripLocalePrefix(
  pathname: string,
  locales: string[],
  defaultLocale: string,
): string {
  for (const locale of locales) {
    if (locale === defaultLocale) {
      continue;
    }

    const localePrefix = `/${locale}`;

    if (pathname === localePrefix) {
      return '/';
    }

    if (pathname.startsWith(`${localePrefix}/`)) {
      return pathname.slice(localePrefix.length);
    }
  }

  return pathname;
}

function isLegacyDocsPath(
  pathname: string,
  baseUrl: string,
  locales: string[],
  defaultLocale: string,
): boolean {
  const sitePath = stripBaseUrl(pathname, baseUrl);
  const localeAgnosticPath = stripLocalePrefix(sitePath, locales, defaultLocale);

  return (
    localeAgnosticPath === LEGACY_DOCS_PREFIX ||
    localeAgnosticPath.startsWith(`${LEGACY_DOCS_PREFIX}/`)
  );
}

function appendSearchVersion(url: string, version: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}version=${encodeURIComponent(version)}`;
}

function closeDocSearchModal(): void {
  document.querySelector<HTMLButtonElement>('.DocSearch-Cancel')?.click();
}

function ResultsFooter({
  state,
  version,
}: {
  state: {query: string; context: {nbHits: number}};
  version: string;
}): ReactNode {
  const createSearchLink = useSearchLinkCreator();
  const searchLink = appendSearchVersion(createSearchLink(state.query), version);

  return (
    <Link to={searchLink} onClick={closeDocSearchModal}>
      <Translate
        id="theme.SearchBar.seeAll"
        values={{count: state.context.nbHits}}>
        {'See all {count} results'}
      </Translate>
    </Link>
  );
}

export default function SearchBar(props: Record<string, unknown>): ReactNode {
  const {pathname} = useLocation();
  const {
    i18n: {currentLocale},
    siteConfig,
  } = useDocusaurusContext();
  const isLegacy = isLegacyDocsPath(
    pathname,
    siteConfig.baseUrl,
    siteConfig.i18n.locales,
    siteConfig.i18n.defaultLocale,
  );
  const version = isLegacy ? '1.0.x' : 'current';
  const searchTag = isLegacy ? LEGACY_SEARCH_TAG : CURRENT_SEARCH_TAG;
  const resultsFooterComponent = useMemo(
    () =>
      ({state}: {state: {query: string; context: {nbHits: number}}}) =>
        <ResultsFooter state={state} version={version} />,
    [version],
  );

  return (
    <OriginalSearchBar
      {...props}
      contextualSearch={false}
      resultsFooterComponent={resultsFooterComponent}
      searchParameters={{
        facetFilters: [`language:${currentLocale}`, `docusaurus_tag:${searchTag}`],
      }}
    />
  );
}
