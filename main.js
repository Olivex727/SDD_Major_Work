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
        ion: parseFloat(elm[8])
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
    [1, 1],
    ["mol", "mol"],
    ["aq", "l"]
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

eq1.react();
//eq2.react();
output.innerText = displayReact(eq1);



function displayReact(equation) {
    //let equation = new formula();
    let display = "\\(";
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

            string = string.join("") + "\\ _{(" + equation.getState(set[0][n], true) + ")}";

            let tempion = Math.abs(set[0][n].ion);
            if (tempion == 1){tempion = "";}

            if (set[0][n].ion < 0) { string += "^{-" + tempion + "}"; }
            else if (set[0][n].ion > 0) { string += "^{+" + tempion + "}"; }

            display += string + "+";

            //output.innerText = "\\("+string+"\\)";
            //display += equation.reactants[0][c] + equation.reactants[0][c]
        }
    }
    formLaTex(equation.reactants);
    display = display.split(""); display.pop(); display = display.join("");
    if (!equation.isDynamic) {
        display += "\\rightarrow ";
    } else {
        display += "\\leftrightharpoons ";
    }
    formLaTex(equation.products);
    display = display.split(""); display.pop(); display = display.join("");
    
    display += "\\)";
    return display;
    //console.log(display);
}