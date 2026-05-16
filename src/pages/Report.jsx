import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createIssue } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Play, CheckCircle } from "lucide-react";
// Load map dynamically
const MapView = lazy(() => import("@/components/map/MapView"));

// ============================================================
// ReportPage — Submit a new civic issue
// All data saved to localStorage — no backend needed
// ============================================================
export default function ReportPage() {
  const navigate = useNavigate();
  const router = { push: navigate, replace: (url) => navigate(url, { replace: true }), back: () => navigate(-1) };
  const { user } = useAuth();

  // Only citizens can report issues
  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role === "admin") router.replace("/admin");
  }, [user, router]);

  // ── Form state ──
  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState("");
  const [priority, setPriority]     = useState("");
  const [location, setLocation]     = useState("");
  const [description, setDescription] = useState("");

  // ── Map pin state ──
  const [picked, setPicked]   = useState(null);   // { lat, lng, address? }
  const [geoPin, setGeoPin]   = useState(undefined); // [lat, lng] from "Use My Location"

  // ── Image upload state ──
  const [images, setImages]         = useState([]); // base64 previews
  const [imageDataUrls, setImageDataUrls] = useState([]); // base64 data URLs for saving
  const fileInputRef = useRef(null);

  // ── Voice recording state ──
  const [recording, setRecording]   = useState(false);
  const [audioUrl, setAudioUrl]     = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // ── Form submission state ──
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  // ──────────────────────────────────────────────────────────
  // Location: center the map on the user's GPS position
  // ──────────────────────────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoPin([lat, lng]);
        setPicked({ lat, lng });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // ──────────────────────────────────────────────────────────
  // Images: convert each uploaded file to base64 for storage
  // ──────────────────────────────────────────────────────────
  const handleFiles = async (files) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => /image\/(jpeg|png|webp)/i.test(f.type));

    const dataUrls = await Promise.all(
      accepted.map(
        (file) =>
          new Promise((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.readAsDataURL(file);
          })
      )
    );

    setImages((prev) => [...prev, ...dataUrls]);
    setImageDataUrls((prev) => [...prev, ...dataUrls]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageDataUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // ──────────────────────────────────────────────────────────
  // Voice recording
  // ──────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
      setRecording(false);
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    chunksRef.current = [];
  };

  // ──────────────────────────────────────────────────────────
  // Form Submit — saves to localStorage
  // ──────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim())    { setError("Please enter a title."); return; }
    if (!location.trim()) { setError("Please enter a location."); return; }

    setSubmitting(true);

    try {
      await createIssue({
        title:          title.trim(),
        description:    description.trim(),
        location:       location.trim(),
        lat:            picked?.lat ?? null,
        lng:            picked?.lng ?? null,
        imageDataUrls,
        audioUrl,
        userId:         user?.id,
      });

      setSuccess(true);

      // Reset form after a short delay, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // Show success screen after submission
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold">Issue Reported!</h2>
        <p className="text-muted-foreground">Your report has been saved. Redirecting to dashboard...</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main form — 2/3 width on large screens */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
            <CardDescription>Provide details and drop a pin on the map to help authorities locate the problem.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">

                {/* ── MAP ── */}
                <div className="sm:col-span-2">
                  <Label>Pick Location on Map</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
                        📍 Use My Location
                      </Button>
                      {picked && (
                        <span className="text-xs text-muted-foreground">
                          Selected: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                          {picked.address ? ` — ${picked.address}` : ""}
                        </span>
                      )}
                    </div>
                    <Suspense fallback={<div className="h-[350px] md:h-[450px] w-full flex items-center justify-center border rounded-md bg-muted/50">Loading Map...</div>}>
                      <MapView
                        allowDropPin
                        enableReverseGeocode
                        onPick={(d) => {
                          setPicked(d);
                          if (d.address && !location) setLocation(d.address);
                        }}
                        selectedPin={geoPin}
                        heightClassName="h-[350px] md:h-[450px]"
                      />
                    </Suspense>
                  </div>
                </div>

                {/* ── TITLE ── */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pothole on Main Road"
                    required
                  />
                </div>

                {/* ── CATEGORY ── */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {["Road", "Lighting", "Sanitation", "Water", "Parks", "Electricity", "Other"].map((c) => (
                          <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* ── PRIORITY ── */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Priority Level</SelectLabel>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🔴 High</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* ── LOCATION TEXT ── */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location">Location / Address *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near Railway Station, MG Road"
                    required
                  />
                </div>

                {/* ── DESCRIPTION ── */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                  />
                </div>

                {/* ── PHOTO UPLOAD ── */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Photos (optional)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    {images.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Upload photos as evidence</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Choose Photos
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {images.map((src, idx) => (
                            <div key={idx} className="relative">
                              <img src={src} alt={`upload-${idx}`} className="h-20 w-20 rounded object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-xs"
                              >×</button>
                            </div>
                          ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Add More
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── VOICE NOTE ── */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Voice Note (optional)</Label>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {recording ? "🔴 Recording..." : audioUrl ? "✅ Audio recorded" : "Record a voice note for extra context"}
                      </p>
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {!recording && !audioUrl && (
                            <motion.button
                              type="button"
                              onClick={startRecording}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              aria-label="Start recording"
                            >
                              <Mic className="h-5 w-5" />
                            </motion.button>
                          )}
                          {recording && (
                            <motion.button
                              type="button"
                              onClick={stopRecording}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              aria-label="Stop recording"
                            >
                              <Square className="h-5 w-5" />
                            </motion.button>
                          )}
                          {!recording && audioUrl && (
                            <button
                              type="button"
                              onClick={resetRecording}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                              aria-label="Re-record"
                            >
                              <RotateCcw className="h-5 w-5" />
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {audioUrl && !recording && (
                      <audio src={audioUrl} controls className="mt-3 w-full" />
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Tips for a Good Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>✅ Drop a pin on the exact location on the map</p>
              <p>✅ Upload a clear photo of the issue</p>
              <p>✅ Write a clear, specific title</p>
              <p>✅ Describe how it affects people</p>
              <p>🚨 For emergencies, call local authorities directly</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
