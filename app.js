// RSA暗号のロジック

// モジュラー累乗 (a^b mod m)
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }

    return result;
}

// 最大公約数を求める
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 拡張ユークリッドアルゴリズム
function extendedGcd(a, b) {
    if (b === 0) {
        return [a, 1, 0];
    }
    const [g, x1, y1] = extendedGcd(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [g, x, y];
}

// モジュラー逆元を求める
function modInverse(e, z) {
    const [g, x, y] = extendedGcd(e, z);
    if (g !== 1) {
        return null; // 逆元が存在しない
    }
    return ((x % z) + z) % z;
}

// 鍵生成のロジック
function updateKeyGen() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const resultDiv = document.getElementById('keygen-result');

    if (p === q) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> <div><strong>エラー</strong><br>p と q が同じ数字のため、鍵生成を実行できません。pとqは別々の数字にしてください。</div></div>';
        return;
    }

    if (p * q < 143) {
        resultDiv.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> <div><strong>エラー</strong><br>p と q が小さすぎます。p × q ≥ 143 になるような数字にしてください。</div></div>';
        return;
    }

    const n = p * q;
    const z = (p - 1) * (q - 1);

    let html = '<div class="content-card fade-in">';
    html += '<div class="alert alert-success"><i class="fas fa-check-circle"></i> <div>条件を満たしています。次のステップに進みます。</div></div>';
    html += '<div class="step-explanation">';
    html += `<div class="calc-step slide-in-left"><i class="fas fa-calculator"></i> <strong>ステップ 3:</strong> n = p × q = ${p} × ${q} = <span class="highlight">${n}</span></div>`;
    html += `<div class="calc-step slide-in-left" style="animation-delay: 0.1s;"><i class="fas fa-calculator"></i> <strong>ステップ 4:</strong> z = (p-1) × (q-1) = ${p-1} × ${q-1} = <span class="highlight">${z}</span></div>`;
    html += '</div>';

    // e の選択肢を表示
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    html += '<div class="mt-3"><label class="form-label"><i class="fas fa-3"></i> 素数 e を選択</label>';
    html += '<select id="prime-e" class="form-select modern-select">';
    primes.forEach(prime => {
        html += `<option value="${prime}">${prime}</option>`;
    });
    html += '</select></div>';
    html += '<div id="e-result" class="mt-3"></div>';
    html += '</div>';

    resultDiv.innerHTML = html;

    // e の変更イベント
    document.getElementById('prime-e').addEventListener('change', updateESelection);

    // 初期値で更新
    updateESelection();
}

function updateESelection() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const e = parseInt(document.getElementById('prime-e').value);
    const z = (p - 1) * (q - 1);
    const n = p * q;

    const eResultDiv = document.getElementById('e-result');

    if (z % e === 0) {
        eResultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-times-circle"></i> <div><strong>エラー</strong><br>e ( ${e} ) は z ( ${z} ) を割ることができます。<br>z ÷ e = ${Math.floor(z / e)}</div></div>`;
        return;
    }

    let html = '<div class="content-card">';
    html += '<div class="alert alert-success"><i class="fas fa-check-circle"></i> <div>e の条件を満たしています。</div></div>';
    html += '<div class="step-explanation">';
    html += `<p><i class="fas fa-info-circle"></i> <strong>ステップ 5:</strong> m を求めます</p>`;
    html += `<p>z ( ${z} ) × m と -1 を e ( ${e} ) で割って、余りが等しくなる数 m を求めます。</p>`;

    const targetRemainder = ((-1 % e) + e) % e;
    html += `<div class="calc-step"><i class="fas fa-arrow-right"></i> -1 ÷ e ( ${e} ) の余り = <span class="highlight">${targetRemainder}</span></div>`;
    html += `<div class="calc-step"><i class="fas fa-arrow-right"></i> ${z} × m ÷ ${e} の余りが ${targetRemainder} になる m を探します</div>`;
    html += '</div>';

    html += `<label class="form-label mt-3"><i class="fas fa-hashtag"></i> m の値を入力（1 ≦ m ≦ ${e - 1}）</label>`;
    html += `<input type="number" id="m-value" class="form-control modern-input" min="1" max="${e - 1}" value="1">`;
    html += '<div id="m-result" class="mt-3"></div>';
    html += '</div>';

    eResultDiv.innerHTML = html;

    // m の変更イベント
    document.getElementById('m-value').addEventListener('input', updateMSelection);

    // 初期値で更新
    updateMSelection();
}

