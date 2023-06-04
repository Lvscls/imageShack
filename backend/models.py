import sqlalchemy as _sql
import sqlalchemy.orm as _orm
import passlib.hash as _hash

import database as _database

class User(_database.Base):
    __tablename__ = "users"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    email = _sql.Column(_sql.String, unique=True, index=True)
    hashed_password = _sql.Column(_sql.String)
    
    images = _orm.relationship("Image", back_populates="uploaded_by")
    
    def verify_password(self, password: str):
        return _hash.bcrypt.verify(password, self.hashed_password)
    
    
class Image(_database.Base):
    __tablename__ = "images"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    uploaded_by_id = _sql.Column(_sql.Integer, _sql.ForeignKey("users.id"))
    url = _sql.Column(_sql.String, index=True)
    is_public = _sql.Column(_sql.Boolean, default=True)
    
    uploaded_by = _orm.relationship("User", back_populates="images")  
