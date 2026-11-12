# 8. 应用系统层：运行配置模型（app_）

> 内容为原文**完整搬运、未作改写**；正文中的章节编号（如「见 6.11」「见 8.19」）沿用原文档全局编号，可对照下表定位到对应分章文件。

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

**本文件包含的子节**：`8.0 标准 / 自定义双轨模型（本章总纲）`、`8.1 app_system — 应用系统定义`、`8.2 app_system_product — 应用系统-产品组合（多对多）`、`8.3 app_event_config — 应用事件运行配置`、`8.4 app_role — 应用角色定义`、`8.5 app_role_menu — 应用角色-菜单授权`、`8.6 app_role_menu_op — 应用角色-菜单操作授权`、`8.7 app_role_fieldauth — 应用角色字段授权候选`、`8.8 app_role_user — 用户-角色分配`、`8.9 app_dsfield — 字段纳入权限管理清单`、`8.10 app_menu — 菜单权限点（运行承载）`、`8.11 app_menu_op — 菜单操作权限点（运行承载）`、`8.12 app_api — API 端点（运行承载）`、`8.13 app_org — 组织机构定义`、`8.14 app_org_user — 用户-组织归属`、`8.15 app_fieldperm — 属性保密类型个性化（升级/降级）`、`8.16 app_role_fieldperm — 角色-字段保密类型可见性`、`8.17 app_role_scopesql — 角色×实体×上下文 预计算范围 SQL`、`8.18 app_grant_log — 授权变更流水`、`8.19 app_cfgoverride — 应用侧配置覆盖登记`、`8.20 本章 v2 演进预留（不落 v1 DDL）`

---

## 8. 应用系统层：运行配置模型（app_）

> **应用系统层**（对位平台「运行配置域」schema `app`）：一个**应用系统**对应**一家客户的一次交付实例**（如"A 集团采购平台"）。
> 本层数据**不产生于研发阶段**，而是在**系统初始化**及**后续应用过程中**产生——是产品层（`prod_*`）能力在客户侧的**实例化**。
>
> **产品层与应用系统层的关系（M:N）**：
>
> | 关系 | 说明 |
> |------|------|
> | 一个应用系统 ← 多个产品 | 一家客户可采购并组合多个产品（如"采购管理 + 合同管理 + 供应商门户"） |
> | 一个产品 → 多个应用系统 | 同一产品可交付给不同客户，各实例配置互不干扰 |
>
> 关系由 `app_system_product`（见 8.2）承载。
>
> **两域分工回顾**（详见 §1.5）：`ddd`（研发固化：`prod_*` 产品交付物 + 建模资产 + `ui_*`）/ `app`（按客户实例化：`app_*`）。
> 本层**只写本层数据**，对 `ddd` 域的产品基线**只读引用**、**不得篡改**——需要差异一律走**覆盖登记**（`app_cfgoverride`，见 1.7/8.19）。
>
> **域归属**：本章 **19 张表**全部属**运行配置域（schema `app`）**，由系统初始化流程、发布同步任务与实施/客户管理员写入；运行时引擎**只读**。
>
> **权限模型要点**：运行时权限引擎（菜单装配、按钮控权、接口鉴权、行级过滤、字段脱敏）所需数据
> **全部取自 `app_` 前缀表**，**不跨域直读研发侧标准定义**。产品侧标准权限资产（`prod_menu`/`prod_menu_op`/`prod_api`/`prod_role`/
> `cdm_dsfield`（见 3.8）/`prod_role_fieldauth` 等）经**发布同步**单向物化到本层（同步关系见表 6 章首）——
> **STANDARD 角色的授权明细就在 `app` 域**，运行时单一数据源。

### 8.0 标准 / 自定义双轨模型（本章总纲）

> **双轨口径**：「**同步资产落地 + 管理权归属**」——`STANDARD` 明细**由发布同步写入 `app` 域**，客户禁改；
> 调整的唯一路径是**物化**（管理权移交）为 CUSTOM。

| 类别 | 识别 | 写入方 | 客户可否改 | 产品升级行为 |
|------|------|--------|:---:|------|
| **同步资产** | `app_menu`/`app_menu_op`/`app_api` **整表**；`app_role`、`app_dsfield` 的 **`STANDARD` 行**及其明细 `app_role_menu`/`app_role_menu_op`/`app_role_fieldauth`/`app_role_fieldperm` | 发布同步任务 | ❌ **禁改**（应用层拦截） | 按标准编码 / 同主键匹配**重写覆盖** |
| **自建资产** | `CUSTOM` 行及其明细；`app_org`(`LOCAL`)/`app_org_user`/`app_role_user`/`app_grant_log` | 客户 | ✅ 可维护 | 不触碰 |

> ❗**不允许增量覆盖**：`STANDARD` 行**不得**被客户追加或裁剪——若客户需要调整标准角色/标准纳入/标准策略，
> **唯一路径**是转为 `CUSTOM` 并**物化**（8.0.1）。这样设计是为保证：产品升级时标准资产变更能**一致地**同步到所有未定制的客户实例。

**8.0.1 `STANDARD → CUSTOM` 物化 = 管理权移交（强制，不可逆）**

> 由于 STANDARD 明细**本就在 `app` 域**，物化不再是"复制 `prod_role_*` 明细"，而是**管理权移交**（3 步原子流程，单一事务）：

```
物化（以角色为例）：
  1. 锁定 app_role 行（乐观锁 version_cnt 校验）
  2. 置 app_rolesource_dict = 'CUSTOM'，清空 std_role_code 与 sync_release_no
  3. 写入 app_grant_log（动作 MATERIALIZE，before/after 快照）
```

> - 物化后该角色行及其明细（`app_role_menu`/`app_role_menu_op`/`app_role_fieldauth`/`app_role_fieldperm` 该角色行）
>   **即刻脱离同步覆盖**，客户可自由增删；
> - **字段纳入清单 `app_dsfield` 可独立于角色物化**（STANDARD 纳入行转 CUSTOM，或客户直接自建 CUSTOM 纳入行）——
>   纳入与角色授权解耦（先纳入后授权，见 8.6 纳入必查）；
> - 物化**不可逆**；全程写入 `app_grant_log`，`before_json` 中的 `std_*_code` 是物化后**唯一溯源载体**；
> - 转 `CUSTOM` 后 **`std_*_code` 必须清空**（不再是"置 NULL 后继承集丢失"的风险问题，因为明细本就在本层），
>   该约束由**落库 CHECK 约束**保障（见 8.3 / 8.9），而非仅靠应用层约定。

**8.0.2 数据权限判定语义（字段纳入 + 角色字段级授权 + 依赖对象）**

> **权威定义见《权限管理设计文档》v1.2.2**；本节只做模型层面的落点说明，确保领域模型与其一致。
>

| # | 需求 | 建模落点 |
|:-:|------|----------|
| R1 | 明确指定哪些实体的哪些字段纳入权限管理，未纳入的不作控制 | `app_dsfield`（8.9）。实体**至少登记一个纳入字段**才受行级管辖；完全未纳入的实体/字段不参与行级过滤 |
| R2 | 每实体的字段可指定授权范围，**或**指定依赖对象实体；依赖对象可再指定范围或依赖，依此类推 | 授权范围 → `app_role_fieldauth`（8.7）；**依赖对象由 `app_dsfield.depend_entity_code` 预声明**（字段纳入侧） |
| R3 | 授权范围 = 全部数据 / 指定值 / 指定范围 / 系统预定义参数 | `app_role_fieldauth.app_fa_type_dict` = `ALL`/`VALUE`/`RANGE`/`PARAM`，取值描述落 `value_json` |
| R4 | 在角色中指定实体的授权范围；被依赖对象按授权对象的具体值获取相关查询条件 | 授权挂角色；依赖对象递归求值（`Access(U, X)` = 当前用户对被依赖实体 X 的可访问实例集合） |
| R5 | 同实体同字段可同时设授权范围与依赖对象，取**并集** | 同一 `(role, entity, attribute)` 的多条授权候选 + 依赖分支取 **OR** |
| R6 | 同角色同实体不同字段分别设范围，取**交集** | 同一角色对同一实体**不同纳入字段**的判定取 **AND** |
| R7 | 纳入管理的字段未配置 → 无权限 | 纳入后角色对某纳入字段既无授权候选又无依赖声明 → 该角色对该实体**整实体不可见**（fail-close） |

**核心判定公式**（用户 U 对实体 E 的行 r 是否可见）：

