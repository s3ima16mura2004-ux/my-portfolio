// ============================================================
// omikuji-data.js
// 🎲 おみくじゲームの「マスターデータ」ファイル
// 景品一覧・ショップ品揃え・ドロップアイテム・称号条件など、
// ゲームバランスに関わる定数だけをまとめている。
// ロジックや画面操作はここには書かない。
// ============================================================

const omikujiImages = [
    "../images/omikuji_daikichi.png",
    "../images/omikuji_kichi.png",
    "../images/omikuji_chuukichi.png",
    "../images/omikuji_syoukichi.png",
    "../images/omikuji_suekichi.png",
    "../images/omikuji_kyou.png",
    "../images/omikuji_daikyou.png",
    "../images/omikuji_daidaikichi.jpg",
    "../images/omikuji_kamikichi.jpg",
    "../images/omikuji_daidaikyou.jpg"
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
    { key: "ikigami", emoji: "🕊️", name: "生き神の御札", price: 300000, duration: 5, desc: "大吉確率が最大級にアップ＋大凶(試練)の没収額を大幅軽減！", minRank: 5 },
    { key: "chitose_ame", emoji: "🍬", name: "千歳飴", price: 12000, duration: 5, desc: "装備中、大凶(神の試練)や大大凶で発動するフィーバーの回数が+2回に！（七五三シーズン限定販売）", minRank: 0, seasonal: "shichigosan" },
    { key: "wakaba_omamori", emoji: "🌱", name: "若葉のお守り", price: 8000, duration: 5, desc: "新生活を応援する若葉のお守り。大吉確率が少しアップ！（春の芽吹きシーズン限定販売）", minRank: 0, seasonal: "haru" }
];

