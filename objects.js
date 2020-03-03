//Object Management

/*
 * STANDARD UNITS:
 * 
 * Tempurature - Kelvin (K)
 * Amount - Moles (mol)
 * Mass - Grams (g)
 * Volume - Litres (L) (1/1000 of a meter cubed)
 * Concentration - Molar (M) (mol/L, Moles per Litre)
 * 
 */

//Formula - MM
let chemicaldict = {};
let driverdict = {};
let reactdict = {};

//The chemical class stores information on the individial chemical identities
class chemical {
    constructor(formula, name, type, ion=0) {
        this.formula = formula; this.name = name, this.type = type; this.ion = ion;
    }

    //Search for the chemicals's tempurature-based attributes
    getDriver(driver) {
        //Get Melting point (m), Boiling point (b), Temurature (t), Enthalpy (h), Entropy (s)
        return driverdict[this.formula][driver];
    }

    //Get the molar mass of the chemical
    getMolarMass() {
        let MM = 0;
        let farr = this.getFormulaArray();
        for (let chem in farr) {
            //console.log(chemichaldict[farr[chem][0]]);
            MM += (chemicaldict[farr[chem][0]] * farr[chem][1]);
        }
        return MM;
    }

    //Seperate fromula into array of the elements and their amounts
    getFormulaArray() {
        //Split formula into array
        let farr = this.formula.split("");

        //Form elements by adding to strings starting with capitals
        let returnformula = [];
        let templist = [];
        let number = 1;
        let checknumflag = false;
        let checkclosebracket = false;
        let bracketindex = 0;

        //Produce the formula array
        for (let c in farr){
            let char = farr[c];
            if (char == "(") {
                bracketindex = returnformula.length + 1;
            }
            else if (char == char.toUpperCase() && isNaN(char) && c != 0) {
                if (char == ")") {
                    checkclosebracket = true;
                }
                if (!checknumflag) {
                    number = 1;
                }

                //Check if it exists
                let existflag = false;
                let indexform = 0;
                for (let i in returnformula) {
                    if (templist.join("") == returnformula[i][0]) {
                        existflag = true;
                        indexform = i;
                    }
                }
                if (!existflag) {
                    returnformula.push([templist.join(""), number]);
                }
                else {
                    returnformula[indexform][1] += number;
                }
                templist = [];
                number = 1;
                templist.push(char);
            }
            else if (!isNaN(char) && checkclosebracket) {
                checkclosebracket = false;
                number = parseInt(char);
                for (let i = bracketindex; i < returnformula.length; i++) {
                    returnformula[i][1] *= number;
                }
                number = 1;
            }
            else if (!isNaN(char) && !checkclosebracket) {
                number = parseInt(char);
                checknumflag = true;
            }
            else {
                templist.push(char);
            }
        }

        //Rerun algorithim for the end of the string/list
        if (!checknumflag) {
            number = 1;
        }
        returnformula.push([templist.join(""), number]);

        //Remove any excess charachters
        for (let i in returnformula) {
            if (returnformula[i][0] === ")" || returnformula[i][0] === "") {
                returnformula.splice(i, 1);
            }
        }

        //Al number entries go to seperate arrays
        return returnformula;
    }
}

let salt1 = new chemical("(NH4)2NO3", "Ammonium Sulfate", "salt", 0);
let inmol1 = new chemical("H2O", "Water", "water", 0);

//Formula class is where all of the main reaction stuff is handled
class formula {
    constructor(eq, reactants=[[], [], [], []], conditions=[]) {
        this.reactants = reactants; //Array of 3-size arrays [chemical, Ratio, Amount, Units]
        this.conditions = conditions; //Tempurature, Pressure etc.
        this.isDynamic = eq; //Static or Dynamic
        this.excess = [[], [], []] //Excess unreacted chemicals [chemical, amount, units]

        this.products = [[], [], [], []];
        this.equilibrum = this.getEq();
    }

