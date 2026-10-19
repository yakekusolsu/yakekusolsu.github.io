(() => {
  'use strict';
  const DATA = window.YN_DATA;
  if (!DATA) return;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const make = (tag, className = '', text = null) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== null) node.textContent = String(text);
    return node;
  };
  const append = (parent, ...children) => { children.forEach(child => parent.append(child)); return parent; };
  const link = (title, href) => {
    const node = make('a', '', title);
    if (href.startsWith('#') || /^https:\/\//i.test(href)) {
      node.href = href;
      if (/^https:\/\//i.test(href)) {
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
      }
    }
    return node;
  };
  const view = $('#view');
  const content = $('#contents');
  const store = {
    get(key, fallback) { try { const val = localStorage.getItem(key); return val === null ? fallback : JSON.parse(val); } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } }
  };

  function setupHeader() {
    $('#site-description').textContent = DATA.site.description;
    $('#site-updated').textContent = DATA.site.updated;
    $('#copyright-year').textContent = DATA.site.since;
    const visits = Math.max(0, Number(store.get('yn.visits.v1', 0)) || 0) + 1;
    store.set('yn.visits.v1', visits);
    $('#visit-counter').textContent = String(visits).padStart(6, '0');
    function updateClock() {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
      $('#clock').textContent = fmt.format(now);
    }
    updateClock();
    setInterval(updateClock, 30000);
  }

  function paper() { return make('section', 'paper'); }
  function breadcrumb(...parts) {
    const p = make('p', 'location');
    append(p, link('YousotuNeet HOME', '#home'));
    for (const part of parts) append(p, document.createTextNode(' / ' + part));
    return p;
  }
  function heading(text) { return make('h2', 'board-title', text); }
  function sectionHeading(text) { return make('h3', 'section-title', text); }
  function renderNeetHome() {
    view.replaceChildren();
    const panel = paper();
    panel.classList.add('neet-index');
    append(panel, breadcrumb('個人板', 'スレッド一覧'));
    panel.append(make('h2', 'neet-index-title', 'YousotuNeetちゃんねる＠個人板'));
    panel.append(make('p', 'neet-board-description', 'Minecraft、Web、制作物、あと適当な雑記。管理人が一人で書いている謎の板です。'));
    const bar = make('div', 'neet-index-bar', '■ スレッド一覧 ■');
    panel.append(bar);
    const search = make('div', 'bbs-search');
    const label = make('label', '', 'スレッド検索：'); label.htmlFor = 'thread-search';
    const input = make('input'); input.type = 'search'; input.id = 'thread-search'; input.placeholder = '検索ワード';
    append(search, label, input);
    panel.append(search);
    const list = make('ol', 'neet-thread-list');
    DATA.threads.forEach(thread => {
      const li = make('li');
      li.dataset.search = `${thread.title} ${thread.category}`.toLowerCase();
      append(li, link(thread.title, '#thread/' + thread.id), document.createTextNode(` (${thread.posts.length})`));
      list.append(li);
    });
    panel.append(list);
    const count = make('p', 'neet-index-count', `${DATA.threads.length} スレッドを表示中`);
    input.addEventListener('input', () => {
      let visible = 0;
      for (const li of list.children) {
        li.hidden = !li.dataset.search.includes(input.value.trim().toLowerCase());
        if (!li.hidden) visible++;
      }
      count.textContent = `${visible} スレッドを表示中`;
    });
    panel.append(count);
    panel.append(make('div', 'neet-index-bar', '■ 板の案内 ■'));
    const guide = make('p', 'neet-guide');
    append(guide, document.createTextNode('名無しさん歓迎。ここは公開掲示板ではありません。  '),
      link('管理人のプロフィール', '#thread/profile'), document.createTextNode(' / '),
      link('落書き帳（ローカル）', '#guestbook'), document.createTextNode(' / '),
      link('端末はこちら', '#terminal-column'));
    panel.append(guide);
    view.append(panel);
    document.title = 'YousotuNeetちゃんねる - 個人板';
  }

  function renderHome() {
    if (neetInstalled) return renderNeetHome();
    view.replaceChildren();
    const top = paper();
    append(top, breadcrumb('スレッド一覧'), heading('ようこそ。'),
      make('p', 'board-intro', 'このページは YousotuNeet の個人サイトです。自己紹介とか制作物とか、適当にまとめています。'));
    const note = make('div', 'notice');
    append(note, make('strong', '', 'お知らせ：'), document.createTextNode(' このサイトは制作中です。リンク先や内容は随時追加していきます。'));
    top.append(note, sectionHeading('スレッド一覧'));
    const search = make('div', 'bbs-search');
    const label = make('label', '', 'タイトル検索：');
    label.htmlFor = 'thread-search';
    const input = make('input');
    input.type = 'search'; input.id = 'thread-search'; input.placeholder = '例：制作物、もなか鯖';
    append(search, label, input);
    top.append(search);
    const table = make('table', 'bbs-table');
    const caption = make('caption', '', '■ 板名：YousotuNeet / 個人ページ（書き込みは管理人のみ）');
    const thead = make('thead');
    const headerRow = make('tr');
    [['No.', ''], ['スレッドタイトル', ''], ['レス', 'col-count'], ['掲載日', 'col-date']].forEach(([name, cls]) => {
      const th = make('th', cls, name); th.scope = 'col'; headerRow.append(th);
    });
    append(thead, headerRow);
    const tbody = make('tbody');
    DATA.threads.forEach((thread, i) => {
      const tr = make('tr');
      tr.dataset.search = `${thread.title} ${thread.category}`.toLowerCase();
      const index = make('td', '', i + 1);
      const title = make('td');
      append(title, link(thread.title, '#thread/' + thread.id), make('span', 'category', '[' + thread.category + ']'));
      const count = make('td', 'col-count', thread.posts.length);
      const date = make('td', 'col-date', thread.date);
      append(tr, index, title, count, date);
      tbody.append(tr);
    });
    append(table, caption, thead, tbody);
    const results = make('p', 'bbs-bottom', `${DATA.threads.length} スレッド / タイトルをクリックして読む`);
    input.addEventListener('input', () => {
      let found = 0;
      for (const tr of tbody.children) {
        const shown = tr.dataset.search.includes(input.value.trim().toLowerCase());
        tr.hidden = !shown;
        if (shown) found++;
      }
      results.textContent = `${found} スレッド表示中`;
    });
    top.append(table, results);
    const more = paper();
    more.append(sectionHeading('はじめて来た人へ'));
    const ul = make('ul', 'latest-list');
    [
      ['管理人の自己紹介を読む', '#thread/profile'],
      ['今までに作ったものを見る', '#thread/works'],
      ['ターミナルで遊ぶ（右側かページ下部）', '#terminal-column'],
      ['落書き帳を試す（このブラウザのみ）', '#guestbook']
    ].forEach(([title, target]) => { const li = make('li'); li.append(link(title, target)); ul.append(li); });
    more.append(ul);
    more.append(make('p', 'small-print', '※ 全ページ、静的なHTML・CSS・JavaScriptで動作します。外部への送信はしていません。'));
    view.append(top, more);
    document.title = "TOP - YousotuNeet's Home Page";
  }

  function renderPostBlock(postBody) {
    const wrapper = make('div', 'post-body');
    for (const block of postBody) {
      if (block.type === 'p') wrapper.append(make('p', '', block.text));
      else if (block.type === 'small') wrapper.append(make('p', 'small-print', block.text));
      else if (block.type === 'list') {
        const ul = make('ul');
        for (const text of block.items) ul.append(make('li', '', text));
        wrapper.append(ul);
      } else if (block.type === 'link') {
        const p = make('p', 'link-line');
        append(p, document.createTextNode('→ '), link(block.text, block.href));
        wrapper.append(p);
      } else if (block.type === 'dynamic-links') {
        for (const record of DATA.links) {
          const p = make('p', 'link-line');
          p.append(document.createTextNode('・'));
          if (record.url && /^https:\/\//i.test(record.url)) p.append(link(record.label, record.url));
          else p.append(make('span', '', record.label + '（準備中）'));
          p.append(document.createTextNode(' — ' + record.note));
          wrapper.append(p);
        }
      }
    }
    return wrapper;
  }

  function renderThread(id) {
    const thread = DATA.threads.find(t => t.id === id);
    if (!thread) return renderNotFound();
    view.replaceChildren();
    const board = paper();
    const top = make('div', 'thread-top');
    append(top, breadcrumb('スレッド', thread.category), make('h2', '', thread.title),
      make('div', 'thread-meta', `${thread.posts.length}レス / このサイトへの掲載日：${thread.date} / 管理人が投稿`));
    board.append(top);
    thread.posts.forEach((post, i) => {
      const el = make('article', 'post'); el.id = `post-${i + 1}`;
      const head = make('div', 'post-head');
      append(head, make('span', 'post-num', `${i + 1}`), document.createTextNode(' ：'),
        make('span', 'post-author', 'YousotuNeet ◆管理人'),
        document.createTextNode(`：${thread.date} `), make('span', 'post-id', 'ID:owner'));
      append(el, head, make('div', 'post-subject', post.subject), renderPostBlock(post.body));
      board.append(el);
    });
    const foot = make('p', 'thread-footnote', '— このスレッドへの投稿は管理人が編集しています。');
    const back = make('p', 'inline-links');
    append(back, link('▲ スレッド一覧へ戻る', '#home'), make('span', 'link-dot', '|'), link('関連：落書き帳', '#guestbook'));
    board.append(foot, back);
    view.append(board);
    document.title = `${thread.title} - YousotuNeet`;
  }

  const GUEST_KEY = 'yn.guestbook.v1';
  function getEntries() {
    const entries = store.get(GUEST_KEY, []);
    return Array.isArray(entries) ? entries.filter(x => x && typeof x.name === 'string' && typeof x.message === 'string').slice(0, 30) : [];
  }
  function renderGuestbook() {
    view.replaceChildren();
    const board = paper();
    append(board, breadcrumb('落書き帳'), heading('落書き帳（試作）'));
    const note = make('div', 'notice');
    append(note, make('strong', '', '重要：'), document.createTextNode(' これはローカル版です。書き込みはこのブラウザ内にのみ保存され、他の人には公開されません。'));
    board.append(note, make('p', 'board-intro', '昔のホームページにありがちな一言掲示板。バックエンドなしで雰囲気だけ体験できます。'));
    const form = make('form', 'entry-form');
    const nameLabel = make('label', '', '名前（20文字まで）'); nameLabel.htmlFor = 'bbs-name';
    const name = make('input'); name.type = 'text'; name.id = 'bbs-name'; name.maxLength = 20; name.required = true; name.placeholder = '名無しさん';
    const msgLabel = make('label', '', 'ひとこと（240文字まで）'); msgLabel.htmlFor = 'bbs-message';
    const msg = make('textarea'); msg.id = 'bbs-message'; msg.maxLength = 240; msg.required = true; msg.placeholder = '記念カキコ';
    const actions = make('div', 'entry-actions');
    const submit = make('button', '', '書き込む'); submit.type = 'submit';
    const clear = make('button', '', 'ローカルの書き込みを消す'); clear.type = 'button';
    append(actions, submit, clear);
    append(form, nameLabel, name, msgLabel, msg, actions);
    const error = make('p', 'small-print'); error.setAttribute('role', 'status');
    const entriesHeading = sectionHeading('書き込み一覧');
    const list = make('ol', 'entry-list');
    function paintEntries() {
      list.replaceChildren();
      const entries = getEntries();
      if (!entries.length) { list.append(make('li', '', 'まだ書き込みはありません。')); return; }
      entries.forEach((record, index) => {
        const li = make('li');
        append(li, make('div', 'entry-meta', `${entries.length - index} ：${record.name}：${record.date || ''}`), make('p', '', record.message));
        list.append(li);
      });
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const username = name.value.trim() || '名無しさん';
      const message = msg.value.trim();
      if (!message) { error.textContent = '本文を入力してください。'; return; }
      const entries = getEntries();
      entries.unshift({ name: username.slice(0, 20), message: message.slice(0, 240), date: new Date().toLocaleString('ja-JP') });
      if (!store.set(GUEST_KEY, entries.slice(0, 30))) { error.textContent = 'この環境では保存できませんでした。ブラウザの設定をご確認ください。'; return; }
      error.textContent = 'このブラウザ内に保存しました。'; msg.value = ''; paintEntries();
    });
    clear.addEventListener('click', () => {
      if (!getEntries().length) { error.textContent = '消す書き込みはありません。'; return; }
      if (window.confirm('このブラウザに保存された書き込みをすべて消しますか？')) {
        store.set(GUEST_KEY, []); error.textContent = '削除しました。'; paintEntries();
      }
    });
    paintEntries();
    board.append(form, error, entriesHeading, list);
    view.append(board);
    document.title = '落書き帳 - YousotuNeet';
  }

  function renderNotFound() {
    view.replaceChildren();
    const panel = paper();
    append(panel, breadcrumb('404'), heading('ページがありません'),
      make('p', '', '指定されたページは見つかりませんでした。'), link('トップページに戻る', '#home'));
    view.append(panel);
    document.title = '404 - YousotuNeet';
  }

  function currentRoute() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash === 'guestbook') return { type: 'guestbook', id: 'guestbook' };
    if (hash.startsWith('thread/')) return { type: 'thread', id: hash.slice(7) };
    return { type: 'home', id: 'home' };
  }
  function route() {
    const { type, id } = currentRoute();
    if (type === 'thread') renderThread(id);
    else if (type === 'guestbook') renderGuestbook();
    else renderHome();
    for (const a of document.querySelectorAll('.top-links a, .folder-menu a')) {
      const href = a.getAttribute('href');
      const selected = href === '#' + (type === 'home' ? 'home' : type === 'guestbook' ? 'guestbook' : 'thread/' + id);
      if (selected) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      if (location.hash && location.hash !== '#terminal-column') content.scrollIntoView({ block: 'start' });
    }
  }

  // ターミナル：文字列を textContent で表示し、コマンド以外は解釈しない。
  const output = $('#terminal-output');
  const terminalInput = $('#terminal-input');
  const terminalForm = $('#terminal-form');
  const terminalInner = $('#terminal-inner');
  const terminalToggle = $('#terminal-toggle');
  const commands = ['help', 'apt', 'whoami', 'pwd', 'ls', 'cat', 'open', 'bbs', 'projects', 'status', 'neofetch', 'history', 'theme', 'date', 'clear', 'mona', 'sudo', 'exit'];
  const commandHistory = [];
  let historyIndex = 0;
  let bootTime = Date.now();
  let isClosed = false;
  let isRoot = false;
  let neetInstalled = store.get('yn.neet.installed.v1', false) === true;
  document.body.classList.toggle('neet-installed', neetInstalled);
  const promptLabel = $('#terminal-form label');
  const secretFile = [
    '=================================================',
    '         /root/secret.txt  [TOP SECRET]',
    '=================================================',
    '1 ：YousotuNeet ◆管理人：2026/10/19(月)',
    '実はこのサイト、管理人の趣味が詰まっただけの',
    '個人ホームページです。大した秘密はありません。',
    '',
    '2 ：名無しさん：2026/10/19(月)',
    '>>1 それ秘密って言うのか？',
    '',
    '3 ：root：2026/10/19(月)',
    '隠しコマンド：sudo apt install neet',
    '元に戻すなら：sudo apt remove neet',
    '================================================='
  ].join('\n');

  function refreshPrompt() {
    promptLabel.textContent = isRoot ? 'root@YousotuNeet:/#' : 'guest@YousotuNeet:~$';
  }
  function setNeetInstalled(install) {
    neetInstalled = install;
    document.body.classList.toggle('neet-installed', install);
    const persisted = store.set('yn.neet.installed.v1', install);
    route();
    if (install) requestAnimationFrame(() => $('#terminal-column').scrollIntoView({ block: 'nearest' }));
    return persisted;
  }
  function aptCommand(args, elevated) {
    if (!elevated) {
      line('E: ロックファイルを開けません。管理者権限が必要です（sudo apt ...）。', 'error');
      return;
    }
    if (args.length !== 2 || !['install', 'remove'].includes(args[0].toLowerCase()) || args[1].toLowerCase() !== 'neet') {
      line('使用方法：sudo apt install neet / sudo apt remove neet', 'muted');
      return;
    }
    const isInstall = args[0].toLowerCase() === 'install';
    lines('パッケージリストを読み込んでいます... 完了\n依存関係ツリーを作成しています... 完了');
    if (neetInstalled === isInstall) {
      line(isInstall ? 'neet はすでに最新バージョンです。' : 'パッケージ neet はインストールされていません。', 'muted');
      return;
    }
    if (isInstall) {
      lines('以下のパッケージが新たにインストールされます:\n  neet 2ch-layout bbs-skin');
      lines('取得:1 homepage://retro neet 2.0.0 [4,096 B]\nneet (2.0.0) を展開しています...\nneet (2.0.0) を設定しています...');
      const persisted = setNeetInstalled(true);
      line('完了。YousotuNeetちゃんねる に切り替わりました。', 'accent');
      line(persisted ? '※ 保存済み：リロードしても 2ch UI のままです。' : '※ このブラウザでは設定を保存できませんでした。再読み込みで元に戻ります。', 'muted');
    } else {
      lines('neet (2.0.0) を削除しています...\n古い掲示板スキンを復旧しています...');
      setNeetInstalled(false);
      line('完了。標準BBS＋ターミナルUIに戻りました。', 'accent');
    }
  }

  function printFile(filename, elevated) {
    const files = {
      'profile.txt': 'YousotuNeet\nMinecraft / サーバー運営 / 開発\nこのサイトは自己紹介用の個人ホームページです。',
      'projects.txt': 'もなか鯖\nMona Resource Studio\nMonaWatch Echo（開発中）\nMinecraft向け独自プラグイン\n詳細：open works',
      'readme.txt': 'This page is made with plain HTML, CSS and JavaScript.\nNo real shell access. Just a tiny personal homepage.',
      'changelog.txt': '2026/10/19 - BBS + Terminal UI の制作\n2026/10/19 - neet パッケージと 2ch UI 追加'
    };
    if (!filename) line('使い方：cat profile.txt', 'muted');
    else if (filename === '/root/secret.txt') {
      if (elevated) lines(secretFile, 'accent');
      else line('cat: /root/secret.txt: Permission denied', 'error');
    } else if (Object.prototype.hasOwnProperty.call(files, filename)) lines(files[filename]);
    else line(`cat: ${filename}: ファイルが見つかりません`, 'error');
  }

  function runSudo(args) {
    const sub = (args[0] || '').toLowerCase();
    if (!sub) { line('sudo: 使用方法 sudo su / sudo cat /root/secret.txt / sudo apt install neet', 'muted'); return; }
    if (sub === 'su' && args.length === 1) {
      if (isRoot) { line('すでにrootです。', 'muted'); return; }
      isRoot = true; refreshPrompt();
      lines('[疑似認証 OK] root シェルを開始しました。\n※ ブラウザ内の演出です。実際の権限は変更されません。', 'accent');
    } else if (sub === 'cat') {
      printFile(args[1], true);
    } else if (sub === 'apt') {
      aptCommand(args.slice(1), true);
    } else if (sub === '-k' && args.length === 1) {
      isRoot = false; refreshPrompt(); line('root モードを解除しました。', 'muted');
    } else {
      line(`sudo: ${sub}: サポートしていないコマンドです`, 'error');
    }
  }

  function line(text = '', cls = '') {
    const el = make('div', 'terminal-line' + (cls ? ' ' + cls : ''), text);
    output.append(el);
    while (output.children.length > 210) output.firstChild.remove();
    output.scrollTop = output.scrollHeight;
  }
  function lines(text, cls = '') { String(text).split('\n').forEach(part => line(part, cls)); }
  function focusTerminal() {
    setClosed(false);
    $('#terminal-column').scrollIntoView({ block: 'nearest' });
    terminalInput.focus({ preventScroll: true });
  }
  function setClosed(value) {
    isClosed = value;
    terminalInner.hidden = value;
    terminalToggle.setAttribute('aria-expanded', String(!value));
    terminalToggle.textContent = value ? '[ + ]' : '[ − ]';
  }
  function goTo(target) {
    const normalized = (target || '').replace(/^#/, '').replace(/^thread\//, '').toLowerCase();
    if (normalized === 'home' || normalized === 'top') location.hash = '#home';
    else if (normalized === 'bbs' || normalized === 'guestbook') location.hash = '#guestbook';
    else if (normalized === 'projects') location.hash = '#thread/works';
    else if (DATA.threads.some(thread => thread.id === normalized)) location.hash = '#thread/' + normalized;
    else { line(`open: ${target}: 該当するページがありません`, 'error'); return; }
    line(`=> #${location.hash.slice(1)} を開きました`, 'muted');
    if (location.hash === '#home' && currentRoute().type === 'home') route();
  }
  function execute(raw) {
    const text = raw.trim();
    if (!text) return;
    line((isRoot ? 'root@YousotuNeet:/# ' : 'guest@YousotuNeet:~$ ') + text, 'command');
    const parts = text.split(/\s+/);
    const command = parts.shift().toLowerCase();
    const args = parts;
    switch (command) {
      case 'help':
        lines('使用できるコマンド：\n  help                一覧を表示\n  whoami              管理人について\n  ls                  ファイル一覧\n  cat <ファイル名>     ファイルを読む\n  open <ページ名>     ページを開く\n  status / neofetch   情報を表示\n  theme <classic|amber|green>\n  sudo su             疑似rootモード\n  history / clear / date / pwd');
        break;
      case 'whoami':
        lines('YousotuNeet\nMinecraftのサーバー運営、Web、プラグイン制作などをしています。\n詳しくは `open profile`'); break;
      case 'pwd': line('/home/YousotuNeet'); break;
      case 'ls': lines('profile.txt  projects.txt  readme.txt  changelog.txt\nboards/      guestbook/' + (isRoot ? '      /root/secret.txt' : '')); break;
      case 'cat': printFile(args[0], isRoot); break;
      case 'open':
        if (!args[0]) line('使い方：open profile / works / monaka / log / links / contact / bbs / home', 'muted');
        else goTo(args[0]); break;
      case 'projects': goTo('works'); break;
      case 'bbs': goTo('bbs'); break;
      case 'status':
        lines(`SITE:  YousotuNeet's Home Page\nMODE:  static / local browser\nUSER:  ${isRoot ? 'root (simulated)' : 'guest'}\nNEET:  ${neetInstalled ? 'installed / 2ch UI' : 'not installed'}\nBOOT:  ${Math.floor((Date.now() - bootTime)/1000)} sec ago\nTHEME: ${document.body.dataset.termTheme || 'classic'}\nNET:   サーバー接続なし`); break;
      case 'neofetch':
        lines('  /\\_/\\  YousotuNeet@homepage\n ( o.o ) ---------------------\n  > ^ <   OS: Personal Website\n          UI: BBS / early 2000s\n          Shell: JavaScript\n          Hobbies: Minecraft, Web', 'accent'); break;
      case 'history':
        if (!commandHistory.length) line('(履歴はありません)', 'muted');
        else commandHistory.slice(-15).forEach((item, i) => line(`${i + 1}  ${item}`)); break;
      case 'date': line(new Date().toLocaleString('ja-JP')); break;
      case 'theme': {
        const name = (args[0] || '').toLowerCase();
        if (!['classic', 'amber', 'green'].includes(name)) { line('theme classic | amber | green', 'muted'); break; }
        document.body.classList.remove('theme-amber', 'theme-green');
        if (name !== 'classic') document.body.classList.add('theme-' + name);
        document.body.dataset.termTheme = name;
        store.set('yn.theme.v1', name);
        line(`theme: ${name}`, 'accent'); break;
      }
      case 'mona': lines('   /\\_/\\\n  (=^･ω･^=)  MONAKA!\n   ( _  _)\nもっと見るなら `open monaka`', 'accent'); break;
      case 'sudo': runSudo(args); break;
      case 'apt': aptCommand(args, isRoot); break;
      case 'clear': output.replaceChildren(); break;
      case 'exit':
        if (isRoot) { isRoot = false; refreshPrompt(); line('logout: guest に戻りました。', 'muted'); }
        else { line('接続を終了しました（ウィンドウは [+] から戻せます）', 'muted'); setClosed(true); }
        break;
      default: line(`${command}: command not found. ` + 'help と入力してください', 'error');
    }
  }
  terminalForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = terminalInput.value;
    if (value.trim()) { commandHistory.push(value.trim()); if (commandHistory.length > 100) commandHistory.shift(); execute(value); }
    historyIndex = commandHistory.length;
    terminalInput.value = '';
  });
  terminalInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
      event.preventDefault(); if (commandHistory.length) { historyIndex = Math.max(0, historyIndex - 1); terminalInput.value = commandHistory[historyIndex]; }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); if (commandHistory.length) { historyIndex = Math.min(commandHistory.length, historyIndex + 1); terminalInput.value = commandHistory[historyIndex] || ''; }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const raw = terminalInput.value;
      if (!raw.includes(' ')) {
        const matches = commands.filter(cmd => cmd.startsWith(raw.toLowerCase()));
        if (matches.length === 1) terminalInput.value = matches[0] + ' ';
        else if (matches.length > 1) line(matches.join('  '), 'muted');
      } else if (raw.toLowerCase().startsWith('sudo ')) {
        const options = ['sudo su', 'sudo cat /root/secret.txt', 'sudo apt install neet', 'sudo apt remove neet'];
        const matches = options.filter(option => option.startsWith(raw.toLowerCase()));
        if (matches.length === 1) terminalInput.value = matches[0];
        else if (matches.length > 1) line(matches.join('\n'), 'muted');
      }
    }
  });
  terminalToggle.addEventListener('click', () => { setClosed(!isClosed); if (!isClosed) terminalInput.focus(); });
  $('#terminal-help').addEventListener('click', () => { focusTerminal(); execute('help'); });
  $('#focus-terminal').addEventListener('click', focusTerminal);
  document.addEventListener('keydown', event => {
    const tag = event.target.tagName;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || event.target.isContentEditable;
    if (event.altKey && event.key.toLowerCase() === 't') { event.preventDefault(); focusTerminal(); }
    else if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key === '/') { event.preventDefault(); focusTerminal(); }
    else if (event.key === 'Escape' && document.activeElement === terminalInput) terminalInput.blur();
  });
  const savedTheme = store.get('yn.theme.v1', 'classic');
  if (savedTheme === 'amber' || savedTheme === 'green') { document.body.classList.add('theme-' + savedTheme); document.body.dataset.termTheme = savedTheme; }
  refreshPrompt();
  lines('YousotuNeet Terminal  [web edition]\n(C) 2026 YousotuNeet\n-----------------------------------', 'accent');
  lines('guest session started.\n`help` で一覧 / `sudo apt install neet` で2ch風UIへ\n');
  bootTime = Date.now();
  setupHeader();
  window.addEventListener('hashchange', () => {
    if (location.hash === '#terminal-column') { setClosed(false); return; }
    route();
  });
  route();
})();
