---
title: POLCA（Paired-cell Overlapping Loops of Cards with Authorization）
aliases: ["Paired-cell Overlapping Loops of Cards with Authorization"]
tags: [日常管理, 价值流]
description: "成对重叠卡回路：作业车间专用拉动系统，卡挂在物料上不绑定零件号"
date: 2026-08-03
---

## 一句话

**成对重叠卡回路**——给每个工序对发卡，专门解决作业车间"品种太杂没法用看板"的拉动难题。

## 定义

由 Rajan Suri 约 1990 年开发的作业车间专用拉动系统：每两个可能相邻的工序、每个流向各设一条卡回路，回路成对重叠，在制品上通常挂**两张卡**。开工条件有两条：① 有后续工序的空闲卡；② 该工序的 job release date（最早开始时间，不是截止日）已到。它本质上是把 [[CONWIP]] 的总量上限拆细到"每对工序"粒度，控制更精细但更繁琐。

## 落地提示

**什么时候用**：低量高混、按单生产的作业车间——流式工厂直接用 CONWIP 就够了，别上 POLCA 自找麻烦。作者态度："作业车间没有好解，但 CONWIP 和 POLCA 常常足够好。"卡数公式：NC_POLCA = (LT + TI)/TT_All + S（算例：34h+2h 除以 4h 节拍 = 9 卡）。

## 参见

- [[拉动生产]]
- [[CONWIP]]
- [[看板]]


## 相关内容

**📖 出自**

《all-about-pull-production》

> 出处：《All About Pull Production》（Christoph Roser, 2021）Ch7 · 中文释义由费老师重写
