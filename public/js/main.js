// --- Imports
import { Grid, rand } from "./Grid.js";
import { Shower } from "./Shower.js";


// --- Variables
var id = Math.floor(Math.random() * 1000);
var name = prompt("Your name");
var grid;
var choice = null;

var buttons = [];
var alive = false;

var difficulties = ["EASY", "NORMAL", "HARD"];
var difficulty;

var seconds = 0;
var timerText = document.getElementById("timer");
var percentText = document.getElementById("percent");

var opponents = [];


// --- Main
window.onload = () => {
    let createLobby = document.getElementById("create_lobby");
    let lobbyCode = document.getElementById("lobby_code");
    let joinLobby = document.getElementById("join_lobby");
    let leaveLobby = document.getElementById("leave_lobby");
    let getCode = document.getElementById("get_code");
    let messageAll = document.getElementById("message_all");
    let msgCon = document.getElementById("msgs-con");
    let codeView = document.getElementById("lobby-code-view");
    let peopleCon = document.getElementById("people");
    let gen = document.getElementById("gen");

    gen.onclick = async () => {
        difficulty = difficulties[rand(difficulties.length)];
        grid = new Grid(difficulty);
        grid.create();

        $$$.all("start", {id, msg : grid});
    }

    joinLobby.onclick = async () => {
        try {
            let a = await $$$.join(id);
            actionReport("", a, msgCon);
        }
        catch (err) {
            console.log(err);
            errorReport("", err.msg, msgCon);
        }

        try {
            let code = lobbyCode.value;
            let a = await $$$.enter(id, code, name);
            actionReport("", a, msgCon);
            codeView.innerHTML = code;
            let people = await $$$.people(id);
            viewPeople(people, peopleCon);
        }
        catch (err) {
            console.log(err)
            errorReport("", err.msg, msgCon);
        }
    }

    createLobby.onclick = async () => {
        try {
            let a = await $$$.join(id);
            actionReport("", a, msgCon);
        }
        catch (err) {
            console.log(err);
            errorReport("", err.msg, msgCon);
        }

        try {
            let a = await $$$.create(id, name);
            actionReport("", "Lobby code is: " + a.code, msgCon);
            codeView.innerHTML = a.code;            
        }
        catch (err) {
            console.log(err)
            errorReport("", err.msg, msgCon);
        }
    }

    leaveLobby.onclick = async () => {
        try {
            let a = await $$$.leave(id);
            actionReport("", "You have left the lobby " + a.code, msgCon);
            codeView.innerHTML = "N/A";
            people.innerHTML = "";
        }
        catch (err) {
            console.log(err)
            errorReport("", err.msg, msgCon);
        }
    }

    $$$.socket.on("new_entry", (data) => {
        actionReport("", data.msg, msgCon);
        document.getElementById("people").innerHTML += `
            <div class = 'person' id = 'i${data.id}'>
                <img src = './img/demo/${data.index}.svg' width="200px">
            </div>
        `
    });

    $$$.socket.on("left", (data) => {
        actionReport("", data.msg, msgCon);
        document.getElementById("i" + data.id).remove();
    });

    $$$.socket.on("start", (data) => {
        let old = data.msg; 
        difficulty = old.difficulty;

        grid = new Grid(difficulty);
        grid.set(old);
        grid.delete();

        showGIF(false);
        alive = true;
        gen.hidden = true;

        setGrid();
        setNumbers();
        setDisplays();

        seconds = 0;
        timerText.innerHTML = "00:00:00";        
        setTimeout(timer, 1000);

        winner.innerHTML = "";
    });

    $$$.socket.on("put", (data) => {
        for (let i = 0; i < opponents.length; i++)
            if (opponents[i].id == data.id) {
                opponents[i].update(data.msg);
                break;
            }
    });

    $$$.socket.on("win", (data) => {
        alive = false;
        gen.hidden = false;

        setTimeout(showGIF(true), 2000);
        
        if (data.id == id) {
            let winner = document.getElementById("winner");
            winner.innerHTML = "You is winner!";

        } else 
            for (let i = 0; i < opponents.length; i++)
                if (opponents[i].id == data.id) {
                    let winner = document.getElementById("winner");
                    winner.innerHTML = opponents[i].name + " is winner!";
                    break;
                }
    });

    $$$.socket.on("looser", (data) => {
        if (data.id == id) {
            let looser = document.getElementById("status");
            looser.innerHTML = "You is looser!";
            setTimeout(() => {  looser.innerHTML = ""; }, 2000);

        } else 
            for (let i = 0; i < opponents.length; i++)
                if (opponents[i].id == data.id) {
                    opponents[i].status(1);
                    setTimeout(() => {  opponents[i].status(0); }, 2000);
                    break;
                }
    });
}

