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
        gachaMultiplier: 2.0, // 🎰 季節限定ガチャの金額倍率（開催日数に応じて設定。短いイベントほど高め）
        desc: "織姫と彦星にちなんだ限定アイテムが出現。7/7は短冊の願いが必ず叶う特別な日"
    },
    {
        key: "natsumatsuri", name: "夏祭り", emoji: "🎆",
        startMonth: 8, startDay: 1, endMonth: 8, endDay: 31,
        nightWeekendOnly: true,
        gachaMultiplier: 1.0,
        desc: "8月の夜・週末だけ限定アイテムが出現＆ドロップ率1.5倍（それ以外の8月は夏の軽い演出に）"
    },
    {
        key: "otsukimi", name: "お月見", emoji: "🌕",
        startMonth: 9, startDay: 15, endMonth: 9, endDay: 30,
        nightWeekendOnly: false,
        gachaMultiplier: 1.5,
        desc: "お月見にちなんだ限定アイテムが出現（十五夜の目安期間）"
    },
    {
        key: "koyo", name: "紅葉狩り", emoji: "🍁",
        startMonth: 11, startDay: 1, endMonth: 11, endDay: 30,
        nightWeekendOnly: false,
        gachaMultiplier: 1.0,
        desc: "紅葉にちなんだ限定アイテムが出現"
    },
    {
        key: "oshogatsu", name: "お正月", emoji: "🎍",
        startMonth: 1, startDay: 1, endMonth: 1, endDay: 3,
        nightWeekendOnly: false,
        gachaMultiplier: 3.0,
        desc: "初夢の縁起物「一富士二鷹三茄子」が出現。三つ揃うと特別なご褒美が！"
    },
    {
        key: "valentine", name: "バレンタイン", emoji: "💝",
        startMonth: 2, startDay: 1, endMonth: 2, endDay: 14,
        nightWeekendOnly: false,
        gachaMultiplier: 1.5,
        desc: "縁結びの祈りの季節。「チョコおみくじ」を引くと、相性の良い運勢との「ペア運勢」が履歴に残ります（1日1回）"
    },
    {
        key: "kannazuki", name: "神無月", emoji: "🌫️",
        startMonth: 10, startDay: 1, endMonth: 10, endDay: 31,
        nightWeekendOnly: false,
        gachaMultiplier: 1.0,
        desc: "神様が出雲へ出かけ、神社が少し寂しくなる期間。この間に賽銭箱へ預けたお金は、11月に神様が戻った時「倍返し」されます"
    },
    {
        key: "shichigosan", name: "七五三", emoji: "👘",
        startMonth: 11, startDay: 1, endMonth: 11, endDay: 30,
        nightWeekendOnly: false,
        gachaMultiplier: 1.0,
        desc: "成長祈願の季節。ショップに「千歳飴」が並び、装備するとフィーバータイムの回数が延長されます"
    },
    {
        key: "christmas", name: "クリスマス", emoji: "🎄",
        startMonth: 12, startDay: 1, endMonth: 12, endDay: 25,
        nightWeekendOnly: false,
        gachaMultiplier: 1.2,
        desc: "神社が彩られる特別な期間。昼は雪がちらちら降り、夜はイルミネーションが点滅。低確率で「サンタの袋」が現れます"
    },
    {
        key: "nenmatsu", name: "年末", emoji: "🎊",
        startMonth: 12, startDay: 26, endMonth: 12, endDay: 31,
        nightWeekendOnly: false,
        gachaMultiplier: 2.0,
        desc: "一年の締めくくりの期間。昼は静かに雪が降り、夜は「除夜の鐘」が響きます。鐘を108回つくと煩悩祓いのご褒美が"
    },
    {
        key: "halloween", name: "ハロウィン（妖怪祭り）", emoji: "👻",
        startMonth: 10, startDay: 25, endMonth: 10, endDay: 31,
        nightWeekendOnly: false,
        gachaMultiplier: 2.0,
        desc: "和風の妖怪たちが境内に集う夜。「肝試し」に挑戦すると、出会う妖怪次第でご褒美がもらえます（ハズレなし・1日1回）"
    },
    {
        key: "setsubun", name: "節分", emoji: "🫘",
        startMonth: 2, startDay: 1, endMonth: 2, endDay: 3,
        nightWeekendOnly: false,
        gachaMultiplier: 3.0,
        desc: "豆まきで厄払いをする季節。境内に豆まきの豆（稀に鬼）が舞い、おみくじの結果次第で「福は内」の恩恵が"
    },
    {
        key: "haru", name: "春の芽吹き", emoji: "🌱",
        startMonth: 3, startDay: 1, endMonth: 3, endDay: 31,
        nightWeekendOnly: false,
        gachaMultiplier: 1.0,
        desc: "花が咲く前の若葉・新芽の季節。境内に若葉がふわりと立ちのぼり、限定アイテムが出現します"
    },
    {
        key: "hanami", name: "お花見", emoji: "🌸",
        startMonth: 4, startDay: 1, endMonth: 4, endDay: 30,
        nightWeekendOnly: false,
        gachaMultiplier: 1.0,
        desc: "桜満開の季節。花びらが舞い散る中、お花見団子などの限定アイテムが出現します"
    },
    {
        key: "kodomonohi", name: "こどもの日", emoji: "🎏",
        startMonth: 5, startDay: 1, endMonth: 5, endDay: 5,
        nightWeekendOnly: false,
        gachaMultiplier: 2.0,
        desc: "黄金の鯉のぼり（稀に昇り龍）が空を泳ぐ期間。大大吉以上の出現率がアップし、限定アイテムも出現します"
    },
    {
        key: "nagoshi", name: "夏越の大祓", emoji: "🌾",
        startMonth: 6, startDay: 25, endMonth: 6, endDay: 30,
        nightWeekendOnly: false,
        gachaMultiplier: 2.0,
        desc: "半年間の穢れを祓う「茅の輪くぐり」の季節。これまでに引いた「凶」「大凶」の回数に応じたご褒美がもらえます"
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