const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

/* convertMovieDbObjectToResponseObject */

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

/* convertDirectorDbObjectToResponseObject */

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

/* GetDataFromMovies */

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

/* GetDetailsBasedOnId */

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

/* PostDataInMovies */

app.post("/movies", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieDetails = `
    INSERT INTO 
      movie( director_id,movie_name,lead_actor )
    VALUES 
      ( ${directorId} , '${movieName}' , '${leadActor}');
      `;
  await database.run(addMovieDetails);
  response.send("Movie Successfully Added");
});

/* PutSomeUpdatesInMovies */

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDetails = `
    UPDATE
      movie
      SET 
       director_id = ${directorId},
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
       WHERE 
         movie_id = ${movieId};
       `;
  await database.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

/* DeleteDataInMovieId */

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const removeMovieDetails = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  await database.run(removeMovieDetails);
  response.send("Movie Removed");
});

/* GetDataFromDirectors */

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

/* GetDataFromDirectorsInDirectorsId */

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
