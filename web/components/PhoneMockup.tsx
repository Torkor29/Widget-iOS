import Image from "next/image";
import { MoodSticker } from "./Mood";

/** A CSS iPhone showing the Morni medium widget on a home screen. */
export function PhoneMockup({ partner, you, app }: { partner: string; you: string; app: string }) {
  const icons = ["#8FD3FF", "#FFD66B", "#7ED49B", "#FF9AAE", "#C9B6FF", "#FFB38A", "#9AA8FF", "#FFE08A"];
  return (
    <div className="relative mx-auto h-[590px] w-[290px] rounded-[52px] bg-plum p-3 shadow-[0_40px_80px_-30px_rgba(43,16,51,0.55)]">
      <div className="bg-sunrise relative h-full w-full overflow-hidden rounded-[42px]">
        <div className="absolute left-1/2 top-3 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="flex justify-between px-7 pt-4 text-[13px] font-semibold text-white">
          <span>8:43</span>
          <span aria-hidden>●●● ▮</span>
        </div>

        <div className="mx-4 mt-8 flex h-[156px] gap-1.5 rounded-[26px] bg-white/30 p-1.5 backdrop-blur">
          <WidgetTile name={partner} time="8:42" mood="sunny" photo="/photos/morning.jpg" />
          <WidgetTile name={you} time="8:43" mood="coffee" photo="/photos/coffee.jpg" />
        </div>
        <p className="mt-1.5 text-center text-[11px] font-medium text-white/90">{app}</p>

        <div className="mx-6 mt-5 grid grid-cols-4 gap-x-4 gap-y-5">
          {icons.map((color, i) => (
            <div key={i} className="aspect-square rounded-[14px] shadow-sm" style={{ background: color }} />
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-3 grid grid-cols-4 gap-4 rounded-[30px] bg-white/25 p-3 backdrop-blur">
          {["#7ED49B", "#8FD3FF", "#FFFFFF", "#FFD66B"].map((color, i) => (
            <div key={i} className="aspect-square rounded-[14px]" style={{ background: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetTile({ name, time, mood, photo }: { name: string; time: string; mood: string; photo: string }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-[20px] bg-white/40">
      <Image src={photo} alt="" fill sizes="130px" className="object-cover" priority />
      <MoodSticker id={mood} size={34} className="absolute right-1 top-1 rotate-6" />
      <span className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white">
        {name} <span className="font-medium opacity-80">{time}</span>
      </span>
    </div>
  );
}
