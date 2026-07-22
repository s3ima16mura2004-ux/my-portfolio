// ============================================================
// omikuji-firebase-bridge.js
// 🔥 Firebase/Firestoreの初期化と、グローバル(window)への橋渡し
// omikuji2.html専用だったインライン<script type="module">を切り出したもの。
// 境内マップ・図鑑・ミニゲーム等の新規ページからも
// <script type="module" src="../js/omikuji-firebase-bridge.js"></script>
// を読み込むだけで、同じFirestore接続（window.omikujiDB等）が使えるようにする。
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    increment,
    deleteField,
    onSnapshot,
    query,
    orderBy,
    limit,
    serverTimestamp
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

// 通常の<script>（omikuji2.js）から呼べるようにwindowへ公開
window.omikujiDB = db;
window.omikujiCollectionRef = collection(db, "history");
window.omikujiAddDoc = addDoc;
window.omikujiDoc = doc;
window.omikujiGetDoc = getDoc;
window.omikujiUpdateDoc = updateDoc;
window.omikujiSetDoc = setDoc;
window.omikujiIncrement = increment;
window.omikujiCommunityRef = doc(db, "global", "community");
window.omikujiDeleteField = deleteField;
window.omikujiCollection = collection;
window.omikujiOnSnapshot = onSnapshot;
window.omikujiQuery = query;
window.omikujiOrderBy = orderBy;
window.omikujiLimit = limit;
window.omikujiServerTimestamp = serverTimestamp;