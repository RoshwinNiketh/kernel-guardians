import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({ plugins: [react(), {name:'private-local-dialogue',configureServer(server){for(const [route,folder] of [['/local-music','music'],['/local-voices','dialogue'],['/local-sound','sound']])server.middlewares.use(route,(req,res)=>{const name=(req.url??'').split('?')[0].replace(/^\//,'');const allowed=folder==='music'?name==='intro-theme.mp3':folder==='sound'?/^[a-z-]+\.wav$/.test(name):/^S\d{2}_[A-Z]+_\d{3}\.wav$/.test(name);if(!allowed){res.statusCode=404;res.end();return;}const file=resolve('.local-media',folder,name);if(!existsSync(file)){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',folder==='music'?'audio/mpeg':'audio/wav');res.setHeader('Cache-Control','no-store');createReadStream(file).pipe(res);});}}] });
