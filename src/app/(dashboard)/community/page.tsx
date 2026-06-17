import { CommunityFeed } from "@/components/community/community-feed";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Community
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with other artists, share updates, and celebrate releases.
        </p>
      </div>

      <CommunityFeed />
    </div>
  );
}