// 🎒 おみくじを引くと低確率で手に入る収集アイテム（ドロップ率は独立判定）
const DROP_ITEMS = [
    { key: "koban", emoji: "🪙", name: "黄金の小判", rate: 0.02, desc: "装備中、大凶（神の試練）が確定で勝利／免除になる", minCommunityTier: 0 },
    { key: "shinboku", emoji: "🌳", name: "神社の神木", rate: 0.03, desc: "装備中、大凶（神の試練）時のフィーバー回数が+1回になる", minCommunityTier: 0 },
    { key: "ishikoro", emoji: "🪨", name: "謎の石ころ", rate: 0.10, desc: "100個で称号、500個で永久ボーナス、1000個ごとにガチャ券がもらえる", minCommunityTier: 0 },
    { key: "tanzaku", emoji: "🎏", name: "五色の短冊", rate: 0.02, desc: "装備中、大吉ボーナスが+1%になる（神社改築で本殿完成後に解放）", minCommunityTier: 4 },
    { key: "orihime_thread", emoji: "🎐", name: "織姫の五色糸", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。彦星の一等星と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "hikoboshi_star", emoji: "🌠", name: "彦星の一等星", rate: 0.06, desc: "七夕（7/1〜7/7）限定ドロップ。織姫の五色糸と両方揃うと特別なご縁が結ばれる", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "amanogawa_kirameki", emoji: "🌌", name: "天の川のきらめき", rate: 0.05, desc: "七夕（7/1〜7/7）限定ドロップ。夜空を彩る天の川の輝き", minCommunityTier: 0, seasonal: "tanabata" },
    { key: "natsumatsuri_lantern", emoji: "🏮", name: "夏祭りの提灯", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ。集めるほど夏祭りが盛り上がる", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kingyo", emoji: "🐠", name: "金魚すくいの金魚", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "kakigori", emoji: "🍧", name: "かき氷", rate: 0.05, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "hanabi_tama", emoji: "🎆", name: "打ち上げ花火の玉", rate: 0.04, desc: "夏祭り開催中（8月の夜・週末）限定ドロップ", minCommunityTier: 0, seasonal: "natsumatsuri" },
    { key: "tsukimi_mochi", emoji: "🐰", name: "月見うさぎの餅", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。10個で称号「お月見上手」", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "susuki_hoshi", emoji: "🌾", name: "すすきの穂", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。夜空に月見だんごと一緒に飾ろう", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "tsukimi_dango", emoji: "🍡", name: "月見団子", rate: 0.05, desc: "お月見（9/15〜9/30）限定ドロップ。十五夜のお供え物", minCommunityTier: 0, seasonal: "otsukimi" },
    { key: "momiji_shiori", emoji: "🍁", name: "紅葉のしおり", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。10個で称号「紅葉狩り名人」", minCommunityTier: 0, seasonal: "koyo" },
    { key: "icho_leaf", emoji: "🍂", name: "黄金の銀杏の葉", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。山を彩る黄金色の葉", minCommunityTier: 0, seasonal: "koyo" },
    { key: "kuri", emoji: "🌰", name: "山の恵み・栗", rate: 0.05, desc: "紅葉狩り（11月）限定ドロップ。秋の味覚の代表格", minCommunityTier: 0, seasonal: "koyo" },
    { key: "hatsuyume_fuji", emoji: "🗻", name: "初夢の富士", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。鷹・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_taka", emoji: "🦅", name: "初夢の鷹", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・茄子と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "hatsuyume_nasu", emoji: "🍆", name: "初夢の茄子", rate: 0.04, desc: "お正月（1/1〜1/3）限定ドロップ。富士・鷹と揃うと縁起物コンプリート！", minCommunityTier: 0, seasonal: "oshogatsu" },
    { key: "izumo_omamori", emoji: "⛩️", name: "出雲土産のお守り", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲に集った神様からのお土産", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "kamisama_wasuremono", emoji: "👣", name: "神様の忘れ物", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲へ向かう道すがら落としていったもの", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "kagura_suzu", emoji: "🔔", name: "神楽の鈴", rate: 0.05, desc: "神無月（10月）限定ドロップ。出雲での神議りを彩る神楽の音色", minCommunityTier: 0, seasonal: "kannazuki" },
    { key: "chitose_fukuro", emoji: "👝", name: "千歳飴の松竹梅袋", rate: 0.05, desc: "七五三（11月）限定ドロップ。縁起の良い松竹梅柄の袋", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "orizuru_negai", emoji: "🕊️", name: "願いの折り鶴", rate: 0.05, desc: "七五三（11月）限定ドロップ。健やかな成長を願って折られた鶴", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "kinchaku_omamori", emoji: "👛", name: "縁起の巾着", rate: 0.05, desc: "七五三（11月）限定ドロップ。小さな巾着に詰まった縁起物", minCommunityTier: 0, seasonal: "shichigosan" },
    { key: "christmas_ribbon", emoji: "🎀", name: "クリスマスの飾りリボン", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。ツリーを彩る飾りリボン", minCommunityTier: 0, seasonal: "christmas" },
    { key: "seiya_candle", emoji: "🕯️", name: "聖夜のキャンドル", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。静かに揺れる聖夜の灯", minCommunityTier: 0, seasonal: "christmas" },
    { key: "snowman_charm", emoji: "⛄", name: "小さな雪だるまのチャーム", rate: 0.05, desc: "クリスマス（12/1〜12/25）限定ドロップ。境内にちょこんと現れた雪だるま", minCommunityTier: 0, seasonal: "christmas" },
    { key: "choco_kakera", emoji: "🍫", name: "板チョコのかけら", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。甘い香りのする板チョコ", minCommunityTier: 0, seasonal: "valentine" },
    { key: "akai_ito", emoji: "🧵", name: "運命の赤い糸", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。良縁を結ぶと言われる赤い糸", minCommunityTier: 0, seasonal: "valentine" },
    { key: "love_letter", emoji: "💌", name: "秘密のラブレター", rate: 0.05, desc: "バレンタイン（2/1〜2/14）限定ドロップ。誰かの想いが込められた手紙", minCommunityTier: 0, seasonal: "valentine" },
    { key: "joya_kane_hibiki", emoji: "🔔", name: "除夜の鐘の残響", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。夜空に響いた鐘の音の余韻", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "toshikoshi_soba", emoji: "🍜", name: "年越しそば", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。細く長く…健康長寿を願う一杯", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "susuharai_houki", emoji: "🧹", name: "煤払いの箒", rate: 0.05, desc: "年末（12/26〜12/31）限定ドロップ。一年の汚れを払う大掃除の箒", minCommunityTier: 0, seasonal: "nenmatsu" },
    { key: "hanami_dango", emoji: "🍡", name: "お花見団子", rate: 0.05, desc: "お花見（4月）限定ドロップ。「使う」と次の1回の単発おみくじだけ大吉運が少しアップする", minCommunityTier: 0, seasonal: "hanami" },
    { key: "sakura_hanabira", emoji: "🌸", name: "桜の花びら", rate: 0.05, desc: "お花見（4月）限定ドロップ。舞い落ちてきた一片の桜の花びら", minCommunityTier: 0, seasonal: "hanami" },
    { key: "hanami_bento", emoji: "🍱", name: "お花見弁当", rate: 0.05, desc: "お花見（4月）限定ドロップ。桜の下で広げたくなる特製弁当", minCommunityTier: 0, seasonal: "hanami" },
    { key: "fuku_mame", emoji: "🫘", name: "福豆", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。厄除けにまいた炒り豆", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "oni_no_tsuno", emoji: "👹", name: "鬼の角のかけら", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。退治した鬼が落としていった角のかけら", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "hiiragi_iwashi", emoji: "🐟", name: "柊鰯（ひいらぎいわし）", rate: 0.05, desc: "節分（2/1〜2/3）限定ドロップ。魔除けとして戸口に飾る柊鰯", minCommunityTier: 0, seasonal: "setsubun" },
    { key: "wakaba_shinme", emoji: "🌱", name: "若葉の新芽", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。花が咲く前にそっと顔を出した新芽", minCommunityTier: 0, seasonal: "haru" },
    { key: "haru_no_tsubomi", emoji: "🌷", name: "春の蕾（つぼみ）", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。開花を待つ小さな蕾", minCommunityTier: 0, seasonal: "haru" },
    { key: "harukaze_no_ha", emoji: "🍃", name: "春風にそよぐ葉", rate: 0.05, desc: "春の芽吹き（3月）限定ドロップ。暖かな春風にそよぐ若い葉っぱ", minCommunityTier: 0, seasonal: "haru" },
    { key: "koinobori_uroko", emoji: "🐠", name: "鯉のぼりの鱗（うろこ）", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。空を泳ぐ鯉のぼりから舞い落ちた鱗", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "kabuto_kazari", emoji: "🛡️", name: "兜飾りの小柄", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。健やかな成長を願う兜飾りの小さな部品", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "shobu_no_ha", emoji: "🌿", name: "菖蒲の葉", rate: 0.05, desc: "こどもの日（5/1〜5/5）限定ドロップ。邪気を払うとされる菖蒲の葉", minCommunityTier: 0, seasonal: "kodomonohi" },
    { key: "chinowa_kaya", emoji: "🌾", name: "茅の輪の茅（かや）", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。茅の輪をくぐった際に舞った茅（かや）の葉", minCommunityTier: 0, seasonal: "nagoshi" },
    { key: "minazuki_gashi", emoji: "🍧", name: "水無月（和菓子）", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。厄除けに食べる、氷を模した和菓子「水無月」", minCommunityTier: 0, seasonal: "nagoshi" },
    { key: "oharai_no_gohei", emoji: "📿", name: "お祓いの御幣", rate: 0.05, desc: "夏越の大祓（6/25〜6/30）限定ドロップ。穢れを祓う御幣（ごへい）の切れ端", minCommunityTier: 0, seasonal: "nagoshi" },
    { key: "obake_kitsune_omen", emoji: "🦊", name: "化け狐のお面", rate: 0.05, desc: "ハロウィン（10/25〜10/31）限定ドロップ。妖しく笑うお面", minCommunityTier: 0, seasonal: "halloween" },
    { key: "chochin_hi", emoji: "🏮", name: "提灯お化けの灯", rate: 0.05, desc: "ハロウィン（10/25〜10/31）限定ドロップ。ゆらゆら揺れる不思議な灯", minCommunityTier: 0, seasonal: "halloween" },
    { key: "yokai_emaki", emoji: "📜", name: "妖怪絵巻のかけら", rate: 0.05, desc: "ハロウィン（10/25〜10/31）限定ドロップ。古い妖怪絵巻の切れ端", minCommunityTier: 0, seasonal: "halloween" }
];

// 🎐🌕🍁 一年を通して、季節イベントごとの代表アイテムを1つずつ集めきると贈られる「年間コンボ」報酬
// （毎年1回まで達成でき、年が変わると自動的にリセットされて再挑戦できる）
const YEARLY_COMBO_ITEMS = [
    { seasonal: "tanabata", itemKey: "orihime_thread" },
    { seasonal: "natsumatsuri", itemKey: "hanabi_tama" },
    { seasonal: "otsukimi", itemKey: "tsukimi_dango" },
    { seasonal: "koyo", itemKey: "momiji_shiori" },
    { seasonal: "oshogatsu", itemKey: "hatsuyume_fuji" },
    { seasonal: "kannazuki", itemKey: "kagura_suzu" },
    { seasonal: "shichigosan", itemKey: "chitose_fukuro" },
    { seasonal: "christmas", itemKey: "seiya_candle" },
    { seasonal: "valentine", itemKey: "akai_ito" },
    { seasonal: "nenmatsu", itemKey: "joya_kane_hibiki" },
    { seasonal: "hanami", itemKey: "sakura_hanabira" },
    { seasonal: "setsubun", itemKey: "fuku_mame" },
    { seasonal: "haru", itemKey: "haru_no_tsubomi" },
    { seasonal: "kodomonohi", itemKey: "koinobori_uroko" },
    { seasonal: "nagoshi", itemKey: "chinowa_kaya" }
];
const YEARLY_COMBO_PRIZE = 100000000; // 🎐 年間コンボ達成のご褒美（1億円！毎年1回まで）

// 🏺 おみくじの壺のランクアップ（永続的に大吉ボーナスが増える・所持金で購入）
const URN_LEVELS = [
    { level: 0, name: "普通の壺", cost: 0, bonus: 0 },
    { level: 1, name: "上質な壺", cost: 20000, bonus: 0.005 },
    { level: 2, name: "銀の壺", cost: 40000, bonus: 0.01 },
    { level: 3, name: "金の壺", cost: 80000, bonus: 0.015 },
    { level: 4, name: "神代の壺", cost: 150000, bonus: 0.02 },
    { level: 5, name: "伝説の壺", cost: 300000, bonus: 0.03 }
];

// 🐱 相棒「招き猫」の成長段階（ショップの効果アイテムを購入するたびに経験値(companionExp)が+1され、育っていく）
const COMPANION_LEVELS = [
    { level: 0, name: "小さな招き猫", emoji: "🐱", threshold: 0, bonus: 0, desc: "まだ小さくてあどけない招き猫。これから一緒に育っていく。" },
    { level: 1, name: "元気な招き猫", emoji: "😺", threshold: 10, bonus: 0, desc: "少し貫禄が出てきた。効果アイテムの扱いにも慣れてきた様子。" },
    { level: 2, name: "頼れる招き猫", emoji: "😸", threshold: 25, bonus: 0, desc: "堂々とした佇まいになり、参拝者からも一目置かれる存在に。" },
    { level: 3, name: "貫禄の招き猫", emoji: "🐈", threshold: 50, bonus: 0.01, desc: "貫禄十分。そばにいるだけで大吉運を少しだけ後押ししてくれる。" },
    { level: 4, name: "黄金招き猫", emoji: "🐈‍⬛", threshold: 100, bonus: 0.03, desc: "全身が黄金に輝く伝説級の招き猫。大吉運を大きく後押ししてくれる。" }
];

// 🐍🦊 賽銭箱（貯金）の資金で新たに迎えられる相棒たち。招き猫と違い、一度迎えると永久にその効果が発動し続ける
// 招き猫（大吉ボーナス）とは異なる種類の恒久ボーナスにして、効果が偏りすぎないようにしている
const COMPANION_FRIENDS = [
    { key: "shirohebi", emoji: "🐍", name: "白蛇の相棒", cost: 200000, prizeBonus: 0.05, desc: "賽銭箱の資金で迎える白蛇。迎えた後は獲得賞金が常時+5%される。" },
    { key: "kitsune", emoji: "🦊", name: "狐の相棒", cost: 400000, taxCut: 0.10, desc: "賽銭箱の資金で迎える狐。迎えた後は「神の試練」等の没収額が常時1割軽減される。" }
];

// 🗺️ 境内マップ（所持金を使って1マスずつ買い進め、少しずつ神社の境内図を完成させていく大型の金策先）
// 順番に購入するしかない（マップの端から埋まっていくイメージ）。金額は後半になるほど跳ね上がる
const MAP_TILES = [
    { key: "torii", emoji: "⛩️", name: "鳥居", cost: 3000, desc: "境内の入り口に立つ鳥居" },
    { key: "sandou", emoji: "🪨", name: "参道の敷石", cost: 5000, desc: "鳥居から続く石畳の参道" },
    { key: "komainu_a", emoji: "🐕", name: "狛犬（阿形）", cost: 8000, desc: "参道を守る狛犬（口を開けた阿形）" },
    { key: "komainu_b", emoji: "🐕‍🦺", name: "狛犬（吽形）", cost: 12000, desc: "参道を守る狛犬（口を閉じた吽形）" },
    { key: "chozuya", emoji: "💧", name: "手水舎", cost: 18000, desc: "参拝前に手と口を清める手水舎" },
    { key: "lantern_a", emoji: "🏮", name: "石灯籠（東）", cost: 25000, desc: "参道を照らす石灯籠" },
    { key: "lantern_b", emoji: "🏮", name: "石灯籠（西）", cost: 32000, desc: "参道を照らすもう一つの石灯籠" },
    { key: "sacred_tree", emoji: "🌳", name: "御神木", cost: 42000, desc: "境内にそびえる大きな御神木" },
    { key: "ema", emoji: "🪧", name: "絵馬掛け", cost: 55000, desc: "願いごとを書いた絵馬が並ぶ場所" },
    { key: "omikuji_stand", emoji: "🎋", name: "おみくじ結び所", cost: 70000, desc: "引いたおみくじを結ぶための場所" },
    { key: "bridge", emoji: "🌉", name: "太鼓橋", cost: 90000, desc: "境内の池にかかる小さな太鼓橋" },
    { key: "koi_pond", emoji: "🎏", name: "鯉の泳ぐ池", cost: 115000, desc: "色とりどりの鯉が泳ぐ池" },
    { key: "drum_tower", emoji: "🥁", name: "太鼓楼", cost: 145000, desc: "祭礼で太鼓が打ち鳴らされる太鼓楼" },
    { key: "miko", emoji: "👘", name: "巫女舞の舞台", cost: 180000, desc: "神楽や巫女舞が奉納される舞台" },
    { key: "stalls", emoji: "🏯", name: "縁日の屋台通り", cost: 220000, desc: "祭りの日ににぎわう屋台通り" },
    { key: "haiden", emoji: "🛕", name: "拝殿", cost: 270000, desc: "参拝者がお参りをする拝殿" },
    { key: "honden", emoji: "🏛️", name: "本殿", cost: 330000, desc: "御神体が祀られる神聖な本殿" },
    { key: "treasure_hall", emoji: "🏺", name: "宝物殿", cost: 400000, desc: "神社に伝わる宝物を収めた宝物殿" },
    { key: "starry_sky", emoji: "🌌", name: "夜空と星々", cost: 500000, desc: "境内を包む満天の星空" },
    { key: "golden_shrine", emoji: "✨", name: "黄金の御社", cost: 650000, desc: "すべてが完成した証、黄金に輝く御社" }
];

// 🗺️ 境内マップの節目（マス数）で贈られる祝儀。フルコンプリートで永続の大吉ボーナスも付与される
const MAP_MILESTONES = [
    { count: 5, prize: 15000 },
    { count: 10, prize: 40000 },
    { count: 15, prize: 90000 },
    { count: 20, prize: 300000 }
];
const SHRINE_MAP_COMPLETE_BONUS = 0.01; // 境内マップ完成後、永続的に大吉ボーナス+1%

// 🗾 全国神社巡りマップ（境内マップ完成後に解放される第2段階）
// 日本地図風のマス目（row=北→南、col=西→東のおおよその位置）に47都道府県を配置し、
// 各都道府県ごとに2〜3個の神社を用意。どの神社からでも自由な順番で購入できる（コンプリート型の金策先）
const JAPAN_PREFECTURES = [
    {
        key: "hokkaido", name: "北海道", row: 1, col: 8,
        shrines: [
            { key: "hokkaido_s1", emoji: "🦌", name: "北海道神宮", cost: 50000 },
            { key: "hokkaido_s2", emoji: "🏯", name: "北海道護國神社", cost: 80000 },
        ]
    },
    {
        key: "aomori", name: "青森県", row: 2, col: 8,
        shrines: [
            { key: "aomori_s1", emoji: "🍎", name: "岩木山神社", cost: 60000 },
            { key: "aomori_s2", emoji: "⛩️", name: "善知鳥神社", cost: 90000 },
        ]
    },
    {
        key: "iwate", name: "岩手県", row: 3, col: 9,
        shrines: [
            { key: "iwate_s1", emoji: "🐎", name: "盛岡八幡宮", cost: 60000 },
            { key: "iwate_s2", emoji: "⛩️", name: "駒形神社", cost: 95000 },
        ]
    },
    {
        key: "miyagi", name: "宮城県", row: 4, col: 9,
        shrines: [
            { key: "miyagi_s1", emoji: "🌾", name: "大崎八幡宮", cost: 70000 },
            { key: "miyagi_s2", emoji: "⛩️", name: "鹽竈神社", cost: 105000 },
        ]
    },
    {
        key: "akita", name: "秋田県", row: 3, col: 7,
        shrines: [
            { key: "akita_s1", emoji: "🐕", name: "太平山三吉神社", cost: 75000 },
            { key: "akita_s2", emoji: "⛩️", name: "秋田縣護國神社", cost: 115000 },
        ]
    },
    {
        key: "yamagata", name: "山形県", row: 4, col: 7,
        shrines: [
            { key: "yamagata_s1", emoji: "🍒", name: "出羽三山神社", cost: 80000 },
            { key: "yamagata_s2", emoji: "⛩️", name: "鳥海山大物忌神社", cost: 125000 },
        ]
    },
    {
        key: "fukushima", name: "福島県", row: 5, col: 9,
        shrines: [
            { key: "fukushima_s1", emoji: "🍑", name: "開成山大神宮", cost: 90000 },
            { key: "fukushima_s2", emoji: "⛩️", name: "馬場都々古別神社", cost: 135000 },
        ]
    },
    {
        key: "ibaraki", name: "茨城県", row: 6, col: 10,
        shrines: [
            { key: "ibaraki_s1", emoji: "⚔️", name: "鹿島神宮", cost: 100000 },
            { key: "ibaraki_s2", emoji: "⛩️", name: "笠間稲荷神社", cost: 150000 },
        ]
    },
    {
        key: "tochigi", name: "栃木県", row: 6, col: 9,
        shrines: [
            { key: "tochigi_s1", emoji: "🐒", name: "日光東照宮", cost: 105000 },
            { key: "tochigi_s2", emoji: "⛩️", name: "日光二荒山神社", cost: 165000 },
        ]
    },
    {
        key: "gunma", name: "群馬県", row: 6, col: 8,
        shrines: [
            { key: "gunma_s1", emoji: "♨️", name: "一之宮貫前神社", cost: 115000 },
            { key: "gunma_s2", emoji: "⛩️", name: "赤城神社", cost: 180000 },
        ]
    },
    {
        key: "saitama", name: "埼玉県", row: 7, col: 9,
        shrines: [
            { key: "saitama_s1", emoji: "🏯", name: "氷川神社", cost: 125000 },
            { key: "saitama_s2", emoji: "⛩️", name: "秩父神社", cost: 195000 },
        ]
    },
    {
        key: "chiba", name: "千葉県", row: 7, col: 10,
        shrines: [
            { key: "chiba_s1", emoji: "✈️", name: "香取神宮", cost: 145000 },
            { key: "chiba_s2", emoji: "⛩️", name: "玉前神社", cost: 220000 },
        ]
    },
    {
        key: "tokyo", name: "東京都", row: 8, col: 9,
        shrines: [
            { key: "tokyo_s1", emoji: "🗼", name: "明治神宮", cost: 130000 },
            { key: "tokyo_s2", emoji: "⛩️", name: "神田明神", cost: 205000 },
            { key: "tokyo_s3", emoji: "🦊", name: "東京大神宮", cost: 310000 },
        ]
    },
    {
        key: "kanagawa", name: "神奈川県", row: 9, col: 9,
        shrines: [
            { key: "kanagawa_s1", emoji: "⛵", name: "鶴岡八幡宮", cost: 145000 },
            { key: "kanagawa_s2", emoji: "⛩️", name: "寒川神社", cost: 220000 },
            { key: "kanagawa_s3", emoji: "🏔️", name: "箱根神社", cost: 340000 },
        ]
    },
    {
        key: "niigata", name: "新潟県", row: 5, col: 7,
        shrines: [
            { key: "niigata_s1", emoji: "🍶", name: "彌彦神社", cost: 180000 },
            { key: "niigata_s2", emoji: "⛩️", name: "白山神社", cost: 280000 },
        ]
    },
    {
        key: "toyama", name: "富山県", row: 6, col: 5,
        shrines: [
            { key: "toyama_s1", emoji: "🏔️", name: "高瀬神社", cost: 200000 },
            { key: "toyama_s2", emoji: "⛩️", name: "雄山神社", cost: 310000 },
        ]
    },
    {
        key: "ishikawa", name: "石川県", row: 5, col: 4,
        shrines: [
            { key: "ishikawa_s1", emoji: "🥇", name: "尾山神社", cost: 220000 },
            { key: "ishikawa_s2", emoji: "⛩️", name: "気多大社", cost: 340000 },
        ]
    },
    {
        key: "fukui", name: "福井県", row: 6, col: 4,
        shrines: [
            { key: "fukui_s1", emoji: "🦕", name: "氣比神宮", cost: 240000 },
            { key: "fukui_s2", emoji: "⛩️", name: "劔神社", cost: 370000 },
        ]
    },
    {
        key: "yamanashi", name: "山梨県", row: 7, col: 8,
        shrines: [
            { key: "yamanashi_s1", emoji: "🗻", name: "北口本宮冨士浅間神社", cost: 260000 },
            { key: "yamanashi_s2", emoji: "⛩️", name: "武田神社", cost: 400000 },
        ]
    },
    {
        key: "nagano", name: "長野県", row: 6, col: 7,
        shrines: [
            { key: "nagano_s1", emoji: "🍎", name: "諏訪大社", cost: 285000 },
            { key: "nagano_s2", emoji: "⛩️", name: "戸隠神社", cost: 440000 },
        ]
    },
    {
        key: "gifu", name: "岐阜県", row: 7, col: 6,
        shrines: [
            { key: "gifu_s1", emoji: "🦆", name: "南宮大社", cost: 310000 },
            { key: "gifu_s2", emoji: "⛩️", name: "飛騨一宮水無神社", cost: 480000 },
        ]
    },
    {
        key: "shizuoka", name: "静岡県", row: 8, col: 7,
        shrines: [
            { key: "shizuoka_s1", emoji: "🍵", name: "富士山本宮浅間大社", cost: 345000 },
            { key: "shizuoka_s2", emoji: "⛩️", name: "三嶋大社", cost: 530000 },
        ]
    },
    {
        key: "aichi", name: "愛知県", row: 8, col: 6,
        shrines: [
            { key: "aichi_s1", emoji: "⚔️", name: "熱田神宮", cost: 375000 },
            { key: "aichi_s2", emoji: "⛩️", name: "真清田神社", cost: 580000 },
        ]
    },
    {
        key: "mie", name: "三重県", row: 9, col: 6,
        shrines: [
            { key: "mie_s1", emoji: "🦞", name: "伊勢神宮（内宮）", cost: 345000 },
            { key: "mie_s2", emoji: "⛩️", name: "伊勢神宮（外宮）", cost: 540000 },
            { key: "mie_s3", emoji: "⚔️", name: "椿大神社", cost: 820000 },
        ]
    },
    {
        key: "shiga", name: "滋賀県", row: 8, col: 5,
        shrines: [
            { key: "shiga_s1", emoji: "🐒", name: "日吉大社", cost: 450000 },
            { key: "shiga_s2", emoji: "⛩️", name: "多賀大社", cost: 690000 },
        ]
    },
    {
        key: "kyoto", name: "京都府", row: 8, col: 4,
        shrines: [
            { key: "kyoto_s1", emoji: "🦊", name: "伏見稲荷大社", cost: 420000 },
            { key: "kyoto_s2", emoji: "⛩️", name: "八坂神社", cost: 650000 },
            { key: "kyoto_s3", emoji: "🐉", name: "貴船神社", cost: 990000 },
        ]
    },
    {
        key: "osaka", name: "大阪府", row: 9, col: 4,
        shrines: [
            { key: "osaka_s1", emoji: "🐙", name: "住吉大社", cost: 455000 },
            { key: "osaka_s2", emoji: "⛩️", name: "大阪天満宮", cost: 710000 },
            { key: "osaka_s3", emoji: "🌸", name: "枚岡神社", cost: 1080000 },
        ]
    },
    {
        key: "hyogo", name: "兵庫県", row: 8, col: 3,
        shrines: [
            { key: "hyogo_s1", emoji: "🐄", name: "廣田神社", cost: 590000 },
            { key: "hyogo_s2", emoji: "⛩️", name: "生田神社", cost: 910000 },
        ]
    },
    {
        key: "nara", name: "奈良県", row: 9, col: 5,
        shrines: [
            { key: "nara_s1", emoji: "🦌", name: "春日大社", cost: 540000 },
            { key: "nara_s2", emoji: "⛩️", name: "大神神社", cost: 840000 },
            { key: "nara_s3", emoji: "🌸", name: "石上神宮", cost: 1290000 },
        ]
    },
    {
        key: "wakayama", name: "和歌山県", row: 10, col: 4,
        shrines: [
            { key: "wakayama_s1", emoji: "🍊", name: "熊野本宮大社", cost: 720000 },
            { key: "wakayama_s2", emoji: "⛩️", name: "熊野速玉大社", cost: 1100000 },
        ]
    },
    {
        key: "tottori", name: "鳥取県", row: 9, col: 3,
        shrines: [
            { key: "tottori_s1", emoji: "🐫", name: "宇倍神社", cost: 780000 },
            { key: "tottori_s2", emoji: "⛩️", name: "倭文神社", cost: 1200000 },
        ]
    },
    {
        key: "shimane", name: "島根県", row: 10, col: 3,
        shrines: [
            { key: "shimane_s1", emoji: "💑", name: "出雲大社", cost: 720000 },
            { key: "shimane_s2", emoji: "⛩️", name: "須佐神社", cost: 1100000 },
            { key: "shimane_s3", emoji: "🌸", name: "美保神社", cost: 1690000 },
        ]
    },
    {
        key: "okayama", name: "岡山県", row: 9, col: 2,
        shrines: [
            { key: "okayama_s1", emoji: "🍑", name: "吉備津神社", cost: 910000 },
            { key: "okayama_s2", emoji: "⛩️", name: "石上布都魂神社", cost: 1400000 },
        ]
    },
    {
        key: "hiroshima", name: "広島県", row: 10, col: 2,
        shrines: [
            { key: "hiroshima_s1", emoji: "⛩️", name: "厳島神社", cost: 850000 },
            { key: "hiroshima_s2", emoji: "🌸", name: "饒津神社", cost: 1320000 },
            { key: "hiroshima_s3", emoji: "⚔️", name: "素盞嗚神社", cost: 2020000 },
        ]
    },
    {
        key: "yamaguchi", name: "山口県", row: 11, col: 2,
        shrines: [
            { key: "yamaguchi_s1", emoji: "🐡", name: "住吉神社", cost: 1100000 },
            { key: "yamaguchi_s2", emoji: "⛩️", name: "赤間神宮", cost: 1700000 },
        ]
    },
    {
        key: "tokushima", name: "徳島県", row: 11, col: 5,
        shrines: [
            { key: "tokushima_s1", emoji: "🌪️", name: "大麻比古神社", cost: 1200000 },
            { key: "tokushima_s2", emoji: "⛩️", name: "阿波井神社", cost: 1850000 },
        ]
    },
    {
        key: "kagawa", name: "香川県", row: 10, col: 5,
        shrines: [
            { key: "kagawa_s1", emoji: "🍜", name: "金刀比羅宮", cost: 1330000 },
            { key: "kagawa_s2", emoji: "⛩️", name: "田村神社", cost: 2050000 },
        ]
    },
    {
        key: "ehime", name: "愛媛県", row: 11, col: 4,
        shrines: [
            { key: "ehime_s1", emoji: "🍊", name: "大山祇神社", cost: 1240000 },
            { key: "ehime_s2", emoji: "⛩️", name: "伊佐爾波神社", cost: 1910000 },
            { key: "ehime_s3", emoji: "♨️", name: "石鎚神社", cost: 2920000 },
        ]
    },
    {
        key: "kochi", name: "高知県", row: 12, col: 4,
        shrines: [
            { key: "kochi_s1", emoji: "🐟", name: "土佐神社", cost: 1590000 },
            { key: "kochi_s2", emoji: "⛩️", name: "潮江天満宮", cost: 2450000 },
        ]
    },
    {
        key: "fukuoka", name: "福岡県", row: 12, col: 2,
        shrines: [
            { key: "fukuoka_s1", emoji: "📚", name: "太宰府天満宮", cost: 1460000 },
            { key: "fukuoka_s2", emoji: "⛩️", name: "宗像大社", cost: 2250000 },
            { key: "fukuoka_s3", emoji: "🌊", name: "筥崎宮", cost: 3440000 },
        ]
    },
    {
        key: "saga", name: "佐賀県", row: 13, col: 1,
        shrines: [
            { key: "saga_s1", emoji: "🏺", name: "佐嘉神社", cost: 1880000 },
            { key: "saga_s2", emoji: "⛩️", name: "祐徳稲荷神社", cost: 2900000 },
        ]
    },
    {
        key: "nagasaki", name: "長崎県", row: 14, col: 1,
        shrines: [
            { key: "nagasaki_s1", emoji: "🐳", name: "諏訪神社", cost: 2080000 },
            { key: "nagasaki_s2", emoji: "⛩️", name: "亀山八幡宮", cost: 3200000 },
        ]
    },
    {
        key: "kumamoto", name: "熊本県", row: 13, col: 2,
        shrines: [
            { key: "kumamoto_s1", emoji: "🌋", name: "阿蘇神社", cost: 1930000 },
            { key: "kumamoto_s2", emoji: "⛩️", name: "藤崎八旛宮", cost: 2980000 },
            { key: "kumamoto_s3", emoji: "⚔️", name: "加藤神社", cost: 4550000 },
        ]
    },
    {
        key: "oita", name: "大分県", row: 12, col: 3,
        shrines: [
            { key: "oita_s1", emoji: "♨️", name: "宇佐神宮", cost: 2470000 },
            { key: "oita_s2", emoji: "⛩️", name: "柞原八幡宮", cost: 3800000 },
        ]
    },
    {
        key: "miyazaki", name: "宮崎県", row: 14, col: 3,
        shrines: [
            { key: "miyazaki_s1", emoji: "🐉", name: "高千穂神社", cost: 2730000 },
            { key: "miyazaki_s2", emoji: "⛩️", name: "宮崎神宮", cost: 4200000 },
        ]
    },
    {
        key: "kagoshima", name: "鹿児島県", row: 15, col: 2,
        shrines: [
            { key: "kagoshima_s1", emoji: "🌋", name: "鹿児島神宮", cost: 2500000 },
            { key: "kagoshima_s2", emoji: "⛩️", name: "霧島神宮", cost: 3870000 },
            { key: "kagoshima_s3", emoji: "⚔️", name: "照國神社", cost: 5920000 },
        ]
    },
    {
        key: "okinawa", name: "沖縄県", row: 17, col: 1,
        shrines: [
            { key: "okinawa_s1", emoji: "🌺", name: "波上宮", cost: 3250000 },
            { key: "okinawa_s2", emoji: "⛩️", name: "首里観音堂", cost: 5000000 },
        ]
    },
];

// 🗾 全国神社巡りマップの全神社数（106社）を数えるためのヘルパー
const JAPAN_SHRINE_COUNT = JAPAN_PREFECTURES.reduce((sum, p) => sum + p.shrines.length, 0);

// 🗾 全国神社巡りマップの節目（コンプリートした神社の数）で贈られる祝儀
const MAP_JAPAN_MILESTONES = [
    { count: 25, prize: 300000 },
    { count: 50, prize: 900000 },
    { count: 75, prize: 2200000 },
    { count: JAPAN_SHRINE_COUNT, prize: 8000000 }
];
const SHRINE_MAP_JAPAN_COMPLETE_BONUS = 0.02; // 全国制覇後、さらに永続的に大吉ボーナス+2%（境内マップ分と合算で+3%）

// 🔨 神社を少しずつ組み立てていくための共通パーツ（全国どの神社にも同じ4パーツを使い回し、神社ごとの金額を配分する）
const SHRINE_BUILD_PARTS = [
    { key: "torii", emoji: "⛩️", name: "鳥居", weight: 0.15 },
    { key: "sando", emoji: "🪨", name: "参道", weight: 0.15 },
    { key: "chozuya", emoji: "💧", name: "手水舎", weight: 0.2 },
    { key: "haiden", emoji: "🛕", name: "社殿", weight: 0.5 }
];

// 🏯 全国神社巡りマップ・第二弾「奥宮・摂社」の深掘りパーツ。
// すでに完成した神社だけが対象で、元の社殿よりさらに格上の建立になる（同じ4パーツ制の仕組みを流用）
const OKUMIYA_BUILD_PARTS = [
    { key: "sekitoro", emoji: "🏮", name: "石灯籠", weight: 0.15 },
    { key: "shinboku", emoji: "🌳", name: "御神木", weight: 0.15 },
    { key: "kaguraden", emoji: "🎐", name: "神楽殿", weight: 0.3 },
    { key: "okumiya", emoji: "🏯", name: "奥宮", weight: 0.4 }
];

// 🏯 奥宮の建立総額は、元の神社の建立総額の1.5倍を目安にする（深掘りコンテンツとして高額な金策先にする）
const OKUMIYA_COST_MULTIPLIER = 1.5;

// 🏯 奥宮巡りの節目（完成した奥宮の数）で贈られる祝儀。元の全国神社巡りより高額に設定
const MAP_OKUMIYA_MILESTONES = [
    { count: 25, prize: 500000 },
    { count: 50, prize: 1500000 },
    { count: 75, prize: 4000000 },
    { count: JAPAN_SHRINE_COUNT, prize: 15000000 }
];
const SHRINE_MAP_OKUMIYA_COMPLETE_BONUS = 0.01; // 奥宮を全国すべて完成後、さらに永続的に大吉ボーナス+1%

// 🌄 全国神社巡りマップ・第三弾「パワースポット編」。神社に限らず、日本各地の自然の名所を巡る（全国神社巡り完成後に解放）
// 47都道府県×2箇所（計94箇所）。row/colはJAPAN_PREFECTURESと同じ位置関係を使う
const POWER_SPOT_PREFECTURES = [
    {
        key: "hokkaido", name: "北海道", row: 1, col: 8,
        spots: [
            { key: "hokkaido_p1", emoji: "🌊", name: "摩周湖", cost: 85000 },
            { key: "hokkaido_p2", emoji: "🏔️", name: "大雪山", cost: 135000 },
        ]
    },
    {
        key: "aomori", name: "青森県", row: 2, col: 8,
        spots: [
            { key: "aomori_p1", emoji: "🍁", name: "奥入瀬渓流", cost: 100000 },
            { key: "aomori_p2", emoji: "⛰️", name: "恐山", cost: 155000 },
        ]
    },
    {
        key: "iwate", name: "岩手県", row: 3, col: 9,
        spots: [
            { key: "iwate_p1", emoji: "🕳️", name: "龍泉洞", cost: 100000 },
            { key: "iwate_p2", emoji: "🏔️", name: "早池峰山", cost: 160000 },
        ]
    },
    {
        key: "miyagi", name: "宮城県", row: 4, col: 9,
        spots: [
            { key: "miyagi_p1", emoji: "🍂", name: "鳴子峡", cost: 115000 },
            { key: "miyagi_p2", emoji: "🌊", name: "松島", cost: 180000 },
        ]
    },
    {
        key: "akita", name: "秋田県", row: 3, col: 7,
        spots: [
            { key: "akita_p1", emoji: "💧", name: "田沢湖", cost: 125000 },
            { key: "akita_p2", emoji: "🌊", name: "男鹿半島", cost: 200000 },
        ]
    },
    {
        key: "yamagata", name: "山形県", row: 4, col: 7,
        spots: [
            { key: "yamagata_p1", emoji: "❄️", name: "蔵王のお釜", cost: 135000 },
            { key: "yamagata_p2", emoji: "⛰️", name: "月山", cost: 215000 },
        ]
    },
    {
        key: "fukushima", name: "福島県", row: 5, col: 9,
        spots: [
            { key: "fukushima_p1", emoji: "🎨", name: "五色沼", cost: 145000 },
            { key: "fukushima_p2", emoji: "🌋", name: "磐梯山", cost: 235000 },
        ]
    },
    {
        key: "ibaraki", name: "茨城県", row: 6, col: 10,
        spots: [
            { key: "ibaraki_p1", emoji: "💦", name: "袋田の滝", cost: 160000 },
            { key: "ibaraki_p2", emoji: "⛰️", name: "筑波山", cost: 260000 },
        ]
    },
    {
        key: "tochigi", name: "栃木県", row: 6, col: 9,
        spots: [
            { key: "tochigi_p1", emoji: "💦", name: "華厳の滝", cost: 175000 },
            { key: "tochigi_p2", emoji: "💧", name: "中禅寺湖", cost: 280000 },
        ]
    },
    {
        key: "gunma", name: "群馬県", row: 6, col: 8,
        spots: [
            { key: "gunma_p1", emoji: "🌾", name: "尾瀬ヶ原", cost: 190000 },
            { key: "gunma_p2", emoji: "🏔️", name: "谷川岳", cost: 305000 },
        ]
    },
    {
        key: "saitama", name: "埼玉県", row: 7, col: 9,
        spots: [
            { key: "saitama_p1", emoji: "🪨", name: "長瀞岩畳", cost: 210000 },
            { key: "saitama_p2", emoji: "⛰️", name: "武甲山", cost: 335000 },
        ]
    },
    {
        key: "chiba", name: "千葉県", row: 7, col: 10,
        spots: [
            { key: "chiba_p1", emoji: "🏝️", name: "屏風ヶ浦", cost: 235000 },
            { key: "chiba_p2", emoji: "🕳️", name: "濃溝の滝", cost: 380000 },
        ]
    },
    {
        key: "tokyo", name: "東京都", row: 8, col: 9,
        spots: [
            { key: "tokyo_p1", emoji: "🌲", name: "高尾山", cost: 280000 },
            { key: "tokyo_p2", emoji: "🌊", name: "小笠原の海", cost: 445000 },
        ]
    },
    {
        key: "kanagawa", name: "神奈川県", row: 9, col: 9,
        spots: [
            { key: "kanagawa_p1", emoji: "🏝️", name: "江の島", cost: 305000 },
            { key: "kanagawa_p2", emoji: "♨️", name: "大涌谷", cost: 490000 },
        ]
    },
    {
        key: "niigata", name: "新潟県", row: 5, col: 7,
        spots: [
            { key: "niigata_p1", emoji: "🌊", name: "佐渡島の海岸", cost: 300000 },
            { key: "niigata_p2", emoji: "🏞️", name: "清津峡", cost: 480000 },
        ]
    },
    {
        key: "toyama", name: "富山県", row: 6, col: 5,
        spots: [
            { key: "toyama_p1", emoji: "🏔️", name: "黒部峡谷", cost: 330000 },
            { key: "toyama_p2", emoji: "⛰️", name: "立山", cost: 530000 },
        ]
    },
    {
        key: "ishikawa", name: "石川県", row: 5, col: 4,
        spots: [
            { key: "ishikawa_p1", emoji: "🚙", name: "千里浜なぎさドライブウェイ", cost: 365000 },
            { key: "ishikawa_p2", emoji: "⛰️", name: "白山", cost: 580000 },
        ]
    },
    {
        key: "fukui", name: "福井県", row: 6, col: 4,
        spots: [
            { key: "fukui_p1", emoji: "🪨", name: "東尋坊", cost: 395000 },
            { key: "fukui_p2", emoji: "💧", name: "三方五湖", cost: 630000 },
        ]
    },
    {
        key: "yamanashi", name: "山梨県", row: 7, col: 8,
        spots: [
            { key: "yamanashi_p1", emoji: "🗻", name: "富士山", cost: 430000 },
            { key: "yamanashi_p2", emoji: "🏞️", name: "昇仙峡", cost: 690000 },
        ]
    },
    {
        key: "nagano", name: "長野県", row: 6, col: 7,
        spots: [
            { key: "nagano_p1", emoji: "🏔️", name: "上高地", cost: 470000 },
            { key: "nagano_p2", emoji: "🏔️", name: "千畳敷カール", cost: 750000 },
        ]
    },
    {
        key: "gifu", name: "岐阜県", row: 7, col: 6,
        spots: [
            { key: "gifu_p1", emoji: "💦", name: "養老の滝", cost: 510000 },
            { key: "gifu_p2", emoji: "⛰️", name: "乗鞍岳", cost: 820000 },
        ]
    },
    {
        key: "shizuoka", name: "静岡県", row: 8, col: 7,
        spots: [
            { key: "shizuoka_p1", emoji: "🌲", name: "三保の松原", cost: 570000 },
            { key: "shizuoka_p2", emoji: "💦", name: "白糸の滝", cost: 910000 },
        ]
    },
    {
        key: "aichi", name: "愛知県", row: 8, col: 6,
        spots: [
            { key: "aichi_p1", emoji: "🍁", name: "香嵐渓", cost: 620000 },
            { key: "aichi_p2", emoji: "🌄", name: "茶臼山高原", cost: 990000 },
        ]
    },
    {
        key: "mie", name: "三重県", row: 9, col: 6,
        spots: [
            { key: "mie_p1", emoji: "🌊", name: "伊勢志摩の海", cost: 740000 },
            { key: "mie_p2", emoji: "🪨", name: "鬼ヶ城", cost: 1180000 },
        ]
    },
    {
        key: "shiga", name: "滋賀県", row: 8, col: 5,
        spots: [
            { key: "shiga_p1", emoji: "💧", name: "琵琶湖", cost: 740000 },
            { key: "shiga_p2", emoji: "⛰️", name: "伊吹山", cost: 1190000 },
        ]
    },
    {
        key: "kyoto", name: "京都府", row: 8, col: 4,
        spots: [
            { key: "kyoto_p1", emoji: "🎋", name: "嵐山の竹林", cost: 890000 },
            { key: "kyoto_p2", emoji: "🌉", name: "天橋立", cost: 1430000 },
        ]
    },
    {
        key: "osaka", name: "大阪府", row: 9, col: 4,
        spots: [
            { key: "osaka_p1", emoji: "💦", name: "箕面の滝", cost: 970000 },
            { key: "osaka_p2", emoji: "⛰️", name: "犬鳴山", cost: 1560000 },
        ]
    },
    {
        key: "hyogo", name: "兵庫県", row: 8, col: 3,
        spots: [
            { key: "hyogo_p1", emoji: "🪨", name: "玄武洞", cost: 980000 },
            { key: "hyogo_p2", emoji: "⛰️", name: "六甲山", cost: 1560000 },
        ]
    },
    {
        key: "nara", name: "奈良県", row: 9, col: 5,
        spots: [
            { key: "nara_p1", emoji: "🌸", name: "吉野山", cost: 1160000 },
            { key: "nara_p2", emoji: "🌲", name: "大台ヶ原", cost: 1850000 },
        ]
    },
    {
        key: "wakayama", name: "和歌山県", row: 10, col: 4,
        spots: [
            { key: "wakayama_p1", emoji: "💦", name: "那智の滝", cost: 1180000 },
            { key: "wakayama_p2", emoji: "🏖️", name: "白浜の海岸", cost: 1890000 },
        ]
    },
    {
        key: "tottori", name: "鳥取県", row: 9, col: 3,
        spots: [
            { key: "tottori_p1", emoji: "🏜️", name: "鳥取砂丘", cost: 1290000 },
            { key: "tottori_p2", emoji: "⛰️", name: "大山", cost: 2060000 },
        ]
    },
    {
        key: "shimane", name: "島根県", row: 10, col: 3,
        spots: [
            { key: "shimane_p1", emoji: "🏝️", name: "隠岐の島", cost: 1520000 },
            { key: "shimane_p2", emoji: "⛰️", name: "三瓶山", cost: 2430000 },
        ]
    },
    {
        key: "okayama", name: "岡山県", row: 9, col: 2,
        spots: [
            { key: "okayama_p1", emoji: "🌄", name: "蒜山高原", cost: 1500000 },
            { key: "okayama_p2", emoji: "⛰️", name: "鷲羽山", cost: 2400000 },
        ]
    },
    {
        key: "hiroshima", name: "広島県", row: 10, col: 2,
        spots: [
            { key: "hiroshima_p1", emoji: "🏞️", name: "帝釈峡", cost: 1820000 },
            { key: "hiroshima_p2", emoji: "🏞️", name: "三段峡", cost: 2910000 },
        ]
    },
    {
        key: "yamaguchi", name: "山口県", row: 11, col: 2,
        spots: [
            { key: "yamaguchi_p1", emoji: "🌾", name: "秋吉台", cost: 1820000 },
            { key: "yamaguchi_p2", emoji: "🌉", name: "角島大橋の海", cost: 2910000 },
        ]
    },
    {
        key: "tokushima", name: "徳島県", row: 11, col: 5,
        spots: [
            { key: "tokushima_p1", emoji: "🏞️", name: "大歩危・小歩危", cost: 1980000 },
            { key: "tokushima_p2", emoji: "🌀", name: "鳴門の渦潮", cost: 3170000 },
        ]
    },
    {
        key: "kagawa", name: "香川県", row: 10, col: 5,
        spots: [
            { key: "kagawa_p1", emoji: "🍁", name: "寒霞渓", cost: 2200000 },
            { key: "kagawa_p2", emoji: "🌊", name: "瀬戸内海の多島美", cost: 3520000 },
        ]
    },
    {
        key: "ehime", name: "愛媛県", row: 11, col: 4,
        spots: [
            { key: "ehime_p1", emoji: "🏞️", name: "面河渓", cost: 2630000 },
            { key: "ehime_p2", emoji: "🌉", name: "しまなみ海道の海", cost: 4210000 },
        ]
    },
    {
        key: "kochi", name: "高知県", row: 12, col: 4,
        spots: [
            { key: "kochi_p1", emoji: "💧", name: "四万十川", cost: 2630000 },
            { key: "kochi_p2", emoji: "🕳️", name: "龍河洞", cost: 4200000 },
        ]
    },
    {
        key: "fukuoka", name: "福岡県", row: 12, col: 2,
        spots: [
            { key: "fukuoka_p1", emoji: "⛰️", name: "平尾台", cost: 3100000 },
            { key: "fukuoka_p2", emoji: "🌊", name: "糸島の海", cost: 4960000 },
        ]
    },
    {
        key: "saga", name: "佐賀県", row: 13, col: 1,
        spots: [
            { key: "saga_p1", emoji: "🌲", name: "虹の松原", cost: 3110000 },
            { key: "saga_p2", emoji: "⛰️", name: "御船山", cost: 4970000 },
        ]
    },
    {
        key: "nagasaki", name: "長崎県", row: 14, col: 1,
        spots: [
            { key: "nagasaki_p1", emoji: "🏝️", name: "九十九島", cost: 3430000 },
            { key: "nagasaki_p2", emoji: "🌋", name: "雲仙岳", cost: 5490000 },
        ]
    },
    {
        key: "kumamoto", name: "熊本県", row: 13, col: 2,
        spots: [
            { key: "kumamoto_p1", emoji: "🌾", name: "阿蘇の草千里ヶ浜", cost: 4100000 },
            { key: "kumamoto_p2", emoji: "🏞️", name: "菊池渓谷", cost: 6560000 },
        ]
    },
    {
        key: "oita", name: "大分県", row: 12, col: 3,
        spots: [
            { key: "oita_p1", emoji: "♨️", name: "別府地獄めぐり", cost: 4080000 },
            { key: "oita_p2", emoji: "⛰️", name: "くじゅう連山", cost: 6520000 },
        ]
    },
    {
        key: "miyazaki", name: "宮崎県", row: 14, col: 3,
        spots: [
            { key: "miyazaki_p1", emoji: "🏞️", name: "高千穂峡", cost: 4500000 },
            { key: "miyazaki_p2", emoji: "🌊", name: "青島の鬼の洗濯板", cost: 7210000 },
        ]
    },
    {
        key: "kagoshima", name: "鹿児島県", row: 15, col: 2,
        spots: [
            { key: "kagoshima_p1", emoji: "🌋", name: "桜島", cost: 5330000 },
            { key: "kagoshima_p2", emoji: "🌲", name: "屋久島の縄文杉", cost: 8520000 },
        ]
    },
    {
        key: "okinawa", name: "沖縄県", row: 17, col: 1,
        spots: [
            { key: "okinawa_p1", emoji: "🌊", name: "青の洞窟", cost: 5360000 },
            { key: "okinawa_p2", emoji: "🏝️", name: "川平湾", cost: 8580000 },
        ]
    },
];

// 🌄 全国のパワースポット総数
const POWER_SPOT_COUNT = POWER_SPOT_PREFECTURES.reduce((sum, p) => sum + p.spots.length, 0);

// 🌄 パワースポット巡りの節目（訪れたスポットの数）で贈られる祝儀
const MAP_POWERSPOT_MILESTONES = [
    { count: 25, prize: 800000 },
    { count: 50, prize: 2500000 },
    { count: 75, prize: 6000000 },
    { count: POWER_SPOT_COUNT, prize: 20000000 }
];
const SHRINE_MAP_POWERSPOT_COMPLETE_BONUS = 0.01; // 全国のパワースポットを制覇後、さらに永続的に大吉ボーナス+1%

// 🎏 全国神社巡りマップ・第四弾「日本三大○○」ミニマップ集。パワースポット編（第三弾）完成後に進める、コンパクトな金策先
// 47都道府県まるごとではなく、有名な「日本三大○○」のテーマ8つ×3箇所＝24箇所という小規模な構成
const MINI_THEME_COLLECTIONS = [
    {
        key: "inari3", emoji: "🦊", name: "日本三大稲荷",
        spots: [
            { key: "inari3_1", emoji: "⛩️", name: "伏見稲荷大社（京都府）", cost: 500000 },
            { key: "inari3_2", emoji: "⛩️", name: "笠間稲荷神社（茨城県）", cost: 450000 },
            { key: "inari3_3", emoji: "⛩️", name: "祐徳稲荷神社（佐賀県）", cost: 550000 }
        ]
    },
    {
        key: "hachiman3", emoji: "🏹", name: "日本三大八幡宮",
        spots: [
            { key: "hachiman3_1", emoji: "⛩️", name: "宇佐神宮（大分県）", cost: 600000 },
            { key: "hachiman3_2", emoji: "⛩️", name: "石清水八幡宮（京都府）", cost: 650000 },
            { key: "hachiman3_3", emoji: "⛩️", name: "筥崎宮（福岡県）", cost: 600000 }
        ]
    },
    {
        key: "tenjin3", emoji: "📚", name: "日本三大天神",
        spots: [
            { key: "tenjin3_1", emoji: "⛩️", name: "太宰府天満宮（福岡県）", cost: 700000 },
            { key: "tenjin3_2", emoji: "⛩️", name: "北野天満宮（京都府）", cost: 750000 },
            { key: "tenjin3_3", emoji: "⛩️", name: "防府天満宮（山口県）", cost: 650000 }
        ]
    },
    {
        key: "toshogu3", emoji: "🐒", name: "日本三大東照宮",
        spots: [
            { key: "toshogu3_1", emoji: "🛕", name: "日光東照宮（栃木県）", cost: 900000 },
            { key: "toshogu3_2", emoji: "🛕", name: "久能山東照宮（静岡県）", cost: 800000 },
            { key: "toshogu3_3", emoji: "🛕", name: "上野東照宮（東京都）", cost: 850000 }
        ]
    },
    {
        key: "benten3", emoji: "🎵", name: "日本三大弁天",
        spots: [
            { key: "benten3_1", emoji: "🏝️", name: "江島神社（神奈川県）", cost: 800000 },
            { key: "benten3_2", emoji: "🏝️", name: "竹生島神社（滋賀県）", cost: 850000 },
            { key: "benten3_3", emoji: "🏝️", name: "厳島神社（広島県）", cost: 950000 }
        ]
    },
    {
        key: "sankei3", emoji: "🌅", name: "日本三景",
        spots: [
            { key: "sankei3_1", emoji: "🌊", name: "松島（宮城県）", cost: 1000000 },
            { key: "sankei3_2", emoji: "🌉", name: "天橋立（京都府）", cost: 1050000 },
            { key: "sankei3_3", emoji: "🏝️", name: "安芸の宮島（広島県）", cost: 1100000 }
        ]
    },
    {
        key: "meibaku3", emoji: "💦", name: "日本三名瀑",
        spots: [
            { key: "meibaku3_1", emoji: "💦", name: "那智の滝（和歌山県）", cost: 1100000 },
            { key: "meibaku3_2", emoji: "💦", name: "華厳の滝（栃木県）", cost: 1150000 },
            { key: "meibaku3_3", emoji: "💦", name: "袋田の滝（茨城県）", cost: 1050000 }
        ]
    },
    {
        key: "gakkari3", emoji: "😅", name: "日本三大がっかり名所",
        spots: [
            { key: "gakkari3_1", emoji: "🕰️", name: "札幌時計台（北海道）", cost: 1200000 },
            { key: "gakkari3_2", emoji: "🌉", name: "はりまや橋（高知県）", cost: 1200000 },
            { key: "gakkari3_3", emoji: "🚪", name: "守礼門（沖縄県）", cost: 1300000 }
        ]
    }
];

// 🎏 「日本三大○○」ミニマップ集の全スポット数
const MINI_THEME_SPOT_COUNT = MINI_THEME_COLLECTIONS.reduce((sum, t) => sum + t.spots.length, 0);

// 🎉 ミニマップ集の節目（訪れたスポットの数）で贈られる祝儀
const MAP_MINITHEME_MILESTONES = [
    { count: 8, prize: 3000000 },
    { count: 16, prize: 8000000 },
    { count: MINI_THEME_SPOT_COUNT, prize: 25000000 }
];
const SHRINE_MAP_MINITHEME_COMPLETE_BONUS = 0.01; // 「日本三大○○」を全制覇後、さらに永続的に大吉ボーナス+1%

// 🌍 全国神社巡りマップ・第五弾「世界の絶景・名所編」。日本三大○○（第四弾）完成後に進める、最終章のコレクション
// 世界の地域7つ×2箇所＝14箇所という構成（これまでで最も高額な金策先）
const WORLD_SPOT_REGIONS = [
    {
        key: "east_asia", emoji: "🐉", name: "東アジア",
        spots: [
            { key: "east_asia_1", emoji: "🧱", name: "万里の長城（中国）", cost: 3000000 },
            { key: "east_asia_2", emoji: "🏺", name: "兵馬俑（中国）", cost: 3200000 }
        ]
    },
    {
        key: "south_asia", emoji: "🐘", name: "東南アジア・南アジア",
        spots: [
            { key: "south_asia_1", emoji: "🛕", name: "アンコールワット（カンボジア）", cost: 3500000 },
            { key: "south_asia_2", emoji: "🕌", name: "タージ・マハル（インド）", cost: 3800000 }
        ]
    },
    {
        key: "middle_east", emoji: "🏜️", name: "中東",
        spots: [
            { key: "middle_east_1", emoji: "🔺", name: "ギザの大ピラミッド（エジプト）", cost: 5000000 },
            { key: "middle_east_2", emoji: "🏛️", name: "ペトラ遺跡（ヨルダン）", cost: 4500000 }
        ]
    },
    {
        key: "europe", emoji: "🗼", name: "ヨーロッパ",
        spots: [
            { key: "europe_1", emoji: "🗼", name: "エッフェル塔（フランス）", cost: 5500000 },
            { key: "europe_2", emoji: "🏛️", name: "コロッセオ（イタリア）", cost: 5200000 }
        ]
    },
    {
        key: "north_america", emoji: "🦅", name: "北米",
        spots: [
            { key: "north_america_1", emoji: "🏜️", name: "グランドキャニオン（アメリカ）", cost: 6000000 },
            { key: "north_america_2", emoji: "💦", name: "ナイアガラの滝（アメリカ・カナダ）", cost: 5800000 }
        ]
    },
    {
        key: "south_america", emoji: "🦙", name: "南米",
        spots: [
            { key: "south_america_1", emoji: "⛰️", name: "マチュピチュ（ペルー）", cost: 7000000 },
            { key: "south_america_2", emoji: "💦", name: "イグアスの滝（ブラジル・アルゼンチン）", cost: 6800000 }
        ]
    },
    {
        key: "oceania", emoji: "🐨", name: "オセアニア",
        spots: [
            { key: "oceania_1", emoji: "🐠", name: "グレートバリアリーフ（オーストラリア）", cost: 7500000 },
            { key: "oceania_2", emoji: "🪨", name: "エアーズロック／ウルル（オーストラリア）", cost: 7200000 }
        ]
    }
];

// 🌍 世界の絶景・名所編の全スポット数
const WORLD_SPOT_COUNT = WORLD_SPOT_REGIONS.reduce((sum, r) => sum + r.spots.length, 0);

// 🎉 世界の絶景・名所編の節目（訪れたスポットの数）で贈られる祝儀
const MAP_WORLDSPOT_MILESTONES = [
    { count: 7, prize: 20000000 },
    { count: WORLD_SPOT_COUNT, prize: 50000000 }
];
const SHRINE_MAP_WORLDSPOT_COMPLETE_BONUS = 0.01; // 世界の絶景・名所を全制覇後、さらに永続的に大吉ボーナス+1%

// ============================================================
// 🔀 第六弾：世界の絶景・名所編（第五弾）完成後に分岐する2つの道
// 「歴史編」と「神社ビルダーモード」のどちらかを先に選んで進めるが、
// 一方を完成させるともう一方も自動的に解放され、最終的には両方とも制覇できる。
// ============================================================

// 🏯 歴史編（第六弾-A）：日本の各時代を象徴する史跡を巡るコレクション
const HISTORY_ERAS = [
    {
        key: "jomon_yayoi", emoji: "🗿", name: "縄文・弥生時代",
        spots: [
            { key: "jy_1", emoji: "🪨", name: "三内丸山遺跡", cost: 8000000 },
            { key: "jy_2", emoji: "🏺", name: "吉野ヶ里遺跡", cost: 8300000 },
            { key: "jy_3", emoji: "⛰️", name: "三輪山・大神神社", cost: 8600000 }
        ]
    },
    {
        key: "asuka", emoji: "🛕", name: "飛鳥時代",
        spots: [
            { key: "asuka_1", emoji: "🏯", name: "法隆寺", cost: 9000000 },
            { key: "asuka_2", emoji: "⛩️", name: "飛鳥寺", cost: 9300000 },
            { key: "asuka_3", emoji: "🗿", name: "石舞台古墳", cost: 9600000 }
        ]
    },
    {
        key: "nara", emoji: "🦌", name: "奈良時代",
        spots: [
            { key: "nara_1", emoji: "🦌", name: "東大寺・奈良の大仏", cost: 10000000 },
            { key: "nara_2", emoji: "⛩️", name: "春日大社", cost: 10300000 },
            { key: "nara_3", emoji: "🏯", name: "平城宮跡", cost: 10600000 }
        ]
    },
    {
        key: "heian", emoji: "🎎", name: "平安時代",
        spots: [
            { key: "heian_1", emoji: "⛩️", name: "平安神宮", cost: 11000000 },
            { key: "heian_2", emoji: "🎑", name: "清水寺", cost: 11300000 },
            { key: "heian_3", emoji: "🌊", name: "厳島神社", cost: 11600000 }
        ]
    },
    {
        key: "kamakura", emoji: "⚔️", name: "鎌倉時代",
        spots: [
            { key: "kamakura_1", emoji: "🗿", name: "鎌倉大仏（高徳院）", cost: 12000000 },
            { key: "kamakura_2", emoji: "⛩️", name: "鶴岡八幡宮", cost: 12300000 },
            { key: "kamakura_3", emoji: "🏯", name: "建長寺", cost: 12600000 }
        ]
    },
    {
        key: "sengoku", emoji: "🏯", name: "室町・戦国時代",
        spots: [
            { key: "sengoku_1", emoji: "🏯", name: "金閣寺", cost: 13000000 },
            { key: "sengoku_2", emoji: "🏯", name: "姫路城", cost: 13300000 },
            { key: "sengoku_3", emoji: "⚔️", name: "岐阜城", cost: 13600000 }
        ]
    },
    {
        key: "edo", emoji: "🎏", name: "江戸時代",
        spots: [
            { key: "edo_1", emoji: "⛩️", name: "日光東照宮", cost: 14000000 },
            { key: "edo_2", emoji: "🏯", name: "江戸城（皇居東御苑）", cost: 14300000 },
            { key: "edo_3", emoji: "⛩️", name: "浅草寺・浅草神社", cost: 14600000 }
        ]
    },
    {
        key: "meiji", emoji: "🏛️", name: "明治・近代",
        spots: [
            { key: "meiji_1", emoji: "⛩️", name: "明治神宮", cost: 15000000 },
            { key: "meiji_2", emoji: "🏛️", name: "東京駅丸の内駅舎", cost: 15300000 },
            { key: "meiji_3", emoji: "🏯", name: "迎賓館赤坂離宮", cost: 15600000 }
        ]
    }
];

// 🏯 歴史編の全スポット数
const HISTORY_SPOT_COUNT = HISTORY_ERAS.reduce((sum, e) => sum + e.spots.length, 0);

// 🎉 歴史編の節目（訪れたスポットの数）で贈られる祝儀
const MAP_HISTORY_MILESTONES = [
    { count: 12, prize: 30000000 },
    { count: HISTORY_SPOT_COUNT, prize: 80000000 }
];
const SHRINE_MAP_HISTORY_COMPLETE_BONUS = 0.01; // 歴史編を全制覇後、さらに永続的に大吉ボーナス+1%

// 🏗️ 神社ビルダーモード（第六弾-B）：自分だけの神社を少しずつ建て増していく（境内マップと同じ「順番に1つずつ購入」形式）
const BUILDER_PARTS = [
    { key: "b1", emoji: "⛩️", name: "大鳥居の新調", cost: 8000000, desc: "境内の顔となる大鳥居を新しく建て直す" },
    { key: "b2", emoji: "🌳", name: "神域の植樹", cost: 8500000, desc: "境内に鎮守の森を育てる" },
    { key: "b3", emoji: "🐉", name: "手水舎の改修", cost: 9000000, desc: "龍の口から清水が流れる立派な手水舎に" },
    { key: "b4", emoji: "🏮", name: "参道の灯籠増設", cost: 9500000, desc: "夜も明るい参道に生まれ変わる" },
    { key: "b5", emoji: "🦁", name: "新しい狛犬の奉納", cost: 10000000, desc: "精悍な狛犬が境内を守る" },
    { key: "b6", emoji: "🥁", name: "神楽殿の建立", cost: 11000000, desc: "神楽や舞が奉納される舞台ができる" },
    { key: "b7", emoji: "🏯", name: "授与所の拡張", cost: 12000000, desc: "お守りやおみくじの授与所が広くなる" },
    { key: "b8", emoji: "⛲", name: "神苑・庭園の造成", cost: 13500000, desc: "四季折々の花が楽しめる庭園ができる" },
    { key: "b9", emoji: "🔔", name: "大鐘楼の建立", cost: 15000000, desc: "境内に響く立派な鐘楼ができる" },
    { key: "b10", emoji: "🌟", name: "御本殿・大改築", cost: 18000000, desc: "御本殿がついに壮麗な姿へと生まれ変わる" }
];

// 🎉 神社ビルダーモードの節目（完成させたパーツ数）で贈られる祝儀
const MAP_BUILDER_MILESTONES = [
    { count: 5, prize: 30000000 },
    { count: BUILDER_PARTS.length, prize: 80000000 }
];
const SHRINE_MAP_BUILDER_COMPLETE_BONUS = 0.01; // 神社ビルダーモードを完成後、さらに永続的に大吉ボーナス+1%

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
const MAX_DAIKICHI_BONUS = 0.11;    // 🛡️ 大吉運ボーナス（アイテム・壺・相棒・神吉ボーナス等の合計）の上限。積み上がり過ぎ防止（うち+1%ずつ、奥宮/パワースポット/日本三大○○/世界の絶景/歴史編/神社ビルダーモードの各コンプ用に確保）
const KAMIKICHI_BONUS_CAP = 0.03;   // 🛡️ 神吉のたびに永久蓄積するボーナス自体の上限

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

// 📅 連続参拝ボーナス：ログインした日数が連続で節目に達すると御祝儀がもらえる（連続が途切れると1日目からやり直し）
const LOGIN_STREAK_MILESTONES = [
    { count: 3, prize: 3000 },
    { count: 7, prize: 8000 },
    { count: 14, prize: 20000 },
    { count: 30, prize: 50000 }
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
    { key: "companion_master", emoji: "🐈‍⬛", name: "黄金招き猫の主", desc: "相棒の招き猫を最大まで育てた", condition: s => (s.companionExp || 0) >= COMPANION_LEVELS[COMPANION_LEVELS.length - 1].threshold },
    { key: "companion_friends_complete", emoji: "🐍🦊", name: "百獣の相棒", desc: "賽銭箱の資金で、白蛇と狐の両方の相棒を迎えた", condition: s => !!(s.ownedFriends && s.ownedFriends.shirohebi && s.ownedFriends.kitsune) },
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
    { key: "otsukimi_master", emoji: "🌕✨", name: "名月の智者", desc: "お月見の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.tsukimi_mochi || 0) + (oi.susuki_hoshi || 0) + (oi.tsukimi_dango || 0)) >= 15;
    } },
    { key: "koyo_master", emoji: "🍁", name: "紅葉狩り名人", desc: "紅葉のしおりを10個集めた", condition: s => (s.ownedItems && s.ownedItems.momiji_shiori || 0) >= 10 },
    { key: "koyo_grandmaster", emoji: "🍁✨", name: "錦秋の匠", desc: "紅葉狩りの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.momiji_shiori || 0) + (oi.icho_leaf || 0) + (oi.kuri || 0)) >= 15;
    } },
    { key: "hatsuyume_complete", emoji: "🗻", name: "一富士二鷹三茄子", desc: "初夢の縁起物（富士・鷹・茄子）を揃えた", condition: s => s.hatsuyumeComplete === true },
    { key: "steady_visitor", emoji: "💼", name: "堅実な参拝者", desc: "デイリーミッション「お財布の達人」を達成（破産せずに1日を終えた）", condition: s => s.steadyVisitorEarned === true },
    { key: "kannazuki_faithful", emoji: "🌫️⛩️", name: "神無月の信心", desc: "神無月に賽銭を貯め、神様の「倍返し」を受け取った", condition: s => !!s.kannazukiRewardedYear },
    { key: "christmas_santa", emoji: "🎅✨", name: "サンタの相棒", desc: "クリスマスに「サンタの袋」を5回開けた", condition: s => (s.santaBagCount || 0) >= 5 },
    { key: "valentine_matchmaker", emoji: "💝", name: "縁結びの達人", desc: "チョコおみくじを5回引いた", condition: s => (s.chocoDrawCount || 0) >= 5 },
    { key: "tanabata_stargazer", emoji: "🌌", name: "星降る夜の参拝者", desc: "七夕の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.orihime_thread || 0) + (oi.hikoboshi_star || 0) + (oi.amanogawa_kirameki || 0)) >= 15;
    } },
    { key: "kannazuki_collector", emoji: "⛩️👣", name: "出雲詣での証", desc: "神無月の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.izumo_omamori || 0) + (oi.kamisama_wasuremono || 0) + (oi.kagura_suzu || 0)) >= 15;
    } },
    { key: "shichigosan_collector", emoji: "👘✨", name: "健やかな成長の証", desc: "七五三の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.chitose_fukuro || 0) + (oi.orizuru_negai || 0) + (oi.kinchaku_omamori || 0)) >= 15;
    } },
    { key: "christmas_collector", emoji: "🎄✨", name: "聖夜の飾り師", desc: "クリスマスの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.christmas_ribbon || 0) + (oi.seiya_candle || 0) + (oi.snowman_charm || 0)) >= 15;
    } },
    { key: "valentine_collector", emoji: "💝🍫", name: "恋心の収集家", desc: "バレンタインの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.choco_kakera || 0) + (oi.akai_ito || 0) + (oi.love_letter || 0)) >= 15;
    } },
    { key: "nenmatsu_collector", emoji: "🎊🧹", name: "一年の締めくくり", desc: "年末の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.joya_kane_hibiki || 0) + (oi.toshikoshi_soba || 0) + (oi.susuharai_houki || 0)) >= 15;
    } },
    { key: "joya_kane_title", emoji: "🔔✨", name: "百八の煩悩祓い", desc: "除夜の鐘を108回ついた", condition: s => !!s.joyaBellCompleteYear },
    { key: "hanami_lover", emoji: "🍡🌸", name: "花見団子の達人", desc: "お花見団子を累計10個手に入れた", condition: s => (s.hanamiDangoTotalCollected || 0) >= 10 },
    { key: "hanami_collector", emoji: "🌸✨", name: "花吹雪の詠み人", desc: "お花見の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.hanami_dango || 0) + (oi.sakura_hanabira || 0) + (oi.hanami_bento || 0)) >= 15;
    } },
    { key: "setsubun_oni", emoji: "🫘👹", name: "鬼退治の達人", desc: "節分の豆まきで5回、厄払いに成功した", condition: s => (s.mamemakiSuccessCount || 0) >= 5 },
    { key: "setsubun_collector", emoji: "🫘✨", name: "福は内の使者", desc: "節分の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.fuku_mame || 0) + (oi.oni_no_tsuno || 0) + (oi.hiiragi_iwashi || 0)) >= 15;
    } },
    { key: "haru_collector", emoji: "🌱✨", name: "新生活の芽吹き", desc: "春の芽吹きの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.wakaba_shinme || 0) + (oi.haru_no_tsubomi || 0) + (oi.harukaze_no_ha || 0)) >= 15;
    } },
    { key: "kodomonohi_koi", emoji: "🎏", name: "登り龍の証", desc: "こどもの日に「大大吉」以上を引いた", condition: s => s.gotKodomonohiExtreme === true },
    { key: "kodomonohi_collector", emoji: "🎏✨", name: "空を泳ぐ鯉の友", desc: "こどもの日の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.koinobori_uroko || 0) + (oi.kabuto_kazari || 0) + (oi.shobu_no_ha || 0)) >= 15;
    } },
    { key: "nagoshi_purified", emoji: "⛩️🌾", name: "茅の輪をくぐりし者", desc: "夏越の大祓で半年間の厄を祓い清めた", condition: s => !!s.nagoshiLastResetYear },
    { key: "nagoshi_collector", emoji: "🌾✨", name: "夏越の清め手", desc: "夏越の大祓の限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.chinowa_kaya || 0) + (oi.minazuki_gashi || 0) + (oi.oharai_no_gohei || 0)) >= 15;
    } },
    { key: "shrine_map_halfway", emoji: "🗺️", name: "境内図の道半ば", desc: "境内マップを半分（10マス）まで埋めた", condition: s => (s.shrineMapLevel || 0) >= 10 },
    { key: "shrine_map_complete", emoji: "🗺️✨", name: "境内マップ完成", desc: "境内マップをすべて（20マス）埋め、神社を完成させた", condition: s => (s.shrineMapLevel || 0) >= MAP_TILES.length },
    { key: "japan_map_quarter", emoji: "🗾", name: "神社巡りの旅人", desc: "全国神社巡りマップで25社を参拝した", condition: s => (s.japanShrineOwnedCount || 0) >= 25 },
    { key: "japan_map_half", emoji: "🗾✨", name: "神社巡りの達人", desc: "全国神社巡りマップで50社を参拝した", condition: s => (s.japanShrineOwnedCount || 0) >= 50 },
    { key: "japan_pref_master", emoji: "🎏", name: "都道府県制覇の証", desc: "全国神社巡りマップで20都道府県をコンプリートした", condition: s => (s.japanPrefCompleteCount || 0) >= 20 },
    { key: "shrine_builder", emoji: "🔨", name: "宮大工の心得", desc: "全国神社巡りマップで神社のパーツを100個組み立てた", condition: s => (s.japanShrinePartsOwnedCount || 0) >= 100 },
    { key: "japan_map_complete", emoji: "🗾👑", name: "日本全国制覇", desc: "全国のすべての神社（" + JAPAN_SHRINE_COUNT + "社）を参拝し終えた", condition: s => (s.japanShrineOwnedCount || 0) >= JAPAN_SHRINE_COUNT },
    { key: "okumiya_quarter", emoji: "🏯", name: "奥宮巡りの旅人", desc: "全国神社巡り・第二弾で奥宮を25社分完成させた", condition: s => (s.okumiyaCompleteCount || 0) >= 25 },
    { key: "okumiya_half", emoji: "🏯✨", name: "奥宮巡りの達人", desc: "全国神社巡り・第二弾で奥宮を50社分完成させた", condition: s => (s.okumiyaCompleteCount || 0) >= 50 },
    { key: "okumiya_complete", emoji: "🏯👑", name: "奥宮制覇", desc: "全国すべての神社（" + JAPAN_SHRINE_COUNT + "社）の奥宮を完成させた", condition: s => (s.okumiyaCompleteCount || 0) >= JAPAN_SHRINE_COUNT },
    { key: "powerspot_quarter", emoji: "🌄", name: "パワースポット巡礼者", desc: "全国神社巡り・第三弾でパワースポットを25箇所訪れた", condition: s => (s.powerSpotOwnedCount || 0) >= 25 },
    { key: "powerspot_half", emoji: "🌄✨", name: "パワースポット探求者", desc: "全国神社巡り・第三弾でパワースポットを50箇所訪れた", condition: s => (s.powerSpotOwnedCount || 0) >= 50 },
    { key: "powerspot_complete", emoji: "🌄👑", name: "パワースポット制覇", desc: "全国すべてのパワースポット（" + POWER_SPOT_COUNT + "箇所）を訪れた", condition: s => (s.powerSpotOwnedCount || 0) >= POWER_SPOT_COUNT },
    { key: "minitheme_quarter", emoji: "🎏", name: "三大巡りの入門者", desc: "「日本三大○○」ミニマップで8箇所訪れた", condition: s => (s.miniThemeOwnedCount || 0) >= 8 },
    { key: "minitheme_half", emoji: "🎏✨", name: "三大巡りの中級者", desc: "「日本三大○○」ミニマップで16箇所訪れた", condition: s => (s.miniThemeOwnedCount || 0) >= 16 },
    { key: "minitheme_complete", emoji: "🎏👑", name: "日本三大制覇", desc: "「日本三大○○」ミニマップを全て（" + MINI_THEME_SPOT_COUNT + "箇所）制覇した", condition: s => (s.miniThemeOwnedCount || 0) >= MINI_THEME_SPOT_COUNT },
    { key: "worldspot_half", emoji: "🌍", name: "世界を旅する参拝者", desc: "世界の絶景・名所編で7箇所訪れた", condition: s => (s.worldSpotOwnedCount || 0) >= 7 },
    { key: "worldspot_complete", emoji: "🌍👑", name: "世界制覇", desc: "世界の絶景・名所（" + WORLD_SPOT_COUNT + "箇所）をすべて訪れた", condition: s => (s.worldSpotOwnedCount || 0) >= WORLD_SPOT_COUNT },
    { key: "grand_pilgrimage_master", emoji: "🌏👑👑", name: "全世界巡礼王", desc: "神社巡りマップ第一弾〜第五弾のすべてを制覇した、正真正銘の頂点", condition: s =>
        (s.japanShrineOwnedCount || 0) >= JAPAN_SHRINE_COUNT &&
        (s.okumiyaCompleteCount || 0) >= JAPAN_SHRINE_COUNT &&
        (s.powerSpotOwnedCount || 0) >= POWER_SPOT_COUNT &&
        (s.miniThemeOwnedCount || 0) >= MINI_THEME_SPOT_COUNT &&
        (s.worldSpotOwnedCount || 0) >= WORLD_SPOT_COUNT
    },
    { key: "history_half", emoji: "🏯", name: "時を旅する参拝者", desc: "歴史編で12箇所の史跡を訪れた", condition: s => (s.historyOwnedCount || 0) >= 12 },
    { key: "history_complete", emoji: "🏯👑", name: "日本史巡礼者", desc: "歴史編（" + HISTORY_SPOT_COUNT + "箇所）をすべて訪れた", condition: s => (s.historyOwnedCount || 0) >= HISTORY_SPOT_COUNT },
    { key: "builder_half", emoji: "🔨", name: "見習い宮大工", desc: "神社ビルダーモードでパーツを5つ完成させた", condition: s => (s.builderLevel || 0) >= 5 },
    { key: "builder_complete", emoji: "🔨👑", name: "一代目・大宮司", desc: "神社ビルダーモードで境内をすべて（" + BUILDER_PARTS.length + "パーツ）完成させた", condition: s => (s.builderLevel || 0) >= BUILDER_PARTS.length },
    { key: "path6_both_complete", emoji: "⛩️🌟👑", name: "二道を極めし者", desc: "歴史編と神社ビルダーモードの両方を完成させた", condition: s =>
        (s.historyOwnedCount || 0) >= HISTORY_SPOT_COUNT && (s.builderLevel || 0) >= BUILDER_PARTS.length
    },
    { key: "yearly_combo_first", emoji: "🎐", name: "四季を巡る参拝者", desc: "季節イベントの代表アイテムを1年で集めきり、年間コンボを達成した", condition: s => (s.comboCompletedYears || 0) >= 1 },
    { key: "yearly_combo_master", emoji: "🎐👑", name: "歳月を紡ぐ者", desc: "年間コンボを3回達成した", condition: s => (s.comboCompletedYears || 0) >= 3 },
    { key: "halloween_rare_yokai", emoji: "🦊👻", name: "化け狐と杯を交わす者", desc: "肝試しで「化け狐の大盤振る舞い」に出会った", condition: s => s.gotHalloweenRareYokai === true },
    { key: "halloween_collector", emoji: "👻✨", name: "妖怪祭りの常連", desc: "ハロウィンの限定アイテムを合計15個集めた", condition: s => {
        const oi = s.ownedItems || {};
        return ((oi.obake_kitsune_omen || 0) + (oi.chochin_hi || 0) + (oi.yokai_emaki || 0)) >= 15;
    } },
    { key: "seasonal_actions_all", emoji: "🎐🌸", name: "四季の営みを尽くす者", desc: "季節の行事（お月見・紅葉狩り・七五三・クリスマス・春の芽吹き・お花見・こどもの日）をすべて一度は行った", condition: s => {
        const c = s.seasonalActionCounts || {};
        return SEASONAL_DAILY_ACTIONS.every(a => (c[a.key] || 0) >= 1);
    } }
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

