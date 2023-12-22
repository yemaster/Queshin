const child_process = require("child_process")

try {
    let res = child_process.execSync("normal", {
        cwd: __dirname,
        input: `3 3 3 3 3 3 3 3 3 4 4 4 4 1 3 3 4 4 4 4 4 4 4 4 4 4 4 4 3 4 4 4 4 4
13
3
0 1 2 3 4 5 6 7 8 13 13 13 28
0 1 2 3 4 5 6 7 8 13 13 13 14
0 1 2 3 4 5 6 7 8 13 13 13 15`,
        timeout: 10
    })
    res = res.toString().split("\n")

    let data = []
    for (let i = 0; i < res.length; ++i)
        if (res[i].length > 0)
            data.push(Number(res[i]))

    console.log(data)

} catch (e) {
    console.log("LOOOO")
}