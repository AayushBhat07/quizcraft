"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  RotateCcw,
  Home,
  Flame,
  Star,
  Lightbulb,
} from "lucide-react";

// ─── Load real questions from JSON ─────────────────────────────────────────────
import questionsData from "@/data/questions.json";

type RawQuestion = {
  id: string;
  text: string;
  options?: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
};

type RawChapter = {
  id: string;
  name: string;
  questions: RawQuestion[];
};

type RawSubject = {
  id: string;
  name: string;
  chapters: RawChapter[];
};

type QuestionsData = Record<string, RawSubject>;

function getAllQuestions(): RawQuestion[] {
  const raw = questionsData as unknown as { subject?: RawSubject; subjects?: RawSubject[] };
  if (raw.subject) return raw.subject.chapters.flatMap((c: RawChapter) => c.questions);
  if (Array.isArray(raw.subjects)) {
    return raw.subjects.flatMap((s: RawSubject) => s.chapters.flatMap((c: RawChapter) => c.questions));
  }
  return Object.values(raw as QuestionsData).flatMap((s: RawSubject) => s.chapters.flatMap((c: RawChapter) => c.questions));
}

function getQuestionMap(): Map<string, RawQuestion & { chapterName: string }> {
  const raw = questionsData as any;
  const map = new Map<string, RawQuestion & { chapterName: string }>();

  let subjects: RawSubject[] = [];
  if (Array.isArray(raw.subjects)) {
    subjects = raw.subjects;
  } else if (raw.subject) {
    subjects = [raw.subject];
  }

  for (const s of subjects) {
    for (const c of s.chapters) {
      for (const q of c.questions) {
        map.set(q.id, { ...q, chapterName: c.name });
      }
    }
  }
  return map;
}

