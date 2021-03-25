class Spot {
    constructor(row, col, info, colour) {
        this.colour = colour
        this.row = row
        this.col = col
        this.dirs = [[1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1], [0,-1], [1,-1]]
        this.info = info
        this.init_info()
        this.total_rows = parseInt($('#size').find(':selected').text())
        this.neighbours = []
        this.get_neighbours()
        
        this.mode = parseInt($('#mode').find(':selected').text())
        this.type = 'EMPTY'
    }

    init_info() {
        this.info.colours = {}
        this.info.rows = {}
        this.info.cols = {}
        this.info.coords = {}
    }

    get_neighbours() {
        for (let i = 0; i < this.dirs.length; i++) {
            let y = this.dirs[i][0]
            let x = this.dirs[i][1]
            
            if (0 <= this.row + y  && this.row + y < this.total_rows) {
                if (0 <= this.col + x  && this.col + x < this.total_rows) {
                    this.neighbours.push([this.row + y, this.col + x])
                }
            }
        }
    }

    is_tree() {
        return this.type == 'TREE'
    }

    is_empty() {
        return this.type == 'EMPTY'
    }

    make_tree() {
        this.type = 'TREE'
        if (this.colour in this.info.colours) {
            this.info.colours[this.colour] += 1
        }
        else {
            this.info.colours[this.colour] = 1
        }
        if (this.row in this.info.rows) {
            this.info.rows[this.row] += 1
        }
        else {
            this.info.rows[this.row] = 1
        }
        if (this.col in this.info.cols) {
            this.info.cols[this.col] += 1
        }
        else {
            this.info.cols[this.col] = 1
        }
    }

    make_empty() {
        if (this.type == 'TREE') {
            this.info.colours[this.colour] -= 1
            this.info.rows[this.row] -= 1
            this.info.cols[this.col] -= 1
        }
        this.type = "EMPTY"
    }

    trees_in_row() {
        if (this.row in this.info.rows) {
            return this.info.rows[this.row]
        }
        else {
            return 0
        }
    }

    trees_in_col() {
        if (this.col in this.info.cols) {
            return this.info.cols[this.col]
        }
        else {
            return 0
        }
    }

    trees_in_colour() {
        if (this.colour in this.info.colours) {
            return this.info.colours[this.colour]
        }
        else {
            return 0
        }
    }

    check_valid(grid) {
        if (this.type != "EMPTY") {
            return false
        }
        if (this.trees_in_row() >= this.mode) {
            return false
        }
        if (this.trees_in_col() >= this.mode) {
            return false
        }
        if (this.trees_in_colour() >= this.mode) {
            return false
        }
        for (let i = 0; i < this.neighbours.length; i++) {
            let row = this.neighbours[i][0]
            let col = this.neighbours[i][1]
            if (grid[row][col].type == 'TREE') {
                return false
            }
        }
        return true
    }
}

class Grid {
    constructor(rows, info) {
        this.rows = rows
        this.info = info
        this.grid = []
        this.make_grid()
    }

    make_grid() {
        const grid = $('#wrapper div').toArray()
        for (let i = 0; i < this.rows; i++) {
            this.grid.push([])
            for (let j = 0; j < this.rows; j++) {
                const num = i * this.rows + j
                const colour = grid[num].classList[0]
                let spot = new Spot(i, j, this.info, colour)
                this.grid[i].push(spot)
            }
        }
        this.update_info()
    }

    update_info() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                let spot = this.grid[i][j]
                if (spot.colour in this.info.coords) {
                    this.info.coords[spot.colour].push(spot)
                }
                else {
                    this.info.coords[spot.colour] = [spot]
                }
            }
        }
    }

    get_spot(row, col) {
        return this.grid[row][col]
    }

    check_covered() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j].colour == "white") {
                    return false
                }
            }
        }
        return true
    }

    clear_board() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (spot.is_tree()) {
                    spot.make_empty()
                }
            }
        }
    }

    compare_spots(spot1, spot2) {
        if (spot1.row < spot2.row) {
            return -1
        }
        if (spot1.row < spot2.row) {
            return 1
        }
        return 0
    }

    compare_arrays(arr1, arr2) {
        if (arr1.length < arr2.length) {
            return -1
        }
        if (arr1.length > arr2.length) {
            return 1
        }
        return 0
    }

    get_size_list() {
        let size = []
        let colour = this.info.coords
        for (let i = 0; i < this.rows; i++) {
            colour[COLOURS[i]].sort((a,b) => a.row - b.row)
            size.push(colour[COLOURS[i]])
        }
        size.sort((a,b) => a.length - b.length)
        return size
    }

    solve(finished, colour, size_list) {
        if (colour == size_list.length) {
            finished[0] = true
            return
        }
        let area = size_list[colour]
        for (let i = 0; i < area.length; i++) {
            let spot = area[i]
            if (spot.check_valid(this.grid) && !(finished[0])) {
                spot.make_tree()
                PLACED++
                if (spot.mode == 2) {
                    for (let j = i; j < area.length; j++) {
                        let square = area[j]
                        if (square.check_valid(this.grid)) {
                            square.make_tree()
                            this.solve(finished, colour + 1, size_list)
                            if (!finished[0]) {
                                square.make_empty()
                            }
                        }
                    }
                }
                else {
                    this.solve(finished, colour + 1, size_list)
                }
                if (!finished[0]) {
                    spot.make_empty()
                }
            }
        }
    }

    arrayToGrid() {
        const grid = $('#wrapper div').toArray()
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (this.grid[i][j].type == 'TREE' && !grid[i * this.rows + j].classList.contains('tree')) {
                    grid[i * this.rows + j].classList.add('tree')
                }
                else {
                    if (grid[i * this.rows + j].classList.contains('tree')) {
                        grid[i * this.rows + j].classList.remove('tree')
                    }
                }
            }
        }
        addTreeImage(this.rows)
    }
}

