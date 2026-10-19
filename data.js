/*
 * 編集ポイント：名前・説明・外部リンク・掲示板の内容はこのファイルで管理。
 * URLを持たない外部リンクは「準備中」と表示されます。
 * 外部公開前に必ず自分の情報に書き換えてください。
 */
window.YN_DATA = {
  site: {
    owner: 'YousotuNeet',
    title: "YousotuNeet のホームページ",
    description: 'MinecraftとかWebとか。作ったものを置いてます。',
    updated: '2026.10.19',
    since: '2026'
  },
  links: [
    { label: 'もなか鯖 公式サイト', url: 'https://www.monacraft.net', note: '運営しているMinecraftサーバー' },
    { label: 'GitHub', url: 'https://github.com/yakekusolsu', note: 'なんか色々作ってます' },
    { label: 'Discord - 奈落鯖', url: 'https://discord.gg/KNussuhtnW', note: '私の居場所です' }
  ],
  threads: [
    {
      id: 'profile', title: '【自己紹介】管理人って何してる人？', category: '自己紹介', date: '2026/10/19',
      posts: [
        { subject: 'とりあえず自己紹介', body: [
          { type: 'p', text: 'YousotuNeetです。Minecraftのサーバー運営をしたり、プラグインやWebのものを作ったりしています。' },
          { type: 'p', text: '作りたいと思ったものを色々作ってるので、作業内容は結構バラバラです。' }
        ] },
        { subject: '好きなもの', body: [
          { type: 'list', items: ['Minecraft（サーバー運営・プラグイン関係）', 'Discordコミュニティの運営', 'Webサイト・ちょっとしたツール制作', '昔のインターネットっぽいデザイン'] }
        ] },
        { subject: 'このサイトについて', body: [
          { type: 'p', text: '2000年代の掲示板や個人ホームページをイメージしてHTMLで作りました。たまに更新するつもりです。' },
          { type: 'p', text: '右にある端末も動きます。「help」と打ってみてください。' }
        ] }
      ]
    },
    {
      id: 'works', title: '【制作物】作ったもの・作ってるもの', category: '制作物', date: '2026/10/19',
      posts: [
        { subject: 'もなか鯖 / MONAKA SERVER', body: [
          { type: 'p', text: 'Minecraftのサーバーを運営しています。ゲーム内システムの制作や調整、サイト管理などもやっています。' },
          { type: 'link', text: 'もなか鯖のページを見る', href: '#thread/monaka' }
        ] },
        { subject: 'Mona Resource Studio', body: [
          { type: 'p', text: 'Minecraft向けのリソース関連ツール。必要な機能を考えながら作っているソフトです。' }
        ] },
        { subject: 'MonaWatch Echo', body: [
          { type: 'p', text: 'Minecraftサーバーの状態監視と音声通知を組み合わせる開発プロジェクト。Webのデバッグパネルなども構想しています。' },
          { type: 'small', text: '※ 開発・検討中の内容を含みます。' }
        ] },
        { subject: 'Minecraftプラグイン', body: [
          { type: 'p', text: 'MonaToolsなど、サーバーに必要な独自機能を色々作っています。' }
        ] },
        { subject: 'その他', body: [
          { type: 'p', text: 'WebページやDiscord関連の仕組みなど。まとまったらこのスレッドに追加します。' }
        ] }
      ]
    },
    {
      id: 'monaka', title: '【Minecraft】もなか鯖について', category: 'Minecraft', date: '2026/10/19',
      posts: [
        { subject: 'サーバーのこと', body: [
          { type: 'p', text: 'もなか鯖（MONAKA SERVER）は、自分が運営しているMinecraftサーバーです。Java版・統合版の両方を対象にしています。' },
          { type: 'p', text: '既存のゲーム要素に加えて、独自のプラグインやコンテンツを色々追加しています。' }
        ] },
        { subject: 'どんなことをしてるの？', body: [
          { type: 'list', items: ['サーバー・ネットワークの運営と保守', 'ゲーム内の独自システムやプラグイン制作', 'イベント、経済、各種コンテンツの設計', 'Webサイトや運営ツールの整備'] }
        ] },
        { subject: '公式サイト', body: [
          { type: 'link', text: 'monacraft.net', href: 'https://monacraft.net' }
        ] }
      ]
    },
    {
      id: 'log', title: '【更新履歴】このサイトの更新メモ', category: '日記', date: '2026/10/19',
      posts: [
        { subject: '2026/10/19', body: [
          { type: 'p', text: '個人ホームページを作り直し。掲示板みたいなUIとターミナルを合体させてみました。' },
          { type: 'p', text: '公開用の文章やリンクは少しずつ追加予定。' }
        ] }
      ]
    },
    {
      id: 'links', title: '【リンク集】ほかの場所はこちら', category: 'リンク', date: '2026/10/19',
      posts: [
        { subject: '関連リンク', body: [{ type: 'dynamic-links' }] },
        { subject: 'リンクについて', body: [
          { type: 'p', text: 'このサイトへのリンクはご自由にどうぞ。外部リンクは準備ができたものから追加していきます。' }
        ] }
      ]
    },
    {
      id: 'contact', title: '【連絡先】管理人に連絡したい場合', category: '連絡', date: '2026/10/19',
      posts: [
        { subject: '連絡について', body: [
          { type: 'p', text: '連絡先は公開範囲を確認してから載せる予定です。関連リンクも参照してください。' },
          { type: 'link', text: 'リンク集へ', href: '#thread/links' }
        ] }
      ]
    }
  ]
};