```
对实体 E，其纳入字段集 F_E = app_dsfield 中 (E) 的启用字段集
若 F_E = ∅（E 未纳入任何字段）   → 不对 E 做行级过滤（放行）                    [R1]
否则：
  对用户的每个角色 Ri：
    pass_i(f) = 授权分支 OR 依赖分支
        授权分支 = OR_{c ∈ C(f)}  通过(r.f, c)      ← C(f) 来自 app_role_fieldauth   [R5]
        依赖分支 = r.f ∈ Access(U, depend_entity_code)  ← 来自 app_dsfield 预声明    [R2/R4]
        C(f) = ∅ 且无依赖声明      → pass_i(f) = false（无授权）                   [R7]
    角色 Ri 对该行可见 ⇔ AND_{f ∈ F_E} pass_i(f)                                    [R6]
  行 r 对用户可见 ⇔ OR_{Ri ∈ 用户角色} (角色 Ri 对该行可见)   [同 scope_context 内跨角色并集]
```

> **操作上下文 `scope_context`**：数据权限的可见范围是**操作维度**而非"用户维度的全集"——
> 同一用户做"列表查询 / 审批 / 导出 / 审计追溯"应见**不同**的行集合（审批需更宽、导出需更严）。
> `scope_context` 由当前请求的 **API 端点 > 菜单操作 > 菜单** 解析（各承载表的 `app_scope_context_dict`，见 8.10/8.11/8.12），
> 未声明时默认 `ROW_QUERY`。行级预计算 `app_role_scopesql`（见 8.17）的键为 **(角色, 实体, scope_context)** 三元，
> **跨角色 OR 合流仅在同一个 `scope_context` 内**进行——不同上下文的预计算段互不合并。
>
> **三条不变式**：
> ① 权限**只经角色间接授予用户**——不存在"用户直挂菜单/操作/授权"的旁路（`app_role_user` 是唯一主体授权入口）；
> ② 功能、数据、字段三层权限**相互独立解析、叠加生效**——无菜单授权则接口不可调；数据权限按上表判定行可见；
> 有行可见但属性保密类型经个性化后使该角色不可见时，列不出现在结果集；
> ③ **同步资产只经发布同步变更**——`app` 域不存在第二条修改同步资产的路径（客户改动 = 物化脱离）。

---

### 8.1 app_system — 应用系统定义

> **应用系统**：一家客户的一次交付实例，是本层所有配置的**归属根**。系统初始化时创建，并据此实例化产品能力。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_system_id` | integer | PK | 主键，序列 `seq_app_system` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `system_code` | varchar(64) | UN, NOT NULL | 应用系统编码（如 `SYS_CUST_A_PURCHASE`） |
| `system_name` | varchar(128) | NOT NULL | 应用系统名称（如"A 集团采购管理平台"） |
| `customer_name` | varchar(128) | | 客户名称 |
| `app_systemstatus_dict` | varchar(64) | NOT NULL, DEFAULT 'INIT' | 系统状态（字典）：`INIT`（待初始化）/`ACTIVE`（已启用）/`SUSPENDED`（已停用）。`_dict` 字典引用 |
| `app_deploytype_dict` | varchar(64) | NOT NULL, DEFAULT 'PRIVATE' | 部署形态（字典）：`PRIVATE`（私有化单租户）/`SAAS`（SaaS 多租户，后续演进，见 1.8）。`_dict` 字典引用 |
| `init_release_id` | integer | | → `prod_release.release_id`（初始化所依据的产品发布版本，逻辑关联，见 12.1） |
| `initialized_ts` | timestamp | | 初始化完成时间（系统初始化流程写入） |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `description_txt` | text | | 系统说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：`system_code` **全局唯一**；`init_release_id` 记录"本实例从哪个产品版本实例化而来"，是**版本追溯与升级**的锚点（见 1.6）。

---

### 8.2 app_system_product — 应用系统-产品组合（多对多）

> 应用系统**启用了哪些产品**、以及各产品在本系统中的**启用版本**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `system_product_id` | integer | PK | 主键，序列 `seq_app_system_product` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（应用系统，逻辑关联，见 8.1） |
| `product_id` | integer | NOT NULL | → `prod_product.product_id`（启用的产品，逻辑关联，见 2.1） |
| `prod_release_id` | integer | | → `prod_release.release_id`（该产品在本系统启用的版本，逻辑关联，见 12.1；空 = 跟随最新版本） |
| `cfgpolicy_code` | varchar(64) | | → `prod_cfgpolicy.policy_code`（该产品在本系统采用的**配置策略**，跨域编码文本引用，见 6.10；空 = 不启用策略，菜单参数直接用产品默认） |
| `enabled_ts` | timestamp | | 启用时间 |
| `sort_order` | integer | | 排序（菜单/首页的产品展示顺序） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志（停用即下架该产品在本系统的功能） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_system_product` = `(app_system_id, product_id)`——同一系统对同一产品只登记一次。
> **配置策略选择**：`cfgpolicy_code` 是**系统×产品**粒度的策略选择（不同系统可各选不同策略；多产品系统按产品各选各的）——变更后须**重跑该产品的菜单同步**使 `app_menu.menu_param_json` 按新策略逐键物化（见 6.11 合并链）。
> **M:N 组合语义**：一家客户可组合多产品（多行同 `app_system_id`），一个产品可给多个客户（多行同 `product_id`）。
> 各产品的菜单（`prod_menu.product_id`）按本表启用的产品集合**合并呈现**给该应用系统。

---

### 8.3 app_event_config — 应用事件运行配置

> 产品层 `prod_eventsubscription` 定义了"事件 → 能力端点"的**订阅编排**；本表定义该订阅在**某个应用系统内的运行开关与策略**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `event_config_id` | integer | PK | 主键，序列 `seq_app_event_config` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（应用系统，逻辑关联，见 8.1） |
| `subscription_id` | integer | NOT NULL | → `prod_eventsubscription.subscription_id`（事件订阅，逻辑关联，见 6.8） |
| `app_subscriptiontype_dict` | varchar(64) | | 覆盖订阅方式（字典）：`SYNC`/`ASYNC`（空 = 继承产品定义）。`_dict` 字典引用 |
| `retry_cnt` | integer | | 覆盖消费失败重试次数（空 = 继承产品定义） |
| `config_json` | jsonb | | 应用级订阅参数（队列名、消费组、告警接收人等） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志（停用即本系统不消费该事件） |
| `description_txt` | text | | 配置说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_event_config` = `(app_system_id, subscription_id)`。

---

### 8.4 app_role — 应用角色定义

> **应用角色**：某应用系统内**实际使用**的角色。来源二选一——**同步**产品层标准角色（`STANDARD`，随发布同步落地、客户禁改），或**客户自建**（`CUSTOM`）。
> 角色的四张授权明细表（菜单/操作/字段授权/字段保密类型可见性）**全部落在本层**（见 8.4/8.6/8.7/8.16）——运行时权限引擎只读 `app_` 表。
>> **溯源方式**：以**标准编码文本 `std_role_code`** 溯源（不建跨域外键，`app` → `ddd`），辅以 `sync_release_no` 记录同步版本——产品升级按编码匹配重写。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_role_id` | integer | PK | 主键，序列 `seq_app_role` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（角色归属的应用系统，逻辑关联，见 8.1） |
| `role_code` | varchar(64) | NOT NULL | 角色编码（如 `ROLE_BUYER`，**应用系统内唯一**） |
| `role_name` | varchar(128) | NOT NULL | 角色名称（如"采购员"，可重命名以贴合客户习惯） |
| **`app_rolesource_dict`** | varchar(64) | NOT NULL | **来源**（字典 `ROLE_SOURCE`）：`STANDARD`（同步资产，客户禁改）/`CUSTOM`（客户自建）。`_dict` 字典引用 |
| **`std_role_code`** | varchar(64) | | **标准溯源编码（文本）**：→ `prod_role.role_code`（见 6.4，非外键）。**`STANDARD` 非空 / `CUSTOM` 必须为空**；物化时**清空**（见 8.0.1） |
| **`sync_release_no`** | varchar(64) | | 最近一次同步的发布版本号（`STANDARD` 非空） |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `description_txt` | text | | 角色说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - 联合唯一约束 `uk_app_role_code` = `(app_system_id, role_code)`（部分唯一索引 `WHERE delete_flag = 0`）；
> - **来源完整性 CHECK 约束**（约束名 `ck_app_role_source_std`，规范 §9.1）：
>   `(app_rolesource_dict = 'STANDARD' AND std_role_code IS NOT NULL) OR (app_rolesource_dict = 'CUSTOM' AND std_role_code IS NULL)`
> - **授权明细落点**：`STANDARD` 角色的授权明细**同步落在本层**（`app_role_menu`/`app_role_menu_op`/`app_role_fieldauth`/`app_role_fieldperm`）——保证运行时权限解析**单一数据源、不分叉**；
> - **不冗余预计算字段**：行级谓词预计算落独立表 `app_role_scopesql`（见 8.17），不塞进本表 jsonb 列——
>   避免角色基础属性高频写与预计算重算争行锁，且便于实体级索引/审计/灰度；
> - `role_code` 只需在**应用系统内**唯一（不同客户可有同名角色），与 `prod_role.role_code` **全局唯一**形成对比。

