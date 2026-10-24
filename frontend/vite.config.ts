import type { IncomingMessage } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { ENV_FILES, loadLocalEnv } from './netlify/lib/localEnv.ts'

/**
 * Dev only: serve the assistant Netlify Function from the Vite dev server, so `npm run dev`
 * works without the Netlify CLI. In production Netlify runs netlify/functions/assistant.mts.
 */
function assistantDevFunction(): Plugin {
  return {
    name: 'assistant-dev-function',
    apply: 'serve',
    configureServer(server) {
      // PORTKEY_API_KEY from the repo's .env, or the .env one folder above the repo.
      const source = loadLocalEnv()
      server.config.logger.info(
        source
          ? `  assistant: PORTKEY_API_KEY loaded from ${source}`
          : `  assistant: no PORTKEY_API_KEY found (looked in ${ENV_FILES.join(' and ')}); the chat box will be off`,
      )
      server.middlewares.use('/.netlify/functions/assistant', async (req: IncomingMessage, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const { default: handler } = await server.ssrLoadModule('/netlify/functions/assistant.mts')
        const response: Response = await handler(
          new Request('http://localhost/.netlify/functions/assistant', {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          }),
          { ip: req.socket.remoteAddress ?? 'local' },
        )
        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assistantDevFunction()],
})