function updateMSelection() {
    const p = parseInt(document.getElementById('prime-p').value);
    const q = parseInt(document.getElementById('prime-q').value);
    const e = parseInt(document.getElementById('prime-e').value);
    const m = parseInt(document.getElementById('m-value').value);
    const z = (p - 1) * (q - 1);
    const n = p * q;

    const mResultDiv = document.getElementById('m-result');

    const targetRemainder = ((-1 % e) + e) % e;
    const actualRemainder = (z * m) % e;

    if (targetRemainder !== actualRemainder) {
        mResultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-times-circle"></i> <div><strong>エラー</strong><br>zm ÷ e の余りが一致しません（現在: ${actualRemainder}、必要: ${targetRemainder}）</div></div>`;
        return;
    }

    const d = Math.floor((m * z + 1) / e);

    let html = '<div class="result-card">';
    html += '<div class="alert alert-success"><i class="fas fa-check-circle"></i> <div>m の条件を満たしています！</div></div>';
    html += '<div class="step-explanation">';
    html += `<div class="calc-step"><i class="fas fa-calculator"></i> <strong>ステップ 6:</strong> d = (m × z + 1) ÷ e = (${m} × ${z} + 1) ÷ ${e} = <span class="highlight">${d}</span></div>`;
    html += '</div>';

    html += '<div class="mt-4"><h5 style="text-align: center; margin-bottom: 2rem;"><i class="fas fa-check-double"></i> 鍵生成完了</h5>';

    html += '<div class="key-display">';
    html += '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">';
    html += '<i class="fas fa-key" style="font-size: 2rem; color: var(--primary-color);"></i>';
    html += '<div><h6 style="margin: 0; color: var(--text-secondary);">公開鍵（相手に教える値）</h6></div>';
    html += '</div>';
    html += `<h3>n = ${n}, e = ${e}</h3>`;
    html += '</div>';

    html += '<div class="key-display secret-key">';
    html += '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">';
    html += '<i class="fas fa-lock" style="font-size: 2rem; color: var(--danger-color);"></i>';
    html += '<div><h6 style="margin: 0; color: var(--text-secondary);">秘密鍵（絶対に秘密にする値）</h6></div>';
    html += '</div>';
    html += `<h3>p = ${p}, q = ${q}, d = ${d}</h3>`;
    html += '</div>';

    // 鍵のエクスポートボタン
    html += '<div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">';
    html += `<button class="btn-modern btn-primary" onclick='exportPublicKey(${n}, ${e})'>`;
    html += '<i class="fas fa-download"></i> 公開鍵をエクスポート</button>';
    html += `<button class="btn-modern btn-secondary" onclick='exportPrivateKey(${n}, ${d})'>`;
    html += '<i class="fas fa-download"></i> 秘密鍵をエクスポート</button>';
    html += '</div>';

    html += '</div></div>';

    mResultDiv.innerHTML = html;
}

// 平文を処理する
function processPlaintext() {
    const plaintext = document.getElementById('plaintext').value;
    const resultDiv = document.getElementById('plaintext-result');

    if (!plaintext) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> <div>暗号化したい文字列を入力してください。</div></div>';
        return;
    }

    const expandedList = [];
    let unknownChars = false;

    for (let ch of plaintext) {
        if (charToNum[ch] !== undefined) {
            expandedList.push({文字: ch, 数値: charToNum[ch]});
        } else if (dakutenMap[ch]) {
            const [baseChar, mark] = dakutenMap[ch];
            if (charToNum[baseChar] !== undefined && charToNum[mark] !== undefined) {
                expandedList.push({文字: baseChar, 数値: charToNum[baseChar]});
                expandedList.push({文字: mark, 数値: charToNum[mark]});
            } else {
                unknownChars = true;
                break;
            }
        } else {
            unknownChars = true;
            break;
        }
    }

    if (unknownChars) {
        resultDiv.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> <div>リストにない文字、または分解できない文字が含まれています。</div></div>';
        return;
    }

    // テーブルを作成
    let html = '<div class="content-card">';
    html += '<div class="card-header-custom"><i class="fas fa-list"></i><span>文字の分解・数値化結果</span></div>';
    html += '<table class="table table-bordered"><thead><tr><th>文字</th><th>数値</th></tr></thead><tbody>';
    expandedList.forEach(item => {
        html += `<tr><td>${item.文字}</td><td>${item.数値}</td></tr>`;
    });
    html += '</tbody></table>';

    const numsList = expandedList.map(item => item.数値).join(' ');
    html += `<div class="info-note"><i class="fas fa-lightbulb"></i><span>数値リスト: ${numsList}</span></div>`;
    html += '</div>';

    resultDiv.innerHTML = html;

    // 暗号化ボタンを有効化
    document.getElementById('encrypt-btn').disabled = false;
}

