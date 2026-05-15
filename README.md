# Blender Gallery

Blenderで制作した3DCG作品をまとめたポートフォリオサイトです。  
画像・動画・3Dモデルを組み合わせて、作品ごとの質感や動きを見せられるギャラリーとして制作しています。

## 概要

このサイトでは、Blenderで作成した作品を一覧で確認できます。  
トップにはThree.jsで読み込んだ3Dモデルを配置し、作品エリアではサムネイルを選択するとメイン表示が切り替わります。

## 主な機能

- Blender作品のギャラリー表示
- 画像・動画による作品紹介
- サムネイルクリックによる作品切り替え
- 新しい順・古い順の並び替え
- Three.jsを使った3Dモデル表示
- PC向けの3Dカスタムカーソル

## 使用技術

- HTML
- CSS
- JavaScript
- Three.js
- GLTFLoader
- Blender

## ファイル構成

```txt
.
├── index.html
├── style.css
├── script.js
├── monkey-model.js
├── cursor-model.js
├── images/
├── videos/
└── models/
```

## 起動方法

このサイトは静的サイトなので、ローカルサーバーで起動して確認できます。

```bash
python -m http.server 8000
```

起動後、ブラウザで以下にアクセスします。

```txt
http://localhost:8000
```

## 作品データの追加方法

作品は `script.js` の `works` 配列で管理しています。  
新しい作品を追加する場合は、画像や動画を `images/`・`videos/` に配置してから、以下のような形式でデータを追加します。

```js
{
  title: "作品名",
  description: "作品の説明",
  image: "images/example.png",
  video: "videos/example.mp4",
  imageRatio: "1 / 1",
  videoRatio: "1 / 1",
}
```

## 補足

Three.jsはCDNから読み込んでいます。  
3Dモデルや動画を正しく表示するため、HTMLファイルを直接開くのではなく、ローカルサーバー経由で確認することをおすすめします。
