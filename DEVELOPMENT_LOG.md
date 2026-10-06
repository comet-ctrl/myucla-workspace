# 本地开发更新日志

建立日期：2026-10-05（America/Los_Angeles）。

这份文件记录 Derek 在首次 PR 之后提出的开发任务及完成情况，供后续开发接续使用。
历史条目根据本次会话及当前代码回填；无法确认的历史日期不补造。
日志不记录真实课程、账户内容或原生输入值。虚构页面验证不等于真实 MyUCLA 验证。

## 后续维护规则

- 每次完成用户要求的修改，在交付前同步更新本文件。
- 记录需求、实际实现、涉及文件、实际运行的验证、用户反馈与未完成事项。
- 后续修正单独记录，保留前一次尝试的局限，避免误认“已经验证通过”。
- 没有运行的测试不写通过；没有用户确认的真实页面效果不写已确认。
- 修改未提交、未推送、未创建 PR 时，明确说明本地状态。
- 开始新任务时按 AGENTS.md 阅读本文件，与当前代码及 Git 状态核对。

## 起点：首次 PR（背景，非本日志新增任务）

- PR： https://github.com/comet-ctrl/better-myucla-planner/pull/2
- 标题：Fill planner workspace viewport。
- 提交：12b4850，feat: fill planner workspace viewport。
- 用户分支：codex/derek-improvements；推送目标为 Derrick2007 的 fork。
- PR 目标分支为 comet-ctrl/v0.19-workspace。
- 已完成的功能：紧凑页头状态下工作区覆盖网页视口，移除外侧边距，随窗口尺寸变化适配；保留 Show header 与 Original layout。
- 用户通过真实浏览器试用反馈没有明显问题。PR 描述中原先的 live verification pending 可按用户实际测试范围更新；不能把作者试用写成他人 review approval。
- 此后下列代码修改截至本日志建立时仍在本地工作区，未由本轮提交或推送。因此不能认为它们已经进入上述 PR。

## 01 — 课程标题拖拽、颜色位置及课程工具简化

历史日期：未单独确认，发生于首次 PR 后、2026-10-05 前。

需求：在每张课程卡标题左侧提供拖拽排序；颜色选择器放在课程名字右侧；减少 Class actions 中的层级，并评估新增拖拽是否导致内存占用过大。

完成内容：

- 将已有课程拖拽入口投影到标题左侧，避免另建一套拖拽框架。
- 将原生颜色输入控件投影到标题右侧；保留原节点、父节点、form 关联及处理器。
- Class actions 改名为 Course tools。
- 去掉工具内部的第二层省略号菜单，直接展示 Move to top 与 Add or edit note。
- Move to position 加上明确标签，留在工具区域作为不使用拖拽时的替代方式。用户最初希望取消 #1，但最终实现保留了此替代入口；不要误写为已经删除。
- 拖动期间只保存最新指针位置，由已有 requestAnimationFrame 循环每帧更新。
- 目标索引不变时跳过重复样式更新，释放指针时应用最后位置；完成或取消时清理动画及临时样式。
- 保留原有排序保存确认与严格原生上下按钮合约；拖动预览本身不自动保存至 MyUCLA。

涉及文件：public/injected.css、public/dark.css、src/content/myucla-controller.ts、src/content/planner-workspace.ts、对应 controller/workspace 测试；新增 harness/verify-course-title-tools.mjs。

验证：虚构页面覆盖 1440、960、390px；检查拖拽入口/颜色位置、直接工具入口、10 次实际鼠标交换排序、节点身份与 form 关联、无重复拖拽入口、无残留临时样式、无表单提交及 Original layout 恢复。

用户反馈：拖拽正常；初次颜色位置未生效，见下一条修正。

性能边界：验证了复用与清理行为，未做真实页面内存基准测试，不能声称具体降低了多少内存或绝不出现性能问题。

## 02 — 修正颜色仍在 Course tools 内的问题

需求：用户实际使用发现颜色仍在工具区域，而拖拽正常。

原因与修正：初次 CSS 假设颜色控件是特定 class 的直接子节点；改为匹配嵌套的 input[type=color]，并处理其包裹节点的显示方式，使原生控件投影到标题右侧。

