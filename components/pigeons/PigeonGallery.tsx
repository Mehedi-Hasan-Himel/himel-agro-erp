"use client";

import React, { useState, useEffect } from "react";
import { Pigeon } from "@/types/pigeon";
import { updatePigeon } from "@/lib/repositories/pigeonRepository";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface PigeonGalleryProps {
  pigeon: Pigeon;
  onPigeonUpdated?: (updated: Pigeon) => void;
}

export function PigeonGallery({ pigeon, onPigeonUpdated }: PigeonGalleryProps) {
  // Combine pigeon.photos and pigeon.photoUrl into a clean unique list
  const existingPhotos: string[] = Array.from(
    new Set([
      ...(pigeon.photos || []),
      ...(pigeon.photoUrl ? [pigeon.photoUrl] : []),
    ].filter(Boolean))
  );

  const [photos, setPhotos] = useState<string[]>(existingPhotos);

  useEffect(() => {
    const list = Array.from(
      new Set([
        ...(pigeon.photos || []),
        ...(pigeon.photoUrl ? [pigeon.photoUrl] : []),
      ].filter(Boolean))
    );
    setPhotos(list);
  }, [pigeon.photos, pigeon.photoUrl]);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };
  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  // Keyboard navigation for Lightbox (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevLightbox();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, photos.length]);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const url = newImageUrl.trim();
    if (!url) {
      setError("Please provide a valid image URL.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      setError("Image URL must start with http:// or https:// (or a local /path).");
      return;
    }

    if (photos.includes(url)) {
      setError("This image is already added in the gallery.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPhotos = [...photos, url];
      const primaryPhoto = pigeon.photoUrl || url;

      const updated = await updatePigeon(pigeon.id, {
        photos: updatedPhotos,
        photoUrl: primaryPhoto,
      });

      setPhotos(updatedPhotos);
      setNewImageUrl("");
      setSuccessMsg("Image added to gallery successfully!");
      if (onPigeonUpdated) onPigeonUpdated(updated);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add image.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPrimary = async (url: string) => {
    try {
      const updated = await updatePigeon(pigeon.id, {
        photoUrl: url,
      });
      if (onPigeonUpdated) onPigeonUpdated(updated);
      setSuccessMsg("Primary profile photo updated!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleRemovePhoto = async (urlToRemove: string) => {
    if (!confirm("Are you sure you want to remove this photo from the gallery?")) {
      return;
    }

    try {
      const updatedPhotos = photos.filter((p) => p !== urlToRemove);
      let newPrimary = pigeon.photoUrl;
      if (pigeon.photoUrl === urlToRemove) {
        newPrimary = updatedPhotos.length > 0 ? updatedPhotos[0] : "";
      }

      const updated = await updatePigeon(pigeon.id, {
        photos: updatedPhotos,
        photoUrl: newPrimary,
      });

      setPhotos(updatedPhotos);
      if (onPigeonUpdated) onPigeonUpdated(updated);
      setSuccessMsg("Photo removed from gallery.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 flex flex-row items-center justify-between py-4 px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Pigeon Photo Gallery ({photos.length})
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              High-resolution loft photos, eye signs, wing pattern, and plumage documentation.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Submit Image URL Form */}
        <form
          onSubmit={handleAddImage}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/40 via-white to-slate-50 border border-emerald-100 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Add Image to Gallery
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
                placeholder="Paste Image URL (e.g. https://images.unsplash.com/... or Imgur link)"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
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
              <Plus className="w-4 h-4" /> Add Image
            </Button>
          </div>

          {/* Live Preview of typed URL */}
          {newImageUrl && (
            <div className="flex items-center gap-3 pt-2 border-t border-emerald-100/60">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                <img
                  src={newImageUrl}
                  alt="New Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block">Preview Ready:</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs block">
                  {newImageUrl}
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Gallery Grid */}
        {photos.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No photos in gallery yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Paste an image link above to add loft photos, close-up eye sign pictures, or wing spread documentation for pigeon {pigeon.id}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" role="region" aria-label="Pigeon photos grid">
            {photos.map((photo, idx) => {
              const isPrimary = pigeon.photoUrl === photo;

              return (
                <div
                  key={idx}
                  tabIndex={0}
                  role="button"
                  aria-label={`Photo ${idx + 1} of ${photos.length}. Click or press Enter to enlarge.`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(idx);
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border bg-white shadow-2xs hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all duration-200 aspect-square flex flex-col justify-between cursor-pointer ${
                    isPrimary
                      ? "ring-2 ring-emerald-500 border-emerald-400"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {/* Photo Image */}
                  <img
                    src={photo}
                    alt={`Pigeon ${pigeon.id} photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => openLightbox(idx)}
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = "0.4";
                    }}
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-white" /> Primary
                      </span>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity p-2.5 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-end gap-1 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(idx);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-emerald-700 shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                        title="View Full Size"
                        aria-label="View full size photo"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="Remove from Gallery"
                        aria-label="Remove photo from gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pointer-events-auto">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(photo);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 text-[10px] font-bold shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                          title="Set as Main Profile Picture"
                          aria-label="Set as primary portrait"
                        >
                          <Star className="w-3 h-3" /> Make Primary
                        </button>
                      )}
                      <span className="text-[10px] text-white/80 font-mono ml-auto">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Lightbox Modal with Keyboard Accessibility */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery full screen viewer"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close photo viewer (Escape)"
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden max-h-[80vh] border border-white/20 shadow-2xl bg-black">
              <img
                src={photos[lightboxIndex]}
                alt={`Full size pigeon photo ${lightboxIndex + 1} of ${photos.length}`}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center justify-between w-full max-w-md mt-4 text-white text-xs">
              <button
                type="button"
                onClick={prevLightbox}
                aria-label="Previous photo (Left Arrow)"
                className="p-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <ChevronLeft className="w-4 h-4" /> Prev <kbd className="hidden sm:inline bg-black/40 px-1 py-0.5 rounded text-[10px] text-slate-300 font-mono">←</kbd>
              </button>

              <div className="flex flex-col items-center">
                <span className="font-mono text-slate-200 font-bold">
                  {lightboxIndex + 1} / {photos.length}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Press <kbd className="bg-black/40 px-1 rounded text-slate-300 font-mono">Esc</kbd> to close
                </span>
              </div>

              <button
                type="button"
                onClick={nextLightbox}
                aria-label="Next photo (Right Arrow)"
                className="p-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Next <kbd className="hidden sm:inline bg-black/40 px-1 py-0.5 rounded text-[10px] text-slate-300 font-mono">→</kbd> <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