---

### 8.5 app_role_menu — 应用角色-菜单授权

> 应用角色**可访问的菜单**（双轨明细：`STANDARD` 角色的行由发布同步写入，客户禁改；`CUSTOM` 角色的行由客户维护）。
> 结构与 `prod_role_menu`（见 6.5）一致，仅归属不同（`app` 域、挂 `app_role`）。
>> 双轨明细：`STANDARD` 角色的行随同步写入，`CUSTOM` 角色由客户维护。菜单权限点的运行承载是 **`app_menu`**（见 8.10，同 id 同步），本表挂 `app_menu.menu_id`。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_role_menu_id` | integer | PK | 主键，序列 `seq_app_role_menu` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（应用角色，逻辑关联，见 8.4） |
| `menu_id` | integer | NOT NULL | → `app_menu.menu_id`（授权的菜单，逻辑关联，见 8.10） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_role_menu` = `(app_role_id, menu_id)`（部分唯一索引）；
> 菜单权限点定义仍是产品层资产（`prod_menu`，见 6.2），其运行承载为 `app_menu`（见 8.10），本表只登记**授权关系**。
> **菜单树授权传递与多产品裁剪**：存储逐行、UI 级联勾选、解析不做树传递（被授权菜单各占一行，存储即真源）；
> 菜单可见的必要条件是其**全部祖先均可见**；操作权限不继承菜单可见性。功能权限解析先按 `app_system_product`（见 8.2，启用 `enable_flag=1`）
> 的产品集裁剪（`app_menu.product_code` ∈ 启用产品集），再合并；停用产品即下架其菜单树，CUSTOM 授权行保留不删（解析期不可见）。

---

### 8.6 app_role_menu_op — 应用角色-菜单操作授权

> 应用角色**可执行的菜单操作**（双轨明细，同 8.5）。操作权限点的运行承载是 **`app_menu_op`**（见 8.11，同 id 同步）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_role_menu_op_id` | integer | PK | 主键，序列 `seq_app_role_menu_op` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（应用角色，逻辑关联，见 8.4） |
| `menu_op_id` | integer | NOT NULL | → `app_menu_op.menu_op_id`（授权的操作权限点，逻辑关联，见 8.11） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_role_menu_op` = `(app_role_id, menu_op_id)`（部分唯一索引）。
> **运行时功能鉴权**（统一走 `app` 域）：
> 引擎按「用户 → `app_role_user`（8.8）→ `app_role`（8.4）→ 本表 → `menu_op_id` → `app_menu_op.api_id`（8.11）→ `app_api`（8.12）」判定放行。

---

### 8.7 app_role_fieldauth — 应用角色字段授权候选
> 本表声明"某角色对某实体某**纳入字段**的**授权候选**"，是行级数据权限落到角色的落点。
>
> **授权候选仅承载"授权范围"**（`ALL`/`VALUE`/`RANGE`/`PARAM`，R3）；**依赖对象不在此登记**——
> 依赖是字段的固有语义，由 `app_dsfield.depend_entity_code`（见 8.9）在纳入侧预声明（R2/R4）。
> 来源二选一：`STANDARD`（随标准角色同步）/ `CUSTOM`（客户自建角色或物化后维护）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_fieldauth_id` | integer | PK | 主键，序列 `seq_app_fieldauth` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（所属角色，逻辑关联，见 8.4） |
| **`entity_code`** | varchar(64) | NOT NULL | 作用实体编码（文本引用实体运行注册，与 `app_dsfield.entity_code` 一致，见 8.9） |
| **`attribute_code`** | varchar(64) | NOT NULL | 作用字段编码（文本引用属性运行注册，**须已在 `app_dsfield` 纳入**，见 8.9） |
| **`app_fa_type_dict`** | varchar(64) | NOT NULL | **授权类型**（字典 `FA_TYPE`）：`ALL`（全部数据）/`VALUE`（指定值）/`RANGE`（指定范围）/`PARAM`（系统预定义参数）。`_dict` 字典引用。**依赖对象不在此枚举** |
| **`value_json`** | jsonb | | **取值描述**：`VALUE` 存值/值数组；`RANGE` 存 `{op, from, to}`（`op` ∈ `GT`/`GTE`/`LT`/`LTE`/`BETWEEN`）；`PARAM` 存参数编码（`$user`/`$orgs`/`$company`）；`ALL` 为 `null` |
| **`app_fa_source_dict`** | varchar(64) | NOT NULL | **来源**（字典 `FA_SOURCE`）：`STANDARD`（同步）/`CUSTOM`（自建/物化后）。`_dict` 字典引用 |
| **`std_auth_code`** | varchar(64) | | 标准溯源编码（文本）：`STANDARD` 非空 / `CUSTOM` 必须为空 |
| `sync_release_no` | varchar(64) | | 最近一次同步的发布版本号（`STANDARD` 非空） |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志：停用该候选 = 该候选不参与该字段的 OR 判定 |
| `description_txt` | text | | 授权说明（治理审计） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - `(app_role_id, entity_code, attribute_code)` **允许多行**——多条候选构成该字段的**授权范围 OR 依赖对象**并集（R5）；
> - 联合唯一 `uk_app_fieldauth` = `(app_role_id, entity_code, attribute_code, app_fa_type_dict, value_json)`（部分唯一索引）——防重复候选；
> - **纳入必查**：保存时校验 `(entity_code, attribute_code)` 已在 `app_dsfield`（见 8.9）启用登记，否则拒绝（**须先纳入再授权**）；
> - **来源 CHECK**（约束名 `ck_app_fieldauth_source`）：`(STANDARD AND std_auth_code IS NOT NULL) OR (CUSTOM AND std_auth_code IS NULL)`；
> - **类型一致性 CHECK**（约束名 `ck_app_fieldauth_type_value`）：`app_fa_type_dict` 仅取 `ALL`/`VALUE`/`RANGE`/`PARAM` 之一；
> - **DEPEND 不再是授权类型**：若字段在 `app_dsfield` 预声明了依赖对象，本表只配授权范围候选，
>   行级引擎把"依赖分支"与"授权分支"按 **OR** 合成（见 §8.0.2 判定公式）；
> - **纳入但未授权 = 无权限**（R7）：字段纳入后角色无任一候选且无依赖声明 → 该角色对该实体整实体不可见（fail-close）。

---

### 8.8 app_role_user — 用户-角色分配

> 应用系统内**用户与角色的分配关系**（RBAC 的"主体授权"落点）。用户体系为外部 `app.user_id`，本表只登记归属关系。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `role_user_id` | integer | PK | 主键，序列 `seq_app_role_user` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（应用系统，逻辑关联，见 8.1） |
| `user_id` | integer | NOT NULL | → `app.user_id`（被授权用户，外部用户体系，逻辑关联） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（授予的角色，逻辑关联，见 8.4） |
| `grant_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 授权时间 |
| `expire_ts` | timestamp | | 失效时间（空 = 长期有效） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_role_user` = `(app_system_id, user_id, app_role_id)`（部分唯一索引）；一个用户可持多个角色，
> 其**最终权限 = 各角色权限的并集**。
>
> **数据权限的多角色合流规则**（关键）：多角色对同一实体指定不同范围时，取**并集（OR 拼接）**——
> 但**仅在同一个 `scope_context` 内**合流（见 §8.0.2）：不同操作上下文（查询/审批/导出/审计）的预计算片段**语义不同、互不合并**，
> 各自走各自的 `app_role_scopesql`（见 8.17）预计算段。
>
> **fail-close 兜底**：用户在应用系统内**未持有任何有效角色**时，纳入行级管理的实体**全部不可见**（默认安全）；
> `expire_ts` 已过期或 `enable_flag=0` 的归属行不进角色集。
>
> **唯一入口**：`app_role_user` 是**主体授权的唯一入口**——不存在"用户直挂菜单/操作/字段授权"的旁路。

---

### 8.9 app_dsfield — 字段纳入权限管理清单
> 本表登记"哪些实体的哪些字段**纳入行级权限管理**"，是数据权限的**纳入清单**（R1）。
>
> **纳入清单**：与 `app_role`（8.4）同构地分双轨——`STANDARD`（产品预置纳入哪些敏感/隔离字段，随发布同步）/ `CUSTOM`（客户追加纳入）。
> 实体**至少登记一个纳入字段**才受行级管辖；完全未纳入的实体/字段**不做行级过滤**（放行）。
> 与 `app_role_fieldauth`（8.7，角色对该字段的授权候选）构成"**先纳入、后授权**"两步式。
>
> **依赖对象预声明**：当某字段的值**指向另一实体**（外键/参与方）时，其可见性取决于当前用户对被依赖实体的可访问实例集合。
> 依赖是字段的**固有语义**，在**纳入阶段预声明**（`depend_entity_code` 等四列），不由角色授权临时决定——
> 使依赖图稳定、可发现、可治理、可审计、可环检测。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_dsfield_id` | integer | PK | 主键，序列 `seq_app_dsfield` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| **`entity_code`** | varchar(64) | NOT NULL | 纳入实体编码（文本引用实体运行注册，如 `purchase_order`） |
| **`attribute_code`** | varchar(64) | NOT NULL | 纳入字段编码（文本引用属性运行注册，如 `dept_id`、`applicant_id`、`status`）。字段须为**可作 where 条件的标量/FK/参与方字段** |
| `datatype_code` | varchar(64) | | 字段数据类型编码（冗余，便于授权值域校验） |
| **`app_dsf_source_dict`** | varchar(64) | NOT NULL | **来源**（字典 `DSF_SOURCE`）：`STANDARD`（同步）/`CUSTOM`（自建）。`_dict` 字典引用 |
| **`std_field_code`** | varchar(64) | | 标准溯源编码（文本，`<entity_code>.<attribute_code>`）：`STANDARD` 非空 / `CUSTOM` 必须为空（物化时清空） |
| `sync_release_no` | varchar(64) | | 最近一次同步的发布版本号（`STANDARD` 非空） |
| **`depend_entity_code`** | varchar(64) | | **依赖对象实体编码**（见 §8.0.2 R2/R4）：本字段指向的被依赖实体编码（文本引用实体运行注册，可为 `app_org`、`project`、`company` 等）。空 = 不预声明依赖。**禁止指向本实体自身** |
| **`via_attribute_code`** | varchar(64) | | **关联键**（`depend_entity_code` 非空时相关）：本字段在**被依赖实体**上的关联键编码（缺省 = 被依赖实体主键） |
| **`include_child_flag`** | smallint | NOT NULL, DEFAULT 0 | 含下级标志（`depend_entity_code = 'app_org'` 时生效，沿 `app_org.org_path_txt`（见 8.13）展开含下级；其余恒 `0`） |
| **`depend_description_txt`** | text | | 依赖关系说明（治理审计） |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志：停用该纳入登记 = 该字段退出行级管辖（`F_E` 剔除） |
| `description_txt` | text | | 纳入说明（为何纳入治理） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - 联合唯一约束 `uk_app_dsfield` = `(app_system_id, entity_code, attribute_code)`（部分唯一索引 `WHERE delete_flag = 0`）；
> - **来源完整性 CHECK**（约束名 `ck_app_dsfield_source`）：`(STANDARD AND std_field_code IS NOT NULL) OR (CUSTOM AND std_field_code IS NULL)`；
> - **禁止自依赖 CHECK**（约束名 `ck_app_dsfield_no_self_dep`）：`depend_entity_code IS NULL OR depend_entity_code <> entity_code`；
>   **依赖环检测**（A→B→…→A）在配置期完成（拓扑排序 / 递归标记），命中即拒绝保存；**依赖深度上限建议 ≤ 4 层**，防递归爆炸；
> - **未纳入即不受控**：字段不在本清单 → 该字段不产生行级约束；实体无任何纳入字段 → 整实体不参与行级过滤（R1 放行）；
> - **纳入字段的合法性**：`attribute_code` 须存在于该实体的**属性运行注册**且可查询（非纯展示/非已废弃），校验结果供审计；
> - **纳入可独立于角色物化**：`STANDARD` 纳入行可单独物化为 `CUSTOM`，或客户直接自建 `CUSTOM` 纳入行——纳入与角色授权解耦。

