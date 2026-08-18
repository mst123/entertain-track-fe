<template>
  <div
    class="book-reader h-[calc(100vh-96px)] flex flex-col"
    :class="`theme-${readerStyle.theme}`"
  >
    <div class="reader-toolbar flex items-center gap-3 px-4 py-2 border-b">
      <el-button @click="$router.back()">返回</el-button>
      <el-button
        :disabled="loading || !tocList.length"
        @click="tocVisible = true"
      >
        目录
      </el-button>
      <el-button :disabled="loading" @click="styleVisible = true">
        样式
      </el-button>
      <div class="font-medium truncate flex-1">
        {{ bookInfo?.name || "阅读" }}
      </div>
      <span class="text-sm shrink-0 opacity-70">
        进度 {{ Math.round(progressPercent) }}%
      </span>
      <el-button :disabled="loading" @click="goPrev">上一页</el-button>
      <el-button :disabled="loading" type="primary" @click="goNext">
        下一页
      </el-button>
    </div>

    <div
      v-loading="loading"
      class="flex-1 min-h-0 relative reader-body"
      @wheel.prevent="onWheel"
    >
      <div v-if="errorMsg" class="p-6 text-red-500">{{ errorMsg }}</div>
      <div ref="viewerRef" class="w-full h-full outline-none" tabindex="0" />
    </div>

    <el-drawer
      v-model="tocVisible"
      title="目录"
      direction="ltr"
      size="320px"
      :append-to-body="true"
    >
      <div v-if="!tocList.length" class="text-gray-400 text-sm px-2">
        本书没有可用目录
      </div>
      <el-tree
        v-else
        :data="tocList"
        :props="tocTreeProps"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="jumpToToc"
      />
    </el-drawer>

    <el-drawer
      v-model="styleVisible"
      title="阅读样式"
      direction="rtl"
      size="340px"
      :append-to-body="true"
    >
      <div class="style-panel flex flex-col gap-6 px-1">
        <div>
          <div class="mb-2 text-sm font-medium">
            字号 {{ readerStyle.fontSize }}%
          </div>
          <el-slider
            v-model="readerStyle.fontSize"
            :min="80"
            :max="200"
            :step="5"
            show-stops
            @change="applyReaderStyle"
          />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium">
            行距 {{ readerStyle.lineHeight.toFixed(1) }}
          </div>
          <el-slider
            v-model="readerStyle.lineHeight"
            :min="1.2"
            :max="2.4"
            :step="0.1"
            @change="applyReaderStyle"
          />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium">
            页边距 {{ readerStyle.margin }}%
          </div>
          <el-slider
            v-model="readerStyle.margin"
            :min="0"
            :max="20"
            :step="2"
            @change="applyReaderStyle"
          />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium">主题</div>
          <el-radio-group
            v-model="readerStyle.theme"
            class="w-full"
            @change="applyReaderStyle"
          >
            <el-radio-button value="light">白天</el-radio-button>
            <el-radio-button value="sepia">护眼</el-radio-button>
            <el-radio-button value="dark">夜间</el-radio-button>
          </el-radio-group>
        </div>

        <el-button @click="resetReaderStyle">恢复默认</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import ePub from "epubjs";
import { ElMessage } from "element-plus";
import { getBookById, updateReadingProgress } from "@/api/book/index";
import type { CREATE_BOOK_RES } from "@/api/book/types/index";

defineOptions({
  name: "BookReader",
});

interface TocNode {
  id: string;
  label: string;
  href: string;
  children?: TocNode[];
}

type ReaderTheme = "light" | "sepia" | "dark";

interface ReaderStyle {
  fontSize: number;
  lineHeight: number;
  margin: number;
  theme: ReaderTheme;
}

const STYLE_STORAGE_KEY = "book-reader-style";

const DEFAULT_STYLE: ReaderStyle = {
  fontSize: 100,
  lineHeight: 1.6,
  margin: 6,
  theme: "light",
};

const THEME_STYLES: Record<ReaderTheme, { color: string; background: string }> =
  {
    light: { color: "#1f2937", background: "#ffffff" },
    sepia: { color: "#5b4636", background: "#f4ecd8" },
    dark: { color: "#e5e7eb", background: "#111827" },
  };

const route = useRoute();
const viewerRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const errorMsg = ref("");
const bookInfo = ref<CREATE_BOOK_RES | null>(null);
const progressPercent = ref(0);
const tocVisible = ref(false);
const styleVisible = ref(false);
const tocList = ref<TocNode[]>([]);
const tocTreeProps = { children: "children", label: "label" };
const readerStyle = reactive<ReaderStyle>(loadReaderStyle());

