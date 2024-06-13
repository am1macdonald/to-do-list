// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: tasks.sql

package database

import (
	"context"
	"database/sql"
	"strings"
)

const addTask = `-- name: AddTask :one
INSERT INTO tasks (user_id, project_id, title, description, notes, priority, deadline, complete)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING id, title, description, notes, priority, deadline, complete
`

type AddTaskParams struct {
	UserID      int64         `json:"user_id"`
	ProjectID   sql.NullInt64 `json:"project_id"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Notes       string        `json:"notes"`
	Priority    int64         `json:"priority"`
	Deadline    string        `json:"deadline"`
	Complete    bool          `json:"complete"`
}

type AddTaskRow struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Priority    int64  `json:"priority"`
	Deadline    string `json:"deadline"`
	Complete    bool   `json:"complete"`
}

func (q *Queries) AddTask(ctx context.Context, arg AddTaskParams) (AddTaskRow, error) {
	row := q.db.QueryRowContext(ctx, addTask,
		arg.UserID,
		arg.ProjectID,
		arg.Title,
		arg.Description,
		arg.Notes,
		arg.Priority,
		arg.Deadline,
		arg.Complete,
	)
	var i AddTaskRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.Notes,
		&i.Priority,
		&i.Deadline,
		&i.Complete,
	)
	return i, err
}

const deleteTask = `-- name: DeleteTask :exec
DELETE FROM tasks where id = ? and user_id = ?
`

type DeleteTaskParams struct {
	ID     int64 `json:"id"`
	UserID int64 `json:"user_id"`
}

func (q *Queries) DeleteTask(ctx context.Context, arg DeleteTaskParams) error {
	_, err := q.db.ExecContext(ctx, deleteTask, arg.ID, arg.UserID)
	return err
}

const getUserTasks = `-- name: GetUserTasks :many
SELECT id, user_id, project_id, title, description, notes, deadline, priority, complete, created_at, updated_at from tasks
where user_id = ?
`

func (q *Queries) GetUserTasks(ctx context.Context, userID int64) ([]Task, error) {
	rows, err := q.db.QueryContext(ctx, getUserTasks, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Task
	for rows.Next() {
		var i Task
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.ProjectID,
			&i.Title,
			&i.Description,
			&i.Notes,
			&i.Deadline,
			&i.Priority,
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

const setTaskProject = `-- name: SetTaskProject :exec
UPDATE tasks 
  set project_id = ?
where id in (/*SLICE:ids*/?)
AND user_id = ?
`

type SetTaskProjectParams struct {
	ProjectID sql.NullInt64 `json:"project_id"`
	Ids       []int64       `json:"ids"`
	UserID    int64         `json:"user_id"`
}

func (q *Queries) SetTaskProject(ctx context.Context, arg SetTaskProjectParams) error {
	query := setTaskProject
	var queryParams []interface{}
	queryParams = append(queryParams, arg.ProjectID)
	if len(arg.Ids) > 0 {
		for _, v := range arg.Ids {
			queryParams = append(queryParams, v)
		}
		query = strings.Replace(query, "/*SLICE:ids*/?", strings.Repeat(",?", len(arg.Ids))[1:], 1)
	} else {
		query = strings.Replace(query, "/*SLICE:ids*/?", "NULL", 1)
	}
	queryParams = append(queryParams, arg.UserID)
	_, err := q.db.ExecContext(ctx, query, queryParams...)
	return err
}

const updateTask = `-- name: UpdateTask :one
UPDATE tasks 
set title = ?, 
  description = ?, 
  notes = ?, 
  priority = ?,
  deadline = ?, 
  complete = ?,
  updated_at = CURRENT_TIMESTAMP
where id = ?
RETURNING id
`

type UpdateTaskParams struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Priority    int64  `json:"priority"`
	Deadline    string `json:"deadline"`
	Complete    bool   `json:"complete"`
	ID          int64  `json:"id"`
}

func (q *Queries) UpdateTask(ctx context.Context, arg UpdateTaskParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, updateTask,
		arg.Title,
		arg.Description,
		arg.Notes,
		arg.Priority,
		arg.Deadline,
		arg.Complete,
		arg.ID,
	)
	var id int64
	err := row.Scan(&id)
	return id, err
}