// 🌫️ 神無月（10月）：期間中に賽銭箱へ預けた金額は、11月に神様が戻った時「倍返し」される
const KANNAZUKI_MONTH = 10;

// 👘 七五三（11月）：ショップ限定アイテム「千歳飴」装備中はフィーバー回数が+2回になる
const CHITOSE_AME_FEVER_BONUS = 2;

// 🎅 クリスマス（12/1〜12/25）：低確率で「サンタの袋」が現れ、開けると所持金が大きく増える
const SANTA_BAG_RATE = 0.04;
const SANTA_BAG_MIN_PRIZE = 3000;
const SANTA_BAG_MAX_PRIZE = 30000;

// 🔔 年末（12/26〜12/31）：「除夜の鐘」を108回つくと煩悩祓いのご褒美がもらえる
const JOYA_BELL_TARGET = 108;
const JOYA_BELL_COMPLETE_PRIZE = 10800;

// 🫘 節分（2/1〜2/3）：大凶（神の試練）のお祓い料を「豆まき」ミニゲームで軽減・無効化できる
const SETSUBUN_MAMEMAKI_SUCCESS_RATE = 0.5; // 豆まき成功（完全無効化）の確率。失敗しても半額になる
const SETSUBUN_MULTI_EXEMPTION_BONUS = 0.15; // 10連おみくじ中は個別のミニゲームができないため、免除率を底上げする

