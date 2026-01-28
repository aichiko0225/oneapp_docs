# OneApp 鸿蒙（HarmonyOS）工作步骤文档

## Step 0：前置约束与目标确认（必做）

- 目标
  - 在不破坏 Android/iOS 现有架构的前提下新增 HarmonyOS 支持
  - 首版功能可裁剪、可降级
- 约束
  - 不重写 Flutter 业务代码
  - 业务模块不得直接依赖平台插件
  - 鸿蒙首版不要求功能全量对齐
- 产出
  - 《鸿蒙首版功能白名单》
  - 《不支持/延后支持模块清单》

## Step 1：插件与平台能力盘点（P0）

- 1.1 插件全量清点
  - 对现有 Flutter 插件形成“插件→使用模块→平台支持矩阵”
  - 核心关注：地图/定位、推送、支付、存储、设备信息、媒体、车控
  - 产出：《插件→模块→平台支持矩阵表》
- 1.2 插件分级（强制）
  - L0：纯 Dart（直接复用）
  - L1：轻平台（需补鸿蒙实现）
  - L2：重平台（能力抽象 + 原生实现）
  - L3：强绑定（首版可能不支持）
  - 产出：《插件分级治理表》

## Step 2：平台能力抽象（架构改造核心，P0）

- 新增 Platform Capability Layer（统一能力抽象包）
  - 目录建议：
    - packages/platform_capability/{geo,push,payment,car_control,media,device,storage}
  - 定义跨端接口（示例）
    - GeoCapability.getLocation(), PushCapability.subscribe(), PaymentCapability.pay()
  - 强制规则
    - 业务模块不依赖任何平台插件
    - CLR 不直接引用 Android/iOS/HarmonyOS SDK
    - 所有平台能力通过 Capability 接口访问
    - Capability Interface 禁止暴露 Platform 类型（Context/Ability/Activity）
  - 产出：Capability 接口定义、依赖调整方案

### Step 2A：模块化适配约束（Harmony 优先）

- 基础设施层（basic_*）
  - 原则：尽量纯 Dart 实现，避免依赖任何原生平台能力
  - 目的：降低平台适配成本，保障 Harmony 接入可持续
- 工具与组件层（kit_*/ui_*）
  - 原则：不直接依赖平台插件；如需平台能力，必须经 Capability
  - 目的：保持 UI/工具层跨端一致性
- 服务连接层（clr_*）
  - 原则：仅通过 Capability 访问平台能力，不直接引用 Android/iOS/Harmony SDK
  - 目的：统一平台差异收敛点，避免平台污染
- 业务模块层（app_*）
  - 原则：只依赖 basic_*/kit_*/ui_*/clr_*，禁止互相强依赖
  - 目的：保证模块边界清晰、可裁剪、可灰度

验收要点
- basic_* 不含原生依赖
- kit_*/ui_* 不出现 Platform 类型（Context/Ability/Activity）
- clr_* 仅调用 Capability 接口
- app_* 无跨层直接依赖

## Step 3：CLR 模块改造（P0–P1）

- 去插件化
  - 将 clr_* 模块中的“直接插件/Native SDK 调用”替换为 Capability 调用
  - 适配模块：clr_geo、clr_account、clr_message、clr_charging、clr_touchgo、clr_wallbox、clr_carwatcher
  - Before：CLR → Plugin → Native
  - After：CLR → Capability → Platform Impl
  - 产出：CLR 重构完成，Android/iOS Capability 实现保持不变

## Step 4：HarmonyOS 宿主工程与 Flutter 引擎接入（P0）

- 4.1 宿主工程结构（建议）
  - Flutter 业务代码保持唯一真源
  - HarmonyOS 宿主与 Android/iOS 宿主同级或并列目录即可
  - 示例结构
    - oneapp/
      - flutter/
        - lib/
        - packages/
        - pubspec.yaml
      - host_android/
      - host_ios/
      - host_harmony/
  - 产出：《鸿蒙宿主工程结构与路径规范》
- 4.2 HarmonyOS 启动流程与参数策略
  - Harmony 宿主决定“给 Flutter 什么参数”
  - 启动流程
    - Harmony Ability
    - 初始化 Flutter Engine
    - 注入启动参数（appMode/featureFlags）
    - runApp(main.dart)
  - 最小启动策略（首版）
    - 只做三件事：启动 Engine、注册最小插件集合、指定初始路由
    - 启动参数语义
      - appMode：应用形态（如 harmonyLite）
      - featureFlags：模块开关（如 map/pay/carControl）
    - Harmony 宿主在 Engine 初始化阶段向 Flutter 注入启动参数
    - Flutter 启动后通过统一入口获取启动参数
    - Flutter 层保持完整 App，只是能力不可用或返回 not supported
    - iOS/Android 不改动，默认无 args
  - 产出：《Harmony 启动参数规范》《最小插件集合清单》

## Step 5：HarmonyOS 原生能力实现（P1）

- Capability 的鸿蒙实现
  - Geo → Map Kit
  - Push → Push Kit
  - Payment → IAP
  - Storage → Preferences
  - Device/Media/CarControl → 系统/厂商 API
  - 通过 MethodChannel 暴露给 Flutter
  - 产出：鸿蒙 Capability 实现代码（Flutter 侧透明）

## Step 6：模块级功能适配与裁剪（P1–P2）

