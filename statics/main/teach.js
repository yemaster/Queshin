/**
 * Mahjong - v2.1.1
 * /statics/main/teach.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */

const mahjongTeach = new Vue({
    el: "#app",
    data: {
        huPeople: "",
        game: {
            cards: [],
            dragon: -1,
            pt: [[], [], [], []],
            op: [[], [], [], []],
            me: -1,
        },
        nowSid: "",
        sked: {
            id: "233333",
        },
        canOp: false,
        availableOp: [false, false, false, false],

        isShowModal: true,
        nowStep: 0,
        teachContent: "欢迎来到中科雀(Queshin)，中科雀采用浙江余慈地区特有的麻将玩法，与其他麻将规则可能有些出入。但这不要紧，本教程将手把手教你学会该麻将。",
        stepDivider: [0, 1, 6, 11, 13],
        maxSteps: 20,
    },
    methods: {
        sendCard() {

        },
        getStep(t = 0) {
            if (this.nowStep == 13) {
                this.isShowModal = false
            }
            else if (this.stepDivider.indexOf(this.nowStep + 1) != -1) {
                this.isShowModal = false
                setTimeout(() => {
                    this.isShowModal = true
                }, 1500)
            }
            else {
                this.isShowModal = true
            }
            if (t == 0)
                this.nowStep++
            switch (this.nowStep) {
                case 0:
                    this.teachContent = "欢迎来到中科雀(Queshin)，中科雀采用浙江余慈地区特有的麻将玩法，与其他麻将规则可能有些出入。但这不要紧，本教程将手把手教你学会该麻将。"
                case 1:
                    this.teachContent = "首先，界面被分成了五个部分，分别为“龙”，“你的牌”，“操作”，“出牌情况”，“吃碰情况”。这一阶段只是大体介绍，每个部分的功能将在以后讲解"
                    break
                case 2:
                    this.teachContent = "“你的牌”部分将会显示你拥有的手牌"
                    break
                case 3:
                    this.teachContent = "“操作”部分将会显示你可以进行的操作：取消、胡、碰、杠、吃"
                    break
                case 4:
                    this.teachContent = "“出牌情况”部分将会显示每个玩家的打出的牌"
                    break
                case 5:
                    this.teachContent = "“吃碰情况”部分将会显示每个玩家吃碰杠用的牌"
                    break
                case 6:
                    this.teachContent = "牌共有34种，每种4张，共136张。牌分为“万”，“筒”，“条”，“风”四类。万筒条各9种，风有东南西北中发白共7种"
                    break
                case 7:
                    this.teachContent = "以下是一到九万的牌面：<br><img width='30px' src='/statics/imgs/0.svg'></img><img width='30px' src='/statics/imgs/1.svg'></img><img width='30px' src='/statics/imgs/2.svg'></img><img width='30px' src='/statics/imgs/3.svg'></img><img width='30px' src='/statics/imgs/4.svg'></img><img width='30px' src='/statics/imgs/5.svg'></img><img width='30px' src='/statics/imgs/6.svg'></img><img width='30px' src='/statics/imgs/7.svg'></img><img width='30px' src='/statics/imgs/8.svg'></img>"
                    break
                case 8:
                    this.teachContent = "以下是一到九筒的牌面：<br><img width='30px' src='/statics/imgs/9.svg'></img><img width='30px' src='/statics/imgs/10.svg'></img><img width='30px' src='/statics/imgs/11.svg'></img><img width='30px' src='/statics/imgs/12.svg'></img><img width='30px' src='/statics/imgs/13.svg'></img><img width='30px' src='/statics/imgs/14.svg'></img><img width='30px' src='/statics/imgs/15.svg'></img><img width='30px' src='/statics/imgs/16.svg'></img><img width='30px' src='/statics/imgs/17.svg'></img>"
                    break
                case 9:
                    this.teachContent = "以下是一到九条的牌面：<br><img width='30px' src='/statics/imgs/18.svg'></img><img width='30px' src='/statics/imgs/19.svg'></img><img width='30px' src='/statics/imgs/20.svg'></img><img width='30px' src='/statics/imgs/21.svg'></img><img width='30px' src='/statics/imgs/22.svg'></img><img width='30px' src='/statics/imgs/23.svg'></img><img width='30px' src='/statics/imgs/24.svg'></img><img width='30px' src='/statics/imgs/25.svg'></img><img width='30px' src='/statics/imgs/26.svg'></img>"
                    break
                case 10:
                    this.teachContent = "以下分别是东南西北中发白的牌面：<br><img width='30px' src='/statics/imgs/27.svg'></img><img width='30px' src='/statics/imgs/28.svg'></img><img width='30px' src='/statics/imgs/29.svg'></img><img width='30px' src='/statics/imgs/30.svg'></img><img width='30px' src='/statics/imgs/31.svg'></img><img width='30px' src='/statics/imgs/32.svg'></img><img width='30px' src='/statics/imgs/33.svg'></img>"
                    break
                case 11:
                    this.teachContent = "一局游戏理论上是四个玩家参与，分别记为PLY1-4。按照1-4轮回的顺序依次操作。<br>其中PLY1为庄家。"
                    break
                case 12:
                    this.teachContent = "游戏开局后，从庄家开始，每个玩家摸13只牌，庄家额外摸1只即庄家有14只牌，并且决定龙。与龙牌面相同的牌可以代替任何牌。"
                    break
                case 13:
                    this.game.cards = []
                    setTimeout(() => {
                        this.game.cards.push({ type: 0, num: 1 })
                        this.game.cards.push({ type: 0, num: 2 })
                        this.game.cards.push({ type: 0, num: 10 })
                        this.game.cards.push({ type: 0, num: 28 })
                    }, 500)
                    setTimeout(() => {
                        this.game.cards.push({ type: 0, num: 2 })
                        this.game.cards.push({ type: 0, num: 16 })
                        this.game.cards.push({ type: 0, num: 11 })
                        this.game.cards.push({ type: 0, num: 9 })
                    }, 1000)
                    setTimeout(() => {
                        this.game.cards.push({ type: 0, num: 27 })
                        this.game.cards.push({ type: 0, num: 27 })
                        this.game.cards.push({ type: 0, num: 14 })
                        this.game.cards.push({ type: 0, num: 2 })
                    }, 1500)
                    setTimeout(() => {
                        this.game.cards.push({ type: 0, num: 1 })
                        this.game.cards.push({ type: 0, num: 15 })
                    }, 2000)
                    setTimeout(() => {
                        this.game.cards = this.game.cards.sort((a, b) => a.num - b.num)
                        this.game.dragon = 13
                    }, 2500)
                    setTimeout(() => { this.getStep(0) }, 2000)
                case 14:
                    this.teachContent = "系统会把自动发放手牌，现在你是庄家，你拿到了14张牌，并且现在是你的回合。<br>除了第一个回合，之后每个回合每个玩家可以摸一张牌后再打出一张牌，然后来到下一个玩家的回合。<br>每个玩家都可以对别的玩家打出的牌进行吃、碰、杠、胡操作，并且操作后立刻变为该玩家的回合"
                    break
            }
        },
        skipStep() {
            this.isShowModal = false
            for (let i = 0; i < this.stepDivider.length; ++i) {
                if (this.stepDivider[i] > this.nowStep) {
                    this.nowStep = this.stepDivider[i] - 1
                    break
                }
            }
            setTimeout(() => {
                this.isShowModal = true
                this.getStep()
            }, 1500)
        }
    },
    i18n
})