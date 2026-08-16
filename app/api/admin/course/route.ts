import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminSession } from "@/lib/admin-auth";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Admin storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Admin login is required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getAdminClient();

    if (body.type === "playlist") {
      const title = cleanText(body.title);
      const category = cleanText(body.category) || "Course playlist";
      const youtubeUrl = cleanText(body.youtubeUrl);
      const playlistId = cleanText(body.playlistId);
      const firstVideoId = cleanText(body.firstVideoId) || null;
      const playlistOrder = Number(body.playlistOrder) || 1;

      if (!title || !youtubeUrl || !playlistId) {
        return NextResponse.json({ error: "Playlist title, URL, and playlist ID are required." }, { status: 400 });
      }

      const response = await supabase.from("admin_course_playlists").upsert({
        title,
        category,
        youtube_url: youtubeUrl,
        playlist_id: playlistId,
        first_video_id: firstVideoId,
        playlist_order: playlistOrder,
      }, { onConflict: "playlist_id" }).select("id").single();

      if (response.error) throw response.error;
      return NextResponse.json({ ok: true, id: response.data.id });
    }

    if (body.type === "video") {
      const playlistId = cleanText(body.playlistId);
      const videoId = cleanText(body.videoId);
      const title = cleanText(body.title);
      const module = cleanText(body.module) || "Course video";
      const duration = cleanText(body.duration) || "0:00";
      const videoOrder = Number(body.videoOrder) || 1;

      if (!playlistId || !videoId || !title) {
        return NextResponse.json({ error: "Playlist ID, video ID, and title are required." }, { status: 400 });
      }

      const response = await supabase.from("admin_course_videos").upsert({
        playlist_id: playlistId,
        video_id: videoId,
        title,
        module,
        duration,
        video_order: videoOrder,
      }, { onConflict: "playlist_id,video_id" }).select("id").single();

      if (response.error) throw response.error;
      return NextResponse.json({ ok: true, id: response.data.id });
    }

    return NextResponse.json({ error: "Unknown course item type." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Course item could not be saved." },
      { status: 500 },
    );
  }
}
