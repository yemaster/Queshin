import json
allPaiSets = []
nowPaiSet = [0 for i in range(9)]

def factorial(n: int) -> int:
    d = 1
    for i in range(1, n + 1):
        d *= i
    return d

def binomial(n: int, m: int) -> int:
    return factorial(n) // factorial(m) // factorial(n - m)

def permutation(n: int, m: int) -> int:
    d = 1
    for i in range(n, n - m, -1):
        d *= i
    return d

def genAllSets(u: int, num: int) -> None:
    global allPaiSets, nowPaiSet
    if u >= 9:
        allPaiSets.append(nowPaiSet.copy())
        return
    for i in range(5):
        if num + i >= 14:
            break
        nowPaiSet[u] = i
        genAllSets(u + 1, num + i)

allHuSets1 = [] # No Pairs
allHuSets2 = [] # 1 Pair

def judgeSet(pair: bool) -> bool:
    global nowPaiSet
    if sum(nowPaiSet) == 0:
        return not pair
    pos = 0
    for i in range(len(nowPaiSet)):
        if nowPaiSet[i] > 0:
            pos = i
            break
    flag = False
    if nowPaiSet[pos] >= 2 and pair:
        nowPaiSet[pos] -= 2
        flag = flag or judgeSet(False)
        nowPaiSet[pos] += 2
    if nowPaiSet[pos] >= 3:
        nowPaiSet[pos] -= 3
        flag = flag or judgeSet(pair)
        nowPaiSet[pos] += 3
    if pos <= 6 and nowPaiSet[pos] >= 1 and nowPaiSet[pos + 1] >= 1 and nowPaiSet[pos + 2] >= 1:
        nowPaiSet[pos] -= 1
        nowPaiSet[pos + 1] -= 1
        nowPaiSet[pos + 2] -= 1
        flag = flag or judgeSet(pair)
        nowPaiSet[pos] += 1
        nowPaiSet[pos + 1] += 1
        nowPaiSet[pos + 2] += 1
    return flag

def getAllHuSets() -> None:
    global nowPaiSet
    for s in allPaiSets:
        nowPaiSet = s.copy()
        if judgeSet(False):
            allHuSets1.append(s.copy())
        nowPaiSet = s.copy()
        if judgeSet(True):
            allHuSets2.append(s.copy())

setProb = {}

def getAllHuProb() -> None:
    cnt = 0
    for i in allPaiSets:
        prob = 0
        for j in allHuSets1:
            if sum(i) > sum(j):
                continue
            paiNeed = [0 for i in range(9)]
            for k in range(9):
                paiNeed[k] = max(0, j[k] - i[k])
            needCnt = sum(paiNeed)
            thisProb = 1 / permutation(136, needCnt)
            for k in paiNeed:
                if k == 0:
                    continue
                thisProb *= binomial(needCnt, k) * permutation(4, k)
                needCnt -= k
            prob = max(prob, thisProb)
        paiStr = "".join([str(l) for l in i])

        prob2 = 0
        for j in allHuSets2:
            if sum(i) > sum(j):
                continue
            paiNeed = [0 for i in range(9)]
            for k in range(9):
                paiNeed[k] = max(0, j[k] - i[k])
            needCnt = sum(paiNeed)
            thisProb = 1 / permutation(136, needCnt)
            for k in paiNeed:
                if k == 0:
                    continue
                thisProb *= binomial(needCnt, k) * permutation(4, k)
                needCnt -= k
            prob2 = max(prob2, thisProb)
        setProb[paiStr] = [prob, prob2]

        cnt += 1
        if cnt % 100 == 0:
            print(f"Finish {cnt * 100 / len(allPaiSets)}%")

if __name__ == "__main__":
    genAllSets(0, 0)
    #print(len(allPaiSets))
    getAllHuSets()
    #print(len(allHuSets1))
    #print(allHuSets1)
    #print(len(allHuSets2))
    #print(allHuSets2)
    getAllHuProb()
    with open("AITable.json", "w") as f:
        json.dump(setProb, f)
