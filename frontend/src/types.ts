export enum QualityRating {
	NOT_APPLICABLE = 0,
	BAD = 1,
	OKAY = 2,
	GOOD = 3,
}

export interface RatingPublic {
	taste: QualityRating;
	temperature: QualityRating;
	portion_size: QualityRating;
	soup: QualityRating;
	dessert: QualityRating;
	would_pay_more: QualityRating;
	feedback: string | null;
}

export interface Lunch {
	main_course: string;
	soup?: string | null;
	drink?: string | null;
}


export interface LunchEntry {
	lunch?: Lunch | null;
	rating?: RatingPublic | null;
}

export interface UserCredentials {
	username: string;
	password: string;
}

export type LunchDate = Lunch & { lunch_date: string };
export type LunchData = Record<string, LunchEntry>;


export const RATING_LABELS = {
	taste: {
		1: "Mizerné",
		2: "Průměrné",
		3: "Vynikající",
	},
	temperature: {
		1: "Studené",
		2: "Akorát",
		3: "Horké",
	},
	portion_size: {
		1: "Měl jsem hlad",
		2: "Akorát",
		3: "Přejedl jsem se",
	},
	soup: {
		0: "Bez polévky",
		1: "Špatná",
		2: "Průměrná",
		3: "Dobrá",
	},
	dessert: {
		0: "Bez dezertu",
		1: "Špatná",
		2: "Průměrná",
		3: "Dobrá",
	},
	would_pay_more: {
		0: "Nejsem ochoten připlatit",
		1: "10Kč - dezert",
		2: "6Kč - větší porce",
		3: "Připlatil bych oboje",
	},
};
