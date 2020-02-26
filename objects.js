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

//Formula class is where all of the main reaction stuff is handled
class formula {
    constructor(eq, reactants=[[], [], [], []], conditions=[]) {
        this.reactants = reactants; //Array of 3-size arrays [chemichal, Ratio, Amount, Units]
        this.conditions = conditions;
        this.isDynamic = eq; //Static or Dynamic

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
        this.equalize();
        this.calculate();
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
        * FUNCTIONS:
        * getEqualizerAmounts() -- Gets the amouns of elements on both sides
        * findSmallest() -- Finds the smallest chemichal containing smallest amount
        * HCF() -- Standard algoritim, finds HCF between an array of numbers
        * 
        */
        /*
        console.log("CALCULATE");
        let [reactnum, prodnum, equal] = this.getEqualizerAmts();
        console.log(reactnum);console.log(prodnum);console.log(equal);
        if (!equal) {
            for (let c in chemicaldict) {
                //console.log(Object.keys(chemicaldict).reverse()[c]);
                if (c !== "H" && c !== "O" && Object.keys(reactnum).includes(x)) {
                    let psmall = reactnum[c] > prodnum[c];
                    
                }
            }
        }
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
            //console.log(lowest + " " + low);
            return [lowest, low];
        }

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
    
        //ignore is the most recent element to reach equality. ignoreset is the list that have achived equality
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

            //console.log(indexes, ignore, ignoreset);

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

            //If the list is still empty, then just set it to a default value
            if (indexes.length == 0) {
                indexes.push(0);
            }
            

            return indexes;

        }

        let findSmallestChem = (set, chem, ignore = "", ignoreset=[]) => { //set is this.reactants or this.products //chem is name
            //Min value of number in chemical array
            //Needs to get the set of all minimum element values and choose the ones with the lowest MM

            //The selection process for usable chemicals
            let useable = determineUsability(set, chem, ignore, ignoreset);
            console.log("USEABLE: " + useable);

            let min = 0;
            //IF <the ignored chemicals are not in the set> AND <The set contains more than one term> AND <If the 1st formula is not a number>

            //if (set[0].length > 1 && isNaN(findChemInFormArr(this.multiplyRatioes(set[0][0].getFormulaArray(), 0, set), chem))) {
            min = findChemInFormArr(this.multiplyRatioes(set[0][useable[0]].getFormulaArray(), 0, set), chem);
            //} else {
            //  min = findChemInFormArr(this.multiplyRatioes(set[0][0].getFormulaArray(), 0, set), chem);
            //}
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
            //console.log(min);
            //console.log(indexlist);

            //indexlist.splice(0, 1);
            //console.log(indexlist);
            //console.log([set[0], indexlist]);

            //Search for the minimum Molar Mass value
            let minMM = set[0][indexlist[0]].getMolarMass();
            for (let i = 0; i < indexlist.length; i++) {
                if (set[0][indexlist[i]].getMolarMass() <= minMM){
                    minMM = set[0][indexlist[i]].getMolarMass();
                    finalindex = indexlist[i];
                }
            }
            //console.log(finalindex);

            if (finalindex >= 0) {
                return finalindex;
            } else {
                throw Error("Looks like there was a problem in finding the molar masses, finalindex = "+finalindex)
            }
        }

        let [reactnum, prodnum, equal] = this.getEqualizerAmts();
        let iteration = 0;
        let ignore = "";
        let ignoreset = [];

        while (!equal) {

            let [element, lowreact] = findSmallest(reactnum, ignore);
            let lowprod = prodnum[element];

            ignoreset = determineIgnoreSet(reactnum, prodnum, element);

            //console.log([element, lowreact, lowprod]);
            console.log(element);

            if (lowprod < lowreact) {
                //console.log([element, lowreact, lowprod]);
                //console.log(3.1);
                let index = findSmallestChem(this.products, element, ignore, ignoreset);
                this.products[1][index]++;
                //console.log(this.products);
            }
            else if (lowprod > lowreact) {
                //console.log(3.3);
                let index = findSmallestChem(this.reactants, element, ignore, ignoreset);
                this.reactants[1][index]++;
                //console.log(this.reactants);
            }
            else if (lowprod == lowreact) {
                //Do Nothing
                console.log("EQUAL");
                //console.log(this.reactants);
                //console.log(this.products);
                ignore = element;
            }
            
            [reactnum, prodnum, equal] = this.getEqualizerAmts();

            iteration++;
            console.log(this.products);
            console.log(this.reactants);
            console.log("ITERATION: " + iteration);
            if (iteration >= 100) {
                break;
            }
        }
        console.log(equal);
    }

    getEqualizerAmts() {
        let reactnum = {};
        let prodnum = {}
        let newarr = []

        //Reactants
        for (let c in this.reactants[0]) {
            let chem = this.reactants[0][c];
            newarr = this.multiplyRatioes(chem.getFormulaArray(), c, this.reactants);
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
        for (let c in this.products[0]) {
            let chem = this.products[0][c];
            newarr = this.multiplyRatioes(chem.getFormulaArray(), c, this.products);
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
        //
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

//Get HCF between any two numbers
function HCF(nums=[1]) {
    let div = true;
    let factor = 1;
    while(div) {
        factor++;
        for (let n in nums) {
            if (!Number.isInteger(nums[n] / factor)) {
                div = false;
            }
        }     
    }
    return factor-1;
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

//console.log(LCM([3, 2, 2]));