import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKvro8iNDBPKVlTEXVp5A8r-OyEJoRgZk",
    authDomain: "omikujisite.firebaseapp.com",
    projectId: "omikujisite",
    storageBucket: "omikujisite.firebasestorage.app",
    messagingSenderId: "213364923898",
    appId: "1:213364923898:web:b8a0a55eef1491bde15843",
    measurementId: "G-BKVJTZKJBQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎋 ラッキーアイテムの一覧（index.htmlと同じ内容。表示用に名前・説明のみ使用）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

// 🗓️ 季節イベント（omikuji-seasonal.jsと同じ内容。運勢カレンダーへの表示用）
const SEASONAL_EVENTS = [
    { key: "tanabata", name: "七夕", emoji: "🎋", startMonth: 7, startDay: 1, endMonth: 7, endDay: 7, nightWeekendOnly: false,
      desc: "織姫と彦星にちなんだ限定アイテムが出現。7/7は短冊の願いが必ず叶う特別な日" },
    { key: "natsumatsuri", name: "夏祭り", emoji: "🎆", startMonth: 8, startDay: 1, endMonth: 8, endDay: 31, nightWeekendOnly: true,
      desc: "8月の夜・週末だけ限定アイテムが出現＆ドロップ率1.5倍（それ以外の8月は夏の軽い演出に）" },
    { key: "otsukimi", name: "お月見", emoji: "🌕", startMonth: 9, startDay: 15, endMonth: 9, endDay: 30, nightWeekendOnly: false,
      desc: "お月見にちなんだ限定アイテムが出現（十五夜の目安期間）" },
    { key: "koyo", name: "紅葉狩り", emoji: "🍁", startMonth: 11, startDay: 1, endMonth: 11, endDay: 30, nightWeekendOnly: false,
      desc: "紅葉にちなんだ限定アイテムが出現" },
    { key: "oshogatsu", name: "お正月", emoji: "🎍", startMonth: 1, startDay: 1, endMonth: 1, endDay: 3, nightWeekendOnly: false,
      desc: "初夢の縁起物「一富士二鷹三茄子」が出現。三つ揃うと特別なご褒美が！" },
    { key: "valentine", name: "バレンタイン", emoji: "💝", startMonth: 2, startDay: 1, endMonth: 2, endDay: 14, nightWeekendOnly: false,
      desc: "縁結びの祈りの季節。「チョコおみくじ」を引くと、相性の良い運勢との「ペア運勢」が履歴に残ります（1日1回）" },
    { key: "kannazuki", name: "神無月", emoji: "🌫️", startMonth: 10, startDay: 1, endMonth: 10, endDay: 31, nightWeekendOnly: false,
      desc: "神様が出雲へ出かけ、神社が少し寂しくなる期間。この間に賽銭箱へ預けたお金は、11月に神様が戻った時「倍返し」されます" },
    { key: "shichigosan", name: "七五三", emoji: "👘", startMonth: 11, startDay: 1, endMonth: 11, endDay: 30, nightWeekendOnly: false,
      desc: "成長祈願の季節。ショップに「千歳飴」が並び、装備するとフィーバータイムの回数が延長されます" },
    { key: "christmas", name: "クリスマス", emoji: "🎄", startMonth: 12, startDay: 1, endMonth: 12, endDay: 25, nightWeekendOnly: false,
      desc: "神社が彩られる特別な期間。昼は雪がちらちら降り、夜はイルミネーションが点滅。低確率で「サンタの袋」が現れます" },
    { key: "nenmatsu", name: "年末", emoji: "🎊", startMonth: 12, startDay: 26, endMonth: 12, endDay: 31, nightWeekendOnly: false,
      desc: "一年の締めくくりの期間。昼は静かに雪が降り、夜は「除夜の鐘」が響きます。鐘を108回つくと煩悩祓いのご褒美が" }
];

