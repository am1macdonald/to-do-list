// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: projects.sql

package database

import (
	"context"
)

const addProject = `-- name: AddProject :one
INSERT INTO projects (user_id, title, description, notes, deadline, complete)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING id, title, description, notes, deadline, complete
`

type AddProjectParams struct {
	UserID      int64  `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Deadline    int64  `json:"deadline"`
	Complete    bool   `json:"complete"`
}

type AddProjectRow struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Deadline    int64  `json:"deadline"`
	Complete    bool   `json:"complete"`
}

func (q *Queries) AddProject(ctx context.Context, arg AddProjectParams) (AddProjectRow, error) {
	row := q.db.QueryRowContext(ctx, addProject,
		arg.UserID,
		arg.Title,
		arg.Description,
		arg.Notes,
		arg.Deadline,
		arg.Complete,
	)
	var i AddProjectRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.Notes,
		&i.Deadline,
		&i.Complete,
	)
	return i, err
}

const deleteProject = `-- name: DeleteProject :exec
DELETE FROM projects where id = ?
`

func (q *Queries) DeleteProject(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteProject, id)
	return err
}

const getUserProjects = `-- name: GetUserProjects :many
SELECT id, user_id, title, description, notes, deadline, complete, created_at, updated_at from projects
where user_id = ?
`

func (q *Queries) GetUserProjects(ctx context.Context, userID int64) ([]Project, error) {
	rows, err := q.db.QueryContext(ctx, getUserProjects, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Project
	for rows.Next() {
		var i Project
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Title,
			&i.Description,
			&i.Notes,
			&i.Deadline,
			&i.Complete,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateProject = `-- name: UpdateProject :one
UPDATE projects 
set title = ?, 
  description = ?, 
  notes = ?, 
  deadline = ?, 
  complete = ?,
  updated_at = CURRENT_TIMESTAMP
where id = ?
RETURNING id, title, description, notes, deadline, complete
`

type UpdateProjectParams struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Deadline    int64  `json:"deadline"`
	Complete    bool   `json:"complete"`
	ID          int64  `json:"id"`
}

type UpdateProjectRow struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Deadline    int64  `json:"deadline"`
	Complete    bool   `json:"complete"`
}

func (q *Queries) UpdateProject(ctx context.Context, arg UpdateProjectParams) (UpdateProjectRow, error) {
	row := q.db.QueryRowContext(ctx, updateProject,
		arg.Title,
		arg.Description,
		arg.Notes,
		arg.Deadline,
		arg.Complete,
		arg.ID,
	)
	var i UpdateProjectRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.Notes,
		&i.Deadline,
		&i.Complete,
	)
	return i, err
}
