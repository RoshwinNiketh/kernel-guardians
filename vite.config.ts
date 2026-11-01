import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({ plugins: [react(), {name:'private-local-dialogue',configureServer(server){server.middlewares.use('/local-voices',(req,res)=>{const name=(req.url??'').split('?')[0].replace(/^\//,'');if(!/^S\d{2}_[A-Z]+_\d{3}\.wav$/.test(name)){res.statusCode=404;res.end();return;}const file=resolve('.local-media/dialogue',name);if(!existsSync(file)){res.statusCode=404;res.end();return;}res.setHeader('Content-Type','audio/wav');res.setHeader('Cache-Control','no-store');createReadStream(file).pipe(res);});}}] });