// ─── Explanations for Chapter 4 (General Computer Science) new-q* questions ───
// These are verified domain-knowledge 1-line explanations.
const newQExplanations: Record<string, string> = {
  "new-q1": "GPU handles parallel visual computations, not general-purpose sequential tasks.",
  "new-q2": "The CPU's internal architecture determines how efficiently it executes instructions.",
  "new-q3": "Multicore processors allow parallel instruction streams, improving throughput.",
  "new-q4": "Hyper-threading lets one physical core handle two threads by sharing execution units.",
  "new-q5": "ARM's low-power design makes it ideal for mobile and embedded devices.",
  "new-q6": "Cache memory sits between the CPU and main memory to reduce access latency.",
  "new-q7": "The memory hierarchy places registers closest to the CPU, then cache, then RAM.",
  "new-q8": "Cache hits occur when requested data is found in faster cache memory.",
  "new-q9": "The memory wall is the growing speed gap between CPU and main memory.",
  "new-q10": "Register access takes a single CPU cycle, making it the fastest memory type.",
  "new-q11": "Cache locality exploits temporal and spatial patterns in memory access.",
  "new-q12": "Write-back defers writing to main memory until the cache line is evicted.",
  "new-q13": "TLB speeds up virtual-to-physical address translation for frequently accessed pages.",
  "new-q14": "DRAM stores each bit as a charge in a capacitor, requiring periodic refresh.",
  "new-q15": "SRAM uses flip-flops to store bits — faster but more expensive than DRAM.",
  "new-q16": "Cache associativity determines how freely a block can be placed in the cache.",
  "new-q17": "L1 cache is the smallest and fastest, closest to the CPU core.",
  "new-q18": "Cache line size affects both spatial locality and bandwidth efficiency.",
  "new-q19": "The replacement policy decides which cache block to evict when a new block arrives.",
  "new-q20": "Write-through writes to both cache and main memory simultaneously.",
  "new-q21": "Memory bandwidth is the maximum rate at which data can be read from memory.",
  "new-q22": "Prefetching loads data into cache before it's explicitly requested by the CPU.",
  "new-q23": "Cache coherency ensures all CPU cores see the same data for the same memory location.",
  "new-q24": "MESI protocol uses four states (Modified, Exclusive, Shared, Invalid) to maintain cache coherency.",
  "new-q25": "A cache miss triggers a memory access that takes dozens of CPU cycles.",
  "new-q26": "Instruction cache stores frequently used program instructions for faster fetching.",
  "new-q27": "A bus is a shared communication channel connecting CPU, memory, and peripherals.",
  "new-q28": "DMA allows peripherals to transfer data directly to memory without CPU intervention.",
  "new-q29": "Memory-mapped I/O uses the same address bus for both memory and device registers.",
  "new-q30": "Polling repeatedly checks device status, while interrupts notify the CPU on events.",
  "new-q31": "Interrupts are hardware signals that pause the CPU to handle I/O events.",
  "new-q32": "The interrupt handler is a specific routine the OS executes when an interrupt fires.",
  "new-q33": "I/O devices use handshaking signals to coordinate data transfer with the CPU.",
  "new-q34": "Buffered I/O uses a memory buffer to decouple fast CPU from slower I/O devices.",
  "new-q35": "Direct memory access (DMA) bypasses the CPU for bulk data transfers.",
  "new-q36": "The northbridge historically connected the CPU, memory, and high-speed graphics bus.",
  "new-q37": "The southbridge handles slower I/O devices like USB, audio, and storage.",
  "new-q38": "PCI Express uses point-to-point serial lanes, replacing the older parallel bus architecture.",
  "new-q39": "Chipset components manage data flow between the CPU and all peripheral buses.",
  "new-q40": "The front-side bus (FSB) connected the CPU to the northbridge in older architectures.",
  "new-q41": "Hypertransport and Infinity Fabric are high-speed CPU-to-CPU and CPU-to-memory links.",
  "new-q42": "DIMM modules contain multiple DRAM chips arranged in a 64-bit data width.",
  "new-q43": "ECC memory detects and corrects single-bit errors in stored data.",
  "new-q44": "Dual-channel memory doubles the bandwidth by using two memory modules in parallel.",
  "new-q45": "RAM frequency determines how fast data can be read from or written to memory.",
  "new-q46": "CAS latency measures the delay between a memory command and the first data available.",
  "new-q47": "Memory timings (CL, tRCD, tRP) define the performance characteristics of DRAM.",
  "new-q48": "XMP profiles let users enable faster than standard memory timings in BIOS.",
  "new-q49": "Non-volatile memory retains data without power, unlike volatile DRAM and SRAM.",
  "new-q50": "NVRAM combines the speed of DRAM with the persistence of flash memory.",
  "new-q51": "Memory fragmentation occurs when free space becomes non-contiguous over time.",
  "new-q52": "Virtual memory extends available RAM using disk space as temporary storage.",
  "new-q53": "Page tables translate virtual addresses to physical addresses in virtual memory systems.",
  "new-q54": "Page replacement algorithms decide which memory pages to evict under memory pressure.",
  "new-q55": "The working set is the set of pages a process actively uses in a given time window.",
  "new-q56": "Thrashing occurs when the system spends more time swapping pages than executing instructions.",
  "new-q57": "Memory paging moves pages between RAM and disk storage to manage physical memory limits.",
  "new-q58": "Large pages (huge pages) reduce TLB misses by mapping more memory per TLB entry.",
  "new-q59": "Memory overcommit allows the system to allocate more virtual memory than physical RAM.",
  "new-q60": "Memory compression stores rarely used pages in a compressed form within RAM.",
  "new-q61": "KSM (Kernel Same-page Merging) deduplicates identical memory pages across processes.",
  "new-q62": "NUMA systems give each CPU its own local memory for lower latency.",
  "new-q63": "Memory hot-plugging allows adding RAM to a running system without rebooting.",
  "new-q64": "Memory mirroring duplicates data across two channels for fault tolerance.",
  "new-q65": "Copy-on-write defers duplication of memory pages until one process modifies them.",
  "new-q66": "Process isolation ensures one process cannot access another's private memory.",
  "new-q67": "Address space layout randomization (ASLR) randomizes memory addresses to prevent exploits.",
  "new-q68": "Kernel address space layout randomization (KASLR) extends ASLR to kernel memory.",
  "new-q69": "Memory pinning prevents pages from being swapped out for real-time performance.",
  "new-q70": "Memory zones (dma32, normal) divide memory based on hardware addressing capabilities.",
  "new-q71": "Slab allocation pre-allocates object caches to speed up kernel memory requests.",
  "new-q72": "Memory cgroups limit the RAM each group of processes can use.",
  "new-q73": "OOM killer terminates the largest memory-consuming process when RAM is exhausted.",
  "new-q74": "/proc/meminfo reports detailed memory usage statistics in Linux systems.",
  "new-q75": "The commit limit in Linux represents the total virtual memory that can be allocated.",
  "new-q76": "Memory-mapped files map file contents directly into the process's virtual address space.",
  "new-q77": "CoW forks share memory pages until either parent or child writes to them.",
  "new-q78": "kswapd reclaims memory by evicting least-recently-used pages.",
  "new-q79": "dirty ratios control when the kernel writes modified pages back to disk.",
  "new-q80": "Transparent hugepages automatically use 2MB pages to reduce TLB pressure.",
  "new-q81": "GPU architecture uses thousands of small cores for parallel workloads.",
  "new-q82": "Shader cores in a GPU execute the same instruction across many pixels simultaneously.",
  "new-q83": "CUDA cores are NVIDIA's parallel processing units for general GPU computing.",
  "new-q84": "A compute unit in AMD GPUs groups multiple stream processors together.",
  "new-q85": "GPU memory bandwidth is critical for feeding data to thousands of parallel cores.",
  "new-q86": "GDDR memory is designed for high bandwidth, not low latency.",
  "new-q87": "Tensor cores accelerate matrix operations used in deep learning workloads.",
  "new-q88": "Ray tracing cores accelerate real-time ray tracing for realistic lighting.",
  "new-q89": "GPU memory hierarchy includes global, shared, and registers for different access patterns.",
  "new-q90": "Shared memory in GPUs is a fast on-chip memory accessible by all threads in a block.",
  "new-q91": "Warp divergence occurs when threads in a warp take different execution paths.",
  "new-q92": "Occupancy measures how many warps are active on a GPU compute unit.",
  "new-q93": "GPU pipelines overlap memory operations with computation to hide latency.",
  "new-q94": "Unified memory allows CPU and GPU to share the same virtual address space.",
  "new-q95": "Zero-copy lets the GPU access system memory directly without copying.",
  "new-q96": "Peer-to-peer GPU communication transfers data directly between GPUs.",
  "new-q97": "GPU virtualization splits a physical GPU into multiple virtual GPUs.",
  "new-q98": "MIG (Multi-Instance GPU) divides a GPU into isolated compute instances.",
  "new-q99": "GPU scheduling decides which kernels run on which cores at any given time.",
  "new-q100": "Graphics pipelines convert 3D scenes into 2D images for display on screens.",
  "new-q101": "Vertex shaders transform 3D coordinates and apply lighting calculations.",
  "new-q102": "Fragment shaders compute the color and other attributes of each pixel.",
  "new-q103": "Rasterization converts vector geometry into pixel fragments for screen display.",
  "new-q104": "Z-buffering tracks the depth of each pixel to correctly render overlapping objects.",
  "new-q105": "Anti-aliasing smooths jagged edges by sampling multiple points per pixel.",
  "new-q106": "Bloom adds a glow effect around bright areas to simulate real-world light.",
  "new-q107": "Ambient occlusion darkens corners and crevices to add depth to scenes.",
  "new-q108": "Tessellation subdivides polygons into smaller triangles for smoother geometry.",
  "new-q109": "Screen-space reflections use the already-rendered image to approximate reflections.",
  "new-q110": "Motion blur simulates the streaking of fast-moving objects in a scene.",
  "new-q111": "Ray tracing follows light rays from the camera through the scene for realistic images.",
  "new-q112": "Path tracing extends ray tracing by simulating the full path of light through a scene.",
  "new-q113": "Global illumination models how light bounces between all surfaces in a scene.",
  "new-q114": "Radiometry measures light energy as it travels through space.",
  "new-q115": "BRDF (Bidirectional Reflectance Distribution Function) describes how light reflects off surfaces.",
  "new-q116": "Physically Based Rendering (PBR) uses realistic material and lighting models.",
  "new-q117": "Metalness controls whether a surface behaves as a metal or a dielectric.",
  "new-q118": "Roughness determines how sharp or blurry reflections appear on a surface.",
  "new-q119": "Emissive materials emit light rather than reflecting it from other sources.",
  "new-q120": "Subsurface scattering simulates light penetrating translucent materials like skin.",
  "new-q121": "Texture mapping applies 2D images to 3D surfaces for detail.",
  "new-q122": "Normal mapping encodes surface detail as RGB values without adding geometry.",
  "new-q123": "Displacement mapping actually moves vertices to match surface bump details.",
  "new-q124": "Cube maps are 6 textures that surround a point to represent environment lighting.",
  "new-q125": "Mipmapping pre-computes smaller versions of textures to prevent aliasing.",
  "new-q126": "Anisotropic filtering improves texture quality on surfaces angled to the viewer.",
  "new-q127": "Texture atlases pack many small textures into one large texture to reduce draw calls.",
  "new-q128": "Virtual texturing streams texture data on demand to support large worlds.",
  "new-q129": "Bindless graphics allows shaders to access any texture without binding it to a slot.",
  "new-q130": "Graphics command buffers queue rendering operations for asynchronous submission.",
  "new-q131": "Fences synchronize between the GPU and CPU to track when work is complete.",
  "new-q132": "Double buffering renders to one frame while displaying another to avoid tearing.",
  "new-q133": "Vertical sync (v-sync) locks frame rate to the monitor's refresh rate.",
  "new-q134": "Triple buffering adds a third buffer to reduce stuttering when v-sync is on.",
  "new-q135": "Frame time is how long a frame takes to render; lower is better.",
  "new-q136": "GPU usage percentage shows how much of the GPU's capacity is being utilized.",
  "new-q137": "GPU temperature affects clock speed via thermal throttling to prevent damage.",
  "new-q138": "Power limits cap GPU performance to manage heat and electricity consumption.",
  "new-q139": "Boost clock increases GPU frequency dynamically when temperature and power allow.",
  "new-q140": "Founders Edition GPUs use reference designs from the GPU manufacturer.",
  "new-q141": "Aftermarket coolers use larger fans and better heatsinks for lower temperatures.",
  "new-q142": "Liquid cooling removes heat by circulating coolant through a radiator.",
  "new-q143": "GPU dying gasp is the last signal sent before power loss for graceful shutdown.",
  "new-q144": "Resizable BAR lets the CPU access the full GPU memory in one transaction.",
  "new-q145": "DLSS (Deep Learning Super Sampling) uses AI to upscale lower-resolution images.",
  "new-q146": "FSR (FidelityFX Super Resolution) is AMD's open-source upscaling technology.",
  "new-q147": "NIS (NVIDIA Image Scaling) is NVIDIA's open-source upscaling solution.",
  "new-q148": "Ray tracing DNNs use deep learning to denoise sparse ray tracing samples.",
  "new-q149": "Game Ready drivers are optimized for specific game releases.",
  "new-q150": "Studio drivers prioritize stability and performance in creative applications.",
  "new-q151": "GPU bios updates can unlock more power limits or improve compatibility.",
  "new-q152": "PCIe generation determines maximum bandwidth: PCIe 3.0 = 8 GT/s, PCIe 4.0 = 16 GT/s.",
  "new-q153": "Resizable BAR requires both GPU and CPU support to function.",
  "new-q154": "NVLink enables high-speed GPU-to-GPU communication for parallel workloads.",
  "new-q155": "SLI (Scalable Link Interface) used to combine multiple NVIDIA GPUs.",
  "new-q156": "CrossFire used to combine multiple AMD GPUs.",
  "new-q157": "DirectX 12 enables low-level GPU control for better multi-threaded performance.",
  "new-q158": "Vulkan provides cross-platform low-overhead access to GPU hardware.",
  "new-q159": "OpenGL is an older graphics API with broader driver support.",
  "new-q160": "Metal is Apple's GPU framework for iOS and macOS applications.",
  "new-q161": "Compute shaders are GPU programs designed for general parallel computation.",
  "new-q162": "TensorFlow and PyTorch use GPUs for accelerated deep learning training.",
  "new-q163": "CUDA is NVIDIA's proprietary parallel computing platform and API.",
  "new-q164": "OpenCL is an open standard for heterogeneous parallel computing.",
  "new-q165": "HIP translates CUDA code to run on AMD GPUs.",
  "new-q166": "ROCm is AMD's open-source GPU computing platform.",
  "new-q167": "GPU performance per watt measures efficiency of compute per energy consumed.",
  "new-q168": "GPUdie size correlates with transistor count and thermal output.",
  "new-q169": "Yield rate determines how many functional chips are produced per wafer.",
  "new-q170": "TSMC and Samsung are the primary contract manufacturers for GPUs.",
  "new-q171": "FinFET transistors replaced planar transistors at 16nm to reduce leakage.",
  "new-q172": "Chip stacking (2.5D/3D) places memory and logic in the same package.",
  "new-q173": "CoWoS (Chip on Wafer on Substrate) is TSMC's packaging technology.",
  "new-q174": "HBM (High Bandwidth Memory) stacks memory chips vertically for massive bandwidth.",
  "new-q175": "HBM2E stacks memory layers to achieve terabytes per second of bandwidth.",
  "new-q176": "GDDR6X uses PAM4 signaling to double data rate compared to GDDR6.",
  "new-q177": "Infinity Cache is an on-chip SRAM cache in AMD RDNA 2 GPUs.",
  "new-q178": "RT cores accelerate bounding volume hierarchy traversal for ray tracing.",
  "new-q179": "Mesh shaders replace the traditional geometry pipeline with a programmable model.",
  "new-q180": "Variable rate shading adjusts shading rate across the screen to save GPU power.",
  "new-q181": "Sampler feedback tracks which texture regions are actually used by the application.",
  "new-q182": "DirectStorage optimizes loading game assets directly from NVMe to GPU.",
  "new-q183": "Shader compilation converts high-level shader code into GPU machine code.",
  "new-q184": "SPIR-V is an intermediate representation for GPU shader binaries.",
  "new-q185": "Async compute allows independent GPU tasks to run simultaneously.",
  "new-q186": "Timestamp queries measure how long specific GPU operations take.",
  "new-q187": "Present barriers prevent the screen from updating until rendering is complete.",
  "new-q188": "GPU trace analysis identifies bottlenecks in graphics pipeline performance.",
  "new-q189": "Nsight Graphics profiles GPU frame-by-frame to identify performance issues.",
  "new-q190": "Render graphs abstract GPU resource management for cleaner code.",
  "new-q191": "Command lists group GPU operations for efficient batch submission.",
  "new-q192": "Descriptor tables define resource views (textures, buffers) for shaders.",
  "new-q193": "Pipeline state objects cache all fixed-function settings for faster switching.",
  "new-q194": "Scratch memory is fast local storage on the GPU for temporary data.",
  "new-q195": "Constant memory holds data that doesn't change across all threads.",
  "new-q196": "Thread blocks group threads that can share resources and synchronize.",
  "new-q197": "Grid dimensions define how many thread blocks launch for a kernel.",
  "new-q198": "Global memory has high latency; use shared memory to improve performance.",
  "new-q199": "Bank conflicts occur when multiple threads access the same shared memory bank.",
  "new-q200": "Coalesced memory access combines requests from multiple threads into fewer transactions.",
  "new-q201": "GPU atomics allow threads to safely update shared memory locations.",
  "new-q202": "Stream compaction reorders data to remove invalid or unwanted entries.",
  "new-q203": "Reduction operations combine all elements into a single result (e.g., sum).",
  "new-q204": "Scan operations compute running totals across an array of elements.",
};

