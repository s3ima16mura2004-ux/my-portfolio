// ============================================================
// omikuji-monthly-challenge.js
// 📆 月替わりの特別チャレンジ（週間ミッションのさらに上位。毎月1個だけの大きな目標）
// omikuji-missions.jsのbuildMissionCardHtml()をそのまま再利用してカードを描画する。
// ============================================================

const MONTHLY_CHALLENGE_POOL = [
    {
        key: "getsurai_sanpai", emoji: "⛩️", name: "今月の参拝チャレンジ",
        desc: "今月中に合計150回おみくじを引く", target: 150,
        rewardType: "money", rewardAmount: 50000, rewardText: "軍資金 50,000円"
    },
    {
        key: "getsurai_juuren", emoji: "🎰", name: "今月の大盤振る舞い",
        desc: "今月中に10連おみくじを15回引く", target: 15,
        rewardType: "money", rewardAmount: 60000, rewardText: "軍資金 60,000円"
    },
    {
        key: "getsurai_minigame", emoji: "🎲", name: "今月のミニゲーム挑戦",
        desc: "今月中にミニゲームを30回プレイする", target: 30,
        rewardType: "money", rewardAmount: 40000, rewardText: "軍資金 40,000円"
    },
    {
        key: "getsurai_kouun", emoji: "🍀", name: "今月の強運",
        desc: "今月中に大吉以上（大吉・神吉・大大吉）を15回引く", target: 15,
        rewardType: "money", rewardAmount: 80000, rewardText: "軍資金 80,000円"
    },
    {
        key: "getsurai_chochiku", emoji: "🏦", name: "今月の貯蓄チャレンジ",
        desc: "今月中に賽銭箱へ合計30,000円預ける", target: 30000,
        rewardType: "money", rewardAmount: 20000, rewardText: "軍資金 20,000円"
    }
];

// 🍀「今月の強運」で対象とする結果（大吉以上）
const GETSURAI_KOUUN_RESULTS = ["大吉", "神吉", "大大吉"];

// 現在の年月を "YYYY-M" 形式の文字列で返す
function getMonthKeyStr() {
    const now = new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1);
}

// プールからランダムに1つチャレンジを選ぶ
function pickMonthlyChallengeKey() {
    return MONTHLY_CHALLENGE_POOL[Math.floor(Math.random() * MONTHLY_CHALLENGE_POOL.length)].key;
}

// 月が変わっていたら、今月のチャレンジをリセットし、新しく1つ抽選する
function refreshMonthlyChallenge() {
    const monthKey = getMonthKeyStr();
    if (monthlyChallengeMonthKey === monthKey) return;

    monthlyChallengeMonthKey = monthKey;
    monthlyChallengeKey = pickMonthlyChallengeKey();
    monthlyChallengeProgress = 0;
    monthlyChallengeClaimed = false;

    saveUserState();
}

function getMonthlyChallenge() {
    return MONTHLY_CHALLENGE_POOL.find(m => m.key === monthlyChallengeKey);
}

// おみくじを1回引くたびに呼び出す
function trackMonthlyDraw(resultName) {
    const challenge = getMonthlyChallenge();
    if (!challenge) return;
    if (challenge.key === "getsurai_sanpai") {
        monthlyChallengeProgress = Math.min(challenge.target, monthlyChallengeProgress + 1);
    } else if (challenge.key === "getsurai_kouun" && GETSURAI_KOUUN_RESULTS.includes(resultName)) {
        monthlyChallengeProgress = Math.min(challenge.target, monthlyChallengeProgress + 1);
    }
    updateMonthlyChallengeUI();
}

// 10連おみくじを1回実行するたびに呼び出す
function trackMonthlyDraw10() {
    const challenge = getMonthlyChallenge();
    if (challenge && challenge.key === "getsurai_juuren") {
        monthlyChallengeProgress = Math.min(challenge.target, monthlyChallengeProgress + 1);
    }
    updateMonthlyChallengeUI();
}

// 賽銭箱に預金した時に呼び出す（累計額で判定）
function trackMonthlyDeposit(amount) {
    if (!amount || amount <= 0) return;
    const challenge = getMonthlyChallenge();
    if (challenge && challenge.key === "getsurai_chochiku") {
        monthlyChallengeProgress = Math.min(challenge.target, monthlyChallengeProgress + amount);
    }
    updateMonthlyChallengeUI();
}

// ミニゲームを1回プレイするたびに呼び出す
function trackMonthlyMinigamePlay() {
    const challenge = getMonthlyChallenge();
    if (challenge && challenge.key === "getsurai_minigame") {
        monthlyChallengeProgress = Math.min(challenge.target, monthlyChallengeProgress + 1);
    }
    updateMonthlyChallengeUI();
}

// 月替わりチャレンジの報酬を受け取る
async function claimMonthlyChallenge(key) {
    const challenge = getMonthlyChallenge();
    if (!challenge || challenge.key !== key) return;
    if (monthlyChallengeClaimed) return;
    if (monthlyChallengeProgress < challenge.target) return;

    monthlyChallengeClaimed = true;

    if (challenge.rewardType === "money") {
        currentMoney += challenge.rewardAmount;
        updateMoneyDisplay();
    } else if (challenge.rewardType === "gachaTicket") {
        gachaTickets += challenge.rewardAmount;
        updateShopUI();
    }

    if (typeof playSE === "function") playSE("se-complete");
    updateMonthlyChallengeUI();
    if (typeof saveUserState === "function") await saveUserState();

    if (typeof showToast === "function") {
        showToast("📆🏆 <strong>今月の特別チャレンジ達成！</strong><br>「" + challenge.emoji + " " + challenge.name + "」の報酬を受け取りました！<br>🎁 " + challenge.rewardText, "gold", 6500);
    } else {
        alert("📆🏆【今月の特別チャレンジ達成】🏆📆\n「" + challenge.emoji + " " + challenge.name + "」の報酬を受け取りました！\n🎁 " + challenge.rewardText);
    }
}

// 📆 月替わりチャレンジタブの表示を更新する
function updateMonthlyChallengeUI() {
    const box = document.querySelector("#monthly-challenge-box");
    if (!box) return;

    const challenge = getMonthlyChallenge();
    if (!challenge) {
        box.innerHTML = "";
        return;
    }

    const progressStore = { [challenge.key]: monthlyChallengeProgress };
    const claimedStore = { [challenge.key]: monthlyChallengeClaimed };
    box.innerHTML = buildMissionCardHtml(challenge, progressStore, claimedStore, "claimMonthlyChallenge");
}
