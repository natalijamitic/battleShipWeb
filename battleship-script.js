var rows = 10;
var cols = 10;
var squareSize = 50;

function testInput() {
    let name1 = document.getElementById("firstPlayer");
    let name2 = document.getElementById("secondPlayer");

    let nameF = name1.value;
    let nameS = name2.value;
    
    let pattern = /^\w{3,15}$/

    if (!nameF.match(pattern) || !nameS.match(pattern)) {
        alert("Ime mora biti duzine 3 do 15 karaktera i sme sadrzati iskljucivo slova, brojeve i donje crte.")
        name1.value = "";
        name2.value = "";
    }
    else {
        localStorage.setItem("nameF", nameF);
        localStorage.setItem("nameS", nameS);
        window.location.href = "battleship-setup.html";
    }
}


/******** SETUP *******/

var turn = 0;
var ships = [0, 4, 3, 2, 1];
var colors = ["#6DD47E", "#FFD55A"];
var boards =[
    [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
    ]
];
var start = false;
var finish = false;
var positions = [];

function fillSetupFirst() {
    $(".setup").css("background-color", colors[turn]);

    setName();
    
    if (turn == 0) {
        createBoard("board");
        setSetupListeners("board");
    }
    else
        freeBoard();

    setShipCnt();
}

function setName() {
    let name = "nameF"
    if (turn == 1) {
        name = "nameS"
        
    }
    $("#playerName").html(localStorage.getItem(name));
}

function createBoard(boardName, turn = -1) {
    let gameBoard = document.getElementById(boardName);
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            let square = document.createElement("div");
            gameBoard.appendChild(square);
            square.id = (j) + String.fromCharCode(65+i);
            if (turn !== -1) {
                square.id += turn;
            }
            square.style.top = (j * squareSize) + "px";
            square.style.left = (i * squareSize) + "px";
        }
    }
}

function setSetupListeners(boardName) {
    let gameBoard = document.getElementById(boardName);
    gameBoard.addEventListener("mousedown", startPlacingShip);
    gameBoard.addEventListener("mouseup", finishPlacingShip);
    gameBoard.addEventListener("mouseover", colorShip);
    gameBoard.addEventListener("contextmenu", nothing);
}

function freeBoard() {
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            $("#" + i + String.fromCharCode(65 + j)).css("background", "#f6f8f9");
        }
    }    
}

function setShipCnt() {
    ships.forEach((ship, index) => {
        if (index != 0)
            $("#ship" + index).html(ship);
    })
}

function nothing(e) {
    e.preventDefault();
}

function startPlacingShip(e) {
    if (start)
        return;
    
    if (e.target === e.currentTarget)
        return;

    positions = [];

    let position = {
        x : parseInt(e.target.id.substring(0,1)),
        y : e.target.id.substring(1,2).charCodeAt(0) - 65
    }
    positions.push(position)
    
    e.target.style.background = colors[turn];
    start = true;
}

function finishPlacingShip(e) {
    if (!start)
        return;
    
    let bOk = true;

    if (e.target === e.currentTarget) {
        bOk = false;
    }
    else if (positions.length < 1 || positions.length > 4) {
        bOk = false;
    }
    else if (ships[positions.length] == 0) {
        bOk = false;
    }
    else {
        let sameRow = true;
        let sameCol = true;

        for (i = 0; i < positions.length; i++) {
            let row = positions[i].x;
            let col = positions[i].y;
            if (boards[turn][row][col] != 0) {
                bOk = false 
                break;
            }

            if (i != 0) {
                let prevRow = positions[i-1].x;
                let prevCol = positions[i-1].y;
                if (prevRow != row) {
                    sameRow = false;
                }
                if (prevCol != col) {
                    sameCol = false;
                }
                if (!sameCol && !sameRow) {
                    bOk = false;
                    break;
                }
            }
        }
    }
    
    if (!bOk) {
        positions.forEach(element => {
            let row = element.x;
            let col = element.y;
            if (boards[turn][row][col] != 1)
                $("#" + row + String.fromCharCode(65 + col)).css("background", "#f6f8f9");
        });
        
    }
    else {
        ships[positions.length]--;
        $("#ship" + positions.length).html(ships[positions.length]);
        positions.forEach(element => {
            let row = element.x;
            let col = element.y;
            boards[turn][row][(col == 0) ? col : col - 1] = -1;
            boards[turn][row][(col == cols - 1) ? col : col + 1] = -1;
            boards[turn][(row == 0) ? row : row - 1][col] = -1;
            boards[turn][(row == rows - 1) ? row : row + 1][col] = -1;
            boards[turn][(row == 0) ? row : row - 1][(col == 0) ? col : col - 1] = -1;
            boards[turn][(row == 0) ? row : row - 1][(col == cols - 1) ? col : col + 1] = -1;
            boards[turn][(row == rows - 1) ? row : row + 1][(col == 0) ? col : col - 1] = -1;
            boards[turn][(row == rows - 1) ? row : row + 1][(col == cols - 1) ? col : col + 1] = -1;

        });

        positions.forEach(element => {
            let row = element.x;
            let col = element.y;
            boards[turn][row][col] = 1;
        })
    }

    start = false;
    positions = [];

    finish = !ships.some(ship => ship !== 0);
    if (finish && turn == 0) {
        ships = [0, 4, 3, 2, 1];
        turn = 1;
        fillSetupFirst();   
    }
    else if (finish && turn == 1) {
        localStorage.setItem("boards", JSON.stringify(boards));
        window.location.href = "battleship-game.html";
    }
}

function colorShip(e) {
    if (e.target !== e.currentTarget) {
        if (start) {
            let position = {
                x : parseInt(e.target.id.substring(0,1)),
                y : e.target.id.substring(1,2).charCodeAt(0) - 65
            }
            positions.push(position)
            e.target.style.background = colors[turn];
        }
    }
    else {
        positions.forEach(element => {
            let row = element.x;
            let col = element.y;
            if (boards[turn][row][col] != 1)
                $("#" + row + String.fromCharCode(65 + col)).css("background", "#f6f8f9");
        });
        start = false;
        positions = [];
        e.stopPropagation();
    }
}