// 🌱 春の芽吹き（3月）：ショップの新アイテム「若葉のお守り」に関する設定はSHOP_ITEMSを参照

// 🍡 桜満開・花見（4月）：「お花見団子」を使うと、次の1回の単発おみくじだけ大吉運がアップする
const HANAMI_DANGO_BONUS = 0.02;

// 🎏 こどもの日（5/1〜5/5）：昇り龍にあやかり、大大吉以上ランクの出現率がアップ（各しきい値を少し引き下げる）
const KODOMONOHI_DAIDAIKICHI_REDUCTION = 0.0015;
const KODOMONOHI_KAMIKICHI_REDUCTION = 0.00015;

// 🌾 夏越の大祓（6/25〜6/30）：半年間の「凶」「大凶」を「茅の輪くぐり」で清算できる
const NAGOSHI_PRIZE_PER_BAD = 300;
const NAGOSHI_PRIZE_CAP = 50000;

// 💝 バレンタイン（2/1〜2/14）：「チョコおみくじ」を1日1回引くと、運勢＋ペア運勢がもらえる（ハズレなしの縁結びイベント）
const CHOCO_PAIR_TYPES = [
    { emoji: "🔥", label: "情熱タイプ" },
    { emoji: "🌊", label: "癒し系タイプ" },
    { emoji: "🍀", label: "堅実タイプ" },
    { emoji: "🌪️", label: "自由奔放タイプ" },
    { emoji: "🌙", label: "ミステリアスタイプ" },
    { emoji: "☀️", label: "太陽のような明るいタイプ" },
    { emoji: "📚", label: "知的タイプ" },
    { emoji: "🎨", label: "芸術家タイプ" }
];
const CHOCO_TIERS = [
    { min: 0.97, name: "運命の大吉", prize: 10000 },
    { min: 0.85, name: "大吉", prize: 3000 },
    { min: 0.6, name: "吉", prize: 1000 },
    { min: 0.3, name: "中吉", prize: 300 },
    { min: 0, name: "小吉", prize: 100 }
];
// 👻 ハロウィン（妖怪祭り・10/25〜10/31）：「肝試し」に1日1回挑戦できる（ハズレなし・出会う妖怪次第でご褒美が変わる）
const KIMODAMESHI_YOKAI_TYPES = [
    { min: 0.95, emoji: "🦊", name: "化け狐の大盤振る舞い", prize: 8000 },
    { min: 0.8, emoji: "🏮", name: "提灯お化けの気まぐれ", prize: 2000 },
    { min: 0.55, emoji: "👺", name: "天狗のいたずら", prize: 500 },
    { min: 0.3, emoji: "🦝", name: "化け狸にからかわれた", prize: 100 },
    { min: 0, emoji: "👻", name: "驚いて逃げ帰った", prize: 0 }
];

