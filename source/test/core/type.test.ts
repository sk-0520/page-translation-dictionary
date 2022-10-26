import * as type from '../../scripts/core/type';

describe('type', () => {
	test('hasPrimaryProperty', () => {
		expect(type.hasPrimaryProperty({}, 'a', 'number')).toBe(false);
		expect(type.hasPrimaryProperty({ a: undefined }, 'a', 'number')).toBe(false);
		expect(type.hasPrimaryProperty({ a: null }, 'a', 'number')).toBe(false);
		expect(type.hasPrimaryProperty({ a: 1 }, 'a', 'number')).toBe(true);
		expect(type.hasPrimaryProperty({ A: 1 }, 'a', 'number')).toBe(false);
		expect(type.hasPrimaryProperty({ a: '1' }, 'a', 'number')).toBe(false);
	});

	test('toBoolean', () => {
		expect(type.toBoolean(null)).toBe(false);
		expect(type.toBoolean(undefined)).toBe(false);
		expect(type.toBoolean("")).toBe(false);
		expect(type.toBoolean("t")).toBe(false);
		expect(type.toBoolean("f")).toBe(false);
		expect(type.toBoolean("false")).toBe(false);
		expect(type.toBoolean("FALSE")).toBe(false);
		expect(type.toBoolean("true")).toBe(true);
		expect(type.toBoolean("TRUE")).toBe(true);
	});

	test('toString', () => {
		expect(type.toString(null)).toBe('null');

		expect(type.toString(undefined)).toBe('undefined');

		expect(type.toString(false)).toBe('false');
		expect(type.toString(true)).toBe('true');

		expect(type.toString(1)).toBe('1');
	});
});