    //The main reaction producuer
    react() {
        
        /* Algorithim Design:
         * 
         * 1. Get the reaction type (Either no reaction, standard reaction, specified reaction)
         * 2. Formulate the produts (Produce the products to the reaction)
         * 3. Equalise both sides of the reaction according to conservation of matter
         * 4. Perform calculationsto find final chemichal amounts and the driver details
         * 
        */

        //Async in JS is annoying...

        console.log(reactdict);
        let type = this.getReactionType();
        console.log(type);
        this.formulateProducts(type);
        console.log(this.products);
        if (this.equalize()) {
            console.log(this.calculate());
        }
    }

    //Formulate the products based on the reaction type
    formulateProducts(type) {
        if (!type.includes("none")) {
            for (let i in type) {
                let item = type[i];
                for (let r in reactdict) {
                    if (reactdict[r].name === item) {
                        console.log(item);
                        //Once a formula is found, it will not matter if it's special or standard
                        type.splice(type.indexOf(item), 1)
                        if (!reactdict[r].std) {
                            for (let chem in reactdict[r].products.split("+")) {
                                this.addToReact(reactdict[r].products.split("+")[chem]);
                            }
                            console.log(this.products);
                        }
                        else {
                            //Implement standardized system
                            for (let c in reactdict[r].products.split("+")) {
                                let chem = reactdict[r].products.split("+")[c];
                                if (chem === "water") { this.addToReact("H2O", chem, chem); }
                                if (chem === "oxygen") { this.addToReact("O2", chem, chem); }
                                if (chem === "acid") { 
                                    //
                                    this.addToReact("H2O", chem, chem); 
                                }
                            }
                            //console.log(this.products);
                        }
                    }
                }
            }
        } else {
            this.products = this.reactants;
        }
    }

