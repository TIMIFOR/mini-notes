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


