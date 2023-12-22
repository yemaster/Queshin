/**
 * Queshin - v3.0.4 Beta
 * /libs/hu.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */
const { h, p } = require("./data")

// 提前生成所有可能龙的分布，懒得dfs
const distributeLong = [[[0, 0, 0, 0]],
[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
[[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0], [0, 0, 0, 2], [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 0, 1], [0, 0, 1, 1]],
[[3, 0, 0, 0], [0, 3, 0, 0], [0, 0, 3, 0], [0, 0, 0, 3], [1, 2, 0, 0], [1, 0, 2, 0], [1, 0, 0, 2], [2, 1, 0, 0], [0, 1, 2, 0], [0, 1, 0, 2], [2, 0, 1, 0], [0, 2, 1, 0], [0, 0, 1, 2], [2, 0, 0, 1], [0, 2, 0, 1], [0, 0, 2, 1], [1, 1, 1, 0], [1, 1, 0, 1], [1, 0, 1, 1], [0, 1, 1, 1]]]

/**
 * Judge whether is hu chaos?
 * 0-8,9-17,18-26,27-30,31-33
 * @param {Number} longCount Counts of long
 * @param {Array} cardsCount Counts of each card
 */
function isChaos(longCount, cardsCount) {
    let pai = []
    for (let i = 0; i < 34; ++i)
        for (let j = 0; j < cardsCount[i]; ++j)
            pai.push(i)

    if (pai.length + longCount != 14)
        return false

    for (let i = 0; i < cardsCount.length; ++i)
        if (cardsCount[i] > 1)// 有大于1张的牌，不能胡
            return false
    for (let i = 1; i < pai.length; ++i) { // 有相邻或间隔为1的万筒条，不能胡
        if (Math.abs(pai[i] - pai[i - 1]) <= 2 &&
            Math.floor(pai[i] / 9) == Math.floor(pai[i - 1] / 9) &&
            pai[i] < 27)
            return false
    }
    return true
}


/**
 * Judge whether is hu 7 pairs?
 * 0-8,9-17,18-26,27-30,31-33
 * @param {Number} longCount Counts of long
 * @param {Array} cardsCount Counts of each card
 */
function is7Pairs(longCount, cardsCount) {
    let pairCount = 0, singleCount = 0
    for (let i = 0; i < cardsCount.length; ++i) {
        pairCount += Math.floor(cardsCount[i] / 2)
        singleCount += cardsCount[i] % 2
    }
    if (singleCount <= longCount) {
        pairCount += singleCount + Math.floor((longCount - singleCount) / 2)
    }
    else {
        pairCount += longCount
    }
    //console.log(paiArr, pairCount)
    if (pairCount >= 7)
        return true
    return false
}

/**
 * Judge whether is hu normal?
 * 0-8,9-17,18-26,27-30,31-33
 * 分部分判定，万筒条风分别判定。
 * 判定使用打表的方法，分别记录当前万筒条风中存在0/1个对子，0/1/2/3条龙是否能胡。
 * 然后枚举每条龙分别在哪，然后对子在哪，都能构成胡牌牌型就可以。
 * @param {Number} longCount Counts of long
 * @param {Array} cardsCount Counts of each card
 */
function isNormal(longCount, cardsCount) {
    let paiStr = ["", "", "", ""]
    let fengCount = [0, 0, 0, 0, 0]
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 9; ++j)
            paiStr[i] += cardsCount[i * 9 + j]
    }

    for (let i = 27; i < 34; ++i) {
        fengCount[cardsCount[i]]++
    }
    for (let i = 0; i <= 4; ++i)
        paiStr[3] += fengCount[i]
    //console.log(paiStr)
    for (let i = 0; i < 4; ++i) {
        for (let j in distributeLong[longCount]) {
            flag = true;
            try {
                for (let k = 0; k < 4; ++k) {
                    if (k <= 2 && !h[paiStr[k]][(i != k) * 4 + distributeLong[longCount][j][k]]) {
                        flag = false;
                        break;
                    }
                    if (k == 3 && !p[paiStr[k]][(i != k) * 4 + distributeLong[longCount][j][k]]) {
                        flag = false;
                        break;
                    }
                }
            }
            catch (e) {
                flag = false
            }
            if (flag)
                return true;
        }
    }
    return false;
}

/**
 * 
 */
function is13Yao(longCount, cardsCount) {
    let cnt = cardsCount[0] + cardsCount[8]
        + cardsCount[9] + cardsCount[17]
        + cardsCount[18] + cardsCount[26]
        + cardsCount[27] + cardsCount[28]
        + cardsCount[29] + cardsCount[30]
        + cardsCount[31] + cardsCount[32]
        + cardsCount[33] + longCount
    return (cnt == 14)
}

/**
 * Judge whether is hu?
 * 0-8,9-17,18-26,27-30,31-33
 * @param {Array} paiArr Array of pai
 * @param {Number} long The number of dragon
 * @param {Number} huMod 1:normal, 2:chaos, 4: 7pairs, 8:Thirteen sons, 16: 4 Dragons
 */
function isAgari(paiArr, long, huMod = 23) {
    let longCount = 0

    let cardsCount = []
    for (let i = 0; i < 34; ++i)
        cardsCount.push(0)
    for (let i = 0; i < paiArr.length; ++i)
        if (paiArr[i] == long)
            longCount += 1  //Count the dragon num
        else
            cardsCount[paiArr[i]] += 1

    if ((huMod & 16) && (longCount == 4)) {   // 4 Dragons
        //console.log("4 Dragons")
        return true
    }

    // Chaos
    if ((huMod & 2) && isChaos(longCount, cardsCount)) {
        return true
    }

    // 7 Pairs
    if ((huMod & 4) && is7Pairs(longCount, cardsCount)) {
        return true
    }

    // 13 Yao
    if ((huMod & 8) && is13Yao(longCount, cardsCount)) {
        return true
    }

    // Normal
    if ((huMod & 1) && isNormal(longCount, cardsCount)) {
        return true
    }
    return false
}

module.exports = { isAgari }