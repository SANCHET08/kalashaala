from django.db import migrations, models


def remove_gallery_content(apps, schema_editor):
    Content = apps.get_model("blog", "Content")
    Content.objects.filter(content_type="image_gallery").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0004_remove_coursemodule_blog_post_and_more"),
    ]

    operations = [
        migrations.RunPython(remove_gallery_content, migrations.RunPython.noop),
        migrations.DeleteModel(
            name="GalleryImage",
        ),
        migrations.DeleteModel(
            name="ImageGallery",
        ),
        migrations.AlterField(
            model_name="content",
            name="content_type",
            field=models.CharField(
                choices=[
                    ("blog", "Blog Post"),
                    ("video", "Video"),
                    ("pdf", "PDF"),
                    ("presentation", "Presentation"),
                    ("course", "Course"),
                ],
                max_length=20,
            ),
        ),
    ]
