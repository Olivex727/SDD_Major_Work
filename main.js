//Main user controls file

console.log("BEGIN PROGRAM");

function getFiles(input) {
    
    return $.ajax({
        type: "GET",
        url: "/file?name="+input,
        async : false
    }).responseText.split("\n");

}

//Upload the element information
let pt = getFiles("periodic_table");
for (let e in pt) {
    let elm = pt[e].split(",");
    chemicaldict[elm[1].toString()] = parseFloat(elm[0]);
}
console.log(chemicaldict);
console.log(chemicaldict["Zn"]);

//Upload element driver information
//formula|state|∆H|∆S|MP|BP|∆Vr
pt = getFiles("chemical_info");
for (let e in pt) {
    if (e == 0) { continue; }
    let elm = pt[e].split("|");
    driverdict[elm[0]] = {
        state : elm[1],
        enthalpy : parseFloat(elm[2]),
        entropy: parseFloat(elm[3]),
        mp: parseFloat(elm[4]),
        bp: parseFloat(elm[5]),
        red_pot: parseFloat(elm[6]),
        density: parseFloat(elm[7]),
        ion: parseFloat(elm[8]),
        name: elm[9],
        displayInSearch: (elm[10] === "true")
    };
}
console.log(driverdict);
console.log(driverdict["NaCl"].bp);

//Upload reaction information to reactdict
pt = getFiles("reactions");
let idcount = 0;

for (let e in pt) {
    if (e == 0) {
        continue;
    }
    let elm = pt[e].split("|");
    reactdict[elm[2]] = {
        base: elm[0],
        name: elm[1],
        products: elm[3],
        eq: parseFloat(elm[4]),
        std: (elm[5] == "true"),
        id: idcount
    };
    idcount++
}

window.onload = function () {
    
}

//=======COSMETICS=======//

function changeButtonColor(obj, onobj = true, aquamarine = true) {
    let element = document.getElementById(obj.id);
    let color = "#477862";
    if (!onobj && aquamarine) { color = "aquamarine"; }
    else if (!onobj && !aquamarine) { color = "white"; }
    else if (onobj && !aquamarine) { color = "grey"; }
    element.style.backgroundColor = color;
}

function displaySearch(infocus){
    let searchdiv = document.getElementById('searchout');
    if (infocus) {
        searchdiv.style.visibility = 'visible';
        searchdiv.style.display = 'inherit';
    } else {
        searchdiv.style.visibility = 'hidden';
        searchdiv.style.display = 'none';
    }
}

//Note: Elements will only go as far as Uranium (No. 92) due to radioactivity and inability to properly bond

/*
 * TYPES OF MOLECULES:
 * salt
 * ion
 * omol
 * inmol
 * water
 * oxygen
 * carbonate
 * acid
 * base
 * metal
*/

salt3 = new chemical("NH4NO3", "Ammonium Nitrate", "salt", 0);
salt2 = new chemical("Ca(NO3)2", "Calcium Nitrate", "salt", 0, "aq");
ion1 = new chemical("NO3", "Nitrate ion", "ion", -1);
ion2 = new chemical("PO4", "Phosphate ion", "ion", -3);
omol = new chemical("CH4", "Methane", "omol", 0, "g");
inmol2 = new chemical("O2", "Oxygen", "oxygen", 0, "g");

/*
console.log(salt2.getFormulaArray());
console.log(salt1.getFormulaArray());
console.log(ion2.getFormulaArray());

console.log(salt1.getMolarMass());
console.log(ion2.getMolarMass());
*/

//console.log(salt1.getDriver("enthalpy"));

eq1 = new formula(false, [
    [salt1, inmol1],
    [1, 1],
    [2, 1],
    ["Kg", "mol"],
    ["s", "l"]
]);
eq2 = new formula(false, [
    [omol, inmol2],
    [1, 1],
    [1, 1],
    ["mol", "mol"],
    ["g", "g"]
]);

let output = document.getElementById("output");

output.innerText = "\\(2H_{2}O\\ _{(g)}\\rightarrow2H_{2}\\ _{(g)}+O_{2}\\ _{(g)}\\)";

