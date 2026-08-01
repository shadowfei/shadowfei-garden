// 花园板块导航（右栏）
//
// 手写的本地插件：不走 tsup 构建，直接是 ESM + preact 的 h()。
// preact 从仓库 node_modules 沿目录树解析，不需要单独装。
//
// 两个坑：
//   1. 插件源不能放在 .quartz/plugins/ 里——加载器会往那儿建符号链接，等于链到自己，EPERM。
//   2. 导出的 GardenNav 必须是「构造器」（接 options 返回组件），不是组件本身。
//
// 链接在 quartz.config.yaml 里配，组件只负责渲染：
//   options:
//     groups:
//       - title: 从这里开始
//         items:
//           - { label: 从「方针管理」读起, href: lean/术语/方针管理, note: 目标怎么落到班组 }
import { h } from "preact"

/** 从当前页 slug 回到站点根的相对前缀（"." 或 "../.."） */
function pathToRoot(slug) {
  const up = String(slug || "")
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return up.length === 0 ? "." : up
}

/** 外链原样输出；纯锚点当成「首页的锚点」（导航是全站的，内页点 #x 会落空）；
 *  站内相对路径补上回根前缀 */
function resolveHref(href, root) {
  const s = String(href || "")
  if (/^(https?:|mailto:|\/)/.test(s)) return s
  if (s.startsWith("#")) return `${root}/${s}`
  return `${root}/${s.replace(/^\.?\//, "")}`
}

// 花草线条图。和首页书架用的是同一套（publish_garden.py 里的 BOTANICAL），
// 两边要一起改。24×24，描边继承 currentColor，所以颜色由每项的 tint 决定。
const PATHS = {
  leaf:
    'M4 20C4 11 10 4 20 4c0 10-7 16-16 16Z|M20 4 5.5 18.5|M14.6 6.6 16 10.6M9.6 11.6 11 15.6',
  wheat:
    'M12 22v-12|M12 10c0-2 1.5-3.6 3.4-3.6C15.4 8.4 13.9 10 12 10Z|' +
    'M12 10c0-2-1.5-3.6-3.4-3.6C8.6 8.4 10.1 10 12 10Z|' +
    'M12 15c0-2 1.5-3.6 3.4-3.6C15.4 13.4 13.9 15 12 15Z|' +
    'M12 15c0-2-1.5-3.6-3.4-3.6C8.6 13.4 10.1 15 12 15Z|M12 6.4C12 4.4 12 3 12 2c0 1 0 2.4 0 4.4Z',
  fern:
    'M12 22C12 12.5 15 6 21 2.5|M12.7 17.6c-2.1.1-3.8-1-4.5-3M14 13.4c-2.1.1-3.8-1-4.5-3M15.7 9.3c-1.9.1-3.4-.9-4.1-2.7',
  sprouts:
    'M4 21h16|M12 21v-8M6.5 21v-5.5M17.5 21v-5.5|M12 13c0-2 1.6-3.6 3.6-3.6C15.6 11.4 14 13 12 13Z|' +
    'M6.5 15.5c0-1.6-1.3-2.9-2.9-2.9 0 1.6 1.3 2.9 2.9 2.9Z|' +
    'M17.5 15.5c0-1.6 1.3-2.9 2.9-2.9 0 1.6-1.3 2.9-2.9 2.9Z',
  bud:
    'M12 22v-7|M12 15c-2.4 0-4-2-4-4.7S10 4.6 12 2.5c2 2.1 4 4.7 4 7.8S14.4 15 12 15Z|' +
    'M12 10.4c0-2.6 0-5.3 0-7.9|M12 19.5c-1.6 0-2.9-1-3.4-2.6 1.8-.3 3.1.6 3.4 2.6Z|' +
    'M12 19.5c1.6 0 2.9-1 3.4-2.6-1.8-.3-3.1.6-3.4 2.6Z',
}

function botanical(name) {
  const d = PATHS[name]
  if (!d) return null
  return h(
    "svg",
    {
      class: "nav-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    d.split("|").map((p, i) => h("path", { key: i, d: p })),
  )
}

const CSS = `
.garden-nav { display: flex; flex-direction: column; gap: 1.4rem; }
.garden-nav-group h3 {
  margin: 0 0 .6rem;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .16em;
  color: var(--gray);
}
.garden-nav ul { margin: 0; padding: 0; list-style: none; }
.garden-nav li { margin: 0 0 .3rem; }
/* 左边那道色条＝书架上对应那片书脊的颜色，两处一眼能对上 */
.garden-nav a {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  column-gap: .5rem;
  align-items: start;
  padding: .45rem .6rem;
  border-left: 3px solid var(--tint, var(--lightgray));
  border-radius: 0 2px 2px 0;
  text-decoration: none;
  transition: background .15s ease;
}
.garden-nav a:hover, .garden-nav a.active {
  background: color-mix(in srgb, var(--tint, var(--tertiary)) 16%, transparent);
}
.garden-nav .nav-icon {
  grid-row: 1 / span 2;
  width: 22px;
  height: 22px;
  margin-top: .1rem;
  color: var(--tint, var(--tertiary));
}
.garden-nav a:not(:has(.nav-icon)) { grid-template-columns: minmax(0, 1fr); }
.garden-nav .nav-label {
  font-size: .92rem;
  font-weight: 500;
  color: var(--darkgray);
}
.garden-nav a:hover .nav-label, .garden-nav a.active .nav-label { color: var(--dark); }
.garden-nav .nav-note {
  margin-top: .12rem;
  font-size: .74rem;
  line-height: 1.5;
  color: var(--gray);
}
`

/** 构造器：接 quartz.config.yaml 里的 options，返回 preact 组件 */
export const GardenNav = (opts) => {
  const groups = (opts?.groups ?? []).filter(
    (g) => g && Array.isArray(g.items) && g.items.length > 0,
  )

  const Component = ({ fileData, displayClass }) => {
    if (groups.length === 0) return null
    const root = pathToRoot(fileData?.slug)
    const here = String(fileData?.slug || "")

    return h(
      "nav",
      { class: ["garden-nav", displayClass].filter(Boolean).join(" ") },
      groups.map((g) =>
        h("div", { class: "garden-nav-group", key: g.title }, [
          g.title ? h("h3", null, g.title) : null,
          h(
            "ul",
            null,
            g.items.map((it) => {
              // 当前所在板块高亮，避免读者迷失
              const target = String(it.href || "")
                .replace(/^\.?\//, "")
                .replace(/\/$/, "")
              const active = target !== "" && (here === target || here.startsWith(target + "/"))
              return h(
                "li",
                { key: it.label },
                h(
                  "a",
                  {
                    href: resolveHref(it.href, root),
                    class: active ? "active" : undefined,
                    "aria-current": active ? "page" : undefined,
                    style: it.tint ? `--tint:${it.tint}` : undefined,
                  },
                  [
                    it.icon ? botanical(it.icon) : null,
                    h("span", { class: "nav-label" }, it.label),
                    it.note ? h("span", { class: "nav-note" }, it.note) : null,
                  ],
                ),
              )
            }),
          ),
        ]),
      ),
    )
  }

  Component.css = CSS
  Component.displayName = "GardenNav"
  return Component
}

export default GardenNav
