/**
 * Queshin - v3.1.0 Beta
 * /server.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */


// Basic Configurations
// Set the host and port for the server to listen on
const host = process.env.HOST || '::'
const port = process.env.PORT || 3000
const devMode = false
const chatQueueMaxLength = 30

const { join } = require('path')

// Import Game Core
const { mahjong } = require('./libs/game')

// Create Fastify and set Static Directory
const fastify = require('fastify')({
    logger: false
})
fastify.register(require('@fastify/static'), {
    root: join(__dirname, 'statics'),
    prefix: '/statics/'
})

const socketio = require('fastify-socket.io')
fastify.register(socketio)

// Register Routes
fastify.get('/', (req /* request */, rep /* reply */) => {
    rep.sendFile('start.html')
})
fastify.get('/loading', (req, rep) => {
    rep.sendFile('loading.html')
})
fastify.get('/error', (req, rep) => {
    rep.sendFile('error.html')
})
fastify.get('/teach', (req, rep) => {
    rep.sendFile('teach.html')
})
fastify.get('/room/:id', (req, rep) => {
    if (("interface" in req.query) && (req.query.interface == "old"))
        rep.sendFile('room.html')
    else
        rep.sendFile("room.html")
})

/**
 * Show Start Info
 */
function startPage() {
    console.log(" _____                           __")
    console.log("/\\  __`\\                        /\\ \\      __")
    console.log("\\ \\ \\/\\ \\  __  __     __    ____\\ \\ \\___ /\\_\\    ___")
    console.log(" \\ \\ \\ \\ \\/\\ \\/\\ \\  /'__`\\ /',__\\\\ \\  _ `\\/\\ \\ /' _ `\\")
    console.log("  \\ \\ \\\\'\\\\ \\ \\_\\ \\/\\  __//\\__, `\\\\ \\ \\ \\ \\ \\ \\/\\ \\/\\ \\")
    console.log("   \\ \\___\\_\\ \\____/\\ \\____\\/\\____/ \\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\")
    console.log("    \\/__//_/\\/___/  \\/____/\\/___/   \\/_/\\/_/\\/_/\\/_/\\/_/")
    console.log("v3.1.0 Beta by yemaster(PB23151830)")
    console.log("----------------------")
}

let playerInfo = {}
let playerRoom = {}
let showRoomList = {}
let gameInstances = {}
let roomConfig = {}
let gameCount = 0
let chatQueue = []
for (let i = 0; i < chatQueueMaxLength; ++i)
    chatQueue.push(0)
chatQueueLength = 0
let chatQHead = 0, chatQTail = 0

fastify.listen({ port, host }, (err, add) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    startPage()
    console.log(`Queshin USTC is running at ${add}!`)

    // Socket.io system
    fastify.io.on('connection', socket => {


        /**
         * Get Available Room List
         */
        socket.on('room_list', () => {
            socket.join("roomHall")
            socket.emit("room_list", showRoomList)
        })

        /**
         * Leave Room Hall
         */
        socket.on("exit_hall", () => {
            socket.leave("roomHall")
        })

        /**
         * Update User Info
         * 
         * @param {Object} user_data User Data Object
         * @param {Number} user_data.room Room ID
         */
        socket.on('update_user', (user_data) => {
            let cid = socket.id
            let room = user_data.room

            socket.join(`Room_${room}`)
            if (cid in playerRoom && playerRoom[cid] != room) {
                const joinedRoom = playerRoom[cid]
                const exitPlayer = playerInfo[joinedRoom].filter((item) => item.clientId == cid)
                if (exitPlayer.length > 0) {
                    playerInfo[joinedRoom] = playerInfo[joinedRoom].filter((item) => item.clientId != cid)
                    fastify.io.emit('send_chat', {
                        s: true,
                        mes: exitPlayer[0].nickname + " left room " + joinedRoom
                    })
                    if (!exitPlayer[0].spectator) {
                        for (let i in playerInfo[joinedRoom])
                            playerInfo[joinedRoom][i].status = 0
                        if (joinedRoom in gameInstances) {
                            gameInstances[joinedRoom].ended = true
                            delete gameInstances[joinedRoom]
                        }
                    }
                    if (playerInfo[joinedRoom].length == 0) {
                        delete playerInfo[joinedRoom]
                        delete showRoomList[joinedRoom]
                    }
                    else {
                        showRoomList[joinedRoom].playerNum = playerInfo[joinedRoom].length
                        showRoomList[joinedRoom].player0 = playerInfo[joinedRoom][0].nickname
                    }
                    fastify.io.to(`Room_${joinedRoom}`).emit('update_player_info', { p: playerInfo[joinedRoom] })
                }
            }
            playerRoom[cid] = room

            let data = user_data.user
            data.clientId = cid

            let userId = -1
            // Room is not found, then create it
            if (!(room in playerInfo)) {
                playerInfo[room] = []
                showRoomList[room] = {
                    playerNum: 1,
                    player0: data.nickname,
                    started: false,
                }
                /*roomConfig[room] = {
                    huMod: 23
                }*/
            }
            // Find the player in Room
            for (let i in playerInfo[room]) {
                if (playerInfo[room][i].clientId == data.clientId) {
                    userId = i
                    break
                }
            }
            const availableUsers = playerInfo[room].filter(v => !v.spectator).length
            // Player not found, then add him
            const isStarted = (room in gameInstances && !gameInstances[room].ended)
            if (!isStarted && room in gameInstances) {
                delete gameInstances[room]
                showRoomList[room].started = false
            }
            if (userId == -1) {
                if (availableUsers >= 4 || isStarted) { // 人满了或已经开始了，必须观察
                    socket.emit('must_spectator')
                    data.spectator = true
                    if (isStarted)
                        data.status = 2
                }
                playerInfo[room].push(data)
                fastify.io.emit('send_chat', {
                    s: true,
                    mes: data.nickname + " joined room " + room
                })
                showRoomList[room].playerNum = playerInfo[room].length
            }
            // Find Player, edit his profile
            else {
                if (playerInfo[room][userId].status == 2 && isStarted)
                    return
                if ((playerInfo[room][userId].spectator == true && data.spectator == false && availableUsers >= 4) || isStarted) {  // 人满了，必须观察
                    socket.emit('must_spectator')
                    data.spectator = true
                    if (isStarted)
                        data.status = 2
                }
                if (playerInfo[room][userId].nickname != data.nickname) {
                    fastify.io.emit('send_chat', {
                        s: true,
                        mes: playerInfo[room][userId].nickname + " changes nickname to " + data.nickname
                    })
                    showRoomList[room].player0 = data.nickname
                }
                playerInfo[room][userId] = data
                socket.emit('message', {
                    class: 'success',
                    mes: '修改成功'
                })
            }
            if (data.spectator)
                socket.join(`Spectator_${room}`)
            else
                socket.leave(`Spectator_${room}`)

            let forceNum = playerInfo[room].filter(v => (v.status == 1) && (!v.spectator)).length
            let gamingNum = playerInfo[room].filter(v => (v.status == 2)).length

            //console.log(socket.id, user_data, playerInfo[room])

            if (isStarted)
                gameInstances[room].updateSpectator()
            else if (gamingNum == 0 && availableUsers > 0 && forceNum == availableUsers && forceNum >= 2) {
                showRoomList[room].started = true
                for (let i in playerInfo[room])
                    playerInfo[room][i].status = 2
                gameCount++
                const truePlayers = playerInfo[room].filter(v => !v.spectator)
                //console.log(truePlayers)
                const spectators = playerInfo[room].filter(v => v.spectator)
                gameInstances[room] = new mahjong(truePlayers, spectators, room, fastify.io, 23, devMode)
                gameInstances[room].sendCards()
            }
            fastify.io.to('roomHall').emit("room_list", showRoomList)
            fastify.io.to(`Room_${room}`).emit('update_player_info', { p: playerInfo[room] })
        })

        // Game
        socket.on('put_card', (data) => {
            if (!(socket.id in playerRoom))
                return
            let room = playerRoom[socket.id]
            if (!(room in gameInstances))
                return
            gameInstances[room].putCard(socket.id, data.card)
        })

        socket.on('get_operation', () => {
            //console.log(socket.id)
            if (!(socket.id in playerRoom))
                return
            let room = playerRoom[socket.id]
            if (!(room in gameInstances))
                return
            gameInstances[room].getOps(socket.id)
        })

        socket.on('do_operation', (data) => {
            //console.log(data)
            if (!(socket.id in playerRoom))
                return
            let room = playerRoom[socket.id]
            if (!(room in gameInstances))
                return
            gameInstances[room].doOperation(socket.id, data.type, data.pos)
        })

        socket.on('kick_off', (sid) => {
            if (!(socket.id in playerRoom))
                return
            let room = playerRoom[socket.id]
            if (playerInfo[room].length == 0)
                return
            if (playerInfo[room][0].clientId != socket.id) {
                socket.emit('message', {
                    class: 'error',
                    mes: '你不是管理员，不可以踢人'
                })
                return
            }
            //console.log(playerInfo[room])
            for (let i = 0; i < playerInfo[room].length; ++i) {
                if (playerInfo[room][i].clientId == sid) {
                    fastify.io.to(`Room_${room}`).emit("message", {
                        class: "info",
                        mes: `${playerInfo[room][i].nickname}被管理员踢出房间`
                    })
                    fastify.io.to(sid).emit("be_kicked_off")
                    return
                }
            }
        })

        socket.on('disconnect', () => {
            cid = socket.id
            if (cid in playerRoom) {
                const joinedRoom = playerRoom[cid]
                delete playerRoom[cid]
                const exitPlayer = playerInfo[joinedRoom].filter((item) => item.clientId == cid)
                if (exitPlayer.length > 0) {
                    playerInfo[joinedRoom] = playerInfo[joinedRoom].filter((item) => item.clientId != cid)
                    fastify.io.emit('send_chat', {
                        s: true,
                        mes: exitPlayer[0].nickname + " left room " + joinedRoom
                    })
                    if (!exitPlayer[0].spectator) {
                        for (let i in playerInfo[joinedRoom])
                            playerInfo[joinedRoom][i].status = 0
                        if (joinedRoom in gameInstances) {
                            gameInstances[joinedRoom].ended = true
                            delete gameInstances[joinedRoom]
                        }
                    }
                    if (playerInfo[joinedRoom].length == 0) {
                        delete playerInfo[joinedRoom]
                        delete showRoomList[joinedRoom]
                    }
                    else {
                        showRoomList[joinedRoom].playerNum = playerInfo[joinedRoom].length
                        showRoomList[joinedRoom].player0 = playerInfo[joinedRoom][0].nickname
                    }
                    fastify.io.to("roomHall").emit("room_list", showRoomList)
                    fastify.io.to(`Room_${joinedRoom}`).emit('update_player_info', { p: playerInfo[joinedRoom] })
                }
            }
        })

        // Chat
        socket.on('send_chat', function (data) {
            if (!(socket.id in playerRoom))
                return
            if (data.mes.length == 0) {
                socket.emit('message', {
                    class: 'error',
                    mes: `禁止发送空消息`
                })
                return
            }

            const nowTime = Math.floor(new Date().getTime() / 1000)
            while (chatQueueLength > 0 && chatQueue[chatQHead] + 60 < nowTime) {
                chatQHead = (chatQHead + 1) % chatQueueMaxLength
                chatQueueLength--;
            }
            if (chatQueueLength < chatQueueMaxLength) {
                chatQueueLength++;
                chatQueue[chatQTail] = nowTime;
                chatQTail = (chatQTail + 1) % chatQueueMaxLength
                let room = playerRoom[socket.id]
                let nickname = "Anonymous"
                for (let i in playerInfo[room])
                    if (playerInfo[room][i].clientId == socket.id)
                        nickname = playerInfo[room][i].nickname
                data.user = nickname
                fastify.io.emit('send_chat', data)
            }
            else {
                socket.emit('message', {
                    class: 'error',
                    mes: `聊天消息过多，还需要${Math.floor(60 - nowTime + chatQueue[chatQHead])}秒才可以发送`
                })
            }
        })
    })
})