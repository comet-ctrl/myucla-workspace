# 本地开发更新日志

## 23 — 提示重叠、课程箭头与明确备注保存

日期：2026-10-05（America/Los_Angeles）。

需求：修复截图中的不同颜色提示文字重叠、课程向下箭头被遮盖，并完成第 17 条暂缓的备注 UX。用户本轮明确选择“编辑 → 保存 / 取消”。

修改：为每个直接位于工作区下的原生提示分配独立自动网格行，允许换行和自然高度；已有 childList 观察器同步提示数量，工作区占最后的弹性行，Original layout 清理布局变量。关闭 Course tools 时隐藏颜色包装内部的原生排序按钮，打开时保留原节点并完整显示；颜色输入仍投影到标题。备注新增 Save note / Cancel，Enter 保存、Escape 取消并返回编辑入口；失焦不再保存，空备注保存用于清除，保留原有 24 字、本地存储及上下文边界。

文件：public/injected.css、src/content/planner-workspace.ts、src/content/myucla-controller.ts、tests/content/myucla-controller.test.ts、harness/verify-course-title-tools.mjs、harness/verify-course-controls.mjs，以及本日志和 HANDOFF.md。

验证：npm run typecheck、npm test -- --run（39 文件、566 项）、npm run build、git diff --check 均通过。新增虚构浏览器回归在 light/dark 各 1440/960/390px 验证提示不重叠、嵌套箭头关闭隐藏/打开完整落在卡片内、备注保存/取消、提示动态增删、10 次本地拖拽、原生节点/form 身份与 Original 恢复。已查看虚构截图。既有 course-controls 在 2048/1440/1280/390×900 和 1440×650 全部通过，含备注长度与持久化及原生操作的虚构模拟。

实际遇到的问题：首次沙箱测试因临时文件 rename EPERM 未运行任何测试；获准在沙箱外运行后发现 5 项原页面精确恢复失败，原因是添加变量后才记录原 style 存在状态，修复后完整通过。首次浏览器调用找不到沙箱内 Playwright 浏览器，改用已安装 Chrome 验证拦截网络的虚构页。旧 course-controls 分别因已移除的二级菜单和未展开 Layout settings 超时，更新测试入口后通过；这些失败不属于真实账户验证。

限制与交付：截图对应真实 DOM 未直接检查，修复针对代码中可复现的网格重叠和嵌套箭头泄漏；真实页面仍待用户重载扩展、刷新后确认。无真实账户操作、无新增请求/轮询/权限，无实际原生排序或注册动作。当前分支 derrick-improvements；代码未提交、未推送；dist 已重建但不提交。

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


## 20 — Consolidate development onto main

Date: 2026-10-05 (user local date).

Request: use permanent main, temporary descriptive branches for substantial changes, and tags for version milestones.

Changes: renamed the GitHub and local workspace-v0.19.5 branch to main. Confirmed there were no open pull requests and workspace-v0.19.4 was fully included, preserved its exact commit as annotated baseline-v0.19.4, then removed that redundant branch using an expected-commit lease. Updated local tracking, README, contributor/agent rules, release checklist, migration notes and popup/install-page links. Historical fork branches and all commit history remain intact; no release or application version bump was created.

Verification: GitHub reports main as the default and sole branch in the standalone repository; the remote baseline tag resolves to 0f6fbb6603e4a0a15e6938ffcea3665b69fd44f1. Typecheck, all 565 unit tests and production build pass. This update changes repository workflow and links, not planner behavior.

## 21 — Vitest 4 mock type compatibility

Date: 2026-10-05 (user local date).

Request: diagnose the nine typecheck errors encountered while preparing the release after the user's dependency update to Vitest 4.1.11.

Changes: replaced generic ReturnType<typeof vi.fn> declarations with callable Mock signatures in panel-drop-operations, panel-layout, planner-workspace and workspace-settings tests. Panel and settings mocks derive their types from the production callback contracts. Preserved the user's package.json and package-lock.json updates; no production behavior changed.

Verification: reproduced all nine errors before the fix. Typecheck, all 565 tests in 39 files under Vitest 4.1.11 and production build pass after the fix. The initial build failed because the Windows sandbox denied esbuild directory resolution; the approved build outside that sandbox passed. No authenticated-page interaction, commit, push, tag or release publication was performed. The user is carrying out the release steps themselves.