    //Equalise both sides of the reaction
    equalize() {
        /*
        * ALGORITIM:
        * 1. Get the amount of elements on both sides
        * 2. For Each element
        * a. Determine which side lacks
        * b. Increment ratio of smallest element amount
        * 3. Repeat Steps 1-2 until amt of elements are equal (simple if [] === [])
        * 4. Check the ratioes and divide by HCF once
        * 
        * PRIMARY FUNCTIONS (Outside of function):
        * getEqualizerAmounts() -- Gets the amouns of elements on both sides
        * HCF() --Standard algoritim, finds HCF between an array of numbers
        * 
        */

        //STUB -- REMOVE ONCE GUI IS IMPLEMENTED
        this.reactants.push([]);
        this.reactants.push([]);
        this.reactants.push([]);
        for (let c in this.reactants[0]) {
            this.reactants[1][c] = 1;
            this.reactants[2][c] = 0;
            this.reactants[3][c] = "mol";
        }

        //Finds the smallest element amount in the set
        const findSmallest = (set, ignore) => {
            //Min value finding
            let low = 0
            if (Object.keys(set)[0] !== ignore || Object.keys(set).length == 1) {
                low = set[Object.keys(set)[0]];
            } else {
                low = set[Object.keys(set)[1]];
            }
            let lowest = "";
            for (let e in set) {
                if (set[e] <= low && e !== ignore) {
                    lowest = e;
                    low = set[e];
                }
            }
            return [lowest, low];
        }

        //Determines what chemicals can be ignored when finding how they can be manipulated
        let determineIgnoreSet = (reactnum, prodnum, element) => {
            let igset = [];
            console.log(reactnum, prodnum);
            for (let c in reactnum) {
                if (reactnum[c] == prodnum[c]) {
                    igset.push(c);
                }
            }
            console.log("IGSET:" + igset);
            return igset;
        }
    
        //Ignore is the most recent element to reach equality. ignoreset is the list that have acheived equality
        let determineUsability = (set, chem, ignore = "", ignoreset = []) => {
            /*
             * WHAT QUALIFIES AS USABLE:
             * 
             * 1. Ignored elements are in Chemical (to ensure that equality is reached)
             * 2. Focus element is in Chemical
             * 3. If using the ignoreset elements isn't possible, it will just ignore the value of the 'ignore' identifier only
             * 4. If the set size is 1, it will choose that only item
             * 
             */

            let indexes = [];
            let condition1 = [];

            if (set[0].length > 1) {
                for (let c in set[0]) {
                    //Satisfies Condition 2
                    if (!isNaN(findChemInFormArr(this.multiplyRatioes(set[0][c].getFormulaArray(), 0, set), chem))) {
                        //Satisfies Condition 1
                        condition1.push(c);
                        let pass = true;
                        for (let i in ignoreset) {
                            if (!isNaN(findChemInFormArr(this.multiplyRatioes(set[0][c].getFormulaArray(), 0, set), ignoreset[i]))) {
                                pass = false;
                            }
                        }
                        if (pass) {
                            indexes.push(c);
                        }
                    }
                }
            }
            else {
                indexes.push(0);
            }

            //Check if array has any elements, if not, check satisfation of condition 3
            if (indexes.length == 0) {
                for (let c in condition1) {
                    if (isNaN(findChemInFormArr(this.multiplyRatioes(set[0][c].getFormulaArray(), 0, set), ignore))) {
                        indexes.push(condition1[c]);
                    }
                }
            }

            //If nothing else works, just output the chemicals that contain the element
            if (indexes.length == 0) {
                for (let c in condition1) {
                    indexes.push(condition1[c]);
                }
            }

            console.log(condition1);

            if (indexes.length > 1) {
                for (let r in this.reactants[0]) {
                    for (let p in this.products[0]) {
                        if (this.reactants[0][r].formula === this.products[0][p].formula && (indexes.includes(r) || indexes.includes(p))) {
                            for (let c in indexes) {
                                if (indexes[c] == r || indexes[c] == p) {
                                    indexes.splice(c, 1);
                                }
                            }
                        }
                    }
                }
            }

            //If the list is still empty, then just set it to a default value
            if (indexes.length == 0) {
                indexes.push(0);
            }
            

            return indexes;

        }

        //Finds the smallest chemical that allows for such to be incremented in ratio
        let findSmallestChem = (set, chem, ignore = "", ignoreset=[]) => { //set is this.reactants or this.products //chem is name
            //Min value of number in chemical array
            //Needs to get the set of all minimum element values and choose the ones with the lowest MM

            //The selection process for usable chemicals
            let useable = determineUsability(set, chem, ignore, ignoreset);
            console.log("USEABLE: " + useable);

            let min = 0;

            min = findChemInFormArr(this.multiplyRatioes(set[0][useable[0]].getFormulaArray(), 0, set), chem);
            let finalindex = -1;
            let indexlist = [];
            console.log(this.multiplyRatioes(set[0][useable[0]].getFormulaArray(), 0, set));

            for (let c in useable) {
                let current = findChemInFormArr(this.multiplyRatioes(set[0][useable[c]].getFormulaArray(), 0, set), chem);
                if (!isNaN(current) && current <= min && current > 0) {
                    min = current;
                    indexlist.push(useable[c]);
                }
            }

            //Search for the minimum Molar Mass value
            let minMM = set[0][indexlist[0]].getMolarMass();
            for (let i = 0; i < indexlist.length; i++) {
                if (set[0][indexlist[i]].getMolarMass() <= minMM){
                    minMM = set[0][indexlist[i]].getMolarMass();
                    finalindex = indexlist[i];
                }
            }

            if (finalindex >= 0) {
                return finalindex;
            } else {
                throw Error("Looks like there was a problem in finding the molar masses, finalindex = "+finalindex)
            }
        }

        //Checks the reaction data for equalities via use of the HCF/GCD of the data
        let checkUsingHCF = () => {

            console.log("CHECKHCF:");
            let equals = {}

            //Ignore all of the equal chemicals
            for (let r in this.reactants[0]) {
                for (let p in this.products[0]) {
                    if (this.reactants[0][r] === this.reactants[0][p] && this.reactants[1][r] == this.products[1][p]) {
                        console.log(this.reactants[0][r]);
                        equals[this.reactants[0][r].formula] = [r, p];
                    }
                }
            }

            let newreacts = []; let newprods = [];
            console.log(equals);
            let dummyreact = []; let dummyprod = [];

            //Append the non-equal chemicals to an array
            //Fill dummy array with ones
            for (let r in this.reactants[0]) {
                if (!Object.keys(equals).includes(this.reactants[0][r].formula)) {
                    newreacts.push(this.reactants[1][r]);
                }
                else {
                    newreacts.push(0);
                }
                dummyreact.push(1);
            }
            for (let p in this.products[0]) {
                if (!Object.keys(equals).includes(this.products[0][p].formula)) {
                    newprods.push(this.products[1][p]);
                }
                else {
                    newprods.push(0);
                }
                dummyprod.push(1);
            }

            const rhcf = HCF(newreacts); const phcf = HCF(newprods);

            //Divide the array elements by its HCF
            for (let c in newreacts) {
                newreacts[c] *= 1 / rhcf;
                if (newreacts[c] == 0) { newreacts[c] = 1; }
            }
            for (let c in newprods) {
                newprods[c] *= 1 / phcf;
                if (newprods[c] == 0) { newprods[c] = 1; }
            }

            //Check for if any combination of sides equals the other AND divide this by reactants/products
            let eqflag = false;

            //New Reactants vs. New Products
            if (this.getEqualizerAmts([this.reactants[0], newreacts], [this.products[0], newprods])[2]) {
                for (let p in this.products[0]) {
                    if (!Object.keys(equals).includes(this.products[0][p].formula)) {
                        this.products[1][p] *= 1 / phcf
                    }
                }
                for (let r in this.reactants[0]) {
                    if (!Object.keys(equals).includes(this.reactants[0][r].formula)) {
                        this.reactants[1][r] *= 1 / rhcf
                    }
                }
                eqflag = true;
            }

            //New reactants vs. Old/Original Products
            if (!eqflag && (this.getEqualizerAmts([this.reactants[0], newreacts], [this.products[0], dummyprod])[2]
            || this.getEqualizerAmts([this.reactants[0], newreacts], this.products)[2])) {
                for (let r in this.reactants[0]) {
                    if (!Object.keys(equals).includes(this.reactants[0][r].formula)) {
                        this.reactants[1][r] *= 1 / rhcf
                    }
                }
            }

            //Old/Original reactants vs. New Products
            if (!eqflag && (this.getEqualizerAmts([this.reactants[0], dummyreact], [this.products[0], newprods])[2]
            || this.getEqualizerAmts(this.reactants, [this.products[0], newprods])[2])) {
                for (let p in this.products[0]) {
                    if (!Object.keys(equals).includes(this.products[0][p].formula)) {
                        this.products[1][p] *= 1 / phcf
                    }
                }
            }
            //throw new Error("EXIT CODE");
        }

        let [reactnum, prodnum, equal] = this.getEqualizerAmts();
        let iteration = 0;
        let ignore = "";
        let ignoreset = [];

        let complete = true;

        while (!equal) {

            let [element, lowreact] = findSmallest(reactnum, ignore);
            let lowprod = prodnum[element];

            ignoreset = determineIgnoreSet(reactnum, prodnum, element);
            console.log(element);

            //Determine the side that will be manipulated
            if (lowprod < lowreact) {
                let index = findSmallestChem(this.products, element, ignore, ignoreset);
                this.products[1][index]++;
            }
            else if (lowprod > lowreact) {
                let index = findSmallestChem(this.reactants, element, ignore, ignoreset);
                this.reactants[1][index]++;
            }
            else if (lowprod == lowreact) {
                console.log("EQUAL");
                ignore = element;
            }

            checkUsingHCF();

            [reactnum, prodnum, equal] = this.getEqualizerAmts();

            iteration++;
            console.log("ITERATION: " + iteration);

            //After 10000 recycles, it is clear that the reaction won't work and the program will not calculate
            if (iteration >= 10000) {
                alert("The reaction could not be calculated. Make sure your inputs are valid or to look up the set of valid reactions in the User Manual");
                complete = false;
                break;
            }
        }

        console.log(equal);
        checkUsingHCF();
        console.log(this.reactants, this.products);
        return complete;
    }

