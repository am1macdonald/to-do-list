// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: users.sql

package database

import (
	"context"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (name, email)
VALUES (?, ?)
RETURNING id, name, email, created_at, updated_at, last_login
`

type CreateUserParams struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser, arg.Name, arg.Email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.LastLogin,
	)
	return i, err
}

const getUserFromEmail = `-- name: GetUserFromEmail :one
SELECT id, name, email, created_at, updated_at, last_login from users
where email = ?
`

func (q *Queries) GetUserFromEmail(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserFromEmail, email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.LastLogin,
	)
	return i, err
}