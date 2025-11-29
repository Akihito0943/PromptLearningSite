# PromptQuest (プロンプトクエスト)

🎮 ゲーム形式でプロンプトスキルを学習できるWebサイト

## 概要

PromptQuestは、生成AIのプロンプトエンジニアリングスキルを楽しく学べる、ゲーム形式の学習プラットフォームです。
初心者から上級者まで、段階的にスキルアップできる様々なチャレンジが用意されています。

### 主な特徴

- 🎯 **ゲーム形式の学習**: クエスト形式でプロンプトスキルを習得
- 🤖 **AI即時評価**: GitHub Modelsを使用したリアルタイムのプロンプト評価
- 🏆 **経験値とレベルシステム**: スコアに応じてXPを獲得し、レベルアップ
- 🌐 **多言語対応**: 日本語と英語に対応（ワンクリックで切り替え可能）
- 📱 **レスポンシブデザイン**: デスクトップ・モバイル両対応
- ✨ **モダンなUI**: 明るくおしゃれなデザイン

## 技術スタック

- **バックエンド**: Node.js + Express
- **フロントエンド**: HTML, CSS, JavaScript (Vanilla JS)
- **テンプレートエンジン**: EJS
- **AI評価**: GitHub Models API (gpt-4o-mini)
- **国際化**: JSON形式の言語リソースファイル

## セットアップ方法

### 前提条件

- Node.js (v16以上推奨)
- GitHub Personal Access Token（GitHub Models APIの利用に必要）

### インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/chack411/PromptLearningSite1016.git
cd PromptLearningSite1016
```

2. 依存パッケージをインストール

```bash
npm install
```

3. 環境変数を設定

`.env.example`を`.env`にコピーして、GitHub Tokenを設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集して、GitHubトークンを設定：

```env
GITHUB_TOKEN=your_actual_github_token_here
PORT=3000
```

**GitHub Tokenの取得方法**:
1. https://github.com/settings/tokens にアクセス
2. "Generate new token" をクリック
3. 必要な権限を選択（GitHub Modelsの利用には特別なスコープは不要）
4. トークンを生成してコピー

4. サーバーを起動

```bash
npm start
```

5. ブラウザでアクセス

```
http://localhost:3000
```

## 使い方

### 基本的な流れ

1. **チャレンジを選ぶ**: ホーム画面またはチャレンジ一覧から、挑戦したいチャレンジを選択
2. **プロンプトを作成**: 課題の説明と目標を読んで、最適なプロンプトを考える
3. **提出する**: プロンプトを入力して「提出する」ボタンをクリック
4. **結果を確認**: AIが即座に評価し、スコアとフィードバックを表示
5. **XPを獲得**: スコアに応じて経験値（XP）を獲得し、レベルアップ

### 言語の切り替え

画面右上の言語スイッチャーで、日本語と英語を切り替えられます。

### チャレンジの難易度

- 🟢 **初級 (Beginner)**: プロンプトの基本を学ぶ（XP: 50）
- 🟡 **中級 (Intermediate)**: より高度なテクニックを習得（XP: 75-100）
- 🔴 **上級 (Advanced)**: 実践的なシナリオに挑戦（XP: 100-150）

## プロジェクト構成

```
PromptLearningSite1016/
├── server.js              # Expressサーバーのメインファイル
├── package.json           # プロジェクト設定と依存関係
├── .env.example          # 環境変数のサンプル
├── .gitignore            # Git除外設定
├── README.md             # このファイル
├── data/                 # データファイル
│   └── challenges.json   # チャレンジデータ
├── locales/              # 国際化リソース
│   ├── ja.json          # 日本語翻訳
│   └── en.json          # 英語翻訳
├── public/              # 静的ファイル
│   ├── css/
│   │   └── style.css    # スタイルシート
│   ├── js/
│   │   └── main.js      # フロントエンドJS
│   └── images/          # 画像ファイル
├── views/               # EJSテンプレート
│   ├── layout.ejs       # 共通レイアウト
│   ├── index.ejs        # ホームページ
│   ├── challenges.ejs   # チャレンジ一覧
│   ├── challenge-detail.ejs  # チャレンジ詳細
│   ├── leaderboard.ejs  # ランキング
│   └── profile.ejs      # プロフィール
└── documents/           # ドキュメント
    └── Summary-Requirements-prompt-learning-site.md
```

## 機能一覧

### 実装済み機能

- ✅ ホームページ（ヒーローセクション、注目チャレンジ、使い方）
- ✅ チャレンジ一覧ページ
- ✅ チャレンジ詳細ページ（プロンプト入力・提出）
- ✅ GitHub Models APIによるリアルタイムプロンプト評価
- ✅ スコアリングとフィードバック表示
- ✅ 経験値（XP）とレベルシステム
- ✅ ランキングページ
- ✅ プロフィールページ（進捗確認）
- ✅ 日本語・英語の多言語対応
- ✅ レスポンシブデザイン
- ✅ モダンで明るいUIデザイン

### 今後の拡張案

- 🔲 ユーザー認証機能
- 🔲 データベース連携（SQLite/MongoDB）
- 🔲 バッジ・称号システム
- 🔲 日替わり/週替わりチャレンジ
- 🔲 ユーザー間のコミュニケーション機能
- 🔲 チャレンジの追加と難易度調整
- 🔲 詳細な統計情報とグラフ表示

## 開発

### 開発モードでの起動

```bash
npm run dev
```

### コードの編集

- サーバー側のロジック: `server.js`
- スタイル: `public/css/style.css`
- フロントエンドJS: `public/js/main.js`
- ビュー: `views/*.ejs`
- チャレンジデータ: `data/challenges.json`
- 翻訳: `locales/ja.json`, `locales/en.json`

## ライセンス

ISC

## 作者

chack411

## 貢献

プルリクエストを歓迎します！バグ報告や機能要望は、Issueでお知らせください。

---

© 2024 PromptQuest. All rights reserved.