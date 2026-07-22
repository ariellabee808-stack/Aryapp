import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Sparkles, Play, Download, X, Film, 
  RotateCcw, Sliders, Image as ImageIcon, Loader2, 
  AlertCircle, CheckCircle2, Send, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVideoToChat?: (videoUrl: string, prompt: string) => void;
  audioMuted?: boolean;
}

const sampleVideoPrompts = [
  {
    title: 'Neon Cyberpunk Alley 🏙️',
    prompt: 'A cinematic 4k drone shot flying through a rain-slicked cyberpunk alley with vivid neon reflections, glowing holographic billboards, and fog rolling across the pavement.',
    aspectRatio: '16:9'
  },
  {
    title: 'Cosmic Nebula Odyssey 🌌',
    prompt: 'A breathtaking interstellar voyage zooming through a shimmering star cluster and swirling violet nebula dust with glowing energy particles drifting in deep space.',
    aspectRatio: '16:9'
  },
  {
    title: 'Emerald Forest Waterfall 🌿',
    prompt: 'Hyper-realistic video of a serene emerald forest waterfall cascading over mossy rocks, with golden sunlight filtering through misty canopy trees.',
    aspectRatio: '9:16'
  },
  {
    title: 'Futuristic Robot Craftsman 🤖',
    prompt: 'Macro shot of an intricate humanoid robot assembling a glowing crystal core on a polished futuristic workbench with soft atmospheric light.',
    aspectRatio: '16:9'
  }
];

const generationStatusSteps = [
  'Initializing neural video synthesis pipeline... 🧠',
  'Analyzing spatial composition & lighting vectors... 📐',
  'Constructing temporal motion keyframes... 🎞️',
  'Rendering atmospheric volumetric effects... 💨',
  'Synthesizing high-definition video frames... 🎬',
  'Encoding MP4 container & final mastering... 📦'
];

