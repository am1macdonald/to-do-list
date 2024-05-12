-- name: AddProject :one
INSERT INTO projects (user_id, title, description, notes, deadline, complete)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING id, title, description, notes, deadline, complete;

-- name: GetUserProjects :many
SELECT * from projects
where user_id = ?;

-- name: UpdateProject :one
UPDATE projects 
set title = ?, 
  description = ?, 
  notes = ?, 
  deadline = ?, 
  complete = ?,
  updated_at = CURRENT_TIMESTAMP
where id = ?
RETURNING id, title, description, notes, deadline, complete;

-- name: DeleteProject :exec
DELETE FROM projects where id = ?;