let epubBook: any = null;
let rendition: any = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let latestCfi = "";
let locationsReady = false;
let wheelLock = false;
const contentCleanups: Array<() => void> = [];

function loadReaderStyle(): ReaderStyle {
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STYLE };
    const parsed = JSON.parse(raw);
    return {
      fontSize: Number(parsed.fontSize) || DEFAULT_STYLE.fontSize,
      lineHeight: Number(parsed.lineHeight) || DEFAULT_STYLE.lineHeight,
      margin: Number(parsed.margin) ?? DEFAULT_STYLE.margin,
      theme: (["light", "sepia", "dark"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_STYLE.theme) as ReaderTheme,
    };
  } catch {
    return { ...DEFAULT_STYLE };
  }
}

function saveReaderStyle() {
  localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify({ ...readerStyle }));
}

function applyReaderStyle() {
  if (!rendition?.themes) return;
  const theme = THEME_STYLES[readerStyle.theme] || THEME_STYLES.light;
  const margin = `${readerStyle.margin}%`;

  rendition.themes.fontSize(`${readerStyle.fontSize}%`);
  rendition.themes.override("line-height", String(readerStyle.lineHeight));
  rendition.themes.override("color", theme.color);
  rendition.themes.override("background", theme.background);
  rendition.themes.override("padding-left", margin);
  rendition.themes.override("padding-right", margin);

  // 同步外层阅读区背景，避免 iframe 边缘露白/露黑
  if (viewerRef.value) {
    viewerRef.value.style.background = theme.background;
  }

  saveReaderStyle();
}

function resetReaderStyle() {
  Object.assign(readerStyle, DEFAULT_STYLE);
  applyReaderStyle();
}

function resolveEpubUrl(url: string) {
  if (!url) return "";
  if (url.includes("?")) {
    return `${url}&inline=1`;
  }
  return `${url}?inline=1`;
}

function mapToc(items: any[] = [], parentId = "root"): TocNode[] {
  return items
    .filter(item => item && (item.label || item.href))
    .map((item, index) => {
      const id = String(item.id || `${parentId}-${index}`);
      const node: TocNode = {
        id,
        label: String(item.label || item.href || `章节 ${index + 1}`).trim(),
        href: String(item.href || ""),
      };
      const children = mapToc(item.subitems || [], id);
      if (children.length) node.children = children;
      return node;
    });
}

async function loadToc() {
  try {
    await epubBook?.loaded?.navigation;
    const toc = epubBook?.navigation?.toc || [];
    tocList.value = mapToc(toc);
  } catch (error) {
    console.warn("加载目录失败", error);
    tocList.value = [];
  }
}

async function jumpToToc(node: TocNode) {
  if (!node?.href || !rendition) return;
  try {
    await rendition.display(node.href);
    tocVisible.value = false;
    focusReader();
  } catch (error) {
    console.error(error);
    ElMessage.error("跳转失败");
  }
}

function scheduleSaveProgress(cfi: string, percentage: number) {
  latestCfi = cfi;
  progressPercent.value = percentage * 100;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const id = bookInfo.value?._id;
    if (!id || !latestCfi) return;
    updateReadingProgress(id, {
      cfi: latestCfi,
      percentage: Math.round(percentage * 1000) / 10,
    }).catch(() => undefined);
  }, 800);
}

function goPrev() {
  if (loading.value) return;
  rendition?.prev();
}

function goNext() {
  if (loading.value) return;
  rendition?.next();
}

function onKeydown(e: KeyboardEvent) {
  if (tocVisible.value || styleVisible.value) return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    goNext();
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    goPrev();
  }
}

function onWheel(e: WheelEvent) {
  if (loading.value || tocVisible.value || styleVisible.value) return;
  if (Math.abs(e.deltaY) < 8) return;
  if (wheelLock) return;
  wheelLock = true;
  if (e.deltaY > 0) goNext();
  else goPrev();
  window.setTimeout(() => {
    wheelLock = false;
  }, 280);
}

function bindContentsInput(contents: any) {
  const doc: Document | undefined = contents?.document;
  if (!doc) return;

  const keyHandler = (e: KeyboardEvent) => onKeydown(e);
  const wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    onWheel(e);
  };

  doc.addEventListener("keydown", keyHandler);
  doc.addEventListener("wheel", wheelHandler, { passive: false });

  contentCleanups.push(() => {
    doc.removeEventListener("keydown", keyHandler);
    doc.removeEventListener("wheel", wheelHandler);
  });
}

