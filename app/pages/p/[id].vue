<!-- pages/p/[id].vue -->
<template>
  <div class="win98-desktop">
    <div class="window text-reader">
      <div class="title-bar">
        <!-- 动态显示页面ID，增加赛博感 -->
        <div class="title-bar-text">WordPad.exe - 正在读取 {{ route.params.id }}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close" @click="goBack"></button>
        </div>
      </div>

      <div class="window-body">
        <menu role="menubar">
          <li role="menuitem" tabindex="0" @click="goBack">返回上一级(B)</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true">编辑(E)</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true">查看(V)</li>
          <li role="menuitem" tabindex="0" aria-haspopup="true">帮助(H)</li>
        </menu>

        <div class="sunken-panel content-area">
          <div v-if="pending" class="loading-box">
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
import { computed } from 'vue';
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

const renderedHtml = computed(() => {
  if (pageData.value?.markdown) {
    return marked.parse(pageData.value.markdown);
  }
  return '';
});

const goBack = () => {
  router.push('/');
};

// ✨ 核心修改：拦截内部链接的点击事件
const handleLinkClick = (event) => {
  // 向上寻找被点击的最近的 <a> 标签
  const target = event.target.closest('a');
  
  // 如果点到了 <a> 标签，且 href 包含了我们设定的内部路由 "/p/"
  if (target && target.getAttribute('href')?.startsWith('/p/')) {
    event.preventDefault(); // 阻止浏览器默认的整体刷新跳转
    
    const targetUrl = target.getAttribute('href');

    // 方案 A：在当前窗口直接跳转去新的子页面（如需使用，解开下方注释）
    // router.push(targetUrl);

    // 方案 B（推荐）：使用 JS 在新标签页打开，模拟"打开新窗口"的复古感
    window.open(targetUrl, '_blank');
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

.content-area {
  min-height: 400px;
  padding: 12px;
  overflow-y: auto;
  max-height: 70vh;
}

.loading-box {
  padding: 20px 0;
}

.loading-box .progress-indicator {
  margin-top: 10px;
  max-width: 300px;
}

/* Markdown 样式复古化 */
.markdown-body :deep(h1) {
  font-size: 24px;
  font-weight: bold;
  color: black;
  border-bottom: 2px solid #808080;
  padding-bottom: 6px;
  margin-top: 10px;
  margin-bottom: 15px;
}

.markdown-body :deep(h2) {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  border-bottom: 1px dashed #c0c0c0;
  padding-bottom: 4px;
  margin-top: 20px;
  margin-bottom: 12px;
}

.markdown-body :deep(h3) {
  font-size: 16px;
  font-weight: bold;
  color: #333;
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
  border: 2px outset #dfdfdf;
}

.markdown-body :deep(pre),
.markdown-body :deep(code) {
  background-color: #000;
  color: #0f0;
  padding: 2px 4px;
}

.markdown-body :deep(pre) {
  padding: 10px;
  border: 2px inset #dfdfdf;
}

.markdown-body :deep(a) {
  color: #0000EE;
}

.markdown-body :deep(a:visited) {
  color: #551A8B;
}

.markdown-body :deep(a:hover) {
  color: #FF0000;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid #808080;
  margin: 8px 0;
  padding: 4px 12px;
  background: #f0f0f0;
  color: #333;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
  margin: 12px 0;
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

.error-text {
  color: #ff0000;
}
</style>