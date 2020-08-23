from django.contrib import admin

from django.apps import apps

# humba의 모든 모델 가져와서 웹으로 관리 가능하게 하기
app = apps.get_app_config('humba')
for model_name, model in app.models.items():
    admin.site.register(model)