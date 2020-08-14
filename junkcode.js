//UNUSED CODE -- INCOMPLETE OR UNECESSARY

//==========JUNK CODE==========//
//Not used in the solution, but still here if needed

//ts();
/*
let tscount = 0;

function ts() {
    //document.getElementById('jax').innerHTML = '<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">';
    console.log("e");
    //document.getElementById('jax').removeChild(document.getElementById('MathJax-script'));
    //document.getElementById('jax').appendChild(document.getElementById('MathJax-script'));
    tscount++;
    output.innerHTML = "\\("+tscount+"\\)";
}
*/

//IDEA --- RELOAD PAGE WHEN ACTIVIATING REACT FUNCTION
//setInterval(ts, 2000);
    /*
    let display = "\\(";
    
    //Forms the LaTeX output, FAULTY
    const formLaTex = (set) => {
        for (let n in set[0]) {
            let string = set[0][n].formula.split("");
            for (let c in string) {
                if (parseInt(string[c]).toString() != "NaN") {
                    string[c] = "_{" + string[c]+"}";
                }
            }

            let state = "";
            if (set[4][n] == null) {
                state = equation.getState(set[0][n], true);
                set[4][n] = state;
            }
            else {
                state = set[4][n];
            }

            string = string.join("") + "\\ _{(" + state + ")}";

            let tempion = Math.abs(set[0][n].ion);
            if (tempion == 1){tempion = "";}

            if (set[0][n].ion < 0) { string += "^{-" + tempion + "}"; }
            else if (set[0][n].ion > 0) { string += "^{+" + tempion + "}"; }

            let ratio = "";
            if (set[1][n] > 1) { ratio = set[1][n]; }

            display += ratio + string + "+";
        }
    }

    //Forms the reactants part of the output
    formLaTex(equation.reactants);

    //Remove the + sign at the end of the display string
    display = display.split(""); display.pop(); display = display.join("");

    //Display the products
    if (displayproducts){
        if (!equation.isDynamic) {
            display += "\\rightarrow ";
        } else {
            display += "\\leftrightharpoons ";
        }
        formLaTex(equation.products);
        display = display.split(""); display.pop(); display = display.join("");
    }
    display += "\\)";

    return display;
    */

//=======JUNK ALGORITHIMS=======//
//Full of unused algoritims - May or may not work

function shuffle(array, num) {
    for (var i = 0; i < num; i++) {
        var a = Math.round(Math.random() * (array.length - 1));
        var b = Math.round(Math.random() * (array.length - 1));
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
    return array;
}

function binarySearch(array, num) {
    let min = 0;
    let max = array.length - 1;
    let found = false;
    let mid = Math.round((min + max) / 2);
    let index = -1;
    while (!found && max >= min) {
        if (num == array[mid]) {
            found = true
            index = mid;
        } else if (num < array[mid]) {
            max = mid - 1;
        } else if (num > array[mid]) {
            min = mid + 1;
        }
        mid = Math.round((min + max) / 2);
    }
    return index;
}

function getMax(array) {
    let max = array[0];
    let index = 0;
    for (let i in array) {
        if (array[i] > max) {
            max = array[i];
            index = i;
        }
    }
    return [max, index];
}

function getMin(array) {
    let min = array[0];
    let index = 0;
    for (let i in array) {
        if (array[i] < min) {
            min = array[i];
            index = i;
        }
    }
    return [min, index];
}