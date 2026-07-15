// ============================================================
// omikuji-countdown.js
// ⏳ 「次の季節イベントまで」「次のボーナスタイムまで」の
// カウントダウン表示。omikuji-seasonal.jsのSEASONAL_EVENTSに依存。
// omikuji2.html側で読み込む（top.html側は top.js に同等の処理を内蔵）。
// ============================================================

// ミリ秒を「◯日 ◯時間 ◯分」「◯時間◯分◯秒」のような文字列に整形する
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

// 指定した年における、あるイベントの開始日時・終了日時を返す
function getEventDateRangeForYear(event, year) {
    const start = new Date(year, event.startMonth - 1, event.startDay, 0, 0, 0);
    const end = new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59);
    return { start: start, end: end };
}

// 「今開催中のイベント（残り時間つき）」または「次に始まるイベント（開始までの時間つき）」を返す
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

// 🌙「ボーナスタイム」＝丑三つ時（深夜2時〜4時、大大吉・大大凶の確率が跳ね上がる時間帯）の情報を返す
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

// 1秒ごとに両方のカウントダウンを更新開始する
function startCountdownTimers() {
    updateAllCountdownUI();
    setInterval(updateAllCountdownUI, 1000);
}
