import bot from './assets/bot.svg';
import user from './assets/user.svg';

// target form
const form = document.querySelector('form');
// target chat container
const chatContainer = document.querySelector('#chat_container');

// empty variable for loading
let loadInterval

// functionality for the loader while bot is thinking of answer
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.';

    // if loader has printend 3 dots, then reset
    if(element.textContent === '....') {
        // reset to empty string
        element.textContent = '';
    }

  }, 300);
}

// functionality for typing text letter by letter
function typeText(element, text) {

  let index = 0;

  let interval = setInterval(() => {
    // check if we are still typing
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      //increment
      index++
    } else {
      clearInterval(interval)
    }

  }, 20) // every 20 miliseconds

}

// generate unique ID for each message in order to be able to map over them
function generateUniqueId() {
  // get current date
  const timestamp = Date.now();
  // get random number
  const randomNumber = Math.random();
  // hexadecimal number
  const hexadecimalString = randomNumber.toString(16);

  // generate id
  return `id-${timestamp}-${hexadecimalString}`;

}

// functionality for chat stripe with on user and bot
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

// submit handle for AI generated responsve
const handleSubmit = async (e) => {
  // prevent browser reload
  e.preventDefault()

  // grab form data
  const data = new FormData(form)

  // generate users chat
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  // clear text area input
  form.reset();

  // generate bots chat
  // first generate it's unique ID
  const uniqueId = generateUniqueId()
  // generate stripe for bot
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // move screen as chat is generated
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // fetch newly created div
  const messageDiv = document.getElementById(uniqueId)

  // turn loader and pass message
  loader(messageDiv);

  // fetch data from server
  const response = await fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: data.get('prompt')
    })
  })

  // after load is completed clear interval
  clearInterval(loadInterval);
  // set message div as empty string
  messageDiv.innerHTML = " "

  // conditional if we get data from server
  if (response.ok) {

    const data = await response.json();
    // parse response
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
    // run type text
    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()
    // error message
    messageDiv.innerHTML = "Bob did boo-boo";
    // alert the error
    alert(err)
  }

}

// to see submissions call event listener
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
