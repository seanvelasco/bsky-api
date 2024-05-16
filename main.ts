import { BskyAgent } from "npm:@atproto/api"
import { Hono, type Context } from 'npm:hono'

const service = Deno.env.get("BSKY_SERVICE") || "https://bsky.social"

const identifier = Deno.env.get("BSKY_IDENTIFIER") as string

const password = Deno.env.get("BSKY_PASSWORD") as string

const app = new Hono()

const xrpc = new Hono()

const agent = new BskyAgent({ service })

await agent.login({ identifier, password })

export const getSuggestions = async () => (await agent.api.app.bsky.actor.getSuggestions()).data

export const getSuggestedFollowsByActor = async (actor: string) => (await agent.api.app.bsky.graph.getSuggestedFollowsByActor({ actor })).data

const handleGetSuggestions = async (context: Context) => {
	return context.json(await getSuggestions())
}

const handleGetSuggestedFollowsByActor = async (context: Context) => {
	const query = context.req.query('actor') as string
	return context.json(await getSuggestedFollowsByActor(query))
}

app.get('/getSuggestions', handleGetSuggestions)
app.get('/handleGetSuggestions', handleGetSuggestedFollowsByActor)
xrpc.get('/app.bsky.actor.getSuggestions', handleGetSuggestions)
xrpc.get('/app.bsky.graph.getSuggestedFollowsByActor', handleGetSuggestedFollowsByActor)

app.route('/xrpc', xrpc)

Deno.serve(app.fetch)