function focusReader() {
  const iframe = viewerRef.value?.querySelector(
    "iframe"
  ) as HTMLIFrameElement | null;
  try {
    iframe?.contentWindow?.focus();
  } catch {
    viewerRef.value?.focus();
  }
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    window.setTimeout(focusReader, 50);
  }
}

async function initReader() {
  const bookID = String(route.params.bookID || "");
  if (!bookID) {
    errorMsg.value = "缺少书籍 ID";
    loading.value = false;
    return;
  }

  try {
    const res = await getBookById(bookID);
    bookInfo.value = res.data;
    if (!res.data?.epubUrl) {
      errorMsg.value = "该书尚未上传 EPUB 文件";
      loading.value = false;
      return;
    }

    if (!viewerRef.value) {
      errorMsg.value = "阅读器容器未就绪";
      loading.value = false;
      return;
    }

    const epubUrl = resolveEpubUrl(res.data.epubUrl);
    const fileRes = await fetch(epubUrl);
    if (!fileRes.ok) {
      throw new Error(`EPUB 下载失败: ${fileRes.status}`);
    }
    const buffer = await fileRes.arrayBuffer();
    epubBook = ePub(buffer);
    rendition = epubBook.renderTo(viewerRef.value, {
      width: "100%",
      height: "100%",
      spread: "none",
      allowScriptedContent: true,
    });

    rendition.hooks.content.register(bindContentsInput);

    await epubBook.ready;
    await loadToc();
    applyReaderStyle();

    const savedCfi = res.data.readingProgress?.cfi;
    const savedPercentage = res.data.readingProgress?.percentage || 0;
    progressPercent.value = savedPercentage;

    if (savedCfi) {
      await rendition.display(savedCfi);
    } else {
      await rendition.display();
    }
    // 章节渲染后再刷一次样式，确保生效
    applyReaderStyle();
    loading.value = false;
    focusReader();

    rendition.on("relocated", (location: any) => {
      let percentage = 0;
      if (locationsReady && location?.start?.cfi) {
        percentage =
          epubBook?.locations?.percentageFromCfi?.(location.start.cfi) ??
          location.start.percentage ??
          0;
      } else if (typeof location?.start?.percentage === "number") {
        percentage = location.start.percentage;
      }
      if (location?.start?.cfi) {
        scheduleSaveProgress(location.start.cfi, percentage);
      }
    });

    epubBook.locations
      .generate(1600)
      .then(() => {
        locationsReady = true;
      })
      .catch((err: unknown) => {
        console.warn("locations.generate failed", err);
      });
  } catch (error) {
    console.error(error);
    errorMsg.value = "加载书籍失败，请稍后重试";
    ElMessage.error("加载书籍失败");
    loading.value = false;
  }
}

onMounted(() => {
  initReader();
  window.addEventListener("keydown", onKeydown, true);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("focus", focusReader);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown, true);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("focus", focusReader);
  contentCleanups.splice(0).forEach(fn => fn());
  if (saveTimer) clearTimeout(saveTimer);
  if (bookInfo.value?._id && latestCfi) {
    updateReadingProgress(bookInfo.value._id, {
      cfi: latestCfi,
      percentage: Math.round(progressPercent.value * 10) / 10,
    }).catch(() => undefined);
  }
  rendition?.destroy?.();
  epubBook?.destroy?.();
  rendition = null;
  epubBook = null;
});
</script>

<style scoped>
.book-reader :deep(iframe) {
  border: none;
}

.book-reader :deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
  padding: 4px 0;
  line-height: 1.4;
  white-space: normal;
}

.book-reader.theme-light,
.book-reader.theme-light .reader-body {
  color: #1f2937;
  background: #fff;
}

.book-reader.theme-sepia,
.book-reader.theme-sepia .reader-body {
  color: #5b4636;
  background: #f4ecd8;
}

.book-reader.theme-dark,
.book-reader.theme-dark .reader-body {
  color: #e5e7eb;
  background: #111827;
}

.book-reader.theme-dark .reader-toolbar {
  border-color: #374151;
}

.book-reader.theme-sepia .reader-toolbar {
  border-color: #e7d9bf;
}

.style-panel :deep(.el-radio-group) {
  display: flex;
  width: 100%;
}

.style-panel :deep(.el-radio-button) {
  flex: 1;
}

.style-panel :deep(.el-radio-button__inner) {
  width: 100%;
}
</style>