## 22 — Release clean-install lockfile repair

Date: 2026-10-05 (user local date).

Request: verify the user's v0.19.5 tag push and draft release preparation.

Finding: GitHub Release run 37400515326 failed at npm ci under Node 22.23.3/npm 10.9.9. The npm 11-generated lockfile lacked the esbuild 0.28.2 optional peer tree required by Vite 8 under npm 10. No draft release was created. Existing-module typecheck/tests/build had not detected this install problem.

Changes: regenerated package-lock.json with npm 10, adding the missing esbuild peer and platform entries. Added a release-checklist requirement for a clean install with the release runner's npm version before tagging. No production source or version change.

Verification: npm 10.9.9 clean-install dry run and full npm ci pass locally on Windows; typecheck, all 565 tests in 39 files and production build pass after that clean install. npm audit reports zero vulnerabilities. These local checks used Node 24.19.0, not a Linux runner; GitHub verification of the corrected commit is still pending. No commit, push, tag modification, release publication, installed-extension overwrite or authenticated-page interaction was performed. The user will commit and push the repair and update the unpublished failed tag.

## 24 — 顶部中间下拉提示与点击展开

日期：2026-10-05（America/Los_Angeles）。

需求：全宽顶部悬停触发过于灵敏，移动到浏览器标签页时误展开 UCLA 顶栏；改为顶部中间小感应条，悬停显示下箭头，点击才展开。

修改：感应范围从全宽缩到居中 80px、高 10px 的提示条；悬停仅将自有提示按钮下拉到 32px 并显示下箭头，不滚动或展开原生顶栏。点击临时展开原生顶栏；鼠标激活后释放隐藏按钮焦点，避免离开后无法收起。保留原生键盘访问、菜单/焦点保持、Escape、外部点击和离开收起、显式 Show header 偏好、打印和 reduced motion。浅色/深色提示均适配。未增加网络请求、轮询、存储或权限。

文件：src/content/planner-introduction.ts、public/injected.css、public/dark.css、tests/content/planner-introduction-header.test.ts、harness/verify-header-reveal.mjs、docs/MYUCLA_CONTRACT.md、PRIVACY.md、HANDOFF.md、DEVELOPMENT_LOG.md。保留前一任务的未提交改动。

验证：npm run typecheck、npm test -- --run（39 文件、563 项）、npm run build、git diff --check 通过。旧自动展开测试改为点击展开；原悬停抑制的四个用例合并为一个不因悬停展开、Escape 后仍不误触的用例，因此总数由 566 变为 563。虚构 production header matrix 全部 10 组通过：2048/1440/1280/390px 的 light/dark，以及 2048/390px dark nested-shadow；验证仅居中小范围、边缘经过/中间悬停不展开、提示下拉尺寸、点击/触摸/键盘打开、原生菜单/焦点保持、Escape、离开、偏好隔离、原生身份、通知、滚动、打印与 Original 恢复。已查看虚构深色收起截图。浏览器报告和截图改存项目忽略的 harness/shots/header-reveal。

失败与修正：首轮真实浏览器事件回归发现鼠标点击使焦点留在已隐藏感应条、阻止离开收起，修正为只在鼠标点击时 blur；第二轮键盘尺寸测量未等待新高度动画完成而失败，测试增加 180ms 动画等待后完整通过。未把上述虚构测试视为真实账户验证。

交付限制：dist 已重建；真实页面等待用户重新加载扩展并刷新确认。当前 derrick-improvements 分支，未提交、未推送、未改已安装扩展目录；无真实账户页面或注册/排序操作。

## 25 — 课程卡片切换详情与顶栏菜单避让

日期：2026-10-05（America/Los_Angeles）。

需求：移除每门课独立 Details 按钮，点击课程内容切换右侧详情；修复上方不同原生菜单展开后遮挡。另要求先分析主动点击收起顶栏的交互方案，用户看过后再改。

修改：记录的首个课程标题 p 改为可聚焦的 role=button 入口，Enter/Space 可切换；首行非控件内容（标题、摘要等）点击复用原详情逻辑，再点关闭。排除原生按钮/链接/字段、Course tools、备注编辑、拖拽和文本选取，保留多课程详情与焦点返回。原生标题节点及内容不替换，恢复时精确还原属性和监听器；课程/标题重绘清理旧监听器。删除独立扩展 Details 按钮。

