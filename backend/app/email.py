import locale
from typing import Any
import emails

from jinja2 import Template
from pathlib import Path

from app.core.config import settings
from app import crud
from app.api.dependencies import get_db
from app.models import Lunch, LunchEntry, QualityRating, RatingPublic


def get_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_monthly_report():
    with next(get_db()) as session:

        # ratings = crud.get_past_ratings(session=session)

        mail_template = get_email_template(template_name="report.html", context={
            "total": 4,
            "user_total": 3,
            "user_count": 2,
            "weekly_data": {
                "Pondělí": LunchEntry(
                    lunch=None,
                    rating=None  # No lunch ordered
                ),
                "Úterý": LunchEntry(
                    lunch=None,
                    rating=None  # No lunch ordered
                ),
                "Středa": LunchEntry(
                    lunch=None,
                    rating=None  # Lunch ordered, but not rated
                ),
                "Čtvrtek": LunchEntry(
                    lunch=Lunch(main_course="Bratislavská vepřová plec, houskové knedlíky", soup="Polévka rybí s pohankou", drink="voda se sirupem a mátou"),
                    rating=RatingPublic(
                        taste=QualityRating.OKAY,
                        temperature=QualityRating.GOOD,
                        portion_size=QualityRating.OKAY,
                        soup=QualityRating.GOOD,
                        dessert=QualityRating.OKAY,
                        would_pay_more=QualityRating.GOOD
                    )
                ),
                "Pátek": LunchEntry(
                    lunch=None,
                    rating=None
                )
            }
        })
        all_users = crud.get_all_users(session=session)

        for user in all_users:
            user_email = f"{user}@spsejecna.cz"
            send_email(
                email_to=user_email,
                subject="Měsíční přehled",
                html_content=mail_template
            )


def send_test_mail(to: str):
    html = """
        <h1>Testovací email</h1>
        <p>Toto je test zpráv</p>
        """

    send_email(email_to=to, subject="Test email", html_content=html)


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}

    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True

    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    print("Response: ", response)
