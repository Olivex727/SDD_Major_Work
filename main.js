//Main user controls file

console.log("BEGIN PROGRAM");

//==========RETREIVE TEXT FILE INFO==========//

//Jquery call to server,js, get files in public
function getFiles(input, loc="files") {
    
    return $.ajax({
        type: "GET",
        url: "/file?name="+input+"&loc="+loc,
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

//Upload element driver (chemical) information
pt = getFiles("chemical_info");

for (let e in pt) {
    if (e == 0) { continue; }
    let elm = pt[e].split("|");
    chemDict[elm[0]] = {
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
console.log(chemDict);

//Upload reaction information to reactDict
pt = getFiles("reactions");
let idcount = 0;

for (let e in pt) {
    if (e == 0) {
        continue;
    }
    let elm = pt[e].split("|");
    reactDict[elm[2]] = {
        base: elm[0],
        name: elm[1],
        products: elm[3],
        eq: parseFloat(elm[4]),
        std: (elm[5] == "true"),
        id: idcount
    };
    idcount++;

    //Add reverse reaction if eq is not 0
    if (parseFloat(elm[4]) > 0) {
        reactDict[elm[3]] = {
            base: elm[0],
            name: elm[1],
            products: elm[2],
            eq: parseFloat(elm[4]),
            std: (elm[5] == "true"),
            id: idcount
        };
        idcount++;
    }
}
console.log(reactDict);

//For any things that need to be performed onload
window.onload = function () {
    
}

//=======COSMETICS/GUI=======//

//Changes the colour of GUI elements when mouseover
function changeButtonColor(obj, onobj = true, aquamarine = true) {
    let element = document.getElementById(obj.id);
    let color = "#477862";
    if (!onobj && aquamarine) { color = "aquamarine"; }
    else if (!onobj && !aquamarine) { color = "white"; }
    else if (onobj && !aquamarine) { color = "grey"; }
    element.style.backgroundColor = color;
}

//Displays/Removes the search bar div
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

//Note: Elements will only go as far as Uranium (No. 92) due to radioactivity and inability to properly bond

//=======MAINLINE=======//

//Define mainEq, the output bar
let mainEq = new formula();
let output = document.getElementById("output");

output.innerText = "Loading ...";

//Define mainEq, the output bar
const condset = ["temp", "pressure" , "vol", "chem"];
let auxcondset = []; let auxcounter = 0;
let formulaOnStage = "";

let oldConditionUnits = [[], []];

output.innerText = displayReact(mainEq, false);
deleteButton();

//=======DRIVER=======//

let driverText = getFiles("drivercheck", "driver");
driverText.shift();

let driverInst = {};
for (let c in driverText) {
    
    let add = driverText[c].split('|');
    
    driverInst[add[0]] = {
        ratio: add[1].split(','),
        state: add[2].split(',')
    }
}

driver();

//The driver module tests the reaction
function driver() {
    let faults = [];

    //Automatically add chemicals and react
    const autoReact = (chems) => {
        for (let chem in chems) {
            addChemicalToStage({id: chems[chem]});
            addChemicalsToReaction();
        }
        reactButton();
    }

    //Check if the resulting formula object is as intended
    const checkValid = () => {
        let valid = true;
        const id = mainEq.getReactDictR();

        for (let c in mainEq.reactants[0]) {
            if (mainEq.reactants[1][c] != parseInt(driverInst[id].ratio[c])) {
                valid = false;
            }
            if (mainEq.reactants[4][c] != driverInst[id].state[c]) {
                valid = false;
            }
        }
        for (let c in mainEq.products[0]) {
            
            console.log(driverInst[id].ratio);
            c = parseInt(c); //Very weird that JS makes this a string ...

            if (mainEq.products[1][c] != parseInt(driverInst[id].ratio[c + mainEq.reactants[0].length])) {
                valid = false;
            }
            if (mainEq.products[4][c] != driverInst[mainEq.getId(true)].state[c + mainEq.reactants[0].length]) {
                valid = false;
            }
        }
        

        return [valid, driverInst[id], reactDict[id], mainEq];
    }

    //Main subroutine loop
    for (let c in reactDict) {
        if (!reactDict[c].std && driverInst[c] != undefined) {

            autoReact(c.split('+'));
            console.log("DRIVER: ", mainEq);
            let check = checkValid();
            console.log(check);

            if (!check[0]) {
                faults.push(check[1], check[2], check[3]);
            }

            deleteButton();
        }
    }

    //Print Results
    if (faults.length == 0) {
        console.log("DRIVER RESULTS:\nAll good!");
    }
    else {
        console.log("DRIVER RESULTS:");
        for (let c in faults) {
            console.log("ERROR:"+c);
            console.log("inDriverInst:", faults[c][0]);
            console.log("inReactDict:", faults[c][1]);
            console.log("inReaction:", faults[c][2]);
        }
    }
    
}

//=======TESTING STAGE=======//
//In this section, the intrinsic documentation will be incomplete

//ts();

let tscount = 0;

function ts() {
    //document.getElementById('jax').innerHTML = '<script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">';
    //console.log("e");
    tscount++;
    output.innerText = "\\("+tscount+"\\)";
}

//IDEA --- RELOAD PAGE WHEN ACTIVIATING REACT FUNCTION
//setInterval(ts, 10000);

//=======BUTTON ACTIVATIONS/GUI REACTION DISPLAY=======//

//Displays the amounts/units of the reactants, products and excess in the lower 'auxillary' section of the page
function displayResults(set, code) {

    let results = document.getElementById('results_'+code);
    let element = document.getElementById('displayelement');
    const selectiontab = '" onchange="ChangeUnits(true);" value="mol"> <option value = "mol" > mol </option> <option value = "M" > M </option> <option value = "Kg" > Kg </option> <option value = "g" > g </option> <option value = "mg" > mg </option> <option value = "µg" > µg </option> </select> </li>'

    results.innerHTML = "<p>"+capitalize(code)+":</p>";
    let deviation = [];

    //Create a new list element in the results section
    for (let c in set[0]) {
        let e = element.cloneNode(true);

        e.id = "set_"+code+"_"+c;

        e.innerHTML = '<li onclick="ConditionCheck(true)"> <span id ="chem_t_' + code + "_" + c +
        '">' + set[0][c].name + //'<span id="clear">' + spaces + '</span>' +
        '</span>: <input type = "number" id = "chem_n_' + code + "_" + c +
        '" value="' + set[2][c] + '" readonly=true> <select id = "chem_u_' + code + "_" + c
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

    //Alter the products/excess relative position from top
    let prod = document.getElementById('results_products');
    prod.style.top = (- 50 - (31 * mainEq.reactants[0].length)).toString() + "px";

    let addon = 0;
    if (mainEq.products[0].length > 0) {addon = -6;}
    let excess = document.getElementById('results_excess');
    excess.style.top = (addon-85 - (31 * (mainEq.products[0].length + mainEq.reactants[0].length))).toString() + "px";
}

//Activated when the 'React' button is pressed. This causes the reaction of mainEq, along with the display etc.
function reactButton() {
    //Add the reactants (Back up method)
    for (let c in mainEq.reactants[0]) {
        mainEq.reactants[2][c] = parseFloat(document.getElementById("chem_n_reactants_"+c).value);
        mainEq.reactants[3][c] = document.getElementById("chem_u_reactants_" + c).value;
    }

    console.log(mainEq.reactants);

    //Remove Previous information and add Conditions
    mainEq.clear();
    addConditions(mainEq);

    //React and display equation
    if (!mainEq.react()) {
        alert("The reaction could not be calculated. Make sure your inputs are valid or to look up the set of valid reactions in the User Manual");
    }
    else {
        output.innerText = displayReact(mainEq, true);
    }

    //Display auxillary results/calculations
    displayResults(mainEq.reactants, 'reactants');
    displayResults(mainEq.products, 'products');
    displayResults(mainEq.excess, 'excess');

    //Append excess/products so that the unit-changing works
    for (let c in mainEq.products[0]) {
        document.getElementById("chem_n_products_" + c).value = mainEq.products[2][c];
        document.getElementById("chem_u_products_" + c).value = mainEq.products[3][c];
        auxcondset.push("products_" + c);
    }
    for (let c in mainEq.excess[0]) {
        document.getElementById("chem_n_excess_" + c).value = mainEq.excess[2][c];
        document.getElementById("chem_u_excess_" + c).value = mainEq.excess[3][c];
        auxcondset.push("excess_" + c);
    }

    //Update unit stores
    ConditionCheck(true);
}

//Clear the reaction, auxillary and addstage
function deleteButton() {
    //Clear reaction display
    mainEq = new formula();
    output.style.color = "grey";
    output.innerText = "Enter Chemicals -->";
    auxcounter = 0;
    auxcondset = [];
    oldConditionUnits[1] = [];
    formulaOnStage = "";

    //Update auxillary section
    displayResults(mainEq.reactants, 'reactants');
    displayResults(mainEq.products, 'products');
    displayResults(mainEq.excess, 'excess');

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

//Displays the reaction onto the output div
function displayReact(equation, displayproducts) {
    output.style.color = "black";

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
}

//=======CONDITION & UNIT MANAGEMENT=======//

//Checks if the conditions are not negative, stores values in case of onchange event
function ConditionCheck(auxillary = false) {
    let element_n = null; let element_u = null;

    //For the non-auxillary conditions bar/add stage
    if (!auxillary) {
        for (let c in condset) {
            s = condset[c];
            element_n = document.getElementById(s + "_n");
            element_u = document.getElementById(s + "_u");
            if (parseFloat(element_n.value) <= 0) {
                if (element_u.value != "C" || parseFloat(element_n.value) <= -273.15) {
                    element_n.value = 1;
                }
            }
            oldConditionUnits[0][c] = element_u.value;
        }
    }
    //For the auxillary results stage
    else {
        for (let c in auxcondset) {
            s = auxcondset[c];
            element_n = document.getElementById("chem_n_" + s);
            element_u = document.getElementById("chem_u_" + s);
            if (parseFloat(element_n.value) <= 0) {
                if (element_u.value != "C" || parseFloat(element_n.value) <= -273.15) {
                    element_n.value = 1;
                }
            }
            oldConditionUnits[1][c] = element_u.value;
        }
    }
}

//Activated after the onchange event for all of the unit selections, changes the values based on units
//This function should not operate for the addstage input box
function ChangeUnits(auxillary = false) {
    //For the non-auxillary conditions bar/add stage
    if (!auxillary) {
        for (let c in condset) {
            if (document.getElementById(condset[c] + "_u").value !== oldConditionUnits[0][c]) {
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
    }
    //For the auxillary results stage
    else {
        for (let c in auxcondset) {
            if (document.getElementById("chem_u_" + auxcondset[c]).value !== oldConditionUnits[1][c]) {
                addConditions(mainEq);
                if (auxcondset[c].includes('reactants')){
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(mainEq.convertUnits(mainEq.reactants[0][c], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
                else if (auxcondset[c].includes('products')) {
                    let x = c - mainEq.reactants[0].length;
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(mainEq.convertUnits(mainEq.products[0][x], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
                else if (auxcondset[c].includes('excess')) {
                    let x = c - mainEq.reactants[0].length - mainEq.products[0].length;
                    document.getElementById("chem_n_" + auxcondset[c]).value = round(mainEq.convertUnits(mainEq.excess[0][x], parseFloat(document.getElementById("chem_n_" + auxcondset[c]).value), oldConditionUnits[1][c], document.getElementById("chem_u_" + auxcondset[c]).value), 10);
                }
            }
        }
    }
    
}

//Converts units without the need for a seperate reaction object
function onlyConditionUnits(oldconds, newconds) {
    //Parameter: Array [Values, Units]
    newconds[0] = oldconds[0];

    //Change Units oldconds are in
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

    //Mass/Capacity
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

//=======ADD GUI DATA TO REACTION=======//

//Adds all of the conditions to the reaction
function addConditions(equation) {
    equation.conditions[1] = ["C", "KPa", "L"]; //oldConditionUnits[0]; Default

    for (let c in condset) {
        equation.conditions[0][c] = parseFloat(document.getElementById(condset[c] + "_n").value);
        equation.conditions[1][c] = document.getElementById(condset[c] + "_u").value
        if (c >= 2) { break; }
    }
}

//Adds the chemicals in the add stage to the reaction bar/auxillary
function addChemicalsToReaction() {
    //Prevent Duplicates/Null inputs
    let sameflag = false;
    for (let c in mainEq.reactants[0]) {
        if (mainEq.reactants[0][c].formula === formulaOnStage) {
            sameflag = true;
        }
    }

    //Output alerts to notify user
    if (formulaOnStage === "") {
        alert("You need to search and add a chemical to the stage.");
        return null;
    }
    if (sameflag) {
        alert("You can't double up on chemicals. Select a different chemical.");
        return null;
    }
    if (mainEq.reacted) {
        alert("You need to clear the staged reaction first.");
        return null;
    }
    if (mainEq.reactants[0].length >= 2) {
        alert("There is an upper limit of two reactants.");
        return null;
    }

    //Create Chemical Instance
    let addition = new chemical(formulaOnStage, "none", "none");
    addition.name = addition.getDriver("name");
    addition.type = addition.getDriver("type");
    addition.ion = addition.getDriver("ion");
    addition.state = addition.getDriver("state");
    
    //Input into reation object
    addConditions(mainEq);
    mainEq.reactants[0][auxcounter] = addition;
    mainEq.reactants[1][auxcounter] = 1;
    mainEq.reactants[2][auxcounter] =
    mainEq.convertUnits(addition, parseFloat(document.getElementById("chem_n").value), document.getElementById("chem_u").value, "mol");
    mainEq.reactants[3][auxcounter] = "mol";
    mainEq.reactants[4][auxcounter] = mainEq.getState(addition, true);

    //AuxillaryCondSet
    auxcondset.push("reactants_" + auxcounter);
    auxcounter++;

    //Update displayReact/output
    displayResults(mainEq.reactants, 'reactants');
    output.innerText = displayReact(mainEq, false);
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

//=======SEARCH BAR=======//

//Displays the search bar results
function displaySearchResults() {
    //Algoritim to get most relevant to the search query
    const searchAlgoritim = (string) => {
        let name = [];
        let formula = [];
        let search = [];

        for (let c in chemDict) {
            //Get the likeness rank of both formula and name
            search.push([rankString(string, c) + rankString(string, chemDict[c].name), c]);
        }
        
        //Sort the search array with highest score first
        bubbleSort(search, 0);
        search.reverse();

        //Add search to name and formula
        for (let c in search) {
            if (
                !(formula.includes(search[c][1]) || name.includes(chemDict[search[c][1]].name)) &&
                search[c][0] != 0 && chemDict[search[c][1]].displayInSearch && c < 10
                ) {
                name.push(chemDict[search[c][1]].name);
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

    //Adjusts the size of the search_out div to fit to text width
    for (let c in displayset[0]) {
        document.getElementById("search_formula_" + c).style.position = "relative";
        document.getElementById("search_formula_" + c).style.left = (longest - deviation[c] + 30).toString() + "px";
        searchout.style.width = (longest + longestchem + 40).toString() + "px";
    }
}

//Adds a chemical selected from the search bar to the stage
function addChemicalToStage(element) {
    console.log("Added!");

    //Get rid of search bar
    displaySearch(false);

    //Add chemical to addStage
    let stagename = document.getElementById("chemicalonstage");
    stagename.innerHTML = "Current Chemical: " + element.id;
    stagename.style.color = "black";

    formulaOnStage = element.id;
}