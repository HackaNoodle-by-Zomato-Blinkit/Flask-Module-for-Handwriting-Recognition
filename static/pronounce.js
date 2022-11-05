const textInputField = document.querySelector("#text-input")
const form = document.querySelector("#form")
const utterThis = new SpeechSynthesisUtterance()
const synth = window.speechSynthesis
let ourText = ""

const checkBrowserCompatibility = () => {
  "speechSynthesis" in window
    ? console.log("Web Speech API supported!")
    : console.log("Web Speech API not supported :-(")
}


let words = ["bad","Chess"]


checkBrowserCompatibility()
let start_button = document.getElementById("start")
let pronounce_button = document.getElementById("pronounce")
let end_button = document.getElementById("end")
let heading = document.getElementById("word")
let heading1 = document.getElementById("score")
let heading2 = document.getElementById("guess")
let next_button = document.getElementById("next")
let load1 = document.getElementById("load1")
let load2 = document.getElementById("load2")

load1.style.display = "none"
load2.style.display = "none"

function check_conditions(){
  if (localStorage.getItem("index") === null){
    start_button.disabled = false
    pronounce_button.disabled = true
    end_button.disabled = true
    next_button.disabled = true
    heading.innerHTML = "You have not started this test"
  
  }else if(parseInt(localStorage.getItem("index")) === words.length - 1){
    start_button.disabled = true
    pronounce_button.disabled = true
    end_button.disabled = false
    next_button.disabled = true
  
  }else{
      start_button.disabled = true
      pronounce_button.disabled = false
      next_button.disabled = false
      end_button.disabled = false
      heading.innerHTML = `You are at ${parseInt(localStorage.getItem("index")) + 1}th word.`
  
  
  }
}


check_conditions()

async function next_word(){
  check_conditions()
  let index = localStorage.getItem("index")
  console.log(index)

  if (index === null){
    localStorage.setItem("index",0)
    localStorage.setItem("score",0)
    window.location.reload()
  }

  else {
    load1.style.display = "block"
    load2.style.display = "block"
    index = parseInt(index)
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

   fetch(`http://localhost:8080/save_image?id=${index}&word=${words[index]}`, requestOptions)
      .then(response => response.text())
      .then((data) => {
        let result = JSON.parse(data)
        let previous_score = parseInt(localStorage.getItem("score"))
        previous_score = previous_score + result["Score"]
        localStorage.setItem("score",previous_score)
        index++;
        localStorage.setItem("index",index)
        if(parseInt(localStorage.getItem("index")) !== words.length)
        heading.innerHTML = `You are at ${parseInt(localStorage.getItem("index")) + 1}th word. (There are total 2 words)`
        else 
        heading.innerHTML = "You are done !!! (Click on end test button to end the test)"

        heading2.innerHTML = "Your Previous Written Word was: " + result["Word"]
        heading1.innerHTML = `You current score is: ${previous_score}`
        load1.style.display = "none"
        load2.style.display = "none"
        // window.location.reload()
      })
      .catch(error => console.log('error', error));
      }
  

}

function speak(){
  let index = localStorage.getItem("index")
  utterThis.text = words[index]
  synth.speak(utterThis)
}