    getEqualizerAmts(reacts=this.reactants, prods=this.products) {
        let reactnum = {};
        let prodnum = {}
        let newarr = []

        //Reactants
        for (let c in reacts[0]) {
            let chem = reacts[0][c];
            newarr = this.multiplyRatioes(chem.getFormulaArray(), c, reacts);
            for(let e in newarr) {
                if (newarr[e][0] in reactnum) {
                    //console.log("found");
                    reactnum[newarr[e][0]] += newarr[e][1];
                }
                else {
                    //console.log("none");
                    reactnum[newarr[e][0]] = newarr[e][1];
                }
            }
        }

        //Products
        for (let c in prods[0]) {
            let chem = prods[0][c];
            newarr = this.multiplyRatioes(chem.getFormulaArray(), c, prods);
            for (let e in newarr) {
                if (newarr[e][0] in prodnum) {
                    //console.log("found");
                    prodnum[newarr[e][0]] += newarr[e][1];
                } else {
                    //console.log("none");
                    prodnum[newarr[e][0]] = newarr[e][1];
                }
            }
        }

        //Check for equality
        let equal = true;
        for (let e in reactnum) {
            //reactnum[e] = prodnum[e];
            if (reactnum[e] != prodnum[e]) {
                //console.log('UNEQUAL');
                equal = false;
            }
        }
        return [reactnum, prodnum, equal]
    }

