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
      <!-- 水平边距加在外层，避免改 body padding 破坏分栏翻页 -->
      <div
        ref="viewerShellRef"
        class="viewer-shell w-full h-full box-border"
        :style="viewerShellStyle"
      >
        <div ref="viewerRef" class="w-full h-full outline-none" tabindex="0" />
      </div>
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
          <div class="mb-2 text-sm font-medium">字体</div>
          <el-select
            v-model="readerStyle.fontFamily"
            class="w-full"
            @change="onStyleChange"
          >
            <el-option
              v-for="item in FONT_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span :style="{ fontFamily: item.value || 'inherit' }">
                {{ item.label }}
              </span>
            </el-option>
          </el-select>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">加粗正文</div>
          <el-switch v-model="readerStyle.bold" @change="onStyleChange" />
        </div>

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
            @change="onStyleChange"
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
            @change="onStyleChange"
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
            @change="onStyleChange"
          />
        </div>

        <div>
          <div class="mb-2 text-sm font-medium">主题</div>
          <el-radio-group
            v-model="readerStyle.theme"
            class="w-full"
            @change="onStyleChange"
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
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
  fontFamily: string;
  bold: boolean;
}

const STYLE_STORAGE_KEY = "book-reader-style";

const FONT_OPTIONS = [
  { label: "跟随书籍", value: "" },
  {
    label: "黑体",
    value: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif',
  },
  {
    label: "宋体",
    value: 'SimSun, "Songti SC", "Noto Serif SC", serif',
  },
  {
    label: "楷体",
    value: 'KaiTi, "Kaiti SC", "STKaiti", serif',
  },
  {
    label: "仿宋",
    value: 'FangSong, "STFangsong", serif',
  },
  {
    label: "系统无衬线",
    value: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
];

const DEFAULT_STYLE: ReaderStyle = {
  fontSize: 100,
  lineHeight: 1.6,
  margin: 6,
  theme: "light",
  fontFamily: "",
  bold: false,
};

const THEME_STYLES: Record<ReaderTheme, { color: string; background: string }> =
  {
    light: { color: "#1f2937", background: "#ffffff" },
    sepia: { color: "#5b4636", background: "#f4ecd8" },
    dark: { color: "#e5e7eb", background: "#111827" },
  };

const route = useRoute();
const viewerRef = ref<HTMLElement | null>(null);
const viewerShellRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const errorMsg = ref("");
const bookInfo = ref<CREATE_BOOK_RES | null>(null);
const progressPercent = ref(0);
const tocVisible = ref(false);
const styleVisible = ref(false);
const tocList = ref<TocNode[]>([]);
const tocTreeProps = { children: "children", label: "label" };
const readerStyle = reactive<ReaderStyle>(loadReaderStyle());

const viewerShellStyle = computed(() => {
  const m = Math.max(0, Number(readerStyle.margin) || 0);
  return {
    paddingLeft: `${m}%`,
    paddingRight: `${m}%`,
  };
});

let epubBook: any = null;
let rendition: any = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let latestCfi = "";
let locationsReady = false;
let pageTurnLock = false;
let lastKeyTimeStamp = 0;
const contentCleanups: Array<() => void> = [];

function loadReaderStyle(): ReaderStyle {
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STYLE };
    const parsed = JSON.parse(raw);
    const fontFamily = String(parsed.fontFamily ?? DEFAULT_STYLE.fontFamily);
    const allowedFonts = FONT_OPTIONS.map(item => item.value);
    return {
      fontSize: Number(parsed.fontSize) || DEFAULT_STYLE.fontSize,
      lineHeight: Number(parsed.lineHeight) || DEFAULT_STYLE.lineHeight,
      margin: Number(parsed.margin) ?? DEFAULT_STYLE.margin,
      theme: (["light", "sepia", "dark"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_STYLE.theme) as ReaderTheme,
      fontFamily: allowedFonts.includes(fontFamily)
        ? fontFamily
        : DEFAULT_STYLE.fontFamily,
      bold: Boolean(parsed.bold),
    };
  } catch {
    return { ...DEFAULT_STYLE };
  }
}

function saveReaderStyle() {
  localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify({ ...readerStyle }));
}

function getViewerSize() {
  const el = viewerRef.value;
  if (!el) return { width: 800, height: 600 };
  const width = Math.max(Math.floor(el.clientWidth), 100);
  const height = Math.max(Math.floor(el.clientHeight), 100);
  return { width, height };
}

function safeCurrentCfi() {
  try {
    return rendition?.currentLocation?.()?.start?.cfi || latestCfi || "";
  } catch {
    return latestCfi || "";
  }
}

