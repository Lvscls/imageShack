import pydantic as _pydantic
import typing as _typing

class _UserBase(_pydantic.BaseModel):
    email: str

class UserCreate(_UserBase):
    hashed_password: str
    
    class Config:
        orm_mode = True

class User(_UserBase):
    id: int

    class Config:
        orm_mode = True

class _ImageBase(_pydantic.BaseModel):
    url: str
    is_public: bool = True

class ImageCreate(_ImageBase):
    pass

class Image(_ImageBase):
    id: str
    
    class Config:
        orm_mode = True
    