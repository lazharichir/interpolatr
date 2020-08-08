import { replaceAsync } from "./helpers/replaceAsync"
import { Mapper } from "./mapper"
import { CompositeInput, IMapper, PlainObject, SingleInput } from "./model"

export type Pattern = RegExp

export type CleanerFn<O, I> = (data: O) => I

export type ResolverFn<C extends PlainObject, O = string, I = string> = (
	placeholder: I,
	ctx: C
) => Promise<O>

export type Handler<C extends PlainObject, O = string, I = string> = {
	id?: string
	pattern: Pattern
	cleaner?: CleanerFn<O, I>
	resolver: ResolverFn<C, O, I>
}

export type Handlers<C extends PlainObject, O = string, I = string> = Array<Handler<C, O, I>>

export class Interpolation<C extends PlainObject> {
	constructor(private context: C, private handlers: Handlers<C> = [], private mapper?: IMapper) {
		this.mapper =
			mapper ||
			new Mapper({
				string: this.interpolateString.bind(this),
			})
	}

	public async interpolateString(value: string, path: string): Promise<string> {
		let latestValue = value

		for (const handler of this.handlers) {
			latestValue = await replaceAsync(latestValue, handler.pattern, async (placeholder) => {
				return await handler.resolver(
					handler.cleaner ? handler.cleaner(placeholder) : placeholder,
					this.context
				)
			})
		}

		return latestValue
	}

	public async interpolate<T extends SingleInput>(value: T): Promise<T>
	public async interpolate<T extends CompositeInput>(value: T[]): Promise<T[]>
	public async interpolate(value: any): Promise<any> {
		return this.mapper ? await this.mapper.parse(value) : value
	}
}
