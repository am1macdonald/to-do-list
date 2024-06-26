FROM golang:1.22

RUN go install github.com/air-verse/air@latest

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

CMD ["air"]

EXPOSE 8080
