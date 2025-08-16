# tavern_helper_template

酒馆助手编写前端界面或脚本的模板.

## 使用方法

你可以点击网页右上角的绿色 `Code` 按钮-`Download ZIP` 下载本模板的压缩包来只在本地使用, 也可以通过绿色 `Use this template` 按钮来创建一个基于这个模板的新仓库.

无论哪种方式, 你都可以在[配置好后](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html)使用这个模板, 在 src 文件夹内制作你的前端界面或脚本.
打包程序将会自动检测 `src` 文件夹中的文件:

- 如果一个文件夹里只有 `index.ts`, 则这个文件夹被视为**酒馆助手脚本**进行打包. 例如 `src/脚本示例` 会被打包为 `dist/脚本示例/index.js`
- 如果一个文件夹里只有 `index.html` 和 `index.ts`, 则这个文件夹被视为**酒馆助手前端界面**进行打包. 例如 `src/界面示例` 会被打包为 `dist/界面示例/index.html`

### 如果只在本地使用

这意味着你将不能享受本模板提供的自动打包、自动更新模板、第三方库依赖和酒馆助手 `@types` 文件夹功能, 但你本地依旧能很方便地使用这个模板.

如果你想作为仓库使用, 请先通过 [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN) 学习 git 分支和合并.

### 如果创建为新仓库

#### 自动打包、更新依赖和酒馆助手 `@types` 文件夹

本仓库在 `.github/workflows` 文件夹中设置了几个 CI 工作流来完成这些功能, 你也可以在网页上方的 `Actions` 中手动运行它们:

- `bundle.yaml`: 自动打包 `src` 文件夹中的代码到 `dist` 文件夹中, 并自动递增版本号从而让 jsdelivr 更快更新缓存.
- `bump_deps.yaml`: 自动更新模板、第三方库依赖和酒馆助手 `@types` 文件夹功能; **但不会更新 `slash_command.txt` 文件**, 因为它必须从酒馆网页中生成, 如果酒馆更新了请手动从酒馆助手设置页下载更新 `slash_command.txt` 文件.
- `sync_template.yaml`: 在你基于模板仓库创建新仓库后, 你的新仓库将不再和模板仓库有关联, 因此我设置了这个工作流用于同步模板仓库的更新. 如果模板仓库中有文件是你不想继续同步的, 可以在 `.github/.templatesyncignore` 中添加它.

#### 打包冲突问题

为了自动更新和打包一些东西, 本项目直接打包源代码在 `dist/` 文件夹中并随仓库上传, 而这会让开发时经常出现分支冲突.

为了解决这一点, 仓库在 `.gitattribute` 中设置了对于 `dist/` 文件夹中的冲突总是使用当前版本. 这不会有什么问题: 在上传后, ci 会将 `dist/` 文件夹重新打包成最新版本, 因而你上传的 `dist/` 文件夹内容如何无关紧要.

为了启用这个功能, 请执行一次以下命令:

```bash
git config --global merge.ours.driver true
```

## 许可证

[Aladdin](LICENSE)
