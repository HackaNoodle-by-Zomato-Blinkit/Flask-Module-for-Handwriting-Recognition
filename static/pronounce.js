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


let words = ["Hello","Bye","Chor","Checker","Socket","TemporaryChor","Misha","Isha","Chiku","Champu"]


checkBrowserCompatibility()
let start_button = document.getElementById("start")
let pronounce_button = document.getElementById("pronounce")
let end_button = document.getElementById("end")
let heading = document.getElementById("word")
let next_button = document.getElementById("next")
let load1 = document.getElementById("load1")
let load2 = document.getElementById("load2")

load1.style.display = "none"
load2.style.display = "none"



if (localStorage.getItem("index") === null){
  start_button.disabled = false
  pronounce_button.disabled = true
  end_button.disabled = true
  next_button.disabled = true
  heading.innerHTML = "You have not started this test"

}else if(localStorage.getItem("index") === words.length){

  start_button.disabled = true
  pronounce_button.disabled = true
  end_button.disabled = false
  next_button.disabled = true
  heading.innerHTML = "You are done !!! (Click on end test button to end the test)"

}else{
    start_button.disabled = true
    pronounce_button.disabled = false
    next_button.disabled = false
    end_button.disabled = false
    heading.innerHTML = `You are at ${localStorage.getItem("index")}th word. (There are total 10 words)`


}

async function next_word(){
  let index = localStorage.getItem("index")
  if (index === null){
    index = 0 
  }else {
    load1.style.display = "block"
    load2.style.display = "block"
    index = parseInt(index)
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

   fetch(`http://localhost:8080/save_image?id=${index}`, requestOptions)
      .then(response => response.text())
      .then((result) => {
        console.log(result)
        index++;
        localStorage.setItem("index",index)
        heading.innerHTML = `You are at ${localStorage.getItem("index")}th word. (There are total 10 words)`
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
