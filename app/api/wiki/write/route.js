import fs from 'fs';
import path from 'path';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const WIKI_ROOT = process.env.WIKI_PATH
  ? path.resolve(process.env.WIKI_PATH)
  : path.resolve(process.cwd(), 'wiki');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function readWikiFile(relPath) {
  const full = path.join(WIKI_ROOT, relPath);
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8');
  return null;
}

function writeWikiFile(relPath, content) {
  const full = path.join(WIKI_ROOT, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

async function claudeCall(system, prompt, maxTokens = 3000) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Claude API error ${res.status}: ${err?.error?.message || 'unknown'}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

const EXTRACTION_SYSTEM = `You are a knowledge extraction agent. Given a knowledge event, extract structured knowledge and return ONLY valid JSON — no markdown, no backticks, no explanation. Just raw JSON.

Return this exact schema:
{
  "clientName": "string or null",
  "clientSlug": "kebab-case or null",
  "clientFiles": [
    {
      "relPath": "clients/{clientSlug}/{filename}.md",
      "title": "string",
      "content": "full markdown with frontmatter and [[wikilinks]]"
    }
  ],
  "conceptFiles": [
    { "relPath": "concepts/{slug}.md", "title": "string", "content": "markdown" }
  ],
  "marketFiles": [
    { "relPath": "market/{slug}.md", "title": "string", "content": "markdown" }
  ],
  "patternFiles": [
    { "relPath": "patterns/{slug}.md", "title": "string", "content": "markdown" }
  ]
}

Rules:
- Every file must start with YAML frontmatter: --- title: "..." tags: [...] updated: "YYYY-MM-DD" source: "eventType" ---
- Use [[wikilinks]] generously for cross-linking
- Be specific — extract real names, numbers, locations
- clientFiles: client-specific facts only
- conceptFiles: reusable DC concepts (Tier-3, Greenfield, JV, etc.)
- marketFiles: geography, market data, trends
- patternFiles: only if a clear reusable pattern emerges
- Keep each file 200-400 words
- Always return valid JSON — this is critical`;

const MERGE_SYSTEM = `You are a knowledge merge agent. Merge new content into an existing wiki file.

Rules:
- Preserve accurate existing content
- Update changed facts
- Add new information
- Flag contradictions with: > ⚠️ Conflicting data — needs review
- Update frontmatter updated date to today
- Append to ## Changelog section at bottom
- Preserve all [[wikilinks]], add new ones
- Output ONLY the final merged markdown — no explanation`;

async function extractKnowledge(eventType, content, metadata) {
  const prompt = `Extract wiki knowledge from this ${eventType} event.

Metadata: ${JSON.stringify(metadata)}

Content (first 4000 chars):
${content.slice(0, 4000)}`;

  const raw = await claudeCall(EXTRACTION_SYSTEM, prompt, 4000);
  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/gi, '').trim();
  // Find JSON object in response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in extraction response');
  return JSON.parse(jsonMatch[0]);
}

async function mergeIntoExisting(existingContent, newContent, title) {
  const prompt = `Merge this new information into the existing wiki file titled "${title}".

EXISTING:
${existingContent.slice(0, 2000)}

NEW CONTENT:
${newContent.slice(0, 1500)}

Output the final merged markdown file only.`;

  return claudeCall(MERGE_SYSTEM, prompt, 2000);
}

async function processFile(fileSpec) {
  const existing = readWikiFile(fileSpec.relPath);
  let finalContent;
  if (existing) {
    finalContent = await mergeIntoExisting(existing, fileSpec.content, fileSpec.title);
  } else {
    finalContent = fileSpec.content;
  }
  writeWikiFile(fileSpec.relPath, finalContent);
  return { relPath: fileSpec.relPath, action: existing ? 'merged' : 'created' };
}

function updateIndex(writtenFiles) {
  const now = new Date().toISOString().split('T')[0];
  const indexPath = '_index.md';
  let existing = readWikiFile(indexPath) || `---
title: "K-Nexus Wiki — Master Index"
tags: [index, meta]
updated: "${now}"
---

# K-Nexus Knowledge Wiki

Auto-maintained by K-Nexus AI. Never edit manually.

## Recent Updates

`;
  const newEntries = writtenFiles.map(f => `- ${now}: [[${f.relPath.replace('.md', '')}]] (${f.action})`).join('\n');
  const lines = existing.split('\n');
  const recentIdx = lines.findIndex(l => l.includes('## Recent Updates'));
  if (recentIdx !== -1) {
    const before = lines.slice(0, recentIdx + 2).join('\n');
    const existingEntries = lines.slice(recentIdx + 2).filter(l => l.trim());
    const allEntries = [...newEntries.split('\n'), ...existingEntries].slice(0, 50);
    existing = before + '\n' + allEntries.join('\n') + '\n';
  }
  writeWikiFile(indexPath, existing);
}

function updateMeta(eventType, filesWritten) {
  const now = new Date().toISOString();
  const metaPath = '_meta/last-updated.md';
  const existing = readWikiFile(metaPath) || `---\ntitle: "Wiki Update Log"\ntags: [meta]\n---\n\n# Wiki Update Log\n\n`;
  const entry = `## ${now}\n- Event: ${eventType}\n- Files: ${filesWritten.map(f => f.relPath).join(', ')}\n\n`;
  writeWikiFile(metaPath, existing + entry);
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { eventType, content, metadata = {} } = body;
  if (!eventType || !content) {
    return Response.json({ error: 'eventType and content are required' }, { status: 400 });
  }

  try {
    ensureDir(WIKI_ROOT);
    ['clients','concepts','market','patterns','_meta'].forEach(d =>
      ensureDir(path.join(WIKI_ROOT, d))
    );

    const extracted = await extractKnowledge(eventType, content, metadata);

    const allFiles = [
      ...(extracted.clientFiles || []),
      ...(extracted.conceptFiles || []),
      ...(extracted.marketFiles || []),
      ...(extracted.patternFiles || []),
    ];

    if (allFiles.length === 0) {
      return Response.json({ success: true, filesWritten: [], message: 'No files extracted' });
    }

    const results = await Promise.all(allFiles.map(processFile));
    updateIndex(results);
    updateMeta(eventType, results);

    return Response.json({
      success: true,
      filesWritten: results,
      clientName: extracted.clientName,
      wikiRoot: WIKI_ROOT,
    });

  } catch (err) {
    console.error('[Wiki Write Error]', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
}