/**
 * bot-SDK JavaScript for Queshin
 * v0.0.2 Beta
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */
const { io } = require("socket.io-client")

/**
 * Card Object Type
 * @param {Number} num   Card Number(0 - 33)
 * @param {Number} type  Card Type(0: available, >0: be used)
 */
function cardObject(num, type) {
    this.num = num
    this.type = type
}

/**
 * playerInfo Type
 * @param {String} nickname   Nickname
 * @param {Number} status     0: Spare 1: Waiting to start 2: Gaming
 * @param {Boolean} spectator is spectator
 */
function playerInfo(nickname, status, spectator) {
    this.nickname = nickname
    this.status = status
    this.spectator = spectator
}

/**
 * Bot Config Type
 * @param {String} server            Server Link
 * @param {String} nickname          Bot's nickname
 * @param {Number} roomId            Room joined Id
 * @param {Function} onLaunch        Executed when launched
 * @param {Function} onConnect       Executed when connected
 * @param {Function} onDisconnect    Executed when disconnected
 * @param {Function} onGameStart     Executed when game started
 * @param {Function} onQuitGame      Executed when quiting game
 * @param {Function} onPlayersUpdate Executed when online players updated
 * @param {Function} onNewOperation  Executed when bot can operate
 * @param {Function} onNewCard       Executed when someone put a card
 * @param {Function} onFinishGame    Executed when game is finished
 * @param {Function} putCard         Choose a card to put given by a card list
 * @param {Function} onGetDragon     Executed when getting dragon
 */
function botConfigObject({
    server,
    nickname,
    roomId,
    onLaunch = (mahjong) => { },
    onConnect = (mahjong) => { },
    onDisconnect = (mahjong) => { },
    onGameStart = (mahjong) => { },
    onQuitGame = (mahjong) => { },
    onPlayersUpdate = (mahjong, onlinePlayers) => { },
    onNewOperation = (mahjong, available, operations, nowCards) => { },
    onNewCard = (mahjong, player, card) => { },
    onFinishGame = (mahjong) => { },
    putCard = (mahjong, card) => { },
    onGetDragon = (mahjong, dragon) => { },
}) {
    this.server = server
    this.nickname = nickname
    this.roomId = roomId
    this.onLaunch = onLaunch
    this.onConnect = onConnect
    this.onDisconnect = onDisconnect
    this.onGameStart = onGameStart
    this.onQuitGame = onQuitGame
    this.onPlayersUpdate = onPlayersUpdate
    this.onNewOperation = onNewOperation
    this.onNewCard = onNewCard
    this.onFinishGame = onFinishGame
    this.putCard = putCard
    this.onGetDragon = onGetDragon
}

/**
 * Generate a bot
 * @param {botConfigObject} botConfig 
 */
