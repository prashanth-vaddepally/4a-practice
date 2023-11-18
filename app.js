const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
let db = null;
const dbpath = path.join(__dirname, "moviesData.db");
const intializeranddbsever = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http://localhost:3000 server running at ");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

intializeranddbsever();

app.get("/movies/", async (request, response) => {
  const allmoviesquery = `SELECT * FROM  movie ORDER BY movie_id;`;
  const movies = await db.all(allmoviesquery);
  const ans = (movies) => {
    return {
      movieName: movies.movie_name,
    };
  };
  response.send(movies.map((eachMovie) => ans(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const addmoviequery = `
INSERT INTO movie
(director_id, movie_name, lead_actor)
VALUES(${directorId},
    '${movieName}',
    '${leadActor}');`;
  const dbresponse = await db.run(addmoviequery);
  const movieId = dbresponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getPerticularMovieQuery = `
    SELECT * FROM movie
    WHERE movie_id =${movieId};`;
  const Movie = await db.get(getPerticularMovieQuery);
  const theanswer = (Movie) => {
    return {
      movieId: Movie.movie_id,
      directorId: Movie.director_id,
      movieName: Movie.movie_name,
      leadActor: Movie.lead_actor,
    };
  };
  response.send(theanswer(Movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const updatemoviequery = `
    UPDATE movie
    SET director_id = ${directorId},
    movie_name= '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
  await db.run(updatemoviequery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemoviequery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deletemoviequery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorsquery = `
    SELECT * FROM director
    ORDER BY director_id;`;
  const director = await db.all(directorsquery);
  const answer = (director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  };
  response.send(director.map((eachdirector) => answer(eachdirector)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const fewmoviesquery = `
    SELECT * FROM  movie
    WHERE director_id = '${directorId}';`;
  const themovies = await db.all(fewmoviesquery);
  const fullans = (themovies) => {
    return {
      movieName: themovies.movie_name,
    };
  };
  response.send(
    themovies.map((allmovies) => ({ movieName: allmovies.movie_name }))
  );
});
module.exports = app;
