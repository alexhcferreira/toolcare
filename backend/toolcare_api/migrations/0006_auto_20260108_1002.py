from django.db import migrations
from django.contrib.postgres.operations import UnaccentExtension

class Migration(migrations.Migration):

    dependencies = [
        ('toolcare_api', '0005_alter_ferramenta_data_aquisicao'), # Ou a última migração que tiver lá
    ]

    operations = [
        UnaccentExtension()
    ]