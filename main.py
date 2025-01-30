import streamlit as st
import pandas as pd
import numpy as np
from PIL import Image

st.set_page_config(
    page_title="RSA暗号体験",
)

#-----------------------------------------------------------------------
# タブの作成
#-----------------------------------------------------------------------
tab1, tab2, tab3, tab4 = st.tabs(["トップページ", "鍵生成", "暗号化", "復号"])


#=======================
# タブ1: トップページ
#=======================
with tab1:
    st.title("RSA暗号体験")
    st.caption("Created by Dit-Lab.(Daiki Ito)")
    st.write("")
    st.subheader("ブラウザでRSA暗号の「鍵生成」→「暗号化」→「復号」まで体験することができます")
    st.subheader("RSA暗号とは")
    st.write("RSA暗号…公開鍵暗号方式で使われる代表的な暗号アルゴリズム")
    st.write("　→　コンピュータで素因数分解しようとしても、大きな数であれば膨大な時間がかかる仕組みを利用した暗号")
    st.write("")
    st.subheader("RSA暗号体験Webアプリケーションの使い方")
    st.write("①　ペアで「受信者」「送信者」の役割を決める")
    st.write("②　受信者は「鍵生成」ページで「秘密鍵（開ける鍵）」 「公開鍵（閉める鍵）」を作成")
    st.write("③　受信者は「公開鍵（閉める鍵）」を送信者に渡す")
    st.write("④　送信者は、「暗号化」ページで暗号化したい文字（ねむい 等）を決める（平文）")
    st.write("　※便宜上 ポケベル暗号を使用します (本来は文字コードで行います)")
    
    image_top = Image.open('ポケベル暗号.png')
    st.image(image_top)

    st.write("⑤　送信者は、平文を公開鍵を使って暗号化する")
    st.write("⑥　送信者は、暗号化した文字を受信者に渡す")
    st.write("⑦　受信者は、「復号」ページで受け取った暗号文を、秘密鍵を使って復号する")

    st.write('ご意見・ご要望は→', 'https://forms.gle/G5sMYm7dNpz2FQtU9', 'まで')
    st.markdown('© 2022-2025 Dit-Lab.(Daiki Ito). All Rights Reserved.')


#=======================
# タブ2: 鍵生成
#=======================
with tab2:
    st.title("RSA暗号体験（鍵生成）")
    st.caption("Created by Dit-Lab.(Daiki Ito)")
    st.write("")
    st.subheader("ブラウザでRSA暗号の「鍵生成」→「暗号化」→「復号」まで体験することができます")
    st.write("")
    st.subheader("鍵生成")

    # p, q の候補となる素数
    sp = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
          53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

    sq = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
          53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

    st.write("①　0~100 内の素数( p )を選択")
    p = st.selectbox("素数 p を選択してください", sp)
    st.write("②　0~100 内の素数( q )を選択")
    q = st.selectbox("素数 q を選択してください", sq)

    if p == q:
        st.error("【エラー】 p と q が同じ数字のため、鍵生成を実行できません。pとqは別々の数字にしてください。")
    elif p * q < 143:
        st.warning("【エラー】 p と q が小さい or 近すぎるため、鍵生成を実行できません。")
        st.warning("【エラー】 p と q < 143 になるような数字にしてください。")
    else:
        st.success("条件を満たしています。次のステップに進みます。")
        n = p * q
        z = (p - 1) * (q - 1)

        st.write(f"③　n = p × q を求めます。 p ( {p} ) × q ( {q} ) のため、 n は {n} になります。")
        st.write(f"④　z = ( p - 1 ) × ( q - 1 ) を求めます。 p - 1 = {p - 1}、 q - 1 = {q - 1} のため、z は {z} になります。")

        st.write("⑤　z を割ることのできない素数( e )を選んでください。")
        se = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
              53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

        e = st.selectbox("e を選択してください", se)

        if z % e == 0:
            st.error(f"e ( {e} ) は z ( {z} ) を割ることができます。")
            st.error(f"z ( {z} ) ÷ e ( {e} ) = {z // e}")
        else:
            st.success("条件を満たしています。次のステップに進みます。")
            st.write("⑥　m ( p - 1 )( q - 1 )  ≡ 1 （ mod e ）となる数（ m ）を求める（1≦m≦e-1）")
            st.write(f"z ( {z} ) × m と -1 を e ( {e} ) で割って、余りが等しくなる数 ( m ) を求めます。")
            st.write(f"ただし、m は 1 以上、e - 1 ( {e - 1} ) 以下でないといけません。 ( 1 ≦ m ≦ {e - 1} )")
            st.write("つまり、「zm を e で割った余り」と「-1 を e で割った余り」が等しくなるような m を探してください")
            st.write(f"-1 を e ( {e} ) で割った余りは {(-1 % e)} です。")
            st.write(f"→ {z}  × m を e ( {e} ) で割った余りが {(-1 % e)} になるような m を探してください。")

            m = st.number_input("m を選択してください（1 ≦ m ≦ " + str(e - 1) + "）", min_value=1,max_value=e-1, value=1, step=1)

            if (-1 % e) != ((z * m) % e):
                st.error("【エラー】「zm を e で割った余り」と「-1 を e で割った余り」が等しくありません")
            else:
                st.success("条件を満たしています。")
                d = (m * z + 1) // e
                st.write(f"⑦　m ( {m} ) × ( p - 1 )( q - 1 ) + 1 を e ( {e} ) で割った商（ d ）を求めます。d は {d} です。")
                st.write("")
                st.write("公開鍵（n,e）と秘密鍵（p,q,d）の生成が完了しました。")
                st.subheader("公開鍵（相手に教える値）")
                st.markdown(f"<h3>n = {n}、e = {e}</h3>", unsafe_allow_html=True)
                st.subheader("秘密鍵（教えてはいけない値 ）")
                st.markdown(f"<h3>p = {p}、q = {q}、d = {d}</h3>", unsafe_allow_html=True)

    st.write('ご意見・ご要望は→', 'https://forms.gle/G5sMYm7dNpz2FQtU9', 'まで')
    st.markdown('© 2022-2025 Dit-Lab.(Daiki Ito). All Rights Reserved.')


