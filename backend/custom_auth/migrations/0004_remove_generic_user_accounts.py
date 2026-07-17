from django.db import migrations


def remove_generic_user_accounts(apps, schema_editor):
    CustomUser = apps.get_model("custom_auth", "CustomUser")
    CustomUser.objects.filter(user_type="user").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("custom_auth", "0003_alter_customuser_name_alter_customuser_user_type_and_more"),
    ]

    operations = [
        migrations.RunPython(remove_generic_user_accounts, migrations.RunPython.noop),
    ]
