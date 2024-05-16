import { BskyAgent } from "npm:@atproto/api"
import { Hono, type Context } from 'npm:hono'
import { cors } from 'npm:hono/cors'

const service = Deno.env.get("BSKY_SERVICE") || "https://bsky.social"

const identifier = Deno.env.get("BSKY_IDENTIFIER") as string

const password = Deno.env.get("BSKY_PASSWORD") as string

const app = new Hono()

const xrpc = new Hono()

const agent = new BskyAgent({ service })

await agent.login({ identifier, password })

const getSuggestions = async () => (await agent.api.app.bsky.actor.getSuggestions()).data

const getSuggestedFollowsByActor = async (actor: string) => (await agent.api.app.bsky.graph.getSuggestedFollowsByActor({ actor })).data

const handleGetSuggestions = async (context: Context) => {
	return context.json(await getSuggestions())
}

const handleGetSuggestedFollowsByActor = async (context: Context) => {
	const query = context.req.query('actor') as string
	return context.json(await getSuggestedFollowsByActor(query))
}

app.get('/getSuggestions', handleGetSuggestions)
app.get('/getSuggestedFollowsByActor', handleGetSuggestedFollowsByActor)
xrpc.get('/app.bsky.actor.getSuggestions', handleGetSuggestions)
xrpc.get('/app.bsky.graph.getSuggestedFollowsByActor', handleGetSuggestedFollowsByActor)

app.route('/xrpc', xrpc)

app.use('*', cors({ origin: '*' }))

Deno.serve(app.fetch)