/**
 * /api/wiki/graph
 *
 * Scans the /wiki directory, parses all .md files,
 * extracts [[wikilinks]], and returns a D3-ready graph:
 *   { nodes: [...], edges: [...], stats: {...}, recentFiles: [...] }
 *
 * Called by the KnowledgeGraph component every 5 seconds for live updates.
 */

import fs from 'fs';
import path from 'path';

const WIKI_ROOT = process.env.WIKI_PATH
  ? path.resolve(process.env.WIKI_PATH)
  : path.resolve(process.cwd(), 'wiki');

// ── Node type from path ───────────────────────────────────────────────────────
function nodeType(relPath) {
  if (relPath.startsWith('clients/'))  return 'client';
  if (relPath.startsWith('concepts/')) return 'concept';
  if (relPath.startsWith('market/'))   return 'market';
  if (relPath.startsWith('patterns/')) return 'pattern';
  if (relPath.startsWith('_meta/'))    return 'meta';
  return 'index';
}

// ── Parse frontmatter ─────────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) {
      fm[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  return fm;
}

// ── Extract [[wikilinks]] from markdown content ───────────────────────────────
function extractWikilinks(content) {
  const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];
  return matches.map(m => m[1].trim());
}

// ── Slugify a wikilink target to match filenames ──────────────────────────────
function wikilinkToSlug(link) {
  return link.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Recursively walk wiki dir ─────────────────────────────────────────────────
function walkDir(dir, baseDir = dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, baseDir, files);
    } else if (entry.name.endsWith('.md')) {
      files.push({
        fullPath: full,
        relPath: path.relative(baseDir, full).replace(/\\/g, '/'),
      });
    }
  }
  return files;
}

export async function GET() {
  try {
    if (!fs.existsSync(WIKI_ROOT)) {
      return Response.json({
        nodes: [], edges: [], stats: { total: 0, clients: 0, concepts: 0, market: 0, patterns: 0 },
        recentFiles: [], wikiRoot: WIKI_ROOT, empty: true,
      });
    }

    const files = walkDir(WIKI_ROOT);
    const nodes = [];
    const edgeSet = new Set();
    const edges = [];

    // Build slug → relPath map for link resolution
    const slugToPath = {};
    files.forEach(({ relPath }) => {
      const slug = wikilinkToSlug(path.basename(relPath, '.md'));
      slugToPath[slug] = relPath;
      // Also map full path segments
      const parts = relPath.split('/');
      parts.forEach(p => {
        const s = wikilinkToSlug(p.replace('.md', ''));
        if (!slugToPath[s]) slugToPath[s] = relPath;
      });
    });

    // Build nodes
    for (const { fullPath, relPath } of files) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fm = parseFrontmatter(content);
        const stat = fs.statSync(fullPath);
        const type = nodeType(relPath);
        const id = relPath;
        const label = fm.title || path.basename(relPath, '.md').replace(/-/g, ' ');

        // Word count for node sizing
        const wordCount = content.split(/\s+/).length;

        nodes.push({
          id,
          label,
          type,
          relPath,
          tags: fm.tags ? fm.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim()) : [],
          client: fm.client || null,
          source: fm.source || null,
          updated: fm.updated || stat.mtime.toISOString().split('T')[0],
          mtime: stat.mtimeMs,
          wordCount,
          size: Math.max(6, Math.min(20, Math.sqrt(wordCount) * 1.5)),
          // Preview: first 200 chars after frontmatter
          preview: content.replace(/^---[\s\S]*?---\n?/, '').slice(0, 200).trim(),
        });

        // Extract wikilinks → edges
        const links = extractWikilinks(content);
        for (const link of links) {
          const targetSlug = wikilinkToSlug(link);
          const targetPath = slugToPath[targetSlug];
          if (targetPath && targetPath !== relPath) {
            const edgeKey = [relPath, targetPath].sort().join('|||');
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({ source: relPath, target: targetPath, label: link });
            }
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Stats
    const stats = {
      total: nodes.length,
      clients:  nodes.filter(n => n.type === 'client').length,
      concepts: nodes.filter(n => n.type === 'concept').length,
      market:   nodes.filter(n => n.type === 'market').length,
      patterns: nodes.filter(n => n.type === 'pattern').length,
    };

    // Recent files (last 10 by mtime)
    const recentFiles = [...nodes]
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 10)
      .map(n => ({ id: n.id, label: n.label, type: n.type, updated: n.updated }));

    return Response.json({ nodes, edges, stats, recentFiles, wikiRoot: WIKI_ROOT, empty: false });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}