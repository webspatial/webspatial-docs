---
sidebar_position: 3
description: '使用统一渲染的 3D 引擎 API，在空间化容器中渲染动态 3D 内容。'
---

# `<Reality>`

## 概述 {#overview}

`<Reality>` 跟同为 [3D 内容容器元素](../../../concepts/3d-content-containers.md)的 [`<Model>`](./Model.md) 一样具备[空间化 HTML 元素的能力](../../../concepts/spatialized-html-elements.md)，作为空间中悬浮的 2D 面片使用，参与 HTML/CSS 布局，跟`<Model>` 的区别是，`<Reality>` 是[动态 3D 内容容器](../../../concepts/3d-content-containers.md#dynamic-3d-containers)，它的 3D 内容不是用预先制作好的、静态的 3D 模型文件来实现，而是在 2D 面片前方的局部空间中可以用[支持统一渲染的 3D Engine API](../../../concepts/3d-content-containers.md#3d-engine-api) 动态渲染任意 3D 内容。

这些 3D 引擎 API 被 WebSpatial SDK 作为 React 组件提供：

```js
import {
  Reality,
  Material,
  ModelAsset,
  AttachmentAsset,
  World,
  Entity,
  Box,
  Sphere,
  Plane,
  Cone,
  Cylinder,
  ModelEntity,
  AttachmentEntity,
} from "@webspatial/react-sdk";
```

```js
<Reality style={{ width: "500px", height: "500px", "--xr-depth": 100 }}>
  <Material type="unlit" id="red" color="#ff0000" />
  <ModelAsset id="teapot" src="https://example.com/model.usdz" />
  <World>
    <Box materials={["red"]} width={0.2} height={0.2} depth={0.2} />
  </World>
</Reality>
```

## 场景图 {#scene-graph}

这些 3D 引擎 API 包含两类：

第一类是 [3D Entity](#3d-entity)，这种 React 组件只能在 `<World>`（也可写作 `<SceneGraph>`）里使用，`<World>` 是动态 3D 容器内所有 3D 内容的根节点。

第二类是 [3D 资产的声明](#3d-assets)，比如材质（`<Material>`），这种 React 组件只能作为 `<Reality>` 中的顶层子节点、在 `<World>` 外面使用，需要被 3D Entity 引用才能实际影响渲染结果。

## 3D 资产 {#3d-assets}

在 `<Reality>` 的顶层子节点中，可以包含以下 3D 资产声明：

1. 可以引用预先声明的材质。支持的材质类型见[材质](#materials)。

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="pbr" id="steel" color="#c0c0c0" metalness={1} roughness={0.2} />
  <World>
```

2. 可以声明 3D 模型文件。

```js
<Reality>
  <ModelAsset
    id="ship-blueprint"
    src="https://example.com/fighter.usdz"
    onLoad={() => {}}
    onError={() => {}} />
  <World>
```

3. 可以声明要附着在 Entity 上的 2D HTML/CSS 内容。见[附着实体](#attachment-entity)。

```js
<Reality>
  <AttachmentAsset id="info">
    <div style={{ width: '100%' }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
```

## 材质 {#materials}

材质作为 `<Reality>` 的顶层子节点声明一次，带有唯一的 `id`，然后可以被任意数量的 Entity 通过 `materials` 属性引用。挂载后修改材质的属性，会同时更新所有使用它的 Entity。

材质有两种类型。`<Material type="...">` 会分发到对应的专用组件，因此 `<Material type="unlit">` 等同于 `<UnlitMaterial>`，`<Material type="pbr">` 等同于 `<PBRMaterial>`。

```js
import { Material, UnlitMaterial, PBRMaterial, MaterialPresets } from "@webspatial/react-sdk";
```

### 无光照材质 {#unlit-material}

无光照（unlit）材质是平面着色的：它原样显示颜色或贴图，忽略场景光照。适合类 UI 的表面、标记物，以及任何需要在不同环境下看起来完全一致的内容。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 必填。Entity 在 `materials` 中引用的名称。 |
| `color` | `string` | CSS 颜色字符串，例如 `"#00ff00"`。 |
| `textureId` | `string` | 要显示在表面上的 [`<Texture>`](#textures) 的 `id`；此时 `color` 作为色调叠加。 |
| `transparent` | `boolean` | 开启 alpha 混合，使 `opacity` 生效。 |
| `opacity` | `number` | `0` 到 `1`。 |

```js
<Reality>
  <UnlitMaterial id="solid" color="#00ff00" />
  <UnlitMaterial id="glass" color="#0000ff" transparent opacity={0.5} />
  <World>
    <Box materials={["glass"]} width={0.2} height={0.2} depth={0.2} />
  </World>
</Reality>
```

### PBR 材质 {#pbr-material}

基于物理的渲染（PBR）材质会响应所在空间的光照，让表面呈现出金属、塑料、玻璃或哑光的质感。`metalness` 和 `roughness` 的约定与常见 3D 引擎一致。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | | 必填。Entity 在 `materials` 中引用的名称。 |
| `color` | `string` | `"#FFFFFF"` | 基础颜色，CSS 颜色字符串。设置了 `textureId` 时作为色调叠加。 |
| `textureId` | `string` | | 用作基础颜色贴图的 [`<Texture>`](#textures) 的 `id`。 |
| `metalness` | `number` | `0` | `0` 为非金属（电介质）表面，`1` 为完全金属。 |
| `roughness` | `number` | `0.5` | `0` 为镜面光滑，`1` 为完全粗糙（漫反射）。 |
| `transparent` | `boolean` | `false` | 开启 alpha 混合，使 `opacity` 生效。 |
| `opacity` | `number` | `1` | `0` 到 `1`。只在 `transparent` 为 `true` 时生效。 |

```js
<Reality>
  <PBRMaterial id="steel" color="#c0c0c0" metalness={1} roughness={0.2} />
  <PBRMaterial id="rubber" color="#222222" metalness={0} roughness={0.9} />
  <Material type="pbr" id="tinted-glass" color="#aaddff" roughness={0.05} transparent opacity={0.2} />
  <World>
    <Sphere radius={0.1} materials={["steel"]} position={{ x: -0.25, y: 0, z: 0 }} />
    <Sphere radius={0.1} materials={["rubber"]} />
    <Sphere radius={0.1} materials={["tinted-glass"]} position={{ x: 0.25, y: 0, z: 0 }} />
  </World>
</Reality>
```

#### 材质预设 {#material-presets}

`MaterialPresets` 是一个普通对象，提供调好的 `metalness` / `roughness`（glass 还包含 `transparent` / `opacity`）起始值。把预设展开到 PBR 材质上，再按需覆盖单个属性：

| 预设 | 目标质感 |
| --- | --- |
| `matte` | 木材、织物、纸张、混凝土 |
| `glossy` | 抛光塑料、漆面 |
| `plastic` | 一般塑料表面 |
| `metal` | 铬、钢、铝 |
| `glass` | 窗户、瓶子、镜片（透明） |

```js
<PBRMaterial id="car-paint" {...MaterialPresets.metal} color="#c0392b" />
<PBRMaterial id="window" {...MaterialPresets.glass} />
```

预设不包含 `color` 和 `textureId`；它们是纯数据，可以在 JavaScript 中读取或扩展。

### 贴图 {#textures}

贴图是作为 `<Reality>` 顶层子节点声明的图片，带有唯一的 `id`。两种材质都通过 `textureId` 引用它。

```js
<Reality>
  <Texture id="wood-grain" url="/textures/wood.jpg" onLoad={() => {}} onError={() => {}} />
  <PBRMaterial id="oak" textureId="wood-grain" {...MaterialPresets.matte} />
  <World>
    <Box materials={["oak"]} width={0.3} height={0.05} depth={0.3} />
  </World>
</Reality>
```

如果引用的贴图尚未加载完成或加载失败，材质会只用 `color` 渲染，并在贴图可用后自动应用它。

:::caution[PBR 材质的运行环境支持]
无光照材质在所有 WebSpatial Runtime 中都可用。PBR 材质需要更新的 WebSpatial Runtime，以及 `2.0.0` 之后发布的 `@webspatial/react-sdk` 版本；目前仅在 visionOS 上可用。声明 PBR 材质之前，先用 `WebSpatialRuntime.supports("Material", ["pbr"])` 检查，返回 `false` 时回退为无光照材质。不支持的运行环境如何渲染 PBR 材质没有定义。
:::

## 3D 实体 {#3d-entity}

3D Entity 组件不参与 HTML 布局，只在 `<Reality>` 容器内按照 3D 引擎体系来渲染，它们不支持 CSS 样式，而是采用 3D 引擎体系里的「Transform 属性」：

```js
<Entity
  // Position: x (left/right), y (down/up), z (away/toward)
  position={{ x: 0.1, y: -0.2, z: 0.3 }}

  // Rotation: degrees (360 = full turn)
  rotation={{ x: 0, y: 90, z: 0 }}  // 90° on Y-axis

  // Scale: 1 = normal, 2 = double, 0.5 = half
  scale={{ x: 1, y: 2, z: 1 }}  // stretched vertically
  >
```

Transform 属性默认使用 `<Reality>` 对应的 2D 面片前方局部 3D 空间的坐标系，原点是这个空间的中心点。采用右手坐标系，Y 轴朝上，Z 轴朝向用户，长度单位默认用面向现实世界物体的物理单位（`m`）。

:::tip[相关 API]
这个空间的深度可以用 [`depth`](../css-api/depth.md) 设置，可以用 [`clientDepth`](../dom-api/clientDepth.md) 查询当前的深度。
:::

对于 `<World>` 顶层的 Entity 节点，Transform 属性中 `position` 的值是相对于坐标系原点的，对于其他作为子节点的 Entity，Transform 属性中 `position` 的值是相对于父 Entity 的 `position`。

WebSpatial SDK 目前提供的[开箱即用的 Entity](../../../concepts/3d-content-containers.md#3d-engine-api) 有以下几类：

### 基础实体 {#base-entity}

`<Entity>` 不可见，作为其他 Entity 的父组件和 group container 使用，可以用它把多个 Entity 包含在一个 group 里。

```js
<Reality>
  <World>
    <Entity position={{ x: 1, y: 0, z: 0 }}>
      <Box />
      <Box />
    </Entity>
    <Box position={{ x: 2, y: 0, z: 0 }} />
  </World>
```

### 几何实体 {#primitive-entities}

几何实体（primitive）包括以下几何形状，它们各自有不同的额外属性：

- `<Box>`
  - 属性：`width`,`height`,`depth`, `cornerRadius`
- `<Plane>`
  - 属性：`width`,`height`, `cornerRadius`
- `<Sphere>`
  - 属性：`radius`
- `<Cone>`
  - 属性：`height`, `radius`
- `<Cylinder>`
  - 属性：`height`, `radius`

示例：

```js
<Box
  width={0.2}
  height={0.2}
  depth={0.2} // meters (0.1 = 10cm)
  cornerRadius={0.01} // rounded edges
/>
```

这些几何实体都支持 `materials` 属性，可以引用[预先声明的材质](#3d-assets)。

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="unlit" id="glass" color="#0000ff" transparent opacity={0.5} />
  <World>
    <Box
      width={0.2}
      height={0.2}
      depth={0.2} // meters (0.1 = 10cm)
      materials={["glass"]}
      cornerRadius={0.01} // rounded edges
    />
  </World>
</Reality>
```

### 模型实体 {#model-entity}

`<ModelEntity>` 是用预制好的 3D 模型文件渲染内容的 Entity。

以「飞船舰队」为例：将飞船模型下载和加载到内存中一次，然后引用它生成 3 个独立的 Model Entity，渲染出 3 艘飞船

```js
import { Reality, World, ModelAsset, ModelEntity } from "@webspatial/react-sdk";

function SpaceshipFleet() {
  return (
    <Reality style={{ width: "100%", height: "500px" }}>
      {/* --- 1. THE RESOURCE --- */}
      {/* This downloads the file once. It is INVISIBLE right now. */}
      <ModelAsset
        id="ship-blueprint"
        src="https://example.com/fighter-jet.usdz"
      />

      {/* --- 2. THE SCENE --- */}
      <World>
        {/* Leader Ship: Center, Normal Size */}
        <ModelEntity
          model="ship-blueprint" // Points to the ID above
          position={{ x: 0, y: 0, z: 0 }}
          scale={{ x: 1, y: 1, z: 1 }}
        />

        {/* Left Wingman: Moved left, slightly smaller */}
        <ModelEntity
          model="ship-blueprint" // Reuses the same loaded file!
          position={{ x: -0.5, y: -0.2, z: 0.3 }}
          scale={{ x: 0.8, y: 0.8, z: 0.8 }}
        />

        {/* Right Wingman: Moved right, slightly smaller */}
        <ModelEntity
          model="ship-blueprint" // Reuses the same loaded file
          position={{ x: 0.5, y: -0.2, z: 0.3 }}
          scale={{ x: 0.8, y: 0.8, z: 0.8 }}
        />
      </World>
    </Reality>
  );
}
```

`<ModelEntity>` 支持和其他 Entity 相同的 [Transform 属性](#3d-entity)，因此可以像几何实体一样被定位、旋转、缩放和[做动画](#animation)。它不提供模型文件内部自带动画的播放控制。要播放那种动画，请改用 [`<Model>`](./Model.md#animation-playback-api)。

## 动画 {#animation}

在 `<Reality>` 内部和周围，有三种不同的东西可以做动画。它们使用不同的 API，不能互相替代。

| 我想做的事 | 用什么 |
| --- | --- |
| 播放 3D 模型文件内部自带的动画，例如 GLB 或 USDZ 文件中导出的骨骼动画或关键帧动画 | [`<Model>` 的播放 API](./Model.md#animation-playback-api)。当前版本的 `<ModelEntity>` 不提供内嵌动画的播放控制。 |
| 让 `<Reality>` 内的 Entity 随时间移动、旋转或缩放 | [`useEntityAnimation()`](../js-api/useEntityAnimation.md) 搭配 Entity 的 `animation` 属性。实验性 API。 |
| 用动画 API 覆盖不到的自定义逻辑驱动 Transform 属性，例如物理模拟、跟随手势、程序化运动 | 普通的 React state 更新，例如在 `requestAnimationFrame` 中更新。 |

### Entity Transform 动画 {#entity-transform-animation}

[`useEntityAnimation()`](../js-api/useEntityAnimation.md) 在 WebSpatial Runtime 的原生层为任意 Entity 的 `position`、`rotation`、`scale` 做动画。只需描述一次起点姿态、终点姿态、时长和缓动，运行时会逐帧插值，不需要重新渲染 React 组件。

```jsx
import { Reality, World, ModelAsset, ModelEntity } from "@webspatial/react-sdk";
import { useEntityAnimation } from "@webspatial/react-sdk/experimental";

function SpinningShip() {
  const [animation, api, entityProps] = useEntityAnimation({
    from: { rotation: { y: 0 } },
    to: { rotation: { y: 360 } },
    duration: 4,
    timingFunction: "linear",
    loop: true,
  });

  return (
    <Reality style={{ width: "100%", height: "500px" }}>
      <ModelAsset id="ship-blueprint" src="https://example.com/fighter-jet.usdz" />
      <World>
        <ModelEntity
          model="ship-blueprint"
          position={{ x: 0, y: 0, z: 0 }}
          {...entityProps}
          animation={animation}
        />
      </World>
    </Reality>
  );
}
```

- 把返回的 `animation` 传给 Entity 的 `animation` 属性。一个 animation 只能绑定到一个 Entity。
- 把 `entityProps` 展开在静态 Transform 属性之后，这样动画停止后 Entity 会停在最近确认的姿态上。
- 用 `api.play()`、`api.pause()`、`api.stop()`、`api.reset()`、`api.finish()` 控制播放。
- 动画在播放中、延迟中或暂停中时，运行时拥有这个 Entity 的完整 transform，会忽略普通的 Transform 属性更新。

:::caution[实验性 API，运行环境支持情况不同]
`useEntityAnimation` 从 `@webspatial/react-sdk/experimental` 导入，仍可能变化。运行环境的支持情况也不同：渲染调用这个 Hook 的组件之前，先用 `WebSpatialRuntime.supports("useEntityAnimation")` 检查；返回 `false` 时，用静态属性把 Entity 直接渲染在最终姿态上。完整 API、播放状态和限制见 [`useEntityAnimation`](../js-api/useEntityAnimation.md) 页面。
:::

### 自定义逐帧动画 {#custom-frame-by-frame-animation}

对于动画 API 不提供的逻辑，例如响应手势、物理模拟、程序化运动，或者用同一个时钟驱动多个 Entity，仍然可以直接用 React 更新 Transform 属性。每次 state 更新都会向运行时发送一次新的 transform，因此要尽量减少每帧的工作量。

```js
const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  let id;
  function animate() {
    setRotation((prev) => ({ ...prev, y: prev.y + 1 })); // 每帧 1 度
    id = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(id);
}, []);

<Box rotation={rotation} />;
```

不要在同一个 Entity 上把这种方式和正在播放的 `useEntityAnimation` 混用。只要运动可以用起点姿态、终点姿态和关键帧表达，就优先使用 `useEntityAnimation`。

:::note[让容器本身动起来]
Transform 属性和 `useEntityAnimation` 移动的是 `<Reality>` 3D 空间内部的内容。把 `<Reality>` 元素本身当作页面中的 2D 面片来做动画（和其他空间化 HTML 元素一样），是另一项实验性能力：`@webspatial/react-sdk/experimental` 中的 `useAnimation()` Hook，通过元素的 `xr-animation` 属性绑定，并由 `WebSpatialRuntime.supports("useAnimation")` 控制是否可用。
:::

## 附着实体 {#attachment-entity}

`<AttachmentEntity>` 是一个类似 `<Plane>` 的 2D 面片，用于在 3D 空间中显示[预先声明好的 2D HTML/CSS 内容](#3d-assets)。这些内容仍然属于页面的 React 树，因此可以和应用的其他部分共享 props、context 和 state：附着内容里的按钮可以更新页面其他部分读取的 state，反之亦然。

内容通过 `<AttachmentAsset id="...">` 作为 `<Reality>` 的顶层子节点声明一次。任意数量的 `<AttachmentEntity>` 都可以引用这个 `id`，每一个都会渲染出一份独立的内容。

`<AttachmentEntity>` 必须放在 `<World>` 内、作为 `<Entity>`（或其他任意 Entity）的后代使用。它会跟随父节点的 transform，父节点移动时附着内容也随之移动。直接放在 `<World>` 下不会渲染任何内容。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `attachment` | `string` | | 必填。要显示的 `<AttachmentAsset>` 的 `id`，可以在运行时修改。 |
| `position` | `{ x, y, z }` | `{ x: 0, y: 0, z: 0 }` | 相对于父 Entity 的位置，单位为米。 |
| `rotation` | `{ x, y, z }` | `{ x: 0, y: 0, z: 0 }` | 欧拉角旋转，单位为度，与其他 [Transform 属性](#3d-entity)一致。 |
| `scale` | `{ x, y, z }` | `{ x: 1, y: 1, z: 1 }` | 缩放倍数。 |
| `width` | `number` | 运行时默认值 | 面片宽度，单位为米。 |
| `height` | `number` | 运行时默认值 | 面片高度，单位为米。 |
| `cornerRadius` | `number` | `0` | 统一的圆角半径，单位是跟 2D 内容一样的 `px`。内容会按圆角矩形裁剪。负值按 `0` 处理。 |
| `backgroundMaterial` | `string` | `"transparent"` | 内容背后的背景。接受与 [`background-material`](../css-api/background-material.md) 相同的值：`none`、`transparent`、`translucent`、`thin`、`regular`、`thick`。 |

```js
<Reality style={{ width: "500px", height: "500px", "--xr-depth": 200 }}>
  <AttachmentAsset id="info">
    <div style={{ width: "100%", padding: "8px" }}>
      <p>Some text</p>
      <button onClick={() => console.log("clicked in 3D")}>Tap</button>
    </div>
  </AttachmentAsset>
  <World>
    <Box position={{ x: 0.5, y: -0.2, z: 0.3 }} />
    <Entity position={{ x: -0.5, y: -0.2, z: 0.3 }}>
      <AttachmentEntity
        attachment="info"
        position={{ x: 0, y: 0.15, z: 0 }}
        rotation={{ x: 0, y: 20, z: 0 }}
        width={0.3}
        height={0.15}
        cornerRadius={16}
        backgroundMaterial="translucent"
      />
    </Entity>
  </World>
</Reality>
```

需要注意的行为：

- 所有属性都可以在运行时修改。更新会原地生效，不会重新创建附着面片。
- HTML 内容会撑满附着面片。请用相对于面片的 CSS 来设置内容尺寸，不要使用假定页面布局的固定像素尺寸。
- 页面 `<head>` 中的样式（样式表和 `<style>` 块，包括后续注入的）以及根元素的 class 名称会被镜像到附着内容中，因此全局 CSS 和工具类在其中同样可用。
- 附着内容只是 2D 面片。它不接受子 Entity、`materials` 或空间事件处理器，也不能绑定 `useEntityAnimation`。放在 `<AttachmentAsset>` 内的空间化 HTML 元素、`<Model>` 和 `<Reality>` 会以普通 HTML 渲染。

:::caution[2.0.0 之后的破坏性变更]
`2.0.0` 之后发布的 `@webspatial/react-sdk` 版本修改了这个 API。旧代码需要迁移：

- `<AttachmentAsset name="...">` 改为 `<AttachmentAsset id="...">`。
- `position={[x, y, z]}` 改为 `position={{ x, y, z }}`。
- 以 `px` 为单位的 `size={{ width, height }}` 被以米为单位的 `width` 和 `height` 取代。
- `rotation`、`scale`、`cornerRadius` 和 `backgroundMaterial` 是新增属性。
:::
