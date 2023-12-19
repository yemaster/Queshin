allPaiSets = []
nowPaiSet = [0 for i in range(9)]

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

if __name__ == "__main__":
    genAllSets(0, 0)
    getAllHuSets()
    with open("sets1.txt", "w") as f:
        for i in allHuSets1:
            f.write("".join([str(l) for l in i])+"\n")
    with open("sets2.txt", "w") as f:
        for i in allHuSets2:
            f.write("".join([str(l) for l in i])+"\n")
