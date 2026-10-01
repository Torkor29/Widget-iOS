import Image from "next/image";

export function MoodSticker({ id, size = 64, className = "", alt = "" }: { id: string; size?: number; className?: string; alt?: string }) {
  return <Image src={`/moods/${id}.svg`} width={size} height={size} alt={alt} className={className} unoptimized />;
}