涉及文件：public/injected.css、harness/verify-course-title-tools.mjs。

验证：虚构颜色控件使用不同 class 且带包裹节点，验证位置及原生节点身份不变；执行类型检查、测试与构建。

用户反馈：随后明确表示没有问题，截图显示颜色已经在标题右侧。

## 03 — 统一课程 section 状态高亮

需求：Enrolled Class Full 为绿色，但 Enrolled 的剩余名额/已占名额形式没有绿色；同时检查 Waitlist/Waitlisted 黄色、Closed 红色是否遗漏。

完成内容：

- 严格状态解析增加 Enrolled 与 Closed 的计数形式，而非仅处理 Open/Waitlist。
- Enrolled 的 Left 与 Taken 格式统一使用 enrolled 绿色。
- Waitlist/Waitlisted 的识别形式统一黄色，已知 Closed 形式统一红色。
- 保留原生状态文字和节点；只生成已有摘要的对应颜色，不把单个 section 状态推断为整门课程状态。
- 未知或矛盾计数仍返回中性结果。例如 Closed 却显示正数剩余名额时，不强行高亮。

涉及文件：src/content/section-status.ts、tests/content/section-status.test.ts、tests/content/workspace-status-summary.test.ts。

验证：新增计数形式参数用例与摘要颜色用例；检查重复挂载后原生内容不变。全套测试增加到 490 项，类型检查与构建通过。

用户反馈：表示没有问题，然后继续提出日历网格需求。

## 04 — 深色日历网格：初次修复及实际反馈

需求：dark mode 下 Schedule 网格线不明显。

初次处理：在原生时间/日期单元格内添加 inset 阴影，使边界可见且不增加尺寸，避免移动课程事件。

涉及文件：public/dark.css、harness/verify-dark-mode.mjs。

结果：用户反馈纵向边界出现，但横向小时线仍缺失。初次处理不完整，不能作为最终解决记录。

## 05 — 深色日历横向小时线修正

需求：用户提供浅色/深色对比，要求直接解决横线缺失。

完成内容：

- 将覆盖整日的 .timebox 背景改为透明，使底层原生小时表格线可见。
- 为 #gridDiv 内原生表格 td/th 设置深色下可见的边框颜色。
- 保留原生事件填充颜色、位置、尺寸和内联样式；仅 screen 生效，打印保留浅色布局。

涉及文件：public/dark.css、harness/verify-dark-mode.mjs。

验证：虚构页面增加底层小时表格、上层整日列的结构，检查列背景透明、小时线颜色、事件几何与原生颜色不变；覆盖 2048、1440、1280、390px 与 light/dark/system、打印及恢复。490 项测试、类型检查和构建通过。

用户反馈：后续截图可以看到横向网格线；没有另外单独文字确认此项。

## 06 — Added to Plan 反馈及展开操作区域适配

需求：新增到计划反馈、展开课程操作区域依赖外部 Dark Reader 呈现黑色，要求扩展自行提供浅色/深色及尺寸适配。

完成内容：

- 为已知 .message、.planClass、.enrl-plan-actions、原生 mobilemenupanel 结构补充背景、边框、间距和换行。
- 操作区域 flex 换行，使两列在小窗口中容纳；原生按钮/链接保持原父节点、form 关联、可见状态及处理器。
- 补充按钮尺寸限制、段落列表间距与链接呈现。
- 浏览器回归输出放到忽略的 harness/shots 内，避免将真实内容写进项目。

涉及文件：public/injected.css、public/dark.css、harness/verify-course-detail-actions.mjs、harness/verify-dark-mode.mjs。

验证：虚构操作区域覆盖四种宽度和原生重绘情形；验证节点身份、form 关联与没有动作重放。类型检查、490 项测试、构建通过。

用户反馈：light 模式正常，但 Add Class to Plan 的深色内部仍白色，后续修正见下。

## 07 — 嵌套白色背景修正与 Original layout 开关同步

需求一：深色 Add Class to Plan 内部白色未解决。

初次修正：针对已知 .planClass/.touchpanelmenu/.message 内嵌 div、table、td、header 等白色内联背景及文字增加覆盖，虚构测试加入嵌套白色结构。

