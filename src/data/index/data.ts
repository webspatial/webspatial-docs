import {translate} from '@docusaurus/Translate';
import {getFakeImg} from '@site/src/utils/imgUtils';

const t = (id: string, message: string) =>
  translate({
    id,
    message,
  });

export default {
  banner: {
    title: t('homepage.banner.title', 'Bring Your Web to Space.'),
    desc: t(
      'homepage.banner.desc',
      'Bring native-level spatial UI capabilities and a new development paradigm to widely adopted open Web technologies, helping the mainstream Web ecosystem and Web developers move into the era of spatial computing and multimodal AI.',
    ),
    imgUrl: getFakeImg(1280, 1280),
    button: {
      text: t('homepage.banner.button', 'Getting Started'),
      url: '/docs/introduction/getting-started',
    },
  },
  section1: {
    title: t(
      'homepage.section1.title',
      'One Web Stack, From Screen to Spatial',
    ),
    desc: t(
      'homepage.section1.desc',
      'Build with the web stack you already know: keep your 2D UI on desktop and mobile screens, and adapt it into Spatialized UI on supported spatial-computing devices.',
    ),
    children: [
      {
        title: t('homepage.section1.largeScreen', 'Large Screen'),
        imgUrl: '/video/large.mp4', //getFakeImg(800, 400),
      },
      {
        title: t('homepage.section1.smallScreen', 'Small Screen'),
        imgUrl: '/video/small.mp4', //getFakeImg(700, 500),
      },
      {
        title: 'visionOS',
        imgUrl: '/video/visionOS.mp4', // getFakeImg(600, 400),
      },
      {
        title: 'PICO OS',
        imgUrl: getFakeImg(600, 400),
        desc: t('homepage.section1.comingSoon', 'Coming soon'),
        disable: true,
      },
    ],
  },
  section2: {
    title: t(
      'homepage.section2.title',
      'Empower Spatial Creativity and Expand Your Web from 2D to 3D',
    ),
    desc: '',
    children: [
      {
        title: t(
          'homepage.section2.card1.title',
          'Split the Web Page, Free the UI',
        ),
        desc: t(
          'homepage.section2.card1.desc',
          'Break the crowded, solid-backed web page into independent panels that hover in space, removing the frame so translucent UI lives naturally over the real world.',
        ),
        imgUrl: ['/img/index-s2o/pc/a1.png', '/img/index-s2o/pc/a2.png'], //getFakeImg(600, 400),
        imgUrlh5: ['/img/index-s2o/h5/a1.png', '/img/index-s2o/h5/a2.png'], //getFakeImg(600, 400),
        imgUrlPad: ['/img/index-s2o/pad/a1.png', '/img/index-s2o/pad/a2.png'], //getFakeImg(600, 400),
        url: '/docs/introduction/getting-started#webspatial-api',
      },
      {
        title: t(
          'homepage.section2.card2.title',
          'Elevate HTML Elements, Unlock Depth',
        ),
        desc: t(
          'homepage.section2.card2.desc',
          'Move any HTML element off the flat page—whether static or animated—and position or reshape it along the Z-axis, giving your interface true depth beyond width and height.',
        ),
        imgUrl: ['/img/index-s2o/pc/b1.png', '/img/index-s2o/pc/b2.png'], //getFakeImg(600, 400),
        imgUrlh5: ['/img/index-s2o/h5/b1.png', '/img/index-s2o/h5/b2.png'], //getFakeImg(600, 400),
        imgUrlPad: ['/img/index-s2o/pad/b1.png', '/img/index-s2o/pad/b2.png'], //getFakeImg(600, 400),
        url: '/docs/introduction/getting-started#webspatial-api',
      },
      {
        title: t(
          'homepage.section2.card3.title',
          'Multiple Spatial Scenes, Native Spatial Power',
        ),
        desc: t(
          'homepage.section2.card3.desc',
          'Upgrade the multiple webpages into OS-managed spatial scene containers, so they can run as independent spatial app and automatically gain spatial-computing capabilities.',
        ),
        imgUrl: ['/img/index-s2o/pc/c1.png', '/img/index-s2o/pc/c2.png'], // getFakeImg(600, 400),
        imgUrlh5: ['/img/index-s2o/h5/c1.png', '/img/index-s2o/h5/c2.png'], // getFakeImg(600, 400),
        imgUrlPad: ['/img/index-s2o/pad/c1.png', '/img/index-s2o/pad/c2.png'], // getFakeImg(600, 400),
        url: '/docs/introduction/getting-started#webspatial-api',
      },
      {
        title: t(
          'homepage.section2.card4.title',
          'Add True 3D Content, Blend Dimensions',
        ),
        desc: t(
          'homepage.section2.card4.desc',
          'Introduce volumetric 3D elements that nest and layout seamlessly with 2D elements, then drive them with the 3D engine to host dynamic, interactive 3D content.',
        ),
        imgUrl: ['/img/index-s2o/pc/d1.png', '/img/index-s2o/pc/d2.png'],
        imgUrlh5: ['/img/index-s2o/h5/d1.png', '/img/index-s2o/h5/d2.png'],
        imgUrlPad: ['/img/index-s2o/pad/d1.png', '/img/index-s2o/pad/d2.png'],
        url: '/docs/introduction/getting-started#webspatial-api',
      },
    ],
  },
  section3: {
    title: t('homepage.section3.title', 'Keep Coding Web, Ship Spatial'),
    desc: t(
      'homepage.section3.desc',
      'Keep coding with React, CSS, JS and the web-dev tools you already know. WebSpatial extends your existing web stack with a minimal set of new spatial APIs, integrates into standard Web projects, and unlocks native spatial capabilities with a small set of explicit code changes.',
    ),
    children: [
      {
        title: t('homepage.section3.card.title', 'Start with What You Know'),
        imgUrl: '/img/index-code/code1.jpg', //getFakeImg(600, 400),
        url: '/docs/api/react-sdk/css-api/back',
      },
      {
        title: t('homepage.section3.card.title', 'Start with What You Know'),
        imgUrl: '/img/index-code/code2.jpg', //getFakeImg(600, 400),
        url: '/docs/api/react-sdk/css-api/transform',
      },
      {
        title: t('homepage.section3.card.title', 'Start with What You Know'),
        imgUrl: '/img/index-code/code3.jpg', //getFakeImg(600, 500),
        url: '/docs/api/react-sdk/js-api/initScene',
      },
      {
        title: t('homepage.section3.card.title', 'Start with What You Know'),
        imgUrl: '/img/index-code/code4.jpg', //getFakeImg(600, 600),
        url: '/docs/api/react-sdk/manifest-options/main-scene',
      },
    ],
  },
  section4: {
    title: t('homepage.section4.title', 'Explore the WebSpatial Toolkit'),
    desc: t(
      'homepage.section4.desc',
      'Everything you need to ship spatial apps, built on the tools you already use.',
    ),
    children: [
      {
        title: 'WebSpatial API',
        desc: t(
          'homepage.section4.card1.desc',
          'An open, minimal extension to HTML, CSS, and JS that adds spatial powers like elevation, multi-scenes, and 3D containers.',
        ),
        moreUrl: '/docs/introduction/getting-started#webspatial-api',
        background:
          'radial-gradient(103.73% 103.73% at 50% -3.73%, rgba(78, 59, 246, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%), #191919',
      },
      {
        title: 'WebSpatial SDK',
        desc: t(
          'homepage.section4.card2.desc',
          'A library that integrates into React projects to unlock WebSpatial APIs, and lets you build spatial apps with the same React components and ecosystem you already use.',
        ),
        moreUrl: '/docs/introduction/getting-started#webspatial-sdk',
        background:
          'radial-gradient(103.73% 103.73% at 50% -3.73%, rgba(117, 190, 255, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%), #171717',
      },
      {
        title: 'WebSpatial Builder',
        desc: t(
          'homepage.section4.card3.desc',
          'A CLI tool that packages WebSpatial-enabled React projects into installable native spatial apps, wrapping web code in a platform-specific App Shell that runs WebSpatial APIs.',
        ),
        moreUrl: '/docs/introduction/getting-started#step-2-optional-builder',
        background:
          'radial-gradient(103.73% 103.73% at 50% -3.73%, rgba(252, 184, 75, 0.16) 0%, rgba(0, 0, 0, 0.00) 100%), #171717',
      },
    ],
  },
  bottom: {
    title: t('homepage.bottom.title', 'Start building with WebSpatial'),
    imgUrl: '/img/bottom.png', //getFakeImg(600, 400),
    children: [
      {
        title: t('homepage.bottom.gettingStarted', 'Getting Started'),
        url: '/docs/introduction/getting-started',
      },
      {
        title: t('homepage.bottom.concept', 'Concept'),
        url: '/docs/concepts/',
      },
    ],
  },
};