// ─── Interfaces ─────────────────────────────────────────────────────────────────
interface AttemptData {
  id: string;
  date: number;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  chapters: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  wrongQuestionIds: string[];
}

interface WrongQuestion {
  id: string;
  text: string;
  options: Record<string, string>;
  yourAnswer: string;
  correctAnswer: string;
  topic: string;
  chapterName: string;
  explanation: string;
}

// ─── Color palette ─────────────────────────────────────────────────────────────
const C = {
  bg: "#1D1E2C",
  surface: "#252636",
  accent: "#AC9FBB",
  secondary: "#59656F",
  light: "#F7EBEC",
  muted: "#DDBDD5",
  success: "#81c784",
  error: "#e57373",
  amber: "#FFB74D",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getExplanation(qId: string, fallback: string): string {
  return newQExplanations[qId] ?? fallback;
}

// ─── Circular Score Ring ───────────────────────────────────────────────────────
function ScoreCircle({ percentage, size = 180 }: { percentage: number; size?: number }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? C.success : percentage >= 50 ? C.amber : C.error;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.surface} strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
          {percentage}%
        </span>
        <span className="text-sm" style={{ color: C.muted }}>Score</span>
      </div>
    </div>
  );
}

// ─── Chapter Score Ring (small) ────────────────────────────────────────────────
function ChapterRing({ correct, total, size = 52 }: { correct: number; total: number; size?: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? C.success : pct >= 50 ? C.amber : C.error;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.surface} strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
        {pct}%
      </span>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [expandedWrong, setExpandedWrong] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quizcraft_last_attempt");
    if (!stored) {
      setNotFound(true);
      return;
    }
    try {
      const data: AttemptData = JSON.parse(stored);
      setAttempt(data);

      const qMap = getQuestionMap();
      const answersRaw = localStorage.getItem("quizcraft_answers");
      const answers: Record<string, string> = answersRaw ? JSON.parse(answersRaw) : {};

      const wrong: WrongQuestion[] = data.wrongQuestionIds
        .map((id) => {
          const q = qMap.get(id);
          if (!q) return null;
          const fallbackExplanation = `Review the fundamentals of "${q.topic}" for better understanding.`;
          return {
            id: q.id,
            text: q.text,
            options: q.options ?? { A: "", B: "", C: "", D: "" },
            yourAnswer: answers[q.id] || "?",
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            chapterName: q.chapterName,
            explanation: getExplanation(q.id, fallbackExplanation),
          } as WrongQuestion;
        })
        .filter(Boolean) as WrongQuestion[];

      setWrongQuestions(wrong);
    } catch {
      setNotFound(true);
    }
  }, [attemptId]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: C.bg }}>
        <Card className="max-w-md w-full text-center p-8" style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
            No Results Found
          </h2>
          <p className="mb-6" style={{ color: C.muted }}>Take a quiz first to see your results here.</p>
          <Button onClick={() => router.push("/")} className="w-full" style={{ backgroundColor: C.accent, color: C.bg, fontFamily: "Lexend, sans-serif" }}>
            <Home className="w-4 h-4 mr-2" />Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⚡</div>
          <p style={{ color: C.muted }}>Loading results...</p>
        </div>
      </div>
    );
  }

  const isFasterThanAvg = attempt.timeTaken < 300;

  // ── Chapter analysis ─────────────────────────────────────────────────────
  const chapterEntries = Object.entries(attempt.chapters || {});
  const chapterData = chapterEntries
    .map(([name, data]) => ({
      name,
      correct: data.correct,
      total: data.total,
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

  const worst = chapterData[0];
  const best = chapterData[chapterData.length - 1];
  const chapterSummary =
    chapterData.length > 0
      ? best.pct >= 70
        ? `🏆 You aced ${best.name} — keep pushing on ${worst?.name}!`
        : `📚 Focus on ${worst?.name} — that's where the gaps are.`
      : "";

  // ── Weak topics (topic name → chapter name) from wrong questions ─────────
  // Build topic→chapter map from wrongQuestions
  const topicChapterMap: Record<string, string> = {};
  const topicWrongCount: Record<string, number> = {};
  wrongQuestions.forEach((wq) => {
    topicChapterMap[wq.topic] = wq.chapterName;
    topicWrongCount[wq.topic] = (topicWrongCount[wq.topic] ?? 0) + 1;
  });

  const weakTopicList = Object.keys(topicWrongCount).map((topic) => ({
    topic,
    chapter: topicChapterMap[topic] ?? "Unknown",
    wrongCount: topicWrongCount[topic],
  })).sort((a, b) => b.wrongCount - a.wrongCount);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} style={{ color: C.muted }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
            Quiz Results
          </h1>
        </div>

        {/* Score Card */}
        <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle percentage={attempt.percentage} />
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                    {attempt.score}/{attempt.total}
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>questions correct</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.bg }}>
                    <Clock className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>{formatTime(attempt.timeTaken)}</span>
                  </div>
                  {isFasterThanAvg && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: `${C.success}22` }}>
                      <TrendingUp className="w-4 h-4" style={{ color: C.success }} />
                      <span style={{ color: C.success }}>Faster than average!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.bg }}>
                    <Target className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>{Math.round(attempt.timeTaken / attempt.total)}s/question</span>
                  </div>
                </div>
                <p className="text-3xl">
                  {attempt.percentage >= 80 ? "🎉" : attempt.percentage >= 60 ? "👍" : "📚"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── B. Chapter Performance ────────────────────────────────────────── */}
        {chapterData.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                📊 Chapter Performance
              </CardTitle>
              {chapterSummary && (
                <p className="text-sm mt-1" style={{ color: C.muted }}>
                  {chapterSummary}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="hidden sm:block space-y-3">
                {chapterData.map((ch) => {
                  const color = ch.pct >= 70 ? C.success : ch.pct >= 50 ? C.amber : C.error;
                  return (
                    <div
                      key={ch.name}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: C.bg, border: `1px solid ${color}33` }}
                    >
                      <ChapterRing correct={ch.correct} total={ch.total} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-medium truncate pr-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                            {ch.name}
                          </span>
                          <span className="text-sm flex-shrink-0" style={{ color: C.muted }}>
                            {ch.correct}/{ch.total} correct
                          </span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: C.surface }}>
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${ch.pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                      {ch.pct >= 70 ? (
                        <Star className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                      ) : ch.pct < 50 ? (
                        <Flame className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: compact horizontal scroll rings */}
              <div className="sm:hidden flex gap-3 overflow-x-auto pb-2">
                {chapterData.map((ch) => (
                  <div key={ch.name} className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
                    <ChapterRing correct={ch.correct} total={ch.total} size={64} />
                    <span className="text-xs mt-1 text-center truncate w-full" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                      {ch.name}
                    </span>
                    <span className="text-xs" style={{ color: C.muted }}>
                      {ch.correct}/{ch.total}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 pt-4 border-t justify-center" style={{ borderColor: `${C.secondary}44` }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.success }} />
                  <span className="text-xs" style={{ color: C.muted }}>≥70% Great</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.amber }} />
                  <span className="text-xs" style={{ color: C.muted }}>50-69% OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.error }} />
                  <span className="text-xs" style={{ color: C.muted }}>&lt;50% Focus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── C. Topics to Improve (clean list) ──────────────────────────────── */}
        {weakTopicList.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                🔥 Topics to Improve
              </CardTitle>
              <p className="text-sm mt-0.5" style={{ color: C.muted }}>
                Focus your study on these specific topics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weakTopicList.map(({ topic, chapter, wrongCount }) => (
                  <div
                    key={topic}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.secondary}44` }}
                  >
                    <Flame className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                          {topic}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: C.muted }}>
                          {chapter}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs flex-shrink-0"
                      style={{ borderColor: `${C.error}66`, color: C.error }}
                    >
                      {wrongCount} wrong
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── A. Wrong Answers Review ─────────────────────────────────────────── */}
        {wrongQuestions.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                <XCircle className="w-5 h-5" style={{ color: C.error }} />
                Wrong Answers ({wrongQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((wq) => (
                <div
                  key={wq.id}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.secondary}` }}
                >
                  {/* Question header */}
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() =>
                      setExpandedWrong((prev) => ({ ...prev, [wq.id]: !prev[wq.id] }))
                    }
                  >
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.error }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed" style={{ color: C.light }}>
                        {wq.text}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: `${C.accent}66`, color: C.accent }}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {wq.chapterName}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: `${C.muted}44`, color: C.muted }}
                        >
                          {wq.topic}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 mt-1 transition-transform"
                      style={{ color: C.muted, transform: expandedWrong[wq.id] ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Expanded detail */}
                  {expandedWrong[wq.id] && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${C.secondary}44` }}>

                      {/* Correct vs Your Answer comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <div
                          className="p-3 rounded-lg border-l-4"
                          style={{ backgroundColor: `${C.error}11`, borderLeftColor: C.error }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: C.error }}>
                            ✗ Your Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.error }}>
                            {wq.yourAnswer}. {wq.options[wq.yourAnswer]}
                          </div>
                        </div>
                        <div
                          className="p-3 rounded-lg border-l-4"
                          style={{ backgroundColor: `${C.success}11`, borderLeftColor: C.success }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: C.success }}>
                            ✓ Correct Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.success }}>
                            {wq.correctAnswer}. {wq.options[wq.correctAnswer]}
                          </div>
                        </div>
                      </div>

                      {/* All options with indicator */}
                      <div className="space-y-2">
                        <div className="text-xs" style={{ color: C.muted }}>All Options</div>
                        {Object.entries(wq.options).map(([key, val]) => {
                          const isCorrect = key === wq.correctAnswer;
                          const isWrongSelected = key === wq.yourAnswer && !isCorrect;
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all"
                              style={{
                                backgroundColor: isCorrect
                                  ? `${C.success}18`
                                  : isWrongSelected
                                  ? `${C.error}18`
                                  : `${C.surface}44`,
                                borderLeftColor: isCorrect
                                  ? C.success
                                  : isWrongSelected
                                  ? C.error
                                  : "transparent",
                              }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: isCorrect
                                    ? `${C.success}33`
                                    : isWrongSelected
                                    ? `${C.error}33`
                                    : `${C.secondary}44`,
                                  color: isCorrect ? C.success : isWrongSelected ? C.error : C.muted,
                                  fontFamily: "Lexend, sans-serif",
                                }}
                              >
                                {key}
                              </span>
                              <span className="text-sm flex-1" style={{ color: C.light }}>
                                {val}
                              </span>
                              {isCorrect && (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                              )}
                              {isWrongSelected && (
                                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation (lightbulb box) */}
                      <div
                        className="flex gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: `${C.amber}11`, border: `1px solid ${C.amber}33` }}
                      >
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.amber }} />
                        <p className="text-sm" style={{ color: C.muted }}>
                          {wq.explanation}
                        </p>
                      </div>

                      {/* Retest button */}
                      <Button
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("quizcraft_retest_topic", wq.topic);
                          const subject = localStorage.getItem("quizcraft_subject") || "ete-textbook";
                          router.push(`/quiz/${subject}`);
                        }}
                        className="w-full sm:w-auto"
                        style={{
                          backgroundColor: `${C.accent}22`,
                          color: C.accent,
                          border: `1px solid ${C.accent}66`,
                          fontFamily: "Lexend, sans-serif",
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Practice {wq.topic}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={() => {
              const retestIds = attempt.wrongQuestionIds.slice(0, 25);
              localStorage.setItem("quizcraft_retest_ids", JSON.stringify(retestIds));
              const subject = localStorage.getItem("quizcraft_subject") || "ete-textbook";
              router.push(`/quiz/${subject}`);
            }}
            disabled={attempt.wrongQuestionIds.length === 0}
            style={{
              backgroundColor: C.accent,
              color: C.bg,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retest Wrong Ones
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("quizcraft_retest_ids");
              const subject = localStorage.getItem("quizcraft_subject") || "ete-textbook";
              router.push(`/quiz/${subject}`);
            }}
            style={{
              borderColor: C.secondary,
              color: C.light,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Full Retest
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            style={{
              borderColor: C.secondary,
              color: C.light,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}