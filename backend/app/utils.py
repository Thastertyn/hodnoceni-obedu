from app.models import RatingBase, AverageRating, QualityRating


def compute_average_rating(ratings: list[RatingBase]) -> AverageRating:
    if not ratings:
        return AverageRating(
            taste=QualityRating.NOT_APPLICABLE,
            temperature=QualityRating.NOT_APPLICABLE,
            portion_size=QualityRating.NOT_APPLICABLE,
            soup=QualityRating.NOT_APPLICABLE,
            dessert=QualityRating.NOT_APPLICABLE,
            would_pay_more=QualityRating.NOT_APPLICABLE,
        )

    def avg(attr: str) -> QualityRating:
        values = [getattr(r, attr).value for r in ratings if getattr(r, attr).value > 0]
        return QualityRating(round(sum(values) / len(values))) if values else QualityRating.NOT_APPLICABLE

    return AverageRating(
        taste=avg("taste"),
        temperature=avg("temperature"),
        portion_size=avg("portion_size"),
        soup=avg("soup"),
        dessert=avg("dessert"),
        would_pay_more=avg("would_pay_more"),
    )