顶栏适配：工作区位置同时避让原生顶栏、可见子表面及菜单的真实下边界、季度选择器与页面标题。限定遍历最多 2048 个元素、32 个 open shadow roots，包含原生 header host 本身的 shadowRoot；只测量渲染几何，不读取账户或菜单文本/值。已有 mutation 生命周期与 ResizeObserver 同步菜单变化；窗口空间不足时通过有间距的流布局保留原生滚动与完整菜单。无轮询、请求或权限新增。

交互建议（仅提案）：保持点击展开，展开后提供可见向上箭头，再点击或 Escape 收起；鼠标离开不关闭，避免显式展开后意外收起和布局跳动。本轮未修改收起规则，等待用户确认。

文件：src/content/planner-workspace.ts、src/content/planner-introduction.ts、public/injected.css、tests/content/planner-workspace.test.ts、harness/verify-course-title-tools.mjs、harness/verify-header-reveal.mjs、docs/MYUCLA_CONTRACT.md、HANDOFF.md 和本日志。

验证：typecheck、完整 564 项测试（39 文件）、build、git diff --check 通过。课程虚构浏览器 light/dark 各 1440/960/390px 验证独立按钮消失、摘要点击展开/标题再点关闭、工具与备注、原生身份、拖拽和恢复；新增单元用例覆盖键盘与工具不触发详情。Header production 虚构矩阵 10/10 通过，包含 2048/1440/1280/390px light/dark 及 2048/390px dark nested-shadow；每组菜单高度 104/214/382/560px 检查菜单、季度选择器与工作区不重叠，含短窗口流布局。已查看虚构课程截图，未保存用户真实截图或账户内容到项目。

失败与修正：首次标题入口依赖 controller 才生成的 class，使直接 workspace fixture 的 49 项测试失败，改为记录的原生 td > p 结构；一个旧测试断言 Details 与工具并排，按新交互更新。菜单回归首次因测试自身留下空 style 属性使 native identity 失败，修正为精确恢复原 style；Shadow DOM 测试取元素使用 document.getElementById 得到 null，改用穿透 shadow 的 locator。560px 菜单暴露短窗口 4px 重叠，补足流布局间距；随后 shadow case 暴露未进入最外层 shadowRoot，补齐遍历后完整通过。以上均为虚构页面证据，不视为真实账户验证。

交付：本地 derrick-improvements，dist 已重建，日志和交接同步；未提交、未推送。真实页面效果需用户重新加载扩展、刷新后确认。未更改第 2 项自动收起行为，未执行真实原生排序或注册相关动作。

## 26 — 主动点击收起顶栏与删除重复选中线

日期：2026-10-05（America/Los_Angeles）。

需求：用户批准第 25 条的主动收起建议；修正课程详情选中后的额外竖线。

修改：点击中间下箭头后，顶栏以仅内存的明确打开状态保持；鼠标离开、焦点变化、浏览器 blur 或页面其他位置点击均不自动收起。顶栏下沿中间显示向上箭头，点击或 Escape 关闭并返回原 Show header 入口焦点。给自有关闭控件预留 32px 空间，继续依据原生菜单真实边界避让；浅色/深色、键盘 Enter、触摸和 reduced motion 保留。显式保存的 Show header / Compact header 与偏好读取会清除内存打开状态。原生键盘导航所需的临时可见行为仍保留，未保存新偏好。删除第 25 条新增的首行 inset 竖线，保留既有整卡背景与选中样式，避免两根不齐的线。

文件：src/content/planner-introduction.ts、public/injected.css、public/dark.css、tests/content/planner-introduction-header.test.ts、harness/verify-header-reveal.mjs、harness/verify-course-title-tools.mjs、PRIVACY.md、docs/MYUCLA_CONTRACT.md、HANDOFF.md 和本日志。

验证：npm run typecheck、npm test -- --run（39 文件、565 项）、npm run build、git diff --check 通过。新增明确打开测试覆盖离开、外部点击、blur、点击关闭、Escape 及偏好隔离；旧自动收起测试保留为原生键盘临时访问路径。完整虚构 header matrix 10/10 通过，覆盖 2048/1440/1280/390px light/dark 和 2048/390px dark nested-shadow；验证真实鼠标点击向上箭头、离开仍打开、键盘、触摸、原生控件单次事件、菜单不同高度避让、打印和 Original 恢复。课程虚构回归 light/dark 各 1440/960/390px 通过，断言选中首行 box-shadow=none、详情切换、工具/备注与拖拽正常。已查看虚构展开深色顶栏截图。

