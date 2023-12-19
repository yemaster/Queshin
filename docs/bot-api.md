## Mahjong Bot

当初在编写主程序的时候，由于没有条例的规划，导致提供的api非常的凌乱不堪，客户端网页对API使用真的让人凌乱。因此，我把API进行了整合，编写了这个mahjongBot类，为了他人能够更方便的编写bot。

### 目录

>   为了节约时间，加粗内容为必读内容，写出完整机器人也只需要了解加粗内容即可。
>
>   适当修改调用示例，即可快速编写一个bot。

-   数据类型
    -   **cardObject**
    -   playerInfo
    -   BotConfig
        -   **server**
        -   nickname
        -   roomId
        -   onLaunch
        -   onConnect
        -   onDisconnect
        -   onGameStart
        -   onQuitGame
        -   onPlayersUpdate
        -   **onNewOperation**
        -   onFinishGame
        -   **onGetDragon**
        -   **onNewCard**
        -   **putCard**
-   **Mahjong Bot类**
    -   使用方法
    -   **调用示例**
    -   API
        -   botConfig定义的所有函数
        -   socket
        -   chat
        -   **doOperation**
        -   changeRoom
        -   exitSpectator
        -   joinSpectator
        -   getPrepared
        -   cancelPrepared

### 数据类型

-   `cardObject` 一张麻将牌

    -   `num` Number类型

        >   表示麻将牌的面值(0~33)
        >
        >   0-8   表示一~九万
        >
        >   9-17  表示一~九筒(饼)
        >
        >   18~26 表示一~九条(索)
        >
        >   27~30 表示东南西北
        >
        >   31~33 表示中发白

    -   `type` Number类型

        >   0 表示牌正常
        >
        >   \>0 值表示牌在该回合被操作过

-   `playerInfo` 玩家信息

    -   `nickname` String类型

        >   玩家的昵称

    -   `status` Number类型

        >   0 表示空闲
        >
        >   1 表示等待开始
        >
        >   2 表示进行游戏中

    -   `spectator` Boolean类型

        >   是否为观察者角色，观察者仅观战而不游戏

