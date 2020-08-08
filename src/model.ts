export type PlainObject = { [key in string | number]: any }
export type SingleInput = PlainObject | string | number | boolean | null | undefined
export type CompositeInput = Array<SingleInput>

export const noop = (): void => {
	return
}

export interface IMapper {
	parse(value: SingleInput): Promise<SingleInput>
	parse(value: CompositeInput): Promise<CompositeInput>
	parse<T>(value: T): Promise<T>
}
export interface IExecution<T> {
	parse(value: SingleInput): Promise<SingleInput>
	parse(value: CompositeInput): Promise<CompositeInput>
	parse<T>(value: T): Promise<T>
}

export interface MapFunctions {
	string?: (value: string, path: string) => Promise<string>
	number?: (value: number, path: string) => Promise<number>
	boolean?: (value: boolean, path: string) => Promise<boolean>
	null?: (value: null, path: string) => Promise<null>
	plainObject?: (value: PlainObject, path: string) => Promise<PlainObject>
	array?: <T>(value: T[], path: string) => Promise<T[]>
}