失败与修正：首轮浏览器真实鼠标点击无法命中向上箭头；先补充控件层级后仍失败，最终确认旧 pl-header-revealed:not(:focus-visible) 的更高优先级隐藏/禁用 pointer-events 规则仍生效。明确打开状态专门覆盖 opacity/pointer-events 后点击通过，未使用强制点击绕过问题。更新 tooltip，避免仍提示“移开鼠标收起”。

交付限制：当前 derrick-improvements，保留前几轮未提交改动；dist 已重建，未提交、未推送或覆盖其他安装目录。用户需重新加载扩展并刷新确认真实效果。没有读取/存储真实课程或账户内容，无请求/轮询/权限新增，无实际注册或排序动作。

## 27 — 展开顶栏滚动完整性与深色语义颜色

日期：2026-10-05（America/Los_Angeles）。

需求：顶栏明确展开后向下滚动会留下部分缺失的顶部；提示颜色不适合 dark mode，要求检查截图以外的颜色适配。

修改：在已有滚动生命周期内，明确展开时依据渲染边界限制外层文档滚动；能完整容纳的顶部保持原位，超高原生表面保留到达底部和关闭控件的必要滚动范围。内部课程列表等独立滚动不受限制，不拦截滚轮、不修改原生导航结构，点击关闭/Escape 与恢复原布局继续释放限制。深色原生通知错误/活动提示使用柔和珊瑚红，季度提醒使用琥珀色，链接保持浅蓝；介绍区及工作区的 warning/info/success/error/danger 标签与徽章补齐暗背景和对应语义文字。既有课程状态、冲突、备注、按钮、输入框、帮助和设置颜色通过整体回归检查；课程标识和日历事件原色保留。没有新请求、轮询、权限或存储。

文件：src/content/planner-introduction.ts、public/dark.css、harness/verify-header-reveal.mjs、HANDOFF.md、docs/MYUCLA_CONTRACT.md、PRIVACY.md 和本日志。

验证：npm run typecheck、npm test -- --run（39 文件、565 项）、npm run build 和 git diff --check 通过。虚构深色回归在 2048/1440/1280/390px 全部通过，包含 light/system 切换、详情、原生身份、日历、打印、恢复、控件对比度及 popup。顶栏完整 10 组与新增语义颜色 6 组浏览器验证覆盖真实 wheel 事件、明确打开状态、内部滚动保留、菜单避让、窄屏、Shadow DOM、关闭、原布局恢复；新增文本/徽章颜色检查要求对比度至少 4.5:1。已查看虚构深色展开截图，没有使用真实账户页面或把用户截图保存进项目。

限制：真实页面仍需用户重新加载扩展并刷新后确认；超高菜单允许必要滚动，其顶部可能自然离开视口以访问底部。当前 derrick-improvements，dist 已重建；保留既有未提交改动，未提交、推送或覆盖其他安装目录，无真实注册/排序操作。

## 28 — 默认展开的收起入口、侧栏滚动与底部覆盖修正

日期：2026-10-05（America/Los_Angeles）。

需求与用户验证：用户真实页面反馈第 27 条仍有问题：保存为显示顶栏时缺少向上箭头；左侧滚轮带动顶栏，提示消失；持续向下滚会露出底部原生页脚。之前虚构检查未覆盖保存展开状态和底部操作栏预留背景，不能视为真实页面已修复。

修改：默认/保存展开时也显示可点击的向上箭头，点击调用既有 Compact header 偏好入口；临时展开仍使用内存状态关闭。默认展开同样限制外层滚动到超高表面必要范围；紧凑状态固定公共标题偏移，防止侧栏滚轮向下漂移。超高菜单的关闭箭头限制在视口内。默认展开 Escape 仅在顶栏/箭头自身处理，避免抢走其他工作区的关闭与焦点。工作区背景高度延伸到视口底部，操作栏预留改为内部 padding，因此原生页脚不会从预留缝隙露出；内容保留避让空间。保留原生节点、控件、内部滚动和 Original/print 恢复，没有增加数据、请求、轮询、权限或存储字段。

