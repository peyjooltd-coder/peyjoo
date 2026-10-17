import uuid
from datetime import datetime

from django import forms
from django.db import models

from .registry import Spec


def new_pk(prefix):
    return f'{prefix}{int(datetime.now().timestamp()):x}{uuid.uuid4().hex[:8]}'


def stamp(obj):
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    names = {field.name for field in obj._meta.fields}
    if 'created_at' in names and not getattr(obj, 'created_at', None):
        obj.created_at = now
    if 'updated_at' in names:
        obj.updated_at = now


LISTING_SKIP = {
    'image', 'images_json', 'seller_avatar', 'badges_json', 'features_json',
    'attributes_json', 'is_mine', 'lat', 'lng', 'views', 'saves', 'time_label',
    'seller_rating', 'seller_reviews', 'created_at', 'updated_at', 'status',
}


def editable_field_names(spec: Spec):
    names = []
    for field in spec.model._meta.fields:
        if isinstance(field, models.CompositePrimaryKey):
            continue
        if field.primary_key and not field.is_relation:
            continue
        if not field.editable:
            continue
        if spec.model.__name__ == 'Listing' and field.name in LISTING_SKIP:
            continue
        names.append(field.name)
    return names


def make_form(spec: Spec):
    field_names = editable_field_names(spec)

    class PanelForm(forms.ModelForm):
        class Meta:
            model = spec.model
            fields = field_names

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            for field in self.fields.values():
                css = 'input'
                if isinstance(field.widget, forms.Textarea):
                    field.widget.attrs.setdefault('rows', 4)
                    css = 'input area'
                if isinstance(field.widget, forms.CheckboxInput):
                    css = 'check'
                field.widget.attrs['class'] = css

    PanelForm.__name__ = f'{spec.model.__name__}Form'
    return PanelForm
