---
createdAt: 2026-07-21T02:46:04.312Z
refinexDialect: 1
title: 产品A-产品B之间的数据同步配置操作手册
updatedAt: 2026-07-21T02:48:51.082Z
---

# 产品A-产品B之间的数据同步配置操作手册

## 配置系统间数据同步

发送方通过`bsjx.exchange.syncExchanges`配置同步任务。展示字段结构：

```yaml
bsjx:
  exchange:
    syncExchanges:
      - auth: "统一管理一致"
        system-code: "发送方的系统code"
        fixedDelay: 5
        sync-pull:
          rows: 100
          timeout: 5000
          pull-data-url: ""
          pull-result-url: ""
        sync-push:
          timeout: 1000
          push-data-url: "<接收方同步地址>"
```

除发送方配置外，还需在“统一管理-系统定义”下增加对应的数据同步功能点。

需要生成待同步数据时，手动写入数据生成表：

```sql
INSERT INTO erow_biz.bsjx_data_generate
  (source_code, fn_code, fn_parameter, key_value, create_date, row_guid)
VALUES
  (:source_code, :fn_code, :fn_parameter, :key_value, :create_date, :row_guid);
```



配置完成后至少验证三项：同步功能点可用、发送方能够访问接收地址、目标数据成功生成且没有重复。超时或无数据时，先检查`system-code`、推送/拉取地址和对应功能点。