结果：虚构页面通过，但用户真实截图依然白色；说明假设的包装结构不足。保留该失败反馈，见第 08 条最终扩大结构覆盖。

需求二：点击 Original layout 后，扩展弹窗的 Tidy up layout 开关仍为开。

完成内容：

- Original layout 恢复后保存 tidy=false。
- 返回工作区时保存 tidy=true；保存失败显示明确提示并恢复安全展示状态。
- popup 监听布局设置变化，同步更新 Tidy 复选状态；pagehide 清理监听。

涉及文件：src/content/planner-workspace.ts、src/popup/index.ts、public/dark.css、harness/verify-dark-mode.mjs、harness/verify-viewport-fill.mjs。

验证：六种视口的 Original 恢复与 tidy=false 存储断言；四种深色视口的嵌套背景检查；类型检查、构建及相关测试通过。后续全套测试暴露 appearance 测试存储模拟缺少 set，已在第 08 条补齐。

用户反馈：没有单独确认弹窗同步真实效果；深色内部白色仍未解决。

## 08 — 未知搜索响应容器与白色背景图片覆盖

完成日期：2026-10-05（本地日期）。

需求：用户仍看到白色面板，怀疑是白色贴图；链接局部已有黑色背景。

分析边界：截图不能确认是否是背景图片，也不能确定实际 DOM；此前规则只覆盖指定包装容器，而且未清除 background-image。

完成内容：

- 在已增强的搜索工作区内，对结构容器统一清除 background-image，并设置深色背景、文字与边框。
- 覆盖 div/table/thead/tbody/tfoot/tr/td/th/fieldset/header/footer，避免响应作为已知包装容器的兄弟节点时漏掉。
- 补充段落、列表、标签、标题与链接颜色和透明背景。
- 不修改日历事件颜色，也不改变控件属性、DOM 合约或原生动作。
- 虚构测试加入没有 .message/.planClass class 的兄弟响应容器，以及白色渐变背景图片。
- 补齐 planner-appearance 测试里的 chrome.storage.local.set 模拟，适配先前的 Original/返回工作区保存行为。

涉及文件：public/dark.css、harness/verify-dark-mode.mjs、tests/content/planner-appearance.test.ts。

验证：类型检查、构建、完整 490 项测试通过；四种窗口尺寸的背景图片清除、深色结构背景、light/system/print/恢复与原生节点回归通过。

用户反馈：最新截图面板背景已变为深色，但几个按钮仍为白色。背景修正有效，按钮修正见下一条。

## 09 — 搜索响应原生按钮深色配色

完成日期：2026-10-05（本地日期）。

需求：反馈和操作面板中 Close、Cancel 及其他动作按钮仍显示白底浅字，对比不足。

完成内容：

- 搜索工作区的 button 与 button/submit/reset 类型 input 使用完整 background 覆盖，清除原生白色渐变。
- 补充可读文字、边框与去除 text-shadow；按钮内 span/label 继承文字颜色。
- 可用按钮提供 hover 背景；disabled 或 aria-disabled=true 使用较暗表面和清晰但柔和的文字。
- 只调整呈现，不启用禁用按钮、不替换处理器，也不点击原生计划/注册操作。

涉及文件：public/dark.css、harness/verify-dark-mode.mjs。

验证：虚构页面新增白色渐变 button/input 与 disabled submit；检查 background-image=none、文字对比度至少 4.5:1、disabled 属性仍保留。四种视口与其他深色回归通过；类型检查、490 项测试、构建通过。

真实页面状态：已交付用户重新加载扩展并刷新页面验证；截至建立日志时尚未收到此项真实页面确认。

## 10 — 建立持续更新日志

完成日期：2026-10-05（本地日期）。

需求：在当前项目文件夹创建单独更新日志，详细回填 PR 后每次已完成任务，以后每次完成更新同步，减少上下文丢失。

完成内容：新增本文件 DEVELOPMENT_LOG.md；AGENTS.md 加入阅读本文件及完成更新后维护日志的明确要求。此次只改文档，不重复运行代码测试；上一项代码验证结果如上。

## 11 — Information & help 深色适配与 Layout settings

