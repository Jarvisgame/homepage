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
              <button class="action-btn">📩 给站长写信</button>
              <button class="action-btn">✍️ 签写留言本</button>
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
            <div class="title-bar-text">Notion_Update_Log.txt - 记事本</div>
            <div class="title-bar-controls">
              <button aria-label="Minimize" @click="notepadMinimized = true"></button>
              <button aria-label="Maximize" @click="notepadMinimized = false"></button>
              <button aria-label="Close" @click="notepadClosed = true"></button>
            </div>
          </div>
          <div class="window-body content-body" v-show="!notepadMinimized">
            <menu role="menubar" class="notepad-menubar">
              <li role="menuitem" tabindex="0" aria-haspopup="true">文件(F)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">编辑(E)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">查看(V)</li>
              <li role="menuitem" tabindex="0" aria-haspopup="true">帮助(H)</li>
            </menu>

            <!-- 使用 Notion API 数据 -->
            <div class="sunken-panel notepad-content" v-if="pending">
              <p>正在拨号连接服务器获取数据...</p>
              <div class="progress-indicator">
                <div class="progress-indicator-bar" style="width: 60%"></div>
              </div>
            </div>
            <div class="sunken-panel notepad-content" v-else-if="error">
              <p class="error-text">系统致命错误：无法连接到 Notion API！</p>
            </div>
            <ul class="tree-view notepad-content" v-else>
              <!-- 遍历从 posts.ts 获取的 block 列表 -->
              <li v-for="block in posts" :key="block.id">

                <!-- 如果是普通段落 paragraph，直接显示文本 -->
                <template v-if="block.type === 'paragraph' && block.paragraph.rich_text.length">
                  {{ block.paragraph.rich_text[0].plain_text }}
                </template>

                <!-- 如果是子页面 child_page，显示为可展开的文件夹 -->
                <template v-else-if="block.type === 'child_page'">
                  <NuxtLink :to="`/p/${block.id}`" class="post-title">
                    {{ block.child_page.title }}.txt
                  </NuxtLink>
                </template>

              </li>
            </ul>
          </div>
          <div class="status-bar" v-show="!notepadMinimized">
            <div class="status-bar-field">{{ posts?.length ?? 0 }} 个对象</div>
            <div class="status-bar-field">Notion API</div>
            <div class="status-bar-field">UTF-8</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 窗口状态
const profileMinimized = ref(false);
const profileClosed = ref(false);
const notepadMinimized = ref(false);
const notepadClosed = ref(false);
const showStartMenu = ref(false);

// 任务栏时钟
const currentTime = ref('');
let clockTimer;
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 60000);
});
onUnmounted(() => clearInterval(clockTimer));

// 访客计数
const { data: counterData } = await useFetch('/api/counter');
const formattedCount = computed(() => {
  const count = counterData.value?.count ?? 0;
  return String(count).padStart(6, '0');
});

// 调用我们在 server/api/posts.ts 中编写的接口，或者你实际配置的 Notion 接口
const { data: posts, pending, error } = await useFetch('/api/posts')
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
  border: 2px inset #fff;
  background: #000;
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
  color: black;
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

.action-btn {
  text-align: left;
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
  border: 1px inset #888;
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
  color: #FF0000;
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
  border-top: 2px outset #fff;
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
  border-left: 1px solid #808080;
  border-right: 1px solid #fff;
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
  border: 1px inset #dfdfdf;
  background: #c0c0c0;
}

.tray-time {
  font-size: 12px;
  white-space: nowrap;
}

/* === 进度条 === */
.progress-indicator {
  margin-top: 10px;
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