---

### 8.10 app_menu — 菜单权限点（运行承载）

> > 菜单权限点：RBAC 权限树的**骨架节点**——管"**能看到什么功能**"。
> 产品侧标准定义在 `prod_menu`（见 6.2），本表为其**运行承载**，**与产品标准定义同 id 同步**，**整表客户禁改**。
> 运行时权限引擎与授权配置（`app_role_menu`，见 8.5）**只从本表取数**，不跨域直读 `prod_menu`。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `menu_id` | integer | PK | 主键（**与产品标准定义 `prod_menu.menu_id` 同 id 同步**） |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4，跨库稳定锚点） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| `menu_code` | varchar(64) | NOT NULL | 菜单编码（**应用系统内唯一**，如 `MENU_ORDER_LIST`） |
| `menu_name` | varchar(128) | NOT NULL | 菜单名称（如"采购订单"） |
| `parent_menu_id` | integer | | → `app_menu.menu_id`（父菜单，构成菜单树；根为空） |
| `product_code` | varchar(64) | NOT NULL | 所属产品编码（文本引用 `prod_product.product_code`，见 2.1；供按启用产品集裁剪，见 8.2） |
| `page_code` | varchar(64) | | 菜单打开的页面编码（文本引用 `ui_page.page_code`，见 7.1；多个菜单可指向同一页面，靠 `menu_param_json` 区分入口） |
| `menu_param_json` | jsonb | | 入口参数：列表默认过滤、字段显隐、默认视图等；**物化取值** = 产品默认经所选配置策略逐键覆写后的结果（合并链见 6.11） |
| `menu_param_schema_json` | jsonb | | **入口参数 Schema**：对 `menu_param_json` 键值内容的结构化说明——逐键声明名称/类型/含义/默认值/可选值/必填性；为空表示无参数约定 |
| `menu_icon_txt` | text | | 菜单图标标识 |
| `route_path` | text | | 前端路由（如 `/order/list`） |
| **`app_scope_context_dict`** | varchar(64) | NOT NULL, DEFAULT 'ROW_QUERY' | **操作上下文**（字典 `SCOPE_CONTEXT`）：`ROW_QUERY`/`ROW_EXPORT`/`ROW_AUDIT`/`ROW_ADMIN`/`ROW_REPORT`。菜单级默认上下文，无操作级（8.10）覆盖时生效 |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `sync_release_no` | varchar(64) | NOT NULL | 最近一次同步的发布版本号 |
| `description_txt` | text | | 菜单说明 |
| `create_by` | integer | NOT NULL | 创建人（同步任务为写入人） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - 联合唯一约束 `uk_app_menu_code` = `(app_system_id, menu_code)`（部分唯一索引）；
> - `menu_param_json` 存**实际取值**、`menu_param_schema_json` 存**键值说明**，二者键集一致（保存/同步以 Schema 校验取值）；
> - **同步资产客户禁改**：本表与 `app_menu_op`/`app_api` 整表由发布同步任务写入，应用层拦截一切客户写操作；
>   产品侧删除的菜单同步置 `delete_flag=1`（逻辑删除，不物理删），CUSTOM 授权行引用自然失效（fail-close）；
> - 菜单树授权传递与多产品裁剪见 8.4 设计要点。

---

### 8.11 app_menu_op — 菜单操作权限点（运行承载）

