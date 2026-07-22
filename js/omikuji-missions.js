// ============================================================
// omikuji-missions.js
// 🎯 デイリーミッション（毎日ランダムで5個選ばれる短期目標）
// マスターデータ・進捗トラッキング・報酬付与・UI更新をまとめている。
// ============================================================

// 🎯 1日にローテーションで表示するミッションの数
const DAILY_MISSION_COUNT = 5;

// 🍀 「連勝街道」で"吉以上"とみなす結果（ゲーム内の等級順で「吉」以上）
const STREAK_QUALIFYING_RESULTS = ["吉", "大吉", "神吉", "大大吉"];
// 🍀 「小吉超えを狙え」で"小吉以上"とみなす結果
const KOKICHI_QUALIFYING_RESULTS = ["小吉", "中吉", "吉", "大吉", "神吉", "大大吉"];

// 🎯 ローテーション対象のデイリーミッション（この中からランダムに毎日5個選ばれる）
const MISSION_POOL = [
    {
        key: "asa_sanpai", emoji: "🌅", name: "朝の参拝",
        desc: "1回おみくじを引く", target: 1,
        rewardType: "money", rewardAmount: 500, rewardText: "軍資金 500円"
    },
    {
        key: "renda_kiwami", emoji: "🔥", name: "連打の極み",
        desc: "合計10回おみくじを引く", target: 10,
        rewardType: "money", rewardAmount: 2000, rewardText: "軍資金 2,000円"
    },
    {
        key: "oinori_kansha", emoji: "🙏", name: "お祈りの感謝",
        desc: "神様にお祈りボタンを1回使う", target: 1,
        rewardType: "money", rewardAmount: 1000, rewardText: "軍資金 1,000円"
    },
    {
        key: "kamidanomi_nikai", emoji: "🙏🙏", name: "神頼み二回",
        desc: "1日に2回お祈りボタンを使う", target: 2,
        rewardType: "money", rewardAmount: 2500, rewardText: "軍資金 2,500円"
    },
    {
        key: "daikichi_mezase", emoji: "📮", name: "大吉を目指せ",
        desc: "どんな運勢でも良いので、おみくじ結果を1回送信する", target: 1,
        rewardType: "kiyomeshio", rewardAmount: 0, rewardText: "ラッキーアイテム「清めの塩」（本日のお祓い料がさらに軽減）"
    },
    {
        key: "kyou_koeru", emoji: "⚔️", name: "凶を乗り越えろ",
        desc: "凶または大凶を1回引く", target: 1,
        rewardType: "money", rewardAmount: 3000, rewardText: "お詫び金 3,000円"
    },
    {
        key: "renshou_kaidou", emoji: "🎯", name: "連勝街道",
        desc: "吉以上を3回連続で引く（外れると連続カウントはリセット）", target: 3,
        rewardType: "boostTicket", rewardAmount: 1, rewardText: "所持金1.1倍ブースト券"
    },
    {
        key: "kobetsu_nerae", emoji: "🎋", name: "小吉超えを狙え",
        desc: "小吉以上の結果を合計5回引く（連続でなくてOK）", target: 5,
        rewardType: "money", rewardAmount: 1500, rewardText: "軍資金 1,500円"
    },
    {
        key: "mukizu_sanpai", emoji: "🛡️", name: "無傷参拝",
        desc: "凶・大凶・大大凶を引かずに5回連続でおみくじを引く", target: 5,
        rewardType: "money", rewardAmount: 3000, rewardText: "軍資金 3,000円"
    },
    {
        key: "taikin_kasegi", emoji: "💴", name: "大金稼ぎ",
        desc: "1回のおみくじ結果で5,000円以上の賞金を獲得する", target: 1,
        rewardType: "money", rewardAmount: 2000, rewardText: "軍資金 2,000円"
    },
    {
        key: "juuren_chousen", emoji: "🎰", name: "大盤振る舞い",
        desc: "10連おみくじを1回引く", target: 1,
        rewardType: "money", rewardAmount: 3000, rewardText: "軍資金 3,000円"
    },
    {
        key: "shuushuu_minarai", emoji: "🎒", name: "収集家見習い",
        desc: "おみくじで収集アイテムを1個ドロップさせる", target: 1,
        rewardType: "money", rewardAmount: 1000, rewardText: "軍資金 1,000円"
    },
    {
        key: "shop_jouren", emoji: "🛍️", name: "ショップの常連",
        desc: "アイテムショップで何か1つ購入する", target: 1,
        rewardType: "money", rewardAmount: 1500, rewardText: "軍資金 1,500円"
    },
    {
        key: "chochiku_ka", emoji: "🏦", name: "貯蓄家",
        desc: "賽銭箱に合計1,000円以上預ける", target: 1000,
        rewardType: "money", rewardAmount: 800, rewardText: "軍資金 800円"
    },
    {
        key: "zukan_susume", emoji: "📖", name: "図鑑を進めよう",
        desc: "おみくじ図鑑に新しい結果を1つ記録する", target: 1,
        rewardType: "money", rewardAmount: 2000, rewardText: "軍資金 2,000円"
    }
];