// ============================================================
// 🎐 季節イベント共通の「1日1回ミニアクション」（お供え・紅葉狩り・お花見など）
// 七夕・バレンタイン・夏越の大祓・除夜の鐘のような個別ボタンが無かったイベントに、
// 統一されたフォーマット（ハズレなし・5段階の結果・1日1回）で追加する
// ============================================================
const SEASONAL_DAILY_ACTIONS = [
    {
        key: "otsukimi", emoji: "🌕", label: "お供え物をする", boxTitle: "お月見・お供え物（9/15〜9/30限定）",
        tiers: [
            { min: 0.9, name: "満月の恵み", prize: 5000 },
            { min: 0.6, name: "うさぎの祝福", prize: 1500 },
            { min: 0.3, name: "ほのかなご利益", prize: 300 },
            { min: 0, name: "静かな十五夜", prize: 0 }
        ]
    },
    {
        key: "koyo", emoji: "🍁", label: "紅葉狩りをする", boxTitle: "紅葉狩り（11月限定）",
        tiers: [
            { min: 0.9, name: "見事な紅葉のご褒美", prize: 5000 },
            { min: 0.6, name: "山の恵み", prize: 1500 },
            { min: 0.3, name: "色づく小さな恵み", prize: 300 },
            { min: 0, name: "曇り空の一日", prize: 0 }
        ]
    },
    {
        key: "shichigosan", emoji: "👘", label: "千歳飴を結ぶ", boxTitle: "七五三・千歳飴（11月限定）",
        tiers: [
            { min: 0.9, name: "健やかな成長の祝福", prize: 5000 },
            { min: 0.6, name: "晴れ着のご利益", prize: 1500 },
            { min: 0.3, name: "ささやかなお祝い", prize: 300 },
            { min: 0, name: "静かな参拝", prize: 0 }
        ]
    },
    {
        key: "christmas", emoji: "🎄", label: "ツリーを飾り付ける", boxTitle: "クリスマス・ツリー飾り（12/1〜12/25限定）",
        tiers: [
            { min: 0.9, name: "聖夜の奇跡", prize: 5000 },
            { min: 0.6, name: "サンタの気配", prize: 1500 },
            { min: 0.3, name: "小さなプレゼント", prize: 300 },
            { min: 0, name: "静かなクリスマス", prize: 0 }
        ]
    },
    {
        key: "haru", emoji: "🌱", label: "若葉を摘む", boxTitle: "春の芽吹き（3月限定）",
        tiers: [
            { min: 0.9, name: "芽吹きの恵み", prize: 5000 },
            { min: 0.6, name: "新緑のご利益", prize: 1500 },
            { min: 0.3, name: "小さな新芽", prize: 300 },
            { min: 0, name: "肌寒い一日", prize: 0 }
        ]
    },
    {
        key: "hanami", emoji: "🌸", label: "お花見をする", boxTitle: "お花見（4月限定）",
        tiers: [
            { min: 0.9, name: "満開のご褒美", prize: 5000 },
            { min: 0.6, name: "花見酒の縁起", prize: 1500 },
            { min: 0.3, name: "花びら一枚のご利益", prize: 300 },
            { min: 0, name: "曇りの花見", prize: 0 }
        ]
    },
    {
        key: "kodomonohi", emoji: "🎏", label: "兜を飾る", boxTitle: "こどもの日（5/1〜5/5限定）",
        tiers: [
            { min: 0.9, name: "昇り龍の祝福", prize: 5000 },
            { min: 0.6, name: "鯉のぼりのご利益", prize: 1500 },
            { min: 0.3, name: "菖蒲湯の恵み", prize: 300 },
            { min: 0, name: "静かな節句", prize: 0 }
        ]
    }
];