export const VideoStudio: React.FC<VideoStudioProps> = ({
  isOpen,
  onClose,
  onInsertVideoToChat,
  audioMuted = true
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  // Image frame upload state (Image-to-Video)
  const [frameImage, setFrameImage] = useState<{ base64: string; preview: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessageIdx, setStatusMessageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);

  // Cycle status messages during video generation
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setStatusMessageIdx((prev) => (prev + 1) % generationStatusSteps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle frame image selection
  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const commaIndex = dataUrl.indexOf(',');
      const base64 = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
      setFrameImage({
        base64,
        preview: dataUrl,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Poll for video generation completion
  const pollOperationStatus = async (opName: string) => {
    const startTime = Date.now();
    const timeoutMs = 5 * 60 * 1000; // 5 minute max poll

    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to check video status');
        }

        const data = await res.json();
        if (data.done) {
          if (data.error) {
            throw new Error(data.error.message || 'Video generation failed on server.');
          }

          // Fetch final MP4 video blob
          const downloadRes = await fetch('/api/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName })
          });

          if (!downloadRes.ok) {
            const downloadErr = await downloadRes.json();
            throw new Error(downloadErr.error || 'Failed to download generated video.');
          }

          const blob = await downloadRes.blob();
          const videoUrl = URL.createObjectURL(blob);
          setGeneratedVideoUrl(videoUrl);
          setIsGenerating(false);
          return;
        }

        // Wait 4 seconds before polling again
        await new Promise((r) => setTimeout(r, 4000));
      } catch (err: any) {
        console.error('Polling error:', err);
        setErrorMessage(err.message || 'Video generation failed.');
        setIsGenerating(false);
        return;
      }
    }

    setErrorMessage('Video generation timed out after 5 minutes.');
    setIsGenerating(false);
  };

  // Start Video Generation
  const handleStartGeneration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !frameImage) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setStatusMessageIdx(0);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Animate this frame with fluid cinematic motion.',
          aspectRatio,
          resolution,
          imageBase64: frameImage?.base64,
          mimeType: frameImage?.mimeType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!data.operationName) {
        throw new Error('Server did not return a valid video operation name.');
      }

      setOperationName(data.operationName);
      // Begin polling status
      pollOperationStatus(data.operationName);
    } catch (err: any) {
      console.error('Generation init error:', err);
      setErrorMessage(err.message || 'Failed to initiate video generation.');
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col my-8 max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                <Video className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  ARIELLA <span className="text-violet-400">VIDEO STUDIO</span> 🎬
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Generative AI Video Engine powered by Veo 3.1 🎥
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Top Config Row */}
            <form onSubmit={handleStartGeneration} className="space-y-6">
              {/* Prompt Input Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-violet-400" />
                  Video Motion Prompt 💡
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the motion, lighting, camera movement, and aesthetic of your video scene... 🎥"
                    disabled={isGenerating}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Sample Prompts Row */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono text-slate-400">Instant Prompt Templates ⚡</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sampleVideoPrompts.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setPrompt(s.prompt);
                        setAspectRatio(s.aspectRatio as any);
                      }}
                      className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-violet-500/30 hover:bg-slate-950 transition-all text-left group"
                    >
                      <p className="text-xs font-bold text-slate-200 group-hover:text-violet-300 transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {s.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Frame Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-fuchsia-400" />
                    Starting Frame (Optional) 🖼️
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFrameUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {frameImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-violet-500/40 bg-slate-950 h-24 flex items-center justify-center group">
                      <img
                        src={frameImage.preview}
                        alt="Starting Frame"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          type="button"
                          onClick={() => setFrameImage(null)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 rounded-2xl border border-dashed border-slate-800 hover:border-violet-500/40 bg-slate-950/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-violet-300 transition-all text-xs"
                    >
                      <ImageIcon className="h-5 w-5 text-slate-500" />
                      <span>Upload Image to Animate 🖼️</span>
                    </button>
                  )}
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Film className="h-4 w-4 text-sky-400" />
                    Aspect Ratio 📐
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-24">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAspectRatio('16:9')}
                      className={`rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                        aspectRatio === '16:9'
                          ? 'border-violet-500 bg-violet-950/20 text-violet-300 shadow-md'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-4 border border-current rounded-sm mb-1" />
                      <span className="text-xs font-bold">16:9 📺</span>
                      <span className="text-[10px] opacity-70">Widescreen</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setAspectRatio('9:16')}
                      className={`rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                        aspectRatio === '9:16'
                          ? 'border-violet-500 bg-violet-950/20 text-violet-300 shadow-md'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-4 h-8 border border-current rounded-sm mb-1" />
                      <span className="text-xs font-bold">9:16 📱</span>
                      <span className="text-[10px] opacity-70">Vertical Reel</span>
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    Resolution 🎬
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-24">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setResolution('720p')}
                      className={`rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                        resolution === '720p'
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-md'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold">720p HD</span>
                      <span className="text-[10px] opacity-70">Fast Generation</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setResolution('1080p')}
                      className={`rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                        resolution === '1080p'
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-md'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold">1080p FHD</span>
                      <span className="text-[10px] opacity-70">High Definition</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Trigger Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating || (!prompt.trim() && !frameImage)}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    isGenerating || (!prompt.trim() && !frameImage)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span>Generating Video... ⏳</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Render AI Video Scene 🎬</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-sm flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Video Render Error ⚠️</p>
                  <p className="text-xs text-rose-300/80 leading-relaxed mt-0.5">
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Generation In-Progress Loader Stage */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl border border-violet-500/20 bg-slate-950/80 text-center space-y-6 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-sky-600/10 blur-2xl animate-pulse pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-violet-500/40 shadow-glow-lg">
                    <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                    <Sparkles className="h-5 w-5 text-fuchsia-400 absolute animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
                      Veo Neural Cinema Processing 🎥
                    </p>
                    <motion.p
                      key={statusMessageIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-violet-300 font-semibold"
                    >
                      {generationStatusSteps[statusMessageIdx]}
                    </motion.p>
                  </div>

                  <div className="w-full max-w-md h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
                      initial={{ width: '5%' }}
                      animate={{ width: '95%' }}
                      transition={{ duration: 180, ease: 'linear' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generated Video Player Viewport */}
            {generatedVideoUrl && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-emerald-500/30 bg-slate-950/90 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>AI Video Render Complete! 🎉</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    MP4 • {aspectRatio} • {resolution}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[420px]">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full max-h-[420px] object-contain rounded-2xl"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={generatedVideoUrl}
                    download={`ariella_ai_video_${Date.now()}.mp4`}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <Download className="h-4 w-4" /> Download MP4 ⬇️
                  </a>

                  {onInsertVideoToChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onInsertVideoToChat(generatedVideoUrl, prompt);
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-950/50"
                    >
                      <Send className="h-4 w-4" /> Send Video to Chat 💬
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