> 挂在菜单下的**最小授权单元**（按钮/行内/批量/导出）——管"**能做什么动作**"。
> 产品侧标准定义在 `prod_menu_op`（见 6.3），本表为其**运行承载**，**同 id 同步**，**整表客户禁改**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `menu_op_id` | integer | PK | 主键（**与产品标准定义 `prod_menu_op.menu_op_id` 同 id 同步**） |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| `op_code` | varchar(64) | NOT NULL | 操作权限点编码（**应用系统内唯一**，如 `PERM_ORDER_SUBMIT`） |
| `op_name` | varchar(128) | NOT NULL | 操作权限点名称（如"提交订单"） |
| `menu_id` | integer | NOT NULL | → `app_menu.menu_id`（所属菜单，逻辑关联，见 8.10） |
| **`app_optype_dict`** | varchar(64) | NOT NULL | **标准操作代码**（字典 `OP_TYPE`）：`VIEW`/`ADD`/`EDIT`/`DELETE`/`IMPORT`/`EXPORT`/`CUSTOM`。`_dict` 字典引用 |
| **`app_menuoptype_dict`** | varchar(64) | NOT NULL | 操作形态（字典 `MENU_OP_TYPE`）：`BUTTON`（按钮）/`ROW`（行内）/`BATCH`（批量）/`OTHER`（其他）。`_dict` 字典引用 |
| `api_id` | integer | | → `app_api.api_id`（操作触发的后端端点，见 8.12；**纯前端操作为空**） |
| **`app_scope_context_dict`** | varchar(64) | NOT NULL, DEFAULT 'ROW_QUERY' | **操作上下文**（字典 `SCOPE_CONTEXT`）：`ROW_QUERY`/`ROW_EXPORT`/`ROW_AUDIT`/`ROW_ADMIN`/`ROW_REPORT`。**操作点层声明最准确**，覆盖其所属菜单的声明 |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `sync_release_no` | varchar(64) | NOT NULL | 最近一次同步的发布版本号 |
| `description_txt` | text | | 操作说明 |
| `create_by` | integer | NOT NULL | 创建人（同步任务为写入人） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_menu_op_code` = `(app_system_id, op_code)`（部分唯一索引）；
> `app_optype_dict`（语义归类）与 `app_menuoptype_dict`（呈现形态）**正交**；
> **接口级鉴权**沿「用户 → `app_role_user` → `app_role` → `app_role_menu_op` → `menu_op_id` → `api_id`」解析（见 8.5）。

---

### 8.12 app_api — API 端点（运行承载）

> REST API 端点的**运行承载**——引擎按本表注册路由与鉴权，仅定义权限鉴权所需最小列集。
> 产品侧标准定义在 `prod_api`（见 6.1），本表**同 id 同步**，**整表客户禁改**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `api_id` | integer | PK | 主键（**与产品标准定义 `prod_api.api_id` 同 id 同步**） |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| `api_code` | varchar(64) | NOT NULL | 端点编码（**应用系统内唯一**） |
| **`app_httpmethod_dict`** | varchar(64) | NOT NULL | HTTP 方法（字典）：`GET`/`POST`/`PUT`/`DELETE`。`_dict` 字典引用 |
| `api_path` | text | NOT NULL | 路由路径 |
| **`app_authtype_dict`** | varchar(64) | NOT NULL, DEFAULT 'TOKEN' | 鉴权方式（字典）：`TOKEN`（令牌）/`SESSION`（会话）/`OPEN`（开放接口）。`_dict` 字典引用 |
| **`app_callertype_dict`** | varchar(64) | NOT NULL, DEFAULT 'USER' | **调用方类型**（字典 `API_CALLER`）：`USER`（用户经界面）/`SYSTEM`（跨系统、第三方集成）/`INTERNAL`（**同一部署边界内**——同一 `app_system`（见 8.1）实例下的跨产品/跨模块服务间调用）。决定鉴权路径与可否挂权限点，见 6.1。`_dict` 字典引用 |
| **`app_apiscope_dict`** | varchar(64) | NOT NULL, DEFAULT 'PRODUCT' | 调用范围（字典 `API_SCOPE`）：`MENU`/`SUBJECT`/`PRODUCT`，三选一互斥。见 6.1 |
| `scope_menu_id` | integer | | → `app_menu.menu_id`（`MENU` 型目标菜单，见 8.10） |
| `scope_subject_code` | varchar(64) | | `SUBJECT` 型主题域编码（文本引用 `prod_subject.subject_code`，见 2.2） |
| `scope_product_code` | varchar(64) | | `PRODUCT` 型产品编码（文本引用 `prod_product.product_code`，见 2.1） |
| `rate_limit_per_min_uom` | integer | | 限流阈值（次/分钟） |
| **`app_scope_context_dict`** | varchar(64) | NOT NULL, DEFAULT 'ROW_QUERY' | **操作上下文**（字典 `SCOPE_CONTEXT`）：API 级上下文，**覆盖菜单/操作级声明**（提供外部调用边界） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `sync_release_no` | varchar(64) | NOT NULL | 最近一次同步的发布版本号 |
| `description_txt` | text | | 端点说明 |
| `create_by` | integer | NOT NULL | 创建人（同步任务为写入人） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_api_path_method` = `(app_system_id, api_path, app_httpmethod_dict)`（部分唯一索引）；
> 调用范围互斥 CHECK `ck_app_api_scope_mutex`（同 6.1，字段换为 `app_` 侧列名）。
> **鉴权四要素**：调用方类型（`app_callertype_dict`，管"谁在调"）+ 鉴权方式（`app_authtype_dict`，管"怎么验证身份"）+ 权限点控权（`app_menu_op`，管"谁有权执行"）+ 调用范围（`app_apiscope_dict`，管"在哪个业务边界内暴露"）。
> **放行规则**：`USER` 型端点四项全过才放行；`SYSTEM`/`INTERNAL` 型端点**不参与权限点控权**（无菜单可挂），按鉴权方式 + 调用范围 + 凭证/服务授权判定。
> `SYSTEM` 型端点面向第三方，凭证体系（`app_api_credential`）为 v2 演进项（见 8.20）。
>
> **`INTERNAL` 型（同系统跨产品微服务互调）的运行期口径**——**部署边界 = 同一 `app_system` 实例**（见 8.1）：
> 跨产品即经 `app_system_product`（见 8.2）挂在同一实例下的多个产品之间互调；**不在同一 `app_system` 实例的，一律按 `SYSTEM` 处理**。
> - **必须登记**：被调能力只要对外有 HTTP 端点，就须在本表有一行——否则引擎不注册路由与鉴权，端点处于裸奔状态。**登记的是端点，不是调用关系**（本模型不建调用拓扑表）；
> - **要鉴权，不过 RBAC**：调用方须出示服务身份凭证，引擎校验产品身份与授权范围；功能权限不入 RBAC 树，粗粒度控权由 `app_apiscope_dict` = `PRODUCT`/`SUBJECT` 承担；
> - **三项硬口径**：① **事件解耦优先**——能走 `app_event_config`（见 8.3）的不建 REST；② **不跨库强事务**——跨产品常对应跨 `pdm_database`（见 5.1），只做最终一致；③ **用户上下文透传**——调用携带原用户标识（on-behalf-of），被调侧**继续按 `app_scope_context_dict` → `app_role_scopesql`（见 8.17）解析行级范围**，禁止借服务身份规避数据权限。仅真·机器场景（批处理/同步）允许纯服务身份执行，且须显式声明并留痕。
>
> **调用方类型与运行时链路的边界**：RBAC 解析链「用户 → 角色 → 角色菜单操作 → `menu_op_id` → `api_id`」（见 8.6）**只覆盖 `USER` 型端点**；`SYSTEM`/`INTERNAL` 型端点在 `app_menu_op` 中**没有对应记录**，属预期状态，不可据此判定为配置缺失——但**这不代表数据权限失效**，见上条。
> **领域内编排不进本表**：跨聚合同步编排由业务服务（`prod_service`，见 2.8）承载，异步由事件订阅（`app_event_config`，见 8.3）承载，均不产生端点记录；`INTERNAL` 型仅用于内部亦以 HTTP 暴露端点的场景。

---

### 8.13 app_org — 组织机构定义