/*
console.log(eq1.getId(false));
console.log(eq1.getId(true));

console.log(eq2.getId(false));
console.log(eq2.getId(true));
*/

const condset = ["temp", "pressure" , "vol", "chem"];
let auxcondset = []; let auxcounter = 0;
let formulaOnStage = "";

let oldConditionUnits = [[], []];

output.innerText = displayReact(eq1, false);
deleteButton();

/*AUTOMATIC OPERATION*/

//displayResults(eq1.reactants, 'reactants');
//reactButton();
/*
deleteButton();

addChemicalToStage({id: "CH4"});
addChemicalsToReaction();
addChemicalToStage({id: "O2"});
addChemicalsToReaction();
reactButton();
*/
/*AUTOMATIC OPERATION*/


//ts();

let tscount = 0;

function ts() {
    //document.getElementById('jax').innerHTML = '<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">';
    console.log("e");
    tscount++;
    output.innerText = "\\("+tscount+"\\)";
}

//IDEA --- RELOAD PAGE WHEN ACTIVIATING REACT FUNCTION!!
//setInterval(ts, 10000);


function displayResults(set, code) {
    console.log("DISPLAY RESULTS");
    console.log(code);
    let results = document.getElementById('results_'+code);
    let element = document.getElementById('displayelement');
    const selectiontab = '" onchange="ChangeUnits(true);" value="mol"> <option value = "mol" > mol </option> <option value = "M" > M </option> <option value = "Kg" > Kg </option> <option value = "g" > g </option> <option value = "mg" > mg </option> <option value = "µg" > µg </option> </select> </li>'

    results.innerHTML = "<p>"+capitalize(code)+":</p>";

    let readOnlyString = "";
    if (code === 'products' || code === 'excess') {
        readOnlyString = " readonly=true";
    }

    let deviation = [];
    /*
    let longest = 0;
    for (let c in set[0]) {
        if (set[0][c].name.length > longest) {
            longest = set[0][c].name.length;
        }
    }
    */

    for (let c in set[0]) {
        let e = element.cloneNode(true);

        e.id = "set_"+code+"_"+c;
        /*
        let spaces = "";
        for (i = 0; i < longest - set[0][c].name.length; i++) { spaces += "_"; }
        spaces += "_";
        //console.log(spaces);
        */

        e.innerHTML = '<li onclick="ConditionCheck(true)"> <span id ="chem_t_' + code + "_" + c +
        '">' + set[0][c].name + //'<span id="clear">' + spaces + '</span>' +
        '</span>: <input type = "number" id = "chem_n_' + code + "_" + c +
        '" value="' + set[2][c] + '"' + readOnlyString + '> <select id = "chem_u_' + code + "_" + c
        + selectiontab;

        results.appendChild(e);

        deviation.push(document.getElementById("chem_t_" + code + "_" + c).offsetWidth);
    }

    //Align the text box elements with eachother
    let longest = deviation[0];
    for (let c in set[0]) {
        if (deviation[c] > longest) {
            longest = deviation[c];
        }
    }
    for (let c in set[0]) {
        document.getElementById("chem_n_" + code + "_" + c).style.position = "relative";
        document.getElementById("chem_u_" + code + "_" + c).style.position = "relative";
        document.getElementById("chem_n_" + code + "_" + c).style.left = (longest - deviation[c]).toString() + "px";
        document.getElementById("chem_u_" + code + "_" + c).style.left = (longest - deviation[c]).toString() + "px";
    }

    let prod = document.getElementById('results_products');
    prod.style.top = (- 50 - (31 * eq1.reactants[0].length)).toString() + "px";
    console.log(prod.style.top);

    let addon = 0;
    if (eq1.products[0].length > 0) {addon = -6;}
    let excess = document.getElementById('results_excess');
    excess.style.top = (addon-85 - (31 * (eq1.products[0].length + eq1.reactants[0].length))).toString() + "px";
    console.log("LOOOOOK" + excess.style.top);
}

