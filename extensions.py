from typing import TYPE_CHECKING

from flask_login import LoginManager
from flask_migrate import Migrate
from flask_session import Session
from flask_sqlalchemy import BaseQuery, Model, SQLAlchemy

if TYPE_CHECKING:
    class _ModelBase(Model):
        query: BaseQuery
        metadata = None

__all__ = ['session', 'db', 'migrate', 'login', 'ModelBase', 'Table']

session = Session()
db = SQLAlchemy()
migrate = Migrate(db=db)
login = LoginManager()

ModelBase = db.Model  # type: _ModelBase
Table = db.Table
