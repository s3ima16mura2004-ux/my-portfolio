// ============================================================
// omikuji-friends.js
// 👥 フレンド機能：検索・申請・承認、送金、リアルタイムチャットをまとめている。
// ⚠️ このサイトはCloud Functions等のサーバー側処理を持たないため、
// 送金・申請とも「多少の不正リスクは許容し、上限を設けて実害を抑える」設計にしている。
// ============================================================

// 🛡️ ユーザー名（自由入力）をJSの文字列リテラルとして安全に組み立て、
// さらにHTML属性の中に埋め込んでも壊れないようにエスケープする
// （名前に引用符やタグ記号が含まれていても、onclick属性が壊れたり
//   意図しないHTML/JSが実行されたりしないようにするための対策）
function jsStringForAttr(str) {
    return JSON.stringify(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// 🛡️ チャット本文や参拝者名をそのまま画面に表示しても安全なように、HTMLとして解釈されないようエスケープする
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

// 👥 2人のユーザー名から、常に同じ結果になるチャットルームIDを作る（どちらが先に開始してもOK）
function getChatId(nameA, nameB) {
    return [nameA, nameB].sort().join("::");
}

// ============================================================
// 🔍 フレンド検索・申請
// ============================================================

// 🔍 参拝者名を検索し、見つかったら申請ボタン付きの結果を表示する
async function searchFriendCandidate() {
    const input = document.querySelector("#friend-search-input");
    const resultBox = document.querySelector("#friend-search-result");
    const targetName = input ? input.value.trim() : "";
    if (!resultBox) return;

    if (!targetName) {
        resultBox.innerHTML = '<p class="collect-item-note">参拝者名を入力してください。</p>';
        return;
    }
    if (targetName === currentUser) {
        resultBox.innerHTML = '<p class="collect-item-note">自分自身は検索できません。</p>';
        return;
    }

    resultBox.innerHTML = '<p class="collect-item-note">検索中…</p>';

    try {
        const targetRef = window.omikujiDoc(window.omikujiDB, "users", targetName);
        const targetSnap = await window.omikujiGetDoc(targetRef);

        if (!targetSnap.exists()) {
            resultBox.innerHTML = '<p class="collect-item-note">「' + escapeHtml(targetName) + '」という参拝者は見つかりませんでした。</p>';
            return;
        }

        let actionHtml;
        if (friends[targetName]) {
            actionHtml = '<span class="mission-status-tag mission-status-done">すでにフレンドです</span>';
        } else if (friendRequestsOutgoing[targetName]) {
            actionHtml = '<span class="mission-status-tag">承認待ちです</span>';
        } else if (friendRequestsIncoming[targetName]) {
            actionHtml = '<button class="btn-shop-buy" onclick="acceptFriendRequest(' + jsStringForAttr(targetName) + ')" type="button">相手からの申請を承認する</button>';
        } else {
            actionHtml = '<button class="btn-shop-buy" onclick="sendFriendRequest(' + jsStringForAttr(targetName) + ')" type="button">👥 フレンド申請を送る</button>';
        }

        resultBox.innerHTML =
            '<div class="shop-item-card">' +
                '<div class="shop-item-info"><p class="shop-item-name">👤 ' + escapeHtml(targetName) + '</p></div>' +
                actionHtml +
            '</div>';
    } catch (e) {
        console.error("フレンド検索に失敗しました: ", e);
        resultBox.innerHTML = '<p class="collect-item-note">検索に失敗しました。もう一度お試しください。</p>';
    }
}

// 🔍 名前を指定してフレンド申請を送る
async function sendFriendRequest(targetNameRaw) {
    const targetName = (targetNameRaw || "").trim();
    if (!targetName) return;
    if (targetName === currentUser) {
        alert("🙅 自分自身にはフレンド申請できません。");
        return;
    }
    if (friends[targetName]) {
        alert("🙅 「" + targetName + "」さんとはすでにフレンドです。");
        return;
    }
    if (friendRequestsOutgoing[targetName]) {
        alert("🙅 「" + targetName + "」さんへの申請はすでに送信済みです。相手の承認をお待ちください。");
        return;
    }

    try {
        const targetRef = window.omikujiDoc(window.omikujiDB, "users", targetName);
        const targetSnap = await window.omikujiGetDoc(targetRef);
        if (!targetSnap.exists()) {
            alert("🙅 「" + targetName + "」という参拝者は見つかりませんでした。");
            return;
        }

        // 相手からすでに申請が来ていた場合は、送り直すのではなくそのまま承認する
        if (friendRequestsIncoming[targetName]) {
            await acceptFriendRequest(targetName);
            return;
        }

        friendRequestsOutgoing[targetName] = true;
        await window.omikujiUpdateDoc(targetRef, {
            ["friendRequestsIncoming." + currentUser]: true
        });
        await saveUserState();
        updateFriendsUI();

        const input = document.querySelector("#friend-search-input");
        if (input) input.value = "";
        const resultBox = document.querySelector("#friend-search-result");
        if (resultBox) resultBox.innerHTML = "";

        alert("👥 「" + targetName + "」さんにフレンド申請を送りました！");
    } catch (e) {
        console.error("フレンド申請に失敗しました: ", e);
        alert("❌ フレンド申請に失敗しました。通信環境をご確認の上、もう一度お試しください。");
    }
}

// ✅ 届いている申請を承認する
async function acceptFriendRequest(name) {
    if (!friendRequestsIncoming[name]) return;

    try {
        const myRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const otherRef = window.omikujiDoc(window.omikujiDB, "users", name);

        delete friendRequestsIncoming[name];
        friends[name] = true;

        await window.omikujiUpdateDoc(myRef, {
            ["friendRequestsIncoming." + name]: window.omikujiDeleteField(),
            ["friends." + name]: true
        });
        await window.omikujiUpdateDoc(otherRef, {
            ["friendRequestsOutgoing." + currentUser]: window.omikujiDeleteField(),
            ["friends." + currentUser]: true
        });

        await saveUserState();
        updateFriendsUI();
        alert("🎉 「" + name + "」さんとフレンドになりました！");
    } catch (e) {
        console.error("フレンド承認に失敗しました: ", e);
        alert("❌ フレンド承認に失敗しました。通信環境をご確認の上、もう一度お試しください。");
    }
}

// 🙅 届いている申請を断る
async function rejectFriendRequest(name) {
    if (!friendRequestsIncoming[name]) return;

    try {
        const myRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const otherRef = window.omikujiDoc(window.omikujiDB, "users", name);

        delete friendRequestsIncoming[name];

        await window.omikujiUpdateDoc(myRef, {
            ["friendRequestsIncoming." + name]: window.omikujiDeleteField()
        });
        await window.omikujiUpdateDoc(otherRef, {
            ["friendRequestsOutgoing." + currentUser]: window.omikujiDeleteField()
        });

        await saveUserState();
        updateFriendsUI();
    } catch (e) {
        console.error("フレンド申請の却下に失敗しました: ", e);
    }
}

// 🚫 自分から送った申請を取り消す
async function cancelFriendRequest(name) {
    if (!friendRequestsOutgoing[name]) return;
    if (!confirm("「" + name + "」さんへの申請を取り消しますか？")) return;

    try {
        const myRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const otherRef = window.omikujiDoc(window.omikujiDB, "users", name);

        delete friendRequestsOutgoing[name];

        await window.omikujiUpdateDoc(myRef, {
            ["friendRequestsOutgoing." + name]: window.omikujiDeleteField()
        });
        await window.omikujiUpdateDoc(otherRef, {
            ["friendRequestsIncoming." + currentUser]: window.omikujiDeleteField()
        });

        await saveUserState();
        updateFriendsUI();
    } catch (e) {
        console.error("フレンド申請の取り消しに失敗しました: ", e);
    }
}

// 💔 フレンドを解除する
async function removeFriendConfirm(name) {
    if (!friends[name]) return;
    if (!confirm("「" + name + "」さんとのフレンドを解除しますか？")) return;

    try {
        const myRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const otherRef = window.omikujiDoc(window.omikujiDB, "users", name);

        delete friends[name];

        await window.omikujiUpdateDoc(myRef, {
            ["friends." + name]: window.omikujiDeleteField()
        });
        await window.omikujiUpdateDoc(otherRef, {
            ["friends." + currentUser]: window.omikujiDeleteField()
        });

        if (currentChatFriend === name) closeChat();

        await saveUserState();
        updateFriendsUI();
    } catch (e) {
        console.error("フレンド解除に失敗しました: ", e);
    }
}

// ============================================================
// 💰 フレンドへの送金（1回15万円まで・1日3回まで）
// ============================================================

async function sendMoneyToFriend(btn) {
    const card = btn.closest(".friend-card");
    const name = card ? card.dataset.name : "";
    const input = card ? card.querySelector(".friend-money-input") : null;
    if (!name || !friends[name]) return;

    const amount = input ? parseInt(input.value, 10) : NaN;

    if (!amount || amount <= 0) {
        alert("🙅 送る金額を正しく入力してください。");
        return;
    }
    if (amount > SEND_MONEY_MAX_PER_TRANSACTION) {
        alert("🙅 1回に送れるのは" + SEND_MONEY_MAX_PER_TRANSACTION.toLocaleString() + "円までです。");
        return;
    }

    const today = todayStr();
    if (sendMoneyDate !== today) {
        sendMoneyDate = today;
        sendMoneyCountToday = 0;
    }
    if (sendMoneyCountToday >= SEND_MONEY_MAX_PER_DAY) {
        alert("🙅 送金は1日" + SEND_MONEY_MAX_PER_DAY + "回までです。また明日お試しください。");
        return;
    }
    if (currentMoney < amount) {
        alert("🙅 所持金が足りません！");
        return;
    }

    if (!confirm("「" + name + "」さんに" + amount.toLocaleString() + "円を送りますか？")) return;

    try {
        const friendRef = window.omikujiDoc(window.omikujiDB, "users", name);
        await window.omikujiUpdateDoc(friendRef, {
            money: window.omikujiIncrement(amount)
        });

        currentMoney -= amount;
        sendMoneyDate = today;
        sendMoneyCountToday++;

        updateMoneyDisplay();
        playSE("se-purchase");
        recordHistory("🎁" + name + "さんへ送金", -amount, currentMoney);
        await saveUserState();

        // 🎁 送金したことをチャットにも残しておく（届いたかどうか相手にも分かるように。失敗しても送金自体は成立させる）
        try {
            const chatId = getChatId(currentUser, name);
            const messagesRef = window.omikujiCollection(window.omikujiDB, "chats", chatId, "messages");
            await window.omikujiAddDoc(messagesRef, {
                from: currentUser,
                text: "🎁 " + amount.toLocaleString() + "円を送りました！",
                createdAt: window.omikujiServerTimestamp()
            });
        } catch (chatErr) {
            console.error("送金通知メッセージの送信に失敗しました: ", chatErr);
        }

        if (input) input.value = "";
        alert("🎁 「" + name + "」さんに【" + amount.toLocaleString() + "円】を送りました！");
    } catch (e) {
        console.error("送金に失敗しました: ", e);
        alert("❌ 送金に失敗しました。通信環境をご確認の上、もう一度お試しください。");
    }
}

// ============================================================
// 💬 リアルタイムチャット
// ============================================================

// 💬 指定したフレンドとのチャット画面を開く（リアルタイム購読を開始する）
function openChat(name) {
    if (!friends[name]) return;
    closeChat(); // 別のチャットを開いていた場合は購読を解除しておく

    currentChatFriend = name;

    const box = document.querySelector("#friend-chat-box");
    const titleEl = document.querySelector("#friend-chat-title");
    if (box) box.classList.remove("hidden");
    if (titleEl) titleEl.textContent = "💬 " + name + "さんとのチャット";

    const chatId = getChatId(currentUser, name);
    const messagesRef = window.omikujiCollection(window.omikujiDB, "chats", chatId, "messages");
    const q = window.omikujiQuery(messagesRef, window.omikujiOrderBy("createdAt", "desc"), window.omikujiLimit(CHAT_HISTORY_LIMIT));

    chatUnsubscribe = window.omikujiOnSnapshot(q, snapshot => {
        const messages = [];
        snapshot.forEach(docSnap => messages.push(docSnap.data()));
        messages.reverse(); // 新しい順で取得したものを、古い→新しいの表示順に並び替える
        renderChatMessages(messages);
    }, error => {
        console.error("チャットの受信に失敗しました: ", error);
    });

    updateFriendsUI();
}

// 💬 チャット画面を閉じる（リアルタイム購読を解除する）
function closeChat() {
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
    currentChatFriend = "";

    const box = document.querySelector("#friend-chat-box");
    if (box) box.classList.add("hidden");

    updateFriendsUI();
}

let lastChatSendTime = 0; // 連投防止用（セッション内のみ）

// 💬 チャットメッセージを送信する
async function sendChatMessage() {
    if (!currentChatFriend) return;

    const input = document.querySelector("#friend-chat-input");
    const text = input ? input.value.trim() : "";
    if (!text) return;

    if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
        alert("🙅 メッセージは" + CHAT_MESSAGE_MAX_LENGTH + "文字までです。");
        return;
    }

    const now = Date.now();
    if (now - lastChatSendTime < CHAT_MESSAGE_MIN_INTERVAL_MS) {
        alert("🙅 メッセージの送信間隔が短すぎます。少し待ってから送ってください。");
        return;
    }

    try {
        const chatId = getChatId(currentUser, currentChatFriend);
        const messagesRef = window.omikujiCollection(window.omikujiDB, "chats", chatId, "messages");
        await window.omikujiAddDoc(messagesRef, {
            from: currentUser,
            text: text,
            createdAt: window.omikujiServerTimestamp()
        });
        lastChatSendTime = now;
        if (input) input.value = "";
    } catch (e) {
        console.error("メッセージの送信に失敗しました: ", e);
        alert("❌ メッセージの送信に失敗しました。通信環境をご確認ください。");
    }
}

// 💬 受信したメッセージ一覧を画面に描画する
function renderChatMessages(messages) {
    const box = document.querySelector("#friend-chat-messages");
    if (!box) return;

    if (messages.length === 0) {
        box.innerHTML = '<p class="collect-item-note">まだメッセージはありません。最初のメッセージを送ってみましょう！</p>';
        return;
    }

    box.innerHTML = messages.map(m => {
        const mine = m.from === currentUser;
        return (
            '<div class="chat-bubble-row' + (mine ? " chat-bubble-row-mine" : "") + '">' +
                '<div class="chat-bubble' + (mine ? " chat-bubble-mine" : "") + '">' +
                    '<span class="chat-bubble-name">' + escapeHtml(mine ? "自分" : m.from) + '</span>' +
                    '<p class="chat-bubble-text">' + escapeHtml(m.text) + '</p>' +
                '</div>' +
            '</div>'
        );
    }).join("");

    box.scrollTop = box.scrollHeight;
}

// ============================================================
// 🖼️ フレンドタブ全体の表示更新
// ============================================================

function updateFriendsUI() {
    const incomingList = document.querySelector("#friend-requests-incoming-list");
    const outgoingList = document.querySelector("#friend-requests-outgoing-list");
    const friendsList = document.querySelector("#friend-list");
    if (!incomingList && !friendsList) return; // フレンドタブがまだ描画されていないページでは何もしない

    const incomingNames = Object.keys(friendRequestsIncoming).filter(n => friendRequestsIncoming[n]);
    const outgoingNames = Object.keys(friendRequestsOutgoing).filter(n => friendRequestsOutgoing[n]);
    const friendNames = Object.keys(friends).filter(n => friends[n]);

    if (incomingList) {
        incomingList.innerHTML = incomingNames.length > 0
            ? incomingNames.map(name =>
                '<div class="shop-item-card">' +
                    '<div class="shop-item-info"><p class="shop-item-name">👤 ' + escapeHtml(name) + '</p></div>' +
                    '<button class="btn-shop-buy" onclick="acceptFriendRequest(' + jsStringForAttr(name) + ')" type="button">承認</button>' +
                    '<button class="btn-equip-none" onclick="rejectFriendRequest(' + jsStringForAttr(name) + ')" type="button">拒否</button>' +
                '</div>'
            ).join("")
            : '<p class="collect-item-note">届いている申請はありません。</p>';
    }

    if (outgoingList) {
        outgoingList.innerHTML = outgoingNames.length > 0
            ? outgoingNames.map(name =>
                '<div class="shop-item-card">' +
                    '<div class="shop-item-info"><p class="shop-item-name">👤 ' + escapeHtml(name) + '</p><p class="shop-item-desc">承認をお待ちしています</p></div>' +
                    '<button class="btn-equip-none" onclick="cancelFriendRequest(' + jsStringForAttr(name) + ')" type="button">取り消す</button>' +
                '</div>'
            ).join("")
            : '<p class="collect-item-note">送っている申請はありません。</p>';
    }

    if (friendsList) {
        friendsList.innerHTML = friendNames.length > 0
            ? friendNames.map(name => {
                const isOpenChat = currentChatFriend === name;
                return (
                    '<div class="friend-card" data-name="' + escapeHtml(name) + '">' +
                        '<div class="shop-item-card">' +
                            '<div class="shop-item-info"><p class="shop-item-name">👤 ' + escapeHtml(name) + '</p></div>' +
                            '<button class="btn-shop-buy' + (isOpenChat ? " title-badge-equipped" : "") + '" onclick="openChat(' + jsStringForAttr(name) + ')" type="button">💬 チャット</button>' +
                            '<button class="btn-equip-none" onclick="removeFriendConfirm(' + jsStringForAttr(name) + ')" type="button">解除</button>' +
                        '</div>' +
                        '<div class="friend-money-row">' +
                            '<input type="number" class="friend-money-input bank-amount-input" placeholder="送る金額（1回' + SEND_MONEY_MAX_PER_TRANSACTION.toLocaleString() + '円まで）" min="1" max="' + SEND_MONEY_MAX_PER_TRANSACTION + '">' +
                            '<button class="btn-shop-buy" onclick="sendMoneyToFriend(this)" type="button">💰 送金</button>' +
                        '</div>' +
                    '</div>'
                );
            }).join("")
            : '<p class="collect-item-note">まだフレンドがいません。上の検索欄から探してみましょう！</p>';
    }

    updateFriendNotificationBadge();
}

// 🔔 ミッションタブと同じ考え方で、フレンドタブのボタン自体に届いている申請数のバッジを出す
function updateFriendNotificationBadge() {
    const badge = document.querySelector("#tabBtn-friends-badge");
    if (!badge) return;

    const incomingCount = Object.keys(friendRequestsIncoming).filter(n => friendRequestsIncoming[n]).length;

    if (incomingCount > 0) {
        badge.textContent = incomingCount;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

// 🔔 top.html側の通知バッジをタップした時などに、フレンドタブまで移動する
function jumpToFriendsTab() {
    if (typeof showTab === "function") showTab("friends");
    if (typeof closeMoreMenu === "function") closeMoreMenu();
    const section = document.querySelector("#tab-friends");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 🔄 他のユーザーが送ってきた申請・承認は自分の画面に自動反映されないため、
// 自分自身のドキュメントを定期的に読み直して最新のフレンド状態を反映する
async function refreshFriendsFromServer() {
    if (!currentUser || !window.omikujiDB || !window.omikujiDoc || !window.omikujiGetDoc) return;
    try {
        const myRef = window.omikujiDoc(window.omikujiDB, "users", currentUser);
        const snap = await window.omikujiGetDoc(myRef);
        if (!snap.exists()) return;

        const data = snap.data();
        friends = (data.friends && typeof data.friends === "object") ? data.friends : {};
        friendRequestsIncoming = (data.friendRequestsIncoming && typeof data.friendRequestsIncoming === "object") ? data.friendRequestsIncoming : {};
        friendRequestsOutgoing = (data.friendRequestsOutgoing && typeof data.friendRequestsOutgoing === "object") ? data.friendRequestsOutgoing : {};

        updateFriendsUI();
    } catch (e) {
        console.error("フレンド状態の再取得に失敗しました: ", e);
    }
}