完成日期：2026-10-05（本地日期）。

需求：帮助页面标题、表格、正文深色适配不完整；尽可能检查可打开区域。将左下角 Default layout 和 Original layout 合并到 Layout settings，暂时只保留这两个动作。

完成内容：

- 仅在打开的 Information & help 区域覆盖原生结构背景、白色渐变、标题栏、表格单元格、低对比度正文和链接；保留原节点和处理器。
- 原来两个布局入口收进默认关闭的 Layout settings；展开显示原按钮，原行为保留，Escape 关闭并返回入口焦点。
- 折叠导航时入口显示设置图标，保留可访问名称。设置菜单使用浏览器顶层 popover 与视口内坐标，避免手机宽度被帮助面板遮挡。
- 测试发现初次内联菜单在 390px 被帮助面板遮挡，修正后四种宽度实际鼠标点击 Original layout 均通过；未使用强制点击绕过遮挡。

涉及文件：src/content/planner-workspace.ts、public/injected.css、public/dark.css、harness/verify-dark-mode.mjs。

验证：虚构页面覆盖 2048/1440/1280/390px，打开 Information、展开虚构帮助 disclosure、测量正文/标题/表格对比度至少 4.5:1、清除白色背景、打开/关闭 Layout settings、Escape 焦点及 Original 恢复。已查看虚构帮助页面截图。类型检查与构建通过；完整 490 项测试（34 个文件）通过。

检查范围：既有回归还覆盖课程详情、多详情导航、搜索反馈、Plan actions、日历、弹窗、light/dark/system、打印、原生身份与恢复。没有连接真实账户页面逐一点击所有入口；未操作注册/退课/删除/交换/候补，也未访问账户或外部帮助链接。不能声称覆盖真实网站全部可能性。

真实页面效果等待用户重新加载扩展并刷新确认。本轮修改未提交或推送。

## 12 — 帮助标题白条补齐与设置菜单外部关闭

完成日期：2026-10-05（本地日期）。

需求：用户实际截图中帮助页标题条仍白色；Layout settings 点击其他区域不关闭。

修正：此前仅覆盖结构容器背景，漏掉标题元素本身和自定义标题节点的背景。补充 h1–h6、原生自定义标题元素及该帮助区域内的 header/title class 表面，覆盖完整背景（含渐变）、文字和边框。只影响打开的帮助区域。

设置菜单由 manual popover 改为 auto，使用浏览器外部点击关闭行为；关闭后同步 details.open=false，保证入口与菜单状态一致；保留 Escape 和现有两个按钮行为。

涉及文件：public/dark.css、src/content/planner-workspace.ts、harness/verify-dark-mode.mjs。

验证：四种视口实际打开设置、点击帮助正文关闭、重新打开、Escape 关闭、再次打开并点击 Original 均通过；加入标题本身白色渐变、自定义标题及 h5 的回归，背景和至少 4.5:1 对比度检查通过；已查看虚构帮助截图。类型检查、490 项测试和构建通过。真实页面效果等待重载确认，未提交/推送。

## 13 — 帮助白条继续修正与 Optimizer 按钮

完成日期：2026-10-05（本地日期）。

用户反馈：第 12 条设置菜单外部关闭已确认正常；帮助标题条仍白色，新增报告 Optimizer 箭头和 Go 按钮白底浅字。

修正：帮助区从列举猜测标题标签改为覆盖打开的 right-sidebar 内非控件/链接/图标表面背景，不依赖未知标签命名。原生 input/select/textarea/button/a/i/svg 等使用独立样式。Optimizer 原生 button 和 button/submit/reset input 统一深色背景、文字、边框、hover/disabled，按钮图标继承可读颜色；不改变 disabled 或触发计算。

涉及文件：public/dark.css、harness/verify-dark-mode.mjs。

验证：虚构帮助区加入无标题 class 的未知自定义表面与 hgroup 白色渐变；Optimizer 使用已加载虚构面板，新增白色渐变箭头、返回和禁用动作控件，检查清除白底及至少 4.5:1 对比度，未点击计算按钮。2048/1440/1280/390px 回归通过；类型检查、490 项测试及构建通过。仍未检查真实页面 DOM，不能断言白条具体原生标签；真实效果需用户重载确认。

