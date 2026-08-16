import { AppShell } from "@/components/shell/app-shell";
import { YoutubeCourseManager } from "@/components/youtube-course-manager";

export default function LessonsPage() {
  return (
    <AppShell title="Lessons" subtitle="YouTube course playlists for TET Community traders.">
      <YoutubeCourseManager />
    </AppShell>
  );
}
