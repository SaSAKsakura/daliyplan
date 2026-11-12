# 5. 第四层：物理存储模型（pdm_）

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

**本文件包含的子节**：`5.1 pdm_database — 目标数据库实例`、`5.2 pdm_typemapping — 类型映射规则`、`5.3 pdm_table — 物理表结构`、`5.4 pdm_column — 物理列结构`、`5.5 pdm_index — 物理索引结构`、`5.6 pdm_constraint — 物理约束结构`、`5.7 pdm_partition — 物理分区结构`、`5.8 业务实例参与方数据的落库口径（设计约定）`

---

## 5. 第四层：物理存储模型（pdm_）

> **物理存储模型**：定义数据库存储结构（"怎么存"，含表/列/索引/约束/分区）。**域归属**：`pdm_database`/`pdm_typemapping`/`pdm_table`/`pdm_column`/`pdm_index`/`pdm_constraint`/`pdm_partition` 属**建模域**（`ddd`），是 DDL 生成依据；引擎按 `pdm_table`/`pdm_column` 配置**生成业务平台的实际业务表**（存 `biz_*`，见 1.8 节），生成的物理表结构可同步运行配置域供引擎引用。

### 5.1 pdm_database — 目标数据库实例

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `database_id` | integer | PK | 主键，序列 `seq_pdm_database` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `db_code` | varchar(64) | UN, NOT NULL | 数据库编码 |
| `db_name` | varchar(128) | NOT NULL | 数据库名称 |
| `cdm_dbtype_dict` | varchar(64) | NOT NULL | openGauss / PostgreSQL / MySQL / Oracle / SQLServer（`_dict` 字典引用） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

### 5.2 pdm_typemapping — 类型映射规则

将逻辑类型映射到不同数据库的物理类型。

> **映射真源（v3.0 职责收敛）**：本表是逻辑类型 → 各数据库物理类型的**唯一映射真源**。三处物理类型的职责分工：`ldm_datatype.base_type_code` = 逻辑类型**模板定义**（存储形态规范，见 4.1）；`pdm_typemapping.physical_type_code` = **映射规则**（按数据库实例解析）；`pdm_column.physical_type_code` = **生成结果**（DDL 生成时按本表解析写入，供回查与校验，不参与映射解析，见 5.4）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `typemapping_id` | integer | PK | 主键，序列 `seq_pdm_typemapping` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `datatype_id` | integer | NOT NULL | → `ldm_datatype.datatype_id`（逻辑关联） |
| `database_id` | integer | NOT NULL | → `pdm_database.database_id`（逻辑关联） |
| `physical_type_code` | varchar(64) | NOT NULL | 物理类型：varchar(100) / bigint / numeric(18,2) |
| `ddl_template_txt` | text | | DDL 模板 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

**映射示例：**

| 逻辑类型 | openGauss | PostgreSQL | MySQL |
|----------|-----------|------------|-------|
| IDENTIFIER | integer | integer | INTEGER |
| BIG_IDENTIFIER | bigint | bigint | BIGINT |
| CODE | varchar(64) | varchar(64) | VARCHAR(64) |
| NAME | varchar(128) | varchar(128) | VARCHAR(128) |
| AMOUNT | numeric(18,2) | numeric(18,2) | DECIMAL(18,2) |
| UUID | uuid | uuid | CHAR(36) |
| TEXT_CONTENT | text | text | LONGTEXT |

### 5.3 pdm_table — 物理表结构

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `table_id` | integer | PK | 主键，序列 `seq_pdm_table` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `entity_id` | integer | NOT NULL | → `cdm_entity.entity_id`（逻辑关联） |
| `database_id` | integer | NOT NULL | → `pdm_database.database_id`（逻辑关联） |
| `table_name` | varchar(128) | NOT NULL | 物理表名（模块前缀_实体名，≤50字节） |
| `table_comment_txt` | text | | 表注释 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

