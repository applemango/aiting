![head](./asset/header.gif)

> [!IMPORTANT]
> In Development!

## Feature

  - たった数文字書くだけであとはAIが勝手に続きを書いてくれます
  - シンプルなUIで余計な情報をそぎ落とし、ユーザーに迷いを与えません!

## TODO

* [X] オートコンプリート
* [ ] 文章のスタイルをワンクリックで変えられる
* [ ] 一度作った文章の保存

## よくわからないはなし

さて、一応ファイル構成や技術スタックを説明しておきます

**ファイル構造**

- `index.html`

  - このファイルは何もしませんただ
    いわゆる `static`なサイトだと.htmlではないとサイトを表示できないから使っているだけで本体は`./app/page.js`です

- `app`
  - `html`の代わりに作成された `js`が入っています
- `hook`, `components`
  - `react`に寄せてるので多分読めます
- `editor`
  - editor関連のコードですが、現在はeditorの内部機能を支配する`./editor/hook`しか入っておらず基本`./app/page.js`に含まれています

**技術スタック**

- vanilla js
- vanilla html
- vanilla css