function reactButton() {
    for (let c in eq1.reactants[0]) {
        eq1.reactants[2][c] = parseFloat(document.getElementById("chem_n_reactants_"+c).value);
        eq1.reactants[3][c] = document.getElementById("chem_u_reactants_" + c).value;
    }
    console.log(eq1.reactants);

    eq1.clear();
    addConditions(eq1);
    console.log(eq1.conditions);

    if (!eq1.react()) {
        alert("The reaction could not be calculated. Make sure your inputs are valid or to look up the set of valid reactions in the User Manual");
    }
    else {
        output.innerText = displayReact(eq1, true);
    }
    displayResults(eq1.reactants, 'reactants');
    displayResults(eq1.products, 'products');
    displayResults(eq1.excess, 'excess');

    for (let c in eq1.products[0]) {
        document.getElementById("chem_n_products_" + c).value = eq1.products[2][c];
        document.getElementById("chem_u_products_" + c).value = eq1.products[3][c];
        auxcondset.push("products_" + c);
    }
    for (let c in eq1.excess[0]) {
        document.getElementById("chem_n_excess_" + c).value = eq1.excess[2][c];
        document.getElementById("chem_u_excess_" + c).value = eq1.excess[3][c];
        auxcondset.push("excess_" + c);
    }
    //console.log(auxcondset);
    ConditionCheck(true);

    console.log(eq1.reactants);
    
}

function deleteButton() {
    //Clear reaction display
    eq1 = new formula();
    output.style.color = "grey";
    output.innerText = "Enter Chemicals -->";
    auxcounter = 0;
    auxcondset = [];
    oldConditionUnits[1] = [];
    formulaOnStage = "";

    //Update auxillary section
    displayResults(eq1.reactants, 'reactants');
    displayResults(eq1.products, 'products');
    displayResults(eq1.excess, 'excess');

    //Remove chemical from stage
    let textbox = document.getElementById("chem_n");
    let selectbox = document.getElementById("chem_u");
    textbox.value = 1;
    selectbox.value = "mol";

    let stagename = document.getElementById("chemicalonstage");
    stagename.innerHTML = ".";
    stagename.style.color = "transparent";
    formulaOnStage = "";
}

