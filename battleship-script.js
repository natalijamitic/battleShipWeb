var rows = 10;
var cols = 10;
var squareSize = 50;

var NORMAL_COLOR = "#f7f8f9";

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
var shipPositions = [[["placeholder"], [], [], [], []],[["placeholder"], [], [], [], []] ];
var shipsLeft = [10, 10];

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
            $("#" + i + String.fromCharCode(65 + j)).css("background", NORMAL_COLOR);
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
            if (boards[turn][row][col] < 1)
                $("#" + row + String.fromCharCode(65 + col)).css("background", NORMAL_COLOR);
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

        var tempArray = []
        positions.forEach(element => {
            let row = element.x;
            let col = element.y;
            boards[turn][row][col] = positions.length;

            tempArray.push({x: row, y: col, hit: 0});
        })
        shipPositions[turn][positions.length].push(tempArray);
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
        localStorage.setItem("shipPositions", JSON.stringify(shipPositions));
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
            if (boards[turn][row][col] < 1)
                $("#" + row + String.fromCharCode(65 + col)).css("background", NORMAL_COLOR);
        });
        start = false;
        positions = [];
        e.stopPropagation();
    }
}



/******* GAME *******/

var MAX_HITS = 20;
var hits = [0, 0];
var first = true;

function loadBoards() {
    boards = JSON.parse(localStorage.getItem("boards"));
    shipPositions = JSON.parse(localStorage.getItem("shipPositions"));

    setName();

    $(".game").css("background-color", colors[turn]);
    
    createBoard("boardMine", 0);
    createBoard("boardTarget", 1);
    setGameListeners();
    fillTarget();
    fillMine();
}

function setGameListeners() {
    let gameBoard = document.getElementById("boardTarget");
    gameBoard.addEventListener("click", fire);
    gameBoard.addEventListener("mouseover", highlightCell);
    gameBoard.addEventListener("mouseout", normalCell);
}

function highlightCell(e) {
    if (e.target === e.currentTarget)
        return;

    let row = parseInt(e.target.id.substring(0,1));
    let col = e.target.id.substring(1,2).charCodeAt(0) - 65;

    if (boards[1-turn][row][col] < 5) {
        $(e.target).css("background", "#dddfe0")
    } 
}

function normalCell(e) {
    if (e.target === e.currentTarget)
        return;

    let row = parseInt(e.target.id.substring(0,1));
    let col = e.target.id.substring(1,2).charCodeAt(0) - 65;

    if (boards[1-turn][row][col] < 5) {
        $(e.target).css("background", NORMAL_COLOR)
    } 
}

function fillMine() {
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            let cell =  $("#" + i + String.fromCharCode(65 + j) + 0);
            cell.css("border", "1px solid rgba(41, 50, 80, 0.7)");
            if (boards[turn][i][j] >= 1 && boards[turn][i][j] <=4) {
                cell.css("background", colors[turn]);
            }
            else if (boards[turn][i][j] == 5) {
                cell.css("background", colors[turn]);
                cell.css("color", colors[1-turn]);
                cell.html("X")
            }
            else if (boards[turn][i][j] == 6) {
                cell.css("background", "rgba(41, 50, 80, 0.8)");
                cell.css("color", colors[1-turn]);
                cell.html("X")
            }
            else if (boards[turn][i][j] == 7) {
                cell.css("border", "2px solid red");
                cell.css("background", colors[turn]);
                cell.css("color", colors[1-turn]);
                cell.html("X");
            }
            else if (boards[turn][i][j] < 1) {
                cell.css("background", NORMAL_COLOR);
                cell.html("");
            }
        }
    }
}

