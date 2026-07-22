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

// 🎋🗓️⛩️🏺🎖️ ラッキーアイテム・季節イベント・参拝ランク・壺・称号のデータは、
// omikuji-data.js / omikuji-seasonal.js を先に読み込むことで共有している（top.js側での二重管理をやめた）。
// これにより、omikuji2.html側でデータが増えても、top.html側が自動的に追従するようになる。

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

            // 📅 連続参拝ボーナス（カウント自体はomikuji2.html等でloadUserState()実行時に更新される。ここは表示のみ）
            const streakBox = document.querySelector("#login-streak-box");
            if (streakBox) {
                const streakCount = typeof data.loginStreakCount === "number" ? data.loginStreakCount : 0;
                if (streakCount > 0) {
                    streakBox.textContent = "📅 連続参拝：" + streakCount + "日目";
                    streakBox.classList.remove("hidden");
                } else {
                    streakBox.classList.add("hidden");
                }
            }

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

            // 👥 フレンド申請の通知（承認・チャット・送金はomikuji2.html側で行う。ここは通知の表示のみ）
            const friendLink = document.querySelector("#friend-notification-link");
            if (friendLink) {
                const incoming = data.friendRequestsIncoming || {};
                const incomingCount = Object.keys(incoming).filter(n => incoming[n]).length;
                if (incomingCount > 0) {
                    friendLink.textContent = "👥 フレンド申請が" + incomingCount + "件届いています（タップで確認）";
                    friendLink.classList.remove("hidden");
                } else {
                    friendLink.classList.add("hidden");
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

            // 🗺️ 称号判定に必要な「コンプリート状況」を、omikuji-state.js側の集計関数でそのまま計算できるよう、
            // 関連する生データをomikuji-state.jsのグローバル変数へ反映しておく（omikuji2.html側と全く同じロジックを再利用するため）
            japanShrinePartsOwned = data.japanShrinePartsOwned || {};
            japanOkumiyaPartsOwned = data.japanOkumiyaPartsOwned || {};
            ownedPowerSpots = data.ownedPowerSpots || {};
            ownedMiniThemeSpots = data.ownedMiniThemeSpots || {};
            ownedWorldSpots = data.ownedWorldSpots || {};
            ownedHistorySpots = data.ownedHistorySpots || {};

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
                communityDraws: communityDrawsForTitle,
                orihimeHikoboshiMeetCount: typeof data.orihimeHikoboshiMeetCount === "number" ? data.orihimeHikoboshiMeetCount : 0,
                hatsuyumeComplete: data.hatsuyumeComplete === true,
                steadyVisitorEarned: data.steadyVisitorEarned === true,
                hanamiDangoTotalCollected: typeof data.hanamiDangoTotalCollected === "number" ? data.hanamiDangoTotalCollected : 0,
                gotKodomonohiExtreme: data.gotKodomonohiExtreme === true,
                mamemakiSuccessCount: typeof data.mamemakiSuccessCount === "number" ? data.mamemakiSuccessCount : 0,
                nagoshiLastResetYear: data.nagoshiLastResetYear || 0,
                chocoDrawCount: typeof data.chocoDrawCount === "number" ? data.chocoDrawCount : 0,
                joyaBellCompleteYear: data.joyaBellCompleteYear || 0,
                kannazukiRewardedYear: data.kannazukiRewardedYear || 0,
                santaBagCount: typeof data.santaBagCount === "number" ? data.santaBagCount : 0,
                shrineMapLevel: typeof data.shrineMapLevel === "number" ? data.shrineMapLevel : 0,
                companionExp: typeof data.companionExp === "number" ? data.companionExp : 0,
                ownedFriends: data.ownedFriends || {},
                builderLevel: typeof data.builderLevel === "number" ? data.builderLevel : 0,
                comboCompletedYears: typeof data.comboCompletedYears === "number" ? data.comboCompletedYears : 0,
                gotHalloweenRareYokai: data.gotHalloweenRareYokai === true,
                seasonalActionCounts: data.seasonalActionCounts || {},
                // 🗺️ 以下は、上で反映した生データをもとにomikuji-state.jsの集計関数でそのまま計算する
                japanShrineOwnedCount: getJapanShrineOwnedCount(),
                japanPrefCompleteCount: getJapanPrefectureCompleteCount(),
                japanShrinePartsOwnedCount: getJapanShrinePartsTotalOwnedCount(),
                okumiyaCompleteCount: getOkumiyaCompleteCount(),
                powerSpotOwnedCount: getPowerSpotOwnedCount(),
                miniThemeOwnedCount: getMiniThemeOwnedCount(),
                worldSpotOwnedCount: getWorldSpotOwnedCount(),
                historyOwnedCount: getHistoryOwnedCount()
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

        const tiers = COMMUNITY_TIERS; // 🏘️ omikuji-data.js側の定義をそのまま使う（二重管理をやめた）
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

// 🌅🌇🌙⏳ 時間帯の背景演出・カウントダウンは omikuji-ui-core.js / omikuji-countdown.js の
// applyTimeTheme() / startCountdownTimers() をそのまま使う（init()内で呼び出す）

async function init() {
    if (!username) {
        // 未ログインの場合はログインページへ
        window.location.href = "../index.html"; // index.htmlはルートフォルダに移動したため
        return;
    }
    applyTimeTheme();
    setInterval(applyTimeTheme, 60000);
    startCountdownTimers();
    await loadUserInfo();
    await loadCommunityStatus();
    await loadHistory();
    await loadRanking();
    await loadCalendar();
}

init();