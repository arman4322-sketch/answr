import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Explorer from "./Explorer";
import { conversationExportRows } from "@/lib/data/conversations";
import "./page.css";

/* Conversation Explorer — converted from canvas frame #conversations.

   Audit topbar normalization: the frame had no date-range or Export, so the
   page uses the standard Topbar; the frame's search box and "Mentions" pill
   moved into a control row at the top of the page body.

   Content pass (F4): the six transcripts are real, researched consumer chats
   about running shoes — every claim comes from a page that was fetched and
   every citation URL resolves. Data lives in lib/data/conversations.ts; the
   two-pane explorer is the client child below. */

export const metadata: Metadata = {
  title: "Conversations",
};

export default function ConversationsPage() {
  return (
    <div className="frame-conversations" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb="Conversations"
        rangeNote="The explorer ships a fixed set of sampled threads from the 30-day window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="Every thread names the platform it came from — the list isn't narrowed by the platform filter."
        exportFilename="nike-conversations-30d.csv"
        exportRows={conversationExportRows()}
        exportWindow="Sampled conversations from the last 30 days (Jul 7 – Aug 5, 2026)"
      />
      <Explorer />
    </div>
  );
}