-   `BotConfig` 机器人设置类型

    -   `server` String类型

        >   连接的游戏数据地址
        >
        >   **例子** "http://localhost:3000"

    -   `nickname` String类型

        >   机器人的昵称
        >
        >   **例子** "ikun"

    -   `roomId` Number/String类型

        >   机器人要进入的房间id
        >
        >   **例子** "2333"

    -   `onLaunch` Function类型

        >   当机器人被启动时，该函数将会被调用。
    
        - 参数:
          - mahjong: 当前的bot类
          
        - 缺省值：
          
          ```javascript
              function onLaunch(mahjong) {
                  console.log("Queshin Bot v0.0.1")
                  console.log("v2.1.0 by yemaster(PB23151830)")
                  console.log("----------------------")
              }
          ```
    
    -   `onConnect` Function类型
        
        >   当机器人连接到服务器时，该函数将会被调用
        
        - 参数：
        
        - 缺省值：
        
            ```javascript
            function onConnect(mahjong) {
                console.log("Connected to the server successfully!")
                console.log(`Nickname ${mahjong.nickname} join room ${mahjong.room}.`)
            }
            ```
        
            
        
    -   `onDisconnect` Function类型
    
        >   当机器人与服务器断开连接时，该函数将会被调用
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
    
        - 缺省值：
    
            ```javascript
            function onDisconnect(mahjong) {
                console.log("Disconnected, waiting for reconnection.")
            }
            ```
    
            
    
    -   `onGameStart` Function类型
    
        >   当游戏开始时，该函数将会被调用
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
    
        - 缺省值：
    
            ```javascript
            function onGameStart(mahjong) {
                console.log("Game Started")
            }
            ```
    
            
    
    -   `onQuitGame` Function类型
    
        >   当一局游戏退出后，该函数将会被调用
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
    
        - 缺省值：
    
            ```javascript
            function onQuitGame(mahjong) {
                console.log("Quit game")
            }
            ```
    
            
    
    -   `onPlayersUpdate` Function类型
    
        >   当游戏人员得到更新，该函数将会被调用
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
            -   onlinePlayers(Array[playInfo]): 房间中的玩家信息
    
        - 缺省值：
    
            ```javascript
            function onPlayersUpdate(mahjong, onlinePlayers) {
                const participants = onlinePlayers.filter(v => !v.spectator)
                //console.log(participants)
                if (participants.length < 4 && mahjong.botInfo.spectator) {
                    mahjong.exitSpecutator(mahjong)
                }
                if (participants.length > 1 && mahjong.botInfo.status == 0 && !mahjong.botInfo.spectator) {
                    mahjong.chat(mahjong, `雀神练习生们大家好，我是练习时长两年半的个人练习生${mahjong.botInfo.nickname}，喜欢唱、跳、Rap、篮球`)
                    mahjong.getPrepared(mahjong)
                }
            }
            ```
    
            
    
    -   `onNewOperation` Function类型
    
        >   当可以进行胡碰杠吃操作时，调用该函数
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
            -   available(Boolean)：是否可以进行操作
            -   operations(Array[Boolean]): 4个位置分别表示是否可以胡杠碰吃操作
            -   nowCards(Array[cardObject]): 当前的手牌
    
        - 缺省值：
    
            ```javascript
            function onNewOperation(mahjong, available, operations, nowCards) {
                if (available) {
                    if (operations[0]) {// 能胡直接胡
                        mahjong.socket.emit("do_operation", {
                            type: 1
                        })
                        return true
                    }
                    else { // 不能胡直接放弃
                        mahjong.socket.emit("do_operation", {
                            type: 0
                        })
                        return false
                    }
                }
                return false
            }
            ```
    
            
    
    -   `onFinishGame` Function类型
    
        >   当游戏结束后，调用该函数
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
            -   isMe(Boolean): 是否为机器人胡了
            -   huPeople(String): 胡的人的Socket.id
    
        - 缺省值：
    
            ```javascript
            function onFinishGame(mahjong, isMe, huPeople) {
                if (isMe) {
                    // 是自己糊了
                    mahjong.chat(mahjong, `看见ikun的厉害了吧，你们也太菜了`)
                }
                else {
                    // 别人糊了
                    mahjong.chat(mahjong, `哟，小黑子还有两把刷子的啊，下局一定赢你`)
                }
            }
            ```
    
            
    
    -   `onGetDragon` Function类型
    
        >   当系统告诉玩家龙的id值时，调用该函数
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
            -   dragon(Number): 龙的id
    
        - 缺省值：
    
            ```javascript
            function onGetDragon(mahjong, dragon) { }
            ```
    
    -   `onNewCard` Function类型
    
        >   当某玩家打出牌之后，将调用该函数
    
        - 参数：
    
            -   mahjong(mahjongBot): 当前的机器人类
            -   player(String): 打出牌用户的socket.id
            -   card(Number): 打出的牌的id
    
        - 缺省值：
    
            ```javascript
            function onNewCard(mahjong, player, card) { }
            ```
            
            
    
    -   `putCard` Function类型
    
        >   当需要打出一张牌时，会传入当前手牌，需要返回要打出的牌id
        
        - 参数:
        
            -   mahjong(mahjongBot): 当前的机器人类
            -   cardList(Array[cardObject]): 当前的手牌 
        
        - 缺省值:
        
            ```javascript
            function putCard(mahjong, cardList) {
                const tmp = cardList.filter(v => v.type == 0).sort(() => Math.random() - 0.5)[0]
                return tmp.num
            }
            ```
        
            

### Mahjong Bot类

-   使用方法

    ```javascript
    const bot = new mahjongBot(botConfig)
    ```

    调用后，系统会根据设定的服务器地址等信息自动连接加入房间，具体参数见上。

