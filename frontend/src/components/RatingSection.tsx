interface RatingSectionProps {
	title: string;
	options: string[];
	selected: string;
	onSelect: (value: string) => void;
}

const getButtonClass = (selected: string, value: string) =>
	selected === value ? "button selected" : "button";

export default function RatingSection({
	title,
	options,
	selected,
	onSelect,
}: RatingSectionProps) {
	return (
		<div className="section">
			<h3>{title}</h3>
			{options.map((option) => (
				<button
					key={option}
					className={getButtonClass(selected, option)}
					onClick={() => onSelect(option)}>
					{option}
				</button>
			))}
		</div>
	);
}