// 🌙 常に表示される（ローテーションに含まれない）ミッション
const ALWAYS_ACTIVE_MISSIONS = [
    {
        key: "saifu_no_tatsujin", emoji: "💼", name: "お財布の達人",
        desc: "所持金を1回も破産させずに1日を終える（自動判定・翌日のログイン時に成否が確定）", target: 1,
        rewardType: "title", rewardAmount: 0, rewardText: "称号「堅実な参拝者」"
    }
];

// 🔰 「はじめてガイド」：初めて訪れた参拝者向けの一度きりのチュートリアルミッション
// （日付が変わってもリセットされない。デイリーミッションとは別の専用の進捗・受取状態で管理する）
const TUTORIAL_MISSIONS = [
    {
        key: "hajimete_omikuji", emoji: "🎯", name: "はじめてのおみくじ",
        desc: "おみくじを1回引いてみよう", target: 1,
        rewardType: "money", rewardAmount: 1000, rewardText: "軍資金 1,000円"
    },
    {
        key: "shop_wo_nozoku", emoji: "🛍️", name: "ショップをのぞいてみよう",
        desc: "「アイテムショップ」タブを開いてみよう", target: 1,
        rewardType: "money", rewardAmount: 500, rewardText: "軍資金 500円"
    },
    {
        key: "zukan_wo_miru", emoji: "📖", name: "おみくじ図鑑を見てみよう",
        desc: "「図鑑」タブを開いてみよう", target: 1,
        rewardType: "money", rewardAmount: 500, rewardText: "軍資金 500円"
    },
    {
        key: "map_wo_miru", emoji: "🗺️", name: "境内マップを見てみよう",
        desc: "「境内マップ」タブを開いてみよう", target: 1,
        rewardType: "money", rewardAmount: 500, rewardText: "軍資金 500円"
    },
    {
        key: "chokin_shite_miru", emoji: "🏦", name: "賽銭箱に預けてみよう",
        desc: "賽銭箱（貯金）に1円でも預けてみよう", target: 1,
        rewardType: "money", rewardAmount: 500, rewardText: "軍資金 500円"
    }
];

function findMissionByKey(key) {
    return MISSION_POOL.find(m => m.key === key) || ALWAYS_ACTIVE_MISSIONS.find(m => m.key === key);
}

// プールからランダムに DAILY_MISSION_COUNT 個のキーを選ぶ（Fisher-Yatesシャッフル）
function pickDailyMissionKeys() {
    const keys = MISSION_POOL.map(m => m.key);
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = keys[i]; keys[i] = keys[j]; keys[j] = tmp;
    }
    return keys.slice(0, Math.min(DAILY_MISSION_COUNT, keys.length));
}

