// ============================================================
// omikuji-phantom.js
// 🐱🐸 「幻の参拝客出現」演出
// 画面上をランダムなタイミングで猫の参拝客／黄金のカエルが横切り、
// クリックすると所持金が大幅アップする隠しボーナス。
// ============================================================

// 出現する幻の参拝客の種類
const PHANTOM_TYPES = {
    cat: {
        key: "cat", emoji: "🐱", name: "幻の猫の参拝客",
        durationSec: 7, rewardMin: 5000, rewardMax: 15000,
        catchTitle: "🐱✨【幻の猫の参拝客】✨🐱",
        catchMsg: "招き猫のようにするりと現れた参拝猫を捕まえました！"
    },
    frog: {
        key: "frog", emoji: "🐸", name: "黄金のカエル",
        durationSec: 5, rewardMin: 20000, rewardMax: 50000,
        catchTitle: "🐸💰【黄金のカエル】💰🐸",
        catchMsg: "黄金に輝く幻のカエルを捕まえました！これは大金運の証です！"
    }
};

// 🎐 季節イベント開催中は、幻の参拝客の見た目・演出だけを差し替える（報酬額の設定は変えない）
const SEASONAL_PHANTOM_SKINS = {
    halloween: {
        cat: { emoji: "🐱‍👻", name: "お化け猫の参拝客", catchTitle: "👻🐱【お化け猫、参上！】🐱👻", catchMsg: "妖怪祭りの夜、お化け猫がひょっこり現れました！" },
        frog: { emoji: "👹", name: "妖怪カエル（天狗面）", catchTitle: "👹✨【妖怪カエル】✨👹", catchMsg: "天狗の面をかぶった妖怪カエルを捕まえました！これは大金運の証です！" }
    },
    christmas: {
        cat: { emoji: "🎅", name: "サンタ猫の参拝客", catchTitle: "🎅🐱【サンタ猫、参上！】🐱🎅", catchMsg: "クリスマスの夜、サンタの衣装をまとった猫がひょっこり現れました！" },
        frog: { emoji: "🎄", name: "クリスマスツリーガエル", catchTitle: "🎄💰【クリスマスツリーガエル】💰🎄", catchMsg: "ツリーの飾りをまとった黄金のカエルを捕まえました！メリークリスマス！" }
    },
    oshogatsu: {
        cat: { emoji: "🎍", name: "福猫の参拝客", catchTitle: "🎍🐱【福猫、参上！】🐱🎍", catchMsg: "お正月らしい福々しい猫がひょっこり現れました！" },
        frog: { emoji: "🗻", name: "初夢ガエル", catchTitle: "🗻💰【初夢ガエル】💰🗻", catchMsg: "富士山模様の黄金のカエルを捕まえました！これは縁起がいい！" }
    },
    hanami: {
        cat: { emoji: "🌸", name: "花見猫の参拝客", catchTitle: "🌸🐱【花見猫、参上！】🐱🌸", catchMsg: "桜吹雪の中、花見猫がひょっこり現れました！" }
    },
    natsumatsuri: {
        cat: { emoji: "🎆", name: "夏祭り猫の参拝客", catchTitle: "🎆🐱【夏祭り猫、参上！】🐱🎆", catchMsg: "浴衣を着た夏祭り猫がひょっこり現れました！" }
    }
};

// 🎐 現在アクティブな季節イベントの中から、幻の参拝客のスキンが用意されているものを1つ探す（複数該当する場合は最初に見つかったもの）
function getActiveSeasonalPhantomSkin(type) {
    const keys = Object.keys(SEASONAL_PHANTOM_SKINS);
    for (const key of keys) {
        if (isSeasonalEventActive(key) && SEASONAL_PHANTOM_SKINS[key][type]) {
            return SEASONAL_PHANTOM_SKINS[key][type];
        }
    }
    return null;
}

// 猫の出現確率（残りは黄金のカエル。カエルの方がレア＆高額）
const PHANTOM_CAT_RATE = 0.75;

// 次の出現までの待ち時間の範囲（ミリ秒）
const PHANTOM_MIN_DELAY_MS = 60 * 1000;   // 最短1分後
const PHANTOM_MAX_DELAY_MS = 180 * 1000;  // 最長3分後

let phantomSpawnTimer = null;

// 次の幻の参拝客の出現をランダムな時間後にスケジュールする
function schedulePhantomSpawn() {
    if (phantomSpawnTimer) clearTimeout(phantomSpawnTimer);

    const delay = PHANTOM_MIN_DELAY_MS + Math.random() * (PHANTOM_MAX_DELAY_MS - PHANTOM_MIN_DELAY_MS);
    phantomSpawnTimer = setTimeout(() => {
        const type = Math.random() < PHANTOM_CAT_RATE ? "cat" : "frog";
        spawnPhantomVisitor(type);
    }, delay);
}

// 幻の参拝客を画面上に出現させ、横切るアニメーションを行う
function spawnPhantomVisitor(type) {
    const base = PHANTOM_TYPES[type];
    if (!base) return;
    const skin = (typeof getActiveSeasonalPhantomSkin === "function") ? getActiveSeasonalPhantomSkin(type) : null;
    const config = skin ? Object.assign({}, base, skin) : base;

    const el = document.createElement("div");
    el.className = "phantom-visitor phantom-visitor-" + type;
    el.textContent = config.emoji;
    el.title = config.name;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", config.name);

    const topPct = Math.random() * 55 + 10; // 画面の縦10%〜65%あたりを横切る
    const rightToLeft = Math.random() < 0.5;

    el.style.top = topPct + "vh";
    el.style.left = rightToLeft ? "calc(100vw + 80px)" : "-80px";
    el.style.transitionDuration = config.durationSec + "s";

    document.body.appendChild(el);

    let caught = false;

    const cleanup = () => {
        el.removeEventListener("click", onClick);
        el.removeEventListener("transitionend", onEnd);
        if (el.parentNode) el.parentNode.removeChild(el);
        schedulePhantomSpawn();
    };

    const onClick = (e) => {
        e.stopPropagation();
        if (caught) return;
        caught = true;
        catchPhantomVisitor(type, config);
        cleanup();
    };

    const onEnd = () => {
        if (caught) return;
        cleanup();
    };

    el.addEventListener("click", onClick);
    el.addEventListener("transitionend", onEnd);

    // 描画が確定してからleftを動かし、transitionを発火させて画面を横切らせる
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.style.left = rightToLeft ? "-80px" : "calc(100vw + 80px)";
        });
    });
}

// 幻の参拝客をクリックして捕まえた時の処理
function catchPhantomVisitor(type, config) {
    const base = PHANTOM_TYPES[type];
    if (!base) return;
    if (!config) config = base;

    const reward = Math.floor(Math.random() * (base.rewardMax - base.rewardMin + 1)) + base.rewardMin;

    currentMoney += reward;
    updateMoneyDisplay();
    playSE("se-win");
    startConfetti();
    saveUserState();

    alert(config.catchTitle + "\n" + config.catchMsg + "\n所持金が【" + reward.toLocaleString() + "円】アップしました！");
}