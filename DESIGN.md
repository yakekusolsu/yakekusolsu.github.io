# UI設計メモ：YousotuNeet's Home Page v4

## コンセプト

**2000年ごろの個人ホームページ × テキスト掲示板 × 遊べるターミナル**。最初は手作りの個人サイト、`sudo apt install neet` の実行後は「YousotuNeetちゃんねる」というスレッド型個人板に変わる。流行りのカード式ポートフォリオやガラス調UIは使わない。

## 通常UI

- 3カラム：左メニュー / 中央のスレッド一覧・個別レス / 右ターミナル
- くすんだ生成り色、紺色のリンク、角丸なし、1px罫線、控えめなビットマップ風要素
- HOME / PROFILE / WORKS / DIARY / BBS / LINKS / TERMINAL
- 画面幅1120px以下は2カラム、740px以下は縦積み

## `neet` パッケージ導入後のUI

- 2カラム：左メニュー / スレッド・レス表示。ターミナルはその下に全幅表示
- 無彩色背景に大きな赤文字の板名。小さい青い下線リンク
- TOPには箇条書き形式のスレッド一覧とスレ数、本文にはレス番号・投稿名・投稿日時・本文
- レスの枠線や影、カード背景は取り去る。モバイルでは左メニューを横並びの板リンクにする
- 通常/neetモードは同じデータを表示する。動作の中心は `app.js` の `renderHome()` / `renderNeetHome()` / `renderThread()`

## 疑似Linux

1. ユーザーはguestで起動する。
2. `sudo su` でrootに昇格（UI上のみ）。`exit` でguestに戻る。
3. `sudo cat /root/secret.txt` はguestから直接読むことができる。権限なしの `cat` は拒否する。
4. `sudo apt install neet` によりインストールログを再現。bodyに `neet-installed` を適用し、TOPのDOMを2ch風に切り替える。
5. `sudo apt remove neet` で元に戻す。rootモードなら `apt ...` だけでも使用可。
6. 導入状態は `yn.neet.installed.v1` に `localStorage` 経由で保存する。保存不能時は表示だけ切り替える。

## 実装の注意点

- コマンドはホワイトリストから明示的に処理し、evalや実際のシェル実行は行わない。
- ユーザー入力とファイルテキストは `textContent` に通し、HTMLとして解釈しない。
- 2chモードの切り替えで現在のURLハッシュは維持し、スレッド閲覧を続行できるようにする。
- スレッドの検索はブラウザ内のみ。公開掲示板用DBやAPIは実装していない。
- `prefers-reduced-motion` を尊重。端末はクリック/キーボード操作可能。
