import locale

from app.models import Rating, QualityRating, RatingStatistics, LunchEntry, Lunch, LunchData, RatingPublic

locale.setlocale(locale.LC_TIME, "cs_CZ.UTF-8")


def compute_rating(lunch_data: LunchData, user: str) -> RatingStatistics:
    ratings: list[RatingPublic] = [
        entry.rating for entry in lunch_data.root.values() if entry.rating is not None
    ]

    user_individual_ratings = list(filter(lambda rating: rating.username == user, ratings))

    unique_users = list(set(map(lambda rating: rating.username)))

    total_rating_count = len(ratings)
    user_rating_count = len(user_individual_ratings)
    user_count = len(unique_users)

    day_to_ratings_map: dict[str, LunchEntry] = {}

    for rating in ratings:
        weekday = rating.date.strftime("%A").lower()
        lunch = filter(lambda lunch: (lunch.date), lunch_data)
        day_to_ratings_map[weekday].append(rating)

    return RatingStatistics(
        total=total_rating_count,
        user_total=user_rating_count,
        user_count=user_count,
        weekly_data=day_to_ratings_map
    )


def avg(attr: str, ratings: list[Rating]) -> QualityRating:
    values = [getattr(r, attr).value for r in ratings if getattr(r, attr).value > 0]
    return QualityRating(round(sum(values) / len(values))) if values else QualityRating.NOT_APPLICABLE
