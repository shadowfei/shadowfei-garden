// 站名下面那行标语（全站）
//
// 排在 beforeBody 的 page-title 之后。顶栏那个 flex 容器里，page-title 是 order:1、
// 搜索组是 order:2，其余都是 order:3 且整宽——所以这行自然落到站名下面一行，右对齐。
//
// 逐字入场：整句一起淡入太平，一个字一个字浮上来才有「写出来」的感觉。
// 所以把文案拆成单字 span，各自带延迟。标点不单独占一个动画节拍，跟着前一个字走。
import { h } from "preact"

const CSS = `
.garden-slogan {
  margin: .5rem 0 0;
  text-align: right;
  font-family: "Songti SC", "Source Han Serif SC", "Noto Serif SC", "STSong", var(--bodyFont);
  font-size: 1.18rem;
  font-weight: 500;
  font-style: italic;
  letter-spacing: .14em;
  line-height: 1.6;
  color: var(--secondary);
}
.garden-slogan .ch {
  display: inline-block;
  animation: slogan-rise .7s cubic-bezier(.2,.9,.3,1) both;
}
@keyframes slogan-rise {
  from { opacity: 0; transform: translateY(.5em) rotate(-4deg); }
  to   { opacity: 1; transform: none; }
}
/* 句尾一枚小花，等整句写完再开 */
.garden-slogan::after {
  content: "";
  display: inline-block;
  width: .72em;
  height: .72em;
  margin-left: .5em;
  vertical-align: -.04em;
  background: no-repeat center / contain
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='%23b98d72'%3E%3Cellipse cx='12' cy='6.4' rx='2.7' ry='4.4'/%3E%3Cellipse cx='12' cy='6.4' rx='2.7' ry='4.4' transform='rotate(72 12 10.4)'/%3E%3Cellipse cx='12' cy='6.4' rx='2.7' ry='4.4' transform='rotate(144 12 10.4)'/%3E%3Cellipse cx='12' cy='6.4' rx='2.7' ry='4.4' transform='rotate(216 12 10.4)'/%3E%3Cellipse cx='12' cy='6.4' rx='2.7' ry='4.4' transform='rotate(288 12 10.4)'/%3E%3C/g%3E%3Ccircle cx='12' cy='10.4' r='2' fill='%23c2a86a'/%3E%3C/svg%3E");
  animation: slogan-bloom .8s cubic-bezier(.34,1.5,.64,1) both;
}
@keyframes slogan-bloom {
  from { opacity: 0; transform: scale(.1) rotate(-90deg); }
  to   { opacity: 1; transform: none; }
}
@media all and (max-width: 800px) {
  .garden-slogan { font-size: .95rem; letter-spacing: .08em; }
}
@media (prefers-reduced-motion: reduce) {
  .garden-slogan .ch, .garden-slogan::after { animation: none; }
}
`

export const GardenSlogan = (opts) => {
  const text = String(opts?.text || "").trim()
  const chars = [...text]
  // 标点不占节拍，否则「，」和「、」处会莫名其妙地顿一下
  const isPunct = (c) => /[，,、。．·…—－\-～~！!？?：:；;（）()「」『』《》〈〉""'']/.test(c)

  let beat = 0
  const total = chars.filter((c) => !isPunct(c)).length

  const Component = () => {
    if (!text) return null
    beat = 0
    return h(
      "p",
      { class: "garden-slogan", style: `--n:${total}` },
      chars.map((c, i) => {
        if (!isPunct(c)) beat++
        return h(
          "span",
          { key: i, class: "ch", style: `animation-delay:${(beat * 0.075).toFixed(3)}s` },
          c,
        )
      }),
    )
  }

  Component.css = CSS + `
.garden-slogan::after { animation-delay: ${(total * 0.075 + 0.25).toFixed(2)}s; }
`
  Component.displayName = "GardenSlogan"
  return Component
}

export default GardenSlogan
