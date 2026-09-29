// Ücretsiz, anahtarsız kaynaklardan haberleri çekip news.json'a yazar.
import { writeFile } from "node:fs/promises";

const get = async (url) => {
  const r = await fetch(url, { headers: { "User-Agent": "yazilim-gundem", Accept: "application/json" } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
};

const sources = {
  async "Hacker News"() {
    const ids = (await get("https://hacker-news.firebaseio.com/v0/topstories.json")).slice(0, 30);
    const items = await Promise.all(ids.map((id) => get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
    return items.filter((i) => i && i.url).map((i) => ({
      title: i.title, url: i.url, score: i.score, date: new Date(i.time * 1000).toISOString(),
      note: `${i.descendants ?? 0} yorum`, discuss: `https://news.ycombinator.com/item?id=${i.id}`,
    }));
  },
  async "DEV.to"() {
    const a = await get("https://dev.to/api/articles?top=7&per_page=30");
    return a.map((i) => ({
      title: i.title, url: i.url, score: i.public_reactions_count, date: i.published_at,
      note: i.tag_list.slice(0, 3).join(", "), summary: i.description,
    }));
  },
  async "Lobsters"() {
    const a = await get("https://lobste.rs/hottest.json");
    return a.slice(0, 25).filter((i) => i.url).map((i) => ({
      title: i.title, url: i.url, score: i.score, date: i.created_at,
      note: i.tags.join(", "), discuss: i.comments_url,
    }));
  },
  async "GitHub"() {
    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const r = await get(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=25`);
    return r.items.map((i) => ({
      title: i.full_name, url: i.html_url, score: i.stargazers_count, date: i.created_at,
      note: i.language || "", summary: i.description,
    }));
  },
  async "Hugging Face"() {
    const a = await get("https://huggingface.co/api/daily_papers");
    return a.slice(0, 20).map((i) => ({
      title: i.paper.title, url: `https://huggingface.co/papers/${i.paper.id}`, score: i.paper.upvotes,
      date: i.paper.publishedAt, summary: (i.paper.summary || "").slice(0, 280),
    }));
  },
};

const out = { updated: new Date().toISOString(), sources: {} };
for (const [name, fn] of Object.entries(sources)) {
  try { out.sources[name] = await fn(); console.log(name, out.sources[name].length); }
  catch (e) { console.error(name, "hata:", e.message); out.sources[name] = []; }
}
await writeFile("news.json", JSON.stringify(out, null, 1));