// 🎆 夏祭り（8月）限定：みんなで「打ち上げ花火の玉」を集める季節限定のコミュニティ目標
// 神社改築コミュニティ目標（累計参拝回数）とは別に、その年の夏祭り期間だけ集計される
const NATSUMATSURI_COMMUNITY_GOAL = 500;     // 全ユーザー合計でこの個数に達すると目標達成
const NATSUMATSURI_COMMUNITY_PRIZE = 20000;  // 目標達成年に参拝した全員が受け取れる、その年1回きりのボーナス

// 🎰 季節限定ガチャ：その季節の限定ドロップアイテムを合計5個集めると1回引ける（ハズレなし・4段階）
// 実際の金額は、各イベント（omikuji-seasonal.js の SEASONAL_EVENTS）の gachaMultiplier を掛けて決まる
const SEASONAL_GACHA_COST = 5;
// 🔄 アイテム交換所：季節を問わず、余った季節限定アイテムをガチャ券に交換できるレート
const ITEM_EXCHANGE_COST = 5;

// 🎰 神社スロット：絵柄ごとの出現重み（大きいほど出やすい）と3つ揃った時の配当倍率
const SLOT_SYMBOLS = [
    { key: "dango", emoji: "🍡", weight: 30, payout: 3 },
    { key: "suzu", emoji: "🔔", weight: 25, payout: 5 },
    { key: "neko", emoji: "🐱", weight: 20, payout: 8 },
    { key: "koban", emoji: "🪙", weight: 15, payout: 15 },
    { key: "torii", emoji: "⛩️", weight: 7, payout: 30 },
    { key: "taiyou", emoji: "☀️", weight: 3, payout: 100 }
];
// 🎰 2つだけ揃った場合の配当倍率（絵柄を問わず一律。掛け金がそのまま戻ってくる＝実質おあいこ）
const SLOT_TWO_MATCH_PAYOUT = 1;

