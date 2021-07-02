export function strtr(str: string, dic: Record<string, string>) {
	Object.entries(dic).forEach(value => {
		str = str.split(value[0]).join(value[1]);
	});
	return str;
}