文件：src/content/planner-introduction.ts、public/injected.css、tests/content/planner-introduction-header.test.ts、harness/verify-header-reveal.mjs、HANDOFF.md、PRIVACY.md、docs/MYUCLA_CONTRACT.md 和本日志。

验证：typecheck、完整 565 项测试（39 文件）、build 和 git diff --check 通过。虚构 viewport-fill 六种尺寸通过（2048x1000、1440x900、960x650、390x600、900x350、1920x1080），含顶栏访问和恢复。新增顶栏浏览器检查覆盖保存展开的可见箭头、左侧 wheel 1200px、箭头关闭保存原布尔值、紧凑状态 wheel 2400px 不漂移、操作栏背景底部等于视口；1440/390px 的 light/dark 与 dark Shadow DOM 六组通过。所有浏览器内容为虚构，未读取或保存用户真实截图内容。

失败记录：首轮完整测试有两项失败：旧测试仍要求保存展开时隐藏箭头；新增默认展开 Escape 抢走信息区关闭焦点。更新符合新需求的箭头断言，并将默认展开 Escape 限定顶栏/箭头焦点后，重新完整测试通过。没有删除失败历史或把虚构测试描述为真实页面验证。

交付限制：当前 derrick-improvements，保留已有未提交修改；dist 已重建，未提交、推送或覆盖安装目录。真实页面需重新加载扩展并刷新确认，尤其是超高菜单及底部已有操作栏的情况。

第 28 条追加失败与修正：六组浏览器首轮有一组（宽屏 dark Shadow DOM）在保存展开后立即滚轮仍漂移。原因是滚动动画的有限回退计时尚未清除，positionHeader 暂停限制；增加可清理的 passive wheel 监听，仅结束动画等待状态，不取消滚轮默认事件，再由既有 scroll 生命周期对齐。之后重跑完整单元与六组浏览器回归。此监听不新增轮询、请求或数据读取。

第 28 条最终复验：滚轮动画修正后，typecheck、build、完整 565 项测试和六组 header 浏览器回归全部通过；此前失败的宽屏 dark Shadow DOM 也通过。已检查虚构展开截图。新增检查仅证明所用虚构结构，真实页面仍待用户重新加载确认。

## 29 — 宽工作区详情内容对齐

日期：2026-10-05（America/Los_Angeles）。

需求：用户反馈 Settings 的工作区布局下，右侧 Details 内容与面板宽度不齐。

修改：取消详情原生内容 td 独立的 1040px max-width；保留面板统一 20px 内边距，使标题、课程关闭按钮、栏目标题和各节表格使用同一可用宽度。继续根据实际详情容器宽度采用既有响应式字段网格；没有修改布局偏好、原生节点、表格内容、控制处理程序或权限。

文件：public/injected.css、harness/verify-course-title-tools.mjs、HANDOFF.md 和本日志。

验证：npm run typecheck、npm test -- --run（39 文件、565 项）、npm run build 和 git diff --check 通过。虚构课程浏览器回归覆盖 light/dark 各 2048/1440/960/390px 共八组，新增断言详情内容宽度等于面板扣除内边距后的宽度；课程详情切换、备注与工具、重复拖拽、原生身份和恢复均通过。未逐个点击所有 Settings 预设；通用详情样式适用于这些预设，真实页面仍需用户确认。

交付：dist 已重建，当前 derrick-improvements，开发日志与交接已同步；保留先前未提交工作，未提交、推送或覆盖其他安装目录。未保存用户真实截图或课程内容到项目。

## 30 — 整理当日改动并提出 PR

日期：2026-10-05（America/Los_Angeles）。

需求：今天停止开发，将本轮改动整理为 PR。

准备：读取贡献流程，拉取 origin 与 upstream；derrick-improvements 与 upstream/main 基线一致，没有上游独有提交，也未发现此分支已有打开的 PR。整理第 23—29 条的备注保存/取消、提示和箭头、顶栏交互与避让/滚动、深色语义颜色和详情宽度修复。沿用本轮已完成的 typecheck、565 项测试、build 及各虚构浏览器回归；最终 diff 检查无空白错误。PR 将说明真实页面需用户确认，不上传真实截图、课程内容或 dist，不修改版本，不执行合并。

交付操作：授权范围内提交并推送至 Derrick2007 fork 的 derrick-improvements，目标为 comet-ctrl/myucla-workspace 的 main。创建结果将在本会话回报；只有维护者决定合并。
