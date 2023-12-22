/**
 * Queshin - v3.1.0 Beta
 * /libs/game.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */

const { isAgari } = require("./hu")

/**
 * Mahjong Main Game
 * @param {Array} players Players' info
 * @param {Object} io Socket IO Object
 * @param {Boolean} dev_mode Dev_mode On/Off
 */

if (!Array.prototype.count) {
    Array.prototype.count = function (v) {
        if (typeof (v) == "function")
            return this.filter(t => v(t)).length
        else
            return this.filter(t => t == v).length
    }
}

/**
 * Mahjong Main
 * 
 * @param {Array} players 
 * @param {Array} spectators 
 * @param {Number} room 
 * @param {Object} io 
 * @param {Number} huMod
 * @param {Boolean} devMode 
 */
function mahjong(players, spectators, room, io, huMod, devMode) {
    this.all = []  // All cards
    this.dragon = -1 // Dragon
    this.lastCard = 0 // The card that put last
    this.nowCard = 0
    this.round = 1

    this.nowPlayer = Math.floor(Math.random() * players.length)
    this.players = players
    this.spectators = spectators
    this.playerCards = {} // Record each players' cards
    this.opList = [[], [], [], []] // 胡，杠，碰，吃
    this.opPlayer = []

    this.huMod = huMod

    this.start = false
    this.ended = false

    this.room = room
    this.io = io // Socket IO Object

    this.sendCards = sendCards
    this.putCard = putCard
    this.doOperation = doOperation
    this.getOps = getOps

    this.updateSpectator = function () {
        const _t = this
        _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
            all: _t.playerCards
        })
        _t.io.to(`Spectator_${_t.room}`).emit('get_dragon', {
            dragon: _t.dragon
        })
    }

    /**
     * Init cards
     */
    function initCards() {
        let pc = []
        for (let i = 0; i < 136; ++i)
            pc.push(Math.floor(i / 4))
        if (!devMode)
            pc.sort(() => Math.random() - 0.5)
        this.all = pc
        this.nowCard = 0
    }

    /**
     * Get next card
     */
    function nextCard() {
        return this.all[this.nowCard++]
    }

    /**
     * Send Cards to All Players
     */
    function sendCards() {
        const _t = this
        initCards()
        _t.playerCards = {}
        for (let i = 0; i < _t.players.length; ++i)
            _t.playerCards[_t.players[i].clientId] = []
        let j = 0
        _t.io.to(`Room_${_t.room}`).emit("game_start")
        let sendBot = setInterval(function () {
            ++j
            if (j === 4) { // The 4th round.
                for (let i = 0; i < _t.players.length; ++i) {
                    _t.playerCards[_t.players[(i + _t.nowPlayer) % _t.players.length].clientId].push({ num: nextCard(), type: 0 })

                    _t.io.to(_t.players[i].clientId).emit('init_cards', {
                        myCards: _t.playerCards[_t.players[i].clientId]
                    }) // type=0: available, type=1:operated
                    _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                        all: _t.playerCards
                    })

                    if (i != 0)
                        continue
                    _t.io.to(`Room_${_t.room}`).emit("get_now_sid", {
                        sid: _t.players[(i + _t.nowPlayer) % _t.players.length].clientId
                    })
                    _t.playerCards[_t.players[(i + _t.nowPlayer) % _t.players.length].clientId].push({ num: nextCard(), type: 0 })
                }
                setTimeout(function () {
                    // Sort each player's card
                    for (let i = 0; i < _t.players.length; ++i) {
                        _t.playerCards[_t.players[i].clientId].sort((a, b) => {
                            if (a.type != b.type) return b.type - a.type
                            else return a.num - b.num
                        })
                    }
                    // The next cards' successor is dragon
                    _t.dragon = [1, 2, 3, 4, 5, 6, 7, 8, 0, 10, 11, 12, 13, 14, 15, 16, 17, 9, 19, 20, 21, 22, 23, 24, 25, 26, 18, 28, 29, 30, 27, 32, 33, 31][nextCard()]
                    for (let i = 0; i < _t.players.length; ++i) {
                        _t.io.to(_t.players[i].clientId).emit('init_cards', {
                            myCards: _t.playerCards[_t.players[i].clientId]
                        })
                    }
                    _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                        all: _t.playerCards
                    })
                    _t.io.to(`Room_${_t.room}`).emit('get_dragon', {
                        dragon: _t.dragon
                    })
                    _t.start = true
                }, 500)
                clearInterval(sendBot)
                return
            }
            // During the first three rounds, each player get four cards
            for (let i = 0; i < _t.players.length; ++i) {
                for (let k = 1; k <= 4; ++k)
                    _t.playerCards[_t.players[(i + _t.nowPlayer) % _t.players.length].clientId].push({ num: nextCard(), type: 0 })
            }
            for (let i = 0; i < _t.players.length; ++i) {
                _t.io.to(_t.players[i].clientId).emit('init_cards', {
                    myCards: _t.playerCards[_t.players[i].clientId]
                })
            }
            _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                all: _t.playerCards
            })
        }, 500)
    }

    /**
     * Put one card
     * @param {String} sid Player's Socket IO ID
     * @param {Number} card Card Info
     */
    function putCard(sid, card) {
        const _t = this

        // Find Player's position
        let pid = 0
        for (let i = 0; i < _t.players.length; ++i) {
            if (_t.players[i].clientId == sid)
                break
            ++pid
        }

        if (!_t.start) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '游戏还未开始'
            })
            return
        }

        // If someone else can operate or not this time, then throw error
        if ((_t.opPlayer.length > 0 && _t.opPlayer[0] != sid) || pid != _t.nowPlayer) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '不是你的回合'
            })
            return
        }
        if (_t.playerCards[sid].filter(item => item.num == card && item.type == 0).length <= 0) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '没有这张牌'
            })
            return
        }

        // Cancel this player's all operation ability
        _t.io.to(sid).emit('available_operation', {
            a: false,
            // 胡，杠，碰，吃
            op: [false, false, false, false],
            finish: true,   // If finish putting card
        })

        // Delete the card, and update
        let isDelete = false
        let newCards = []
        for (let i = 0; i < _t.playerCards[sid].length; ++i)
            if (_t.playerCards[sid][i].num == card && _t.playerCards[sid][i].type == 0 && !isDelete)
                isDelete = true
            else
                newCards.push(_t.playerCards[sid][i])
        //console.log(newCards)
        newCards.sort((a, b) => {
            if (a.type != b.type) return b.type - a.type
            else return a.num - b.num
        })
        _t.playerCards[sid] = newCards
        _t.io.to(sid).emit('init_cards', {
            myCards: _t.playerCards[sid]
        })
        _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
            all: _t.playerCards
        })

        // Get next Player
        const base = _t.nowPlayer
        let np = _t.nowPlayer + 1
        if (np == _t.players.length)
            np = 0

        // Emit the put card
        _t.round++
        _t.lastCard = card
        _t.io.to(`Room_${_t.room}`).emit('new_put_card', {
            n: card,
            c: sid
        })

        let nowCid = _t.players[np].clientId

        _t.opList = [[], [], [], []] // 胡，杠，碰，吃
        for (let i = 0; i < _t.players.length; ++i) {
            const realIndex = (base + i) % _t.players.length
            const psid = _t.players[realIndex].clientId
            if (psid == sid) // Can't operate my card
                continue
            let flatCard = []
            let cardCount = {}
            for (let j = 0; j < 34; ++j)
                cardCount[j] = 0
            for (let j = 0; j < _t.playerCards[psid].length; ++j) {
                if (_t.playerCards[psid][j].type == 0) {
                    cardCount[_t.playerCards[psid][j].num]++
                    flatCard.push(_t.playerCards[psid][j].num)
                }
            }
            //console.log(realIndex, cardCount, flatCard)
            if (card < 27 && psid == nowCid) { // Eat
                if ((card % 9 >= 2 && cardCount[card - 1] >= 1 && cardCount[card - 2] >= 1) ||
                    (card % 9 >= 1 && card % 9 <= 7 && cardCount[card - 1] >= 1 && cardCount[card + 1] >= 1) ||
                    (card % 9 <= 6 && cardCount[card + 1] >= 1 && cardCount[card + 2] >= 1)) {
                    _t.opList[3].push(psid)
                }
            }
            if (cardCount[card] >= 2)
                _t.opList[2].push(psid)
            if (cardCount[card] >= 3)
                _t.opList[1].push(psid)
            if (isAgari(flatCard.concat([card]), _t.dragon, _t.huMod))
                _t.opList[0].push(psid)
        }
        _t.opPlayer = []
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < _t.opList[i].length; ++j) {
                //console.log(_t.opPlayer)
                if (_t.opPlayer.indexOf(_t.opList[i][j]) == -1)
                    _t.opPlayer.push(_t.opList[i][j])
            }
        }
        //console.log(_t.opList, _t.opPlayer)

        // Let Next Player to Play
        if (_t.opPlayer.length == 0) {
            _t.nowPlayer++
            if (_t.nowPlayer == _t.players.length)
                _t.nowPlayer = 0
            _t.playerCards[nowCid].push({ num: nextCard(), type: 0 })
            _t.io.to(`Room_${_t.room}`).emit("get_now_sid", {
                sid: nowCid
            })
            _t.io.to(nowCid).emit('init_cards', {
                myCards: _t.playerCards[nowCid]
            })
            _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                all: _t.playerCards
            })
        }
        else {
            _t.io.to(_t.opPlayer[0]).emit('available_operation', {
                a: true,
                op: [
                    _t.opList[0].indexOf(_t.opPlayer[0]) != -1,
                    _t.opList[1].indexOf(_t.opPlayer[0]) != -1,
                    _t.opList[2].indexOf(_t.opPlayer[0]) != -1,
                    _t.opList[3].indexOf(_t.opPlayer[0]) != -1,
                ]
            })
        }
    }

    /**
     * 自摸和暗杠判定
     * @param {String} sid Socket io 
     */
    function getOps(sid) {
        const _t = this
        let flag = false, pid = 0
        for (let i = 0; i < _t.players.length; ++i) {
            if (_t.players[i].clientId == sid) {
                flag = true
                break
            }
            pid++
        }
        if (!flag) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '找不到用户信息'
            })
            return
        }
        if (_t.opPlayer.length > 0 || _t.nowPlayer != pid)
            return
        let cardCount = {}
        let flatCard = []
        for (let i = 0; i < 34; ++i)
            cardCount[i] = 0

        for (let i = 0; i < _t.playerCards[sid].length; ++i) {
            if (_t.playerCards[sid][i].type == 0) {
                cardCount[_t.playerCards[sid][i].num]++
                flatCard.push(_t.playerCards[sid][i].num)
            }
        }
        let op = [false, false, false, false]
        flag = false
        if (isAgari(flatCard, _t.dragon, _t.huMod)) {
            op[0] = true
            _t.opList[0] = [sid]
            flag = true
        }
        for (let i = 0; i < 34; ++i)
            if (cardCount[i] == 4) {
                op[1] = true
                _t.opList[1] = [sid]
                flag = true
                break
            }
        _t.io.to(sid).emit('available_operation', {
            a: flag,
            op,
            finish: false
        })
    }

    /**
     * Do Operation
     * @param {String} sid  Socket.IO id
     * @param {Number} tp Type(0:cancel,1:hu,2:gang,3:peng,4:chi)
     * @param {Number} pos The Position in operation
     */
    function doOperation(sid, tp, pos) {
        const _t = this
        const card = _t.lastCard
        let flag = false, pid = 0
        let op_cards = []
        for (let i = 0; i < _t.players.length; ++i) {
            if (_t.players[i].clientId == sid) {
                flag = true
                break
            }
            pid++
        }
        if (!flag) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '找不到用户信息'
            })
            return
        }
        if (!_t.start) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '游戏还未开始'
            })
            return
        }
        if (pid != _t.nowPlayer && (_t.opPlayer.length <= 0 || _t.opPlayer[0] != sid)) {
            _t.io.to(sid).emit('message', {
                class: 'error',
                mes: '不是你的回合'
            })
            return
        }
        if (tp == 0) { // Canceled
            if (pid == _t.nowPlayer) {
                _t.io.to(sid).emit('message', {
                    class: 'error',
                    mes: '你不能这么操作！'
                })
                return
            }
            _t.io.to(sid).emit('available_operation', {
                a: false,
                // 胡，杠，碰，吃
                op: [false, false, false, false],
            })
            _t.opPlayer = _t.opPlayer.slice(1)

            _t.nowPlayer++
            if (_t.nowPlayer == _t.players.length)
                _t.nowPlayer = 0

            let nowCid = _t.players[_t.nowPlayer].clientId
            if (_t.opPlayer.length == 0) {
                _t.io.to(`Room_${_t.room}`).emit("get_now_sid", {
                    sid: nowCid
                })
                _t.playerCards[nowCid].push({ num: nextCard(), type: 0 })
                _t.io.to(nowCid).emit('init_cards', {
                    myCards: _t.playerCards[nowCid]
                })
                _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                    all: _t.playerCards
                })
            }
            else {
                _t.io.to(_t.opPlayer[0]).emit('available_operation', {
                    a: true,
                    op: [
                        _t.opList[0].indexOf(_t.opPlayer[0]) != -1,
                        _t.opList[1].indexOf(_t.opPlayer[0]) != -1,
                        _t.opList[2].indexOf(_t.opPlayer[0]) != -1,
                        _t.opList[3].indexOf(_t.opPlayer[0]) != -1,
                    ]
                })
            }
        }
        else {
            let flatCard = []
            //console.log(tp)
            if (_t.opList[tp - 1].indexOf(sid) == -1) {
                _t.io.to(sid).emit('message', {
                    class: 'error',
                    mes: '你不能这么操作！'
                })
                return
            }
            for (let i = 0; i < _t.playerCards[sid].length; ++i)
                if (_t.playerCards[sid][i].type == 0) {
                    flatCard.push(_t.playerCards[sid][i].num)
                }
            if (tp == 1) {
                if (pid != _t.nowPlayer) {
                    _t.playerCards[sid].push({
                        num: card,
                        type: 0
                    })
                }
                _t.playerCards[sid].sort((a, b) => {
                    if (a.type != b.type) return b.type - a.type
                    else return a.num - b.num
                })
                _t.io.to(`Room_${_t.room}`).emit('someone_hu', {
                    hu: sid,
                    all: _t.playerCards
                })
                _t.ended = true
                return
            }
            else if (tp == 2) {
                let pCount = 0
                //console.log(Number(pos))
                if (pid == _t.nowPlayer) {
                    //console.log("OK")
                    if (Number(pos) < 0 && Number(pos) >= 34 || flatCard.count(pos) < 4) {
                        _t.io.to(sid).emit('message', {
                            class: 'error',
                            mes: '你不能这么操作！'
                        })
                        return
                    }
                    for (let i = 0; i < _t.playerCards[sid].length; ++i) {
                        if (_t.playerCards[sid][i].type == 0 && _t.playerCards[sid][i].num == pos) {
                            _t.playerCards[sid][i].type = _t.round
                            pCount++
                            if (pCount == 4)
                                break
                        }
                    }
                }
                else {
                    pos = card
                    if (flatCard.count(pos) < 3) {
                        _t.io.to(sid).emit('message', {
                            class: 'error',
                            mes: '你不能这么操作！'
                        })
                        return
                    }
                    for (let i = 0; i < _t.playerCards[sid].length; ++i) {
                        if (_t.playerCards[sid][i].type == 0 && _t.playerCards[sid][i].num == card) {
                            _t.playerCards[sid][i].type = _t.round
                            pCount++
                            if (pCount == 3)
                                break
                        }
                    }
                }
                for (let i = 0; i < 4; ++i)
                    op_cards.push(pos)
            }
            else if (tp == 3) {
                let pCount = 0
                for (let i = 0; i < _t.playerCards[sid].length; ++i) {
                    if (_t.playerCards[sid][i].type == 0 && _t.playerCards[sid][i].num == card) {
                        _t.playerCards[sid][i].type = _t.round
                        pCount++
                        if (pCount == 2)
                            break
                    }
                }
                for (let i = 0; i < 3; ++i)
                    op_cards.push(card)
            }
            else if (tp == 4) {
                let needDelete = [card + pos, card + pos + 1, card + pos + 2]
                if ((needDelete[0] + 9) % 9 >= 7 || (needDelete[2] + 9) % 9 <= 1 || needDelete[2] >= 27) {
                    _t.io.to(sid).emit('message', {
                        class: 'error',
                        mes: '你不能这么操作！'
                    })
                    return
                }
                needDelete = needDelete.filter(v => v != card)
                for (let i = 0; i < _t.playerCards[sid].length; ++i) {
                    if (_t.playerCards[sid][i].type != 0)
                        continue
                    let pos = needDelete.indexOf(_t.playerCards[sid][i].num)
                    if (pos != -1) {
                        //_t.playerCards[sid][i].type = _t.round
                        needDelete = needDelete.slice(0, pos).concat(needDelete.slice(pos + 1))
                    }
                }
                //console.log(needDelete, pos)
                if (needDelete.length > 0) {
                    _t.io.to(sid).emit('message', {
                        class: 'error',
                        mes: '你不能这么操作！'
                    })
                    return
                }
                needDelete = [card + pos, card + pos + 1, card + pos + 2]
                op_cards = [card + pos, card + pos + 1, card + pos + 2]
                needDelete = needDelete.filter(v => v != card)
                for (let i = 0; i < _t.playerCards[sid].length; ++i) {
                    if (_t.playerCards[sid][i].type > 0)
                        continue
                    let pos = needDelete.indexOf(_t.playerCards[sid][i].num)
                    if (pos != -1) {
                        _t.playerCards[sid][i].type = _t.round
                        needDelete = needDelete.slice(0, pos).concat(needDelete.slice(pos + 1))
                    }
                }
            }
            if (pid != _t.nowPlayer) {
                _t.playerCards[sid].push({
                    num: card,
                    type: _t.round
                })
            }
            _t.playerCards[sid].sort((a, b) => {
                if (a.type != b.type) return b.type - a.type
                else return a.num - b.num
            })
            _t.io.to(`Room_${_t.room}`).emit("someone_op", {
                p: pid,
                cards: op_cards
            })
            _t.io.to(sid).emit('available_operation', {
                a: false,
                // 胡，杠，碰，吃
                op: [false, false, false, false],
            })

            _t.io.to(sid).emit('init_cards', {
                myCards: _t.playerCards[sid]
            })
            _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                all: _t.playerCards
            })

            _t.nowPlayer = pid
            _t.io.to(`Room_${_t.room}`).emit("get_now_sid", {
                sid
            })
            if (tp == 2) {
                _t.playerCards[sid].push({ num: nextCard(), type: 0 })
                _t.io.to(sid).emit('init_cards', {
                    myCards: _t.playerCards[sid]
                })
                _t.io.to(`Spectator_${_t.room}`).emit('get_all_cards', {
                    all: _t.playerCards
                })
            }
        }
    }
}

module.exports = {
    mahjong
}