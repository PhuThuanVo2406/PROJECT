import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="stack-lg">
      <div className="stack-sm">
        <span className="skeleton title" style={{ width: 300, maxWidth: "80%" }} />
        <span className="skeleton line" style={{ width: 380, maxWidth: "90%" }} />
      </div>
      <span className="skeleton" style={{ height: 120, borderRadius: 14 }} />
      <CardGridSkeleton />
    </div>
  );
}
