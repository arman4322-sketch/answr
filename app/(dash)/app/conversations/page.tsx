import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getWorkspace } from "@/lib/workspace";
import NotAvailable from "./NotAvailable";

/* Conversations — route kept, fixtures removed.

   The screen used to render a fixture set of transcripts with an invented
   sample size. None of that can come from the connected answer providers: a
   conversation explorer needs a licensed, consented conversation panel, which
   is a commercial data contract rather than an API key. The fixture module,
   the two-pane explorer, its CSV export and its filters are gone; the route
   still renders so navigation (sidebar + ⌘K) doesn't 404.

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
        <NotAvailable />
      </div>
    </div>
  );
}