// 指定した日付（省略時は今日）が、あるイベントの期間内かどうか
function isDateInSeasonWindow(event, baseDate) {
    const now = baseDate || new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if (event.startMonth === event.endMonth) {
        return month === event.startMonth && day >= event.startDay && day <= event.endDay;
    }
    if (event.startMonth < event.endMonth) {
        if (month === event.startMonth) return day >= event.startDay;
        if (month === event.endMonth) return day <= event.endDay;
        return month > event.startMonth && month < event.endMonth;
    }
    if (month === event.startMonth) return day >= event.startDay;
    if (month === event.endMonth) return day <= event.endDay;
    return month > event.startMonth || month < event.endMonth;
}

// 指定した日付が期間内に含まれる季節イベントの一覧を返す
function getSeasonalEventsForDate(dateObj) {
    return SEASONAL_EVENTS.filter(e => isDateInSeasonWindow(e, dateObj));
}

// 🏺 壺のランクアップ段階数（omikuji2.jsと同じ内容。称号判定の最大値参照に使用）
const URN_LEVEL_COUNT = 6;

// 🎖️ 称号（omikuji2.jsと同じ条件。トップページのプロフィール欄にも表示するため）
// ⛩️ 参拝ランク（omikuji2.jsと同じ内容。累計獲得賞金額で判定）
const VISITOR_RANKS = [
    { tier: 0, name: "平参拝者", threshold: 0 },
    { tier: 1, name: "常連客", threshold: 50000 },
    { tier: 2, name: "氏子", threshold: 300000 },
    { tier: 3, name: "神の寵愛者", threshold: 1500000 },
    { tier: 4, name: "神社の重鎮", threshold: 5000000 },
    { tier: 5, name: "生き神様", threshold: 20000000 }
];

const TITLES = [
    { key: "hyakuman", emoji: "💰", name: "百万長者", desc: "累計収支+1,000,000円を達成", condition: s => s.totalProfit >= 1000000 },
    { key: "juman", emoji: "💴", name: "実は儲かってる人", desc: "累計収支+100,000円を達成", condition: s => s.totalProfit >= 100000 },
    { key: "daikichi_hunter", emoji: "🎯", name: "大吉ハンター", desc: "大吉を合計10回引いた", condition: s => s.totalDaikichi >= 10 },
    { key: "daikichi_master", emoji: "🏹", name: "大吉マスター", desc: "大吉を合計30回引いた", condition: s => s.totalDaikichi >= 30 },
    { key: "veteran", emoji: "⛩️", name: "生き字引", desc: "累計参拝回数500回を達成", condition: s => s.totalDraws >= 500 },
    { key: "regular", emoji: "🙏", name: "常連参拝者", desc: "累計参拝回数100回を達成", condition: s => s.totalDraws >= 100 },
    { key: "first_visit", emoji: "🔰", name: "初参拝", desc: "はじめての参拝を達成", condition: s => s.totalDraws >= 1 },
    { key: "urn_master", emoji: "🏺", name: "壺のマイスター", desc: "おみくじの壺を最大までランクアップ", condition: s => s.urnLevel >= URN_LEVEL_COUNT - 1 },
    { key: "stone_collector", emoji: "🪨", name: "石ころコレクター", desc: "謎の石ころを100個集めた", condition: s => (s.ownedItems && s.ownedItems.ishikoro || 0) >= 100 },
    { key: "dex_complete", emoji: "📖", name: "図鑑コンプリート", desc: "大吉〜大凶(神の試練)まで全種類を達成", condition: s => s.dexRewardClaimed === true },
    { key: "daidaikichi_title", emoji: "☀️", name: "天啓を受けし者", desc: "「大大吉」を引いた", condition: s => s.gotDaidaikichi === true },
    { key: "kamikichi_title", emoji: "😊", name: "神様に微笑まれし者", desc: "「神吉」を引いた", condition: s => s.gotKamikichi === true },
    { key: "daidaikyou_title", emoji: "💀", name: "丑三つ時の生還者", desc: "「大大凶」を乗り越えた", condition: s => s.gotDaidaikyou === true },
    { key: "ushimitsu_title", emoji: "🌙", name: "丑三つ時の参拝者", desc: "深夜2時〜4時の「丑三つ時」に参拝した", condition: s => s.gotUshimitsuDraw === true },
    { key: "sages_stone", emoji: "🪨✨", name: "賢者の石の使い手", desc: "謎の石ころを500個集め「賢者の石」に変化させた", condition: s => s.ishikoro500Claimed === true },
    { key: "founding_priest", emoji: "⛩️👑", name: "初代宮司", desc: "神社改築が「国宝指定」まで到達した（全員に付与）", condition: s => s.communityDraws >= 1000000 }
];