#=======================
# タブ3: 暗号化
#=======================
with tab3:
    st.title("RSA暗号体験（暗号化）")
    st.caption("Created by Dit-Lab.(Daiki Ito)")
    st.write("")
    st.subheader("ブラウザでRSA暗号の「鍵生成」→「暗号化」→「復号」まで体験することができます")
    st.write("暗号化には便宜上ポケベル暗号を使っています（本来は文字コード）")

    image_encrypt = Image.open('ポケベル暗号.png')
    st.image(image_encrypt)

    #---------------------------------------------------
    # ポケベル暗号リスト読み込み
    #（Excelファイル名に注意: "ポケベル暗号リスト.xlsx"）
    #---------------------------------------------------
    pocketbell_df = pd.read_excel("ポケベル暗号リスト.xlsx")
    # 例: pocketbell_df['文字']: "あ", "い", ...
    #     pocketbell_df['数字']: 11,   12,   ...
    pocketbell_dict = dict(zip(pocketbell_df['文字'], pocketbell_df['数字']))

    #---------------------------------------------
    # 濁点・半濁点を分解するためのマップ
    #---------------------------------------------
    dakuten_handakuten_map = {
        'が': ('か','゛'), 'ぎ': ('き','゛'), 'ぐ': ('く','゛'), 'げ': ('け','゛'), 'ご': ('こ','゛'),
        'ざ': ('さ','゛'), 'じ': ('し','゛'), 'ず': ('す','゛'), 'ぜ': ('せ','゛'), 'ぞ': ('そ','゛'),
        'だ': ('た','゛'), 'ぢ': ('ち','゛'), 'づ': ('つ','゛'), 'で': ('て','゛'), 'ど': ('と','゛'),
        'ば': ('は','゛'), 'び': ('ひ','゛'), 'ぶ': ('ふ','゛'), 'べ': ('へ','゛'), 'ぼ': ('ほ','゛'),
        'ぱ': ('は','°'), 'ぴ': ('ひ','°'), 'ぷ': ('ふ','°'), 'ぺ': ('へ','°'), 'ぽ': ('ほ','°'),
    }

    # 平文入力
    raw_text = st.text_input("暗号化したい文字列を入力（入力後、Enterを押してください）")
    st.caption("※ 「全角ひらがな」や「全角英数字・記号」で入力してください")

    if str(raw_text) == "":
        st.error("【エラー】暗号化したい文字列を入力してください。")
    else:
        # ---- 文字 → ポケベル数値 への変換 ----
        #  1. 濁点・半濁点付きかどうかを判定
        #  2. 分解後、それぞれポケベル暗号の数値を取得
        #  3. 1ペア(文字,数値)の配列を作り、行ごとに表を作る
        expanded_list = []
        unknown_chars = False

        for ch in raw_text:
            if ch in pocketbell_dict:
                # 1文字そのまま変換
                expanded_list.append((ch, pocketbell_dict[ch]))
            elif ch in dakuten_handakuten_map:
                # 濁点/半濁点付き文字を分解
                base_char, mark = dakuten_handakuten_map[ch]
                if base_char in pocketbell_dict and mark in pocketbell_dict:
                    expanded_list.append((base_char, pocketbell_dict[base_char]))
                    expanded_list.append((mark, pocketbell_dict[mark]))
                else:
                    unknown_chars = True
                    break
            else:
                unknown_chars = True
                break

        if unknown_chars:
            st.warning("【エラー】リストにない文字、または分解できない文字が含まれています。")
        else:
            # expanded_list 例: [('か','21'), ('゛','04'), ('い','12'), ('こ','25'), ...]
            # -> DataFrame化
            encrypt_df = pd.DataFrame(expanded_list, columns=['文字','数値'])
            st.write("入力文字の分解・数値化結果:")
            st.write(encrypt_df)

            # 全数値をまとめて、RSA公開鍵で暗号化
            # 数値はintにしてリスト化
            pocketbell_nums = [int(num) for _, num in expanded_list]
            st.write("上記の数値リスト:",
                     ' '.join(str(n) for n in pocketbell_nums))

            # 公開鍵の入力
            st.write("受け取った「公開鍵（ n、e ）」を入力してください。")
            n_val = st.number_input("公開鍵( n )を入力してください。", min_value=1, value=1, step=1)
            e_val = st.number_input("公開鍵( e )を入力してください。", min_value=1, value=1, step=1)

            if st.button("暗号化実行"):
                encrypted_text = [pow(num, e_val, n_val) for num in pocketbell_nums]
                # 結果をDataFrame表示
                df_enc = pd.DataFrame({'暗号化された数値': encrypted_text}).T
                df_enc.columns = ['文字' + str(i+1) for i in range(len(encrypted_text))]
                st.write(df_enc)

    st.write('ご意見・ご要望は→', 'https://forms.gle/G5sMYm7dNpz2FQtU9', 'まで')
    st.markdown('© 2022-2025 Dit-Lab.(Daiki Ito). All Rights Reserved.')


