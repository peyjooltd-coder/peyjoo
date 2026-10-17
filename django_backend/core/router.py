class AppDataRouter:
    """App tables stay on the live SQLite file. Django auth stays separate."""

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'core':
            return 'app'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'core':
            return 'app'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        core = {obj1._meta.app_label, obj2._meta.app_label}
        if 'core' in core and core != {'core'}:
            return False
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'core':
            return False
        return db == 'default'