const username = localStorage.getItem("logged_in_user");

const userDisplay = document.querySelector("#user-display");
const moneyDisplay = document.querySelector("#money-display");
const luckyBox = document.querySelector("#lucky-item-box");
const luckyName = document.querySelector("#lucky-item-name");
const luckyDesc = document.querySelector("#lucky-item-desc");
const tbody = document.querySelector("#history-table tbody");
const rankingTbody = document.querySelector("#ranking-table tbody");
const myRankNote = document.querySelector("#my-rank-note");

async function loadUserInfo() {
    if (userDisplay) userDisplay.textContent = username;
    const equippedTitleDisplay = document.querySelector("#equipped-title-display");

    try {
        const snap = await getDoc(doc(db, "users", username));

        if (snap.exists()) {
            const data = snap.data();
            const money = typeof data.money === "number" ? data.money : 0;
            if (moneyDisplay) moneyDisplay.textContent = money.toLocaleString();

            // 🎖️ 装備中の称号（omikuji2.html側で選んだものを、そのまま名前の横に表示する）
            if (equippedTitleDisplay) {
                if (data.equippedTitleKey && data.equippedTitleEmoji) {
                    equippedTitleDisplay.textContent = data.equippedTitleEmoji + " " + data.equippedTitleName + " ";
                    equippedTitleDisplay.classList.remove("hidden");
                } else {
                    equippedTitleDisplay.textContent = "";
                    equippedTitleDisplay.classList.add("hidden");
                }
            }

            const bankMoney = typeof data.bankMoney === "number" ? data.bankMoney : 0;
            const bankDisplayTop = document.querySelector("#bank-money-display-top");
            if (bankDisplayTop) bankDisplayTop.textContent = bankMoney.toLocaleString();

            const todayStr = new Date().toLocaleDateString("ja-JP");
            const taianBox = document.querySelector("#taian-status-box");
            if (taianBox) {
                if (data.taianDate === todayStr && data.taianActive === true) {
                    taianBox.textContent = "🎊 本日は【大安吉日】！大吉運UP＆おみくじ料金半額中！";
                    taianBox.classList.remove("hidden");
                } else {
                    taianBox.classList.add("hidden");
                }
            }

            const picked = LUCKY_ITEMS.find(i => i.key === data.luckyItem);
            if (picked && luckyBox) {
                luckyBox.classList.remove("hidden");
                if (luckyName) luckyName.textContent = picked.emoji + " " + picked.name;
                if (luckyDesc) luckyDesc.textContent = picked.desc;
            }

            let communityDrawsForTitle = 0;
            try {
                const commSnap = await getDoc(doc(db, "global", "community"));
                communityDrawsForTitle = (commSnap.exists() && typeof commSnap.data().totalDraws === "number") ? commSnap.data().totalDraws : 0;
            } catch (e) {
                console.error("称号判定用のコミュニティデータ取得に失敗しました: ", e);
            }

            const stats = {
                totalDraws: typeof data.totalDraws === "number" ? data.totalDraws : 0,
                totalDaikichi: typeof data.totalDaikichi === "number" ? data.totalDaikichi : 0,
                totalProfit: typeof data.totalProfit === "number" ? data.totalProfit : 0,
                urnLevel: typeof data.urnLevel === "number" ? data.urnLevel : 0,
                ownedItems: data.ownedItems || {},
                dexRewardClaimed: data.dexRewardClaimed === true,
                gotDaidaikichi: data.gotDaidaikichi === true,
                gotKamikichi: data.gotKamikichi === true,
                gotDaidaikyou: data.gotDaidaikyou === true,
                gotUshimitsuDraw: data.gotUshimitsuDraw === true,
                ishikoro500Claimed: data.ishikoro500Claimed === true,
                communityDraws: communityDrawsForTitle
            };
            renderTitles(stats);

            const totalWinnings = typeof data.totalWinnings === "number" ? data.totalWinnings : 0;
            renderRank(totalWinnings);
        } else {
            if (moneyDisplay) moneyDisplay.textContent = "0";
        }
    } catch (e) {
        console.error("ユーザーデータの読み込みに失敗しました: ", e);
        if (moneyDisplay) moneyDisplay.textContent = "―";
    }
}