### 5.4 pdm_column — 物理列结构

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `column_id` | integer | PK | 主键，序列 `seq_pdm_column` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `table_id` | integer | NOT NULL | → `pdm_table.table_id`（逻辑关联） |
| `entity_attribute_id` | integer | NOT NULL | → `cdm_entity_attribute.entity_attribute_id`（逻辑关联） |
| `column_name` | varchar(128) | NOT NULL | 列名（snake_case，≤50字节） |
| `physical_type_code` | varchar(64) | NOT NULL | 物理类型（**DDL 生成结果**：由 `ldm_datatype` 经 `pdm_typemapping` 解析后写入，供回查与校验，不参与映射解析） |
| `nullable_flag` | smallint | NOT NULL, DEFAULT 0 | 可空标志（0=NOT NULL，1=NULL） |
| `pk_flag` | smallint | NOT NULL, DEFAULT 0 | 主键标志 |
| `sort_order` | integer | | 排序 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **列来源（v3.0 口径）**：`pdm_column.entity_attribute_id` 引用 `cdm_entity_attribute` 属性记录——常规属性直接引用；**值对象展开属性**（`cdm_attributesource_dict`=`VO_EXPAND`，见 3.3 落库策略）引用发布时展开生成的宿主属性记录；参与方列（stakeholder）经发布映射为属性记录（`cdm_attributesource_dict`=`STAKEHOLDER`）后同样走本链路（见 3.7 节）。其中值对象展开为**全量展开**——一次关联展开出的属性行数恒等于该模板的 `cdm_valueobject_attribute` 行数，`pdm_column` 随之逐列落地，**不允许只挑部分属性生成列**（见 3.3 落库策略）；发布器据此可做幂等校验：宿主 `VO_EXPAND` 属性数与模板属性数不符即判为脏展开。

### 5.5 pdm_index — 物理索引结构

> **物理索引（Index）**：定义物理表上的索引（主键索引/唯一索引/普通索引/组合索引），满足查询性能与唯一性约束。对应 PDM 物理模型中的 Index，支撑 DDL 生成。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `index_id` | integer | PK | 主键，序列 `seq_pdm_index` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `table_id` | integer | NOT NULL | → `pdm_table.table_id`（物理表，逻辑关联，见 5.3） |
| `index_name` | varchar(128) | NOT NULL | 索引名（`idx_<表名>_<列段>`，≤50字节） |
| `pdm_indextype_dict` | varchar(64) | NOT NULL | 索引类型（字典）：`PRIMARY`（主键）/`UNIQUE`（唯一）/`NORMAL`（普通）/`COMPOSITE`（组合）。`_dict` 字典引用 |
| `index_columns_txt` | text | NOT NULL | 索引列清单（逗号分隔，含排序，如 `column1, column2 DESC`） |
| `pdm_indexmethod_dict` | varchar(64) | NOT NULL, DEFAULT 'BTREE' | 索引方法（字典）：`BTREE`/`HASH`/`GIN`/`GIST`。`_dict` 字典引用 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `sort_order` | integer | | 排序 |
| `description_txt` | text | | 索引用途说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：主键/唯一索引由 `pdm_constraint`（见 5.6）同时声明，本表侧重查询索引；与 `cdm_entity_attribute`（属性，含唯一/主键标志）衔接——物理唯一索引可对应属性层唯一约束。索引设计遵循开发规范"必建索引清单"（主键、唯一业务键、高频过滤列、外键关联列）。

### 5.6 pdm_constraint — 物理约束结构

