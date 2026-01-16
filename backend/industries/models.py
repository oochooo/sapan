from django.db import models


class IndustryCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Industry Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class IndustrySubcategory(models.Model):
    category = models.ForeignKey(
        IndustryCategory,
        on_delete=models.CASCADE,
        related_name='subcategories'
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Industry Subcategories'
        ordering = ['category__name', 'name']

    def __str__(self):
        return f"{self.category.name} / {self.name}"


class Objective(models.Model):
    CATEGORY_CHOICES = [
        ('fundraising', 'Fundraising'),
        ('operations', 'Operations'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


STAGE_CHOICES = [
    ('idea', 'Idea Stage'),
    ('pre_seed', 'Pre-seed'),
    ('seed', 'Seed'),
    ('series_a', 'Series A'),
    ('growth', 'Growth'),
]