// 日付が変わっていたら、ミッションの進捗をすべてリセットし、新しい5個を抽選する
// （リセット直前に「お財布の達人」の前日分の判定も行う）
function refreshDailyMissions() {
    const today = todayStr();
    if (missionDate === today) return;

    const isFirstEverLogin = missionDate === "";

    // 💼 前日分の「お財布の達人」判定（初回ログイン時は判定しない・常時ミッションなので毎日判定）
    if (!isFirstEverLogin && missionDrawsToday > 0 && !wentBankruptToday && !steadyVisitorEarned) {
        steadyVisitorEarned = true;
        updateTitlesUI();
        setTimeout(() => {
            alert("💼🎖️【デイリーミッション達成】🎖️💼\n昨日は一度も破産することなく参拝を終えました！\n称号「堅実な参拝者」を獲得しました！");
        }, 1500);
    }

    missionDate = today;
    missionKeysToday = pickDailyMissionKeys();
    missionProgress = {};
    missionClaimed = {};
    missionDrawsToday = 0;
    wentBankruptToday = false;
    kiyomeShioActive = false; // 🧂「清めの塩」の効果は1日限定

    saveUserState();
}

// おみくじを1回引くたびに呼び出す（単発・10連どちらの1回分にも対応）
function trackMissionDraw(resultName, prizeMoney) {
    if (!resultName) return;

    trackTutorialMission("hajimete_omikuji"); // 🔰 はじめてガイド：はじめてのおみくじの進捗を記録

    missionDrawsToday++;
    missionProgress.asa_sanpai = Math.min(1, missionDrawsToday);
    missionProgress.renda_kiwami = Math.min(10, missionDrawsToday);

    const isBadResult = resultName === "凶" || resultName === "大凶" || resultName === "大大凶" || resultName.indexOf("神の試練") === 0;

    if (isBadResult) {
        missionProgress.kyou_koeru = Math.min(1, (missionProgress.kyou_koeru || 0) + 1);
        missionProgress.mukizu_sanpai = 0; // 🛡️「無傷参拝」の連続カウントはリセット
    } else {
        missionProgress.mukizu_sanpai = Math.min(5, (missionProgress.mukizu_sanpai || 0) + 1);
    }

    if (STREAK_QUALIFYING_RESULTS.includes(resultName)) {
        missionProgress.renshou_kaidou = Math.min(3, (missionProgress.renshou_kaidou || 0) + 1);
    } else {
        missionProgress.renshou_kaidou = 0;
    }

    if (KOKICHI_QUALIFYING_RESULTS.includes(resultName)) {
        missionProgress.kobetsu_nerae = Math.min(5, (missionProgress.kobetsu_nerae || 0) + 1);
    }

    if (typeof prizeMoney === "number" && prizeMoney >= 5000) {
        missionProgress.taikin_kasegi = 1;
    }

    if (typeof trackWeeklyDraw === "function") trackWeeklyDraw(resultName); // 📅 週間ミッションの進捗も合わせて更新

    updateMissionsUI();
}

// 10連おみくじを1回実行するたびに呼び出す
function trackMissionDraw10() {
    missionProgress.juuren_chousen = 1;
    if (typeof trackWeeklyDraw10 === "function") trackWeeklyDraw10(); // 📅 週間ミッションの進捗も合わせて更新
    updateMissionsUI();
}

// 神様へのお祈りボタンを使うたびに呼び出す（回数はprayCountからそのまま反映）
function trackMissionPray() {
    missionProgress.oinori_kansha = Math.min(1, prayCount);
    missionProgress.kamidanomi_nikai = Math.min(2, prayCount);
    updateMissionsUI();
}

// 「結果を送信する」ボタンを押した時に呼び出す
function trackMissionSubmit() {
    missionProgress.daikichi_mezase = 1;
    updateMissionsUI();
}

// 収集アイテムがドロップした時に呼び出す
function trackMissionDropItem() {
    missionProgress.shuushuu_minarai = 1;
    updateMissionsUI();
}

// ショップアイテムを購入した時に呼び出す
function trackMissionShopBuy() {
    missionProgress.shop_jouren = 1;
    if (typeof trackWeeklyShopBuy === "function") trackWeeklyShopBuy(); // 📅 週間ミッションの進捗も合わせて更新
    updateMissionsUI();
}

// 賽銭箱に預金した時に呼び出す（累計額で判定）
function trackMissionDeposit(amount) {
    if (!amount || amount <= 0) return;
    missionProgress.chochiku_ka = Math.min(1000, (missionProgress.chochiku_ka || 0) + amount);
    if (typeof trackWeeklyDeposit === "function") trackWeeklyDeposit(amount); // 📅 週間ミッションの進捗も合わせて更新
    updateMissionsUI();
}

