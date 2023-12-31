const beep = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz is a common frequency for a beep
  oscillator.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1); // Adjust the duration of the beep (in seconds)
};
const defineBlock = ({heading, duration, action, speech}) => {
  return {heading, duration, action, speech}
}
const setBackgroundColor = (color, percentage) => {
  document.documentElement.style.background = `linear-gradient(to bottom, ${color} ${percentage}%, white)`;
};
const hanging = ({percentage}) => {
  setBackgroundColor('#f23c06', percentage)
}
const resting = ({percentage}) => {
  setBackgroundColor('#90cbf3', percentage)
}
const pausing = ({percentage}) => {
  setBackgroundColor('#9cb806', percentage)
}
const ready = ({percentage}) => {
  setBackgroundColor('#fef764', percentage)
}
const READY_TIME = 4
const REST_TIME = parseInt(getById('repRest').value)
const BREAK_TIME = parseInt(getById('setRest').value) - READY_TIME
const REP_DURATION = parseInt(getById('duration').value)
const NUM_OF_REPS = parseInt(getById('repetitions').value)
const FOUR_FINGER_DRAG = defineBlock({
  heading: `Four Fingers`,
  duration: REP_DURATION,
  speech: `Four Fingers`
})
const THREE_FINGER_DRAG = defineBlock({
  heading: `Three Fingers`,
  duration: REP_DURATION,
  speech: `Three Fingers`
})
const HEADING = "title"
const TIMER = "timer"

let startTime = new Date();
let start = 0, end = 0, index = undefined, sets = undefined, intervalId

function getById(elementId) {
  return document.getElementById(elementId);
}

const setContent = (elementId, content) => {
  getById(elementId).innerHTML = content
};

function updateScreen(action, secs = 0, start = 0, end = 0) {
  if (action !== undefined) {
    const percentage = (secs - start) / ((end - start) + 1) * 100;
    console.log("" + percentage)
    action({percentage})
  }
}

let lastAction = undefined;

const updateTimer = () => {
  let current = new Date();
  const millis = current - startTime;
  const secs = Math.floor(millis / 1000);
  if (secs >= end) {
    if (index === undefined || index < 0) {
      index = 0
    } else if (index >= sets.length) {
      clearInterval(index)
      setContent(HEADING, '<div>Done</div>')
      setContent(TIMER, '')
      clearTimeout(intervalId)
      updateScreen(lastAction, secs, start, end)
      return
    } else {
      index++
    }
    const {heading, duration, action} = sets[index]
    if (action !== undefined) {
      lastAction = action;
    }
    start = secs
    end = secs + duration
    console.dir(`index=${index} heading=${heading} duration=${duration} index=${index} secs=${secs} end=${end}`)
    const {speech} = sets[index]
    setContent(HEADING, `<div>${heading}</div>`)
    if (speech !== undefined) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(speech))
      console.dir(`Speech=${speech}`)
    }
  }
  updateScreen(lastAction, secs, start, end)
  const {heading} = sets[index]
  setContent(HEADING, `<div>${heading}</div>`)
  setContent(TIMER, `<div>${Math.abs(end - secs)}</div>`)
  setContent("countdown",  formatTimeDifference(startTime, current))
};
const formatTimeDifference = (startTime, currentTime) => {
  const timeDifference = Math.floor((currentTime - startTime) / 1000); // in seconds

  const minutes = Math.floor(timeDifference / 60);
  const seconds = timeDifference % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};
const defineSets = () => {
  const array = []

  function addSet(value) {
    array.push(defineBlock({heading: "Get ready: ", duration: READY_TIME, speech: "Get Ready", action: ready}))

    array[array.length - 1].heading += value.heading
    for (let i = 0; i < NUM_OF_REPS; i++) {

      const definition = {...value};
      definition.heading = `${value.heading} ${NUM_OF_REPS - i}`
      definition.action = hanging
      array.push(definition)
      if (i + 1 < NUM_OF_REPS) {
        array.push(defineBlock({
          heading: `Rest`, duration: REST_TIME - READY_TIME, action: pausing
        }))
        array.push(defineBlock({heading: "Get ready: ", duration: READY_TIME, speech: "Get Ready", action: ready}))
      }
    }
    array.push(defineBlock({
      heading: `Break: `, duration: BREAK_TIME, action: resting
    }))
    return array
  }

  addSet(THREE_FINGER_DRAG)
  addSet(FOUR_FINGER_DRAG)
  addSet(THREE_FINGER_DRAG)
  addSet(FOUR_FINGER_DRAG)
  array.length = array.length - 1
  array.push(defineBlock({
    heading: `Done`, duration: 0
  }))
  return array
};

function startWorkout() {
  getById("configuration").style.visibility = "hidden";
  getById(HEADING).onclick = () => {
  }
  getById("prev").onclick = () => {
    if (index > 1) {
      index = index - 2
      end = 0
      updateTimer()
    }
  }
  getById("next").onclick = () => {
    if (index < sets.length - 1) {
      end = 0
      updateTimer()
    }
  }
  sets = defineSets()
  console.dir(sets)
  intervalId = setInterval('updateTimer()', 1000);
}

setContent(HEADING, 'Get weights and bands for the breaks')

getById(HEADING).onclick = startWorkout

setContent(TIMER, '<div>Start</div>')
getById(TIMER).onclick = () => {
  startWorkout()
}
const startButton = getById('timer').firstChild;
startButton.style.backgroundColor = 'cornflowerblue'
startButton.style.border = '2px solid #030d52';
startButton.style.color = 'white';