本轮未提交或推送。

## 14 — 帮助灰条的样式优先级与伪元素覆盖

完成日期：2026-10-05（本地日期）。

用户反馈：第 13 条后帮助白条仍存在，原生网页中这些条是灰色。

再次处理：帮助区域深色覆盖加入原生 #layoutContentArea ID，提高对 ID-scoped important 样式的优先级；同时清除非图标节点 ::before/::after 的背景图片、背景颜色和阴影，保留伪元素内容及布局。不修改注册或其他原生动作。

验证：虚构页面新增带 #widgetNeedHelp 的 important 灰色渐变规则及灰色 hgroup::before；验证标题暗色与伪元素透明，四种宽度通过。类型检查与构建通过，完整 490 项测试通过。

限制：尚未取得真实白条的 DOM 和最终计算样式，优先级/伪元素是本次覆盖的可能原因而非已确认根因。如仍失败，应检查实际元素及命中的 CSS，不再只用截图推断。未提交/推送。

## 15 — 根据实际 Shadow DOM 证据修复帮助标题

完成日期：2026-10-05（本地日期）。

已确认根因：用户开发者工具截图显示 iwe-widget 的 open shadowRoot 直接包含 div.iweWidgetTitle；其内部 style 设置 background-color:#f0f0f0。普通文档 CSS 不穿过 Shadow DOM，所以第 11–14 条的外部覆盖未解决真实标题条，不能将其写成已解决。

实现：PlannerAppearance 仅对打开的已识别帮助区 iwe-widget，检查 open shadowRoot 及直接子节点 div.iweWidgetTitle，插入一个扩展拥有的 screen-only style，设置标题背景/文字/边框及内部标题文字颜色。不读写标题内容、不移动原生节点、不修改事件或触发动作。

生命周期：浅色、关闭帮助区、Original layout、关闭 tidy 和 dispose 时移除拥有样式并断开对应观察器；组件重绘移除拥有 style 后，由 ShadowRoot 的 MutationObserver 恢复一份样式，无轮询和额外请求。监听 customElements.whenDefined 的完成，以处理组件定义时机；未知/closed Shadow DOM 不修改。

涉及文件：src/content/planner-appearance.ts、harness/verify-dark-mode.mjs。

验证：虚构帮助组件改为真正 open Shadow DOM，复现 #f0f0f0 内部样式；四种宽度验证暗色 rgb(32,45,60)、原节点身份、只有一个拥有 style、浅色与 Original 恢复 rgb(240,240,240)、重绘后恢复样式。类型检查、构建、完整 490 项测试通过；最终直接子节点检查调整后补跑 5 项外观生命周期测试通过。

真实页面需用户重新加载扩展并刷新确认。未提交/推送。

后续确认（2026-10-05）：用户明确反馈“没有问题了”，帮助页 Shadow DOM 标题深色修复已在真实页面确认。

## 16 — PR 前真实页面确认清单

整理日期：2026-10-05。已明确确认：课程拖拽、标题右侧颜色、课程状态整体高亮、Layout settings 入口与外部关闭、帮助标题最终 Shadow DOM 修复。后续截图显示日历横线已出现，但缺少单独文字确认。

仍需明确确认：Course tools 的直接置顶/备注及 Move to position 替代入口；日历缩放后网格；Original layout 与 popup Tidy 开关双向同步；搜索反馈按钮与课程展开操作区最终深色配色；Optimizer 按钮；light/dark/system 切换、窄窗口与 Original 恢复。Waitlisted/Closed 若当前页面没有对应状态，仅记录自动测试，不能声称真实验证。

不要求为验证改变真实注册状态或执行计算。内存量化、真实网站所有链接遍历不在已验证范围。当前未提交/推送；PR 准备阶段，先收集用户确认，再决定更新现有 PR 或另开 PR，避免未经核实将两者混淆。

## 17 — 用户验收与提交准备

日期：2026-10-05（本地日期）。

