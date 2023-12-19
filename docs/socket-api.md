## Socket.io API

>   **注意** 该文档可能未完成。

###  `emit`事件 - `update_user`

>    用于客户端向服务器端发送当前用户数据

**参数**

-   `user_data` (Object): 用户数据
    -   `user_data.room` (Number): 房间号
    -   `user_data.user` (Object): 用户信息
        -   `user_data.user.nickname` (String): 用户昵称

**示例**

JavaScript:

```js
socket.emit("update_user", {
    user: {
        nickname: "Anonymous"
    },
    room: 2333
})
```

### `emit`事件 - `send_chat`

>    用于客户端向服务器端发送用户想要聊天的内容

**参数**

-   `data` (Object): 聊天数据
    -   `data.mes` (String): 聊天信息

**示例**

JavaScript:

```js
socket.emit("send_chat", {
    mes: "Hello, dalaos in 2023 Advanced Programming Class"
})
```

### `emit`事件 - `put_card`

>    用于客户端向服务器端发送用户打出的牌

**参数**

-   `data` (Object)
    -   `data.card` (Number): 打出的牌id，参见 数据格式-各牌的id

**示例**

JavaScript

```js
socket.emit("put_card", {
    card: 1
})
```

### `emit`事件 - `do_operation`

>    用于客户端向服务器端发送用户需要的胡、杠、碰、吃操作

**参数**

-   `data` (Object)
    -   `data.type` (Number): 操作的id，参见 数据格式-操作的id
    -   `data.pos` (Number): 吃的牌在顺子中的位置(0表示最左，-1表示正中，-2表示最右)

**示例**

JavaScript

```js
socket.emit("do_operation", {
    type: 4,
    pos: -1
})
```

### `on`事件 - `update_player_info`

### `on`事件 - `message`

>    用于客户端接受系统发来的错误/成功消息

**参数**

-   `data` (Object)
    -   `data.class` (String): 消息的类型，参见 数据格式-消息类型
    -   `data.message` (String): 消息内容

**示例**

JavaScript

```js
socket.on("message", data => {
    console.log(`[${data.class}]${data.message}`)
})
```

### `on`事件 - `send_chat`

>    用于客户端接受服务器端发来的聊天消息

**参数**

-   `data` (Object): 聊天数据

    -   `data.s` (Boolean): 是否为系统提示消息

    -   `data.user` (String): 聊天发送者

    -   `data.mes` (String): 聊天信息

`data.s`和`data.user`两个参数有且仅有一个。

**示例**

JavaScript:

```js
socket.on("send_chat", data => {
    if (data.s)
        console.log("System Send:", data.mes)
    else
        console.log(`${data.user} Send:`, data.mes)
})
```

### `on`事件 - `init_cards`

>    用于客户端接受当前用户的手牌

**参数**

-   `data` (Object)
    -   `data.myCards` (Array): 手牌列表

**示例**

JavaScript:

```js
socket.on('init_cards', data => {
    for (let i in data.myCards)
        console.log(data.myCards[i].num, data.myCards[i].type)
})
```

### `on`事件 - `get_dragon`

>    用于客户端接受本局的龙(财神)的id

**参数**

-   `data` (Object)
    -   `data.dragon` (Number): 龙的id

**示例**

```js
socket.on('get_dragon', data => {
    console.log("Dragon: ", data.dragon)
})
```



### `on`事件 - `available_operation`

### `on`事件 - `new_put_card`

>    用于客户端接受最新被打出的牌

**参数**

-   `data` (Object)
    -   `data.c` (String): 打出牌用户的socket.io client ID
    -   `data.n` (Number): 打出牌的id

**示例**

```js
socket.on('new_put_card', data => {
    console.log()
})
```

### `on`事件 - `someone_hu`





## 数据格式

### 各牌的id

一万-九万：0-8

一筒-九筒：9-17

一条-九条：18-26

东南西北中发白：27-33

### 操作的id

取消、胡杠碰吃：0-4

### 消息类型

-   error: 错误
-   success: 成功

### 手牌元素格式

`card` (Card Object): 一个手牌

-   `card.num` (Number): 手牌的id
-   `card.type` (Number): 0表示手牌未被操作过，若手牌被操作过，此项为被操作的轮

示例：

```json
{
    "num": 1,
    "type": 0
}
```

