const { mahjongBot } = require("./libs/bot-SDK")

const demoBot = mahjongBot({
    server: "http://localhost:3000",
    nickname: "真ikun不是小黑子",
    roomId: 2333,
    onLaunch: undefined,         // Triggered when bot launches
    onConnect: undefined,        // Triggered when bot connects to the server
    onDisconnect: undefined,     // Triggered when bot disconnects to the server
    onGameStart: undefined,      // Triggered when game starts
    onQuitGame: undefined,       // Triggered when bot quits the game 
    onPlayersUpdate: undefined,  // Triggered when online players are updated
    onNewOperation: undefined,   // Triggered when bot can do operations
    onFinishGame: undefined,     // Triggered when game finishes
    putCard: undefined,          // Return the card should be put
    onGetDragon: undefined,      // Triggered when get dragon
    onNewCard: undefined,        // Triggered when someone put new card
})