// 🏘️ 神社改築（コミュニティ目標）の状況を表示する
async function loadCommunityStatus() {
    const box = document.querySelector("#community-status-box");
    if (!box) return;

    try {
        const snap = await getDoc(doc(db, "global", "community"));
        const totalDraws = (snap.exists() && typeof snap.data().totalDraws === "number") ? snap.data().totalDraws : 0;

        const tiers = [
            { threshold: 0, name: "いつもの境内" },
            { threshold: 1000, name: "少し賑わう境内（金色の輝き）" },
            { threshold: 5000, name: "大改築された境内（🎊福だるま登場！）" },
            { threshold: 20000, name: "大鳥居建立（10連おみくじが1,000円割引）" },
            { threshold: 100000, name: "本殿完成（新しい収集アイテム「五色の短冊」解放）" },
            { threshold: 500000, name: "全国的に有名な神社に（福だるまの発生率アップ）" },
            { threshold: 1000000, name: "国宝指定（称号「初代宮司」を全員に付与）" }
        ];
        let tierIndex = 0;
        tiers.forEach((t, i) => { if (totalDraws >= t.threshold) tierIndex = i; });

        let text = "🏘️ みんなの参拝合計：" + totalDraws.toLocaleString() + "回（" + tiers[tierIndex].name + "）";
        if (tiers[tierIndex + 1]) {
            text += "\n次の目標まであと" + (tiers[tierIndex + 1].threshold - totalDraws).toLocaleString() + "回（" + tiers[tierIndex + 1].name + "）";
        }
        box.textContent = text;
        box.classList.remove("hidden");

        const container = document.querySelector(".container");
        if (container) {
            container.classList.remove("shrine-tier1", "shrine-tier2", "shrine-tier3", "shrine-tier4", "shrine-tier5", "shrine-tier6");
            if (tierIndex >= 1) container.classList.add("shrine-tier" + Math.min(tierIndex, 6));
        }
    } catch (e) {
        console.error("コミュニティ目標データの読み込みに失敗しました: ", e);
    }
}

