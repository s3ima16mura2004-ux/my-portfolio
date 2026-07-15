// ============================================================
// omikuji-data.js
// 🎲 おみくじゲームの「マスターデータ」ファイル
// 景品一覧・ショップ品揃え・ドロップアイテム・称号条件など、
// ゲームバランスに関わる定数だけをまとめている。
// ロジックや画面操作はここには書かない。
// ============================================================

const omikujiImages = [
    "omikuji_daikichi.png",
    "omikuji_kichi.png",
    "omikuji_chuukichi.png",
    "omikuji_syoukichi.png",
    "omikuji_suekichi.png",
    "omikuji_kyou.png",
    "omikuji_daikyou.png",
    "omikuji_daidaikichi.jpg",
    "omikuji_kamikichi.jpg",
    "omikuji_daidaikyou.jpg"
];

// 🎋 ラッキーアイテムの一覧（毎日ログイン時に1個抽選・無料）
const LUCKY_ITEMS = [
    { key: "daikichi_up", emoji: "🍀", name: "四つ葉のクローバー", desc: "今日1日、大吉運が少しだけアップ！" },
    { key: "prize_up", emoji: "🐟", name: "立派な鯛", desc: "今日1日、獲得賞金が10%アップ！" },
    { key: "tax_half", emoji: "🐍", name: "白蛇の抜け殻", desc: "今日1日、大凶のお祓い料がさらに半額に！" },
    { key: "fever_extra", emoji: "🔔", name: "縁起の良い鈴の音", desc: "今日1日、大凶時のフィーバー回数が+1回に！" },
    { key: "zorome_up", emoji: "🌟", name: "流れ星のかけら", desc: "今日1日、ゾロ目ボーナスが+2,000円に！" }
];

// 🛍️ ショップで買える「一定回数だけ効果」のアイテム
const SHOP_ITEMS = [
    { key: "manekineko", emoji: "🐱", name: "開運招き猫", price: 10000, duration: 5, desc: "大吉確率が一時的にアップ！", minRank: 0 },
    { key: "gofu", emoji: "📜", name: "金運の護符", price: 5000, duration: 5, desc: "獲得賞金が1.1倍に！", minRank: 0 },
    { key: "suzu", emoji: "🔔", name: "破邪の鈴", price: 3000, duration: 5, desc: "大凶時の没収額が軽減される！", minRank: 0 },
    { key: "oogi", emoji: "🪭", name: "招福の扇", price: 15000, duration: 5, desc: "獲得賞金が1.15倍に！（護符より強力）", minRank: 1 },
    { key: "gohei", emoji: "🎏", name: "五色の幣", price: 25000, duration: 5, desc: "大吉確率が大きくアップ！（招き猫より強力）", minRank: 2 },
    { key: "ryujin", emoji: "🐉", name: "龍神の逆鱗", price: 50000, duration: 3, desc: "「神の試練」が確認なしで自動的に成功する！", minRank: 3 },
    { key: "amaterasu", emoji: "🌟", name: "天照の玉", price: 100000, duration: 5, desc: "大吉確率アップ＋獲得賞金1.2倍の両方が発動！", minRank: 4 },
    { key: "ikigami", emoji: "🕊️", name: "生き神の御札", price: 300000, duration: 5, desc: "大吉確率が最大級にアップ＋大凶(試練)の没収額を大幅軽減！", minRank: 5 }
];

