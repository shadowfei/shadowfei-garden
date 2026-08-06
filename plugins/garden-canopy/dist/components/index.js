// 花顶棚上盛开的大花朵
//
// 遮阳带本身是 quartz/styles/custom.scss 里 .page::before 画的（纯 CSS，全宽）。
// 花朵要逐瓣绽开，背景图动不了，所以做成真 DOM，绝对定位覆在带子上。
// 绝对定位同时意味着它不占 flex 槽位，塞在 beforeBody 里也不会挤乱顶栏。
//
// 两个踩过的坑：
//   1. 花瓣的静止态必须自带 rotate(var(--a))。只靠动画的话，动画一结束花瓣就
//      回到无 transform 的状态，八瓣全叠在 0° 上——看起来就剩一瓣。
//   2. 尺寸走 --w 变量而不是内联 width。内联 width 优先级压过样式表，
//      手机端就缩不下来；而摇曳动画占着 transform，也不能用 scale 缩。
import { h } from "preact"

// 莫兰迪：花瓣浅一档、花心深一档，同一支花才有立体感。
// after = 额外等多少秒才开：前六朵进页面就陆续开，后四朵每隔一分钟再开一朵，
// 页面开着不动也会继续长——花园是活的。
// 靠 animation-fill-mode:both 实现：动画开始前保持 from 态（scale .06 / opacity 0），
// 所以延迟期间它们就是不可见的花苞，不需要任何 JS 定时器。
const BLOOMS = [
  { left: "6%", size: 62, petal: "#c6a9a0", core: "#9c7568", petals: 8 },
  { left: "22%", size: 44, petal: "#a8b49f", core: "#7c8b74", petals: 6 },
  { left: "37%", size: 70, petal: "#d3c08c", core: "#a3894f", petals: 8 },
  { left: "54%", size: 48, petal: "#b3a5b1", core: "#847382", petals: 6 },
  { left: "69%", size: 64, petal: "#a6b2bd", core: "#75838f", petals: 8 },
  { left: "86%", size: 50, petal: "#c0b391", core: "#8e8158", petals: 6 },
  // —— 以下四朵按分钟陆续开 ——
  { left: "14%", size: 40, petal: "#bfae9a", core: "#8d7b66", petals: 6, after: 60 },
  { left: "46%", size: 54, petal: "#adb9a4", core: "#7f8d76", petals: 8, after: 120 },
  { left: "78%", size: 44, petal: "#c3aab0", core: "#93737d", petals: 6, after: 180 },
  { left: "30%", size: 38, petal: "#b0bcc4", core: "#7d8d96", petals: 6, after: 240 },
]

// 绽开节奏：整体慢下来，一朵一朵开，一瓣一瓣推
const PETAL_DUR = 2.2 // 每瓣张开耗时（秒）
const PETAL_STEP = 0.18 // 同一朵里相邻花瓣的间隔
const BLOOM_STEP = 0.55 // 相邻两朵花的间隔

function bloom(b, i) {
  const base = (b.after || 0) + i * BLOOM_STEP
  const petals = []
  for (let k = 0; k < b.petals; k++) {
    petals.push(
      h("ellipse", {
        key: k,
        class: "petal",
        cx: 32,
        cy: 15,
        rx: 7.5,
        ry: 15,
        fill: b.petal,
        style:
          `--a:${((360 / b.petals) * k).toFixed(1)}deg;` +
          `animation-delay:${(base + k * PETAL_STEP).toFixed(2)}s`,
      }),
    )
  }
  const coreDelay = base + b.petals * PETAL_STEP + 0.2
  return h(
    "span",
    {
      key: i,
      class: "canopy-bloom",
      // 摇曳等这朵开完再起，否则边开边晃看着乱
      style: `left:${b.left}; --w:${b.size}px; animation-delay:${(coreDelay + 0.4).toFixed(2)}s`,
    },
    h("svg", { viewBox: "0 0 64 64", "aria-hidden": "true" }, [
      h("g", { class: "petals" }, petals),
      h("circle", {
        class: "core",
        cx: 32,
        cy: 32,
        r: 7,
        fill: b.core,
        style: `animation-delay:${coreDelay.toFixed(2)}s`,
      }),
    ]),
  )
}

const CSS = `
.canopy-blooms {
  position: absolute;
  inset: 0 0 auto 0;
  height: 60px;
  pointer-events: none;
  z-index: 2;
}
.canopy-bloom {
  position: absolute;
  bottom: -18px;
  width: var(--w);
  transform-origin: 50% 100%;
  animation: canopy-sway 9s ease-in-out infinite alternate both;
}
.canopy-bloom svg { display: block; width: 100%; height: auto; overflow: visible; }

.canopy-bloom .petal {
  transform-box: view-box;
  transform-origin: 32px 32px;
  /* 静止态就带着自己的角度——动画结束后回到这里，八瓣才不会叠成一瓣 */
  transform: rotate(var(--a));
  animation: canopy-open ${PETAL_DUR}s cubic-bezier(.16,.84,.32,1) both;
}
.canopy-bloom .core {
  transform-box: view-box;
  transform-origin: 32px 32px;
  animation: canopy-core .8s cubic-bezier(.34,1.4,.64,1) both;
}
@keyframes canopy-open {
  0%   { transform: rotate(var(--a)) scale(.06); opacity: 0; }
  55%  { opacity: 1; }
  100% { transform: rotate(var(--a)) scale(1);   opacity: 1; }
}
@keyframes canopy-core {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}
@keyframes canopy-sway {
  from { transform: rotate(-4deg); }
  to   { transform: rotate(4deg); }
}

@media all and (max-width: 800px) {
  /* 用 --w 缩，不能用 scale——transform 被摇曳动画占着 */
  .canopy-bloom { width: calc(var(--w) * .6); }
  .canopy-bloom:nth-child(2), .canopy-bloom:nth-child(6) { display: none; }
}
/* 关掉动效的人直接看到全开的花，不是空白 */
@media (prefers-reduced-motion: reduce) {
  .canopy-bloom, .canopy-bloom .petal, .canopy-bloom .core { animation: none; }
}
`

// 书架上的书脊和喜鹊不要悬浮预览——那是给正文里的术语链接用的，
// 悬在一本书上弹出整页预览只会挡住书架本身。
//
// Quartz 的 popover 直接把 mouseenter 监听器绑在每个 a.internal 上，没有 opt-out 类；
// 所以在 document 上做捕获阶段拦截：mouseenter 不冒泡，但捕获阶段仍会经过 document，
// 在这里 stopPropagation 就到不了目标元素自己的监听器。
const NO_POPOVER = `
document.addEventListener("mouseenter", (e) => {
  const t = e.target
  if (t && t.closest && t.closest(".spine, .perch")) e.stopPropagation()
}, true)
`

export const GardenCanopy = () => {
  const Component = () =>
    h("div", { class: "canopy-blooms", "aria-hidden": "true" }, BLOOMS.map(bloom))
  Component.css = CSS
  Component.afterDOMLoaded = NO_POPOVER
  Component.displayName = "GardenCanopy"
  return Component
}

export default GardenCanopy
