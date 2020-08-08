import { get } from "./helpers/DotNotation"
import { Handlers, Interpolation } from "./interpolation"

type Context = {
	name: string
}

const handlers: Handlers<Context, string, string> = [
	// Matches pattern {{$.ctx.path.to.field.containing.the.data}}
	{
		id: `Context Replacer`,
		pattern: /{{(\$\.ctx\.[\s\S]+?)}}/g,
		cleaner: (placeholder: string) => placeholder.slice(2, -2),
		resolver: async (placeholder: string, context) => {
			if (placeholder.startsWith(`$.ctx.`)) {
				const value = get(context, placeholder.replace(`$.ctx.`, ``))
				return String(value)
			}
			return placeholder
		},
	},
	// Matches pattern {{$.fns.NAME_OF_FUNCTIN()}}
	{
		id: `Fns Replacers`,
		pattern: /{{(\$\.fns\.[\s\S]+?)}}/g,
		cleaner: (placeholder) => placeholder.slice(8, -2),
		resolver: async (placeholder, context) => {
			switch (placeholder) {
				case `now()`:
					return new Date().toISOString()
			}
			return placeholder
		},
	},
]

test(`string interpolator`, async () => {
	const interpolator = new Interpolation({ name: `Lazhar` }, handlers)
	const result = await interpolator.interpolateString(
		`hello {{$.ctx.name}}, it's {{$.fns.now()}}`,
		`$.key`
	)
	expect(result.startsWith(`hello Lazhar`)).toStrictEqual(true)
})

test(`object interpolator`, async () => {
	const interpolator = new Interpolation({ name: `Lazhar` }, handlers)
	const result = await interpolator.interpolate({
		name: `{{$.ctx.name}}`,
		validUntil: `Around {{$.fns.now()}} :-)`,
	})
	expect(result.name).toStrictEqual(`Lazhar`)
})

test(`array interpolator`, async () => {
	const interpolator = new Interpolation({ name: `Lazhar` }, handlers)
	const result = await interpolator.interpolate([
		`{{$.ctx.name}}`,
		`{{$.ctx.name}}`,
		`Nothing!`,
		`{{$.ctx.name}}`,
	])
	expect(result).toStrictEqual([`Lazhar`, `Lazhar`, `Nothing!`, `Lazhar`])
})