> **物理约束（Constraint）**：定义物理表/列的完整性约束——主键（PK）、唯一（UNIQUE）、非空（NOT NULL）、检查（CHECK）、默认值（DEFAULT）。与场景层以自然语言描述的**业务规则**（`prod_activity.rule_txt`，见 2.5；模型层不设规则表，描述不驱动执行）不同，本表表达**可直接落库的 DDL 约束**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `constraint_id` | integer | PK | 主键，序列 `seq_pdm_constraint` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `table_id` | integer | NOT NULL | → `pdm_table.table_id`（物理表，逻辑关联，见 5.3） |
| `constraint_name` | varchar(128) | NOT NULL | 约束名（`pk_<表名>`/`uk_<表名>_<列>`/`ck_<表名>_<列>`） |
| `pdm_constrainttype_dict` | varchar(64) | NOT NULL | 约束类型（字典）：`PK`（主键）/`UNIQUE`（唯一）/`NOT_NULL`（非空）/`CHECK`（检查）/`FOREIGN_KEY`（外键）/`DEFAULT`（默认值）。`_dict` 字典引用 |
| `constraint_columns_txt` | text | NOT NULL | 约束列清单（逗号分隔） |
| `check_expression_txt` | text | | CHECK 表达式（约束类型为 CHECK 时使用） |
| `referenced_table_id` | integer | | → `pdm_table.table_id`（外键引用表，逻辑关联，可选） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `sort_order` | integer | | 排序 |
| `description_txt` | text | | 约束说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：外键（FOREIGN_KEY）仅对强业务关联建立，通用关联字段按开发规范不建物理外键（逻辑关联通过数据域记录）。CHECK 表达式中 `delete_flag` 等通用字段值域由程序控制，一般不在 DDL 层强约束。

### 5.7 pdm_partition — 物理分区结构

> **物理分区（Partition）**：定义大表的分区策略（范围/列表/哈希分区），支撑数据生命周期管理与查询性能。对应 PDM 物理模型中的 Partition，用于千万级及以上数据量表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `partition_id` | integer | PK | 主键，序列 `seq_pdm_partition` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `table_id` | integer | NOT NULL | → `pdm_table.table_id`（物理表，逻辑关联，见 5.3） |
| `pdm_partitiontype_dict` | varchar(64) | NOT NULL | 分区类型（字典）：`RANGE`（范围）/`LIST`（列表）/`HASH`（哈希）。`_dict` 字典引用 |
| `partition_column_name` | varchar(128) | NOT NULL | 分区列名（如 `create_ts`） |
| `partition_strategy_txt` | text | | 分区策略描述（边界/数量/分区键取值） |
| `partition_cnt` | integer | | 分区数量（HASH 分区） |
| `retention_period_uom` | integer | | 保留周期（天），归档/清理依据（`_uom` 计量值，与 `cdm_entity.retention_period_uom` 一致） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `description_txt` | text | | 分区说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：分区与数据生命周期（保留/归档）衔接——`retention_period_uom` 定义数据保留窗口。常见场景：按 `create_ts` 做 RANGE 分区、按 `delete_flag`/状态列做 LIST 分区。分区定义在 `pdm_table` 之后挂接，不影响逻辑模型。

---

### 5.8 业务实例参与方数据的落库口径（设计约定）

> **本节性质**：本节是**落库形态约定**，**不新增 `pdm_*` 表**（不进入 §11 的 69 张口径）。参与方数据仍沿既有生成链产出自 `biz_*` 业务数据域：
> `cdm_entity_stakeholder`（3.7）→ 发布时映射为 `cdm_entity_attribute`（`cdm_attributesource_dict`=`STAKEHOLDER`）→ `pdm_column`（5.4）落为**列**；多值槽位建模为**独立实体** → `pdm_table`（5.3）落为**表**。

**三层概念先分清**（口径要点：这三层的最优形态互不相同，混谈易错）：

| 层 | 内容 | 是否参与业务数据生成 | 形态选择 |
|---|---|---|---|
| **参与方主体**（Party） | 用户、组织/部门、企业、供应商、外部联系人 | 否（主数据，外部或已有表） | **按类别各自建表**（结构差异大） |
| **参与方槽位**（Slot） | 申请人、审批人、建设单位、抄送人…… | 是（建模期定义为 stakeholder） | 单值→**列**；多值→**从属实体** |
| **参与方关系**（Link） | 某条业务记录的某槽位 = 某个主体实例 | 是（运行时写入业务数据） | 随槽位形态：列值 / 明细行 |

> **参与方主体的数据来源**（本模型不重复建主数据）：
> 用户 → 外部用户体系 `app.user_id`（8.13 口径：本模型**不建用户表**）；组织/部门/公司 → `app_org`（8.13，最小镜像）；
> 供应商/客户等具业务属性的参与方 → 建模为 `cdm_entity`，产出 `biz_*` 业务实体表。

