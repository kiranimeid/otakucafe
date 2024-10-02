export const setError = (err: string | Error): [false, Error] => {
	if (err instanceof Error) return [false, err];
	else return [false, new Error(err)];
};

export const returnValue = <T>(value: T): [T, null] => {
	return [value, null];
};