#=======================
# タブ4: 復号
#=======================
with tab4:
    st.title("RSA暗号体験（復号）")
    st.caption("Created by Dit-Lab.(Daiki Ito)")
    st.write("")
    st.subheader("RSA暗号の「復号」プロセスを体験することができます")
    st.write("復号には、暗号化された数値と秘密鍵が必要です")

    #---------------------------------------------------
    # ポケベル暗号リスト読み込み（復号用）
    # key=数値, value=文字 になるようにdictを再構築
    #---------------------------------------------------
    pocketbell_df2 = pd.read_excel("ポケベル暗号リスト.xlsx")
    pocketbell_dict_dec = dict(zip(pocketbell_df2['数字'], pocketbell_df2['文字']))

    # 秘密鍵・公開鍵の一部(n)などの入力
    n_val = st.number_input("公開鍵( n )を入力してください", min_value=1, value=1, step=1)
    d_val = st.number_input("秘密鍵( d )を入力してください", min_value=1, value=1, step=1)

    # 暗号化された数値の入力
    encrypted_text_input = st.text_area("暗号化された数値をスペース区切りで入力してください")
    encrypted_list = [num for num in encrypted_text_input.split() if num.isdigit()]
    encrypted_text_nums = [int(num) for num in encrypted_list]

    if st.button("復号実行"):
        # RSA復号
        decrypted_nums = [pow(num, d_val, n_val) for num in encrypted_text_nums]

        # 復号された数値をポケベル暗号 -> 文字 に変換
        decrypted_chars = [pocketbell_dict_dec.get(num, '?') for num in decrypted_nums]

        # 結果をデータフレームで表示
        decrypted_df = pd.DataFrame({'復号された文字': decrypted_chars}).T
        decrypted_df.columns = ['文字' + str(i+1) for i in range(len(decrypted_chars))]
        st.write(decrypted_df)

    st.write('ご意見・ご要望は→', 'https://forms.gle/G5sMYm7dNpz2FQtU9', 'まで')
    st.markdown('© 2022-2025 Dit-Lab.(Daiki Ito). All Rights Reserved.')
