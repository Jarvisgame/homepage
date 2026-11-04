<!-- pages/p/[id].vue -->
<template>
  <div class="win98-desktop">
    <div class="window text-reader">
      <div class="title-bar">
        <!-- 动态显示页面ID，增加赛博感 -->
        <div class="title-bar-text">WordPad.exe - 正在读取 {{ route.params.id }}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize" @click="openInNewWindow"></button>
          <button aria-label="Close" @click="goBack"></button>
        </div>
      </div>

      <div class="window-body">
        <menu role="menubar" class="wordpad-menubar">
          <li role="menuitem" tabindex="0" @click="goBack" @keydown.enter="goBack"><u>B</u> 返回</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true"><u>E</u> 编辑</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true"><u>V</u> 查看</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true"><u>H</u> 帮助</li>
        </menu>

        <div class="sunken-panel content-area">
          <div v-if="mounted && pending && !pageData" class="loading-box">
            <p>正在解压文件，请稍候...</p>
            <div class="progress-indicator">
              <div class="progress-indicator-bar" style="width: 45%"></div>
            </div>
          </div>
          <div v-else-if="pageData?.error" class="error-text">{{ pageData.error }}</div>

          <!-- v-html 渲染 Marked 解析出的 HTML -->
          <article class="markdown-body" v-html="renderedHtml" @click="handleLinkClick"></article>
        </div>
      </div>

      <div class="status-bar">
        <div class="status-bar-field">就绪</div>
        <div class="status-bar-field">{{ route.params.id }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { marked } from 'marked';
import { useRoute, useRouter } from 'vue-router';

// 防止 Markdown 中嵌入的原始 HTML 导致 XSS
marked.use({
  renderer: {
    html({ text }) {
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
});

const route = useRoute();
const router = useRouter();

const { data: pageData, pending } = await useFetch(`/api/page/${route.params.id}`);

// 仅客户端挂载后再显示加载框，避免 SSR 水合不匹配
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const renderedHtml = computed(() => {
  if (pageData.value?.markdown) {
    return marked.parse(pageData.value.markdown);
  }
  return '';
});

const goBack = () => {
  router.push('/');
};

// 点击 Maximize：在新窗口打开当前文章
const openInNewWindow = () => {
  window.open(route.fullPath, '_blank', 'noopener,noreferrer,width=1000,height=760');
};

// 拦截文章内的站内链接，在当前 WordPad 窗口内直接切换文章
const handleLinkClick = async (event) => {
  const target = event.target.closest('a');
  if (target && target.getAttribute('href')?.startsWith('/p/')) {
    event.preventDefault();
    const targetUrl = target.getAttribute('href');
    await router.push(targetUrl);
    await nextTick();
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
  }
};
</script>

<style scoped>
.win98-desktop {
  padding: 20px 10px 50px;
}

.text-reader {
  max-width: 800px;
  margin: 20px auto;
}

.title-bar {
  cursor: default;
  user-select: none;
}

/* === 菜单栏 === */
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

/* === 内容区域 === */
.content-area {
  min-height: 400px;
  padding: 12px;
  overflow-y: auto;
  max-height: 70vh;
}

.loading-box {
  padding: 20px 0;
}

/* === Win98 进度条 === */
.progress-indicator {
  margin-top: 10px;
  border: 2px inset;
  background: #fff;
  height: 18px;
  padding: 1px;
  max-width: 300px;
}

.progress-indicator-bar {
  height: 100%;
  background: #000080;
  background-image: repeating-linear-gradient(
    90deg,
    #000080 0px,
    #000080 8px,
    #ffffff 8px,
    #ffffff 10px
  );
}

/* ============================================================
   Markdown 渲染样式 — 模拟 WordPad 的富文本效果
   ============================================================ */

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

/* 图片 — Win98 凹陷边框 */
.markdown-body :deep(img) {
  max-width: 100%;
  border: 2px inset;
}

/* 行内代码 — 浅灰底黑字，像 WordPad 的等宽字体 */
.markdown-body :deep(code) {
  background-color: #efefef;
  color: #000;
  padding: 1px 4px;
  font-family: "Courier New", monospace;
  font-size: 13px;
}

/* 代码块 — 白色底黑字，凹陷边框，非终端风格 */
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

/* 链接 — 标准 Win98 蓝色，hover 仅下划线 */
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

/* 引用块 — Win98 风格灰底凹陷面板 */
.markdown-body :deep(blockquote) {
  border: 2px inset;
  margin: 8px 0;
  padding: 8px 14px;
  background: #ffffff;
  color: #000;
}

/* 分割线 — 经典 3D 凹槽效果 */
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #ffffff;
  margin: 16px 0;
}

/* 列表 */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
  line-height: 1.5;
}

/* 表格 — Win98 凹陷风格 */
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

/* 错误文本 */
.error-text {
  color: #ff0000;
}

/* === 进度条 === */
.progress-indicator {
  border: 2px inset;
  background: #fff;
  height: 18px;
  padding: 1px;
}

.progress-indicator-bar {
  height: 100%;
  background: #000080;
  background-image: repeating-linear-gradient(
    90deg,
    #000080 0px,
    #000080 8px,
    #ffffff 8px,
    #ffffff 10px
  );
}
</style>