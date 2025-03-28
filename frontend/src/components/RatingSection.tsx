interface RatingOption {
	key: string;
	label: string;
}

interface RatingSectionProps {
	title: string;
	options: RatingOption[];
	selected: string;
	onSelect: (value: string) => void;
}

const getButtonClass = (selected: string, key: string) =>
	selected === key ? "button selected" : "button";

export default function RatingSection({
	title,
	options,
	selected,
	onSelect,
}: RatingSectionProps) {
	const shouldAddSpacer = options.length === 3;

	return (
		<div className="section">
			<h3>{title}</h3>
			{options.map(({ key, label }) => (
				<button
					key={key}
					className={getButtonClass(selected, key)}
					onClick={() => onSelect(key)}
				>
					{label}
				</button>
			))}
			{shouldAddSpacer && (
				<button
					aria-hidden="true"
					tabIndex={-1}
					className="button invisible"
					style={{ pointerEvents: "none" }}
				>&nbsp;</button>
			)}
		</div>
	);
}