> 应用系统内的**组织树**（公司/部门/虚拟组），是系统预定义参数 `$orgs`/`$company` 的**取值数据源**。
> **最小镜像**——只存权限链路必需字段，不复制 HR 主数据（用户主数据保持外部 `app.user_id`，本模型**不建用户表**）。
> 维护方式二选一：`LOCAL`（平台内自维护）/ `EXTERNAL`（客户主数据/HR 系统同步，本表只读）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `org_id` | integer | PK | 主键，序列 `seq_app_org` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| `org_code` | varchar(64) | NOT NULL | 组织编码（**应用系统内唯一**） |
| `org_name` | varchar(128) | NOT NULL | 组织名称（如"华东大区/采购部"） |
| `parent_org_id` | integer | | → `app_org.org_id`（父组织，自引用构成组织树；根为空）。**不允许环** |
| **`app_orgtype_dict`** | varchar(64) | NOT NULL | 组织类型（字典 `ORG_TYPE`）：`COMPANY`（公司）/`DEPT`（部门）/`GROUP`（群组）/`VIRTUAL`（虚拟组织）。`_dict` 字典引用 |
| **`app_orgsource_dict`** | varchar(64) | NOT NULL, DEFAULT 'LOCAL' | 维护方式（字典 `ORG_SOURCE`）：`LOCAL`（平台内自维护）/`EXTERNAL`（外部同步，本表只读）。`_dict` 字典引用 |
| `external_org_code` | varchar(128) | | 外部系统组织编码（`EXTERNAL` 时非空，同步匹配锚点） |
| `org_path_txt` | text | | 物化路径（如 `/1/17/203/`），**含下级展开加速列** |
| `sort_order` | integer | | 排序 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志 |
| `description_txt` | text | | 组织说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_org_code` = `(app_system_id, org_code)`（部分唯一索引）；
> `org_path_txt` 使"本部门及下级"展开为一次前缀匹配；`EXTERNAL` 子树由同步任务维护，平台侧禁改。

---

### 8.14 app_org_user — 用户-组织归属

> 用户与组织的**归属关系**（多对多，一用户可属多部门，其一为主属），是 `$orgs`/`$company` 的解析来源。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `org_user_id` | integer | PK | 主键，序列 `seq_app_org_user` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（应用系统，逻辑关联，见 8.1） |
| `user_id` | integer | NOT NULL | → `app.user_id`（用户，外部用户体系，逻辑关联） |
| `org_id` | integer | NOT NULL | → `app_org.org_id`（归属组织，逻辑关联，见 8.13） |
| `primary_flag` | smallint | NOT NULL, DEFAULT 0 | 主属标志：`1` 主属部门（每用户每系统**至多一个**）/ `0` 兼属 |
| `orgpost_txt` | text | | 组织内职务名称（展示用，不参与鉴权） |
| `effective_ts` | timestamp | | 归属生效时间（空 = 即生效） |
| `expire_ts` | timestamp | | 归属失效时间（空 = 长期有效） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_org_user` = `(app_system_id, user_id, org_id)`（部分唯一索引）；
> 主属唯一性由部分唯一索引 `(app_system_id, user_id) WHERE primary_flag = 1 AND delete_flag = 0` 保障；
> 用户在系统无任何有效归属时，`$orgs`/`$company` 解析为**空集**（该授权候选贡献恒假，fail-close）。
>
> **系统预定义参数解析契约**（授权类型 `PARAM` 的取值源，见 8.6）：
>
> | 参数编码 | 语义 | 引擎解析来源 |
> |---|---|---|
> | `$user` | 当前用户 | 请求上下文 `user_id` |
> | `$orgs` | 用户全部直接归属组织 | `app_org_user`（全部有效归属）∩ `app_org.enable_flag=1`（**不含下级**；需"含下级"时在 `app_dsfield` 把 `depend_entity_code` 预声明为 `app_org` 且 `include_child_flag=1`） |
> | `$company` | 用户所属公司 | `app_org_user` 归属中的 `COMPANY` 祖先 |
> | `$system` | 当前应用系统 | 请求上下文 `app_system_id` |
>
> 参数编码由平台预置注册（种子，不可改名）；**系统预定义参数只用于授权取值，不进入字段纳入清单**。

---

### 8.15 app_fieldperm — 属性保密类型个性化（升级/降级）

> **本表不做"全局呈现策略映射"，只做属性级的保密类型个性化**。某属性的保密类型在建模时已定（`cdm_entity_attribute.cdm_sensitivelevel_dict`，见 3.4），
> 本表登记的是：**本应用系统认为该属性应当按哪一档保密类型对待**——即对该属性**逐条升级或降级**。它是**运行期的合规个性化决定**，不是呈现策略定义。
>
> **为什么不是"类型 → 动作"的映射表**：呈现动作随**渲染场景与角色**而变——同一档类型在不同界面的处置本就不同（列表页 `MASK`、详情页经权限 `VISIBLE`、导出 `HIDDEN`），
> 把它固化成"某类型 = 某动作"的全局映射，既表达不了界面差异，又与角色覆盖（`app_role_fieldperm`，见 8.16）职责重叠。
> 因此：**属性保密类型个性化 → 本表；呈现动作 → 由查询结果装配层按约定分档规则与角色可见性执行（见 8.15.1）**。
>
> **本表是应用侧治理配置，不是标准同步资产**：个性化**随客户合规要求与业务实质而变**（同一套模型，A 客户认为客户编码可公开、B 客户视为内部资料），
> 因此**概念层不设对应表**（原 `cdm_fieldperm` 已删除）；本表由本环境的治理/实施人员直接维护，**不在发布同步范围内、不被同步重写覆盖**。
> 与行级数据权限（`app_dsfield` + `app_role_fieldauth`，管"行是否可见"）**正交、独立解析**。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_fieldperm_id` | integer | PK | 主键，序列 `seq_app_fieldperm` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（归属的应用系统，逻辑关联，见 8.1） |
| **`entity_code`** | varchar(64) | NOT NULL | 实体编码（文本引用 `cdm_entity.entity_code`，见 3.2；跨域以编码文本表达，不建跨域外键） |
| **`attribute_code`** | varchar(64) | NOT NULL | **属性编码**（文本引用 `cdm_entity_attribute.attribute_code`，见 3.4；本表的作用对象是**属性级**） |
| `attribute_name` | varchar(128) | | 属性名称冗余（便于本环境维护与列表展示，不参与解析） |
| **`app_sensitivelevel_dict`** | varchar(64) | NOT NULL | **本系统为该属性指定的保密类型**（字典 `SENSITIVE_LEVEL`）：`L1`（公开）/`L2`（内部）/`L3`（机密）/`L4`（绝密）。`_dict` 字典引用 |
| **`cdm_sensitivelevel_dict`** | varchar(64) | NOT NULL | **建模基线类型快照**（= 建模时 `cdm_entity_attribute.cdm_sensitivelevel_dict` 的值；同步/维护时快照，供升级/降级比对与审计追溯） |
| `adjust_reason_txt` | text | | 调整理由（合规依据/业务判断，如"客户合规要求该字段不得对外"） |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志（停用即回落建模基线类型） |
| `description_txt` | text | | 说明 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - 联合唯一约束 `uk_app_fieldperm_attr` = `(app_system_id, entity_code, attribute_code)`（部分唯一索引）——**一个属性在本系统至多一条个性化**；
> - **升级 / 降级由两列比对得出**：`app_sensitivelevel_dict` 与 `cdm_sensitivelevel_dict` 相比——等级序更高为**升级**（`L1<L2<L3<L4`），更低为**降级**，相等表示"显式确认不变"；
> - **生效链（低 → 高）**：`cdm_entity_attribute.cdm_sensitivelevel_dict`（建模基线）→ **本表个性化**（系统级，命中即以其为"该属性的有效保密类型"）→ 角色覆盖（`app_role_fieldperm`，见 8.16，按**生效后的类型**匹配）；
> - **只登记例外，不做全量展开**：本环境未个性化的属性**不建行**，直接沿用建模基线——换回"未命中即用基线"，不依赖隐式缺省动作表；
> - **不定义呈现动作**：本表只回答"这个属性算哪一档机密"，**"怎么显示"由约定分档规则与角色覆盖共同决定**（见 8.15.1）；
> - **降级须留痕**：降级等于**放宽保护**（如 `L3`→`L2`），故 `adjust_reason_txt` 对降级行**必填**（保存校验强制），升级行可空；
> - **属性不存在时**：`attribute_code` 指向的属性在建模侧被删除/改名，本行由维护流程清理（发布同步不覆盖本表）；解析时命中不到属性则该行失效（fail-close，不放大可见性）。

#### 8.15.1 呈现执行口径（本表不定义动作）

| 关注点 | 落在哪 | 由什么决定 |
|---|---|---|
| **属性算哪一档机密** | **本表**（`app_sensitivelevel_dict`） | 系统级个性化：升级/降级建模基线 |
| **能看见哪些行** | `app_dsfield` + `app_role_fieldauth`（见 8.9/8.7） | 行级数据权限 |
| **该角色能否看某档字段** | `app_role_fieldperm`（见 8.16） | 角色 × 保密类型的覆盖 |
| **列最终怎么显示** | **查询结果装配层**按**约定分档规则**执行（见下）；`ui_fieldconfig`（见 7.6）可再叠加**显隐/只读**等界面呈现规则 | 生效保密类型 + 角色可见性 + 分档规则 |
| **是否加密存储** | 字段类型 `ENCRYPTED`/`HASH`（`ldm_datatype`，见第 4 章） | 建模选型时定死，**与本表无关** |

> **约定分档呈现规则**（引擎约定，**不落表**，取代原 `mask_pattern_txt` 列）：按属性**生效保密类型**执行——
> `L1`（公开）/`L2`（内部）→ `VISIBLE`；`L3`（机密）→ `MASK`（保留前 3 位，其余以 `*` 掩码）；`L4`（绝密）→ `HIDDEN`（列不出现在结果 JSON 键中）。
> **角色不可见优先于分档规则**（角色对该档类型判定不可见时按 `HIDDEN` 处理，取最严；未覆盖该档类型时走分档规则，见 8.16）；`ui_fieldconfig` 的显隐规则只做**收紧**不做放宽。
>
> **执行点与一致性**：脱敏/隐藏发生在**查询结果装配层**（`HIDDEN` 列不出现在 JSON 键中、`MASK` 按分档规则变换），**不改 SQL 选择列**（保持行数与行级过滤一致）、**不改存储**（密文由字段类型在写入时产生）；
> **导出与 API 一致**：`EXPORT` 型操作走同一判定链，防"界面脱敏、导出全量"旁路。


### 8.16 app_role_fieldperm — 角色-字段保密类型可见性

> 应用角色**能否查看某档保密类型的字段**（双轨明细：`STANDARD` 角色的行随同步写入，`CUSTOM` 角色由客户维护）。
> 本表只记"角色 → 保密类型"的覆盖关系；**该属性算哪一档**由 `app_fieldperm`（见 8.15）个性化后决定，**列怎么显示**由约定分档规则执行（见 8.15.1）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_role_fieldperm_id` | integer | PK | 主键，序列 `seq_app_role_fieldperm` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（角色，逻辑关联，见 8.4） |
| **`app_sensitivelevel_dict`** | varchar(64) | NOT NULL | 适用的**字段保密类型**（字典 `SENSITIVE_LEVEL`）：`L1`（公开）/`L2`（内部）/`L3`（机密）/`L4`（绝密）。`_dict` 字典引用。按字段**个性化后的生效类型**（见 8.15 生效链）匹配 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：联合唯一约束 `uk_app_role_fieldperm` = `(app_role_id, app_sensitivelevel_dict)`（部分唯一索引）；
> 一个角色可覆盖多个保密类型，按命中字段**个性化后的生效类型**取对应那条；该角色**未覆盖的保密类型不做额外列级限制**
> （列呈现由约定分档规则执行，见 8.15.1）。

