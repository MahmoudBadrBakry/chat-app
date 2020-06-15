let users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room })=>{
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    
    // Check for existing user 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate user name
    if (existingUser) {
        return {
            error: 'User is in use!'
        }
    }

    // Store user 
    const user = { id, username, room }

    users.push(user)
    
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1 )
        return users.splice(index, 1)[0]
}

// addUser({
//     id: 1,
//     username:'Mahmoud ',
//     room:'CSE 51'
// })

// addUser({
//     id: 2,
//     username:'Mahmoud ',
//     room:'CSE 52'
// })

// addUser({
//     id: 3,
//     username:'mohammed',
//     room:'CSE 51'
// })

// console.log(users)
// removeUser(2)
// console.log(users)

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1 )
        return users[index]
}

// console.log(getUser(3))

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user) => room == user.room)
    return usersInRoom
}

// console.log(getUsersInRoom('CSE 51'))


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}