    multiplyRatioes(arr, index, set) {
        for (let c in arr) {
            arr[c][1] *= set[1][index];
        }
        return arr;
    }

    //Determine the reaction type 
    getReactionType() {
        let type = [];
        for (let r in reactdict) {
            if (reactdict[r].base === "name") {
                let rsplit = r.split("+");
                let checkreact = true;
                for (let c in rsplit) {
                    if (!this.getId(false).includes(rsplit[c])) {
                        checkreact = false;
                    }
                }
                if (checkreact) {
                    type.push(reactdict[r].name);
                }
            }
            else if (reactdict[r].base === "formula") {
                let rsplit = r.split("+");
                let checkreact = true;
                for (let c in rsplit) {
                    if (!this.getId(true).includes(rsplit[c])) {
                        checkreact = false;
                    }
                }
                if (checkreact && reactdict[r].std) {
                    type.push(r);
                }
            }
        }
        if (type === []) { type.push("none"); }
        return type;
    }

    //Perform calculations on the reaction
    calculate() {
        //STUB -- REMOVE WHEN GUI IS IMPLEMENTED
        console.log("Calculate");
        let precision = 4;
        for (let n in this.reactants[2]) {
            this.reactants[2][n] = round(25 /*Math.random()* 100*/ , precision, true);
        }
        //console.log(this.reactants[2]);

        this.reactants[3][0] = "g";

        this.products[3] = ["mol", "mol", "g"];

        //Tempurature, Pressure, Volume of Water
        this.conditions = [[298.15, 100, 10], ["K", "kPa", "L"]];
        //END STUB

        let newreact = [];

        //Convert all reactant values into moles
        for (let c in this.reactants[0]) {
            newreact.push(this.reactants[2][c]);
            newreact[c] = round(this.convertUnits(this.reactants[0][c], newreact[c], this.reactants[3][c], "mol"), precision);
        }

        //Get the basic mole ratio, Finding the smallest amounts (And the limiting reagent)
        let basicmol = newreact[0] / this.reactants[1][0];
        let limitreag = 0;
        let exchem = [];
        for (let c in this.reactants[0]) {
            if (basicmol > newreact[c] / this.reactants[1][c]) {
                basicmol = newreact[c] / this.reactants[1][c];
                limitreag = parseInt(c);
            }
        }
        for (let c in this.reactants[0]) {
            if (basicmol < newreact[c] / this.reactants[1][c]) {
                exchem.push(parseInt(c));
            }
        }

        //Add amount values to the products
        for (let c in this.products[0]) {
            this.products[2][c] = round(this.convertUnits(this.products[0][c], (this.products[1][c] * basicmol), "mol", this.products[3][c]), precision);
        }

        //Add excess chemical information
        for (let c in exchem) {
            this.excess[0][c] = this.reactants[0][exchem[c]];
            this.excess[1][c] = newreact[exchem[c]] - basicmol;
            this.excess[2][c] = "mol";
        }

        return this.reactants[0][limitreag];
    }

