# Week 5 渔获记录说明

## 已实现内容

- 新增 `cloud-functions/catches-create`。
- 创建渔获时自动调用 Week 2 今日数据管线，生成天气/潮汐快照。
- 渔获记录表单支持鱼种数量、用饵、备注。
- 保存失败时写入本地 `pending_catches`，便于后续同步。
- Week 5 版本不包含照片上传。

## 照片边界

本周接口只保存结构化数据。记录中只写入:

- `photo_count: 0`
- `photo_local_paths_json: []`

不上传照片二进制，不保存照片 URL。
