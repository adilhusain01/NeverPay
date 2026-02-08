'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/contexts/DashboardContext';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

export default function ImageGenerator() {
  const { address } = useAccount();
  const { dashboardData, refetchDashboard } = useDashboard();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Get available credits from dashboard context
  const availableCredits = dashboardData?.[4] || BigInt(0);

  const handleGenerate = async () => {
    if (!prompt.trim() || !address) return;

    const credits = availableCredits || BigInt(0);
    if (credits < BigInt(1)) {
      setError('Insufficient credits! Please deposit more USDC.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          userAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageUrl: data.imageUrl,
        timestamp: new Date(),
      };

      setGeneratedImages([newImage, ...generatedImages]);
      setPrompt('');

      // Refetch dashboard to update credits after image generation
      refetchDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    "A futuristic city on the moon with glass domes",
    "A magical forest with bioluminescent mushrooms",
    "An underwater kingdom with coral castles",
    "A steampunk airship in golden sunset clouds",
  ];

  return (
    <div className="elevated-card rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Generate Image</h2>
            <p className="text-xs text-[#52525b]">Powered by Google Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)]">
          <span className="glow-dot !w-2 !h-2" />
          <span className="text-sm font-medium text-[#00d4aa]">
            {availableCredits?.toString() || '0'} credits
          </span>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <textarea
            placeholder="Describe the image you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input-field h-32 resize-none pr-4"
            disabled={isGenerating}
          />
          <div className="absolute bottom-3 right-3 text-xs text-[#52525b]">
            {prompt.length}/500
          </div>
        </div>

        {/* Sample Prompts */}
        <div>
          <p className="text-xs text-[#52525b] mb-2">Try a sample prompt:</p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample, i) => (
              <button
                key={i}
                onClick={() => setPrompt(sample)}
                className="text-xs px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]
                           text-[#a1a1aa] hover:text-[#fafafa] border border-[rgba(255,255,255,0.05)]
                           hover:border-[rgba(255,255,255,0.1)] transition-all truncate max-w-[200px]"
                title={sample}
              >
                {sample.substring(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-[#ef4444]">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating || (availableCredits || BigInt(0)) < BigInt(1)}
          className="w-full btn-primary flex items-center justify-center gap-3 py-4"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating with Gemini AI...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Generate Image</span>
              <span className="text-xs opacity-75">(1 credit)</span>
            </>
          )}
        </button>

      </div>

      {/* Generated Images Gallery */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <span>🖼️</span> Generated Images
          </h3>
          {generatedImages.length > 0 && (
            <span className="text-xs text-[#52525b]">{generatedImages.length} images</span>
          )}
        </div>

        {generatedImages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center">
                <span className="text-4xl opacity-50">🎨</span>
              </div>
              <p className="text-[#52525b] mb-1">No images generated yet</p>
              <p className="text-sm text-[#52525b]">Enter a prompt above to create your first AI image</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-[500px]">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]
                           hover:border-[rgba(0,212,170,0.3)] transition-all cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <p className="text-sm text-[#fafafa] line-clamp-2 mb-1">{image.prompt}</p>
                  <p className="text-xs text-[#52525b]">{image.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewing Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden bg-[#12121a] border border-[rgba(255,255,255,0.1)]">
              {/* Control buttons */}
              <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-3 rounded-xl bg-[#0a0a0f]/80 backdrop-blur-sm hover:bg-[#12121a] transition-colors border border-[rgba(255,255,255,0.1)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.imageUrl;
                    link.download = `yieldcredit-ai-${selectedImage.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#7c3aed] hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5 text-[#0a0a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              {/* Info overlay */}
              <div className="p-6 border-t border-[rgba(255,255,255,0.05)]">
                <p className="text-[#fafafa] mb-2">{selectedImage.prompt}</p>
                <p className="text-sm text-[#52525b]">
                  Generated on {selectedImage.timestamp.toLocaleDateString()} at {selectedImage.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