// 暗号化を実行
function encrypt() {
    const plaintext = document.getElementById('plaintext').value;
    const n = BigInt(document.getElementById('encrypt-n').value);
    const e = BigInt(document.getElementById('encrypt-e').value);
    const resultDiv = document.getElementById('encrypted-result');

    if (!plaintext) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> <div>暗号化したい文字列を入力してください。</div></div>';
        return;
    }

    const expandedList = [];
    let unknownChars = false;

    for (let ch of plaintext) {
        if (charToNum[ch] !== undefined) {
            expandedList.push({文字: ch, 数値: charToNum[ch]});
        } else if (dakutenMap[ch]) {
            const [baseChar, mark] = dakutenMap[ch];
            if (charToNum[baseChar] !== undefined && charToNum[mark] !== undefined) {
                expandedList.push({文字: baseChar, 数値: charToNum[baseChar]});
                expandedList.push({文字: mark, 数値: charToNum[mark]});
            } else {
                unknownChars = true;
                break;
            }
        } else {
            unknownChars = true;
            break;
        }
    }

    if (unknownChars) {
        resultDiv.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> <div>リストにない文字、または分解できない文字が含まれています。</div></div>';
        return;
    }

    // RSA暗号化
    const encryptedNums = expandedList.map(item => {
        return modPow(BigInt(item.数値), e, n).toString();
    });

    // 結果を表示
    let html = '<div class="result-card scale-in">';
    html += '<div class="result-header">';
    html += '<div class="result-title"><i class="fas fa-lock"></i> 暗号化結果</div>';
    html += '</div>';

    html += '<table class="table table-bordered"><thead><tr>';
    encryptedNums.forEach((_, i) => {
        html += `<th>文字${i + 1}</th>`;
    });
    html += '</tr></thead><tbody><tr>';
    encryptedNums.forEach(num => {
        html += `<td>${num}</td>`;
    });
    html += '</tr></tbody></table>';

    const encryptedText = encryptedNums.join(' ');
    html += '<div class="key-display" style="margin-top: 2rem;">';
    html += '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">';
    html += '<div style="display: flex; align-items: center; gap: 1rem;">';
    html += '<i class="fas fa-copy" style="font-size: 1.5rem; color: var(--primary-color);"></i>';
    html += '<h6 style="margin: 0;">暗号文（コピーして相手に送信）</h6>';
    html += '</div>';
    html += `<button class="btn-modern btn-secondary" onclick="copyToClipboard('${encryptedText}')"><i class="fas fa-clipboard"></i> コピー</button>`;
    html += '</div>';
    html += `<p style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; margin: 0; word-break: break-all;">${encryptedText}</p>`;
    html += '</div>';
    html += '</div>';

    resultDiv.innerHTML = html;
}

