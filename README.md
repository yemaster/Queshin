## 中科雀

一个简单的在线联机麻将游戏，提供丰富的API接口供编写自动机器人。可以在线联机和好友对战，和机器人对战。

[TOC]



### 游戏方法

#### 选择游戏服务器

可以选择部署在自己的电脑上方便和好友一起私下游玩(详见下文：服务器端部署)，也可以选择使用测试服务器：[http://47.115.222.205/](http://47.115.222.205/)。

测试服务器支持在**浏览器端**[在线试玩](http://47.115.222.205/start)，也支持下载客户端本地体验(和浏览器一样，连的也是同一个服务器)。目前已经测试了 Windows下Edge浏览器120.0.2210.61版本Staple应用，和Android端Edge浏览器119.0.2151.78版本，其他平台其他浏览器理论上也是可用的。

#### 加载游戏

进入服务器后，首先会进行一段炫酷的加载动画(首次加载可能会比较慢，由网络情况决定)。出现如下界面后点击窗口任意位置即可继续：

<img src=".\assets\image-20231211125336503.png" alt="image-20231211125336503" style="zoom:33%;" />

然后过完另一个加载动画之后，会进入游戏大厅(如果之前进入过游戏房间，则会直接进入该游戏房间)。在游戏大厅中，可以看到所有有玩家的房间，可以选择进入，也可以点击随机房间来随机进入房间(进入空房间会自动创建)。

<img src=".\assets\image-20231211125714762.png" alt="image-20231211125714762" style="zoom:33%;" />

进入房间之后，就可以准备进行游戏了。房间中第一位玩家自动成房管，可以踢出其他成员。点击开始游戏就可以准备开始了。当所有**非观察者**的玩家都选择开始游戏了，游戏就开始了。注意一个房间**最多**只能有**4个**非观察者的玩家，其他新增的玩家将自动变成观察者。

<img src=".\assets\image-20231211130240600.png" alt="image-20231211130240600" style="zoom:33%;" />

进入游戏后，界面如下：

<img src=".\assets\image-20231211130827512.png" alt="image-20231211130827512" style="zoom:33%;" />

具体每个操作情况已在图中标出。

当某个玩家胡了之后，界面将显示每个玩家的手牌和出牌情况，供游戏后讨论：

<img src=".\assets\image-20231211131113960.png" alt="image-20231211131113960" style="zoom:33%;" />

看完了也可以点击最上面的离开，重新回到准备界面：

<img src=".\assets\image-20231211131148939.png" alt="image-20231211131148939" style="zoom:33%;" />

注意需要让**所有人(包括观察者)**退出最后的看牌界面，才可以重新进入新一轮游戏！

游戏中也可以和他人进行聊天，注意所有玩家共享同一个聊天框(即所有房间的玩家都可以看到聊天框内的消息)。如果不需要聊天框，则可以点击聊天框缩小。隐藏聊天框后，也可以点击聊天框，让其重新恢复。

<img src=".\assets\image-20231211131507548.png" alt="image-20231211131507548" style="zoom:33%;" />

关于麻将的规则，具体可以看[冲击麻将_百度百科 (baidu.com)](https://baike.baidu.com/item/冲击麻将/3739533)。简而言之，就是没有花牌，有龙(财神，百搭，即可以代替任何牌)，可以胡七对子、碎胡(十三不搭)、顺胡，没有十三幺。

### 部署方法

#### 服务器端部署

1. **安装必要软件**
    - 安装Node.js(推荐20版本)
    - 拉取项目代码
        > master分支存储正常版本
        > use-cdn分支存储cdn版本，静态文件放置于jsdelivr中
        ```bash
        git clone https://xxx.com/yemaster/mahjong
        ```
    - 安装项目依赖
        ```bash
        # 使用npm
        npm install
        # 使用yarn
        yarn
        # 使用pnpm，不知道是否可行
        pnpm install
        ```
    - 安装pm2(可选，用于部署)
        ```bash
        yarn global add pm2
        ```
    - 安装nginx(可选，用于部署)
        ```bash
        sudo apt install nginx
        ```

2. 运行并部署
    ```bash
    # 使用npm
    npm run start
    # 使用yarn
    yarn start
    # 使用pnpm
    pnpm run start
    ```
    然后终端将会显示启动界面，服务器端将会运行在`http://[::]:3000`。
    ```bash
    # 使用pm2部署
    pm2 start server.js
    ```
    [可选]使用nginx反代到80端口
    
    ```nginx
    server {
        listen 80 default_server;
        listen [::]:80 default_server;default_server;
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        server_name _;
        location / {
                proxy_pass http://localhost:3000/;
        }
   }
   ```
   
#### bot构建

示例的bot已经包含在服务器程序中了，只需要运行

```bash
yarn bot
```

就可以启动bot。

#### 用户端构建

Windows/Linux/MacOS客户端采用Neutralino.js框架构建

```bash
neu build
```

### 指南

#### 用户指南

#### 开发者指南

[胡牌算法实现方法](https://blog.yemaster.cn/agari-algorithm/)

[（推荐）Bot开发指南](./docs/bot-api.md)

[简单bot开发示例](https://blog.yemaster.cn/mahjong-bot)

[Socket API](./docs/socket-api.md)

#### 其他指南

[TODO List](./docs/todo.md)

[Update Log](./docs/updatelog.md)

### 游戏截图

<img src=".\assets\image-20231211121825308.png" alt="image-20231211121825308" style="zoom:50%;" />

<img src=".\assets\image-20231211121839179.png" alt="image-20231211121839179" style="zoom:50%;" />

<img src=".\assets\image-20231211121922396.png" alt="image-20231211121922396" style="zoom:50%;" />

<img src=".\assets\image-20231211121951246.png" alt="image-20231211121951246" style="zoom:50%;" />

<img src=".\assets\image-20231211122033642.png" alt="image-20231211122033642" style="zoom:50%;" />

<img src=".\assets\image-20231211122101062.png" alt="image-20231211122101062" style="zoom:50%;" />
