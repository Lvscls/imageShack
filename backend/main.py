import fastapi as _fastapi
import fastapi.security as _security
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File


import sqlalchemy.orm as _orm

import services as _services
import schemas as _schemas
from fastapi.staticfiles import StaticFiles
import os


app = _fastapi.FastAPI()
uploads_dir = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "uploads")

# Montez le dossier d'uploads en tant que fichiers statiques
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
# Configurer les paramètres CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://vps-fb4cc13a.vps.ovh.net",
    "http://vps-fb4cc13a.vps.ovh.net/3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/users")
async def create_user(user: _schemas.UserCreate, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    db_user = await _services.get_user_by_email(user.email, db)
    if db_user:
        raise _fastapi.HTTPException(
            status_code=400, detail="Email already registered")

    user = await _services.create_user(user, db)
    return await _services.create_token(user)


@app.post("/api/token")
async def generate_token(form_data: _security.OAuth2PasswordRequestForm = _fastapi.Depends(), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    user = await _services.authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise _fastapi.HTTPException(
            status_code=401, detail="Invalid credentials"
        )

    return await _services.create_token(user)


@app.get("/api/users/me", response_model=_schemas.User)
async def get_user(user: _schemas.User = _fastapi.Depends(_services.get_current_user)):
    return user

@app.delete("/api/users/{user_id}", status_code=204)
async def delete_user_endpoint(user_id: int, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    return await _services.delete_user(user_id=user_id, db=db)

@app.post("/api/images", response_model=_schemas.Image)
async def upload_image(image: UploadFile = File(...), user: _schemas.User = _fastapi.Depends(_services.get_current_user), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    return await _services.upload_image(user=user, db=db, image=image)


@app.get("/api/images/public", response_model=List[_schemas.Image])
async def get_public_images(db: _orm.Session = _fastapi.Depends(_services.get_db)):
    return await _services.get_public_images(db=db)


@app.get("/api/images/private", response_model=List[_schemas.Image])
async def get_private_images(user: _schemas.User = _fastapi.Depends(_services.get_current_user), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    return await _services.get_private_images(user=user, db=db)


@app.get("/api/images/{image_id}", status_code=200)
async def get_image(image_id: int, user: _schemas.User = _fastapi.Depends(_services.get_current_user), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    return await _services.get_image(image_id=image_id, user=user, db=db)


@app.delete("/api/images/{image_id}", status_code=204)
async def delete_image(image_id: int, user: _schemas.User = _fastapi.Depends(_services.get_current_user), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    await _services.delete_image(image_id=image_id, user=user, db=db)
    return {"message", "Image successfully Deleted"}


@app.patch("/api/images/{image_id}", status_code=201)
async def update_image(image_id: int, is_public: bool, user: _schemas.User = _fastapi.Depends(_services.get_current_user), db: _orm.Session = _fastapi.Depends(_services.get_db)):
    await _services.update_image(image_id=image_id, is_public=is_public, user=user, db=db)
    return {"message": "Image successfully updated"}


@app.get("/api")
async def root():
    return {"message": "Welcome to ImageShack"}
