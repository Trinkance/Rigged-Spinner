// with some help from https://codepen.io/hardik-shah/pen/xxbVzya?editors=0010

function getById(id) {
    return document.getElementById(id)
}

// variables
const canvas = getById("canvas")

let canvasSize = 500
let spinnerRadius = (canvasSize / 2) - 10
let center = canvasSize / 2

let data = []

// canvas
const ctx = canvas.getContext("2d")

function deg2rad(deg) {
    return deg * Math.PI / 180
}

function rad2deg(rad) {
  return rad * (180 / Math.PI)
}

// create lines
function updateLines() {
    ctx.save()

    ctx.translate(canvasSize / 2, canvasSize / 2)

    // clear
    ctx.clearRect(-canvasSize / 2, -canvasSize / 2, canvasSize, canvasSize)

    // create base circle
    ctx.lineWidth = 4
    ctx.strokeStyle = "white"

    ctx.beginPath()
    ctx.arc(0, 0, spinnerRadius, 0, 2 * Math.PI)
    ctx.stroke()

    // setup data
    let dataWeight = 0
    for (let i = 0; i < data.length; i++) {
        let v = data[i]
        dataWeight += v.weight
    }

    // create lines
    if (data.length > 0) {
        let startingPercent = 0
        for (let i = 0; i < data.length; i++) {
            // line
            let v = data[i]
            let percent = (v.weight / dataWeight) * Math.PI * 2
            let pos = startingPercent
        
            let circX = Math.cos(pos) * spinnerRadius
            let circY = Math.sin(pos) * spinnerRadius
        
            if (data.length > 1) {
                ctx.lineWidth = 2
                ctx.moveTo(0, 0);
                ctx.lineTo(circX, circY);
                ctx.lineCap = "square";
                ctx.stroke()

                /*
                console.log(pos)
                ctx.fillStyle = v.color
                ctx.moveTo(center, center)
                ctx.arc(center, center, center, deg2rad(pos), deg2rad(pos + percent), false)
                ctx.lineTo(center, center)
                ctx.fill()
                */

                startingPercent += percent
            }
        
            // text
            let midPos = pos + (percent / 2)

            data[i].startAngle = percent
            data[i].endAngle = startingPercent
            data[i].midAngle = midPos

            ctx.font = "16px Verdana"
            ctx.fillStyle = "white"

            let r = midPos

            ctx.save()
            ctx.translate(0, 0)
            ctx.rotate(r)
            ctx.textAlign = "right"
            ctx.fillText(v.name, spinnerRadius - 20, 10)
            ctx.restore()
        }

        console.log(startingPercent)
    }

    ctx.restore()
}

updateLines()

// data
let dataAddButton = getById("data-add")
let dataContainer = getById("data-list")

function createData(customName, customWeight) {
    customName = customName || "name"
    customWeight = customWeight || 1

    let color = "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 80%)"

    let sample = document.createElement("div")
    sample.className = "data"

    let weightInput = document.createElement("input")
    weightInput.type = "text"
    weightInput.className = "data-weight"
    weightInput.value = customWeight

    let nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.className = "data-name"
    nameInput.value = customName

    let deleteButton = document.createElement("h1")
    deleteButton.innerText = "x"
    deleteButton.className = "data-delete"
    
    sample.appendChild(nameInput)
    sample.appendChild(weightInput)
    sample.appendChild(deleteButton)
    dataContainer.appendChild(sample)

    function blurOnEnter(obj) {
        obj.onkeydown = function(event) {
            if(event.keyCode == 13) {
                obj.blur()
                return false
            }
        }
    }

    blurOnEnter(weightInput)
    blurOnEnter(nameInput)

    let dataTab = {
        object: sample,
        weight: customWeight,
        name: nameInput.value,
        color: color
    }

    function findDataIndex() {
        for (let i = 0; i < data.length; i++) {
            let v = data[i]
            console.log(v.name,dataTab.name)
            if (v.object == sample) {
                return i
            }
        }
    }

    data[data.length] = dataTab

    function updateData() {
        let i = findDataIndex()
        data[i] = dataTab

        updateLines()
    }

    function deleteData() {
        let i = findDataIndex()
        data.splice(i, 1)

        updateLines()
    }

    weightInput.onchange = function() {
        if (isNaN(weightInput.value.substring(weightInput.length - 1,weightInput.length))) {
            weightInput.value = 1
        }
        
        dataTab.weight = Number(weightInput.value)
        updateData()
    }

    nameInput.onchange = function() {
        if (nameInput.value == "") {
            nameInput.value = "name"
        }

        dataTab.name = nameInput.value
        updateData()
    }

    deleteButton.onclick = function() {
        sample.remove()
        deleteData()
    }

    updateLines()

    sample.onmouseover = function() {
        for (let i = 0; i < data.length; i++) {
            let v = data[i]
            if (v.object == sample) {
                sample.classList.add("data-hover")
            } else {
                v.object.classList.remove("data-hover")
            }
        }
    }
}

dataAddButton.onclick = function() {
    createData()
}

for (let i = 1; i <= 6; i++) {
    createData("item" + i)
}

// spinny
let spinning = false
canvas.onclick = function() {
    if (!spinning) {
        let riggedIndex = null // rigging it to troll my friend l bozo
        for (let i = 0; i < data.length; i++) {
            let v = data[i]
            if (v.object.classList.contains("data-hover")) {
                riggedIndex = i
            }

            v.object.classList.remove("data-hover")
        }

        spinning = true

        let force = 10 * (1 + Math.random())
        let multi = 0.995
        let rotate = 0
        if (riggedIndex != null) {
            let v = data[riggedIndex]

            let mid = v.midAngle
            let midAngle = rad2deg(-mid) - 100 // + ((Math.random() * 2) - 1) * 10
            rotate = midAngle
            force = 10

            console.log(1, mid, midAngle)
        } else {
            rotate = ((Math.random() * 2) - 1) * 180
            console.log(2, rotate)
        }

        //canvas.style.transform = "rotate(" + rotate + "deg)"
        let spin = setInterval(() => {
            force *= multi
            rotate += force

            canvas.style.transform = "rotate(" + rotate + "deg)"
            if (force <= 0.01) {
                spinning = false
                clearInterval(spin)
            }
        }, 1);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code == "Escape") {
        for (let i = 0; i < data.length; i++) {
            let v = data[i]
            v.object.classList.remove("data-hover")
        }
    }
});