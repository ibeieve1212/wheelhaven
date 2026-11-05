import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.zip':'application/zip' };
const port = Number(process.env.WHEELHAVEN_PORT || 4317);
const server = http.createServer(async (request, response) => {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root) || relative.split('/').some(part => part.startsWith('.'))) throw new Error('notFound');
    if (!(await stat(filename)).isFile()) throw new Error('notFound');
    const content = await readFile(filename);
    response.writeHead(200, { 'Content-Type':mime[path.extname(filename)] || 'application/octet-stream', 'Content-Length':content.length, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); response.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Wheelhaven local preview: http://127.0.0.1:${port}/`));

