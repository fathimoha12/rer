import { AppShell } from "@/components/shell/app-shell";
import { JournalWorkspace } from "@/components/journal-workspace";

export default function JournalPage() {
  return (
    <AppShell title="Trade Journal" subtitle="Capture execution details, psychology, mistakes, and setup context.">
      <JournalWorkspace />
    </AppShell>
  );
}
