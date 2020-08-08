import { get } from "./DotNotation"

test(`simple object`, () => {
	const obj = {
		user: {
			age: 21,
			name: {
				last: `Smith`,
				first: `Marc`,
			},
		},
	}
	expect(get(obj, `user.name.first`)).toStrictEqual(obj.user.name.first)
	expect(get(obj, `user.age`)).toStrictEqual(obj.user.age)
	expect(get(obj, `user.name`)).toStrictEqual(obj.user.name)
})

test(`simple object with array`, () => {
	const obj = {
		user: {
			age: 21,
			tags: [0, `two`, null],
			name: {
				last: `Smith`,
				first: `Marc`,
			},
		},
	}
	expect(get(obj, `user.tags.0`)).toStrictEqual(obj.user.tags[0])
	expect(get(obj, `user.tags.1`)).toStrictEqual(obj.user.tags[1])
	expect(get(obj, `user.tags.2`)).toStrictEqual(obj.user.tags[2])
})

test(`array`, () => {
	const map = new Map().set(`randomNumber`, Math.random())
	const obj = [
		`first`,
		{ a: true },
		3,
		null,
		Number.NEGATIVE_INFINITY,
		{
			status: `all good!`,
			date: new Date(),
			map: map,
		},
	]
	obj.forEach((val, i) => expect(get(obj, `${i}`)).toStrictEqual(obj[i]))

	expect(get(obj, `5.status`)).toStrictEqual(`all good!`)
	expect(get(obj, `5.date`)).toBeInstanceOf(Date)
	// @ts-ignore
	expect(get(obj, `5.date`)).toStrictEqual(obj[5].date)
	expect(get(obj, `5.map`)).toBeInstanceOf(Map)
	expect(get(obj, `6`)).toBeUndefined()
	expect(get(obj, `5.nothing`)).toBeUndefined()

	const theMap = get(obj, `5.map`)
	expect(theMap.get(`randomNumber`)).toStrictEqual(map.get(`randomNumber`))
	expect(theMap.get(`randomNumber`)).toStrictEqual(map.get(`randomNumber`))
})