// 図鑑に新しい結果が記録された時に呼び出す
function trackMissionDexProgress() {
    missionProgress.zukan_susume = 1;
    updateMissionsUI();
}

// ミッションの報酬を受け取る
async function claimMission(key) {
    const mission = findMissionByKey(key);
    if (!mission) return;
    if (mission.rewardType === "title") return; // 常時ミッションは自動判定のため手動受け取り不可
    if (!missionKeysToday.includes(key)) return; // 本日のローテーション対象外は受け取り不可
    if (missionClaimed[key]) return;
    if ((missionProgress[key] || 0) < mission.target) return;

    missionClaimed[key] = true;

    let rewardMsg = mission.rewardText;
    if (mission.rewardType === "money") {
        currentMoney += mission.rewardAmount;
        updateMoneyDisplay();
    } else if (mission.rewardType === "kiyomeshio") {
        kiyomeShioActive = true;
    } else if (mission.rewardType === "boostTicket") {
        boostTicketCount += mission.rewardAmount;
    }

    playSE("se-coin");
    updateMissionsUI();
    updateShopUI();
    await saveUserState();

    alert("🎯【デイリーミッション達成】🎯\n「" + mission.emoji + " " + mission.name + "」の報酬を受け取りました！\n🎁 " + rewardMsg);
}

// 🔰 はじめてガイド：進捗を記録する（デイリーミッションとは別の専用の状態で管理し、日付が変わってもリセットされない）
function trackTutorialMission(key) {
    if ((tutorialMissionProgress[key] || 0) >= 1) return; // すでに達成済みなら何もしない
    tutorialMissionProgress[key] = 1;
    updateMissionsUI();
}

// 🔰 はじめてガイドの報酬を受け取る
async function claimTutorialMission(key) {
    const mission = TUTORIAL_MISSIONS.find(m => m.key === key);
    if (!mission) return;
    if (tutorialMissionClaimed[key]) return;
    if ((tutorialMissionProgress[key] || 0) < mission.target) return;

    tutorialMissionClaimed[key] = true;

    if (mission.rewardType === "money") {
        currentMoney += mission.rewardAmount;
        updateMoneyDisplay();
    }

    playSE("se-milestone");
    updateMissionsUI();
    await saveUserState();

    alert("🔰🎉【はじめてガイド達成】🎉🔰\n「" + mission.emoji + " " + mission.name + "」の報酬を受け取りました！\n🎁 " + mission.rewardText);
}

// 🎟️ ブースト券を1枚使って所持金を1.1倍にする
async function useBoostTicket() {
    if (boostTicketCount <= 0) {
        alert("🙅 ブースト券を持っていません！\n「連勝街道」ミッションをクリアすると手に入ります。");
        return;
    }

    const before = currentMoney;
    currentMoney = Math.floor(currentMoney * 1.1);
    boostTicketCount--;

    updateMoneyDisplay();
    updateShopUI();
    playSE("se-win");
    await saveUserState();

    alert("🎟️【ブースト券使用】🎟️\n所持金が1.1倍になりました！\n" + before.toLocaleString() + "円 → " + currentMoney.toLocaleString() + "円");
}

