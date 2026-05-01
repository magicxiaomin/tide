# Week 7 渔获卡 Canvas 合成

本周完成渔获卡预览页、Canvas 绘制计划、本地照片拼接、潮汐迷你波形、渔获与数据块展示、保存到相册和相册权限失败引导。

实现边界：

- 用户照片只使用 `wx.chooseMedia` 返回的本地临时路径参与 Canvas 绘制，不上传后端。
- 保存渔获成功后，将渔获卡数据写入本地 storage，再跳转到 `pages/catch-card/index`。
- 朋友圈分享遵循微信限制：先 `canvasToTempFilePath` 生成图片，再 `saveImageToPhotosAlbum`，用户从相册发朋友圈。
- 无照片、空军记录也能生成卡片，避免分享链路被特殊状态卡住。
