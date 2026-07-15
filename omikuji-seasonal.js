// ============================================================
// omikuji-seasonal.js
// 🗓️ 季節イベント（七夕・夏祭り・お月見・紅葉狩り・お正月）の
// マスターデータと「今が期間中かどうか」を判定する共通ロジック。
// omikuji2.html と top.html の両方から読み込まれる（状態変数には依存しない）。
// ============================================================

const SEASONAL_EVENTS = [
    {
        key: "tanabata", name: "七夕", emoji: "🎋",
        startMonth: 7, startDay: 1, endMonth: 7, endDay: 7,
        nightWeekendOnly: false,
        desc: "織姫と彦星にちなんだ限定アイテムが出現。7/7は短冊の願いが必ず叶う特別な日"
    },
    {
        key: "natsumatsuri", name: "夏祭り", emoji: "🎆",
        startMonth: 8, startDay: 1, endMonth: 8, endDay: 31,
        nightWeekendOnly: true,
        desc: "8月の夜・週末だけ限定アイテムが出現＆ドロップ率1.5倍（それ以外の8月は夏の軽い演出に）"
    },
    {
        key: "otsukimi", name: "お月見", emoji: "🌕",
        startMonth: 9, startDay: 15, endMonth: 9, endDay: 30,
        nightWeekendOnly: false,
        desc: "お月見にちなんだ限定アイテムが出現（十五夜の目安期間）"
    },
    {
        key: "koyo", name: "紅葉狩り", emoji: "🍁",
        startMonth: 11, startDay: 1, endMonth: 11, endDay: 30,
        nightWeekendOnly: false,
        desc: "紅葉にちなんだ限定アイテムが出現"
    },
    {
        key: "oshogatsu", name: "お正月", emoji: "🎍",
        startMonth: 1, startDay: 1, endMonth: 1, endDay: 3,
        nightWeekendOnly: false,
        desc: "初夢の縁起物「一富士二鷹三茄子」が出現。三つ揃うと特別なご褒美が！"
    }
];

// 📅 今日が週末（土日）かどうか
function isWeekendDay() {
    const day = new Date().getDay();
    return day === 0 || day === 6;
}

// 🌙 現在時刻が「夜」（17時〜翌5時）かどうか
function isNightHour() {
    const hour = new Date().getHours();
    return hour >= 17 || hour < 5;
}

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
    // 年をまたぐイベント（例：12月末〜1月頭）にも対応
    if (month === event.startMonth) return day >= event.startDay;
    if (month === event.endMonth) return day <= event.endDay;
    return month > event.startMonth || month < event.endMonth;
}

// 指定したキーのイベントが「今」有効かどうか（夜・週末限定の判定も含む）
function isSeasonalEventActive(key) {
    const event = SEASONAL_EVENTS.find(e => e.key === key);
    if (!event) return false;
    if (!isDateInSeasonWindow(event)) return false;
    if (event.nightWeekendOnly) return isNightHour() || isWeekendDay();
    return true;
}

// 指定した日付が期間内に含まれる季節イベントの一覧を返す（カレンダー表示用。夜・週末判定は含まない）
function getSeasonalEventsForDate(dateObj) {
    return SEASONAL_EVENTS.filter(e => isDateInSeasonWindow(e, dateObj));
}