function addColourBar(num) {
    $('#colours div').remove()
    for (let i = 0; i < num; i++) {
        const colour = COLOURS[i]
        $('#colours').append(`<div class="${colour} bar"></div>`)
    }
    $('#colours div').css('width', `${600 / num}px`)
}

function addRows(num) {
    $('#wrapper div').remove()
    $('#wrapper').css('grid-template-columns', `repeat(${num}, 1fr)`)
    for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
            $('#wrapper').append('<div class="white"></div>')
        }
    }
}

function addTreeImage(num) {
    debugger
    let size = 600 / num
    $('div.tree').css('background-image', 'url("tree.png")')
    $('div.tree').css('background-size', `${size}px ${size}px`)
}

function changeMode() {
    STATUS += 1
    validExample()
}

function changeGridSize() {
    const num = parseInt($('#size').find(':selected').text())
    addRows(num)
    addColourBar(num)
    STATUS += 1
    validExample()
}

function changeColour(event) {
    $('.selected_colour').removeClass('selected_colour')
    paint_colour = event.target.classList[0]
    event.target.classList.add('selected_colour')
}

function updateGrid(target) {
    const current_classes = target.classList
    let old_colour = ''
    for (let i = 0; i < current_classes.length; i++) {
        if (current_classes[i] != "tree") {
            old_colour = current_classes[i]
            break
        }
    }

    target.classList.remove(old_colour)
    target.classList.add(paint_colour)
}

function updateLeftClick() {
    left_click = left_click != true ? true : false
}

function checkUpdateGrid(event) {
    if (left_click) {
        updateGrid(event.target)
    }
}

function disableLeftClick(event) {
    left_click = false
}

function checkStartSolver() {
    if (!$('#wrapper div.white').toArray().length) {
        if ($('#mode').find(':selected').text() == 'Select number of trees') {
            alert('Must select number of trees first')
            return
        }
        rows = parseInt($('#size').find(':selected').text())
        let info = {}
        grid = new Grid(rows, info)
        PLACED = 0
        START = Date.now() / 1000
        const size_list = grid.get_size_list()
        grid.solve([false], 0, size_list)
        grid.arrayToGrid()
        console.log('Time taken:', Math.floor(Date.now() / 1000 - START))
        console.log('Trees placed:', PLACED)
    }
    else {
        alert("Must colour all white squares first")
    }
}

function removeTrees() {
    $('div.tree').css('background-image', 'none')
    $('div.tree').removeClass('tree')
}

function resetGrid() {
    $('#wrapper div').remove()
    changeGridSize()
}

function validExample() {
    const valid_examples = {
        1 : [5, 6, 7, 8],
        2 : [9, 10, 11, 12]
    }
    let mode = parseInt($('#mode').find(':selected').text())
    let size = parseInt($('#size').find(':selected').text())
    if (STATUS >= 2 && valid_examples[mode].includes(size)) {
        $('#example').css('visibility', 'visible')
    }
    else {
        $('#example').css('visibility', 'hidden')
    }
}

function loadExample() {
    const examples = {
        5 : "0111100111023110333433344",
        6 : "000122030112030000330405354445355555",
        7 : "0011122001002300004335554433354466333333633333333",
        8 : "0011222200002222003022224455522244566622445776774447777744447777",
        9 : "001122222001133424001134444000034455000034455666634455677734485777774885777778885",
        10 : "0001112222000011222233301442223331144422311114445511111555567781156666788911666678999969997777999999",
        11 : "000112223330001111113300411111333444455563334444445663344444456673894445567778944aaa67778994aa667778999aaaaa778899aaaaa77",
        12 : "000000001122033444011122333434011122353334066662555574444666555778444666557798888866777999aaa8887999b9baa8887bbbbbbaaaa87bbbbbbbaaa87bbbbbbbaa88"
    }
    let grid = $('#wrapper div').toArray()
    size = parseInt($('#size').find(':selected').text())
    for (let i = 0; i < examples[size].length; i++) {
        grid[i].classList.remove('white')
        let colour = examples[size][i]
        if (colour == 'a') {
            colour = 10
        }
        else if (colour == 'b') {
            colour = 11
        }
        grid[i].classList.add(COLOURS[colour])
    }
}

function touchUpdateLeftClick(event) {
    console.log(event)
    event.preventDefault()
    updateGrid(event.target)
}

function touchUpdateGrid(event) {
    event.preventDefault()

    let myLocation = event.changedTouches[0];
    let realTarget = document.elementFromPoint(myLocation.clientX, myLocation.clientY);

    // This if statement doesn't work. :(
    if (!realTarget.classList.contains('bar')) {
        updateGrid(realTarget)
    }
}

$('#example').css('visibility', 'hidden')
PLACED = 0
let TIME = Date.now() / 1000
let paint_colour = 'white'
let left_click = false
const COLOURS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'light_blue', 'dirty_pink', 'navy', 'ugly_yellow', 'brown', 'pink']
let STATUS = 0
size.onchange = changeGridSize;
mode.onchange = changeMode
colours.onclick = changeColour;
wrapper.onclick = updateGrid;
wrapper.onmousedown = updateLeftClick;
wrapper.onmousemove = checkUpdateGrid;
wrapper.onmouseup = updateLeftClick;
wrapper.ontouchstart = update
wrapper.ontouchmove = touchUpdateGrid;
body.onmouseup = disableLeftClick;
solve.onclick = checkStartSolver
remove.onclick = removeTrees
reset.onclick = resetGrid
example.onclick = loadExample
