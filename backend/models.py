from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Date,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from database import Base, engine


class MovieCategory(Base):
    __tablename__ = "movie_categories"
    # Composite primary key using movie_id and category_name
    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    category_name = Column(String(50), primary_key=True)

    # Relationship back to the Movie object
    movie = relationship(
        "Movie", back_populates="categories"
    )  # The MovieCategory belongs to one movie


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    overview = Column(Text)
    genres = Column(ARRAY(Integer))
    poster_path = Column(String(255))
    backdrop_path = Column(String(255))
    popularity = Column(Float)
    vote_average = Column(Float)
    vote_count = Column(Integer)
    release_date = Column(Date, nullable=True)
    runtime = Column(Integer, nullable=True)
    trailer_key = Column(String(255))

    favorited_by_users = relationship("Favorite", back_populates="movie")
    categories = relationship(
        "MovieCategory", back_populates="movie", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Movie(id={self.id}, title='{self.title}')>"


class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))

    def __repr__(self):
        return f"<Genre(id={self.id}, name='{self.name}')>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Link to the Favorite class
    favorites = relationship(
        "Favorite", back_populates="user", cascade="all, delete-orphan"
    )


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)

    user = relationship("User", back_populates="favorites")
    movie = relationship("Movie", back_populates="favorited_by_users")

    # Prevent a user from favoriting the same movie multiple times
    __table_args__ = (UniqueConstraint("user_id", "movie_id", name="_user_movie_uc"),)


if __name__ == "__main__":
    print("Creating tables in database ...")
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
