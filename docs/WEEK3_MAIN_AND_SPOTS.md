# Week 3 主屏与钓点说明

## 已实现内容

- Splash 根据本地 `user_settings` 决定进入 Onboarding 或主屏。
- Onboarding 介绍页展示产品核心承诺。
- Onboarding 钓点页读取位置，失败时使用舟山默认坐标，并调用 `spots-nearby`。
- 主屏展示钓点、日期、潮差、潮汐波形、风、天气、水温、气压、月相和数据来源。
- 钓点管理页可查看收藏钓点并切换当前钓点。
- 新增 `tide-curve` 和 `data-block` 轻量组件。

## 后端

新增 `cloud-functions/spots-nearby`，使用内置舟山周边系统钓点数据，按距离排序返回 5-10 个钓点。

## 产品边界

主屏只展示信息，不给“能不能钓”的评分、建议或结论。
