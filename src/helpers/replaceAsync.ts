export type ReplacerFn = (substring: string, ...args: any[]) => Promise<string>

export async function replaceAsync(
	string: string,
	searchValue: string | RegExp,
	replacer: ReplacerFn | string
): Promise<string> {
	try {
		if (
			string === undefined ||
			string === null ||
			(typeof string === `object` && typeof (string as any).toString !== `function`) ||
			Array.isArray(string)
		)
			throw new Error(`Input string is malformed.`)
		else string = String(string)

		if (typeof replacer === `string`) return string.replace(searchValue, replacer)

		// 1. Run fake pass of `replace`, collect values from `replacer` calls
		const values: Promise<string | undefined>[] = []
		string.replace(searchValue, (substring: string, ...args: any[]) => {
			values.push(replacer ? replacer(substring, ...args) : Promise.resolve(substring))
			return substring
		})

		// 2. Resolve them with `Promise.all`
		const resolvedValues = await Promise.all(values)

		// 3. Run `replace` with resolved values
		return string.replace(searchValue, (sub) => resolvedValues.shift() || sub)
	} catch (error) {
		throw error
	}
}
