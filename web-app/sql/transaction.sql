-- Start transaction
START TRANSACTION;

-- Declare variables
SET @movie_title = 'New Blockbuster Movie';
SET @movie_description = 'An exciting new blockbuster that everyone must see!';
SET @movie_release_date = '2024-12-25';
SET @movie_trailer_url = 'https://example.com/trailer.mp4';
SET @movie_length = 120;
SET @movie_img = 'https://example.com/movie_poster.jpg';
SET @movie_minimum_age = 12;
SET @category_ids = '1,2,3'; -- Assuming these are valid category IDs (e.g., Action, Adventure, Sci-Fi)

-- Insert the new movie
INSERT INTO Movie (movieTitle, movieDescription, movieReleaseDate, movieTrailerUrl, movieLength, movieImg, moviePublishingState, movieFavorite, movieMinimumAge)
VALUES (@movie_title, @movie_description, @movie_release_date, @movie_trailer_url, @movie_length, @movie_img, 'premiere', FALSE, @movie_minimum_age);

SET @new_movie_id = LAST_INSERT_ID();

-- Add categories to the movie
INSERT INTO _CategoryToMovie (A, B)
SELECT category_id, @new_movie_id
FROM (
    SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(@category_ids, ',', numbers.n), ',', -1) category_id
    FROM (
        SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    ) numbers
    WHERE numbers.n <= 1 + (LENGTH(@category_ids) - LENGTH(REPLACE(@category_ids, ',', '')))
) temp;

-- Schedule sessions for the new movie in multiple cinemas
INSERT INTO Session (movieId, cinemaId, roomId, sessionDate, sessionPrice, sessionStatus)
SELECT 
    @new_movie_id,
    Cinema.id,
    Room.id,
    DATE_ADD(@movie_release_date, INTERVAL (ROW_NUMBER() OVER (PARTITION BY Cinema.id ORDER BY Room.id) - 1) DAY) AS sessionDate,
    12.50,  -- Example price
    'active'
FROM Cinema
JOIN Room ON Cinema.id = Room.cinemaId
WHERE Room.roomQuality = 'Standard'  -- Scheduling only in standard rooms for this example
LIMIT 10;  -- Limit to 10 sessions as an example

-- For each session, create a TimeRange
INSERT INTO TimeRange (timeRangeStartTime, timeRangeEndTime, sessionId, timeRangeStatus)
SELECT 
    sessionDate AS timeRangeStartTime,
    DATE_ADD(sessionDate, INTERVAL @movie_length MINUTE) AS timeRangeEndTime,
    id AS sessionId,
    'available' AS timeRangeStatus
FROM Session
WHERE movieId = @new_movie_id;

-- Check if everything was inserted correctly
SET @movie_count = (SELECT COUNT(*) FROM Movie WHERE id = @new_movie_id);
SET @category_count = (SELECT COUNT(*) FROM _CategoryToMovie WHERE B = @new_movie_id);
SET @session_count = (SELECT COUNT(*) FROM Session WHERE movieId = @new_movie_id);
SET @time_range_count = (SELECT COUNT(*) FROM TimeRange WHERE sessionId IN (SELECT id FROM Session WHERE movieId = @new_movie_id));

IF @movie_count = 1 AND @category_count > 0 AND @session_count > 0 AND @time_range_count > 0 THEN
    -- If everything is successful, commit the transaction
    COMMIT;
    SELECT 'New movie added and sessions scheduled successfully' AS result;
ELSE
    -- If something went wrong, rollback the transaction
    ROLLBACK;
    SELECT 'Failed to add new movie and schedule sessions' AS result;
END IF;