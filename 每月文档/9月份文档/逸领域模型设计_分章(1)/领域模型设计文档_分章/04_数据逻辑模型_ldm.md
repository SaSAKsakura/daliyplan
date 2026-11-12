# 4. 第三层：数据逻辑模型（ldm_）

> 内容为原文**完整搬运、未作改写**；正文中的章节编号（如「见 6.11」「见 8.20」）沿用原文档全局编号，可对照下表定位到对应分章文件。

<details>
<summary><b>分章索引（点击展开）</b></summary>

| 文件 | 原文档章节 | 关键内容 |
|---|---|---|
| [01_设计概述.md](./01_设计概述.md) | §1 设计概述 | 两域划分、六层架构、核心数据流、发布同步、多层覆盖 |
| [02_第一层_业务场景模型.md](./02_第一层_业务场景模型.md) | §2 第一层：业务场景模型 | 产品/主题域、场景/子场景/活动、业务事件与业务服务 |
| [03_概念数据模型_cdm.md](./03_概念数据模型_cdm.md) | §3 第二层：概念数据模型（cdm_） | 聚合/实体/值对象/属性、字段纳入清单、字典、治理预留表 |
| [04_数据逻辑模型_ldm.md](./04_数据逻辑模型_ldm.md) | §4 第三层：数据逻辑模型（ldm_） | 逻辑数据类型 `ldm_datatype` |
| [05_物理存储模型_pdm.md](./05_物理存储模型_pdm.md) | §5 第四层：物理存储模型（pdm_） | 数据库/类型映射/表/列/索引/约束/分区 |
| [06_产品服务模型_prod.md](./06_产品服务模型_prod.md) | §6 第五层：产品服务模型（prod_） | 服务与 API、菜单与操作、标准角色、字段授权/策略、事件订阅 |
| [07_界面构造模型_ui.md](./07_界面构造模型_ui.md) | §7 第六层：界面构造模型（ui_） | 页面/组件/布局/数据源/数据绑定/动作/字段配置 |
| [08_应用系统层运行配置模型_app.md](./08_应用系统层运行配置模型_app.md) | §8 应用系统层：运行配置模型（app_） | 双轨模型、系统实例化、角色与授权、字段纳入与策略、组织、预计算 SQL |
| [09_属性配置模型.md](./09_属性配置模型.md) | §9 属性配置模型（业务配置） | 业务配置 JSON 结构与校验规则 |
| [10_业务示例.md](./10_业务示例.md) | §10 业务示例 | 采购/订单端到端建模示例 |
| [11_表清单汇总.md](./11_表清单汇总.md) | §11 表清单汇总（69 张） | 69 张表总清单与口径说明 |
| [12_发布版本配套表.md](./12_发布版本配套表.md) | §12 发布版本配套表（prod_） | 发布版本、发布明细、配置覆盖登记 |

</details>

**本文件包含的子节**：`4.1 ldm_datatype — 数据逻辑类型定义`

---

## 4. 第三层：数据逻辑模型（ldm_）

> **数据逻辑模型**：定义与数据库无关的数据逻辑类型（"长什么样"）。**域归属**：`ldm_datatype` 属**建模域**（`ddd`）；其物理类型映射 `pdm_typemapping`（见 5.2）配合 DDL 生成，引擎运行时**间接**使用（经属性 `datatype_id` 解析类型）。

### 4.1 ldm_datatype — 数据逻辑类型定义

定义与数据库无关的数据逻辑类型，如整数、短名称、地址、电话等。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `datatype_id` | integer | PK | 主键，序列 `seq_ldm_datatype` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `datatype_code` | varchar(64) | UN, NOT NULL | 数据类型编码（IDENTIFIER, CODE, NAME...） |
| `datatype_name` | varchar(128) | NOT NULL | 数据类型名称（标识ID、编码、名称...） |
| `base_type_code` | varchar(64) | NOT NULL | **逻辑类型规范描述（模板定义）**：表达该逻辑类型的存储形态，含长度/精度/小数位。如 `integer`、`varchar(64)`、`numeric(18,2)`、`uuid`、`jsonb`。仅作类型模板定义；**数据库级物理类型映射以 `pdm_typemapping` 为真源**（见 5.2） |
| `format_ptn` | varchar(255) | | 格式模式（正则/日期格式） |
| `array_flag` | smallint | NOT NULL, DEFAULT 0 | 是否数组类型（0=单值, 1=数组）。当 `array_flag=1` 时，base_type_code 映射为对应数组类型（如 `integer[]`、`varchar[]`）。仅 IDENTIFIER/BIG_IDENTIFIER/CODE/NAME/SERIAL_NO 支持 |
| `description_txt` | text | | 描述 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

**预设数据逻辑类型：**（详见附件 `预设数据逻辑类型.md`，共34个类型）

