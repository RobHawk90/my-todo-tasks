let app = require('./config/express')

let port = process.env.PORT ? process.env.PORT : 3000

app.listen(port, () => console.log(`running my-todo-tasks at port ${port}`))