#### 形态一：单值槽位 → 生成业务表上的列（默认）

每个单值槽位经 3.7 映射后落成宿主表一列，列名 = stakeholder 的 `attribute_code`，列类型由 `datatype_id` 决定（通常为 `OPERATOR`）。

`biz_purchase_order`（生成结果示例）：

| 列 | 槽位来源 | 取值指向 | 说明 |
|---|---|---|---|
| `applicant_id` | stakeholder `applicant_id` | 用户主体 | 申请人 |
| `approver_id` | stakeholder `approver_id` | 用户主体 | 审批人 |
| `supplier_id` | stakeholder `supplier_id` | 供应商实体 | 供应商 |
| `builder_company_id` | stakeholder `builder_company_id` | 公司实体 | 建设单位 |

> **何时升级为双列**：仅当某槽位**取值允许多种类别**（既能填用户也能填企业）时，改为 `{xxx}_party_type` + `{xxx}_party_id` 两列，`party_type` 引用字典（`USER`/`ORG`/`SUPPLIER`/`EXTERNAL`）。
> **不要提前做成双列**——单类别槽位用双列会牺牲列类型的自解释性与强关联清晰度。

#### 形态二：多值槽位 → 建模为从属实体 → 生成独立业务表（如抄送、会签、围观）

多值槽位**不塞进宿主表的 jsonb 列**，也**不退化成一张全局 EAV 大表**——在本模型中，正确做法是**把它建模为一个从属 `cdm_entity`**（归属同一聚合），自然产生一张明细表。

`biz_order_party`（生成结果示例，供建模参考）：

| 列 | 约束 | 说明 |
|---|---|---|
| `order_party_id` | PK | 主键，序列 `seq_biz_order_party` |
| `row_uuid` | UN, NOT NULL | 全局行标识（UUID v4） |
| `order_id` | NOT NULL | → `biz_order`（从属主记录；按聚合内实体关联建模，**不建物理外键**，见 5.6 口径） |
| `stakeholder_code` | NOT NULL | 槽位编码（文本引用 `cdm_entity_stakeholder.attribute_code`，如 `CC`/`CO_SIGN`/`WATCHER`） |
| `party_type` | NOT NULL | 参与方类别（字典 `PARTY_TYPE`）：`USER`/`ORG`/`SUPPLIER`/`EXTERNAL` |
| `party_id` | NOT NULL | 参与方主体主键（多态引用，**域约束**而非外键，见下方"为什么不按类别分表"） |
| `party_code` | | 参与方主体稳定编码（**冗余**，供跨主体数据源的同步/检索/导出对齐） |
| `party_name_txt` | | 参与方显示名（**写入时快照**：记录写入时刻的主体名称，**不随主体更名回填**，用于列表页避免 N 槽位 N 次 JOIN；语义与取值见下方"名称快照口径"） |
| `primary_flag` | NOT NULL, DEFAULT 0 | 主责标志（多值中指定其一为主责人） |
| `sort_order` | | 排序（会签顺序等） |
| + `row_uuid` 与审计 6 列 | | `create_by`/`create_ts`/`update_by`/`update_ts`/`delete_flag`/`version_cnt` |

