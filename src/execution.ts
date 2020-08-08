import cloneDeep from "lodash.clonedeep"
import isArray from "lodash.isarray"
import isBoolean from "lodash.isboolean"
import isNull from "lodash.isnull"
import isNumber from "lodash.isnumber"
import isPlainObject from "lodash.isplainobject"
import isString from "lodash.isstring"
import isUndefined from "lodash.isundefined"
import { isMatch } from "picomatch"
import { IExecution, MapFunctions, PlainObject } from "./model"

export class Execution<T> implements IExecution<T> {
	private value: T
	constructor(
		private input: T,
		private mappers: MapFunctions = {},
		private shortcircuits: string[] = [],
		private logger: (...args: any[]) => void
	) {
		this.value = cloneDeep(input)
	}

	public async execute(): Promise<T> {
		return await this.parse(this.value, undefined)
	}

	public async parse(value: any, path?: string): Promise<any> {
		const newPath = path && cloneDeep(path)

		if (this.shouldShortCicuitPath(newPath)) {
			// this.logger(`🚫 SHORT-CIRCUITING PATH: ${newPath}`)
			return value
		}

		// this.logger(`${newPath}(before)`, value)
		if (isPlainObject(value)) {
			value = await this.applySpecificParsing(this.parseObject, value as T, newPath)
		} else if (isString(value)) {
			value = await this.applySpecificParsing(this.parseString, value, newPath)
		} else if (isArray(value)) {
			value = await this.applySpecificParsing(this.parseArray, value, newPath)
		} else if (isNumber(value)) {
			value = await this.applySpecificParsing(this.parseNumber, value, newPath)
		} else if (isBoolean(value)) {
			value = await this.applySpecificParsing(this.parseBoolean, value, newPath)
		} else if (isNull(value)) {
			value = await this.applySpecificParsing(this.parseNull, value, newPath)
		} else if (isUndefined(value)) {
			value = await this.applySpecificParsing(this.parseUndefined, value, newPath)
		}

		// this.logger(`${newPath}(after)`, value)
		return value
	}

	private async applySpecificParsing<D>(
		fn: (data: D, path?: string) => Promise<D>,
		value: D,
		path?: string
	): Promise<D> {
		return await fn.call(this, value, path)
	}

	private async parseString(value: string, path = `$`): Promise<string> {
		return this.mappers.string ? this.mappers.string(value, path) : value
	}

	private async parseNumber(value: number, path = `$`): Promise<number> {
		return this.mappers.number ? this.mappers.number(value, path) : value
	}

	private async parseBoolean(value: boolean, path = `$`): Promise<boolean> {
		return this.mappers.boolean ? this.mappers.boolean(value, path) : value
	}

	private async parseNull(value: null, path = `$`): Promise<null> {
		return this.mappers.null ? this.mappers.null(value, path) : value
	}

	private async parseUndefined(value: undefined, path = `$`): Promise<undefined> {
		return value
	}

	private async parseObject(value: PlainObject, path = `$`): Promise<PlainObject> {
		if (this.mappers.plainObject) value = this.mappers.plainObject(value, path)

		for (const k in value) {
			if (value.hasOwnProperty(k)) {
				const v = value[k]
				const itemPath = `${path}.${k}`
				value[k] = await this.parse(v, itemPath)
			}
		}
		return value
	}

	private async parseArray(value: any[], path = `$`): Promise<any[]> {
		if (this.mappers.array) value = await this.mappers.array(value, path)
		return await Promise.all(
			value.map((v, i) => {
				const k = i
				const itemPath = `${path}[${k}]`
				return this.parse(v, itemPath)
			})
		)
	}

	private shouldShortCicuitPath(path = ``): boolean {
		const should = isMatch(path, this.shortcircuits, {
			nobracket: true,
		})
		return should
	}
}