window.onbeforeunload = function() {
    alert("");
    return "STOP";
}


// --- Defs
// MAIN
function setGrid() {
    let diffText = document.getElementById("diff");
    diffText.innerHTML = difficulty;

    percentText.innerHTML = grid.percent() + "%";

    grid.show();

    for (let i = 0; i < 9; i++)
        for (let j = 0; j < 9; j++) {
            grid.buttons[i][j].onclick = () => {
                if (choice == grid.buttons[i][j]) {
                    choice = null;
                    grid.highlight(choice, null, null);
                } else {
                    choice = grid.buttons[i][j];
                    grid.highlight(choice, choice.id.split(",").map(Number), choice.innerHTML);
                }  
            }
        }
}

// GAME
function setNumbers() {
    let numbers = document.getElementById("numbers");

    numbers.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        let button = document.createElement('button');
        button.id = (i+1);
        button.className = "numbers";
        button.innerHTML = (i+1);
        button.addEventListener("click", putNumber, false);

        numbers.appendChild(button);
        buttons.push(button);

        if (grid.counter(i+1))
            button.disabled = true;
    }
}

function putNumber() {
    if (choice != null) {
        let pos = choice.id.split(",").map(Number);
        
        grid.put(pos, this.innerHTML);
        
        percentText.innerHTML = grid.percent() + "%";

        isCounter();
        grid.highlight(choice, choice.id.split(",").map(Number), choice.innerHTML);

        $$$.all("put", {id, msg : grid.display});
    }

    if (grid.isWin())
        $$$.all("win", {id, msg : grid.display});
    else if (grid.percent() == 100)
        $$$.all("looser", {id, msg : grid.display});
}

window.erase = () => {
    if (choice != null) {
        let pos = choice.id.split(",").map(Number);

        let wrote = grid.display[pos[0]][pos[1]];
        if (wrote != grid.cellEmpty)
            buttons[parseInt(wrote)-1].disabled = false;
        
        grid.put(pos, grid.cellEmpty);

        $$$.all("put", {id, msg : grid.display});
    }
}

function isCounter() {
    for (let i = 0; i < 9; i++)
        buttons[i].disabled = grid.counter(i+1);
}

// END GAME
function showGIF(state) {
    let play = document.getElementById("playable");
    let gif = document.getElementById("gif");

    play.hidden = state;
    gif.hidden = !state;
}

// TIMER
function timer() {
    seconds += 1;

    let minutes = parseInt(seconds / 60).toString().padStart(2, "0");
    let hours = parseInt(seconds / 3600).toString().padStart(2, "0");

    timerText.innerHTML = hours + ":" + minutes + ":" + (seconds % 60).toString().padStart(2, "0");

    if (alive)
        setTimeout(timer, 1000);
}

// SERVER
async function setDisplays() {
    let people = await $$$.getNames(id);
    let names = printPeople(people);

    let opponentsText = document.getElementById("opponents");
    opponentsText.innerHTML = "";

    for (let i = 0; i < names.length; i++) {
        let opponent = new Shower(names[i][0], names[i][1], grid.display, grid.cellEmpty);
        opponents.push(opponent);
    }
}

const errorReport = (title, msg, chat, container) => {
    chat.innerHTML += `<p class = 'error-report'>${msg}</p>`;
    chat.scrollTop = chat.scrollHeight;
}

const actionReport = (title, msg, chat, container) => {
    chat.innerHTML += `<p class = 'action-report'>${msg}</p>`;
    chat.scrollTop = chat.scrollHeight;
}

const viewPeople = (people_, container) => {
    let i = 0;
    container.innerHTML = "";
    people_.forEach(person => {
        container.innerHTML += `<div class = 'person' id = 'i${person}'>
                <img src = './img/demo/${i}.svg' width="200px">
            </div>`;
        i++;
    })
}

const printPeople = (people_) => {
    let names = new Array();
    for (let i = 0; i < people_.users.length; i++)
        if (people_.users[i] != id)
            names.push([people_.users[i], people_.names[i]]);
    return names;
}