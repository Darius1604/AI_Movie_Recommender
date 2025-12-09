from sqlalchemy import Column, Integer, String, Text, Float, Date, JSON
from database import Base, engine


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    overview = Column(Text)
    genres = Column(JSON)
    poster_path = Column(String(255))
    popularity = Column(Float)
    release_date = Column(Date, nullable=True)


if __name__ == "__main__":
    print("Creating tables in database ...")
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