// 1件分のミッションカードHTMLを作る（progressStore/claimedStoreを省略すると通常のデイリーミッション扱いになる。
// claimFnNameを省略した場合は、tutorialMissionProgressかどうかで自動判定する）
function buildMissionCardHtml(mission, progressStore, claimedStore, claimFnName) {
    const progressSrc = progressStore || missionProgress;
    const claimedSrc = claimedStore || missionClaimed;

    const progress = Math.min(mission.target, progressSrc[mission.key] || 0);
    const claimed = !!claimedSrc[mission.key];
    const isAuto = mission.rewardType === "title";
    const complete = progress >= mission.target;
    const isTutorial = progressStore === tutorialMissionProgress;

    let actionHtml;
    if (isAuto) {
        actionHtml = complete
            ? '<span class="mission-status-tag mission-status-done">🎖️ 達成済み</span>'
            : '<span class="mission-status-tag">翌日判定</span>';
    } else if (claimed) {
        actionHtml = '<span class="mission-status-tag mission-status-done">✅ 受取済み</span>';
    } else if (complete) {
        const claimFn = claimFnName || (isTutorial ? "claimTutorialMission" : "claimMission");
        actionHtml = '<button class="btn-shop-buy mission-claim-btn" onclick="' + claimFn + '(\'' + mission.key + '\')" type="button">🎁 受け取る</button>';
    } else {
        actionHtml = '<span class="mission-status-tag">未達成</span>';
    }

    const pct = Math.floor((progress / mission.target) * 100);
    const progressLabel = mission.key === "chochiku_ka"
        ? progress.toLocaleString() + " / " + mission.target.toLocaleString() + "円"
        : progress + " / " + mission.target;

    return (
        '<div class="mission-card' + (complete ? ' mission-card-complete' : '') + '">' +
            '<div class="mission-card-header">' +
                '<span class="mission-card-title">' + mission.emoji + ' ' + mission.name + '</span>' +
                actionHtml +
            '</div>' +
            '<p class="mission-card-desc">' + mission.desc + '</p>' +
            '<div class="mission-progress-outer"><div class="mission-progress-inner" style="width:' + pct + '%"></div></div>' +
            '<p class="mission-progress-text">進捗：' + progressLabel + '　🎁 報酬：' + mission.rewardText + '</p>' +
        '</div>'
    );
}

// 🎯 デイリーミッションタブの表示を更新する
function updateMissionsUI() {
    const list = document.querySelector("#missions-list");
    const alwaysList = document.querySelector("#missions-always-list");
    const tutorialList = document.querySelector("#tutorial-missions-list");
    const tutorialBadge = document.querySelector("#tutorial-missions-badge");
    if (!list) return;

    const todaysMissions = missionKeysToday
        .map(key => MISSION_POOL.find(m => m.key === key))
        .filter(Boolean);

    list.innerHTML = todaysMissions.map(m => buildMissionCardHtml(m)).join("");

    if (alwaysList) {
        alwaysList.innerHTML = ALWAYS_ACTIVE_MISSIONS.map(m => buildMissionCardHtml(m)).join("");
    }

    // 🔰 はじめてガイド（一度きりのチュートリアルミッション。専用の進捗・受取状態で管理する）
    if (tutorialList) {
        tutorialList.innerHTML = TUTORIAL_MISSIONS.map(m => buildMissionCardHtml(m, tutorialMissionProgress, tutorialMissionClaimed)).join("");
    }
    if (tutorialBadge) {
        const doneCount = TUTORIAL_MISSIONS.filter(m => tutorialMissionClaimed[m.key]).length;
        tutorialBadge.textContent = doneCount >= TUTORIAL_MISSIONS.length
            ? "（すべて達成✅）"
            : "（" + doneCount + " / " + TUTORIAL_MISSIONS.length + "）";
    }

    const claimableCount = todaysMissions.filter(m =>
        m.rewardType !== "title" && !missionClaimed[m.key] && (missionProgress[m.key] || 0) >= m.target
    ).length;

    const summaryEl = document.querySelector("#missions-summary");
    if (summaryEl) {
        summaryEl.textContent = claimableCount > 0
            ? "🎁 受け取り可能なミッション報酬が " + claimableCount + " 件あります！"
            : "本日のミッションはすべて確認済みです。おみくじを引いて達成を目指しましょう！";
    }

    // タブボタンにも未受け取りバッジを表示
    const tabBtn = document.querySelector("#tabBtn-missions");
    if (tabBtn) {
        tabBtn.textContent = "🎯 デイリーミッション" + (claimableCount > 0 ? "（" + claimableCount + "）" : "");
    }

    const boostCountEl = document.querySelector("#boost-ticket-count");
    if (boostCountEl) boostCountEl.textContent = boostTicketCount;
    const boostBtn = document.querySelector("#boost-ticket-use-btn");
    if (boostBtn) boostBtn.disabled = boostTicketCount <= 0;
}