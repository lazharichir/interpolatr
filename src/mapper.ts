import { Execution } from "./execution"
import { IMapper, MapFunctions } from "./model"

export class Mapper implements IMapper {
	constructor(private mappers: MapFunctions = {}, private shortcircuits: string[] = []) {}
	async parse<T>(value: T): Promise<T> {
		const execution = new Execution(value, this.mappers, this.shortcircuits, console.log)
		return await execution.execute()
	}
}