    //Converts unit amounts into others
    convertUnits(chem, val, oldu, newu) {
        let newval = 0;
        let newcons = [];
        
        //!!!NO IMPERIAL UNITS!!!
        //===Convert Conditions to Kelvins/Pascals===//
        //Celsius
        if (this.conditions[1][0].includes("C")) {
            newcons[0] = this.conditions[0][0] - 273.15;
        }
        //Kelvin
        else {
            newcons[0] = this.conditions[0][0];
        }

        //Pascals
        if (this.conditions[1][1].includes("Pa")) {
            newcons[1] = this.conditions[0][1];
            if (this.conditions[1][1].includes("m")) {
                newcons[1] *= 1/1000;
            }
            else if (this.conditions[1][1].includes("K")) {
                newcons[1] *= 1000;
            }
            else if (this.conditions[1][1].includes("M")) {
                newcons[1] *= 1000000;
            }
        }
        //Atmospheres
        else if (this.conditions[1][1].includes("atm")) {
            newcons[1] = this.conditions[0][1] * 101.325;
        }

        //Litres
        newcons[2] *= this.conditions[0][2];
        if (this.conditions[1][2].includes("m")) {
            newcons[2] *= 1 / 1000;
        } else if (this.conditions[1][2].includes("K")) {
            newcons[2] *= 1000;
        }

        //===Convert to moles===//
        //Units of amount
        if (oldu === "mol") {
            newval = val;
        }
        //Units of mass
        else if (oldu.includes("g")) {
            // n = m/M
            newval = val / chem.getMolarMass();
        }
        //Units of volume
        else if (oldu.includes("L")) {
            if (chem.getDriver("state") === "g") {
                // PV = nRT
                // n = PV/RT
                newval = (val * newcons[1]) / (8.3145 * newcons[0]);
            }
            else if (chem.getDriver("state") === "l") {
                newval = (val * chem.getDriver("density") * 1000) / chem.getMolarMass();
            }
        }
        //Units of Concentration
        else if (oldu.includes("M")) {
            newval = val * newcons[2];
        }

        //Manage SI Units
        if ((oldu.includes("m") && !oldu.includes("mol")) || oldu === "mmol") {
            newval *= 1 / 1000;
        }
        else if (oldu.includes("K")) {
            newval *= 1000;
        }
        else if (oldu.includes("µ")) {
            newval *= 1 / 1000000;
        }

        //===Convert out of moles===//
        //Units of amount
        if (newu.includes("mol")) {
            //Nothing
        }
        //Units of mass
        else if (newu.includes("g")) {
            // m = nM
            newval *= chem.getMolarMass();
            
        }
        //Units of volume
        else if (oldu.includes("L")) {
            // PV = nRT
            // V = nRT/P
            if (chem.getDriver("state") === "g") {
                newval = (8.3145 * val * newcons[0]) / (newcons[1]);
            } else if (chem.getDriver("state") === "l") {
                newval = (val * chem.getMolarMass()) / (chem.getDriver("density") * 1000);
            }
            
        }
        //Units of Concentration
        else if (oldu.includes("M")) {
            newval = val / newcons[2];
        }

        //Manage SI Units
        if ((newu.includes("m") && !newu.includes("mol")) || newu === "mmol") {
            newval *= 1000;
        }
        else if (newu.includes("K")) {
            newval *= 1 / 1000;
        }
        else if (newu.includes("µ")) {
            newval *= 1000000;
        }

        return newval;
    }

    //Get the Equilibrium constant for the reaction
    getEq() {
        let eq = 0;
        for (let r in reactdict) {
            if (reactdict[r].base == "formula" && reactdict[r].name == this.getReactionType()) {
                eq = reactdict[r].eq;
            }
        }
        return eq;
    }