// 🎯 境内すごろく：マスの効果の基本倍率一覧（各コースはこの倍率にeffectMultScaleを掛けて使う）
const SUGOROKU_EFFECT_TABLE = [
    { key: "none", emoji: "🌿", mult: 0, label: "🌿 何もなし" },
    { key: "coin", emoji: "🪙", mult: 0.1, label: "🪙 小銭を拾った" },
    { key: "dango", emoji: "🍡", mult: 0.3, label: "🍡 お団子をもらった" },
    { key: "gift", emoji: "🎁", mult: 0.6, label: "🎁 授かりもの" },
    { key: "big", emoji: "⭐", mult: 1.5, label: "⭐ 大きなご利益" },
    { key: "jackpot", emoji: "🏆", mult: 5.0, label: "🏆 特大御利益！" }
];

// 🎯 境内すごろくのコース一覧。マス数・最低賭け金・配当倍率のスケールがそれぞれ異なる
// tileCounts：1〜(boardSize-1)マス目に配置する効果の内訳（合計はboardSize-1と一致させる）
const SUGOROKU_COURSES = [
    {
        key: "light", emoji: "🌸", name: "お手軽コース",
        desc: "マス数少なめ・すぐ遊べる入門コース",
        boardSize: 12, minBet: 100, effectMultScale: 1.0, goalBonusMult: 0.1,
        tileCounts: { none: 6, coin: 3, dango: 1, gift: 1, big: 0, jackpot: 0 }
    },
    {
        key: "standard", emoji: "⛩️", name: "定番コース",
        desc: "全20マスの標準的なコース",
        boardSize: 20, minBet: 100, effectMultScale: 1.0, goalBonusMult: 0.1,
        tileCounts: { none: 8, coin: 6, dango: 2, gift: 1, big: 1, jackpot: 1 }
    },
    {
        key: "long", emoji: "🗾", name: "大冒険コース",
        desc: "全32マスの長丁場。道中でご利益マスに出会うチャンスも多め",
        boardSize: 32, minBet: 100, effectMultScale: 1.0, goalBonusMult: 0.15,
        tileCounts: { none: 14, coin: 9, dango: 4, gift: 2, big: 1, jackpot: 1 }
    },
    {
        key: "highstakes", emoji: "💴", name: "高額コース",
        desc: "最低賭け金10,000円。その分マス効果の倍率が2倍！",
        boardSize: 20, minBet: 10000, effectMultScale: 2.0, goalBonusMult: 0.2,
        tileCounts: { none: 8, coin: 6, dango: 2, gift: 1, big: 1, jackpot: 1 }
    }
];

