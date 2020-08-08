import faker from "faker"
import { Mapper } from "./"

const complexData = {
	undef: undefined,
	nil: null,
	"[2]": {
		"[0]": faker.random.word(),
	},
	name: faker.name.firstName(),
	company: faker.company.bsBuzz(),
	age: faker.random.number({ min: 18, max: 68 }),
	verified: faker.random.boolean(),
	tags: [
		`tag-a`,
		`tag-b`,
		{
			tagId: `tag-c`,
			active: false,
			meta: [
				{
					key: `ok`,
					secondKey: `LOL`,
					alright: [
						[`tupleKey1`, `tupleValue1`],
						[`tupleKey2`, `tupleValue2`],
						[`tupleKey3`, [`tupleValue3a`, `tupleValue3b`]],
					],
				},
			],
		},
	],
	dateObj: new Date(),
	mapObj: new Map().set(`k`, `v`),
}

const simplerData = {
	ok: [{ a: `Hey!` }, { b: 666 }],
	undef: undefined,
	nil: null,
	"[2]": {
		"[0]": faker.random.word(),
	},
	name: faker.name.firstName(),
	company: faker.company.bsBuzz(),
	age: faker.random.number({ min: 18, max: 68 }),
	verified: faker.random.boolean(),
	tags: [`tag-a`, `tag-b`, { tagId: `tag-c`, active: false }],
	dateObj: new Date(),
	mapObj: new Map().set(`k`, `v`).set(`a`, `b`),
}

const mapper = new Mapper({
	string: async (val: string, path: string) => val.toUpperCase() + ` 👍`,
	number: async (val: number, path: string) => val * -1,
})

test(`simple`, async () => {
	const mappedData = await mapper.parse({ key: `value` })
	expect(mappedData.key).toStrictEqual(`VALUE 👍`)
})