function mahjongBot(botConfig) {
    this.gameServer = botConfig.server || "http://127.0.0.1:3000"
    this.onLaunch = botConfig.onLaunch || onLaunch
    this.onConnect = botConfig.onConnect || onConnect
    this.onDisconnect = botConfig.onDisconnect || onDisconnect
    this.onGameStart = botConfig.onGameStart || onGameStart
    this.onQuitGame = botConfig.onQuitGame || onQuitGame
    this.onPlayersUpdate = botConfig.onPlayersUpdate || onPlayersUpdate
    this.onNewOperation = botConfig.onNewOperation || onNewOperation
    this.onNewCard = botConfig.onNewCard || onNewCard
    this.onFinishGame = botConfig.onFinishGame || onFinishGame
    this.onGetDragon = botConfig.onGetDragon || onGetDragon

    this.nickname = botConfig.nickname || "Anonymous"
    this.room = botConfig.roomId || 2333

    this.putCard = botConfig.putCard || putCard

    this.botInfo = {
        nickname: this.nickname,
        status: 0,
        spectator: false
    }
    this.inGame = false

    this.onlinePlayers = []
    this.nowSid = ""
    this.nowCards = []

    this.doOperation = doOperation
    this.exitSpecutator = exitSpecutator
    this.joinSpecutator = joinSpecutator
    this.changeRoom = changeRoom
    this.getPrepared = getPrepared
    this.cancelPrepared = cancelPrepared
    this.chat = chat

    /**
     * The function be executed when the bot is launched
     * @param {mahjongBot} mahjong Self Object
     */
    function onLaunch(mahjong) {
        console.log("Queshin Bot v0.0.1")
        console.log("v2.1.0 by yemaster(PB23151830)")
        console.log("----------------------")
    }

    /**
     * The function be executed when the bot is connected to the server
     * @param {mahjongBot} mahjong Self Object
     */
    function onConnect(mahjong) {
        console.log("Connected to the server successfully!")

        console.log(`Nickname ${mahjong.nickname} join room ${mahjong.room}.`)
    }

    /**
     * The function be executed when the bot is disconnected to the server
     * @param {mahjongBot} mahjong Self Object
     */
    function onDisconnect(mahjong) {
        console.log("Disconnected, waiting for reconnection.")
    }

    /**
     * The function be executed when game starts
     * @param {mahjongBot} mahjong Self Object
     */
    function onGameStart(mahjong) {
        console.log("Game Started")
    }

    /**
     * The function be executed when quiting game
     * @param {mahjongBot} mahjong Self Object
     */
    function onQuitGame(mahjong) {
        console.log("Quit game")
    }

    /**
     * The function be executed when getting all players
     * @param {mahjongBot} mahjong Self
     * @param {Array<playerInfo>} onlinePlayers All player info
     */
    function onPlayersUpdate(mahjong, onlinePlayers) {
        const participants = onlinePlayers.filter(v => !v.spectator)
        //console.log(participants)
        if (participants.length < 4 && mahjong.botInfo.spectator) {
            mahjong.exitSpecutator(mahjong)
        }
        if (participants.length > 1 && mahjong.botInfo.status == 0 && !mahjong.botInfo.spectator) {
            chat(mahjong, `雀神练习生们大家好，我是练习时长两年半的个人练习生${mahjong.botInfo.nickname}，喜欢唱、跳、Rap、篮球`)
            getPrepared(mahjong)
        }
    }

    /**
     * The function be executed when able to operate
     * @param {mahjongBot} mahjong Self Object
     * @param {Boolean} available If available
     * @param {Array<Number>} operations Available Operations: Hu, Gang, Peng, Chi
     * @returns 
     */
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

    /**
     * The function be executed when dragon is got
     * @param {Number} dragon Dragon Card
     */
    function onGetDragon(mahjong, dragon) {

    }

    /**
     * The function be executed when someone put a card
     * @param {mahjongBot} mahjong Self Object
     * @param {String} player Player's Socket id
     * @param {Number} card Card Number
     */
    function onNewCard(mahjong, player, card) {
        //
    }

    /**
     * The function be executed when the game is finished
     * @param {mahjongBot} mahjong Self Object
     * @param {Boolean} isMe If I win
     * @param {String} huPeople the winning person's Socket id
     */
    function onFinishGame(mahjong, isMe, huPeople) {
        if (isMe) {
            // 是自己糊了
            chat(mahjong, `看见ikun的厉害了吧，你们也太菜了`)
        }
        else {
            // 别人糊了
            chat(mahjong, `哟，小黑子还有两把刷子的啊，下局一定赢你`)
        }
    }

    /**
     * Choose a card to put Template Function
     * @param {mahjongBot} mahjong Self Object
     * @param {Array<cardObject>} cardList 
     * @return {Number} The card num to put
     */
    function putCard(mahjong, cardList) {
        const tmp = cardList.filter(v => v.type == 0).sort(() => Math.random() - 0.5)[0]
        return tmp.num
    }

    /**
     * Exit spectator mode
     * @param {mahjongBot} mahjong Self Object
     */
    function exitSpecutator(mahjong) {
        mahjong.botInfo.spectator = false
        mahjong.socket.emit("update_user", {
            user: mahjong.botInfo,
            room: mahjong.room
        })
    }


    /**     
     * Join spectator mode
     * @param {mahjongBot} mahjong Self Object
     */
    function joinSpecutator(mahjong) {
        mahjong.botInfo.spectator = true
        mahjong.socket.emit("update_user", {
            user: mahjong.botInfo,
            room: mahjong.room
        })
    }

    /**
     * Get prepared for the game
     * @param {mahjongBot} mahjong Self Object
     */
    function getPrepared(mahjong) {
        if (mahjong.botInfo.status != 2) {
            mahjong.botInfo.status = 1
            mahjong.socket.emit("update_user", {
                user: mahjong.botInfo,
                room: mahjong.room
            })
        }
    }

    /**
     * Cancel Prepare
     * @param {mahjongBot} mahjong Self Object
     */
    function cancelPrepared(mahjong) {
        if (mahjong.botInfo.status != 2) {
            mahjong.botInfo.status = 1
            mahjong.socket.emit("update_user", {
                user: mahjong.botInfo,
                room: mahjong.room
            })
        }
    }

    /**
     * Change Room Id
     * @param {mahjongBot} mahjong mahjong Obejct
     * @param {Number} roomId new Room Id
     */
    function changeRoom(mahjong, roomId) {
        mahjong.room = roomId
        mahjong.socket.emit("update_user", {
            user: mahjong.botInfo,
            room: mahjong.room
        })
    }

    /**
     * Do Operation
     * @param {Number} opId 
     * @param {Number} cardPos Option
     */
    function doOperation(mahjong, opId, cardPos) {
        mahjong.socket.emit("do_operation", {
            type: opId,
            pos: cardPos
        })
    }

    /**
     * Send a chat message
     * @param {mahjongBot} mahjong Self Object
     * @param {String} message The message to send
     */
    function chat(mahjong, mes) {
        mahjong.socket.emit("send_chat", {
            mes
        })
    }

    this.onLaunch(this)
    this.socket = io(this.gameServer)

    this.socket.on("connect", () => {
        this.onConnect(this)
        this.botInfo.status = 0
        this.socket.emit("update_user", {
            user: this.botInfo,
            room: this.room
        })
    })
    this.socket.on("disconnect", () => {
        this.onDisconnect(this)
    })

    // Update Players Info
    this.socket.on("update_player_info", data => {
        this.onlinePlayers = data.p
        // Find bot in all players, and update
        for (let i = 0; i < this.onlinePlayers.length; ++i)
            if (this.onlinePlayers[i].clientId == this.socket.id) {
                this.botInfo.status = this.onlinePlayers[i].status
                this.botInfo.spectator = this.onlinePlayers[i].spectator
                break
            }
        // Get Status
        if (this.botInfo.status == 2 && !this.inGame) {
            this.inGame = true
            this.onGameStart(this)
        }
        else if (this.botInfo.status != 2 && this.inGame) {
            this.inGame = false
            this.onQuitGame(this)
        }
        this.onPlayersUpdate(this, data.p)
    })

    this.socket.on('get_now_sid', (data) => {
        this.nowSid = data.sid
    })

    this.socket.on('get_dragon', (data) => {
        this.onGetDragon(this, data.dragon)
    })

    let needToPut = -1

    this.socket.on('init_cards', (data) => {
        this.nowCards = data.myCards
        needToPut = -1
        if (this.socket.id == this.nowSid)
            this.socket.emit('get_operation')
    })

    this.socket.on('available_operation', (data) => {
        if (!data.a) {
            if (needToPut == -1)
                needToPut = this.putCard(this, this.nowCards)
            this.socket.emit('put_card', {
                card: needToPut
            })
        }
        else if (this.socket.id == this.nowSid) {
            if (!this.onNewOperation(this, data.a, data.op, this.nowCards)) {
                if (needToPut == -1)
                    needToPut = this.putCard(this, this.nowCards)
                this.socket.emit('put_card', {
                    card: needToPut
                })
            }
            else {
                this.socket.emit('get_operation')
            }
        }
        else {
            if (this.onNewOperation(this, data.a, data.op, this.nowCards)) {
                const shit = setInterval(() => {
                    if (this.nowSid == this.socket.id) {
                        if (needToPut == -1)
                            needToPut = this.putCard(this, this.nowCards)
                        this.socket.emit('put_card', {
                            card: needToPut
                        })
                        clearInterval(shit)
                    }
                }, 200)
            }
        }
    })

    this.socket.on('new_put_card', (data) => {
        this.onNewCard(this, data.c, data.n)
    })

    this.socket.on("someone_hu", (data) => {
        this.onFinishGame(this, data.hu == this.socket.id, data.hu)

        this.botInfo.status = 0
        this.socket.emit("update_user", {
            user: this.botInfo,
            room: this.room
        })
    })
}

module.exports = {
    mahjongBot
}