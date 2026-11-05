<template>
  <div class="win98-desktop">
    <!-- 顶部跑马灯公告 (阿江经典的滚动通知) -->
    <div class="marquee-container window">
      <marquee scrollamount="3">
        [最新公告] 欢迎光临我的小组主页！本站最佳浏览分辨率 800x600，推荐使用 Netscape Navigator 或 IE 4.0 以上版本浏览器...
      </marquee>
    </div>

    <div class="main-layout">
      <!-- 左侧：站长资料区 -->
      <aside class="sidebar">
        <div class="window" v-if="!profileClosed">
          <div class="title-bar" @dblclick="profileMinimized = !profileMinimized">
            <div class="title-bar-text">Profile.exe</div>
            <div class="title-bar-controls">
              <button aria-label="Minimize" @click="profileMinimized = true"></button>
              <button aria-label="Maximize" @click="profileMinimized = false"></button>
              <button aria-label="Close" @click="profileClosed = true"></button>
            </div>
          </div>
          <div class="window-body profile-body" v-show="!profileMinimized">
            <fieldset>
              <legend>站长信息</legend>
              <img src="/img/notfatdog.jpg" alt="Avatar" class="avatar" />
              <div class="profile-info">
                <div class="field-row">
                  <label>站长：</label><span>不是肥狗</span>
                </div>
                <div class="field-row">
                  <label>爱好：</label><span>基于大模型的学、不基于大模型的玩</span>
                </div>
                <div class="field-row">
                  <label>坐标：</label><span>北京埋土大学</span>
                </div>
              </div>
            </fieldset>
            <div class="profile-actions">
              <button>📩 给站长写信</button>
              <button>✍️ 签写留言本</button>
            </div>
          </div>
          <div class="status-bar" v-show="!profileMinimized">
            <div class="status-bar-field">状态: 在线</div>
          </div>
        </div>

        <!-- 经典的访客统计器 -->
        <div class="window mt-2">
          <div class="title-bar">
            <div class="title-bar-text">访客计数器</div>
          </div>
          <div class="window-body text-center counter-box">
            <fieldset>
              <legend>Total Visitors</legend>
              <div class="counter-display">
                <span v-for="(digit, i) in formattedCount" :key="i" class="counter-digit">{{ digit }}</span>
              </div>
            </fieldset>
          </div>
        </div>

        <!-- 复古 88x31 的徽章区 -->
        <div class="badges">
          <img src="https://cyber.dabamos.de/88x31/netscape.gif" alt="Netscape Now" />
          <img src="https://cyber.dabamos.de/88x31/ie_anim.gif" alt="Internet Explorer" />
          <img src="https://cyber.dabamos.de/88x31/notepad.gif" alt="Notepad" />
          <img src="https://cyber.dabamos.de/88x31/best800x600.gif" alt="Best viewed 800x600" />
          <img src="https://cyber.dabamos.de/88x31/made_with_windows.gif" alt="Made with Windows" />
          <img src="https://cyber.dabamos.de/88x31/adobe_get_flash_player.gif" alt="Get Flash Player" />
          <img src="https://cyber.dabamos.de/88x31/best_viewed_with_eyes.gif" alt="Best viewed with eyes" />
        </div>
      </aside>

      <!-- 右侧：主要内容区 (Notion 数据渲染) -->
      <main class="content">
        <div class="window" v-if="!notepadClosed">
          <div class="title-bar" @dblclick="notepadMinimized = !notepadMinimized">
            <div class="title-bar-text">{{ notepadTitle }}</div>
            <div class="title-bar-controls">
              <button aria-label="Minimize" @click="notepadMinimized = true"></button>
              <button aria-label="Maximize" @click="notepadMinimized = false"></button>
              <button aria-label="Close" @click="notepadClosed = true"></button>
            </div>
          </div>
          <div class="window-body content-body" v-show="!notepadMinimized">
            <menu v-if="!activePageId" role="menubar" class="notepad-menubar">
              <li role="menuitem" tabindex="0" aria-haspopup="true">文件(F)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">编辑(E)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">查看(V)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">帮助(H)</li>
            </menu>
            <menu v-else role="menubar" class="wordpad-menubar">
              <li role="menuitem" tabindex="0" @click="goBackFromArticle" @keydown.enter="goBackFromArticle"><u>B</u> 返回</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true"><u>E</u> 编辑</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true"><u>V</u> 查看</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true"><u>H</u> 帮助</li>
            </menu>

            <!-- 内嵌文章阅读视图：与 /p/:id 子页面保持一致的 WordPad 风格 -->
            <div v-if="activePageId" ref="articleScrollRef" class="sunken-panel content-area">
              <div v-if="articlePending" class="loading-box">
                <p>正在解压文件，请稍候...</p>
                <div class="progress-indicator">
                  <div class="progress-indicator-bar" style="width: 45%"></div>
                </div>
              </div>
              <div v-else-if="articleError" class="error-text">{{ articleError }}</div>
              <article
                v-else
                class="markdown-body"
                v-html="articleHtml"
                @click="handleArticleLinkClick"
              ></article>
            </div>

            <!-- 使用 Notion API 数据 -->
            <div v-if="!activePageId">
              <div class="sunken-panel notepad-content" v-if="mounted && pending">
                <p>正在拨号连接服务器获取数据...</p>
                <div class="progress-indicator">
                  <div class="progress-indicator-bar" style="width: 60%"></div>
                </div>
              </div>
              <div class="sunken-panel notepad-content" v-else-if="mounted && error">
                <p class="error-text">系统致命错误：无法连接到 Notion API！</p>
              </div>
              <ul class="tree-view notepad-content" v-else>
                <!-- 遍历从 posts.ts 获取的 block 列表 -->
                <li v-for="block in posts" :key="block.id">

                  <!-- 如果是普通段落 paragraph，渲染全部 rich_text；页面提及在当前窗口中打开 -->
                  <template v-if="block.type === 'paragraph' && block.paragraph.rich_text.length">
                    <template v-for="(rt, i) in block.paragraph.rich_text" :key="i">
                      <a
                        v-if="rt.type === 'mention' && rt.mention?.type === 'page'"
                        href="#"
                        class="post-title"
                        @click.prevent="openPage(rt.mention.page.id, rt.plain_text)"
                      >
                        {{ rt.plain_text }}
                      </a>
                      <a
                        v-else-if="rt.href && rt.href.startsWith('/p/')"
                        href="#"
                        class="post-title"
                        @click.prevent="openPage(rt.href.slice(3), rt.plain_text)"
                      >
                        {{ rt.plain_text }}
                      </a>
                      <a
                        v-else-if="rt.href"
                        :href="rt.href"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ rt.plain_text }}
                      </a>
                      <template v-else>{{ rt.plain_text }}</template>
                    </template>
                  </template>

                  <!-- 如果是子页面 child_page，在当前窗口中打开 -->
                  <template v-else-if="block.type === 'child_page'">
                    <a
                      href="#"
                      class="post-title"
                      @click.prevent="openPage(block.id, `${block.child_page.title || '未命名'}.txt`)"
                    >
                      {{ block.child_page.title }}.txt
                    </a>
                  </template>

                </li>
              </ul>
            </div>
          </div>
          <div class="status-bar" v-show="!notepadMinimized">
            <div class="status-bar-field">{{ activePageId ? '就绪' : `${posts?.length ?? 0} 个对象` }}</div>
            <div class="status-bar-field">{{ activePageId ? activePageId : 'Notion API' }}</div>
            <div v-if="!activePageId" class="status-bar-field">UTF-8</div>
          </div>
        </div>
      </main>
    </div>

    <!-- Win98 经典任务栏 -->
    <div class="taskbar">
      <button class="start-button" @click="showStartMenu = !showStartMenu">
        <svg class="start-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <polygon points="1,1 7,0 7,7 1,7" fill="#FF0000"/>
          <polygon points="9,0 15,1 15,7 9,7" fill="#00A800"/>
          <polygon points="1,9 7,9 7,16 1,15" fill="#0000FF"/>
          <polygon points="9,9 15,9 15,15 9,16" fill="#FFD800"/>
        </svg>
        开始
      </button>
      <div class="taskbar-divider"></div>
      <div class="taskbar-items">
        <button
          v-if="!profileClosed"
          class="taskbar-item"
          :class="{ active: !profileMinimized }"
          @click="profileMinimized = !profileMinimized"
        >
          Profile.exe
        </button>
        <button
          v-if="!notepadClosed"
          class="taskbar-item"
          :class="{ active: !notepadMinimized }"
          @click="notepadMinimized = !notepadMinimized"
        >
          记事本
        </button>
      </div>
      <div class="taskbar-tray">
        <span class="tray-time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- Win98 开始菜单 -->
    <div class="start-menu window" v-if="showStartMenu" @click.stop>
      <div class="start-menu-sidebar">
        <span class="start-menu-brand">Windows<span class="start-menu-version">98</span></span>
      </div>
      <ul class="start-menu-items">
        <li class="start-menu-item"><span class="start-menu-icon">📄</span> 新建文档</li>
        <li class="start-menu-item"><span class="start-menu-icon">📁</span> 打开文件</li>
        <li class="start-menu-item"><span class="start-menu-icon">💾</span> 保存</li>
        <li class="start-menu-separator"></li>
        <li class="start-menu-item"><span class="start-menu-icon">⚙️</span> 设置</li>
        <li class="start-menu-item"><span class="start-menu-icon">🔍</span> 查找</li>
        <li class="start-menu-item"><span class="start-menu-icon">💡</span> 帮助</li>
        <li class="start-menu-separator"></li>
        <li class="start-menu-item start-menu-logoff"><span class="start-menu-icon">🚪</span> 注销 Administrator...</li>
      </ul>
    </div>

    <!-- 点击开始菜单外部关闭 -->
    <div class="start-menu-backdrop" v-if="showStartMenu" @click="showStartMenu = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { marked } from 'marked';

