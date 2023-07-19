const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  try {
    const getMovieNamesQuery = `select movie_name from movie;`;

    const movieNamesArray = await db.all(getMovieNamesQuery);

    const convertDbObjectToResponseObject = (dbObject) => {
      return {
        movieName: dbObject.movie_name,
      };
    };

    response.send(
      movieNamesArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/movies/", async (request, response) => {
  let movieData = request.body;

  const { directorId, movieName, leadActor } = movieData;
  const postQuery = `INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;

  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;

    const getQuery = `select * from movie where movie_id=${movieId}`;

    const dbResponse = await db.get(getQuery);

    const convertDbObjectToResponseObject = (dbObject) => {
      return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
      };
    };
    response.send(convertDbObjectToResponseObject(dbResponse));
  } catch (error) {
    console.log(error.message);
  }
});

app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const { directorId, movieName, leadActor } = request.body;
    const updateMovieQuery = `
    UPDATE
     movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE
       movie_id= ${movieId};`;

    await db.run(updateMovieQuery);

    response.send("Movie Details Updated");
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Deleted");
});

app.get("/directors/", async (request, response) => {
  try {
    const getDirectorNamesQuery = `select * from director;`;

    const directorNamesArray = await db.all(getDirectorNamesQuery);

    const convertDbObjectToResponseObject = (dbObject) => {
      return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
      };
    };

    response.send(
      directorNamesArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  try {
    const { directorId } = request.params;
    console.log(directorId);
    const getMovieNamesQuery = `select movie_name from movie INNER JOIN
    director ON ${movie.directorId}=${director.directorId};`;

    const movieNamesArray = await db.all(getMovieNamesQuery);

    const convertDbObjectToResponseObject = (dbObject) => {
      return {
        movieName: dbObject.movie_name,
      };
    };

    response.send(
      movieNamesArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = app;
