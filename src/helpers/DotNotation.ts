const isPlainObject = (value: unknown): value is any => {
	const type = typeof value
	return value !== null && type === `object`
}

const disallowedKeys = [`__proto__`, `prototype`, `constructor`]

const isValidPath = (pathSegments: string[]): boolean =>
	!pathSegments.some((segment) => disallowedKeys.includes(segment))

function getPathSegments(path: string): string[] {
	const pathArray = path.split(`.`)
	const parts = []

	for (let i = 0; i < pathArray.length; i++) {
		let p = pathArray[i]

		while (p[p.length - 1] === `\\` && pathArray[i + 1] !== undefined) {
			p = p.slice(0, -1) + `.`
			p += pathArray[++i]
		}

		parts.push(p)
	}

	if (!isValidPath(parts)) {
		return []
	}

	return parts
}

export const get = <O = any>(object: unknown, path: string, value?: O): O | undefined => {
	if (!isPlainObject(object) || typeof path !== `string`) {
		return value === undefined ? object : value
	}

	const pathArray = getPathSegments(path)
	if (pathArray.length === 0) {
		return
	}

	for (let i = 0; i < pathArray.length; i++) {
		if (!Object.prototype.propertyIsEnumerable.call(object, pathArray[i])) {
			return value
		}

		object = object[pathArray[i]]

		if (object === undefined || object === null) {
			// `object` is either `undefined` or `null` so we want to stop the loop, and
			// if this is not the last bit of the path, and
			// if it did't return `undefined`
			// it would return `null` if `object` is `null`
			// but we want `get({foo: null}, 'foo.bar')` to equal `undefined`, or the supplied value, not `null`
			if (i !== pathArray.length - 1) {
				return value
			}

			break
		}
	}

	return object
}

export const set = <O = any>(object: unknown, path: string, value: O): O | undefined => {
	if (!isPlainObject(object) || typeof path !== `string`) {
		return object
	}

	const root = object
	const pathArray = getPathSegments(path)

	for (let i = 0; i < pathArray.length; i++) {
		const p = pathArray[i]

		if (!isPlainObject(object[p])) {
			object[p] = {}
		}

		if (i === pathArray.length - 1) {
			object[p] = value
		}

		object = object[p]
	}

	return root
}

export const remove = (object: unknown, path: string): void => {
	if (!isPlainObject(object) || typeof path !== `string`) {
		return
	}

	const pathArray = getPathSegments(path)

	for (let i = 0; i < pathArray.length; i++) {
		const p = pathArray[i]

		if (i === pathArray.length - 1) {
			delete object[p]
			return
		}

		object = object[p]

		if (!isPlainObject(object)) {
			return
		}
	}
}

export const has = (object: unknown, path: string): boolean => {
	if (!isPlainObject(object) || typeof path !== `string`) {
		return false
	}

	const pathArray = getPathSegments(path)
	if (pathArray.length === 0) {
		return false
	}

	for (let i = 0; i < pathArray.length; i++) {
		if (isPlainObject(object)) {
			if (!(pathArray[i] in object)) {
				return false
			}

			object = object[pathArray[i]]
		} else {
			return false
		}
	}

	return true
}
