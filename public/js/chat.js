
const socket = io()

// server (emit) -> client (recieve) --acknoledgement--> server 

// client (emit) -> server (recieve) --acknoledgement--> client

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element 
    const $newMessage = $messages.lastElementChild

    // Height of the new message 
    const newMesasgeStyles = getComputedStyle($newMessage)
    const newMesasgeMargin = parseInt(newMesasgeStyles.marginBottom)
    const newMesasgeHeight = $newMessage.offsetHeight + newMesasgeMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container 
    const containerHeight = $messages.scrollHeight

    // how far have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMesasgeHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }



    // console.log(newMesasgeMargin)
}
socket.on('message', (message) => {
    // count++
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    
    // console.log(url)
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    // console.log(room, users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// const incrementBtn = document.querySelector('#increment')
// incrementBtn.addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })



$messageForm.addEventListener('submit', (e) => {
    const message = e.target.elements.message.value
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')
    // if (message.value) {
        socket.emit('sendMessage', message, (error)=>{
            
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()
            if (error) {
                return console.log('##',error )
            }

            console.log('Message delivered!')
        })
        // } else {document.querySelector('#message-form')
        // console.log('you must provide a message')
        // }
    })


$sendLocationButton.addEventListener('click', () => {
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        const coords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        
        socket.emit('sendLocation', coords, ()=>{
            
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')

        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})