- 调用示例

    ```javascript
    const { mahjongBot } = require("./libs/bot-SDK")
    
    const dragon = -1
    
    const demoBot = mahjongBot({
        server: "http://localhost:3000",
        nickname: "真ikun不是小黑子",
        roomId: 2333,
        onNewOperation: (mahjong, available, operations, nowCards) => {
            if (available) {
                if (operations[0]) {// 能胡直接胡
                    mahjong.socket.emit("do_operation", {
                        type: 1
                    })
                    return true
                }
                else { // 不能胡直接放弃
                    mahjong.socket.emit("do_operation", {
                        type: 0
                    })
                    return false
                }
            }
            return false
        },
        putCard: (mj, cd) => {
            const tmp = cd.filter(v => v.type == 0).sort(() => Math.random() - 0.5)[0]
        	return tmp.num
        },
        onGetDragon: (mj, dr) => {
            dragon = dr
        },
        onNewCard: (mj, pl, cd) => {
            // TODO
        }
    })
    ```

#### API

>   bot类提供了丰富的API供调用。

-   `botConfig`设定的所有函数

-   `socket`

    用于链接服务器的websocket类。可以通过emit向服务器发送事件，on接收事件，socket.id是客户端的socketid。

    具体事件可以参考socket-api文档，但这不被推荐，因为几乎所有需要的API已经被封装好了。

-   `chat`

    >   向所有人发送消息

    -   参数

        -   mahjong(mahjongBot): 当前的机器人类
        -   mes(String): 发送的消息内容

    -   原型

        ```javascript
        function chat(mahjong, mes) {
            mahjong.socket.emit("send_chat", {
                mes
            })
        }
        ```

    -   调用示例

        ```javascript
        mahjong.chat(mahjong, "我爱你")
        ```

-   `doOperation`

    >   进行胡碰杠吃操作

    -   参数

        -   mahjong(mahjongBot): 机器人类
        -   opId(Number): 操作id，0表示取消，1-4表示胡杠碰吃
        -   cardPos(Number): 仅当opId=2或4时需要。暗杠时为暗杠的牌，吃表示被吃的牌+cardPos=被吃顺子中最小的牌。

    -   原型

        ```javascript
        function doOperation(mahjong, opId, cardPos) {
            mahjong.socket.emit("do_operation", {
                type: opId,
                pos: cardPos
            })
        }
        ```

    -   调用示例

        ```javascript
        mahjong.doOperation(mahjong, 2, -2)
        ```

-   `changeRoom`

    >   更改加入的房间

    -   参数

        -   mahjong(mahjongBot): 机器人类
        -   roomId(Number): 需要进入的房间id

    -   原型

        ```javascript
        function changeRoom(mahjong, roomId) {
            mahjong.room = roomId
            mahjong.socket.emit("update_user", {
                user: mahjong.botInfo,
                room: mahjong.room
            })
        }
        ```

-   `exitSpecutator`

    >   退出观战模式

    -   原型

        ```javascript
        function exitSpecutator(mahjong) {
            mahjong.botInfo.spectator = false
            mahjong.socket.emit("update_user", {
                user: mahjong.botInfo,
                room: mahjong.room
            })
        }
        ```

-   `joinSpecutator`

    >   进入观战者模式

    -   原型

        ```javascript
        function joinSpecutator(mahjong) {
            mahjong.botInfo.spectator = true
            mahjong.socket.emit("update_user", {
                user: mahjong.botInfo,
                room: mahjong.room
            })
        }
        ```

-   `getPrepared`

    >   变成准备状态

    -   原型

        ```javascript
        function cancelPrepared(mahjong) {
            if (mahjong.botInfo.status != 2) {
                mahjong.botInfo.status = 1
                mahjong.socket.emit("update_user", {
                    user: mahjong.botInfo,
                    room: mahjong.room
                })
            }
        }
        ```

-   `cancelPrepared`

    >   取消准备状态

    -   原型

        ```javascript
        function cancelPrepared(mahjong) {
            if (mahjong.botInfo.status != 2) {
                mahjong.botInfo.status = 1
                mahjong.socket.emit("update_user", {
                    user: mahjong.botInfo,
                    room: mahjong.room
                })
            }
        }
        ```

        
