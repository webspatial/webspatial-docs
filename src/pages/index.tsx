import React from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useColorMode, type ColorMode} from '@docusaurus/theme-common';

import styles from './index.module.scss';
import Banner from './_components/Banner';
import Section from './_components/Section';
import data from '../data/index/data';
import Bottom from './_components/Bottom';
import Slider from './_components/Slider';
import CardList from './_components/CardList';
import SliderB from './_components/SliderB';
import CardListMore from './_components/CardListMore';
import {
  getHomepageHeroPreloadEntries,
  HOMEPAGE_HERO_STAGE_BREAKPOINT,
  withBaseUrl,
} from './_components/homepageMedia';

const PRELOAD_TIMEOUT_MS = 15000;

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finalize = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    image.decoding = 'async';
    image.addEventListener('load', finalize, {once: true});
    image.addEventListener('error', finalize, {once: true});
    image.src = url;

    if (image.complete) {
      finalize();
    }
  });
}

function preloadVideo(url: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    let settled = false;

    const finalize = () => {
      if (settled) {
        return;
      }

      settled = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
      resolve();
    };

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadeddata', finalize, {once: true});
    video.addEventListener('error', finalize, {once: true});
    video.src = url;
    video.load();

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      finalize();
    }
  });
}

function settleWithTimeout(task: Promise<unknown>, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);

    task.finally(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

function useHomepagePreloadProgress() {
  const {siteConfig} = useDocusaurusContext();
  const [progress, setProgress] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;
    let loadedWeight = 0;

    setProgress(0);
    setIsReady(false);

    const isLandscapeStage = window.matchMedia(
      `(min-width: ${HOMEPAGE_HERO_STAGE_BREAKPOINT}px)`,
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const entries = getHomepageHeroPreloadEntries(
      isLandscapeStage,
      !prefersReducedMotion,
    ).map((entry) => ({
      ...entry,
      url: withBaseUrl(siteConfig.baseUrl, entry.path),
    }));

    if (entries.length === 0) {
      setProgress(1);
      setIsReady(true);
      return undefined;
    }

    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

    const markComplete = (weight: number) => {
      loadedWeight += weight;

      if (cancelled) {
        return;
      }

      setProgress(Math.min(loadedWeight / totalWeight, 1));
    };

    void Promise.all(
      entries.map(async (entry) => {
        const task =
          entry.kind === 'video'
            ? preloadVideo(entry.url)
            : preloadImage(entry.url);

        await settleWithTimeout(task, PRELOAD_TIMEOUT_MS);
        markComplete(entry.weight);
      }),
    ).then(() => {
      if (cancelled) {
        return;
      }

      window.requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        setProgress(1);
        setIsReady(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [siteConfig.baseUrl]);

  return {progress, isReady};
}

function HomepageLoadingScreen({
  progress,
  hidden,
}: {
  progress: number;
  hidden: boolean;
}): ReactNode {
  const loadingTitle = translate({
    id: 'homepage.loading.title',
    message: 'Loading WebSpatial Homepage',
  });
  const loadingDescription = translate({
    id: 'homepage.loading.description',
    message: 'Please wait a moment while the homepage gets ready.',
  });
  const progressPercent = Math.round(progress * 100);

  return (
    <div
      className={clsx(
        styles.loadingScreen,
        hidden && styles.loadingScreenHidden,
      )}
      role="status"
      aria-live="polite"
      aria-hidden={hidden}>
      <div className={styles.loadingPanel}>
        <div className={styles.loadingEyebrow}>WebSpatial</div>
        <div className={styles.loadingTitle}>{loadingTitle}</div>
        <div className={styles.loadingDescription}>{loadingDescription}</div>
        <div
          className={styles.loadingBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}>
          <div
            className={styles.loadingBarFill}
            style={{width: `${progressPercent}%`}}
          />
        </div>
        <div className={styles.loadingMeta}>
          <span>{progressPercent}%</span>
        </div>
      </div>
    </div>
  );
}

function HomepageColorMode(): ReactNode {
  const {setColorMode} = useColorMode();

  React.useEffect(() => {
    const setTransientColorMode = setColorMode as unknown as (
      colorMode: ColorMode | null,
      options?: {persist?: boolean},
    ) => void;

    // `useColorMode()` intentionally lags during hydration. Read the current
    // DOM attribute so we restore the user's real choice when leaving home.
    const previousColorModeChoice = (() => {
      const themeChoice =
        document.documentElement.getAttribute('data-theme-choice');
      if (themeChoice === 'light' || themeChoice === 'dark') {
        return themeChoice;
      }
      return null;
    })();

    setTransientColorMode('dark', {persist: false});

    return () => {
      setTransientColorMode(previousColorModeChoice, {persist: false});
    };
  }, [setColorMode]);

  return null;
}

export default function Home(): ReactNode {
  const title = 'WebSpatial';
  const description = translate({
    id: 'homepage.meta.description',
    message:
      'Build spatial HTML interfaces and 3D content with the WebSpatial React SDK. Explore supported runtimes, integration requirements, and visionOS hybrid app packaging.',
  });
  const {progress, isReady} = useHomepagePreloadProgress();

  React.useEffect(() => {
    if (typeof document === 'undefined' || isReady) {
      return undefined;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isReady]);

  return (
    <Layout title={title} description={description}>
      <HomepageColorMode />
      <noscript>
        <style>{`.${styles.loadingScreen}{display:none !important;}`}</style>
      </noscript>
      <HomepageLoadingScreen progress={progress} hidden={isReady} />
      <div className={styles.pageShell}>
        <Banner />
        <main className={styles.mainWrap}>
          <Section
            title={data.section1.title}
            desc={
              <>
                {data.section1.desc}{' '}
                <Link to="/docs/introduction/getting-started#supported-platforms">
                  {translate({
                    id: 'homepage.section1.support',
                    message: 'View version requirements and platform limitations',
                  })}
                </Link>
              </>
            }>
            <Slider data={data.section1.children} />
          </Section>

          <Section title={data.section2.title} desc={data.section2.desc}>
            <CardList data={data.section2.children} />
          </Section>

          <Section title={data.section3.title} desc={data.section3.desc}>
            <SliderB data={data.section3.children} />
          </Section>

          <Section title={data.section4.title} desc={data.section4.desc}>
            <CardListMore data={data.section4.children} />
          </Section>
          <Bottom />
        </main>
      </div>
    </Layout>
  );
}