---

### 8.17 app_role_scopesql — 角色×实体×上下文 预计算范围 SQL

> 把"角色 × 实体"的**行级谓词拼装**从**请求时**挪到**写入/变更时**（冷路径），显著降低 P95 延迟、简化引擎逻辑——
> 引擎由"实时解析"退化为"**参数绑定 + 拼接**"。
> 不放进 `app_role` 的 jsonb 列，是因为：① `app_role` 高频写基础属性，预计算重算会争行锁；② jsonb 数组内精细查询/索引受限；
> ③ 预计算是**派生态**，应独立生命周期（规则源删除时可保留以回溯）；④ 审计粒度能落到实体级；⑤ 支持按实体灰度/回滚。
>
> 预计算键为 **(角色, 实体, `scope_context`)** 三元——一个角色对同一实体在**每个操作上下文**各有一条预计算片段。
> 来源二选一：`STANDARD`（产品预置随同步）/ `CUSTOM`（客户规则变更或物化后由系统重算写入，客户不直维护此表）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `app_scopesql_id` | integer | PK | 主键，序列 `seq_app_scopesql` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（继承自 `app_role`，冗余便于按系统裁剪） |
| `app_role_id` | integer | NOT NULL | → `app_role.app_role_id`（所属角色，逻辑关联，见 8.4） |
| `entity_code` | varchar(64) | NOT NULL | 纳入清单覆盖的实体编码（与 `app_dsfield.entity_code` 一致） |
| **`scope_context_dict`** | varchar(64) | NOT NULL, DEFAULT 'ROW_QUERY' | **操作上下文**（字典 `SCOPE_CONTEXT`）：`ROW_QUERY`/`ROW_EXPORT`/`ROW_AUDIT`/`ROW_ADMIN`/`ROW_REPORT`。同一角色对同一实体在不同上下文下可有**不同预计算片段** |
| **`app_scope_source_dict`** | varchar(64) | NOT NULL | 来源（字典 `SCOPE_SQL_SOURCE`）：`STANDARD`（同步）/`CUSTOM`（客户规则变更/物化后由系统重算写入）。`_dict` 字典引用 |
| `std_scopesql_code` | varchar(128) | | 标准溯源编码（文本，`<role_code>:<entity_code>:<scope_context>`）：`STANDARD` 非空 / `CUSTOM` 必须为空 |
| `sync_release_no` | varchar(64) | | 最近一次同步的发布版本号（`STANDARD` 非空） |
| **`predigest_sql`** | text | NOT NULL | 已物化的行级谓词片段：**已展开**依赖对象为子查询、**已转译**授权范围（VALUE/RANGE/PARAM 字面量抽为命名参数）。所有字段名/比较运算符来自运行注册白名单，用户/组织值经命名参数 `:$user_id`/`:$orgs_path`/`:$company`/`:$now` 绑定 |
| **`fingerprint`** | varchar(256) | NOT NULL | 影响因子摘要（纳入字段集 + 授权候选编码集 + 依赖声明摘要 + `scope_context`），识别是否需要重算 |
| **`dep_graph`** | jsonb | | 该实体内字段的依赖声明快照，便于审计/重算 |
| **`hash`** | varchar(64) | NOT NULL | `predigest_sql` 的 SHA-256，与 `fingerprint` 联合判定是否需要重算 |
| **`recompute_ts`** | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最近一次重算时间 |
| **`app_scope_trigger_dict`** | varchar(64) | NOT NULL | 本次重算的触发原因（字典 `SCOPE_SQL_TRIGGER`）：`FIELD_AUTH_CHANGE`/`ROLE_AUTH_CHANGE`/`DS_FIELD_CHANGE`/`SYNC`/`MATERIALIZE`/`INIT`/`SCOPE_CONTEXT_CHANGE`。`_dict` 字典引用 |
| `enable_flag` | smallint | NOT NULL, DEFAULT 1 | 启用标志：停用该预计算 → 该 (角色,实体,上下文) **回退实时解析路径**（不影响其它上下文） |
| `description_txt` | text | | 说明（治理审计） |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **设计要点**：
> - 联合唯一约束 `uk_app_role_scopesql_role_entity_ctx` = `(app_role_id, entity_code, scope_context_dict)`（部分唯一索引 `WHERE delete_flag = 0`)；
> - **来源 CHECK** `ck_app_role_scopesql_source`；**白名单 CHECK** `ck_app_role_scopesql_whitelist`（`predigest_sql` 中出现的字段名必须在
>   `app_dsfield` 纳入白名单内，防重算时被篡改引入未纳入字段）；**触发器 CHECK** `ck_app_role_scopesql_trigger`；
> - **索引**：`(app_system_id, enable_flag)`（系统级批量拉取）、`(app_role_id, scope_context_dict, entity_code)`（引擎按上下文读取）、
>   `(app_role_id, recompute_ts DESC)`（审计/重算排程）；
> - **生成时机**（写时/变更时，非请求时）：`app_role_fieldauth` 增删改 → 受影响角色对该实体重算；
>   `app_dsfield` 增删改 → 受影响角色全实体重算；`app_role` 物化/停用/删除 → 该角色重算或软删；发布同步完成 → STANDARD 行按编码重写；
> - **生命周期独立**：`app_role` 删除时**不级联**本表，而是按 `app_grant_log` 留痕后软删除（`delete_flag=1`），便于回溯与回滚；
> - **重算与失效两阶段**：先重算并 UPSERT 本表，再发 UPC 失效事件，避免引擎读到旧 SQL；重算幂等（`fingerprint` + `hash` 一致则跳过）；
>   **失败兜底**：预计算失败 → 该行 `enable_flag=0` + `app_grant_log` 告警 → 引擎**回退实时解析路径**（§8.0.2），不阻断业务。

---

### 8.18 app_grant_log — 授权变更流水