// 🎖️ 称号バッジの表示（閲覧のみ。装備の切り替えはomikuji2.html側で行う）
function renderTitles(stats) {
    const box = document.querySelector("#titles-box");
    const list = document.querySelector("#titles-list");
    const badge = document.querySelector("#titles-count-badge");
    if (!box || !list) return;

    const earned = TITLES.filter(t => t.condition(stats));

    if (badge) {
        badge.textContent = earned.length > 0 ? "（獲得数：" + earned.length + "個）" : "（まだ獲得した称号はありません）";
    }

    if (earned.length === 0) {
        box.classList.add("hidden");
        list.innerHTML = "";
        return;
    }

    box.classList.remove("hidden");
    list.innerHTML = earned.map(t =>
        '<span class="title-badge" title="' + t.desc.replace(/"/g, "&quot;") + '">' + t.emoji + " " + t.name + "</span>"
    ).join("");
}

// ⛩️ 参拝ランクの表示
function renderRank(totalWinnings) {
    let tier = 0;
    VISITOR_RANKS.forEach(r => { if (totalWinnings >= r.threshold) tier = r.tier; });
    const current = VISITOR_RANKS[tier];
    const next = VISITOR_RANKS[tier + 1];

    const nameEl = document.querySelector("#rank-name-display");
    if (nameEl) nameEl.textContent = "⛩️ 参拝ランク：" + current.name;

    const progressEl = document.querySelector("#rank-progress-display");
    if (progressEl) {
        if (next) {
            progressEl.textContent =
                "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（次の「" + next.name + "」まであと" +
                (next.threshold - totalWinnings).toLocaleString() + "円）";
        } else {
            progressEl.textContent = "累計獲得賞金：" + totalWinnings.toLocaleString() + "円（最高ランクです！）";
        }
    }
}

async function loadHistory() {
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4">読み込み中…</td></tr>`;

    try {
        // 自分の履歴だけを新しい順に、直近10件まで取得
        const q = query(
            collection(db, "history"),
            where("name", "==", username),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4">まだ履歴がありません</td></tr>`;
            return;
        }

        // 一旦テキストを組み立ててから一括で反映（描画の都度innerHTML+=を避ける）
        let rowsHtml = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            const dateText = data.date ?? "―";
            const resultText = data.result ?? "―";
            const prizeNum = typeof data.prize === "number" ? data.prize : 0;
            const balanceNum = typeof data.balance === "number" ? data.balance : 0;

            const prizeText = (prizeNum >= 0 ? "+" : "") + prizeNum.toLocaleString() + "円";
            const balanceText = balanceNum.toLocaleString() + "円";

            rowsHtml += `
                <tr>
                    <td>${escapeHtml(dateText)}</td>
                    <td>${escapeHtml(resultText)}</td>
                    <td>${escapeHtml(prizeText)}</td>
                    <td>${escapeHtml(balanceText)}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;
    } catch (e) {
        console.error("履歴の読み込みに失敗しました: ", e);
        // 複合クエリ（where + orderBy）にはFirestoreの複合インデックス作成が必要な場合があります。
        // コンソールのエラーに表示されるリンクをクリックして作成してください。
        tbody.innerHTML = `<tr><td colspan="4">履歴の読み込みに失敗しました</td></tr>`;
    }
}

// XSS対策として簡易エスケープ（Firestoreに保存された文字列をそのままinnerHTMLに入れないため）
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

async function loadRanking() {
    if (!rankingTbody) return;

    rankingTbody.innerHTML = `<tr><td colspan="3">読み込み中…</td></tr>`;
    if (myRankNote) myRankNote.textContent = "";

    try {
        // 所持金+賽銭箱の合計でランキングするため、Firestore側の並び替えは使わず全員分を取得して集計する
        const snapshot = await getDocs(collection(db, "users"));

        if (snapshot.empty) {
            rankingTbody.innerHTML = `<tr><td colspan="3">まだ参拝者がいません</td></tr>`;
            return;
        }

        const entries = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const money = typeof data.money === "number" ? data.money : 0;
            const bank = typeof data.bankMoney === "number" ? data.bankMoney : 0;
            entries.push({ name: docSnap.id, total: money + bank });
        });

        entries.sort((a, b) => b.total - a.total);

        const displayEntries = entries.slice(0, 50);

        let rowsHtml = "";
        let myRank = -1;

        entries.forEach((entry, index) => {
            if (entry.name === username) myRank = index + 1;
        });

        displayEntries.forEach((entry, index) => {
            const rowIndex = index + 1;
            const isMe = entry.name === username;
            const medal = RANK_MEDALS[index] || "";

            rowsHtml += `
                <tr class="${isMe ? "rank-me" : ""}">
                    <td><span class="rank-medal">${medal}</span> ${rowIndex}位</td>
                    <td>${escapeHtml(entry.name)}</td>
                    <td>${entry.total.toLocaleString()}円</td>
                </tr>
            `;
        });

        rankingTbody.innerHTML = rowsHtml;

        if (myRankNote) {
            if (myRank === -1) {
                myRankNote.textContent = "あなたの順位：まだおみくじ未参加です";
            } else {
                myRankNote.textContent = "あなたの現在の順位：" + myRank + "位（全" + entries.length + "人中）";
            }
        }
    } catch (e) {
        console.error("ランキングの読み込みに失敗しました: ", e);
        rankingTbody.innerHTML = `<tr><td colspan="3">ランキングの読み込みに失敗しました</td></tr>`;
    }
}

// 📅 運勢カレンダー（今月の日ごとの当選金額合計を色分け表示）
async function loadCalendar() {
    const grid = document.querySelector("#calendar-grid");
    const titleEl = document.querySelector("#calendar-title");
    if (!grid) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    if (titleEl) titleEl.textContent = "📅 運勢カレンダー（" + year + "年" + (month + 1) + "月）";

    renderSeasonEvents(year, month);

    grid.innerHTML = `<p class="calendar-loading">読み込み中…</p>`;

    try {
        // 直近500件から今月分を集計（あまりに参拝回数が多い場合は一部のみの集計になります）
        const q = query(
            collection(db, "history"),
            where("name", "==", username),
            orderBy("timestamp", "desc"),
            limit(500)
        );

        const snapshot = await getDocs(q);
        const dayTotals = {}; // "YYYY/M/D" -> 合計金額

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const dateText = data.date;
            if (!dateText) return;

            // 今月のデータだけ集計する
            const parts = dateText.split("/");
            if (parts.length !== 3) return;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            if (y !== year || m !== month) return;

            const prize = typeof data.prize === "number" ? data.prize : 0;
            dayTotals[dateText] = (dayTotals[dateText] || 0) + prize;
        });

        renderCalendarGrid(grid, year, month, dayTotals);
    } catch (e) {
        console.error("運勢カレンダーの読み込みに失敗しました: ", e);
        grid.innerHTML = `<p class="calendar-loading">カレンダーの読み込みに失敗しました</p>`;
    }
}

// 🗓️ 表示中の月に該当する季節イベントの一覧を「今シーズンのイベント」として表示する
function renderSeasonEvents(year, month) {
    const box = document.querySelector("#season-events-box");
    if (!box) return;

    const displayedMonth = month + 1;
    const events = SEASONAL_EVENTS.filter(e => e.startMonth === displayedMonth);

    if (events.length === 0) {
        box.innerHTML = '<p class="season-events-empty">🗓️ 今月は季節イベントの開催予定はありません。</p>';
        return;
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    box.innerHTML = '<p class="season-events-title">🎐 今シーズンのイベント</p>' +
        events.map(e => {
            const rangeText = e.startDay + "日〜" + e.endDay + "日";
            let statusText = "";
            if (isCurrentMonth) {
                if (isDateInSeasonWindow(e, today)) {
                    statusText = e.nightWeekendOnly ? "🔥 開催中（夜・週末限定）" : "🔥 開催中！";
                } else if (today.getDate() < e.startDay) {
                    statusText = "🔜 これから";
                } else {
                    statusText = "✅ 終了";
                }
            }
            return (
                '<div class="season-event-row">' +
                '<span class="season-event-emoji">' + e.emoji + '</span>' +
                '<span class="season-event-name">' + e.name + '（' + rangeText + '）</span>' +
                '<span class="season-event-status">' + statusText + '</span>' +
                '</div>' +
                '<p class="season-event-desc">' + e.desc + '</p>'
            );
        }).join("");
}

function renderCalendarGrid(grid, year, month, dayTotals) {
    const firstDay = new Date(year, month, 1).getDay(); // 0=日曜
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDateStr = new Date().toLocaleDateString("ja-JP");

    const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
    let html = '<div class="calendar-weekdays">' +
        weekdayLabels.map(w => '<div class="calendar-weekday">' + w + '</div>').join("") +
        '</div><div class="calendar-days">';

    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day calendar-day-empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = year + "/" + (month + 1) + "/" + day;
        const total = dayTotals[dateStr];
        let luckClass = "calendar-day-none";
        let luckLabel = "記録なし";

        if (total !== undefined) {
            if (total > 0) { luckClass = "calendar-day-good"; luckLabel = "+" + total.toLocaleString() + "円"; }
            else if (total < 0) { luckClass = "calendar-day-bad"; luckLabel = total.toLocaleString() + "円"; }
            else { luckClass = "calendar-day-neutral"; luckLabel = "±0円"; }
        }

        const isToday = dateStr === todayDateStr;

        const dayEvents = getSeasonalEventsForDate(new Date(year, month, day));
        const eventBadge = dayEvents.length > 0
            ? '<span class="calendar-day-event-badge" title="' + dayEvents.map(e => e.name).join("・") + '">' + dayEvents.map(e => e.emoji).join("") + '</span>'
            : "";

        html += '<div class="calendar-day ' + luckClass + (isToday ? " calendar-day-today" : "") + '" title="' + luckLabel + '">' +
            eventBadge +
            '<span class="calendar-day-number">' + day + '</span>' +
            '</div>';
    }

    html += '</div>';
    grid.innerHTML = html;
}

// 🌅🌇🌙 時間帯（朝・昼・夜・丑三つ時）の背景演出（omikuji2.jsと同じロジック）
function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4) return "ushimitsu";
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "afternoon";
    return "evening";
}

function applyTimeTheme() {
    const container = document.querySelector(".container");
    const period = getTimePeriod();

    if (container) {
        container.classList.remove("time-morning", "time-afternoon", "time-evening", "time-ushimitsu");
        container.classList.add("time-" + period);
    }

    const banner = document.querySelector("#ushimitsu-banner");
    if (banner) {
        if (period === "ushimitsu") {
            banner.classList.remove("hidden");
        } else {
            banner.classList.add("hidden");
        }
    }
}

// ============================================================
// ⏳ カウントダウン（次の季節イベント／次のボーナスタイムまで）
// ============================================================

function formatCountdown(ms) {
    if (ms <= 0) return "まもなく";
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (days > 0) return days + "日 " + hours + "時間 " + minutes + "分";
    if (hours > 0) return hours + "時間 " + minutes + "分 " + seconds + "秒";
    return minutes + "分 " + seconds + "秒";
}

function getEventDateRangeForYear(event, year) {
    const start = new Date(year, event.startMonth - 1, event.startDay, 0, 0, 0);
    const end = new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59);
    return { start: start, end: end };
}

function getNextSeasonalEventInfo() {
    const now = new Date();
    const year = now.getFullYear();

    const candidates = [];
    [year, year + 1].forEach(y => {
        SEASONAL_EVENTS.forEach(event => {
            const range = getEventDateRangeForYear(event, y);
            candidates.push({ event: event, start: range.start, end: range.end });
        });
    });

    const active = candidates.find(c => now >= c.start && now <= c.end);
    if (active) {
        return { phase: "active", event: active.event, targetDate: active.end };
    }

    const upcoming = candidates
        .filter(c => c.start > now)
        .sort((a, b) => a.start - b.start)[0];

    return upcoming ? { phase: "upcoming", event: upcoming.event, targetDate: upcoming.start } : null;
}

function getNextBonusTimeInfo() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(2, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(4, 0, 0, 0);

    if (now >= todayStart && now < todayEnd) {
        return { phase: "active", targetDate: todayEnd };
    }

    const nextStart = new Date(todayStart);
    if (now >= todayEnd) {
        nextStart.setDate(nextStart.getDate() + 1);
    }
    return { phase: "upcoming", targetDate: nextStart };
}

function updateSeasonCountdownUI() {
    const box = document.querySelector("#countdown-season-box");
    if (!box) return;

    const info = getNextSeasonalEventInfo();
    if (!info) {
        box.classList.add("hidden");
        return;
    }
    box.classList.remove("hidden");

    const remaining = info.targetDate - new Date();
    if (info.phase === "active") {
        box.textContent = info.event.emoji + "【" + info.event.name + "】開催中！終了まで残り " + formatCountdown(remaining);
    } else {
        box.textContent = "⏳ 次の季節イベント " + info.event.emoji + info.event.name + " まで あと " + formatCountdown(remaining);
    }
}

function updateBonusCountdownUI() {
    const box = document.querySelector("#countdown-bonus-box");
    if (!box) return;

    const info = getNextBonusTimeInfo();
    const remaining = info.targetDate - new Date();

    if (info.phase === "active") {
        box.textContent = "🌙【丑三つ時ボーナスタイム】発動中！終了まで残り " + formatCountdown(remaining);
    } else {
        box.textContent = "🌙 次のボーナスタイム（丑三つ時）まで あと " + formatCountdown(remaining);
    }
}

function updateAllCountdownUI() {
    updateSeasonCountdownUI();
    updateBonusCountdownUI();
}

async function init() {
    if (!username) {
        // 未ログインの場合はログインページへ
        window.location.href = "index.html";
        return;
    }
    applyTimeTheme();
    setInterval(applyTimeTheme, 60000);
    updateAllCountdownUI();
    setInterval(updateAllCountdownUI, 1000);
    await loadUserInfo();
    await loadCommunityStatus();
    await loadHistory();
    await loadRanking();
    await loadCalendar();
}

init();