| datatype_code | 后缀 | datatype_name | base_type_code | 必填参考 | 说明 |
|---------------|------|---------------|-----------|---------|------|
| IDENTIFIER | `_id` / `_ids` | 标识ID | `integer` | 可空 | 常规标识字段；`_ids` → `integer[]` |
| BIG_IDENTIFIER | `_bid` / `_bids` | 大标识ID | `bigint` | 可空 | 大数据量场景标识；`_bids` → `bigint[]` |
| CODE | `_code` / `_codes` | 编码 | `varchar(64)` | 可空 | 业务编码；`_codes` → `varchar(64)[]` |
| NAME | `_name` / `_names` | 名称 | `varchar(128)` | 可空 | 业务对象名称；`_names` → `varchar(128)[]` |
| DICTIONARY | `_dict` / `_dicts` | 字典引用 | `varchar(64)` | 必填 | 引用统一数据字典的值代码；`_dicts` → `varchar(64)[]`，用于多选。字段主体必须为对应 `dict_code` 的全小写形式（如 `cdm_aggregatetype_dict`、`cdm_status_dict`） |
| LONG_NAME | `_lname` | 长名称 | `varchar(500)` | 可空 | 较长描述名称 |
| TEXT_CONTENT | `_txt` | 文本内容 | `text` | 可空 | 不定长文本 |
| SERIAL_NO | `_no` / `_nos` | 顺序编号 | `varchar(50)` | 必填 | 流水号、序号；`_nos` → `varchar(50)[]` |
| PATH | `_path` | 路径 | `text` | 可空 | 树形结构路径，如 `1/2/3/5` |
| ENCRYPTED | `_enc` | 加密字段 | `text` | 必填 | 加密/哈希后的文本（密文长度不确定，使用 text） |
| HASH | `_hash` | 哈希摘要 | `varchar(255)` | 必填 | 哈希或带密钥哈希的编码结果，用于完整性校验、等值匹配、去重或凭证验证（MD5/SHA-256/HMAC-SHA256 均可覆盖） |
| AMOUNT | `_amount` | 金额 | `numeric(18,2)` | 必填 | 金额类 |
| PRICE | `_price` | 价格 | `numeric(18,6)` | 必填 | 单价/费率 |
| QUANTITY | `_qty` | 数量 | `numeric(12,3)` | 必填 | 数量类 |
| COUNT | `_cnt` | 统计计数 | `integer` | 可空 | 统计计数、版本计数 |
| UOM | `_uom` | 计量值 | `integer` | 可空 | 整数计量值，单位由字段主体中的标准缩写表达（如 `timeout_ms_uom`）。不可累加的测量值/配置值 |
| ORDER | `_order` | 顺序 | `integer` | 必填 | 表达某类顺序值，主体部分指明顺序含义（如 `priority_order`、`sort_order`） |
| PERCENTAGE | `_pct` | 百分比 | `numeric(5,2)` | 可空 | 税率、折扣率等 |
| BOOLEAN | `_flag` | 布尔标志 | `smallint` | 必填 | 二值标志 0/1 |
| COORDINATE_METER | `_coord` | 坐标值（米级） | `numeric(9,5)` | 可空 | 车辆定位、仓库坐标（≈1.1m） |
| COORDINATE_MILLIMETER | `_mcoord` | 坐标值（毫米级） | `numeric(12,8)` | 可空 | 测绘、GIS精确采集（≈1.1mm） |
| DATE | `_date` | 日期 | `date` | 可空 | 默认格式 `yyyy\mm\dd` |
| TIMESTAMP | `_ts` | 时间戳 | `timestamp` | 必填 | 含时间 |
| MINUTE_TIME | `_mt` | 时刻（分钟） | `varchar(5)` | 可空 | HH:MM 格式 |
| PHONE | `_phone` | 电话号码 | `varchar(20)` | 可空 | 手机/固话 |
| EMAIL | `_email` | 邮箱 | `varchar(200)` | 可空 | 电子邮箱 |
| ADDRESS | `_addr` | 地址 | `varchar(500)` | 可空 | 详细地址文本 |
| URL | `_url` | 链接 | `varchar(500)` | 可空 | URL链接 |
| OPERATOR | `_by` | 操作人 | `integer` | 必填 | 操作人/执行人标识 |
| UUID | `_uuid` | 全局标识 | `uuid` | 必填 | UUID v4 |
| JSON_DATA | `_json` | JSON数据 | `jsonb` | 可空 | 半结构化数据 |
| BLOB | `_blob` | 二进制大对象 | `bytea` | 可空 | 大二进制数据（文件内容、图片原始数据） |
| CLOB | `_clob` | 字符大对象 | `text` | 可空 | 大文本数据（合同全文、XML文档、日志）。物理类型统一为 `text`（openGauss PG 兼容，避免 `clob` 非标准类型） |
| BYTEA | `_bin` | 二进制数据 | `bytea` | 可空 | 小二进制数据（签名、缩略图等） |

> **必填参考**：该列为字段必填倾向参考。"必填"表示该类字段通常应设 `NOT NULL`；"可空"表示通常允许 `NULL`。最终是否必填仍须按业务逻辑判断，不得机械套用。
>
> **约束与枚举的承载说明**：本模型**不再设逻辑类型级的约束表与枚举值表**。**字段级取值/取值范围约束**由 `cdm_entity_attribute.config_json.validationRules`（见 9.3，`required`/`range`/`pattern`/`length`/`decimal` 等）定义并由引擎执行；**需落库的结构约束**（非空/唯一/`CHECK`）经 `pdm_constraint`（见 5.6）落到 DDL；**跨字段、跨步骤的业务规则**在场景层业务活动上以自然语言描述（`prod_activity.rule_txt`，见 2.5），由聚合根在事务内或业务服务实现保证；枚举值统一由**数据字典**定义——`DICTIONARY` 类型 `_dict`/`_dicts` + `config_json.dictCode` 引用统一字典编码，物理载体 `app_dict`，由 `cdm_dict` 发布同步（见 3.10）。

---
