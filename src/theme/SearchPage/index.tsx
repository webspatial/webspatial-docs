/* eslint-disable jsx-a11y/no-autofocus */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  HtmlClassNameProvider,
  isRegexpStringMatch,
  PageMetadata,
  usePluralForm,
  useSearchQueryString,
} from '@docusaurus/theme-common';
import clsx from 'clsx';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './styles.module.css';

const SEARCH_VERSION_QUERY_PARAM = 'version';
const LEGACY_VERSION = '1.0.x';

type SearchVersion = 'current' | typeof LEGACY_VERSION;

type AlgoliaConfig = {
  appId: string;
  apiKey: string;
  indexName: string;
  externalUrlRegex?: string;
  replaceSearchResultPathname?: {
    from: string;
    to: string;
  };
};

type SearchResultItem = {
  title: string;
  url: string;
  summary: string;
  breadcrumbs: string[];
};

type ResultState = {
  items: SearchResultItem[];
  query: string | null;
  totalResults: number | null;
  totalPages: number | null;
  lastPage: number | null;
  hasMore: boolean | null;
  loading: boolean | null;
};

type ResultAction =
  | {type: 'reset'}
  | {type: 'loading'}
  | {type: 'update'; value: ResultState}
  | {type: 'advance'};

function getSearchPageTitle(searchQuery: string | undefined): string {
  return searchQuery
    ? translate(
        {
          id: 'theme.SearchPage.existingResultsTitle',
          message: 'Search results for "{query}"',
          description: 'The search page title for non-empty query',
        },
        {
          query: searchQuery,
        },
      )
    : translate({
        id: 'theme.SearchPage.emptyResultsTitle',
        message: 'Search the documentation',
        description: 'The search page title for empty query',
      });
}

function useDocumentsFoundPlural() {
  const {selectMessage} = usePluralForm();

  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.SearchPage.documentsFound.plurals',
          description:
            'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One document found|{count} documents found',
        },
        {count},
      ),
    );
}

function useSearchVersion(): SearchVersion {
  const {search} = useLocation();
  const version = new URLSearchParams(search).get(SEARCH_VERSION_QUERY_PARAM);

  return version === LEGACY_VERSION ? LEGACY_VERSION : 'current';
}

function getVersionSearchTag(version: SearchVersion): string {
  return version === LEGACY_VERSION
    ? 'docs-default-1.0.x'
    : 'docs-default-current';
}

function replacePathname(
  pathname: string,
  replaceSearchResultPathname: AlgoliaConfig['replaceSearchResultPathname'],
): string {
  return replaceSearchResultPathname
    ? pathname.replaceAll(
        new RegExp(replaceSearchResultPathname.from, 'g'),
        replaceSearchResultPathname.to,
      )
    : pathname;
}