- 首版必保模块（建议）
  - oneapp_main、app_home、oneapp_account
  - clr_account / clr_geo / clr_message
  - app_car / app_charging（基础能力）
- 可延后模块
  - app_avatar、app_rpa、app_vur、3D/AI/音视频增强模块
- 策略
  - 模块级 feature flag
  - UI 隐藏 / 功能降级
  - 产出：鸿蒙首版功能闭环

## Step 7：分阶段落地顺序（强执行）

- 阶段 1（POC）
  - 新建 host_harmony
  - Flutter 首页跑通
  - 只接入：网络、存储、账号
  - 产出：鸿蒙最小可运行包
- 阶段 2（核心可用）
  - 跑通：app_home、app_discover、clr_account、clr_message
  - UI 完整，部分按钮 disabled 或降级
  - 产出：核心场景闭环
- 阶段 3（逐模块放开）
  - 每新增模块：宿主补插件、Flutter 放 feature flag、打通 clr → app
  - 启动参数示例
    - appMode: "harmonyLite"
    - featureFlags: { map: false, pay: false, carControl: false }
  - 产出：模块级逐步放量清单

## Step 8：多宿主构建与 CI 约束（P1）

- 约束
  - flutter/ 目录为唯一真源
  - host_harmony 仅负责 Engine 初始化与插件注册
  - Flutter 代码不得 import host_harmony 相关实现
  - Capability 必须有 Android/iOS 默认实现
- 产出
  - Flutter lint / 构建校验规则

## Step 9：测试与稳定性验证（P2）

- 测试重点
  - Flutter 启动稳定性
  - MethodChannel 调用一致性
  - 权限 / 生命周期
  - 弱网 / 异常兜底
- 真机测试（必须）
  - 至少 2–3 款鸿蒙设备
  - 不以 Emulator 结论替代真机结果
  - 产出：测试报告与问题清单

## Step 10：上架与合规检查（P2）

- 审核重点
  - 权限最小化
  - 无动态代码下载
  - SDK 合规（华为生态）
- 发布
  - 华为应用市场
  - 首版灰度发布
  - 产出：合规材料与发布记录
 
## 附录：可视化补充（可直接插入评审材料）

### 附录 A：多宿主 + Flutter 架构示意

```text
                  ┌───────────────┐
                  │   Flutter UI  │
                  │   lib/*       │
                  └───────┬───────┘
                          │ Capability 接口
          ┌───────────────┴─────────────────┐
          │                                 │
      ┌───▼─────────┐                   ┌───▼─────────┐
      │  Android    │                   │   iOS       │
      │ Platform Impl│                  │ Platform Impl│
      └─────────────┘                   └─────────────┘
                          │
                          │
                  ┌───────▼───────────┐
                  │ HarmonyOS Platform│
                  │ Impl (ArkTS/Java) │
                  └───────────────────┘
```

- Flutter 层唯一真源，业务模块不依赖平台
- Capability 层统一接口访问原生能力
- HarmonyOS / Android / iOS 只提供实现

### 附录 B：HarmonyOS 启动流程图

```text
┌─────────────────┐
│ Harmony Ability  │
└─────────┬───────┘
          │ 初始化 Flutter Engine
          ▼
┌─────────────────────────┐
│ 注入启动参数 initialArgs │
│ appMode / featureFlags   │
└─────────┬───────────────┘
          │ 注册最小插件集合
          ▼
┌───────────────────┐
│ runApp(main.dart) │
│ Flutter 层启动     │
└───────────────────┘
```

- 初版策略：只启动 Engine、注册最小插件、指定初始路由
- Flutter 层保持完整 App，可根据 featureFlags 降级模块

### 附录 C：Feature Flags 可视化表

| 模块             | 首版状态 | 功能降级 / UI 隐藏 |
|------------------|----------|-------------------|
| map              | false    | 隐藏地图按钮      |
| pay              | false    | 禁用支付入口      |
| carControl       | false    | 禁止操作车辆      |
| oneapp_main      | true     | -                 |
| app_home         | true     | -                 |
| oneapp_account   | true     | -                 |
| clr_account      | true     | -                 |
| clr_geo          | true     | -                 |

启动参数示例：

```dart
{
  "appMode": "harmonyLite",
  "featureFlags": {
      "map": false,
      "pay": false,
      "carControl": false
  }
}
```

### 附录 D：分阶段落地甘特/流程示意

```text
阶段 1：POC (新建 host_harmony)
 ├─ Flutter 首页跑通
 ├─ 最小插件集合
 └─ 网络 / 存储 / 账号模块可用

阶段 2：核心可用
 ├─ app_home、app_discover
 ├─ clr_account / clr_message
 └─ UI 完整，部分按钮 disabled

阶段 3：逐模块放开
 ├─ 每新增模块宿主补插件
 ├─ Flutter 放 feature flag
 └─ 打通 clr → app
```

阶段对应产出：
- POC → 鸿蒙最小可运行包
- 核心可用 → 核心场景闭环
- 模块放开 → 模块级逐步放量清单

## 参考资料（官方）

- HarmonyOS 开发者官网：https://developer.harmonyos.com
- OpenHarmony 文档中心：https://docs.openharmony.cn
- DevEco Studio（IDE）：https://developer.huawei.com/consumer/cn/deveco-studio
- 华为应用市场审核规范：https://developer.huawei.com/consumer/cn/doc/app

