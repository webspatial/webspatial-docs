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
      'Build spatial HTML interfaces and 3D content with React, CSS, and JavaScript using the WebSpatial SDK and a supported runtime.',
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
      'Bring spatial experiences to your web app.',
    ),
    desc: t(
      'homepage.section1.desc',
      'Spatial features run in packaged visionOS apps and PICO OS 6 standalone Web Apps. Available capabilities depend on SDK and runtime versions. Test your 2D experience in desktop and mobile browsers.',
    ),
    children: [
      {
        title: t('homepage.section1.largeScreen', 'Desktop Web'),
        imgUrl: '/video/large.mp4', //getFakeImg(800, 400),
      },
      {
        title: t('homepage.section1.smallScreen', 'Mobile Web'),
        imgUrl: '/video/small.mp4', //getFakeImg(700, 500),
      },
      {
        title: t('homepage.section1.visionOS', 'visionOS Packaged App'),
        imgUrl: '/video/visionOS.mp4', // getFakeImg(600, 400),
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
          'Move supported HTML elements off the page plane and use Z-axis layout and transforms to add depth. Review the SDK limitations before integrating.',
        ),
        imgUrl: ['/img/index-s2o/pc/b1.png', '/img/index-s2o/pc/b2.png'], //getFakeImg(600, 400),
        imgUrlh5: ['/img/index-s2o/h5/b1.png', '/img/index-s2o/h5/b2.png'], //getFakeImg(600, 400),
        imgUrlPad: ['/img/index-s2o/pad/b1.png', '/img/index-s2o/pad/b2.png'], //getFakeImg(600, 400),
        url: '/docs/concepts/spatialized-html-elements#sdk-limitations',
      },
      {
        title: t(
          'homepage.section2.card3.title',
          'Multiple Spatial Scenes',
        ),
        desc: t(
          'homepage.section2.card3.desc',
          'Open pages in runtime-managed spatial scenes, with window behavior and scene options determined by the supported platform.',
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
          'Use Model and Reality SDK components to combine CSS layout with static models or dynamic 3D content in a supported WebSpatial Runtime.',
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
      'Use React, CSS, and JavaScript to combine spatial HTML, 3D content, and interactions. Integrate the SDK through your JSX runtime and SpatialBoot, then test the capabilities available on each target runtime.',
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
      'Explore the spatial APIs, React integration, and visionOS packaging tools.',
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
          'React components and JSX integration for spatial HTML and 3D content. Available APIs depend on the SDK, runtime version, and project configuration.',
        ),
        moreUrl: '/docs/introduction/getting-started#webspatial-sdk',
        background:
          'radial-gradient(103.73% 103.73% at 50% -3.73%, rgba(117, 190, 255, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%), #171717',
      },
      {
        title: 'WebSpatial Builder',
        desc: t(
          'homepage.section4.card3.desc',
          'A CLI tool that packages WebSpatial-enabled web projects into visionOS hybrid apps with a WebSpatial Runtime.',
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
