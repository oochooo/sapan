from django.core.management.base import BaseCommand
from industries.models import IndustryCategory, IndustrySubcategory, Objective


class Command(BaseCommand):
    help = "Seed the database with initial industry and objective data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding industries and objectives...")

        # Industry Categories and Subcategories
        industries = {
            "SaaS/Software": ["B2B", "B2C", "Enterprise", "Developer Tools"],
            "Marketplace/Platform": ["B2B", "B2C", "P2P", "Aggregator"],
            "Consumer/D2C": ["Subscription", "E-commerce", "App-based"],
            "Hardware/IoT": ["Consumer Devices", "Industrial", "Wearables"],
            "DeepTech/AI": ["ML/AI", "Blockchain", "Robotics", "Biotech"],
            "FinTech": ["Payments", "Lending", "InsurTech", "WealthTech"],
            "HealthTech": ["Telemedicine", "MedTech", "Wellness"],
            "EdTech": ["K-12", "Higher Ed", "Corporate Training"],
            "FoodTech/AgriTech": ["Delivery", "Farm-to-table", "FoodScience"],
            "Services": ["Agency", "Consulting", "Freelance Platform"],
        }

        for category_name, subcategories in industries.items():
            category_slug = category_name.lower().replace("/", "-").replace(" ", "-")
            category, created = IndustryCategory.objects.get_or_create(
                slug=category_slug, defaults={"name": category_name}
            )
            if created:
                self.stdout.write(f"  Created category: {category_name}")

            for sub_name in subcategories:
                sub_slug = f"{category_slug}-{sub_name.lower().replace('/', '-').replace(' ', '-')}"
                sub, created = IndustrySubcategory.objects.get_or_create(
                    slug=sub_slug, defaults={"category": category, "name": sub_name}
                )
                if created:
                    self.stdout.write(f"    Created subcategory: {sub_name}")

        # Objectives
        objectives = {
            "fundraising": [
                "Fundraising strategy",
                "Investor introductions",
                "Pitch deck review",
            ],
            "operations": [
                "Product development",
                "Hiring & team building",
                "Go-to-market strategy",
                "Legal & compliance",
            ],
        }

        for category, items in objectives.items():
            for name in items:
                slug = name.lower().replace("&", "and").replace(" ", "-")
                obj, created = Objective.objects.get_or_create(
                    slug=slug, defaults={"name": name, "category": category}
                )
                if created:
                    self.stdout.write(f"  Created objective: {name}")

        self.stdout.write(self.style.SUCCESS("Successfully seeded database!"))