// 防止 Markdown 中嵌入的原始 HTML 导致 XSS
marked.use({
  renderer: {
    html({ text }) {
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
});

// 窗口状态
const profileMinimized = ref(false);
const profileClosed = ref(false);
const notepadMinimized = ref(false);
const notepadClosed = ref(false);
const showStartMenu = ref(false);

// 记事本内嵌文章阅读状态
const activePageId = ref(null);
const activePageTitle = ref('');
const activePage = ref(null);
const articlePending = ref(false);
const articleError = ref(null);
const articleHistory = ref([]);
const articleScrollRef = ref(null);
let articleRequestId = 0;

// 仅客户端挂载后再显示列表加载框，避免 SSR 水合不匹配
const mounted = ref(false);

// 任务栏时钟
const currentTime = ref('');
let clockTimer;
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
onMounted(() => {
  mounted.value = true;
  updateClock();
  clockTimer = setInterval(updateClock, 60000);
});
onUnmounted(() => clearInterval(clockTimer));

// 访客计数：仅在客户端水合完成后获取，避免 SSR/水合不一致
const counterCount = ref(0);
const formattedCount = computed(() => {
  return String(counterCount.value).padStart(6, '0');
});

// 每个浏览器会话只上报一次访问；其余访问只读取当前值
onMounted(async () => {
  try {
    if (!sessionStorage.getItem('visitor-counted')) {
      sessionStorage.setItem('visitor-counted', '1');
      const res = await $fetch('/api/counter', { method: 'POST' });
      counterCount.value = res.count;
    } else {
      const res = await $fetch('/api/counter');
      counterCount.value = res.count;
    }
  } catch {
    // 计数失败不影响页面使用
  }
});

// 调用我们在 server/api/posts.ts 中编写的接口，或者你实际配置的 Notion 接口
const { data: posts, pending, error } = await useFetch('/api/posts');

// 记事本标题：阅读文章时切换为 WordPad 风格
const notepadTitle = computed(() => {
  if (!activePageId.value) return 'Notion_Update_Log.txt - 记事本';
  return `WordPad.exe - 正在读取 ${activePageTitle.value || activePageId.value}`;
});

const articleHtml = computed(() => {
  if (activePage.value?.markdown) {
    return marked.parse(activePage.value.markdown);
  }
  return '';
});

const scrollArticleToTop = async () => {
  await nextTick();
  if (articleScrollRef.value) {
    articleScrollRef.value.scrollTop = 0;
  }
};

const loadArticle = async (id, title = '') => {
  const requestId = ++articleRequestId;
  activePageId.value = id;
  activePageTitle.value = title || id;
  activePage.value = null;
  articleError.value = null;
  articlePending.value = true;
  await scrollArticleToTop();

  try {
    const data = await $fetch(`/api/page/${id}`);
    if (requestId !== articleRequestId) return;
    if (data?.error) {
      articleError.value = data.error;
    } else {
      activePage.value = data;
    }
  } catch (e) {
    if (requestId !== articleRequestId) return;
    articleError.value = e?.data?.message || '磁盘读取错误（Read Error）';
  } finally {
    if (requestId === articleRequestId) {
      articlePending.value = false;
    }
  }
};

// 从列表打开文章：清空阅读历史
const openPage = (id, title = '') => {
  articleHistory.value = [];
  loadArticle(id, title);
};

const closeArticle = () => {
  articleRequestId++;
  activePageId.value = null;
  activePageTitle.value = '';
  activePage.value = null;
  articleError.value = null;
  articlePending.value = false;
  articleHistory.value = [];
};

const goBackFromArticle = () => {
  if (articleHistory.value.length) {
    const previous = articleHistory.value.pop();
    loadArticle(previous.id, previous.title);
  } else {
    closeArticle();
  }
};

// 文章内部的站内链接也在当前记事本窗口中打开
const handleArticleLinkClick = (event) => {
  const target = event.target.closest('a');
  const href = target?.getAttribute('href');
  if (!href || !href.startsWith('/p/')) return;

  event.preventDefault();
  if (activePageId.value) {
    articleHistory.value.push({ id: activePageId.value, title: activePageTitle.value });
  }
  loadArticle(href.slice(3), target.textContent?.trim() || href.slice(3));
};
</script>

<style scoped>

.win98-desktop {
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 10px 50px;
  min-height: 100vh;
}

/* === 跑马灯 === */
.marquee-container {
  margin-bottom: 12px;
  padding: 0;
}

.marquee-container marquee {
  font-family: "SimSun", monospace;
  color: #000080;
  padding: 4px 0;
}

/* === 布局 === */
.main-layout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
}

.content {
  flex-grow: 1;
}

/* === Profile 窗口 === */
.profile-body {
  padding: 6px;
}

.profile-body fieldset {
  text-align: center;
  padding: 8px;
}

.avatar {
  width: 88px;
  height: 88px;
  border: 2px inset;
  background: #ffffff;
  margin-bottom: 8px;
  image-rendering: pixelated;
}

.profile-info {
  text-align: left;
}

.profile-info .field-row {
  margin: 3px 0;
  font-size: 13px;
  line-height: 1.4;
}

.profile-info label {
  font-weight: bold;
  white-space: nowrap;
  min-width: 42px;
}

.profile-actions {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-actions button {
  text-align: left;
  width: 100%;
}

/* === 访客计数器 === */
.mt-2 {
  margin-top: 12px;
}

.counter-box {
  padding: 6px;
}

.counter-box fieldset {
  text-align: center;
  padding: 8px 6px;
}

.counter-display {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-top: 4px;
}

.counter-digit {
  display: inline-block;
  width: 20px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  background: #000;
  color: #0f0;
  font-family: "VT323", monospace;
  font-size: 20px;
  border: 2px inset;
}

/* === 记事本窗口 === */
.notepad-menubar {
  display: flex;
  flex-direction: row;
  list-style: none;
  padding: 2px 0;
  margin: 0;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.notepad-menubar li {
  padding: 2px 8px;
  cursor: default;
  font-size: 12px;
}

.notepad-menubar li:hover {
  background: #000080;
  color: #fff;
}

.content-body {
  color: black;
  line-height: 1.5;
  padding: 0 6px 6px;
}

.notepad-content {
  min-height: 300px;
  margin-top: 4px;
}

/* === 记事本内嵌文章（与 /p/:id 子页面一致） === */
.content-area {
  min-height: 400px;
  padding: 12px;
  overflow-y: auto;
  max-height: 70vh;
}

.loading-box {
  padding: 20px 0;
}

/* === WordPad 菜单栏 === */
.wordpad-menubar {
  display: flex;
  flex-direction: row;
  list-style: none;
  padding: 2px 0;
  margin: 0;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.wordpad-menubar li {
  padding: 2px 8px;
  cursor: default;
  font-size: 12px;
}

.wordpad-menubar li:hover {
  background: #000080;
  color: #ffffff;
}

.wordpad-menubar li u {
  text-decoration: underline;
}

.tree-view {
  background-color: #ffffff;
}

.tree-view li {
  padding: 3px 0;
}

.post-title {
  color: #0000EE;
  text-decoration: none;
}

.post-title:hover {
  text-decoration: underline;
}

/* === 内嵌文章 Markdown 样式 === */
.markdown-body :deep(h1) {
  font-size: 24px;
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #808080;
  padding-bottom: 6px;
  margin-top: 10px;
  margin-bottom: 15px;
}

.markdown-body :deep(h2) {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  border-bottom: 2px groove;
  padding-bottom: 4px;
  margin-top: 20px;
  margin-bottom: 12px;
}

.markdown-body :deep(h3) {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-top: 15px;
  margin-bottom: 10px;
}

.markdown-body :deep(p) {
  font-size: 14px;
  line-height: 1.6;
  color: #000;
  margin-bottom: 12px;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border: 2px inset;
}

.markdown-body :deep(code) {
  background-color: #efefef;
  color: #000;
  padding: 1px 4px;
  font-family: "Courier New", monospace;
  font-size: 13px;
}

.markdown-body :deep(pre) {
  background-color: #ffffff;
  color: #000;
  padding: 10px;
  border: 2px inset;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(a) {
  color: #0000EE;
}

.markdown-body :deep(a:visited) {
  color: #551A8B;
}

.markdown-body :deep(a:hover) {
  color: #0000EE;
  text-decoration: underline;
}

.markdown-body :deep(blockquote) {
  border: 2px inset;
  margin: 8px 0;
  padding: 8px 14px;
  background: #ffffff;
  color: #000;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #ffffff;
  margin: 16px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
  line-height: 1.5;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 12px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #808080;
  padding: 4px 8px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #c0c0c0;
  font-weight: bold;
}

.error-text {
  color: #ff0000;
}

/* === 徽章区 === */
.badges {
  margin-top: 12px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.badges img {
  image-rendering: pixelated;
}

/* === 标题栏 === */
.title-bar {
  cursor: default;
  user-select: none;
}

/* === 任务栏 === */
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: #c0c0c0;
  border-top: 2px outset;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  gap: 3px;
  z-index: 9999;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  font-weight: bold;
  font-size: 12px;
  height: 24px;
  min-width: 60px;
}

.start-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.taskbar-divider {
  width: 2px;
  height: 22px;
  border-left: 2px groove;
  border-right: 2px groove;
  margin: 0 2px;
}

.taskbar-items {
  flex: 1;
  display: flex;
  gap: 3px;
  overflow: hidden;
}

.taskbar-item {
  height: 24px;
  padding: 2px 8px;
  font-size: 12px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.taskbar-item.active {
  border-style: inset;
  background: #dfdfdf;
  font-weight: bold;
}

.taskbar-tray {
  display: flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border: 2px inset;
  background: #c0c0c0;
}

.tray-time {
  font-size: 12px;
  white-space: nowrap;
}

/* === 进度条 === */
.progress-indicator {
  margin-top: 10px;
  border: 2px inset;
  background: #fff;
  height: 18px;
  padding: 1px;
}

.progress-indicator-bar {
  height: 100%;
  background: #000080;
  /* Win98 进度条经典块状动画 */
  background-image: repeating-linear-gradient(
    90deg,
    #000080 0px,
    #000080 8px,
    #ffffff 8px,
    #ffffff 10px
  );
}

/* === Win98 开始菜单 === */
.start-menu {
  position: fixed;
  bottom: 36px;
  left: 4px;
  width: 220px;
  z-index: 10000;
  display: flex;
  flex-direction: row;
  padding: 0;
}

.start-menu-sidebar {
  width: 28px;
  background: #808080;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
}

.start-menu-brand {
  color: #c0c0c0;
  font-weight: bold;
  font-size: 16px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 2px;
}

.start-menu-version {
  color: #ffffff;
  font-size: 12px;
}

.start-menu-items {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  background: #c0c0c0;
}

.start-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: default;
}

.start-menu-item:hover {
  background: #000080;
  color: #ffffff;
}

.start-menu-icon {
  width: 20px;
  text-align: center;
  font-size: 14px;
}

.start-menu-separator {
  height: 1px;
  margin: 4px 8px;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #ffffff;
  list-style: none;
}

.start-menu-logoff {
  border-top: 1px solid #808080;
  margin-top: 4px;
  padding-top: 6px;
}

.start-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

/* === 响应式 === */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar,
  .content {
    width: 100%;
  }
}
</style>