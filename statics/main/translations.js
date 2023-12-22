/**
 * Queshin - v3.0.4 Beta
 * /statics/main/translations.js
 * 
 * CopyRight 2023 (c) yemaster
 * PB23151830 
 */
const messages = {
    en: {
        nav: {
            logo: 'Queshin USTC',
            home: 'Homepage',
            hall: 'Game hall',
            settings: 'Settings',
            room: 'Room',
            help: 'Help',
            me: 'Self Info',
            language: 'Language',
            about: 'About',
        },
        user: {
            nickname: "Nickname",
            status: 'Status',
            free: 'Free',
            waiting: 'Waiting',
            ingame: 'Gaming',
            admin: 'Admin'
        },
        game: {
            dragon: 'Dragon',
            unknown: 'Unknown',
            yourCards: 'Your Cards',
            yourRound: 'Your Round',
            discardedCards: 'Discarded Cards',
            howToEat: 'How to eat',
            me: 'Me',
            options: 'Options',
            yes: 'Yes',
            cancel: 'Cancel',
            eat: 'Eat',
            pen: 'Bump',
            gang: 'Lever',
            hu: 'Agari',
        },
        mes: {
            onlineUsers: 'Online Users',
            gettingConnected: 'Contacting the server...',
            randomOne: 'Random',
            update: 'Update',
            chat: 'Chat',
            link: 'Link',
            copy: 'Copy',
            forceStart: 'Start Game',
        },
        help: {
            feedback: "Feedback",
            devwiki: "Dev Wiki"
        },
        content: {
            about: "Include: System-End Program, Client-End Program, Client-End Bot Program.<br>Developed by yemaster(PB23151830).<br>Used for assignment D of 2023 Advanced Programming class of USTC.<br>"
        }
    },
    cn: {
        nav: {
            logo: '中科雀',
            home: '首页',
            hall: '游戏大厅',
            settings: '设置',
            room: '房间',
            me: '个人',
            help: '帮助',
            language: '语言',
            about: '关于',
        },
        user: {
            nickname: "昵称",
            status: '状态',
            free: '空闲',
            waiting: '等待开始',
            ingame: '游戏中',
            admin: '管理员',
        },
        game: {
            dragon: '龙',
            unknown: '不知道',
            yourCards: '你的牌',
            yourRound: '你的回合',
            discardedCards: '出牌情况',
            howToEat: '怎么吃',
            me: '我',
            options: '操作',
            yes: '确定',
            cancel: '取消',
            eat: '吃',
            pen: '碰',
            gang: '杠',
            hu: '胡',
        },
        mes: {
            onlineUsers: '在线用户',
            gettingConnected: '正在与服务器取得联系...',
            randomOne: '随机一个',
            update: '更新',
            chat: '聊天',
            link: '链接',
            copy: '复制',
            forceStart: '开始游戏',
        },
        help: {
            feedback: "问题反馈",
            devwiki: "开发者文档"
        },
        content: {
            about: "包括:系统端程序，客户端程序，客户端Bot程序。<br>由yemaster(PB23151830)开发。<br>用于中国科技大学2023届程序设计进阶班课作业D"
        }
    },
    jp: {
        nav: {
            logo: 'Queshin USTC',
            home: 'トップページ',
            hall: 'ゲームホールです',
            settings: '設置',
            room: '部屋',
            help: '助けて',
            me: '私が',
            language: '言語',
            about: 'についてです',
        },
        user: {
            nickname: "ニックネーム",
            status: '状态',
            free: '暇',
            waiting: '始まりを待つ',
            ingame: 'ゲームの中',
            admin: '管理人です'
        },
        game: {
            dragon: '竜',
            unknown: '知らない',
            yourCards: 'あなたのカード',
            yourRound: 'あなたのラウンド',
            discardedCards: '出されたカード',
            me: '私が',
            options: '操作',
            yes: '確定です',
            cancel: 'キャンセル',
            howToEat: 'どうやって食べますか',
            eat: '食べ',
            pen: '触れ',
            gang: 'ぶつかる',
            hu: '胡',
        },
        mes: {
            onlineUsers: 'オンラインユーザー',
            gettingConnected: 'サーバーと連絡を取っている...',
            randomOne: 'ランダムに',
            update: '更新',
            chat: 'チャット',
            link: 'リンク',
            copy: 'コピー',
            forceStart: 'ゲームを始めます',
        },
        help: {
            feedback: "フィードバックです",
            devwiki: "開発者ドキュメントです"
        },
        content: {
            about: "システム側のプログラム、クライアントプログラム、クライアントボットのプログラムを含みます。<br>yemaster(PB23151830)が開発しました。<br>中国科学技術大学の2023年度のプログラム設計のクラスの宿題Dにのみ使用します。"
        }
    }
}

const i18n = new VueI18n({
    locale: 'cn',
    fallbackLocale: 'cn',
    messages,
})