// 🎒 おみくじを引くと低確率で手に入る収集アイテム（ドロップ率は独立判定）
const DROP_ITEMS = [
    { key: "koban", emoji: "🪙", name: "黄金の小判", rate: 0.02, desc: "装備中、大凶（神の試練）が確定で勝利／免除になる", minCommunityTier: 0 },
    { key: "shinboku", emoji: "🌳", name: "神社の神木", rate: 0.03, desc: "装備中、大凶（神の試練）時のフィーバー回数が+1回になる", minCommunityTier: 0 },
    { key: "ishikoro", emoji: "🪨", name: "謎の石ころ", rate: 0.10, desc: "100個で称号、500個で永久ボーナス、1000個ごとにガチャ券がもらえる", minCommunityTier: 0 },
    { key: "tanzaku", emoji: "🎏", name: "五色の短冊", rate: 0.02, desc: "装備中、大吉ボーナスが+1%になる（神社改築で本殿完成後に解放）", minCommunityTier: 4 },
    { key: "orihime_thread", emoji: "🎐", name: "織姫の五色糸", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。彦星の一等星と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "hikoboshi_star", emoji: "🌠", name: "彦星の一等星", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。織姫の五色糸と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "natsumatsuri_lantern", emoji: "🏮", name: "夏祭りの提灯", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ。集めるほど夏祭りが盛り上がる", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kingyo", emoji: "🐠", name: "金魚すくいの金魚", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kakigori", emoji: "🍧", name: "かき氷", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "hanabi_tama", emoji: "🎆", name: "打ち上げ花火の玉", rate: 0.04, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "tsukimi_mochi", emoji: "🐰", name: "月見うさぎの餅", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。10個で称号「お月見上手」", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "momiji_shiori", emoji: "🍁", name: "紅葉のしおり", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。10個で称号「紅葉狩り名人」", minCommunityTier: 0, seasonal: "koyo" },
    { key: "hatsuyume_fuji", emoji: "🗻", name: "初夢の富士", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。鷹・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_taka", emoji: "🦅", name: "初夢の鷹", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_nasu", emoji: "🍆", name: "初夢の茄子", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・鷹と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" }
];

// 🏺 おみくじの壺のランクアップ（永続的に大吉ボーナスが増える・所持金で購入）
const URN_LEVELS = [
    { level: 0, name: "普通の壺", cost: 0, bonus: 0 },
    { level: 1, name: "上質な壺", cost: 20000, bonus: 0.005 },
    { level: 2, name: "銀の壺", cost: 40000, bonus: 0.01 },
    { level: 3, name: "金の壺", cost: 80000, bonus: 0.015 },
    { level: 4, name: "神代の壺", cost: 150000, bonus: 0.02 },
    { level: 5, name: "伝説の壺", cost: 300000, bonus: 0.03 }
];

// 📖 図鑑（これまでに引いた結果を記録するコレクション。7種類すべて達成で永続ボーナス）
const DEX_ENTRIES = [
    { key: "daidaikichi", emoji: "☀️", name: "大大吉", match: r => r === "大大吉" },
    { key: "daikichi", emoji: "🎉", name: "大吉", match: r => r === "大吉" },
    { key: "kamikichi", emoji: "😊", name: "神吉", match: r => r === "神吉" },
    { key: "kichi", emoji: "✨", name: "吉", match: r => r === "吉" },
    { key: "chuukichi", emoji: "🎵", name: "中吉", match: r => r === "中吉" },
    { key: "syoukichi", emoji: "👍", name: "小吉", match: r => r === "小吉" },
    { key: "suekichi", emoji: "😄", name: "末吉", match: r => r === "末吉" },
    { key: "kyou", emoji: "😢", name: "凶", match: r => r === "凶" },
    { key: "daikyou", emoji: "⚔️", name: "大凶(神の試練)", match: r => r.startsWith("神の試練") || r === "大凶" },
    { key: "daidaikyou", emoji: "💀", name: "大大凶", match: r => r === "大大凶" }
];

// ☀️😊💀 超激レア枠（大大吉・神吉・大大凶）の設定
const DAIDAIKICHI_PRIZE = 500000;
const KAMIKICHI_PRIZE = 777777; // 大大吉を超える全枠中最高額
const KAMIKICHI_BONUS_PER_DRAW = 0.005; // 神吉を引くたびに永久に積み重なる大吉ボーナス
const DAIDAIKICHI_THRESHOLD_NORMAL = 0.9995;   // 上位0.05%
const DAIDAIKICHI_THRESHOLD_USHIMITSU = 0.995; // 丑三つ時は上位0.5%に跳ね上がる
const DAIDAIKYOU_THRESHOLD_NORMAL = 0.0005;    // 下位0.05%
const DAIDAIKYOU_THRESHOLD_USHIMITSU = 0.005;  // 丑三つ時は下位0.5%に跳ね上がる
const KAMIKICHI_THRESHOLD = 0.99995; // 上位0.005%（大大吉よりもさらに珍しい特別枠）

// 🏘️ 神社改築（コミュニティ目標）の段階（全ユーザー合計の参拝回数で判定）
const COMMUNITY_TIERS = [
    { tier: 0, threshold: 0, name: "いつもの境内" },
    { tier: 1, threshold: 1000, name: "少し賑わう境内（金色の輝き）" },
    { tier: 2, threshold: 5000, name: "大改築された境内（🎊福だるま登場！）" },
    { tier: 3, threshold: 20000, name: "大鳥居建立（10連おみくじが1,000円割引）" },
    { tier: 4, threshold: 100000, name: "本殿完成（新しい収集アイテム「五色の短冊」解放）" },
    { tier: 5, threshold: 500000, name: "全国的に有名な神社に（福だるまの発生率アップ）" },
    { tier: 6, threshold: 1000000, name: "国宝指定（称号「初代宮司」を全員に付与）" }
];

// 🎊 神社改築レベル2で解放される「福だるま」ボーナス枠（レベル5でさらに発生率アップ）
const FUKU_DARUMA_RATE_NORMAL = 0.05;
const FUKU_DARUMA_RATE_BOOSTED = 0.08; // 神社改築ティア5(50万回)以降
const FUKU_DARUMA_PRIZE = 3000;

// 🏯 神社改築ティア3(2万回)以降、10連おみくじが割引になる金額
const SHRINE_TIER3_DISCOUNT = 1000;

// ⛩️ 参拝ランク（累計獲得賞金額で判定。ランクが上がるとショップの品揃えが増える）
const VISITOR_RANKS = [
    { tier: 0, name: "平参拝者", threshold: 0 },
    { tier: 1, name: "常連客", threshold: 50000 },
    { tier: 2, name: "氏子", threshold: 300000 },
    { tier: 3, name: "神の寵愛者", threshold: 1500000 },
    { tier: 4, name: "神社の重鎮", threshold: 5000000 },
    { tier: 5, name: "生き神様", threshold: 20000000 }
];

// 🎊 隠し要素（イースターエッグ）関連の設定
const STRAIGHT_BONUS_PRIZE = 8000;
const KIMAGURE_BONUS_PRIZE = 10000;
const KIMAGURE_TIMES = ["01:01", "03:33", "04:44", "05:55", "11:11", "12:12", "22:22", "23:23"];
const LUCKY_MONEY_PATTERNS = [777, 7777, 77777, 777777, 888, 8888, 88888, 888888, 1234, 12345, 123456, 111111, 222222, 333333, 555555, 999999];
// 🎖️ 称号（達成条件を満たすと自動的に付与される。プレイヤーの各種累計値で判定）
const TITLES = [
    { key: "hyakuman", emoji: "💰", name: "百万長者", desc: "累計収支+1,000,000円を達成", condition: s => s.totalProfit >= 1000000 },
    { key: "juman", emoji: "💴", name: "実は儲かってる人", desc: "累計収支+100,000円を達成", condition: s => s.totalProfit >= 100000 },
    { key: "daikichi_hunter", emoji: "🎯", name: "大吉ハンター", desc: "大吉を合計10回引いた", condition: s => s.totalDaikichi >= 10 },
    { key: "daikichi_master", emoji: "🏹", name: "大吉マスター", desc: "大吉を合計30回引いた", condition: s => s.totalDaikichi >= 30 },
    { key: "veteran", emoji: "⛩️", name: "生き字引", desc: "累計参拝回数500回を達成", condition: s => s.totalDraws >= 500 },
    { key: "regular", emoji: "🙏", name: "常連参拝者", desc: "累計参拝回数100回を達成", condition: s => s.totalDraws >= 100 },
    { key: "first_visit", emoji: "🔰", name: "初参拝", desc: "はじめての参拝を達成", condition: s => s.totalDraws >= 1 },
    { key: "urn_master", emoji: "🏺", name: "壺のマイスター", desc: "おみくじの壺を最大までランクアップ", condition: s => s.urnLevel >= URN_LEVELS.length - 1 },
    { key: "stone_collector", emoji: "🪨", name: "石ころコレクター", desc: "謎の石ころを100個集めた", condition: s => (s.ownedItems && s.ownedItems.ishikoro || 0) >= 100 },
    { key: "sages_stone", emoji: "🪨✨", name: "賢者の石の使い手", desc: "謎の石ころを500個集め「賢者の石」に変化させた", condition: s => s.ishikoro500Claimed === true },
    { key: "dex_complete", emoji: "📖", name: "図鑑コンプリート", desc: "大吉〜大凶(神の試練)まで全種類を達成", condition: s => s.dexRewardClaimed === true },
    { key: "daidaikichi_title", emoji: "☀️", name: "天啓を受けし者", desc: "「大大吉」を引いた", condition: s => s.gotDaidaikichi === true },
    { key: "kamikichi_title", emoji: "😊", name: "神様に微笑まれし者", desc: "「神吉」を引いた", condition: s => s.gotKamikichi === true },
    { key: "daidaikyou_title", emoji: "💀", name: "丑三つ時の生還者", desc: "「大大凶」を乗り越えた", condition: s => s.gotDaidaikyou === true },
    { key: "ushimitsu_title", emoji: "🌙", name: "丑三つ時の参拝者", desc: "深夜2時〜4時の「丑三つ時」に参拝した", condition: s => s.gotUshimitsuDraw === true },
    { key: "founding_priest", emoji: "⛩️👑", name: "初代宮司", desc: "神社改築が「国宝指定」まで到達した（全員に付与）", condition: s => s.communityDraws >= 1000000 },
    { key: "tanabata_matchmaker", emoji: "🌌", name: "星々を結ぶ者", desc: "織姫と彦星を引き合わせた", condition: s => (s.orihimeHikoboshiMeetCount || 0) >= 1 },
    { key: "tanabata_matchmaker_5", emoji: "🌌✨", name: "星々の守り人", desc: "織姫と彦星の再会を5年連続で見届けた", condition: s => (s.orihimeHikoboshiMeetCount || 0) >= 5 },
    { key: "matsuri_regular", emoji: "🏮", name: "夏祭りの常連", desc: "夏祭りの提灯を10個集めた", condition: s => (s.ownedItems && s.ownedItems.natsumatsuri_lantern || 0) >= 10 },
    { key: "matsuri_master", emoji: "🎇", name: "夏祭りマスター", desc: "夏祭りの限定アイテムを合計20個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.natsumatsuri_lantern || 0) + (oi.kingyo || 0) + (oi.kakigori || 0) + (oi.hanabi_tama || 0)) >= 20;
    } },
    { key: "tsukimi_lover", emoji: "🌕", name: "お月見上手", desc: "月見うさぎの餅を10個集めた", condition: s => (s.ownedItems && s.ownedItems.tsukimi_mochi || 0) >= 10 },
    { key: "koyo_master", emoji: "🍁", name: "紅葉狩り名人", desc: "紅葉のしおりを10個集めた", condition: s => (s.ownedItems && s.ownedItems.momiji_shiori || 0) >= 10 },
    { key: "hatsuyume_complete", emoji: "🗻", name: "一富士二鷹三茄子", desc: "初夢の縁起物（富士・鷹・茄子）を揃えた", condition: s => s.hatsuyumeComplete === true },
    { key: "steady_visitor", emoji: "💼", name: "堅実な参拝者", desc: "デイリーミッション「お財布の達人」を達成（破産せずに1日を終えた）", condition: s => s.steadyVisitorEarned === true }
];

// 🎂 誕生日ボーナス（ログイン画面で任意設定。誕生日当日のログインで「大大吉確定チケット」を1枚獲得）
// チケットは次の単発おみくじ1回で確定的に「大大吉」を発動させる（10連おみくじには使えない）

// 😲 神の気まぐれフィーバー（ログイン時2%抽選。当選すると1時間だけショップの全アイテムが半額になる）
const KIMAGURE_FEVER_CHANCE = 0.02;
const KIMAGURE_FEVER_DURATION_MS = 60 * 60 * 1000; // 1時間

// 🎋 七夕（7月1日〜7日限定）：「短冊に願いを書く」ボタン。1日1回、30%の確率で当日限定の金運アップ効果
// 七夕当日(7/7)は織姫と彦星が天の川で逢う特別な日として、願いが必ず叶う
const TANABATA_MONTH = 7;
const TANABATA_START_DAY = 1;
const TANABATA_END_DAY = 7;
const TANABATA_DAY = 7; // 七夕当日
const TANABATA_SUCCESS_RATE = 0.3;
const TANABATA_DAY_SUCCESS_RATE = 1.0; // 七夕当日は確定で願いが叶う
const TANABATA_DAIKICHI_BONUS = 0.03; // 短冊の願いが叶った日は大吉運+3%
const ORIHIME_HIKOBOSHI_MEETING_PRIZE = 30000; // 織姫の糸＋彦星の星が揃った時（初回）のご祝儀
const ORIHIME_HIKOBOSHI_REUNION_PRIZE = 15000; // 2年目以降の再会イベントのご祝儀

// 🎆 夏祭り（8月限定）：夜と週末だけ本格的なお祭り演出＆ドロップ率アップ。それ以外の8月は「夏っぽい」軽い演出だけになる
const NATSUMATSURI_MONTH = 8;
const NATSUMATSURI_DROP_MULTIPLIER = 1.5;
const NATSUMATSURI_NIGHT_START_HOUR = 17; // 17時〜翌5時を「夜」とみなす
const NATSUMATSURI_NIGHT_END_HOUR = 5;

// 🗻🦅🍆 お正月（1/1〜1/3）：初夢の縁起物「一富士二鷹三茄子」が3つ揃った時のご褒美
const HATSUYUME_COMPLETE_PRIZE = 50000;