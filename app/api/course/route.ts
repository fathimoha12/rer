import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CoursePlaylist, CourseVideo } from "@/lib/course-data";

type AdminPlaylistRow = {
  id: string;
  title: string;
  category: string;
  youtube_url: string;
  playlist_id: string;
  first_video_id: string | null;
  playlist_order: number;
};

type AdminVideoRow = {
  id: string;
  playlist_id: string;
  title: string;
  module: string;
  duration: string;
  video_order: number;
  video_id: string;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    if (!supabase) return NextResponse.json({ playlists: [], videos: [] });

    const [playlistResponse, videoResponse] = await Promise.all([
      supabase.from("admin_course_playlists").select("*").order("playlist_order", { ascending: true }),
      supabase.from("admin_course_videos").select("*").order("video_order", { ascending: true }),
    ]);

    if (playlistResponse.error || videoResponse.error) {
      return NextResponse.json({ playlists: [], videos: [] });
    }

    const playlists = ((playlistResponse.data ?? []) as AdminPlaylistRow[]).map<CoursePlaylist>((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      youtube_url: row.youtube_url,
      playlist_id: row.playlist_id,
      first_video_id: row.first_video_id,
      playlist_order: row.playlist_order,
    }));

    const videos = ((videoResponse.data ?? []) as AdminVideoRow[]).map<CourseVideo>((row) => ({
      id: row.id,
      playlistId: row.playlist_id,
      title: row.title,
      module: row.module,
      duration: row.duration,
      order: row.video_order,
      videoId: row.video_id,
    }));

    return NextResponse.json({ playlists, videos });
  } catch {
    return NextResponse.json({ playlists: [], videos: [] });
  }
}
