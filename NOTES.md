# 我的学习笔记 · Mini Notes 课程

每完成一个 Level 写 5 行。**用自己的话写**，写错也没关系——写不出来正好说明哪里没懂。
这个文件放在项目里，会跟着 Git 一起存档，所以你的学习过程本身也有历史记录。

---

## Level 0 · 环境与心智模型

（待填写，参考下面 5 个问题）

1. 今天做的事：学习nextjs项目创建和运行在本地端口,学习git的基本使用.
2. 我对「一个网站由哪几部分拼成」的理解（试着说出：前端 / 服务端 / 数据库各自干嘛）：
   前端:大堂和菜单,但是给用户的地方
   服务器:厨房,处理好数据菜品,呈现给用户
   数据库:仓库,存放财评的地方
3. 学到的关键概念（用自己的话说，比如 Git、热更新、Server Component）：
   git就是代码管理工具,可以记录提交时的状态,方便回滚
   客户端组件是在用户端进行交互的组件,像按钮,链接等
   热更新是可以更改代码后实时编译推送到浏览器页面上,节省启动时间。
4. 遇到的问题 / 卡住的地方：
   暂时还没有太大的问题,主要是vscode的显示,目前已经解决
5. 还没完全懂、下次想问的：
   无

## Level 1 · TanStack Start + Cloudflare Workers

1. 今天做的事：今天主要完成了选型的更换，采用TanStack start和Cloudflare替换nextjs技术栈，然后逐渐部署上线项目。登录，上线，连接github自动更新。

2. 「Next.js 的 Server/Client 组件」和「TanStack Start 的同构组件」有什么区别？为什么 TanStack Start 不用写 `'use client'`
   TanStack Start是属于服务端和客户端同构，同样的代码会在服务器渲染一遍html,再将html交给客户端,客户端通过注水实现交互。

3. 新建一个页面要做什么？（文件放哪儿、里面必须写哪几样东西、网址写在什么地方）x新建页面要在src/routes内新建tsx文件,里面需要导入工具,然后定义好页面的名字,渲染使用的组件,然后在下方写出组件函数。网址写在createFileRoute('')内。

4. `npm run deploy` 内部做了哪两件事？连上 Git 之后，`git push` 和「网站更新」是什么关系？ 先进行构建npm run build然后再部署到Cloudflare上。连上git后，push到github上网站会自动监测更新。

5. 遇到的问题 / 还没完全懂的：

## Level 2 · Cloudflare D1 + Drizzle 数据库

1. 今天做的事：今天完成数据库的创建和上线。新建了note网页，然后网页上调用数据库显示。写了 `src/db/schema.ts` 定义表结构，然后一步步创建本地和线上数据库，并同步。其中还有数据库迁移的知识，先创建数据表（图纸）由Drizzle翻译为施工单，「分别应用到本地库和线上库（各一次），并同步更新台账。这里需要注意迁移数据库要在deploy代码之前。 

2. 数据库在哪：本地数据库为.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4fecfd7d1010b6770982e2569ac4c1344e04fb3c20b606468c71f0d45d3578fb.sqlite文件，线上数据库由Cloudflare D1服务进行托管，创建在apac地区。

3. env.DB是什么：env.DB就是数据库对象,我们在这里指代这个线上和线下数据库,他在wrangler.jsonc中声明他的名字和位置,以此在不同环境中用同一套代码指向不同的值。

4. Drizzle 有两只手：
   ① 图纸 → 施工单：npx drizzle-kit generate 把 src/db/schema.ts 生成 drizzle/0001_*.sql
   ② 查询 → SQL：db.select().from(notes) → select "id",… from "notes" → 交给 D1 执行，
      回程再把结果翻译成 TS（created_at 整数 → Date）
   执行方一律是 D1（本地是 miniflare 模拟的 D1，线上是 Cloudflare 托管的 D1），底层引擎都是 SQLite。

5. 遇到的问题 / 还没完全懂的：

   - 保密字符串要有两份载体：本地 .dev.vars、线上 wrangler secret put（值通常一样）
   - process.env 在 Cloudflare 上只是 vars/secrets 的影子，读配置要用 env.XXX
   - "注入" = 外部把值送进运行环境；env 是每个请求由运行时递过来的



## Level 3 · 认证（Better Auth）

1. 今天做的事：一条时间线：装 better-auth → 生成四张表图纸 → 迁移建表 → 挂 /api/auth 路由 → 注册登录页 → 导航栏显示用户+登出 → 保护 /notes → 查询按 user_id 隔离 → 线上收尾。

2. `src/auth/auth.ts` 的 `auth` 和 `src/auth/client.ts` 的 `authClient` 分别是什么、谁在跑、谁能碰数据库：`auth` 是服务端对象（持有 secret 和 adapter，只在 Worker 里跑，唯一能碰数据库）；`authClient` 是浏览器端对象，没有密钥也没有写库能力，只向服务端发 HTTP 请求，由服务端来查数据库。

3. 一次「注册」在服务器上到底发生了什么（从点按钮开始：发什么请求 → 服务端写哪几张表 → 怎么让你"登录"起来）：点注册后 `authClient.signUp.email` 发 `POST /api/auth/sign-up/email`，经 `src/routes/api/auth/$.ts` 交给 `auth.handler`，然后写三张表：`user`（账号）、`account`（登录方式和凭据，含密码哈希、`providerId='credential'`）、`session`（token + 过期时间）。服务端用 `Set-Cookie` 下发 `better-auth.session_token`（HttpOnly，JS 读不到），浏览器自动保存，之后每次请求自动带上，服务端查 session 表就知道是谁。

4. 四张认证表各存什么；密码为什么不存明文；cookie 的 HttpOnly / Secure / SameSite 各防什么：`user` 存账号；`account` 存登录方式和凭据；`session` 存当前有效的一次登录的凭证记录 = `token` + `userId` + `expiresAt` + `ipAddress` + `userAgent`；`verification` 存一次性令牌（本项目没开邮箱验证，所以是空表）。cookie 的 HttpOnly 防 XSS、Secure 只在 HTTPS 发送、SameSite 防 CSRF。密码不存明文：服务端有泄密风险（数据库被拖走），哈希单向不可逆，反推不出原密码，而且每行随机盐 + scrypt 慢，暴力枚举不划算。

5. 我遇到的问题 / 还没完全懂的：本节知识细节很多，只能勉强记住框架，所以我想先知道全貌、再回头深入。另外是目录结构：`src/auth` 是认证层（`auth.ts` 服务端 / `client.ts` 浏览器端），`src/db` 是数据层（`schema.ts` 手写图纸 / `auth.schema.ts` 生成图纸 / `index.ts` 的 `getDb()`），`src/routes/api/auth/$.ts` 是**路由**而不是独立的后端服务——前后端在同一个 Worker 里，只是 `server.handlers` 里的函数只在服务端跑、返回 JSON。