function applyReaderStyle(options?: { realign?: boolean }) {
  if (!rendition?.themes) return;
  try {
    const theme = THEME_STYLES[readerStyle.theme] || THEME_STYLES.light;
    const cfi = safeCurrentCfi();

    // 不要改 body 的左右 padding：会破坏多栏宽度，导致某些页一次跳两页
    rendition.themes.fontSize(`${readerStyle.fontSize}%`);
    if (readerStyle.fontFamily) {
      rendition.themes.font(readerStyle.fontFamily);
    } else {
      // 空值会 removeProperty，恢复书籍默认字体
      rendition.themes.override("font-family", "");
    }
    // 仅在开启加粗时覆盖；关闭时移除，避免把标题等原有加粗冲掉
    rendition.themes.override(
      "font-weight",
      readerStyle.bold ? "700" : "",
      true
    );
    rendition.themes.override("line-height", String(readerStyle.lineHeight));
    rendition.themes.override("color", theme.color);
    rendition.themes.override("background", theme.background);
    rendition.themes.override("padding-left", "0");
    rendition.themes.override("padding-right", "0");
    rendition.themes.override("margin", "0");

    if (viewerRef.value) {
      viewerRef.value.style.background = theme.background;
    }

    // 强制按当前可视区域重算分栏，并回到当前 CFI，避免页面对不齐
    if (options?.realign !== false) {
      const { width, height } = getViewerSize();
      try {
        rendition.resize(width, height);
      } catch (error) {
        console.warn("rendition.resize failed", error);
      }
      if (cfi) {
        rendition.display(cfi).catch(() => undefined);
      }
    }

    saveReaderStyle();
  } catch (error) {
    // 样式失败不应阻断阅读
    console.warn("applyReaderStyle failed", error);
  }
}

function onStyleChange() {
  applyReaderStyle({ realign: true });
}

function resetReaderStyle() {
  Object.assign(readerStyle, DEFAULT_STYLE);
  onStyleChange();
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

async function turnPage(direction: "prev" | "next") {
  if (loading.value || pageTurnLock || !rendition) return;
  pageTurnLock = true;
  try {
    if (direction === "next") await rendition.next();
    else await rendition.prev();
  } catch (error) {
    console.warn("翻页失败", error);
  } finally {
    window.setTimeout(() => {
      pageTurnLock = false;
    }, 320);
  }
}

function goPrev() {
  turnPage("prev");
}

function goNext() {
  turnPage("next");
}

function onKeydown(e: KeyboardEvent) {
  if (tocVisible.value || styleVisible.value) return;
  if (e.repeat) return;
  // 同一按键事件若被 window / iframe 各收到一次，用 timeStamp 去重
  if (e.timeStamp && e.timeStamp === lastKeyTimeStamp) return;
  lastKeyTimeStamp = e.timeStamp || 0;

  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    e.stopPropagation();
    goNext();
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    e.stopPropagation();
    goPrev();
  }
}

function onWheel(e: WheelEvent) {
  if (loading.value || tocVisible.value || styleVisible.value) return;
  if (Math.abs(e.deltaY) < 8) return;
  if (e.deltaY > 0) goNext();
  else goPrev();
}

function bindContentsInput(contents: any) {
  const doc: Document | undefined = contents?.document;
  if (!doc) return;

  const keyHandler = (e: KeyboardEvent) => onKeydown(e);
  const wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWheel(e);
  };

  doc.addEventListener("keydown", keyHandler, true);
  doc.addEventListener("wheel", wheelHandler, {
    passive: false,
    capture: true,
  });

  contentCleanups.push(() => {
    doc.removeEventListener("keydown", keyHandler, true);
    doc.removeEventListener("wheel", wheelHandler, true);
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

function onWindowResize() {
  if (!rendition || loading.value) return;
  applyReaderStyle({ realign: true });
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
    const { width, height } = getViewerSize();

    epubBook = ePub(buffer);
    rendition = epubBook.renderTo(viewerRef.value, {
      width,
      height,
      flow: "paginated",
      spread: "none",
      allowScriptedContent: true,
    });

    rendition.hooks.content.register(bindContentsInput);

    await epubBook.ready;
    await loadToc();
    // 先套样式，再 display，避免 display 后再改 padding 把分页弄乱
    applyReaderStyle({ realign: false });

    const savedCfi = res.data.readingProgress?.cfi;
    const savedPercentage = res.data.readingProgress?.percentage || 0;
    progressPercent.value = savedPercentage;
    if (savedCfi) latestCfi = savedCfi;

    // 进度 CFI 可能失效，失败时回退到开头，避免整页显示“加载失败”
    try {
      if (savedCfi) {
        await rendition.display(savedCfi);
      } else {
        await rendition.display();
      }
    } catch (displayError) {
      console.warn("display saved cfi failed, fallback to start", displayError);
      await rendition.display();
    }

    // display 后按最终尺寸再对齐一次（失败也不阻断）
    applyReaderStyle({ realign: true });
    loading.value = false;
    errorMsg.value = "";
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
  // 仅作 iframe 失焦时的兜底；与 iframe 监听用 timeStamp 去重
  window.addEventListener("keydown", onKeydown, true);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("focus", focusReader);
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown, true);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("focus", focusReader);
  window.removeEventListener("resize", onWindowResize);
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
