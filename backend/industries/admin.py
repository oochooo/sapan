from django.contrib import admin
from .models import IndustryCategory, IndustrySubcategory, Objective


class IndustrySubcategoryInline(admin.TabularInline):
    model = IndustrySubcategory
    extra = 1
    prepopulated_fields = {"slug": ("name",)}


@admin.register(IndustryCategory)
class IndustryCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [IndustrySubcategoryInline]


@admin.register(IndustrySubcategory)
class IndustrySubcategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "slug"]
    list_filter = ["category"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "slug"]
    list_filter = ["category"]
    prepopulated_fields = {"slug": ("name",)}
