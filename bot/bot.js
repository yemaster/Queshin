const { mahjongBot } = require("../libs/bot-SDK")
const child_process = require("child_process")

let huMod = 0   // 0:Natural, 1:7 Pairs, 2:Chaos
let firstPut = true
let dragon = 0

let cardLast = []
for (let i = 0; i < 34; ++i)
    cardLast.push(4)

let lastCard = -1

const demoBot = mahjongBot({
    server: "http://47.115.222.205/",
    //server: "http://localhost:3000",
    nickname: "真ikun不是小黑子",
    roomId: 1560,
    onLaunch: undefined,         // Triggered when bot launches
    onConnect: undefined,        // Triggered when bot connects to the server
    onDisconnect: undefined,     // Triggered when bot disconnects to the server
    onGameStart: undefined,      // Triggered when game starts
    onQuitGame: undefined,       // Triggered when bot quits the game 
    onPlayersUpdate: undefined,  // Triggered when online players are updated
    onNewOperation: (mj, av, op, card) => {
        if (av) {
            console.log(op)
            if (op[0]) {// 能胡直接胡
                mj.socket.emit("do_operation", {
                    type: 1
                })
                return true
            }
            else {
                let cardCount = {}
                let plainCard = []
                for (let i = 0; i < card.length; ++i)
                    if (card[i].type == 0)
                        plainCard.push(card[i].num)
                for (let i = 0; i < 34; ++i)
                    cardCount[i] = 0
                for (let i = 0; i < card.length; ++i)
                    if (card[i].type == 0)
                        cardCount[card[i].num]++
                let testData = ""
                switch (huMod) {
                    case 0:
                        let originProb = 0, opType = 0, pos = 0
                        originProb = 0
                        testData = cardLast.join(" ")
                        testData += "\n" + String(plainCard.length) + "\n1\n" + plainCard.join(" ")
                        try {
                            let res = child_process.execSync("normal", {
                                cwd: __dirname,
                                input: testData,
                                timeout: 15000
                            })
                            res = res.toString().split("\n")

                            let data = []
                            for (let i = 0; i < res.length; ++i)
                                if (res[i].length > 0)
                                    data.push(Number(res[i]))
                            originProb = data[0]
                        }
                        catch (e) {
                            originProb = 0
                        }

                        if (op[1]) {
                            if (mj.nowSid == mj.socket.id) {
                                for (let cc = 0; cc < 34; ++cc) {
                                    if (cardCount[cc] < 4)
                                        continue
                                    let afterCards = []
                                    let cardNeed = 4
                                    for (let i = 0; i < plainCard.length; ++i) {
                                        if (cardNeed && plainCard[i] == cc)
                                            cardNeed--
                                        else
                                            afterCards.push(plainCard[i])
                                    }
                                    testData = cardLast.join(" ")
                                    testData += "\n" + String(afterCards.length - 1) + "\n" + String(afterCards.length) + "\n"
                                    for (let i = 0; i < afterCards.length; ++i) {
                                        testData += afterCards.slice(0, i).concat(afterCards.slice(i + 1)).join(" ") + "\n"
                                    }
                                    let mx = -1
                                    let afterProb = 0
                                    try {
                                        let res = child_process.execSync("normal", {
                                            cwd: __dirname,
                                            input: testData,
                                            timeout: 15000
                                        })
                                        res = res.toString().split("\n")

                                        let data = []
                                        for (let i = 0; i < res.length; ++i)
                                            if (res[i].length > 0)
                                                data.push(Number(res[i]))
                                        mx = 0
                                        for (let i = 1; i < data.length; ++i)
                                            if (data[i] >= data[mx])
                                                mx = i
                                        afterProb = data[mx]
                                    }
                                    catch (e) {
                                        mx = -1
                                    }
                                    if (afterProb > originProb) {
                                        originProb = afterProb
                                        opType = 2
                                        pos = cc
                                    }
                                }
                            }
                            else {
                                let afterCards = []
                                let cardNeed = 3
                                for (let i = 0; i < plainCard.length; ++i) {
                                    if (cardNeed && plainCard[i] == lastCard)
                                        cardNeed--
                                    else
                                        afterCards.push(plainCard[i])
                                }
                                testData = cardLast.join(" ")
                                testData += "\n" + String(afterCards.length - 1) + "\n" + String(afterCards.length) + "\n"
                                for (let i = 0; i < afterCards.length; ++i) {
                                    testData += afterCards.slice(0, i).concat(afterCards.slice(i + 1)).join(" ") + "\n"
                                }
                                let mx = -1
                                let afterProb = 0
                                try {
                                    let res = child_process.execSync("normal", {
                                        cwd: __dirname,
                                        input: testData,
                                        timeout: 15000
                                    })
                                    res = res.toString().split("\n")

                                    let data = []
                                    for (let i = 0; i < res.length; ++i)
                                        if (res[i].length > 0)
                                            data.push(Number(res[i]))
                                    mx = 0
                                    for (let i = 1; i < data.length; ++i)
                                        if (data[i] >= data[mx])
                                            mx = i
                                    afterProb = data[mx]
                                }
                                catch (e) {
                                    mx = -1
                                }
                                if (afterProb > originProb) {
                                    originProb = afterProb
                                    opType = 2
                                }
                            }
                        }
                        if (op[2]) {
                            let afterCards = []
                            let cardNeed = 2
                            for (let i = 0; i < plainCard.length; ++i) {
                                if (cardNeed && plainCard[i] == lastCard)
                                    cardNeed--
                                else
                                    afterCards.push(plainCard[i])
                            }
                            testData = cardLast.join(" ")
                            testData += "\n" + String(afterCards.length - 1) + "\n" + String(afterCards.length) + "\n"
                            for (let i = 0; i < afterCards.length; ++i) {
                                testData += afterCards.slice(0, i).concat(afterCards.slice(i + 1)).join(" ") + "\n"
                            }
                            let mx = -1
                            let afterProb = 0
                            try {
                                let res = child_process.execSync("normal", {
                                    cwd: __dirname,
                                    input: testData,
                                    timeout: 15000
                                })
                                res = res.toString().split("\n")

                                let data = []
                                for (let i = 0; i < res.length; ++i)
                                    if (res[i].length > 0)
                                        data.push(Number(res[i]))
                                mx = 0
                                for (let i = 1; i < data.length; ++i)
                                    if (data[i] >= data[mx])
                                        mx = i
                                afterProb = data[mx]
                            }
                            catch (e) {
                                mx = -1
                            }
                            if (afterProb > originProb) {
                                originProb = afterProb
                                opType = 3
                            }
                        }
                        if (op[3]) {
                            for (let ind = -2; ind <= 0; ++ind) {
                                let flag = false
                                let needDelete = []
                                for (let ind2 = 0; ind2 < 3; ++ind2) {
                                    if (ind + ind2 == 0)
                                        continue;
                                    needDelete.push(lastCard + ind + ind2)
                                    if (cardCount[lastCard + ind + ind2] < 1) {
                                        flag = true
                                        break
                                    }
                                }
                                if (!flag) {
                                    let afterCards = []

                                    for (let i = 0; i < plainCard.length; ++i) {
                                        if (needDelete.indexOf(plainCard[i]))
                                            needDelete = needDelete.filter(v => v != plainCard[i])
                                        else
                                            afterCards.push(plainCard[i])
                                    }
                                    testData = cardLast.join(" ")
                                    testData += "\n" + String(afterCards.length - 1) + "\n" + String(afterCards.length) + "\n"
                                    for (let i = 0; i < afterCards.length; ++i) {
                                        testData += afterCards.slice(0, i).concat(afterCards.slice(i + 1)).join(" ") + "\n"
                                    }
                                    let mx = -1
                                    let afterProb = 0
                                    try {
                                        let res = child_process.execSync("normal", {
                                            cwd: __dirname,
                                            input: testData,
                                            timeout: 15000
                                        })
                                        res = res.toString().split("\n")

                                        let data = []
                                        for (let i = 0; i < res.length; ++i)
                                            if (res[i].length > 0)
                                                data.push(Number(res[i]))
                                        mx = 0
                                        for (let i = 1; i < data.length; ++i)
                                            if (data[i] >= data[mx])
                                                mx = i
                                        afterProb = data[mx]
                                    }
                                    catch (e) {
                                        mx = -1
                                    }
                                    if (afterProb > originProb) {
                                        originProb = afterProb
                                        opType = 4
                                        pos = ind
                                    }
                                }
                            }
                        }
                        if (opType != 0) {
                            console.log(`[Info] Use operation ${["None", "Hu", "Gang", "Peng", "Chi"][opType]}`)
                        }
                        mj.socket.emit("do_operation", {
                            type: opType,
                            pos
                        })
                        return opType != 0
                    case 1:
                        if (op[1]) {
                            let pos = -1
                            for (let i = 0; i < 34; ++i)
                                if (cardCount[i] == 4)
                                    pos = i
                            mj.socket.emit("do_operation", {
                                type: 2,
                                pos
                            })
                            return true
                        }
                        else {
                            mj.socket.emit("do_operation", {
                                type: 0
                            })
                            return false
                        }
                    case 2:
                        mj.socket.emit("do_operation", {
                            type: 0
                        })
                        return false
                }
            }
        }
    },   // Triggered when bot can do operations
    onFinishGame: (mj, isMe) => {
        firstPut = true
        cardLast = []
        for (let i = 0; i < 34; ++i)
            cardLast.push(4)
        huMod = 0
        dragon = 0
        console.log(`[Info] Game finish, Bot ${isMe ? "Win" : "Lost"}`)
        if (isMe) {
            // 是自己糊了
            chat(mj, `看见ikun的厉害了吧，你们也太菜了`)
        }
        else {
            // 别人糊了
            chat(mj, `哟，小黑子还有两把刷子的啊，下局一定赢你`)
        }
    },     // Triggered when game finishes
    putCard: (mj, card) => {
        let cardCount = {}
        let plainCard = []
        for (let i = 0; i < card.length; ++i)
            if (card[i].type == 0)
                plainCard.push(card[i].num)
        let cardLen = plainCard.length

        for (let i = 0; i < 34; ++i)
            cardCount[i] = 0
        for (let i = 0; i < card.length; ++i)
            if (card[i].type == 0)
                cardCount[card[i].num]++
        let longCount = cardCount[dragon]

        if (firstPut) {
            for (let i = 0; i < card.length; ++i)
                cardLast[card[i].num]--;
            let pairCount = 0, singleCount = 0
            for (let i = 0; i < 34; ++i) {
                pairCount += Math.floor(cardCount[i] / 2)
                singleCount += cardCount[i] % 2
            }
            for (let i = 0; i < 34; ++i)
                if (pairCount >= 4) {
                    huMod = 1
                    break
                }
            if (huMod != 1) {
                let chaosNeedPut = 0
                let last = -100
                for (let i = 0; i < 34; ++i) {
                    if (i == dragon)
                        continue
                    if (cardCount[i] > 1)
                        chaosNeedPut += cardCount[i] - 1
                    if (cardCount[i])
                        if (i <= 26 && Math.floor(i / 9) == Math.floor(last / 9) && i - last <= 2)
                            chaosNeedPut++
                        else
                            last = i
                }
                if (chaosNeedPut <= 3)
                    huMod = 2
            }
            firstPut = false
            console.log(`[Info] Set Hu Mode: ${["Normal", "7 Pairs", "Chaos"][huMod]}`)
        }
        else {
            cardLast[card[card.length - 1].num]--;
        }

        let needPut = 0
        switch (huMod) {
            case 0:
                testData = cardLast.join(" ")
                testData += "\n" + String(cardLen - 1) + "\n" + String(cardLen) + "\n"
                for (let i = 0; i < cardLen; ++i) {
                    testData += plainCard.slice(0, i).concat(plainCard.slice(i + 1)).join(" ") + "\n"
                }
                try {
                    let res = child_process.execSync("normal", {
                        cwd: __dirname,
                        input: testData,
                        timeout: 15000
                    })
                    res = res.toString().split("\n")

                    let data = []
                    for (let i = 0; i < res.length; ++i)
                        if (res[i].length > 0)
                            data.push(Number(res[i]))
                    let mx = 0
                    for (let i = 1; i < data.length; ++i)
                        if ((data[i] >= data[mx] && plainCard[i] != dragon) || plainCard[mx] == dragon)
                            mx = i;
                    needPut = plainCard[mx]
                }
                catch (e) {
                    needPut = card.filter(v => v.type == 0).sort(() => Math.random() - 0.5)[0].num
                }
                break
            case 1:
                needPut = 0
                for (let i = 1; i < 34; ++i) {
                    if (i == dragon)
                        continue;
                    if (cardCount[i] % 2 == 1 && (cardLast[needPut] >= cardLast[i] || needPut == dragon)) {
                        needPut = i
                    }
                }
                break
            case 2:
                let last = -100
                for (let i = 0; i < 34; ++i) {
                    if (i == dragon)
                        continue
                    if (cardCount[i] > 1) {
                        needPut = i
                        break
                    }
                    if (cardCount[i])
                        if (i <= 26 && Math.floor(i / 9) == Math.floor(last / 9) && i - last <= 2) {
                            needPut = i
                            break
                        }
                        else
                            last = i
                }
                break
        }
        console.log(`[Info] Try to put ${needPut} from ${plainCard}`)
        return needPut
    },          // Return the card should be put
    onGetDragon: (mj, dr) => {
        dragon = dr
        console.log(`[Info] Dragon is ${dragon}`)
    },
    onNewCard: (mj, ply, card) => {
        if (ply != mj.socket.id)
            cardLast[card]--;
        lastCard = card
    }
})