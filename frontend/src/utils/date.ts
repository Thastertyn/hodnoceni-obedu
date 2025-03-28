export const formatDate = (dateString: string | undefined) => {
	if (!dateString) return "";
	const date = new Date(dateString);
	return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
		.toString()
		.padStart(2, "0")}.${date.getFullYear()}`;
};