// 復号を実行
function decrypt() {
    const n = BigInt(document.getElementById('decrypt-n').value);
    const d = BigInt(document.getElementById('decrypt-d').value);
    const ciphertext = document.getElementById('ciphertext').value;
    const resultDiv = document.getElementById('decrypted-result');

    const encryptedList = ciphertext.trim().split(/\s+/).filter(num => /^\d+$/.test(num));

    if (encryptedList.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> <div>暗号化された数値を入力してください。</div></div>';
        return;
    }

    // RSA復号
    const decryptedNums = encryptedList.map(num => {
        return Number(modPow(BigInt(num), d, n));
    });

    // 数値を文字に変換
    const decryptedChars = decryptedNums.map(num => numToChar[num] || '?');

    // 結果を表示
    let html = '<div class="result-card scale-in">';
    html += '<div class="result-header">';
    html += '<div class="result-title"><i class="fas fa-unlock"></i> 復号結果</div>';
    html += '</div>';

    html += '<table class="table table-bordered"><thead><tr>';
    decryptedChars.forEach((_, i) => {
        html += `<th>文字${i + 1}</th>`;
    });
    html += '</tr></thead><tbody><tr>';
    decryptedChars.forEach(char => {
        html += `<td>${char}</td>`;
    });
    html += '</tr></tbody></table>';

    const decryptedText = decryptedChars.join('');
    html += '<div class="key-display" style="margin-top: 2rem; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-left-color: var(--success-color);">';
    html += '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">';
    html += '<i class="fas fa-check-circle" style="font-size: 2rem; color: var(--success-color);"></i>';
    html += '<h6 style="margin: 0;">復号されたメッセージ</h6>';
    html += '</div>';
    html += `<h3 style="color: var(--success-color); font-size: 2.5rem;">${decryptedText}</h3>`;
    html += '</div>';
    html += '</div>';

    resultDiv.innerHTML = html;
}

// クリップボードにコピー
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // 成功メッセージを表示
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> クリップボードにコピーしました';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, var(--success-color), #34d399);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
        alert('コピーに失敗しました');
    });
}