> 所有权限**写操作**的**不可抵赖记录**——授权写路径统一埋点。
> 流水**只增不改不删**（无 update/delete/version），支撑历史时点回放与变更责任追溯。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `grant_log_id` | bigint | PK | 主键，序列 `seq_app_grant_log`（bigint，只增） |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（应用系统，逻辑关联，见 8.1） |
| **`app_grantaction_dict`** | varchar(64) | NOT NULL | 动作（字典 `GRANT_ACTION`）：`GRANT`/`REVOKE`/`MATERIALIZE`（物化）/`SYNC`（同步）/`RESET`/`ENROLL`（纳入登记）/`UNENROLL`（退出纳入）/`SCOPE_RECOMPUTE`（预计算重算）/`SCOPE_CONTEXT_CHANGE`（操作上下文变更）。`_dict` 字典引用 |
| **`app_granttarget_dict`** | varchar(64) | NOT NULL | 目标类别（字典 `GRANT_TARGET`）：`ROLE_USER`/`ROLE_MENU`/`ROLE_MENU_OP`/`FIELDAUTH`（角色字段授权）/`DS_FIELD`（字段纳入）/`ROLE_FIELDPERM`/`ORG`/`ORG_USER`/`ROLE_META`/`FIELDPERM_META`/`SCOPE_SQL`。`_dict` 字典引用 |
| `target_table_name` | varchar(128) | NOT NULL | 被变更表 |
| `target_key_txt` | text | NOT NULL | 被变更对象主键值文本 |
| `operator_user_id` | integer | NOT NULL | 操作人（同步/系统流程记系统账号） |
| `target_user_id` | integer | | 被操作用户（`ROLE_USER`/`ORG_USER` 类非空） |
| `before_json` | jsonb | | 变更前快照（新增为 `null`） |
| `after_json` | jsonb | | 变更后快照（删除为 `null`） |
| `detail_json` | jsonb | | 批量/复合操作明细 |
| `grant_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 业务发生时间 |
| `remark_txt` | text | | 变更原因/工单号 |
| `create_by` | integer | NOT NULL | 操作人冗余（防改写追溯） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 落库时间 |

> **设计要点**：不设唯一约束；写入点含授权写接口、物化、纳入/退出纳入、发布同步（`SYNC`）、预计算重算（`SCOPE_RECOMPUTE`），
> 与业务变更**同事务**；查询索引 `(app_system_id, target_user_id, grant_ts)`、`(app_system_id, app_granttarget_dict, grant_ts)`。
> 物化追溯时 `before_json` 中的 `std_*_code` 是物化后**唯一溯源载体**。

---

### 8.19 app_cfgoverride — 应用侧配置覆盖登记

> 业务侧两级覆盖（`APPLICATION` / `USER`）的载体（见 1.7）。
> **与 `prod_cfgoverride`（见 12.3）的公共列结构一致**——消费侧对两表按**显式列清单**（非 `SELECT *`）做 `UNION ALL` 后按层级合并
> （PLATFORM → PRODUCT → SCENARIO → APPLICATION → USER），故**公共列（层级、定位三元组、`json_path_txt`、`override_json`、`cdm_status_dict`）必须保持一致**，否则 UNION 不成立。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `override_id` | integer | PK | 主键，序列 `seq_app_cfgoverride` |
| `row_uuid` | uuid | UN, NOT NULL | 全局行标识（UUID v4） |
| `app_system_id` | integer | NOT NULL | → `app_system.app_system_id`（覆盖归属的应用系统，逻辑关联，见 8.1） |
| **`app_overridelevel_dict`** | varchar(64) | NOT NULL | 覆盖层级（字典）：`APPLICATION`（应用系统级）/`USER`（用户级）。`_dict` 字典引用 |
| `target_schema_name` | varchar(64) | NOT NULL | 被覆盖对象 schema（如 `ddd` 的 `ui_page`） |
| `target_table_name` | varchar(128) | NOT NULL | 被覆盖对象表（如 `ui_page`、`ui_page_component`、`ui_datasource`） |
| `target_key_txt` | text | NOT NULL | 被覆盖对象主键值文本（如 `page_id=123`） |
| `json_path_txt` | text | NOT NULL | 覆盖点 JSON path（如 `layout_json.components[?(@.key=="list")].props`） |
| `override_json` | jsonb | NOT NULL | 覆盖值 |
| `cdm_status_dict` | varchar(64) | NOT NULL, DEFAULT 'DRAFT' | 状态（字典）：`DRAFT`（草稿）/`ACTIVE`（生效，参与合并）/`DEPRECATED`（废弃）。`_dict` 字典引用 |
| `create_by` | integer | NOT NULL | 创建人（app.user_id） |
| `create_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `update_by` | integer | NOT NULL | 最后修改人（app.user_id） |
| `update_ts` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 最后修改时间 |
| `delete_flag` | smallint | NOT NULL, DEFAULT 0 | 逻辑删除标志 |
| `version_cnt` | integer | NOT NULL, DEFAULT 0 | 乐观锁版本号 |

> **与 `prod_cfgoverride` 的差异（三点）**：
> ① `prod_cfgoverride` 有 `release_id`（固化进发布的版本锚点）、无 `app_system_id`；本表反之——有 `app_system_id`（覆盖归属哪个客户实例）、无 `release_id`（应用侧覆盖不参与产品发布）。
>    两表的**定位列（层级、定位三元组、`json_path_txt`、`override_json`、`cdm_status_dict`）一一对应**，消费侧按这 6 列的显式清单做 `UNION ALL`；
> ② 层级字段为 `app_overridelevel_dict`，取值域通过 CHECK **限定为 `APPLICATION`/`USER`**（共用同一 `cdm_dict` 枚举 `OVERRIDE_LEVEL`，
> `prod_cfgoverride.prod_overridelevel_dict` 则限定为 `PLATFORM`/`PRODUCT`/`SCENARIO`）。
>
> **联合唯一**：约束名 `uk_app_cfgoverride_target_path` = `(app_system_id, app_overridelevel_dict, target_table_name, target_key_txt, json_path_txt)`
> ——比 `prod_cfgoverride` 多一个 `app_system_id`（不同客户实例的同一覆盖点互不冲突）。

---

### 8.20 本章 v2 演进预留（不落 v1 DDL）

> 以下为**已知但本期不建表**的演进方向，登记以免重复设计（与《权限管理设计文档》§14 一致）。
>
> **业务策略的归属（先说清楚）**：随客户/产品/场景而变的**阈值与开关**属**运行期策略，不进建模资产**——模型层（`ddd`）只定义结构，不收录任何可变数值；客户差异一律落在应用侧（运行配置域）。场景层活动只描述规则本身（如"金额超过审批起点金额需二级审批"，见 2.5），**其中的数值由本层参数承载**。

| 方向 | 内容 | 触发条件 |
|------|------|----------|
| **岗位/用户组** | `app_position` + `app_position_role` + `app_user_position` | 批量换岗重配痛点 |
| **角色层级与继承** | `app_role.parent_role_id` 自引用 | 角色数量失控 |
| **互斥角色（SoD）** | `app_role_mutex` + 授予校验 + 持有检测 | 职责分离合规要求 |
| **依赖扁平化子查询** | 依赖深度超限时以子查询/SQL 片段表达；规则级否定 `NOT` | 深层依赖或取反过滤刚需 |
| **OPEN 接口凭证** | `app_api_credential`（client_code/api_key/secret_hash/scope_json/ip 白名单/限流/有效期） | 第三方接入增多 |
| **服务身份凭证与调用白名单**（`INTERNAL` 支撑） | `app_service_credential`（内部服务身份：service_code/secret_hash/ 归属 `app_system_id`）+ `app_api_service_grant`（端点 × 服务身份 授权白名单）。**v1 缺口**：`INTERNAL` 型端点（同系统跨产品微服务互调，见 8.12）**要求做服务身份鉴权，但 v1 无凭证载体**，暂以网关注入的内部服务标识 + 部署隔离兜底，属**已知弱化，上线前须补齐** | 同一实例内跨产品调用出现，或需要按产品粒度管控内部调用 |
| **调用链路追踪与留痕** | 内部调用（含 on-behalf-of 透传用户标识）的调用日志表，与链路追踪集成 | `INTERNAL` 调用增多、需审计"谁代谁执行" |
| **`scope_context` 维度扩展** | 字典 `SCOPE_CONTEXT` 增 `ROW_MOBILE`/`ROW_PC`/`ROW_API` 等 | 移动端 vs 桌面端、外部调用 vs 内部界面差异化 |
| **`app_role_fieldauth` 的上下文维度** | `app_role_fieldauth` 增 `scope_context_dict` 列 | 同角色在不同上下文需不同字段授权 |
| **角色组级预计算派生** | `app_role_group_scopesql`（角色组 × 实体 × 上下文） | 多用户共享相同角色组合 |
| **UPC 分布式缓存 / CDC 直推** | 用户权限上下文外置 Redis；`app_role_scopesql` 变更直推引擎 | 引擎水平扩容 / UPC 拉取成为瓶颈 |
| **业务策略参数表** | `app_policy_param`（`app_system_id` + `policy_code` + `param_json` + 覆盖层级，按应用实例差异化；可与 `app_cfgoverride` 同级共存但语义更聚焦）。**v1 缺口**：随客户/产品/场景而变的阈值与开关（审批起点金额、容差率、重试次数等，见 2.5）**不进建模资产**，v1 由应用侧自建参数配置承载（临时可存于 `app_cfgoverride`，见 8.19），平台无统一载体，属**已知简化** | 多客户差异化阈值成为常态，或需回答"某客户此刻的策略取值是什么" |

---
