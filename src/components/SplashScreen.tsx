import { CoverImage } from "@/components/cover/CoverImage";
import { type Cover } from "@/data/covers";

type Props = {
  cover: Cover;
  plannerName: string;
  ownerName?: string;
};

export function SplashScreen({ cover, plannerName, ownerName }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
      style={{ background: "var(--gradient-paper)" }}
    >
      <div className="absolute inset-0 opacity-90">
        <CoverImage
          cover={cover}
          plannerName={plannerName}
          ownerName={ownerName}
          className="w-full h-full"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      <div className="relative text-center px-6">
        <h1
          className="font-display text-5xl font-semibold drop-shadow-lg"
          style={{ color: cover.palette.mode === "dark" ? "#fff" : "#fff" }}
        >
          {plannerName}
        </h1>
      </div>
    </div>
  );
}
