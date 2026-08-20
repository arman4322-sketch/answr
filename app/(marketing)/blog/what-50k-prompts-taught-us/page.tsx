import Link from "next/link";
import type { Metadata } from "next";
import "./page.css";

export const metadata: Metadata = { title: "Do comparison pages still win AI answers?" };

/* Blog article — converted from canvas frame #blog-article. */
export default function BlogArticlePage() {
  return (
    <div className="frame-blog-article">
      <div style={{padding:"64px 48px 40px",maxWidth:"760px",margin:"0 auto"}}>
        <div style={{fontSize:"11.5px",color:"var(--fnt)"}}>
          <Link href="/blog" style={{color:"var(--fnt)"}} className="hv9">{"Blog"}</Link>{" "}<span style={{color:"#3a3b40"}}>{"/"}</span>{" "}<span style={{color:"var(--ac)"}}>{"Research"}</span>
        </div>
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em",lineHeight:"1.16",marginTop:"16px",textWrap:"balance"}}>{"Do comparison pages still win AI answers?"}</div>
        <div style={{fontSize:"16px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"We sampled 50,000 buying-intent prompts across five platforms. Comparison pages are cited 3.2× more often than feature pages — but the gap narrowed every month this year."}</div>
        <div style={{display:"flex",alignItems:"center",gap:"11px",marginTop:"22px",paddingBottom:"24px",borderBottom:"1px solid var(--brd)"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"500",color:"var(--ac)"}}>{"RK"}</div>
          <div>
            <div style={{fontSize:"12.5px",fontWeight:"600"}}>{"Rui Kimura"}</div>
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"Head of Research"}</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Jul 28, 2026 · 9 min read"}</div>
        </div>
      </div>
      <div style={{padding:"0 48px 64px",maxWidth:"760px",margin:"0 auto"}}>
        <div style={{fontSize:"14.5px",color:"var(--mut)",lineHeight:"1.8"}}>{"Every answer engine has a revealed preference for certain page shapes. When a buyer asks \"Nike vs Adidas\" — or even \"best running shoes\" — the model reaches for pages that already did the comparative work. The question is whether that advantage is structural or a temporary artifact of what the web happens to contain."}</div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",marginTop:"28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"13px",fontWeight:"600"}}>{"Citation rate by page type"}</span>
            <span style={{fontSize:"10px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"50K PROMPTS · JUL 2026"}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"16px"}}>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                <span style={{fontWeight:"500"}}>{"Comparison pages"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"38%"}</span>
              </div>
              <div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
                <div style={{width:"38%",height:"5px",background:"var(--ac)",borderRadius:"3px"}} />
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                <span>{"Reviews & roundups"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"31%"}</span>
              </div>
              <div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
                <div style={{width:"31%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".75"}} />
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                <span>{"Documentation"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"14%"}</span>
              </div>
              <div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
                <div style={{width:"14%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".55"}} />
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                <span>{"Feature pages"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"12%"}</span>
              </div>
              <div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
                <div style={{width:"12%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".45"}} />
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                <span>{"Pricing pages"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"5%"}</span>
              </div>
              <div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
                <div style={{width:"5%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".35"}} />
              </div>
            </div>
          </div>
          <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"12px"}}>{"Share of buying-intent answers citing at least one page of each type. Types are not exclusive."}</div>
        </div>
        <div style={{fontSize:"14.5px",color:"var(--mut)",lineHeight:"1.8",marginTop:"28px"}}>{"Comparison pages hold the lead on every platform we sample. But the interesting number is the trend: in January the multiple was 4.6×; by July it was 3.2×. As models get better at synthesizing comparisons themselves from primary sources, the premium on pre-built comparisons is eroding — slowly, and unevenly by category."}</div>
        <div style={{display:"flex",gap:"20px",alignItems:"center",background:"var(--bg1)",border:"1px solid color-mix(in oklab,var(--ac) 30%,var(--brd))",borderRadius:"12px",padding:"22px 26px",marginTop:"28px"}}>
          <span style={{fontSize:"40px",fontWeight:"600",letterSpacing:"-0.03em",color:"var(--ac)",fontVariantNumeric:"tabular-nums",flex:"none"}}>{"3.2×"}</span>
          <span style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6"}}>{"more citations for comparison pages than feature pages — down from 4.6× in January. The gap is closing at roughly 0.2× per month."}</span>
        </div>
        <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.015em",marginTop:"36px"}}>{"What changed in 2026"}</div>
        <div style={{fontSize:"14.5px",color:"var(--mut)",lineHeight:"1.8",marginTop:"12px"}}>{"Two things. First, platforms now cite primary documentation more when it is crawlable — the docs line in our chart doubled since ClaudeBot and GPTBot access became table stakes. Second, community threads increasingly beat thin comparison content: a detailed practitioner answer outranks a template \"X vs Y\" page on four of five platforms."}</div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px 24px",marginTop:"28px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",color:"var(--ac)"}}>{"KEY TAKEAWAYS"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"9px",marginTop:"12px",fontSize:"13px",color:"var(--mut)"}}>
            <div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}</span>{"Ship comparison pages for prompts you're losing — they still convert citations fastest."}</div>
            <div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}</span>{"Unblock crawlers from docs before writing anything new; it's the cheapest citation win."}</div>
            <div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}</span>{"Watch the multiple in your own category — Answr tracks page-type mix per prompt set."}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginTop:"32px",paddingTop:"24px",borderTop:"1px solid var(--brd)"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"500",color:"var(--ac)"}}>{"RK"}</div>
          <div style={{flex:"1"}}>
            <div style={{fontSize:"13px",fontWeight:"600"}}>{"Rui Kimura"}</div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.5"}}>{"Runs the Answr research program: 12M sampled answers a month, methodology on the "}<Link href="/security">{"security & methodology page"}</Link>{"."}</div>
          </div>
          <Link href="/demo" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px"}} className="hv10">{"Track your category"}<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}</span>
          </Link>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginTop:"32px"}}>
          <Link href="/blog" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"18px 20px",color:"var(--tx)",display:"block"}} className="hv11">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"NEXT IN RESEARCH"}</div>
            <div style={{fontSize:"14px",fontWeight:"600",marginTop:"6px",lineHeight:"1.4"}}>{"Reddit's grip on AI answers, measured"}</div>
          </Link>
          <Link href="/resources/answr-index" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"18px 20px",color:"var(--tx)",display:"block"}} className="hv12">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"DATA"}</div>
            <div style={{fontSize:"14px",fontWeight:"600",marginTop:"6px",lineHeight:"1.4"}}>{"The Answr Index — the 500 domains AI cites most"}</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
