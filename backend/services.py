import database as _database
import models as _models
import schemas as _schemas
import sqlalchemy.orm as _orm
import passlib.hash as _hash
import jwt as _jwt
import fastapi as _fastapi
import fastapi.security as _security
from fastapi import UploadFile
import os

oauth2schema = _security.OAuth2PasswordBearer(tokenUrl='/api/token')

JWT_SECRET = "jwtsecret"


def create_database():
    return _database.Base.metadata.create_all(bind=_database.engine)


def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_user_by_email(email: str, db: _orm.Session):
    return db.query(_models.User).filter(_models.User.email == email).first()


async def create_user(user: _schemas.UserCreate, db: _orm.Session):
    user_obj = _models.User(
        email=user.email, hashed_password=_hash.bcrypt.hash(user.hashed_password))
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj


async def authenticate_user(email: str, password: str, db: _orm.Session):
    user = await get_user_by_email(email, db)
    if not user:
        return False
    if not user.verify_password(password):
        return False

    return user


async def create_token(user: _models.User):
    user_obj = _schemas.User.from_orm(user)

    token = _jwt.encode(user_obj.dict(), JWT_SECRET)

    return dict(access_token=token, token_type="bearer")


async def get_current_user(db: _orm.Session = _fastapi.Depends(get_db), token: str = _fastapi.Depends(oauth2schema)):
    try:
        payload = _jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = db.query(_models.User).get(payload["id"])
    except:
        raise _fastapi.HTTPException(
            status_code=401, detail="Invalid email or password")

    return _schemas.User.from_orm(user)


async def delete_user(user_id: int, db: _orm.Session = _fastapi.Depends(get_db)):
    user = db.query(_models.User).get(user_id)
    if not user:
        raise _fastapi.HTTPException(status_code=404, detail="User not found")

    # Supprimer les images de l'utilisateur
    db.query(_models.Image).filter(_models.Image.uploaded_by == user).delete()

    # Supprimer l'utilisateur
    db.delete(user)
    db.commit()

    return {"message": "User and associated images deleted successfully"}



async def upload_image(user: _schemas.User, db: _orm.Session, image: UploadFile):
    # Sauvegarde de l'image dans un dossier uploads
    save_path = "uploads"
    os.makedirs(save_path, exist_ok=True)  # Crée le dossier si nécessaire
    file_path = os.path.join(save_path, image.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await image.read())
    # Enregistrement du chemin de l'image en base de données
    uploaded_by_user = db.query(_models.User).get(
        user.id)  # Utilisez l'ID de l'utilisateur actuel

    image_data = _models.Image(
        url=file_path, is_public=True, uploaded_by=uploaded_by_user)  # Utilisez l'objet User complet
    db.add(image_data)
    db.commit()
    db.refresh(image_data)

    return image_data  # Retournez les informations de l'image créée


async def get_public_images(db: _orm.Session):
    images = db.query(_models.Image).filter(
        _models.Image.is_public == True).all()
    return list(map(_schemas.Image.from_orm, images))


async def get_private_images(user: _schemas.User = _fastapi.Depends(get_current_user), db: _orm.Session = _fastapi.Depends(get_db)):
    images = db.query(_models.Image).filter(
        _models.Image.uploaded_by_id == user.id).all()
    return list(map(_schemas.Image.from_orm, images))


async def _image_selector(image_id: int, user: _schemas.User, db: _orm.Session):
    image = db.query(_models.Image).filter(_models.Image.uploaded_by.has(
        id=user.id)).filter(_models.Image.id == image_id).first()
    if image is None:
        raise _fastapi.HTTPException(status_code=404, detail="Image not found")
    return image


async def get_image(image_id: int, user: _schemas.User, db: _orm.Session):
    image = await _image_selector(image_id, user, db)

    return _schemas.Image.from_orm(image)


async def delete_image(image_id: int, user: _schemas.User, db: _orm.Session):
    image = await _image_selector(image_id, user, db)
    db.delete(image)
    db.commit()


async def update_image(image_id: int, is_public: bool, user: _schemas.User, db: _orm.Session):
    image_db = await _image_selector(image_id, user, db)
    image_db.is_public = is_public

    db.commit()
    db.refresh(image_db)

    return _schemas.Image.from_orm(image_db)