// アニメーション用CSS（動的に追加）
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    .step-explanation {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
    }

    .calc-step {
        padding: 1rem;
        background: white;
        border-radius: 8px;
        margin: 0.75rem 0;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .calc-step i {
        color: var(--primary-color);
        font-size: 1.25rem;
    }

    .calc-step .highlight {
        color: var(--primary-color);
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);

// 鍵のエクスポート/インポート機能
function exportPublicKey(n, e) {
    const keyData = {
        type: 'public',
        n: n,
        e: e,
        timestamp: new Date().toISOString()
    };
    downloadJSON(keyData, `public_key_${Date.now()}.json`);
    showToast('公開鍵をエクスポートしました', 'success');
}

function exportPrivateKey(n, d) {
    const keyData = {
        type: 'private',
        n: n,
        d: d,
        timestamp: new Date().toISOString()
    };
    downloadJSON(keyData, `private_key_${Date.now()}.json`);
    showToast('秘密鍵をエクスポートしました', 'success');
}

function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importPublicKeyForEncrypt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const keyData = JSON.parse(event.target.result);
                    if (keyData.type === 'public') {
                        document.getElementById('encrypt-n').value = keyData.n;
                        document.getElementById('encrypt-e').value = keyData.e;
                        showToast('公開鍵をインポートしました', 'success');
                    } else {
                        showToast('公開鍵ファイルを選択してください', 'error');
                    }
                } catch (err) {
                    showToast('ファイルの読み込みに失敗しました', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function importPrivateKeyForDecrypt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const keyData = JSON.parse(event.target.result);
                    if (keyData.type === 'private') {
                        document.getElementById('decrypt-n').value = keyData.n;
                        document.getElementById('decrypt-d').value = keyData.d;
                        showToast('秘密鍵をインポートしました', 'success');
                    } else {
                        showToast('秘密鍵ファイルを選択してください', 'error');
                    }
                } catch (err) {
                    showToast('ファイルの読み込みに失敗しました', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// サンプルデータ読み込み
function loadSampleKey() {
    document.getElementById('prime-p').value = '61';
    document.getElementById('prime-q').value = '53';
    updateKeyGen();
    showToast('サンプルデータを読み込みました', 'success');
}

function loadSamplePlaintext() {
    document.getElementById('plaintext').value = 'こんにちは';
    document.getElementById('encrypt-n').value = '3233';
    document.getElementById('encrypt-e').value = '17';
    processPlaintext();
    showToast('サンプルデータを読み込みました', 'success');
}

function loadSampleDecrypt() {
    document.getElementById('decrypt-n').value = '3233';
    document.getElementById('decrypt-d').value = '2753';
    document.getElementById('ciphertext').value = '2790 871 2511 2511 668 1793 913';
    showToast('サンプルデータを読み込みました', 'success');
}

// トースト通知
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };

    const colorMap = {
        'success': 'var(--success-color)',
        'error': 'var(--danger-color)',
        'info': 'var(--info-color)',
        'warning': 'var(--warning-color)'
    };

    toast.innerHTML = `<i class="fas ${iconMap[type]}"></i> ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${colorMap[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// キーボードショートカットの設定
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + D でダークモード切り替え
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }

        // Alt + 1-4 でタブ切り替え
        if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const tabs = ['home-tab', 'keygen-tab', 'encrypt-tab', 'decrypt-tab'];
            document.getElementById(tabs[tabIndex]).click();
            showToast(`${['ホーム', '鍵生成', '暗号化', '復号'][tabIndex]}タブに切り替えました`, 'info');
        }

        // Ctrl/Cmd + Enter で実行ボタン
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab.id === 'encrypt') {
                encrypt();
            } else if (activeTab.id === 'decrypt') {
                decrypt();
            }
        }
    });
}

// ダークモード切り替え
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const icon = document.querySelector('#theme-toggle i');

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // アイコンを変更
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// 保存されたテーマを読み込む
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    const icon = document.querySelector('#theme-toggle i');

    html.setAttribute('data-theme', savedTheme);

    if (savedTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// リアルタイムバリデーション
function setupInputValidation() {
    // 平文入力のバリデーション
    const plaintextInput = document.getElementById('plaintext');
    plaintextInput.addEventListener('input', (e) => {
        const value = e.target.value;
        let isValid = true;
        let message = '';

        if (value.length === 0) {
            isValid = true;
            message = '';
        } else {
            // 全角ひらがな、全角英数字・記号をチェック
            for (let ch of value) {
                if (charToNum[ch] === undefined && !dakutenMap[ch]) {
                    isValid = false;
                    message = `「${ch}」はサポートされていない文字です`;
                    break;
                }
            }
            if (isValid) {
                message = `${value.length}文字入力済み`;
            }
        }

        // 入力フィールドのスタイルを更新
        if (value.length > 0) {
            if (isValid) {
                plaintextInput.style.borderColor = 'var(--success-color)';
            } else {
                plaintextInput.style.borderColor = 'var(--danger-color)';
            }
        } else {
            plaintextInput.style.borderColor = 'var(--border-color)';
        }
    });

    // 数値入力のバリデーション
    const numberInputs = ['encrypt-n', 'encrypt-e', 'decrypt-n', 'decrypt-d'];
    numberInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 1 || isNaN(value)) {
                input.style.borderColor = 'var(--danger-color)';
            } else {
                input.style.borderColor = 'var(--success-color)';
            }
        });
    });
}

// ツールチップの初期化
function initTooltips() {
    const tooltips = [
        { selector: '#prime-p', text: 'RSA暗号の基礎となる素数。大きいほど安全性が高まります。' },
        { selector: '#prime-q', text: 'もう一つの素数。pとは異なる値を選んでください。' },
        { selector: '#plaintext', text: 'ポケベル暗号でサポートされている文字を入力してください。' },
        { selector: '#encrypt-n', text: '公開鍵の一部。n = p × q で計算されます。' },
        { selector: '#encrypt-e', text: '公開鍵の一部。zと互いに素である必要があります。' },
        { selector: '#decrypt-n', text: '暗号化時に使用したnの値を入力してください。' },
        { selector: '#decrypt-d', text: '秘密鍵。この値は絶対に秘密にしてください。' }
    ];

    tooltips.forEach(({ selector, text }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('title', text);
            element.setAttribute('data-tooltip', text);
        }
    });
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // テーマの読み込み
    loadTheme();

    // テーマ切り替えボタン
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // 鍵生成タブ
    document.getElementById('prime-p').addEventListener('change', updateKeyGen);
    document.getElementById('prime-q').addEventListener('change', updateKeyGen);

    // 暗号化タブ
    document.getElementById('plaintext').addEventListener('input', processPlaintext);
    document.getElementById('encrypt-btn').addEventListener('click', encrypt);

    // 復号タブ
    document.getElementById('decrypt-btn').addEventListener('click', decrypt);

    // 初期状態で鍵生成を更新
    updateKeyGen();

    // キーボードショートカットの設定
    setupKeyboardShortcuts();

    // 入力検証の設定
    setupInputValidation();

    // ツールチップの初期化
    initTooltips();
});
