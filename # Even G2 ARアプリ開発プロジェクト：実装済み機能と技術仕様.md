# Even G2 ARアプリ開発プロジェクト：実装済み機能と技術仕様

## 1. プロジェクト概要
* **デバイス**: Even Realities G2 ARグラス
* **開発スタック**: TypeScript, Vite, Even Hub SDK
* **手法**: バイブコーディング (Vibe Coding)

## 2. ディスプレイ制御 (Glasses Display)
* **表示領域**: 640px × 200px
* **初期表示処理**: `waitForEvenAppBridge()` 完了後、1秒の待機を入れてから `createStartUpPageContainer` を実行することで、描画エンジンの立ち上がりを待つ
* **表示更新処理**: 既存コンテナのテキスト変更には `rebuildPageContainer` を使用する
* **パラメータ**: `isEventCapture: 1` を設定することで、メガネ側からの物理操作イベントを検知可能にする

## 3. イベント判定ロジック (Pongサンプル準拠)
メガネ側の物理ボタンイベントは `onEvenHubEvent` で取得し、以下の構造に基づいて判定する。

| イベント名 | 対応ボタン | 判定ロジック (eventType) |
| :--- | :--- | :--- |
| **CLICK_EVENT** | Click | `0` または `event.sysEvent` の存在 |
| **SCROLL_TOP_EVENT** | Up | `1` |
| **SCROLL_BOTTOM_EVENT** | Down | `2` |
| **DOUBLE_CLICK_EVENT** | Double Click | `3` |

## 4. 実装済み機能
* **自動接続表示**: アプリ起動・接続から1秒後に 「Connected!」 を自動表示
* **双方向通信**: 
    * メガネ側の全ボタン（Up/Down/Click/Double Click）に反応してグラス内のテキストを即座に更新
    * Browser（スマホ）側の 「RESET DISPLAY」 ボタン（色: #6c757d）押下で初期状態へ復帰
* **UIデザイン**: Browser側はシックなグレー系のボタンを採用

## 5. 既知の仕様・注意点
* グラス下部の緑色のバーは、描画領域の端または通信状態を示すシステムインジケータである
* イベント名が `undefined` になる場合でも、オブジェクト構造自体をチェックすることでボタン押下を判定可能である