用户对第 16 条交付清单反馈“没有问题”；按其反馈记录本轮功能验收通过。备注操作逻辑仍不够清晰，用户明确要求本轮暂不解决，作为后续 UX 改进事项，不阻塞本轮 PR。不把此反馈扩大成所有原生网站入口、所有未出现状态或内存基准均已验证。

用户请求提交 PR 的操作流程；本轮尚未替用户执行 commit/push 或创建 PR。提交前需核实 PR #2 状态：若仍 Open，推送同一分支会更新它；若已合并，应另建基于最新目标分支的后续分支，避免混入首个提交。

## 当前交接与待确认事项

- 当前本地包含上述多项修改，尚未提交或推送，PR #2 不自动包含未提交改动。
- dist 已按第 09 条重新构建，仍是忽略的构建产物，不提交。
- 第 16 条清单已获用户总体确认；备注操作逻辑改进暂缓，见第 17 条。
- 若真实页面还有漏掉的区域，优先获取仅结构与计算样式的证据定位；不要把虚构测试通过当成真实页面问题必然已解决。
- 保留无鼠标拖拽的 Move to position 替代入口；未做真实内存量化测试。
- 最近截图中原生上下箭头在 Course tools 关闭时仍可见，用户尚未要求修改此项；后续如需调整先确认预期。
- 不执行注册/退课/删除/交换/候补动作，不增加轮询或请求，不保存真实课程或账户内容。


## 18 — Standalone repository and versioned branches

Date: 2026-10-05 (user local date).

Request: give branches meaningful version suffixes and move the latest independently developed workspace into a standalone repository.

Changes: preserved the local v0.19.4 work in a commit, fetched and merged contributor PR #2 (`b90faff`), resolved overlapping header/grid/appearance changes, and retained both histories. Created public `comet-ctrl/myucla-workspace`; its default branch is `workspace-v0.19.4`. Renamed all five historical fork branches using their package versions. Updated canonical source/issue links, package metadata, contribution guidance, CI branch coverage, README attribution and migration documentation. Historical releases remain in the fork; Pages deployment is manual. No license removal, history rewrite, account action, or installed-extension change.

Checks: typecheck, 565 unit tests, production build and regenerated fictional preview pass. Four-width dark mode, six-size viewport fill, three-width course tools and repeated local dragging pass. Updated browser restoration steps to open the contributor Layout settings menu. Combined authenticated-page verification remains pending; previous user acceptance does not establish acceptance of this merged build.

Final migration regression results: all ten header-reveal cases pass; all five calendar pixel/geometry cases pass, including a deliberately opaque overlay that reproduces the old missing-gridline problem. The overlay test now uses the same CSS importance as the merged rule so it genuinely exercises the negative control.


## 19 — MyUCLA Workspace product identity

Date: 2026-10-05 (user local date).

Request: make the standalone project the user's own product through consistent identity, documentation and workflow.

Changes: renamed the extension, popup and package to MyUCLA Workspace at v0.19.5; created an editable vector pane icon with generated Chrome PNG sizes; introduced an indigo/mint popup identity and shorter setting explanations; added source/issue/credit links. Renamed the optional Tidy label to Workspace layout, retaining all IDs, handlers, storage keys, message channels and page permissions. Rewrote the README and installation page, added CREDITS, documentation index, roadmap, issue templates and release checklist. Historical docs remain linked and explicitly labeled. Build output now carries the unchanged MIT LICENSE and credits; version tags prepare branded draft release ZIPs.

Verification: typecheck, 565 unit tests, production build and regenerated preview pass. One old popup copy assertion was updated for the new wording. Existing dark-mode browser checks pass at four widths. One-off branding checks verify all four icon sizes, original licensing in dist, unchanged manifest permissions/content-script matches, preserved saved preferences, popup controls and >=4.5:1 text contrast in both themes. Install page fits 1440/390px in both themes; screenshots inspected. Preview suite passes at 1440/1280/960/390px after using the current Layout settings menu to reach Original layout.

Delivery: workspace-v0.19.5 is the branded source branch; v0.19.4 remains the baseline. Packaged locally as myucla-workspace-v0.19.5.zip. No live account interaction, installed-extension overwrite, public release tag, website deployment or Chrome Web Store submission was performed. Authenticated-page verification of the combined build remains pending.
