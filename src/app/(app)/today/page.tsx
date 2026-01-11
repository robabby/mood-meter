import { EntryComposer } from "@/components/entry";

export default function TodayPage() {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <EntryComposer className="w-full" />
    </main>
  );
}