function displayReact(equation, displayproducts) {
    //let equation = new formula();
    output.style.color = "black";

    let display = "\\(";
    console.log(equation)
    const formLaTex = (set) => {
        for (let n in set[0]) {
            let string = set[0][n].formula.split("");
            //console.log(parseInt(string[0]).toString() == "NaN");
            for (let c in string) {
                if (parseInt(string[c]).toString() != "NaN") {
                    string[c] = "_{" + string[c]+"}";
                }
            }
            //console.log(string.join(""));
            //console.log(equation.getState(set[0][n], true));

            let state = "";
            if (set[4][n] == null) {
                state = equation.getState(set[0][n], true);
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

            //output.innerText = "\\("+string+"\\)";
            //display += equation.reactants[0][c] + equation.reactants[0][c]
        }
    }

    formLaTex(equation.reactants);
    display = display.split(""); display.pop(); display = display.join("");
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
    //console.log(display);
}

//Checks if the conditions are not negative, stores values in case of onchange event
function ConditionCheck(auxillary = false) {
    let element_n = null; let element_u = null;
    if (!auxillary) {
        for (let c in condset) {
            s = condset[c];
            element_n = document.getElementById(s + "_n");
            element_u = document.getElementById(s + "_u");
            //console.log(element_n.value);
            if (parseFloat(element_n.value) <= 0) {
                if (element_u.value != "C" || parseFloat(element_n.value) <= -273.15) {
                    element_n.value = 1;
                }
            }
            oldConditionUnits[0][c] = element_u.value;
        }
    }
    else {
        for (let c in auxcondset) {
            s = auxcondset[c];
            element_n = document.getElementById("chem_n_" + s);
            element_u = document.getElementById("chem_u_" + s);
            //console.log("URBICUE", element_n.value);
            if (parseFloat(element_n.value) <= 0) {
                if (element_u.value != "C" || parseFloat(element_n.value) <= -273.15) {
                    element_n.value = 1;
                }
            }
            oldConditionUnits[1][c] = element_u.value;
        }
    }

    console.log(oldConditionUnits[1]);
}

//Activated after the onchange event for all of the unit selections
function ChangeUnits(auxillary = false) {
    alert(oldConditionUnits[0]);
    //alert(oldConditionUnits[0][1]);
    if (!auxillary) {
        for (let c in condset) {
            if (document.getElementById(condset[c] + "_u").value !== oldConditionUnits[0][c]) {
                console.log(true);
                if (
                    ((document.getElementById(condset[c] + "_u").value.includes('L') && oldConditionUnits[0][c].includes('L')) ||
                        (document.getElementById(condset[c] + "_u").value.includes('g') && oldConditionUnits[0][c].includes('g'))) ||
                    c != 3
                ) {
                    document.getElementById(condset[c] + "_n").value =
                        onlyConditionUnits(
                            [parseFloat(document.getElementById(condset[c] + "_n").value), oldConditionUnits[0][c]],
                            [1, document.getElementById(condset[c] + "_u").value]
                        );
                }
            }
        }
    } else {
        for (let c in auxcondset) {
            if (document.getElementById("chem_u_" + auxcondset[c]).value !== oldConditionUnits[1][c]) {
                addConditions(eq1);
                if (auxcondset[c].includes('reactants')){
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(eq1.convertUnits(eq1.reactants[0][c], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
                else if (auxcondset[c].includes('products')) {
                    let x = c - eq1.reactants[0].length;
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(eq1.convertUnits(eq1.products[0][x], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
                else if (auxcondset[c].includes('excess')) {
                    let x = c - eq1.reactants[0].length - eq1.products[0].length;
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(eq1.convertUnits(eq1.excess[0][x], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
            }
        }
    }
    console.log("lol", oldConditionUnits);
    
}

//Converts units without the need for a seperate reaction object
function onlyConditionUnits(oldconds, newconds) {
    //Parameter: Array [Values, Units]
    newconds[0] = oldconds[0];

    //===Change Units oldconds are in===//
    //Celsius
    if (oldconds[1].includes("C")) {
        newconds[0] = oldconds[0] + 273.15; //Ignore 273.14999999 ....
    }
    //Kelvin
    else if (oldconds[1] === "K") {
        newconds[0] = oldconds[0] - 273.15;
    }

    //Pascals
    if (oldconds[1].includes("Pa")) {
        newconds[0] = oldconds[0];
    }
    //Atmospheres
    else if (oldconds[1].includes("atm")) {
        newconds[0] = oldconds[0] * 101325;
    }

    //Mass
    //Nothing, since the only conversions are from mg -> g -> Kg

    //Convert to basic units
    if (oldconds[1].includes("m") && !oldconds[1].includes("atm")) {
        newconds[0] *= 1 / 1000;
    } else if (oldconds[1].includes("K") && oldconds[1].length > 1) {
        newconds[0] *= 1000;
    } else if (oldconds[1].includes("µ") && oldconds[1].length > 1) {
        newconds[0] *= 1/ 1000000;
    }

    //Convert Pressures/Volumes into new units
    if (newconds[1].includes("m") && !newconds[1].includes("atm")) {
        newconds[0] *= 1000;
    } else if (newconds[1].includes("K") && newconds[1].length > 1) {
        newconds[0] *= (1 / 1000);
    } else if (newconds[1].includes("µ") && oldconds[1].length > 1) {
        newconds[0] *= 1000000;
    }

    if (newconds[1].includes("atm")) {
        newconds[0] *= (1 / 101325);
    }

    return newconds[0];
}

//Adds all of the conditions to the reaction
function addConditions(equation) {
    equation.conditions[1] = ["C", "KPa", "L"]; //oldConditionUnits[0];

    for (let c in condset) {
        equation.conditions[0][c] = parseFloat(document.getElementById(condset[c] + "_n").value);
        equation.conditions[1][c] = document.getElementById(condset[c] + "_u").value
        if (c >= 2) { break; }
    }
}

function addChemicalsToReaction() {
    //Prevent Duplicates/Null inputs
    let sameflag = false;
    for (let c in eq1.reactants[0]) {
        if (eq1.reactants[0][c].formula === formulaOnStage) {
            sameflag = true;
        }
    }
    if (formulaOnStage === "") {
        alert("You need to search and add a chemical to the stage.");
        return null;
    }
    if (sameflag) {
        alert("You can't double up on chemicals. Select a different chemical.");
        return null;
    }

    //Create Chemical Instance
    let addition = new chemical(formulaOnStage, "none", "none");
    addition.name = addition.getDriver("name");
    addition.type = addition.getDriver("type");
    addition.ion = addition.getDriver("ion");
    addition.state = addition.getDriver("state");

    console.log(addition);
    
    //Input into reation object
    addConditions(eq1);
    eq1.reactants[0][auxcounter] = addition;
    eq1.reactants[1][auxcounter] = 1;
    eq1.reactants[2][auxcounter] =
    eq1.convertUnits(addition, parseFloat(document.getElementById("chem_n").value), document.getElementById("chem_u").value, "mol");
    eq1.reactants[3][auxcounter] = "mol";
    eq1.reactants[4][auxcounter] = addition.state;

    

    //AuxillaryCondSet
    auxcondset.push("reactants_" + auxcounter);
    auxcounter++;
    //console.log("lol", auxcondset);

    console.log(eq1.reactants);

    //Update displayReact/output
    displayResults(eq1.reactants, 'reactants');
    output.innerText = displayReact(eq1, false);
    ConditionCheck(true);

    //Remove chemical from stage
    let textbox = document.getElementById("chem_n");
    let selectbox = document.getElementById("chem_u");
    textbox.value = 1;
    selectbox.value = "mol";

    let stagename = document.getElementById("chemicalonstage");
    stagename.innerHTML = ".";
    stagename.style.color = "transparent";
    formulaOnStage = "";
}

function displaySearchResults() {
    //Algoritim to get most relevant to the search query
    const searchAlgoritim = (string) => {
        let name = [];
        let formula = [];
        let search = [];
        
        console.log(string);

        for (let c in driverdict) {
            //Get the likeness rank of both formula and name
            search.push([rankString(string, c) + rankString(string, driverdict[c].name), c]);
        }
        
        //Sort the search array with highest score first
        bubbleSort(search, 0);
        search.reverse();

        //Add search to name and formula
        for (let c in search) {
            if (
                !(formula.includes(search[c][1]) || name.includes(driverdict[search[c][1]].name)) &&
                search[c][0] != 0 && driverdict[search[c][1]].displayInSearch && c < 10
                ) {
                name.push(driverdict[search[c][1]].name);
                formula.push(search[c][1]);
            }
        }

        console.log(search);

        return [name, formula]
    }
    
    //Get the list of suggestions
    const query = document.getElementById("search").value;
    let displayset = searchAlgoritim(query);

    //Clear Search element
    let searchout = document.getElementById("searchout");
    searchout.innerHTML = ""

    //Display onto search element
    let deviation = []; let chemdeviation = [];
    for (let c in displayset[0]) {
        searchout.innerHTML += '<li id="' + displayset[1][c] +
        '" onclick="addChemicalToStage(this);" onmouseleave="changeButtonColor(this, false, false)" onmouseover="changeButtonColor(this, true, false)">' +
        '<span id="search_name_' + c + '">'+ displayset[0][c] + ' </span> <i id="search_formula_' + c + '">' + displayset[1][c] + '</i> </li>';

        deviation.push(document.getElementById("search_name_"+c).offsetWidth);
        chemdeviation.push(document.getElementById("search_formula_" + c).offsetWidth);
    }

    //Align the formula i-tag elements with eachother
    let longest = deviation[0]; let longestchem = chemdeviation[0];
    for (let c in displayset[0]) {
        if (deviation[c] > longest) {
            longest = deviation[c];
        }
        if (chemdeviation[c] > longestchem) {
            longestchem = chemdeviation[c];
        }
    }
    
    for (let c in displayset[0]) {
        document.getElementById("search_formula_" + c).style.position = "relative";
        document.getElementById("search_formula_" + c).style.left = (longest - deviation[c] + 30).toString() + "px";
        searchout.style.width = (longest + longestchem + 40).toString() + "px";
    }
}

function addChemicalToStage(element) {
    console.log("Added!");
    displaySearch(false);

    let stagename = document.getElementById("chemicalonstage");
    stagename.innerHTML = "Current Chemical: " + element.id;
    stagename.style.color = "black";

    formulaOnStage = element.id;
}