// 🚶 境内すごろくで使える駒（プレイヤーが自由に選べる。効果には影響しない見た目のみの要素）
const SUGOROKU_TOKENS = [
    { key: "walk", emoji: "🚶", name: "参拝者" },
    { key: "cat", emoji: "🐱", name: "招き猫" },
    { key: "frog", emoji: "🐸", name: "金運蛙" },
    { key: "torii", emoji: "⛩️", name: "鳥居" },
    { key: "dragon", emoji: "🐉", name: "昇り龍" },
    { key: "fox", emoji: "🦊", name: "お狐様" }
];
const SEASONAL_GACHA_BASE_TIERS = [
    { min: 0.99, name: "🎉大当たり", basePrize: 100000 },
    { min: 0.90, name: "✨当たり", basePrize: 20000 },
    { min: 0.60, name: "😊小当たり", basePrize: 5000 },
    { min: 0, name: "🍀ご縁の恵み", basePrize: 1500 }
];

// ============================================================
// 👥 フレンド機能：申請・承認、送金、チャットに関する設定値
// ============================================================
const SEND_MONEY_MAX_PER_TRANSACTION = 150000; // 💰 1回の送金上限
const SEND_MONEY_MAX_PER_DAY = 3;              // 💰 1日に送金できる回数の上限
const CHAT_MESSAGE_MAX_LENGTH = 200;           // 💬 チャット1件あたりの最大文字数
const CHAT_MESSAGE_MIN_INTERVAL_MS = 3000;     // 💬 連投防止：前回の送信から最低これだけ間隔を空ける
const CHAT_HISTORY_LIMIT = 50;                 // 💬 画面に表示するメッセージの件数