// ============================================================
// omikuji-weekly-missions.js
// 📅 週間目標ミッション（月曜始まりの週で3個ランダムに選ばれる、デイリーミッションの上位版）
// omikuji-missions.jsのデイリーミッションと同じ作りを踏襲し、
// buildMissionCardHtml()（missions.js）をそのまま再利用してカードを描画する。
// ============================================================

// 📅 1週間にローテーションで表示するミッションの数
const WEEKLY_MISSION_COUNT = 3;

const WEEKLY_MISSION_POOL = [
    {
        key: "shuukan_sanpai", emoji: "⛩️", name: "週間参拝チャレンジ",
        desc: "今週中に合計30回おみくじを引く", target: 30,
        rewardType: "money", rewardAmount: 8000, rewardText: "軍資金 8,000円"
    },
    {
        key: "shuukan_juuren", emoji: "🎰", name: "週末の大盤振る舞い",
        desc: "今週中に10連おみくじを3回引く", target: 3,
        rewardType: "money", rewardAmount: 10000, rewardText: "軍資金 10,000円"
    },
    {
        key: "shuukan_chochiku", emoji: "🏦", name: "週間貯蓄チャレンジ",
        desc: "今週中に賽銭箱へ合計5,000円預ける", target: 5000,
        rewardType: "money", rewardAmount: 3000, rewardText: "軍資金 3,000円"
    },
    {
        key: "shuukan_shop", emoji: "🛍️", name: "週間ショップ通い",
        desc: "今週中にアイテムショップで3回購入する", target: 3,
        rewardType: "money", rewardAmount: 4000, rewardText: "軍資金 4,000円"
    },
    {
        key: "shuukan_kouun", emoji: "🍀", name: "週間強運",
        desc: "今週中に大吉以上（大吉・神吉・大大吉）を3回引く", target: 3,
        rewardType: "money", rewardAmount: 12000, rewardText: "軍資金 12,000円"
    },
    {
        key: "shuukan_minigame", emoji: "🎲", name: "週間ミニゲーム挑戦",
        desc: "今週中にミニゲームを5回プレイする", target: 5,
        rewardType: "gachaTicket", rewardAmount: 1, rewardText: "ガチャ券 1枚"
    }
];

// 🍀「週間強運」で対象とする結果（大吉以上）
const SHUUKAN_KOUUN_RESULTS = ["大吉", "神吉", "大大吉"];

// 今週の月曜日の日付文字列を返す（他の日付判定と同じtoLocaleDateString("ja-JP")形式で統一）
function getWeekStartDateStr() {
    const now = new Date();
    const day = now.getDay(); // 0=日,1=月,...6=土
    const diffToMonday = (day === 0) ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday.toLocaleDateString("ja-JP");
}

// プールからランダムに WEEKLY_MISSION_COUNT 個のキーを選ぶ（Fisher-Yatesシャッフル）
function pickWeeklyMissionKeys() {
    const keys = WEEKLY_MISSION_POOL.map(m => m.key);
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = keys[i]; keys[i] = keys[j]; keys[j] = tmp;
    }
    return keys.slice(0, Math.min(WEEKLY_MISSION_COUNT, keys.length));
}

// 週が変わっていたら、週間ミッションの進捗をすべてリセットし、新しい3個を抽選する
function refreshWeeklyMissions() {
    const weekStart = getWeekStartDateStr();
    if (weekStartDate === weekStart) return;

    weekStartDate = weekStart;
    weeklyMissionKeysThisWeek = pickWeeklyMissionKeys();
    weeklyMissionProgress = {};
    weeklyMissionClaimed = {};

    saveUserState();
}

// おみくじを1回引くたびに呼び出す（missions.jsのtrackMissionDrawから連動して呼ばれる）
function trackWeeklyDraw(resultName) {
    weeklyMissionProgress.shuukan_sanpai = Math.min(30, (weeklyMissionProgress.shuukan_sanpai || 0) + 1);
    if (SHUUKAN_KOUUN_RESULTS.includes(resultName)) {
        weeklyMissionProgress.shuukan_kouun = Math.min(3, (weeklyMissionProgress.shuukan_kouun || 0) + 1);
    }
    updateWeeklyMissionsUI();
}

// 10連おみくじを1回実行するたびに呼び出す
function trackWeeklyDraw10() {
    weeklyMissionProgress.shuukan_juuren = Math.min(3, (weeklyMissionProgress.shuukan_juuren || 0) + 1);
    updateWeeklyMissionsUI();
}

// ショップアイテムを購入した時に呼び出す
function trackWeeklyShopBuy() {
    weeklyMissionProgress.shuukan_shop = Math.min(3, (weeklyMissionProgress.shuukan_shop || 0) + 1);
    updateWeeklyMissionsUI();
}

// 賽銭箱に預金した時に呼び出す（累計額で判定）
function trackWeeklyDeposit(amount) {
    if (!amount || amount <= 0) return;
    weeklyMissionProgress.shuukan_chochiku = Math.min(5000, (weeklyMissionProgress.shuukan_chochiku || 0) + amount);
    updateWeeklyMissionsUI();
}

// ミニゲームを1回プレイするたびに呼び出す（chohan.js等、各ミニゲームページから呼ばれる）
function trackWeeklyMinigamePlay() {
    weeklyMissionProgress.shuukan_minigame = Math.min(5, (weeklyMissionProgress.shuukan_minigame || 0) + 1);
    updateWeeklyMissionsUI();
}

// 週間ミッションの報酬を受け取る
async function claimWeeklyMission(key) {
    const mission = WEEKLY_MISSION_POOL.find(m => m.key === key);
    if (!mission) return;
    if (!weeklyMissionKeysThisWeek.includes(key)) return;
    if (weeklyMissionClaimed[key]) return;
    if ((weeklyMissionProgress[key] || 0) < mission.target) return;

    weeklyMissionClaimed[key] = true;

    if (mission.rewardType === "money") {
        currentMoney += mission.rewardAmount;
        updateMoneyDisplay();
    } else if (mission.rewardType === "gachaTicket") {
        gachaTickets += mission.rewardAmount;
        updateShopUI();
    }

    playSE("se-milestone");
    updateWeeklyMissionsUI();
    await saveUserState();

    showToast("📅🎯 <strong>週間ミッション達成</strong><br>「" + mission.emoji + " " + mission.name + "」の報酬を受け取りました！<br>🎁 " + mission.rewardText, "gold");
}

// 📅 週間ミッションタブの表示を更新する
function updateWeeklyMissionsUI() {
    const list = document.querySelector("#weekly-missions-list");
    if (!list) return;

    const thisWeeksMissions = weeklyMissionKeysThisWeek
        .map(key => WEEKLY_MISSION_POOL.find(m => m.key === key))
        .filter(Boolean);

    list.innerHTML = thisWeeksMissions.map(m =>
        buildMissionCardHtml(m, weeklyMissionProgress, weeklyMissionClaimed, "claimWeeklyMission")
    ).join("");

    const claimableCount = thisWeeksMissions.filter(m =>
        !weeklyMissionClaimed[m.key] && (weeklyMissionProgress[m.key] || 0) >= m.target
    ).length;

    const summaryEl = document.querySelector("#weekly-missions-summary");
    if (summaryEl) {
        summaryEl.textContent = claimableCount > 0
            ? "🎁 受け取り可能な週間ミッション報酬が " + claimableCount + " 件あります！"
            : "今週の目標に向けて、参拝を続けましょう！（毎週月曜日にリセットされます）";
    }
}