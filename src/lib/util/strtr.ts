export function strtr(str: string, dic: Record<string, string>) {
	Object.entries(dic).map(value => {
		str = str.split(value[0]).join(value[1]);
	});
	return str;
}
