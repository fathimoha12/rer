"use client";

import * as React from "react";
import { ListVideo, Loader2, PlayCircle, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultCoursePlaylists, defaultCourseVideos, type CoursePlaylist, type CourseVideo } from "@/lib/course-data";
import { cn } from "@/lib/utils";

type CourseResponse = {
  playlists?: CoursePlaylist[];
  videos?: CourseVideo[];
};

function playlistThumbnail(playlist: CoursePlaylist) {
  if (playlist.first_video_id) return `https://img.youtube.com/vi/${playlist.first_video_id}/mqdefault.jpg`;
  return "";
}

function mergeById<T extends { id: string }>(builtIns: T[], extras: T[]) {
  const merged = new Map<string, T>();
  for (const item of builtIns) merged.set(item.id, item);
  for (const item of extras) merged.set(item.id, item);
  return Array.from(merged.values());
}

export function YoutubeCourseManager() {
  const [extraPlaylists, setExtraPlaylists] = React.useState<CoursePlaylist[]>([]);
  const [extraVideos, setExtraVideos] = React.useState<CourseVideo[]>([]);
  const [activeId, setActiveId] = React.useState(defaultCoursePlaylists[0].id);
  const [activeVideoId, setActiveVideoId] = React.useState(defaultCourseVideos[0].videoId);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAdminCourse() {
      setLoading(true);
      try {
        const response = await fetch("/api/course", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as CourseResponse;
        setExtraPlaylists(data.playlists ?? []);
        setExtraVideos(data.videos ?? []);
      } catch {
        setExtraPlaylists([]);
        setExtraVideos([]);
      } finally {
        setLoading(false);
      }
    }

    void loadAdminCourse();
  }, []);

  const playlists = React.useMemo(
    () => mergeById(defaultCoursePlaylists, extraPlaylists).sort((a, b) => a.playlist_order - b.playlist_order),
    [extraPlaylists],
  );
  const videos = React.useMemo(() => mergeById(defaultCourseVideos, extraVideos), [extraVideos]);
  const activePlaylist = playlists.find((playlist) => playlist.id === activeId) ?? playlists[0];
  const activeCourseVideos = videos.filter((video) => video.playlistId === activePlaylist.playlist_id).sort((a, b) => a.order - b.order);
  const activeCourseVideo = activeCourseVideos.find((video) => video.videoId === activeVideoId) ?? activeCourseVideos[0];

  function selectPlaylist(playlist: CoursePlaylist) {
    setActiveId(playlist.id);
    const firstVideo = videos.filter((video) => video.playlistId === playlist.playlist_id).sort((a, b) => a.order - b.order)[0];
    setActiveVideoId(firstVideo?.videoId ?? playlist.first_video_id ?? "");
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="glass-panel overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge variant="negative" className="mb-3 gap-1">
                <Video className="size-3.5" />
                TET YouTube courses
              </Badge>
              <CardTitle>Course player</CardTitle>
              <CardDescription>Choose a playlist and watch the lessons in order.</CardDescription>
            </div>
            <Badge variant="outline">{playlists.length} playlists</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="overflow-hidden rounded-lg border bg-black shadow-2xl">
            <iframe
              className="aspect-video w-full"
              src={
                activeCourseVideo
                  ? `https://www.youtube.com/embed/${activeCourseVideo.videoId}?list=${activePlaylist.playlist_id}&index=${activeCourseVideo.order}`
                  : `https://www.youtube.com/embed/videoseries?list=${activePlaylist.playlist_id}`
              }
              title={activeCourseVideo?.title ?? activePlaylist.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="rounded-lg border bg-background/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{activePlaylist.category}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{activeCourseVideo?.title ?? activePlaylist.title}</h3>
                {activeCourseVideo ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lesson {activeCourseVideo.order} of {activeCourseVideos.length} - {activeCourseVideo.module} - {activeCourseVideo.duration}
                  </p>
                ) : null}
              </div>
              <Button type="button" variant="outline" asChild>
                <a href={`https://www.youtube.com/playlist?list=${activePlaylist.playlist_id}`} target="_blank" rel="noreferrer">
                  Open on YouTube
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListVideo className="size-5 text-primary" />
              {activePlaylist.title} videos
            </CardTitle>
            <CardDescription>
              {loading ? "Loading admin course updates..." : `${activeCourseVideos.length} videos ayaa u kala socda sida playlist-ka YouTube u kala dhigtay.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {activeCourseVideos.length ? (
              activeCourseVideos.map((video) => {
                const isActiveVideo = activeCourseVideo?.videoId === video.videoId;
                return (
                  <button
                    key={video.id}
                    type="button"
                    className={cn(
                      "grid gap-3 rounded-md border bg-background/45 p-3 text-left transition hover:border-primary/50 sm:grid-cols-[88px_1fr]",
                      isActiveVideo && "border-primary/60 bg-primary/10",
                    )}
                    onClick={() => setActiveVideoId(video.videoId)}
                  >
                    <span className="relative overflow-hidden rounded-md bg-black">
                      <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="aspect-video w-full object-cover sm:size-[88px] sm:aspect-square" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                        <PlayCircle className="size-7" />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1 flex items-center gap-2">
                        <Badge variant="outline">#{video.order}</Badge>
                        <span className="truncate text-xs text-muted-foreground">{video.module}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{video.duration}</span>
                      </span>
                      <span className="block font-medium leading-5">{video.title}</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex items-center gap-2 rounded-md border bg-background/50 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading course videos...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListVideo className="size-5 text-primary" />
              Course playlists
            </CardTitle>
            <CardDescription>Admin kaliya ayaa playlists iyo videos cusub ku dari kara.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {playlists.map((playlist) => {
              const isActive = activePlaylist.id === playlist.id;
              const thumbnail = playlistThumbnail(playlist);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  className={cn(
                    "grid gap-3 rounded-md border bg-background/45 p-3 text-left transition hover:border-primary/50 sm:grid-cols-[86px_1fr]",
                    isActive && "border-primary/50 bg-primary/10",
                  )}
                  onClick={() => selectPlaylist(playlist)}
                >
                  <span className="relative overflow-hidden rounded-md bg-black">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="aspect-video w-full object-cover sm:size-[86px] sm:aspect-square" />
                    ) : (
                      <span className="flex aspect-video w-full items-center justify-center text-white sm:size-[86px]">
                        <Video className="size-8" />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                      <PlayCircle className="size-7" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 flex items-center gap-2">
                      <Badge variant="outline">#{playlist.playlist_order}</Badge>
                      <span className="truncate text-xs text-muted-foreground">{playlist.category}</span>
                    </span>
                    <span className="block truncate font-medium">{playlist.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{playlist.playlist_id}</span>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
