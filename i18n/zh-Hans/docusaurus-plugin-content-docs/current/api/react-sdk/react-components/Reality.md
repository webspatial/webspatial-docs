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

1. 可以引用预先声明的材质。

```js
<Reality>
  <Material type="unlit" id="solid" color="#00ff00" />
  <Material type="unlit" id="glass" color="#0000ff" transparent opacity={0.5} />
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

3. 可以声明要附着在 Entity 上的 2D HTML/CSS 内容。

```js
<Reality>
  <AttachmentAsset name="info">
    <div style={{ width: '100%' }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
```

## 3D 实体 {#3d-entity}

3D Entity 组件不参与 HTML 布局，只在 `<Reality>` 容器内按照 3D 引擎体系来渲染，它们不支持 CSS 样式，而是采用 3D 引擎体系里的「Transform 属性」：

```js
<Entity
  // Position: x (left/right), y (down/up), z (away/toward), in meters
  position={{ x: 0.1, y: -0.2, z: 0.3 }}

  // Rotation: Euler angles in degrees (not radians)
  rotation={{ x: 0, y: 90, z: 0 }}  // quarter turn about the Y axis

  // Scale: 1 = normal, 2 = double, 0.5 = half
  scale={{ x: 1, y: 2, z: 1 }}  // stretched vertically
  >
```

| 属性 | 取值 | 单位 | 默认值 | 含义 |
| --- | --- | --- | --- | --- |
| `position` | `{ x, y, z }` | 米（`m`） | `{ x: 0, y: 0, z: 0 }` | Entity 原点的偏移量 |
| `rotation` | `{ x, y, z }` | 度（`deg`） | `{ x: 0, y: 0, z: 0 }` | 绕 Entity 自身 X、Y、Z 轴的欧拉角 |
| `scale` | `{ x, y, z }` | 比例 | `{ x: 1, y: 1, z: 1 }` | 各轴向的缩放倍数 |

Transform 属性默认使用 `<Reality>` 对应的 2D 面片前方局部 3D 空间的坐标系，原点是这个空间的中心点。采用右手坐标系，Y 轴朝上，Z 轴朝向用户，长度单位默认用面向现实世界物体的物理单位（`m`）。

:::tip[相关 API]
这个空间的深度可以用 [`depth`](../css-api/depth.md) 设置，可以用 [`clientDepth`](../dom-api/clientDepth.md) 查询当前的深度。
:::

对于 `<World>` 顶层的 Entity 节点，Transform 属性中 `position` 的值是相对于坐标系原点的，对于其他作为子节点的 Entity，Transform 属性中 `position` 的值是相对于父 Entity 的 `position`。

WebSpatial SDK 目前提供的[开箱即用的 Entity](../../../concepts/3d-content-containers.md#3d-engine-api) 分为四类：[基础实体](#base-entity)、[几何实体](#primitive-entities)、[模型实体](#model-entity)和[附着实体](#attachment-entity)。

### 旋转轴 {#rotation-axes}

`rotation` 不是「一个轴加一个角度」的写法。它的每个字段都是一个独立的欧拉角，分别绕 Entity 自身对应的局部坐标轴旋转：

| 字段 | 轴 | 正值的旋转效果 |
| --- | --- | --- |
| `rotation.x` | 局部 X 轴（指向右） | 让 Entity 的顶部朝用户方向倾斜 |
| `rotation.y` | 局部 Y 轴（指向上） | 让 Entity 的正面转向右侧 |
| `rotation.z` | 局部 Z 轴（指向用户） | 让 Entity 在用户视角下逆时针旋转 |

这张表背后的规则：

- **单位是度，不是弧度。** `90` 表示四分之一圈。SDK 不会做弧度换算，所以 `Math.PI / 2` 会被当成约 `1.57` 度，看上去几乎没有旋转。
- **方向遵循右手定则。** 对每个轴来说，正值表示从该轴正方向朝原点看过去时的逆时针旋转。
- **顺序是固定的。** 三个角按 `Rz * Ry * Rx` 组合：绕 Entity 自身坐标轴先应用 X，再应用 Y，最后应用 Z。因此同时设置多个字段时结果不满足交换律，`{ x: 90, y: 90, z: 0 }` 和 `{ x: 0, y: 90, z: 90 }` 得到的朝向并不相同。
- **旋转中心是 Entity 自身的原点**，既不是容器中心，也不是包围盒的某个角。所有[几何实体](#primitive-entities)都以该原点为中心生成，所以只设置 `rotation` 的几何实体会原地自转。
- **旋转会被继承。** 子 Entity 的变换会与父 Entity 的变换相乘，所以旋转父级 `<Entity>` 会让它的子节点绕父级原点公转。

:::caution[单位是度，不是弧度]
这里很容易被当成弧度，本页的早期版本也曾这样描述。SDK 实际传给渲染器的是度，与 CSS 的 `rotateX()` / `rotateY()` / `rotateZ()` 一致。如果代码里已经写了弧度数值，请按 `deg = rad * 180 / Math.PI` 换算。
:::

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

几何实体（primitive）是内置的几何形状。除了每个 Entity 都支持的 [Transform 属性](#3d-entity)，它们各自还有描述形状的属性。

| 组件 | 必填的形状属性 | 可选的形状属性 |
| --- | --- | --- |
| `<Box>` | `width`、`height`、`depth` | `cornerRadius`、`splitFaces` |
| `<Plane>` | `width`、`height` | `cornerRadius` |
| `<Sphere>` | `radius` | — |
| `<Cone>` | `radius`、`height` | — |
| `<Cylinder>` | `radius`、`height` | — |

所有形状属性的长度单位都是米，与 `position` 一致。

```js
<Box
  width={0.2}
  height={0.2}
  depth={0.2} // meters (0.1 = 10cm)
  cornerRadius={0.01} // rounded edges
/>
```

#### 必填属性必须提供 {#required-props-are-required}

TypeScript 类型把所有形状属性都标成了可选，但网格是由原生渲染器创建的，缺少必填属性时会被拒绝。漏掉其中一个，几何创建就会失败并抛出类似 `missing required fields for ConeGeometry: radius, height` 的错误，该 Entity 什么都不会渲染。这些属性没有隐式默认尺寸。

```js
<Cone radius={0.1} height={0.2} />  // 正常渲染
<Cone radius={0.1} />               // 失败：缺少 height，什么都不会渲染
```

`cornerRadius` 和 `splitFaces` 才是真正可选的，默认值分别是 `0` 和 `false`。`cornerRadius` 应保持在 `0` 到它所圆角化的最小边长的一半之间，超出这个范围没有意义。

修改任何形状属性都会重建网格，修改 Transform 属性则不会。所以需要连续动画时，请修改 `position` / `rotation` / `scale`，而不是形状属性。

#### 局部坐标轴对齐 {#local-axis-alignment}

每个几何实体都以 Entity 自身的原点为中心生成，因此 `rotation` 会让它原地自转。形状属性对应哪个轴、旋转之前形状朝向哪个方向，都是固定的：

| 组件 | 旋转前的坐标轴对齐 |
| --- | --- |
| `<Box>` | `width` 沿局部 X 轴，`height` 沿局部 Y 轴，`depth` 沿局部 Z 轴 |
| `<Plane>` | 平铺在局部 XY 平面上，正面朝向 +Z；`width` 沿 X 轴，`height` 沿 Y 轴。它是单面片，并且启用了背面剔除，所以从背面看不见 |
| `<Sphere>` | 各向同性；除非使用了贴图，否则 `rotation` 没有可见效果 |
| `<Cone>` | 中心轴沿局部 Y 轴，顶点朝向 +Y，圆形底面朝向 -Y；`radius` 在局部 XZ 平面上测量 |
| `<Cylinder>` | 中心轴沿局部 Y 轴，两个端面分别朝向 ±Y；`radius` 在局部 XZ 平面上测量 |

也就是说，`<Cone>` 和 `<Cylinder>` 默认是竖直站立的。想让它横躺，就绕 X 轴或 Z 轴转四分之一圈：

```js
<Cylinder radius={0.05} height={0.4} rotation={{ x: 0, y: 0, z: 90 }} />
```

#### 材质 {#materials}

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

使用 `materials` 有两个前提：

- 数组里的每个 id 都必须由同一个 `<Reality>` 中、位于 `<World>` 外的顶层 `<Material>` 声明。只有全部被引用的 id 都解析完成后，网格才会被挂载，所以引用一个从未声明过的 id 会让该 Entity 一直等待，什么都不渲染。
- 几何实体只有一个材质槽，因此只有数组的第一项会生效。`<Box>` 是例外：设置 `splitFaces={true}` 后，立方体的每个面各占一个材质槽，`materials` 最多可以传 6 项，分别对应 6 个面。

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

对于动画需求，可以用 JS 轮询修改 Transform 属性来实现。
示例：

```js
const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  let id;
  function animate() {
    // Degrees per frame: 1 deg at 60fps is one full turn every 6 seconds.
    setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
    id = requestAnimationFrame(animate);
  }
  animate();
  return () => cancelAnimationFrame(id);
}, []);

<Box width={0.2} height={0.2} depth={0.2} rotation={rotation} />;
```

## 附着实体 {#attachment-entity}

`<AttachmentEntity>` 是一个类似 `<Plane>` 的 Entity，可以引用[预先声明好的 2D HTML/CSS 内容](#3d-assets)，让它附着在自己表面上。

:::caution[当前限制]
WebSpatial SDK 后续版本会让 `<AttachmentEntity>` 像 `<Plane>` 一样支持 `width` 和 `height`（当前版本暂不支持）和完整 [Transform 属性](#3d-entity)（当前版本只支持 `position`），需要临时用 `size` 属性设置大小（单位是跟 2D 内容一样的 `px`）。
:::

```js
<Reality>
  <AttachmentAsset name="info">
    <div style={{ width: "100%" }}>
      <p>Some text</p>
    </div>
  </AttachmentAsset>
  <World>
    <Box position={{ x: 0.5, y: -0.2, z: 0.3 }} />
    <Entity position={{ x: -0.5, y: -0.2, z: 0.3 }}>
      <AttachmentEntity
        attachment="info"
        position={{ x: 0, y: 0, z: 0 }}
        size={{ width: 100, height: 100 }}
      />
    </Entity>
  </World>
</Reality>
```