> **建模要点**：
> - **明细表内部不再按 `party_type` 拆表**——拆表只解决多态外键问题，而本模型规定通用关联字段不建物理外键（5.6），收益归零、成本全在查询侧；
> - **索引**：`pdm_index`（5.5）建议登记 `(order_id, stakeholder_code)`（按槽位取人）与 `(stakeholder_code, party_id)`（待办推送："哪些记录我待处理"），后者是行级权限与待办查询的主路径；
> - **唯一性**：单槽位唯一（如"同一订单同一槽位同一主体仅一次"）以 `UNIQUE` 约束表达；跨行主责唯一（`primary_flag`）无法靠唯一索引保证时，在场景层活动中声明（`prod_activity.rule_txt`，见 2.5）并由应用层拦截；
> - **名称快照口径（`party_name_txt` 不回填）**：本列取值是**记录写入时刻**的主体显示名，之后主体更名**不回填历史行**。取舍依据：
>   - **可追溯性**：单据/会签应呈现"当时参与方的当时名称"（组织曾用名、供应商更名前名称），回填会丢失这一事实；
>   - **成本与可行性**：回填需对历史大表批量 UPDATE，且用户主数据在**外部体系**（8.13 口径：本模型不建用户表），无可靠变更通知链路，回填易静默失败；
>   - **代价**：显示可能是"旧名"。**须显示最新名称时**，对**当批记录去重后的 `party_id` 集合做一次批量查询**（宽列形态按该列的 `ref_entity_id`、明细形态按 `party_type` + `party_id`，**禁止逐行 N+1 关联**），以最新主体名渲染；此时本列降级为兜底值。
> - **主从删除**：明细随主记录级联，`pdm_constraint`（5.6）不建 FK 时由应用层按聚合根统一维护生命周期。

#### 为什么不采用"一张全局参与方大表"（EAV）

| 否决理由 | 机制影响 |
|---|---|
| 行级权限判定崩塌 | `cdm_dsfield`（3.8）/ `app_dsfield`（8.9）已把参与方列当作**依赖对象**（`depend_entity_code`）——“字段值指向另一实体（外键/参与方）时，其可见性取决于当前用户对被依赖实体的可访问实例集合”。改 EAV 后行级谓词须退化为 `EXISTS` 半连接 |
| 预计算失效 | `app_role_scopesql`（8.17）预计算键为 (角色, 实体, `scope_context`)，每槽位须单独出子查询段；“依赖深度超限以子查询表达”仍是 8.20 的 **v2 演进项**，当前不成熟 |
| 单值约束无法表达 | “一张订单只能有一个申请人”在宽列是 NOT NULL + 业务校验；EAV 下需偏函数约束/触发器 |
| 查询形变 | 列表页 N 个槽位 = N 次 self-join；按“审批人=我”排序/分页需半连接回业务表，索引基数与执行计划均劣化 |
| UI 链路受损 | `ui_databinding`（7.4）/ `ui_fieldconfig`（7.6）绑定的是属性列，列形态变更会引起前端渲染链路改动 |

#### 为什么不按参与方类别分表（用户参与表 / 企业参与表）

1. **唯一收益是物理外键，而本模型不用**：5.6 —“外键仅对强业务关联建立，通用关联字段**不建物理外键**（逻辑关联通过数据域记录）”；1.5 —“跨域引用一律以编码文本表达”。为此分表，收益为零。
2. **成本全在查询侧**：查“这条记录有哪些参与方”要 UNION 或多 JOIN；新增一类参与方（如外部联系人）要建表 + 改代码，而列/明细方案只需新增字典项与 `ref_entity_id`。
3. **与 EAV 同构**：两者都只是把“类型列”提升为“类型表”，差别仅在分表能建 FK——该差别已被第 1 条否掉。

#### 决策门槛

| 场景 | 采用形态 |
|---|---|
| 槽位**建模期**确定且每槽位单值 | **宽列**（默认） |
| 槽位建模期确定，但存在**多值**（抄送/会签/围观） | 多值槽位建**从属实体明细表**，其余槽位仍留宽列 |
| 槽位需由**客户在实施期自定义**（不停机加槽位） | 才可上通用名单表 `biz_entity_party`（`entity_code`/`record_id`/`stakeholder_code`/`party_type`/`party_id`），并须接受：**该实体不参与行级权限依赖判定**、列表不支持按参与方排序、唯一约束自行实现 |
| 槽位取值类别完全开放且需统一编码 | v2 引入参与方注册表（`biz_party`），业务表存统一 `party_id`；代价是多一层主数据同步链路 |

> **与权限模型的衔接（必须做）**：无论哪种形态，凡参与行级权限判定的参与方字段，均须纳入 `cdm_dsfield`（3.8）并声明 `depend_entity_code`，方能参与 `app_role_scopesql`（8.17）预计算。宽列/从属实体两种形态均天然满足此要求；通用名单表形态不满足，属其已知代价。

---