    getId(formula) {
        let id = "";
        if (formula){
            for (let chem in this.reactants[0]) {
                id += this.reactants[0][chem].formula;
                if (chem != this.reactants[0].length - 1) {
                    id += "+";
                }
            }
        }
        else {
            for (let chem in this.reactants[0]) {
                id += this.reactants[0][chem].type;
                if (chem != this.reactants[0].length - 1) {
                    id += "+";
                }
            }
        }
        return id;
    }

    addToReact(formula, type = null, name = null) {
        this.products[0].push(new chemical(formula, name, type));
        this.products[1].push(1);
        this.products[2].push(0);
        this.products[3].push("mol");
    }
}

//STANDARD FUNCTIONS

//Get HCF between any two numbers (allows zero values as non-affectors)
function HCF(nums=[1]) {
    let factors = [];
    let index = 0;

    for (let c in nums) {
        if (nums[c] == 0 && index == c) {
            index++;
        }
        if (nums[c] > 0 && nums[c] < nums[index]) {
            index = c;
        }
    }

    for (let i = 1; i <= nums[index]; i++) {
        let div = true;
        for (let n in nums) {
            if (nums[n] % i != 0) {
                div = false;
            }
        }
        if (div) { factors.push(i) }
    }

    return factors[factors.length-1];
}

//Get LCM between any two numbers
function LCM(nums=[1]) {
    let lcm = 1;
    let products = [];

    for (let n in nums) {
        lcm *= nums[n];
    }
    for (let n in nums) {
        products[n] = lcm/nums[n];
    }

    let newhcf = HCF(products);
    lcm *= 1/newhcf;

    for (let n in nums) {
        products[n] *= 1 / newhcf;
    }

    return [products, lcm];
}

//Converts a getFormulaArray() structure to dictionary
function convertFormArrToDict(arr) {
    let dict = {};
    for (let c in arr) {
        dict[arr[c][0]] = arr[c][1];
    }
    return dict;
}

//Finds a specific item in the getFormulaArray() structure
function findChemInFormArr(arr, key) {
    return convertFormArrToDict(arr)[key];
}

//Rounds a number to a decimal place value or significant figure
function round(num, prec, dp=false) {
    if (dp) {
        return Math.round(num * Math.pow(10, prec)) / Math.pow(10, prec);
    }
    else {
        let numarr = num.toString().split('');
        let newnum = [];
        let sig = false;
        let sigstart = 0;
        let end = false;
        let endindex = 0;
        let isInteger = true;

        for (let i = 0; i < numarr.length; i++) {

            if (!end && !sig && numarr[i] !== "0" && numarr[i] !== ".") {
                sig = true;
                sigstart = i;
            }

            if (!end && sig) {
                newnum.push(numarr[i]);
            }
            else if (numarr[i] === ".") {
                newnum.push(".");
                isInteger = false;
            }
            else {
                newnum.push("0");
            }

            if (sig && i == prec + sigstart - 1) {
                end = true;
                endindex = i;
            }
        }

        if (end) {
            if (endindex >= numarr.length-1) {
                if (isInteger) {
                    newnum.push(".");
                    numarr.push(".");
                }
                newnum.push("0");
                numarr.push("0");
            }
            if (parseInt(numarr[endindex + 1]) >= 5 && newnum[endindex] !== "9") {
                newnum[endindex] = (parseInt(numarr[endindex]) + 1).toString();
            }
            else if (parseInt(numarr[endindex + 1]) >= 5 && newnum[endindex] === "9") {
                let x = 0
                while (x < endindex && newnum[endindex - x] === "9") {
                    x++;
                    newnum[endindex - x + 1] = "0";
                    if (newnum[endindex - x] !== ".") {
                        newnum[endindex - x] = (parseInt(numarr[endindex - 1]) + 1).toString();
                    }
                    else if (newnum[endindex - x - 1] !== ".") {
                        x++;
                        newnum[endindex - x] = (parseInt(numarr[endindex - x]) + 1).toString();
                    }
                }
                if (x == endindex) {
                    newnum[0] = "10";
                }
            }
        }

        return parseFloat(newnum.join(''));
    }
}