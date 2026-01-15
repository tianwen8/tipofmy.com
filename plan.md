TipOfMy.com — Smart Portal (One-page) Dev Spec (Humorous + Pro)
1) 产品目标

TipOfMy.com 是一个 Router + Probe：

Movies（LIVE）：用户输入描述 → 跳转到 FindByVibe.com 的电影搜索/落地页（带 UTM）。

Books/Games/Music（WAITLIST）：不做搜索，只收集邮箱 + 类别 +（可选）用户描述，用于验证需求与做种子用户。

核心原则：TipOfMy 不做 SEO 内容站、不做多页，不分散主站 findbyvibe 的 SEO 权重。

2) 页面结构（单页 / SPA）
Layout

Header：Logo（TipOfMy）+ 小字 tagline + “Powered by FindByVibe”

Hero：

H1 + Subhead

Tabs：Movies / Books / Games / Music（Movies 默认选中）

Dynamic Panel（根据 tab 切换为 Search 或 Waitlist Form）

Footer：简短免责声明 + Privacy + Contact

Tabs 行为

Movies (LIVE)

输入框：plot/scene/anything

Button：Find it

Submit：跳到 findbyvibe（带 UTM）

Books/Games/Music (WAITLIST)

显示幽默文案 + Email（必填）+ Optional “what are you trying to find?”

Submit：调用 Supabase Edge Function 写库

成功态：提示已加入 + 引导回 Movies

3) 文案（直接复制）
Meta

Title：TipOfMy — Find What’s On the Tip of Your Tongue

Description：Describe a movie scene or plot and we’ll help you find it. Movies are live now. Books, games, and music are coming soon — join the waitlist.

Hero

H1：What’s on the tip of your tongue?

Sub：Describe it in plain English. We’ll do the digging.

Tabs labels

Movies: 🎬 Movies + badge LIVE

Books: 📚 Books + badge WAITLIST

Games: 🎮 Games + badge WAITLIST

Music: 🎵 Music + badge WAITLIST

Movies panel

Placeholder：e.g., "A guy relives the same day at a wedding on an island…"

Button：Find it

Helper：Opens results on FindByVibe.

Waitlist witty lines

Books：Our AI is currently speed-reading the entire library of humanity.

Games：Our AI is pressing every button in existence (for science).

Music：Our AI is humming every melody it can remember.

Common line：Leave your email — we’ll notify you the moment it’s ready.

Form fields

Email placeholder：you@domain.com

Optional query placeholder：What are you trying to find? (optional)

Submit：Notify me

Success：You’re on the list. We’ll email you when this is live.

4) Movies 跳转规格（UTM + 校验）
Redirect template

跳转到 findbyvibe 的电影落地页（推荐你主站做一个固定承接页）：

https://findbyvibe.com/find-movie-by-plot?q=<ENCODED_QUERY>&utm_source=tipofmy&utm_medium=referral&utm_campaign=portal


校验规则：

trim + collapse whitespace

< 6 chars 或 < 3 words：前端报错 Add a bit more detail (a few words).

5) 数据库：Supabase 表结构（SQL）

在 Supabase 创建表：waitlist_signups

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  category text not null check (category in ('books','games','music')),
  query text,
  source text not null default 'tipofmy',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups(created_at desc);

create index if not exists waitlist_signups_category_idx
  on public.waitlist_signups(category);

-- Optional: prevent duplicates per category
create unique index if not exists waitlist_unique_email_category
  on public.waitlist_signups (lower(email), category);

6) 后端：Supabase Edge Function（推荐）

选择 Supabase 的原因：Free 计划可用（$0/月，含 DB 500MB），Edge Functions 也有免费调用配额，超出才计费。

Function name

waitlist

Request

POST https://<project-ref>.supabase.co/functions/v1/waitlist

JSON body：

{
  "email": "user@example.com",
  "category": "books|games|music",
  "query": "optional text",
  "utm": { "source":"tipofmy", "medium":"referral", "campaign":"portal" }
}

Edge Function (TypeScript) 示例
// supabase/functions/waitlist/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidEmail(email: string) {
  if (!email) return false;
  if (email.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email, category, query, utm } = await req.json();

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["books", "games", "music"].includes(category)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanedQuery =
      typeof query === "string" ? query.trim().slice(0, 500) : null;

    // Insert (idempotent by unique index if you enabled it)
    const { error } = await supabase.from("waitlist_signups").insert({
      email: String(email).trim().toLowerCase(),
      category,
      query: cleanedQuery,
      source: "tipofmy",
      utm_source: utm?.source ?? null,
      utm_medium: utm?.medium ?? null,
      utm_campaign: utm?.campaign ?? null,
    });

    if (error) {
      // If duplicate, treat as ok (optional)
      if (String(error.code) === "23505") {
        return new Response(JSON.stringify({ ok: true, deduped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: false, error: "db_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

Supabase 配置步骤（给编程 AI）

创建 Supabase Project（Free）。

SQL Editor 执行上面的建表 SQL。

创建 Edge Function waitlist，设置环境变量：

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY（只在函数里用，前端不要暴露）

部署函数。

在前端用 fetch() 调用函数 URL。

7) 前端实现（框架无关，最小 JS）

你可以用任何静态框架（Astro/Next/React/Vue/纯 HTML）。关键是这几个函数：

State

activeTab: 'movies'|'books'|'games'|'music'

movieQuery: string

email: string

optionalQuery: string

status: 'idle'|'submitting'|'success'|'error'

Waitlist submit
async function submitWaitlist({ email, category, query }) {
  const res = await fetch("https://<project-ref>.supabase.co/functions/v1/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      category,
      query,
      utm: { source: "tipofmy", medium: "referral", campaign: "portal" }
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || "submit_failed");
  return data;
}

Movies redirect
function redirectToFindByVibe(query) {
  const q = query.trim().replace(/\s+/g, " ");
  const words = q.split(" ").filter(Boolean);
  if (q.length < 6 || words.length < 3) throw new Error("too_short");

  const url = new URL("https://findbyvibe.com/find-movie-by-plot");
  url.searchParams.set("q", q);
  url.searchParams.set("utm_source", "tipofmy");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "portal");
  window.location.href = url.toString();
}

8) 最小埋点（不装 GA 也行）

事件（可选）：

tab_view：tab 切换时发一次（用于判断 Books/Games/Music 热度）

movie_redirect：Movies submit 成功发一次

waitlist_submit：waitlist 成功发一次

如果你想也进 Supabase：再建一张 events 表，或者先不做，先看 waitlist 数就够了。

9) 部署建议（不使用 Pages）

TipOfMy 是纯静态单页，你可以任选：

Vercel / Netlify

GitHub Pages

任意对象存储 + CDN

部署要点：

HTTPS

绑定 tipofmy.com

配好 og.png（分享图）

10) QA Checklist

 Movies 输入 > 3 words 时正常跳转，UTM 带上

 Books/Games/Music 提交邮箱成功，重复提交不会报错（dedupe）

 移动端 UI 正常、输入法不挡按钮

 <title>/meta/OG 正常，粘贴到 X/Discord 有预览

 Lighthouse：Performance/SEO 基本达标（不用极限）