function withBaseUrl(pathname: string, baseUrl: string): string {
  if (baseUrl === '/') {
    return pathname;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  return pathname.startsWith(`${normalizedBaseUrl}/`)
    ? pathname
    : `${normalizedBaseUrl}${pathname}`;
}

function getInitialResultState(): ResultState {
  return {
    items: [],
    query: null,
    totalResults: null,
    totalPages: null,
    lastPage: null,
    hasMore: null,
    loading: null,
  };
}

function resultReducer(prevState: ResultState, action: ResultAction): ResultState {
  switch (action.type) {
    case 'reset':
      return getInitialResultState();
    case 'loading':
      return {...prevState, loading: true};
    case 'update':
      return {
        ...action.value,
        items:
          action.value.lastPage === 0
            ? action.value.items
            : prevState.items.concat(action.value.items),
      };
    case 'advance': {
      const hasMore = prevState.totalPages! > prevState.lastPage! + 1;

      return {
        ...prevState,
        lastPage: hasMore ? prevState.lastPage! + 1 : prevState.lastPage,
        hasMore,
      };
    }
    default:
      return prevState;
  }
}

function sanitizeValue(value: string): string {
  return value.replace(
    /algolia-docsearch-suggestion--highlight/g,
    'search-result-match',
  );
}

function getSearchResultTitleAndBreadcrumbs(hierarchy: {
  [key: string]: {value: string} | undefined;
}): {title: string; breadcrumbs: string[]} {
  const titles = Object.keys(hierarchy)
    .map((key) => hierarchy[key]?.value)
    .filter((value): value is string => Boolean(value))
    .map(sanitizeValue);
  const title = titles.pop() ?? '';

  return {
    title,
    breadcrumbs: titles,
  };
}

function SearchPageContent(): ReactNode {
  const {
    i18n: {currentLocale},
    siteConfig,
  } = useDocusaurusContext();
  const {
    appId,
    apiKey,
    indexName,
    externalUrlRegex,
    replaceSearchResultPathname,
  } = siteConfig.themeConfig.algolia as AlgoliaConfig;
  const documentsFoundPlural = useDocumentsFoundPlural();
  const searchVersion = useSearchVersion();
  const [searchQuery, setSearchQuery] = useSearchQueryString();
  const pageTitle = getSearchPageTitle(searchQuery);
  const [searchResultState, dispatch] = useReducer(
    resultReducer,
    undefined,
    getInitialResultState,
  );
  const facetFilters = useMemo(
    () => [`language:${currentLocale}`, `docusaurus_tag:${getVersionSearchTag(searchVersion)}`],
    [currentLocale, searchVersion],
  );
  const processSearchResultUrl = useCallback(
    (url: string): string => {
      let parsedURL: URL;

      try {
        parsedURL = new URL(url);
      } catch {
        return url;
      }

      if (isRegexpStringMatch(externalUrlRegex, parsedURL.href)) {
        return url;
      }

      const relativeUrl = `${parsedURL.pathname}${parsedURL.search}${parsedURL.hash}`;
      const replacedUrl = replacePathname(relativeUrl, replaceSearchResultPathname);

      return withBaseUrl(replacedUrl, siteConfig.baseUrl);
    },
    [externalUrlRegex, replaceSearchResultPathname, siteConfig.baseUrl],
  );
  const makeSearch = useCallback(
    async (page = 0, signal?: AbortSignal) => {
      const query = searchQuery ?? '';

      if (!query) {
        dispatch({type: 'reset'});
        return;
      }

      try {
        const response = await fetch(
          `https://${appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(
            indexName,
          )}/query`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Algolia-API-Key': apiKey,
              'X-Algolia-Application-Id': appId,
            },
            body: JSON.stringify({
              query,
              page,
              hitsPerPage: 15,
              advancedSyntax: true,
              facetFilters,
              attributesToSnippet: ['content:15'],
            }),
            signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Algolia search failed with ${response.status}`);
        }

        const results = (await response.json()) as {
          hits: {
            url: string;
            _highlightResult: {hierarchy: {[key: string]: {value: string}}};
            _snippetResult?: {content?: {value: string}};
          }[];
          nbHits: number;
          nbPages: number;
          page: number;
        };

        const items = results.hits.map(
          ({url, _highlightResult, _snippetResult = {}}) => {
            const {title, breadcrumbs} = getSearchResultTitleAndBreadcrumbs(
              _highlightResult.hierarchy,
            );

            return {
              title,
              url: processSearchResultUrl(url),
              summary: _snippetResult.content
                ? `${sanitizeValue(_snippetResult.content.value)}...`
                : '',
              breadcrumbs,
            };
          },
        );

        dispatch({
          type: 'update',
          value: {
            items,
            query,
            totalResults: results.nbHits,
            totalPages: results.nbPages,
            lastPage: results.page,
            hasMore: results.nbPages > results.page + 1,
            loading: false,
          },
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        // Keep the page usable if Algolia is temporarily unavailable.
        dispatch({
          type: 'update',
          value: {
            items: [],
            query,
            totalResults: 0,
            totalPages: 0,
            lastPage: page,
            hasMore: false,
            loading: false,
          },
        });
      }
    },
    [apiKey, appId, facetFilters, indexName, processSearchResultUrl, searchQuery],
  );

  useEffect(() => {
    dispatch({type: 'reset'});

    if (!searchQuery) {
      return undefined;
    }

    dispatch({type: 'loading'});
    const abortController = new AbortController();
    const timeout = window.setTimeout(() => {
      makeSearch(0, abortController.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      abortController.abort();
    };
  }, [makeSearch, searchQuery]);

  useEffect(() => {
    if (!searchResultState.lastPage || searchResultState.lastPage === 0) {
      return;
    }

    makeSearch(searchResultState.lastPage);
  }, [makeSearch, searchResultState.lastPage]);

  const [loaderRef, setLoaderRef] = useState<HTMLDivElement | null>(null);
  const prevY = useRef(0);
  const observer = useRef(
    ExecutionEnvironment.canUseIntersectionObserver &&
      new IntersectionObserver(
        (entries) => {
          const {
            isIntersecting,
            boundingClientRect: {y: currentY},
          } = entries[0]!;

          if (isIntersecting && prevY.current > currentY) {
            dispatch({type: 'advance'});
          }

          prevY.current = currentY;
        },
        {threshold: 1},
      ),
  );

  useEffect(() => {
    if (!loaderRef) {
      return undefined;
    }

    const currentObserver = observer.current;

    if (currentObserver) {
      currentObserver.observe(loaderRef);
      return () => currentObserver.unobserve(loaderRef);
    }

    return undefined;
  }, [loaderRef]);

  return (
    <Layout>
      <PageMetadata title={pageTitle} />

      <Head>
        <meta property="robots" content="noindex, follow" />
      </Head>

      <div className="container margin-vert--lg">
        <Heading as="h1">{pageTitle}</Heading>

        <form className="row" onSubmit={(e) => e.preventDefault()}>
          <div className={clsx('col', 'col--12', styles.searchQueryColumn)}>
            <input
              type="search"
              name="q"
              className={styles.searchQueryInput}
              placeholder={translate({
                id: 'theme.SearchPage.inputPlaceholder',
                message: 'Type your search here',
                description: 'The placeholder for search page input',
              })}
              aria-label={translate({
                id: 'theme.SearchPage.inputLabel',
                message: 'Search',
                description: 'The ARIA label for search page input',
              })}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>
        </form>

        <div className="row">
          <div className={clsx('col', 'col--8', styles.searchResultsColumn)}>
            {!!searchResultState.totalResults &&
              documentsFoundPlural(searchResultState.totalResults)}
          </div>

          <div className={clsx('col', 'col--4', styles.searchLogoColumn)}>
            <span>
              {translate({
                id: 'theme.SearchPage.algoliaLabel',
                message: 'Powered by',
                description:
                  'The text explain that the search powered by Algolia',
              })}
            </span>
            <Link
              to="https://www.algolia.com/"
              aria-label={translate({
                id: 'theme.SearchPage.algoliaLabel',
                message: 'Powered by Algolia',
                description: 'The description label for Algolia mention',
              })}>
              Algolia
            </Link>
          </div>
        </div>

        {searchResultState.items.length > 0 ? (
          <main>
            {searchResultState.items.map(
              ({title, url, summary, breadcrumbs}, i) => (
                <article key={i} className={styles.searchResultItem}>
                  <Heading as="h2" className={styles.searchResultItemHeading}>
                    <Link to={url} dangerouslySetInnerHTML={{__html: title}} />
                  </Heading>

                  {breadcrumbs.length > 0 && (
                    <nav aria-label="breadcrumbs">
                      <ul
                        className={clsx(
                          'breadcrumbs',
                          styles.searchResultItemPath,
                        )}>
                        {breadcrumbs.map((html, index) => (
                          <li
                            key={index}
                            className="breadcrumbs__item"
                            dangerouslySetInnerHTML={{__html: html}}
                          />
                        ))}
                      </ul>
                    </nav>
                  )}

                  {summary && (
                    <p
                      className={styles.searchResultItemSummary}
                      dangerouslySetInnerHTML={{__html: summary}}
                    />
                  )}
                </article>
              ),
            )}
          </main>
        ) : (
          [
            searchQuery && !searchResultState.loading && (
              <p key="no-results">
                <Translate
                  id="theme.SearchPage.noResultsText"
                  description="The paragraph for empty search result">
                  No results were found
                </Translate>
              </p>
            ),
            !!searchResultState.loading && (
              <div key="spinner" className={styles.loadingSpinner} />
            ),
          ]
        )}

        {searchResultState.hasMore && (
          <div className={styles.loader} ref={setLoaderRef}>
            <Translate
              id="theme.SearchPage.fetchingNewResults"
              description="The paragraph for fetching new results">
              Fetching new results...
            </Translate>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function SearchPage(): ReactNode {
  return (
    <HtmlClassNameProvider className="search-page-wrapper">
      <SearchPageContent />
    </HtmlClassNameProvider>
  );
}
