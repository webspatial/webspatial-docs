---
sidebar_position: 1
description: 'Mark JSX elements so the WebSpatial SDK can turn them into spatialized HTML elements.'
---

# JSX Markers

The [WebSpatial SDK](../../../introduction/getting-started.md#webspatial-sdk) can turn most ordinary HTML elements into [spatialized HTML elements](../../../concepts/spatialized-html-elements.md), but for performance, compatibility with the open-source ecosystem, and similar reasons, developers currently need to add a special marker to these HTML elements in JSX code.

`enable-xr` is the only marker a typical application needs. Once an element is marked, you update it with normal React and CSS patterns. `enable-xr-monitor` is an optional compatibility marker for one specific layout scenario, described [below](#enable-xr-monitor).

## `enable-xr`

This special marker turns an HTML element into a spatialized HTML element.

To remain compatible with third-party open-source libraries, the SDK supports three marking styles:

1. Pass the `enable-xr` attribute as an HTML attribute on the element:

```html
<div className="card" enable-xr></div>
```

2. Add `__enableXr__` to the element's `className`:

```html
<div className="card __enableXr__"></div>
```

3. Add `enableXr: true` in the element's inline style:

```js
<div className="card" style={{ enableXr: true, marginTop: "10px" }}></div>
```

:::info[What this enables on `<Model>`]
Using this marker on [`<Model>`](./Model.md) upgrades the element from the Web standard model element, which can only render a 3D model inside a flat canvas, into a [static 3D container element](../../../concepts/3d-content-containers.md) that can render a 3D model in space.
:::

### Updating a spatialized element

A spatialized HTML element stays an ordinary element in the React tree and in the DOM. Change it the way you would change any other element:

```jsx
function Card({ raised }) {
  return (
    <div enable-xr className={raised ? "card card-raised" : "card"}>
      Hello
    </div>
  );
}
```

```css
.card {
  position: relative;
  --xr-background-material: translucent;
}

.card-raised {
  --xr-back: 50px;
  transform: rotateY(-10deg);
}
```

All of the following are supported:

- React state driving `className` or `style`
- CSS classes and stylesheet rules
- CSS custom properties such as [`--xr-back`](../css-api/back.md), in stylesheets or in `style`
- Writing through a React ref, for example `ref.current.style.transform = "..."` or `ref.current.classList.toggle("card-raised")`

The SDK automatically picks up changes to the element's own size, and changes to `class` and `style` on the element and on anything inside it. You do not need to notify the SDK or add any further marker for these updates. See [Spatialized HTML Elements](../../../concepts/spatialized-html-elements.md) for the general rules and [Spatial Transform](../css-api/transform.md#updating-the-transform) for transform-specific notes, including animation.

## `enable-xr-monitor`

`enable-xr-monitor` is an optional marker for one scenario. When something _outside_ a spatialized HTML element changes the page layout in a way that moves the element on the X/Y axes without changing the element's own size, the current WebSpatial SDK does not pick up the new position automatically. Typical triggers are a sibling being inserted or removed above the element, or the spacing of a parent element changing.

Adding `enable-xr-monitor` to a parent element tells the SDK to watch content changes inside that parent. When those changes affect the [size or X/Y layout position](../../../concepts/spatialized-html-elements.md) of a spatialized HTML element, the SDK re-synchronizes the spatialized HTML element.

```js
function CardList() {
  const [showFirstCard, setShowFirstCard] = useState(true);

  const onClick = () => {
    setShowFirstCard(prevState => !prevState);
  };

  return (
    <div enable-xr-monitor>
      {showFirstCard && <div>first card</div>}
      <div enable-xr>second card</div>
      <button onClick={onClick}>toggle</button>
    </div>
  );
}
```

When "first card" is removed, "second card" moves up along the Y axis, and the marker makes sure the spatialized element follows.

When to use it:

- **Not required for new applications by default.** Start with `enable-xr` only. Changes to the spatialized element itself, including its size, its `className` and `style`, and anything inside it, are detected without this marker.
- **Add it only when you observe the problem.** If a spatialized HTML element keeps its old position after a layout change that happened outside it, add `enable-xr-monitor` to the nearest parent that contains both the changing content and the spatialized element.
- **Keep it narrow.** The marker observes every content change inside its subtree, so apply it to the affected container rather than to the whole app.
- **The requirement depends on the SDK version, not on your code.** Whether this marker is needed for a given layout change is a property of the WebSpatial SDK release you use, not part of the WebSpatial programming model. The marker remains supported, so leaving it in place is always safe.

:::info[Existing applications]
Existing `enable-xr` code continues to work unchanged. Existing `enable-xr-monitor` usage does not need to be removed and keeps working on current SDK versions. New code should only add it for the scenario described above, and you can remove it from your own code once the SDK version you target no longer needs it for your layout.
:::
