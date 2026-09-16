import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getWorkspace } from "@/lib/workspace";
import ConversationsPreview from "./Preview";

/* Conversations — route kept, fixtures removed, replaced by a locked preview.

   The screen used to render a fixture set of transcripts with an invented
   sample size. None of that can come from the connected answer providers: a
   conversation explorer needs a licensed, consented conversation panel, which
   is a commercial data contract rather than an API key.

   What renders now is <LockedPreview>: the layout this capability would fill —
   a conversation list with a volume column and a multi-turn thread — drawn at
   28% opacity, desaturated, inert and aria-hidden, under a permanent
   "illustrative — not measured data" badge, with the overlay explaining exactly
   where the data would come from and what it would cost. Every value inside the
   preview is a neutral placeholder and lives ONLY inside that wrapper.

   The only live value on the page is the workspace brand in the crumb — read
   from lib/workspace, the same source lib/live/metrics reads, so the header
   never shows a brand this deployment isn't tracking. */

export const metadata: Metadata = {
  title: "Conversations",
};

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? "Your brand";
  const source = capabilitySource("conversations");

  return (
    <div className="frame-conversations" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb="Conversations"
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"16px"}}>
        {source && (
          <LockedPreview source={source}>
            <ConversationsPreview />
          </LockedPreview>
        )}
      </div>
    </div>
  );
}
