const express = require('express')
const http = require('http')
const path = require('path')
// const hbs = require('hbs')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users') 

const port = process.env.PORT

//define paths to express config
const publicDirPath = path.join(__dirname, '../public')
// const viewsDirPath = path.join(__dirname, '../templates/views')
// const partialsDirPath = path.join(__dirname, '../templates/partials')

// //setup handlebars engine and views location
// app.set('view engine', 'hbs')
// app.set('views', viewsDirPath)
// hbs.registerPartials(partialsDirPath)

//setup static dir to serve
app.use(express.static(publicDirPath))

app.get('/me', (req, res) => {
    // res.send({
    //     message: 'hello !'
    // })
    res.render('index', {
        title: 'Weather Home',
        name: 'Mahmoud Badr'
    })
})


io.on('connection', (socket) => {
    // console.log('new web socket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit('message', generateMessage('adimn', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    }) 

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        
        callback()
        
    })
    
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        // socket.broadcast.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) 
            io.to(user.room).emit('message', generateMessage('adimn', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
            room: user.room,
            users : getUsersInRoom(user.room)
        })
    })
})

server.listen(port, () => {
    console.log('server is up in port '+port)
})