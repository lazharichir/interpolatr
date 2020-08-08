# Interpolatr

A string interpolator for deep, nested, complex structures. Pass any object and **Interpolatr** iteratess through every single property at any depth, including arrays. When a string value matches a `Pattern`, it is passed on to a `Resovler` that provides the replacement value.

Here is an example:

```ts
// Let's type the context object, if there's any
type Context = {
	name: string
}

/**
 * Create the handlers
 * `pattern` – the RegEx that will be used to test the string for our placeholder
 * `cleaner` – placeholders contain delimiters that we want to remove (e.g. `{{` and `}}`)
 * `resover` – returns the value to replace the placeholder with
 */
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

// Initialize the Interpolation, pass it the context data and the handlers
const interpolator = new Interpolation({ name: `John Dough` }, handlers)

// Interpolate the object
const result = await interpolator.interpolate({
	name: `{{$.ctx.name}}`,
	validUntil: `Around {{$.fns.now()}} :-)`,
})
```

The above gives `result.name` to equal `John Dough`.

## What for?

**Interpolatr** is useful when you have strings with placeholders (e.g. `{{name}}`). Such strings can be found in a very simple string, or as the value of a deeply nested object or array.

The library must be employed using `async/await` or `Promises`. This is useful when you need to perform asynchronous calls to perform an interpolation.
