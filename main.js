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

window.onload = function () {
    
}

//Note: Elements will only go as far as Uranium (No. 92) due to radioactivity and inability to properly bond
salt1 = new chemical("NaCl", "Soduim Chloride", "salt", 0);
ion1 = new chemical("NO3", "Nitrate ion", "ion", -1);
ion2 = new chemical("PO4", "Nitrate ion", "ion", -3);

console.log(salt1.getFormulaArray());
console.log(ion2.getFormulaArray());

console.log(salt1.getMolarMass());
console.log(ion2.getMolarMass());