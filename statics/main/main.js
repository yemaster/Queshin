/**
 * Queshin - v3.1.0 Beta
 * /statics/main/main.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */

let mahjong = new Vue({
    el: '#app',
    data: {
        // 获取房间号
        room: tmpRoom,
        toRoom: tmpRoom,
        roomInfo: {
            roomAvailable,
        },
        availableRoom: [],
        // 应用信息
        app: {
            name: 'Queshin',
            version: 'v3.1.1',
            author: 'yemaster',
        },
        navShow: 1,
        navs: [
            { name: 'nav.hall' },
            { name: 'nav.room' },
            { name: 'nav.me' },
            { name: 'nav.settings' }
        ],
        // 当前登陆的用户信息
        user: {
            nickname: `ikun_${Math.floor(Math.random() * 9000) + 1000}`,
            status: 0,
            spectator: false
        },
        // Socket.io Object
        sked: {
            id: 'Unknown'
        },
        // 当前存储的游戏信息
        game: {
            cards: [],
            dragon: -1,
            pt: [[], [], [], []],
            op: [[], [], [], []],
            me: -1,
        },
        serverLink: '',
        // 在线用户信息
        onlineUsers: [],
        chatShowMode: true,
        chats: [],
        chatMessage: '',
        isloading: 1,
        canOp: false,
        newPutCard: 0,
        gangCard: [],
        eatPos: [],
        nowSid: "",
        availableOp: [false, false, false, false],
        huPeople: '',
        allShow: {},
        allHuMods: [{ val: 1, name: "标准" }, { val: 2, name: "十三不搭" }, { val: 4, name: "七对子" }, { val: 8, name: "十三幺" }, { val: 16, name: "四龙" }],
        chosenHuMods: [true, true, true, false, true],
        // 支持的多语言，英语日语主要来自于机翻
        langs: [{
            val: 'en',
            show: 'English',
            flag: 'gb uk'
        },
        {
            val: 'cn',
            show: '简体中文',
            flag: 'cn'
        },
        {
            val: 'jp',
            show: '日本語',
            flag: 'jp'
        },],
        cardsName: ["1万", "2万", "3万", "4万", "5万", "6万", "7万", "8万", "9万", "1筒", "2筒", "3筒", "4筒", "5筒", "6筒", "7筒", "8筒", "9筒", "1条", "2条", "3条", "4条", "5条", "6条", "7条", "8条", "9条", "东", "南", "西", "北", "中", "发", "白"]
    },
    watch: {
        navShow(n, o) {
            const _t = this

            if (!_t.roomInfo.roomAvailable && n != 0) {
                _t.navShow = o
                return
            }

            localStorage.mtab = n
            _t.$nextTick(() => {
                if (n != o) {
                    if (n == 3) {
                        $('.langdp').dropdown({
                            onChange: function (value) {
                                _t.$i18n.locale = value
                                localStorage.mlang = value
                            }
                        })
                    }
                    else if (n == 0) {
                        _t.sked.emit("room_list")
                    }
                    else if (o == 0) {
                        _t.sked.emit("exit_hall")
                    }
                }
            })
        },
    },
    created() {
        window.addEventListener('beforeunload', e => this.closeConnect(e))
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', e => this.closeConnect(e))
    },
    mounted() {
        let _t = this
        $('.ui.checkbox').checkbox()
        _t.sked = io()

        if (localStorage.mnick != undefined)
            _t.user.nickname = localStorage.mnick
        if (localStorage.mtab != undefined)
            _t.navShow = localStorage.mtab
        if (localStorage.mlang != undefined)
            _t.$i18n.locale = localStorage.mlang

        _t.sked.on('connect', function () {
            _t.isloading = 0
            _t.game = {
                cards: [],
                dragon: -1,
                pt: [[], [], [], []],
                me: -1,
            }
            _t.newPutCard = 0
            _t.gangCard = []
            _t.eatPos = []
            _t.nowSid = ""
            _t.canOp = false
            _t.availableOp = [false, false, false, false]
            if (!_t.roomInfo.roomAvailable)
                return
            _t.user.status = 0
            _t.updateMe()
        })
        _t.sked.on("room_list", (data) => {
            _t.availableRoom = data
        })
        _t.sked.on('disconnect', (data) => {
            _t.isloading = 1
        })
        if (!_t.roomInfo.roomAvailable) {
            _t.navs = [{ name: 'nav.hall' }]
            return
        }
        _t.sked.on("be_kicked_off", () => {
            location.href = "/room/hall"
        })
        _t.sked.on('update_player_info', function (data) {
            _t.onlineUsers = data.p
            let cnt = 0
            for (let i = 0; i < _t.onlineUsers.length; ++i) {
                if (_t.onlineUsers[i].clientId == _t.sked.id) {
                    _t.user.status = _t.onlineUsers[i].status
                    _t.game.me = cnt
                }
                ++cnt
            }
            cnt = 0
            for (let i = 0; i < _t.onlineUsers.length; ++i) {
                if (!_t.onlineUsers[i].spectator) {
                    if (_t.onlineUsers[i].clientId == _t.sked.id) {
                        _t.game.game_me = cnt
                    }
                    ++cnt
                }
            }
        })

        // Get System Message, Show Toast
        _t.sked.on('message', function (data) {
            $('body')
                .toast({
                    class: data.class,
                    message: data.mes,
                    className: {
                        toast: 'ui message'
                    }
                })
                ;
        })

        _t.sked.on('available_operation', function (data) {
            _t.canOp = data.a
            _t.availableOp = data.op
            if (_t.availableOp[1]) {
                _t.gangCard = []
                for (let k = 0; k < 34; ++k) {
                    if (_t.game.cards.filter(v => (v.num == k) && (v.type == 0)).length == 4)
                        _t.gangCard.push(k)
                }
            }
            if (_t.availableOp[3]) {
                _t.eatPos = []
                for (let pos = -2; pos <= 0; ++pos) {
                    let flag = false
                    if ((_t.newPutCard % 9 + pos) >= 0 && (_t.newPutCard % 9 + pos + 2) < 9) {
                        //console.log("OK")
                        flag = true
                        for (let k = 0; k < 3; ++k) {
                            if ((_t.newPutCard != _t.newPutCard + pos + k) && (_t.game.cards.filter(v => (v.num == _t.newPutCard + pos + k) && (v.type == 0)).length == 0)) {
                                flag = false
                                break
                            }
                        }
                    }
                    _t.eatPos.push(flag)
                }
            }
            _t.$nextTick(() => {
                $('.gang-option')
                    .popup({
                        inline: true,
                        hoverable: true,
                        delay: {
                            show: 120,
                            hide: 400
                        }
                    })
                    ;
                $('.eat-option')
                    .popup({
                        inline: true,
                        hoverable: true,
                        delay: {
                            show: 120,
                            hide: 400
                        }
                    })
                    ;
            })
        })

        _t.sked.on('get_now_sid', function (data) {
            _t.nowSid = data.sid
        })
        _t.sked.on('someone_op', function (data) {
            _t.game.op[data.p] = _t.game.op[data.p].concat(data.cards)
        })
        _t.sked.on('send_chat', function (data) {
            _t.chats.push(data)
            _t.$nextTick(() => {
                document.getElementById("chat-main").scrollTop = 2333333
            })
        })
        _t.sked.on('init_cards', function (data) {
            _t.game.cards = data.myCards
            const availableCount = _t.game.cards.filter(v => v.type == 0).length
            //if (_t.sked.id == _t.nowSid)
            if ((availableCount - 2) % 3 == 0 && data.myCards.length >= 14)
                _t.sked.emit('get_operation')
        })
        _t.sked.on('get_dragon', function (data) {
            _t.game.dragon = data.dragon
        })
        _t.sked.on('new_put_card', (data) => {
            let olu = _t.onlineUsers
            let cp = -1
            let cnt = 0
            for (let i = 0; i < olu.length; ++i) {
                if (!olu[i].spectator) {
                    if (olu[i].clientId == data.c)
                        cp = cnt
                    ++cnt
                }
            }
            if (cp == -1 && _t.user.spectator) {
                $('body')
                    .toast({
                        class: 'error',
                        message: '致命的错误：cid not found'
                    })
                return
            }
            _t.newPutCard = data.n
            if (typeof _t.game.pt[cp] != 'object')
                _t.game.pt[cp] = []
            for (let i = 0; i < _t.game.pt.length; ++i)
                for (let j = 0; j < _t.game.pt[i].length; ++j)
                    _t.game.pt[i][j] %= 100
            _t.game.pt[cp].push(data.n + 100)
        })
        _t.sked.on("game_start", () => {
            _t.game.cards = []
            _t.game.dragon = -1
            _t.game.pt = [[], [], [], []]
            _t.game.op = [[], [], [], []]
            _t.newPutCard = 0
            _t.gangCard = []
            _t.eatPos = []
            _t.nowSid = ""
            _t.canOp = false
            _t.availableOp = [false, false, false, false]
        })
        _t.sked.on('someone_hu', (data) => {
            let cnt = 0
            for (let i = 0; i < _t.onlineUsers.length; ++i)
                if (_t.onlineUsers[i].clientId == data.hu) {
                    cnt = i
                    break
                }
            _t.huPeople = { name: data.hu, id: cnt }
            _t.allShow = data.all
        })
        _t.sked.on('get_all_cards', (data) => {
            _t.allShow = data.all
        })
        _t.sked.on('must_spectator', () => {
            _t.user.spectator = true
        })
    },
    computed: {
        availablePlayers() {
            return this.onlineUsers.filter((v) => !v.spectator)
        },
        forcedUsers() {
            return this.onlineUsers.filter((v) => (v.status == 1) && (!v.spectator)).length
        },
        gamingPlayers() {
            return this.onlineUsers.filter((v) => (v.status == 2)).length
        }
    },
    methods: {
        genName() {
            let Ch1 = ["殇", "伤", "裳", "霓", "离", "璃", "婉", "晚", "绾", "挽", "辞", "歌", "泪", "霜", "柒", "流", "乡", "梦", "忆", "衣", "依", "意", "亦", "艺", "伊", "曦", "溪", "兮", "惜", "浅", "芊", "苏", "落", "洛", "执", "樱", "雪", "音", "若", "蝶", "星", "月", "光", "诗", "思", "卿", "君"]
            let Ch2 = ["ヘ", "ン", "ヮ", "ャ", "マ", "ァ", "キ", "の"]
            let p = 2
            let Name = ""
            p += Math.floor(Math.random() * 3)
            for (let i = 0; i < p; ++i)
                Name += Ch1[Math.floor(Math.random() * Ch1.length)]
            Name += Ch2[Math.floor(Math.random() * Ch2.length)]
            for (let i = 0; i < 2; ++i)
                Name += Ch1[Math.floor(Math.random() * Ch1.length)]
            return Name
        },
        randomName() {
            this.user.nickname = this.genName()
            this.updateMe()
        },
        updateMe: _.debounce(function () {
            if (this.user.nickname.length > 15)
                this.user.nickname = "鸡你太美!"
            if (typeof (localStorage) != "undefined")
                localStorage.mnick = this.user.nickname
            this.sked.emit('update_user', {
                user: this.user,
                room: this.room
            })
        }, 300),
        startTeach() {
            location.href = "/teach"
        },
        sendMessage(e) {
            e.preventDefault();
            if (this.chatMessage.length <= 0) {
                $('body')
                    .toast({
                        class: "error",
                        message: "禁止发送空消息",
                        className: {
                            toast: 'ui message'
                        }
                    })
                return
            }
            this.sked.emit('send_chat', {
                mes: this.chatMessage
            })
            this.chatMessage = ''
        },
        changeStatus() {
            this.huPeople = ""
            this.availableOp = [false, false, false, false]
            this.allShow = {}
            this.game.cards = []
            this.game.dragon = -1
            this.game.pt = [[], [], [], []]
            this.game.op = [[], [], [], []]
            this.user.status = 1 - this.user.status
            this.sked.emit('update_user', {
                user: this.user,
                room: this.room
            })
        },
        changeSpectator() {
            this.user.spectator = !this.user.spectator
            if (this.user.spectator)
                this.user.status = 0
            this.sked.emit('update_user', {
                user: this.user,
                room: this.room
            })
        },
        put_card(e) {
            let _t = this
            _t.sked.emit('put_card', {
                card: e
            })
        },
        doOp(e, p = undefined) {
            const _t = this
            if (e == 3 && typeof (p) == "undefined" && _t.eatPos.length > 0) {
                p = _t.eatPos[0]
            }
            if (e == 1 && typeof (p) == "undefined" && _t.gangCard.length > 0) {
                p = _t.gangCard[0]
            }
            _t.sked.emit('do_operation', {
                type: e,
                pos: p
            })
        },
        kickGuy(pid) {
            this.sked.emit('kick_off', this.onlineUsers[pid].clientId)
        },
        gotoRoom(rid) {
            localStorage.mtab = 1
            const trm = Number(rid)
            if (isNaN(trm) || trm < 0 || trm >= 10000) {
                $('body')
                    .toast({
                        class: "error",
                        message: "房间号必须在0~9999之间！",
                        className: {
                            toast: 'ui message'
                        }
                    })
                    ;
                this.toRoom = tmpRoom
                return
            }
            location.href = `/room/${rid}`
        },
        quitGame() {
            this.user.status = 0
            this.huPeople = ""
            this.availableOp = [false, false, false, false]
            this.allShow = {}
            this.game.cards = []
            this.game.dragon = -1
            this.game.pt = [[], [], [], []]
            this.game.op = [[], [], [], []]
            this.sked.emit('update_user', {
                user: this.user,
                room: this.room
            })
        },
        closeConnect(e) {
            let _t = this
            _t.sked.close()
        }
    },
    i18n
})