import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDictionary } from "@/dictionaries";
import { invitePreview } from "@/lib/supabase";
import { hasLocale } from "@/lib/site";

export const alt = "Morni invite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function sticker(id: string) {
  const data = await readFile(join(process.cwd(), "public", "moods", `${id}.png`));
  return `data:image/png;base64,${data.toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ lang: string; code: string }> }) {
  const { lang, code } = await params;
  const dict = getDictionary(hasLocale(lang) ? lang : "en");
  const name = await invitePreview(code.toUpperCase().slice(0, 6));
  // No emoji here: rendering them would fetch images from a CDN at request time.
  const title = name ? dict.invite.ogNamed.replace("{name}", name) : dict.invite.ogAnon;
  const [inlove, sunny] = await Promise.all([sticker("inlove"), sticker("sunny")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #FFB38A 0%, #FF6B81 55%, #B9A6FF 100%)",
          color: "white",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", marginBottom: 28 }}>
          <img src={inlove} width={170} height={170} alt="" style={{ transform: "rotate(-8deg)" }} />
          <img src={sunny} width={180} height={180} alt="" style={{ marginLeft: -30, transform: "rotate(8deg)" }} />
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 34, marginTop: 24, opacity: 0.92, fontStyle: "italic" }}>Morni</div>
      </div>
    ),
    size,
  );
}
