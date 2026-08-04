# 移动端案例库独立部署版

页面功能、8 类案例和交互截图详见 [移动端页面案例库功能说明.md](移动端页面案例库功能说明.md)。

`index.html` 是可直接部署的单文件入口，页面所需的 CSS、JavaScript、内联 SVG 和文件类型图标均已嵌入其中。部署时可以只复制这一个文件，或者复制整个 `ErowSetupMobileExpmale` 文件夹；运行时均不依赖 FAQ 工作区中的 `screen-pattern-library`、`demo-app-ui`、`component-showcase` 或外部 CDN。

## 最简部署

只需要把 `index.html` 放到服务器目录，例如：

```text
/data/www/ErowSetupMobileExpmale/index.html
```

Nginx 可以只允许访问 `/` 和 `/index.html`，不需要开放其他文件地址。示例配置见 `nginx.conf.example`。

访问地址：

```text
http://example.com/
http://example.com/index.html
http://example.com/index.html?pattern=detail
http://example.com/index.html?pattern=upload
```

支持的案例 ID：

- `navigation`
- `dashboard`
- `filter`
- `list`
- `detail`
- `guidance`
- `map`
- `upload`

查询参数 `?capture=1` 仍可与 `pattern` 一起使用。

## 目录说明

- `index.html`：最终单文件交付入口，服务器只开放该文件即可。
- `index.template.html`：未内联资源的入口模板，仅用于维护。
- `styles.css`、`app.js`：可维护的源样式和交互代码。
- `assets/file-icons/`：生成单文件时使用的文件类型图标源文件。
- `build-standalone.js`：将模板、样式、脚本和图标重新嵌入 `index.html`。
- `validate.py`：独立目录结构校验，不依赖父目录。
- `nginx.conf.example`：只暴露入口页面的 Nginx 示例。

修改源文件后，使用 Node.js 重新生成入口：

```powershell
node build-standalone.js
node --check app.js
```

页面只使用虚构演示数据，地图、上传、复制、定位、签名和人员选择均为浏览器端模拟，不连接正式环境、后端接口、真实地图或原生能力。