function fillTarget() {
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            let cell =  $("#" + i + String.fromCharCode(65 + j) + 1);
            cell.css("border", "1px solid rgba(41, 50, 80, 0.7)");
            if (boards[1-turn][i][j] == 5) {
                cell.css("background", colors[1-turn]);
                cell.css("color", colors[turn]);
                cell.html("X");
            }
            else if (boards[1-turn][i][j] == 6) {
                cell.css("background", "rgba(41, 50, 80, 0.8)");
                cell.css("color", colors[turn]);
                cell.html("X");
            }
            else if (boards[1-turn][i][j] == 7) {
                cell.css("border", "2px solid red");
                cell.css("background", colors[1-turn]);
                cell.css("color", colors[turn]);
                cell.html("X");
            }
            else {
                cell.css("background", NORMAL_COLOR);
                cell.html("");
            }
        }
    }
}

function fire(e) {
    if (e.target === e.currentTarget)
        return;

    let row = parseInt(e.target.id.substring(0,1));
    let col = e.target.id.substring(1,2).charCodeAt(0) - 65;
    
    let cellVal = boards[1-turn][row][col];
    let cell = $(e.target);
    if (cellVal == 5 || cellVal == 6) {
        alert("Već je gadjano ovde.");
        return;
    }
    if (cellVal >= 1 && cellVal <= 4) {
        cell.css("background", colors[1-turn]); 
        cell.css("color", colors[turn]);
        cell.html("X");
        boards[1-turn][row][col] = 5;
        hits[turn]++;

        let wholeShip = checkSink(row, col, cellVal);

        if (hits[turn] == MAX_HITS) {
            let name = "";
            if (turn == 0)
                name = localStorage.getItem("nameF");
            else 
                name = localStorage.getItem("nameS");

            setTimeout(() => {
                alert("Svaka cast, " + name + "!\nPobeda je tvoja.\nOstalo ti je " + shipsLeft[turn] + " nepotopljenih brodova");
                startOver();
            }, 10)
        }
        else if (wholeShip) {
            setTimeout(() => {
                shipsLeft[1-turn]--;
                alert("Svaka cast, brod je potopljen!");
            }, 10)
        }
        else { 
            setTimeout(() => {
                alert("Svaka cast, brod je pogodjen!");
            }, 100)
        }
    }
    else {
        cell.css("background", "rgba(41, 50, 80, 0.8)");
        cell.css("color", colors[turn]);
        cell.html("X");
        boards[1-turn][row][col] = 6;
        
        setTimeout(() => {
            alert("Pokusaj ponovo");
            changePlayer();
        }, 100)
    }
}

function changePlayer() {
    turn = 1 - turn;
    setName();
    $(".game").css("background-color", colors[turn]);
    fillMine();
    fillTarget();
}

function startOver() {
    localStorage.removeItem("nameF");
    localStorage.removeItem("nameS");
    localStorage.removeItem("boards");
    localStorage.removeItem("shipPositions");

    window.location.href = "battleship-welcome.html";
}

function checkSink(row, col, cellVal) {
    let myI = -1;
    let bSink = true;
    for (i = 0; i < shipPositions[1-turn][cellVal].length; i++) {
        for (j = 0; j < shipPositions[1-turn][cellVal][i].length; j++) {
            if (shipPositions[1-turn][cellVal][i][j].x == row && shipPositions[1-turn][cellVal][i][j].y == col) {
                shipPositions[1-turn][cellVal][i][j].hit = 1;
                myI = i;
                break;
            }
        }
        if (myI != -1) {
            break;
        }
    }

    if (myI != -1) {
        for (k = 0; k < shipPositions[1-turn][cellVal][i].length; k++) {
            if (shipPositions[1-turn][cellVal][i][k].hit == 0) {
                bSink = false;
            }
        }
    }

    if (bSink) {
        for (k = 0; k < shipPositions[1-turn][cellVal][i].length; k++) {
            let x = shipPositions[1-turn][cellVal][i][k].x;
            let y = shipPositions[1-turn][cellVal][i][k].y;
            let cell =  $("#" + x + String.fromCharCode(65 + y) + 1);
            cell.css("border", "2px solid red");
            boards[1-turn][x][y] = 7;
        }
    }
    return bSink;
}