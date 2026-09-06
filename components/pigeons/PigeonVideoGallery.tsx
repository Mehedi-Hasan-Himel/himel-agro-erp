"use client";

import React, { useState, useEffect } from "react";
import { Pigeon } from "@/types/pigeon";
import { updatePigeon } from "@/lib/repositories/pigeonRepository";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Video,
  Plus,
  Trash2,
  Play,
  ExternalLink,
  X,
  Film,
} from "lucide-react";

export interface PigeonVideoGalleryProps {
  pigeon: Pigeon;
  onPigeonUpdated?: (updated: Pigeon) => void;
}

interface ParsedVideo {
  url: string;
  type: "youtube" | "facebook" | "direct" | "generic";
  embedUrl?: string;
  thumbnailUrl?: string;
}

function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim();

  // YouTube matchers: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      url: trimmed,
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // Facebook video matchers
  if (trimmed.includes("facebook.com") || trimmed.includes("fb.watch")) {
    return {
      url: trimmed,
      type: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        trimmed
      )}&show_text=0&autoplay=1`,
      thumbnailUrl: "",
    };
  }

  // Direct MP4 / WebM / OGG
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      url: trimmed,
      type: "direct",
      embedUrl: trimmed,
    };
  }

  return {
    url: trimmed,
    type: "generic",
    embedUrl: trimmed,
  };
}

export function PigeonVideoGallery({
  pigeon,
  onPigeonUpdated,
}: PigeonVideoGalleryProps) {
  const [videos, setVideos] = useState<string[]>(pigeon.videos || []);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active playing video for lightbox modal
  const [activeVideo, setActiveVideo] = useState<ParsedVideo | null>(null);

  useEffect(() => {
    setVideos(pigeon.videos || []);
  }, [pigeon.videos]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const url = newVideoUrl.trim();
    if (!url) {
      setError("Please provide a valid video URL.");
      return;
    }

    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("/")
    ) {
      setError("Video link must start with https://, http:// or a local path.");
      return;
    }

    if (videos.includes(url)) {
      setError("This video link is already in the video gallery.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedVideos = [...videos, url];
      const updated = await updatePigeon(pigeon.id, {
        videos: updatedVideos,
      });

      setVideos(updatedVideos);
      setNewVideoUrl("");
      setSuccessMsg("Video added to gallery successfully!");
      if (onPigeonUpdated) onPigeonUpdated(updated);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add video.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveVideo = async (urlToRemove: string) => {
    if (!confirm("Are you sure you want to remove this video from the gallery?")) {
      return;
    }

    try {
      const updatedVideos = videos.filter((v) => v !== urlToRemove);
      const updated = await updatePigeon(pigeon.id, {
        videos: updatedVideos,
      });

      setVideos(updatedVideos);
      if (onPigeonUpdated) onPigeonUpdated(updated);
      setSuccessMsg("Video removed from gallery.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const parsedPreview = newVideoUrl.trim() ? parseVideoUrl(newVideoUrl) : null;

  return (
    <Card className="border-slate-200/80 shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 flex flex-row items-center justify-between py-4 px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Pigeon Video Gallery ({videos.length})
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Loft flight videos, show clips, release training, and eye movements for pigeon {pigeon.id}.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Submit Video URL Form */}
        <form
          onSubmit={handleAddVideo}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/40 via-white to-slate-50 border border-emerald-100 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Add Video Link to Gallery
            </span>
            {successMsg && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full animate-fade-in">
                {successMsg}
              </span>
            )}
            {error && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-fade-in">
                {error}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="Paste Video Link (YouTube, Facebook Video, or MP4 URL)"
                value={newVideoUrl}
                onChange={(e) => {
                  setNewVideoUrl(e.target.value);
                  setError(null);
                }}
                className="bg-white text-xs h-10"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="gap-1.5 shrink-0 h-10 px-4 font-bold text-xs"
            >
              <Plus className="w-4 h-4" /> Add Video Link
            </Button>
          </div>

          {/* Video Preview Badge */}
          {parsedPreview && (
            <div className="flex items-center gap-3 pt-2 border-t border-emerald-100/60 text-xs">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Detected: {parsedPreview.type.toUpperCase()}
              </span>
              <span className="text-slate-500 font-mono text-[11px] truncate max-w-sm">
                {parsedPreview.url}
              </span>
            </div>
          )}
        </form>

        {/* Video Gallery Grid - matching photo gallery style */}
        {videos.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No videos in gallery yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Paste a YouTube or video link above to add live loft flights, homing performance, and showcase videos.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
            role="region"
            aria-label="Pigeon videos grid"
          >
            {videos.map((vidUrl, idx) => {
              const parsed = parseVideoUrl(vidUrl);

              return (
                <div
                  key={idx}
                  tabIndex={0}
                  role="button"
                  aria-label={`Video ${idx + 1} of ${videos.length}. Click to play.`}
                  onClick={() => setActiveVideo(parsed)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveVideo(parsed);
                    }
                  }}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-400 bg-slate-900 shadow-2xs hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all duration-200 aspect-square flex flex-col justify-between cursor-pointer"
                >
                  {/* Video Thumbnail Background */}
                  {parsed.thumbnailUrl ? (
                    <img
                      src={parsed.thumbnailUrl}
                      alt={`Video thumbnail ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center">
                      <Film className="w-12 h-12 text-slate-600" />
                    </div>
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 group-hover:via-black/20 transition-colors" />

                  {/* Top Bar: Format Badge & Delete */}
                  <div className="relative z-10 p-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {parsed.type}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVideo(vidUrl);
                      }}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                      title="Remove video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center Play Button Icon */}
                  <div className="relative z-10 self-center flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="relative z-10 p-2.5 flex items-center justify-between text-white text-[10px] font-mono">
                    <span className="truncate max-w-[120px] text-slate-300">
                      Video #{idx + 1}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      Play <Play className="w-2.5 h-2.5 fill-emerald-400" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Full-Screen / Modal Video Player */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video Player"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video player"
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black flex items-center justify-center">
              {activeVideo.type === "youtube" && activeVideo.embedUrl ? (
                <iframe
                  src={activeVideo.embedUrl}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideo.type === "direct" ? (
                <video
                  src={activeVideo.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : activeVideo.type === "facebook" && activeVideo.embedUrl ? (
                <iframe
                  src={activeVideo.embedUrl}
                  title="Facebook video player"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <Film className="w-12 h-12 mx-auto text-slate-500" />
                  <p className="text-sm font-semibold">
                    Preview link: {activeVideo.url}
                  </p>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Video in New Window
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-400">
              <span className="truncate max-w-md font-mono">{activeVideo.url}</span>
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                External Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
