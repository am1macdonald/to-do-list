package project

type Project struct {
	ID          int64  `json:"id"`
	UserID      int64  `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Notes       string `json:"notes"`
	Deadline    string `json:"deadline"`
	Complete    bool   `json:"complete"`
}
