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

//Define the basic dictionaries so that bad things don't happen
let chemicaldict = {};
let chemDict = {};
let reactDict = {};

//The chemical class stores information on the individial chemical identities
class chemical {
    constructor(formula, name, type, ion=0, state=null) {
        this.formula = formula; this.name = name, this.type = type; this.ion = ion; this.state = state;
    }

    //Checks if the chemical is soluble in water
    isSoluble() {
        if(!this.formula === "H2O") { return true; }
        else { return false; }
    }

    //Search for the chemicals's tempurature-based attributes
    getDriver(driver) {
        //Get Melting point (m), Boiling point (b), Temurature (t), Enthalpy (h), Entropy (s)
        if (chemDict[this.formula] != null) {
            return chemDict[this.formula][driver];
        }
        else {
            return null;
        }
    }

    //Get the molar mass of the chemical
    getMolarMass() {
        let MM = 0;
        let farr = this.getFormulaArray();
        for (let chem in farr) {
            MM += (chemicaldict[farr[chem][0]] * farr[chem][1]);
        }
        return MM;
    }

    //Seperate fromula into array of the elements and their amounts
    //Example Outputs: "NaCl" => [["Na", 1], ["Cl", 1]]
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
    constructor(eq=false, reactants=[[], [], [], [], []], conditions=[[], []]) {
        this.reactants = reactants; //Array of 3-size arrays [chemical, Ratio, Amount, Units, State]
        this.conditions = conditions; //Tempurature, Pressure etc.
        this.isDynamic = eq; //Static or Dynamic
        this.excess = [[], [], [], []] //Excess unreacted chemicals [chemical, amount, units]

        this.products = [[], [], [], [], []];
        this.reacted = false;
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

        //Step 1
        let type = this.getReactionType();
        this.type = type;
        console.log(type);

        //Step 2
        if (!this.formulateProducts(type)) {
            return false;
        }
        console.log(this.products);

        //Step 3
        if (this.equalize()) {
            //Step 4
            this.reacted = true;
            console.log(this.calculate());
            
            return true;
        }
        else {
            return false;
        }
    }

    //Formulate the products based on the reaction type
    formulateProducts(type) {
        if (!type.includes("none")) {
            for (let i in type) {
                
                let item = type[i];
                //If the reaction type is a formula
                if (parseInt(item).toString() === "NaN") {
                    this.addToReact(item, null, chemDict[item].name);
                }

                //Go through every item in the reaction, seach through reactDict, and add the products to the list
                for (let r in reactDict) {
                    if (reactDict[r].id == item) {
                        //Once a formula is found, it will not matter if it's special or standard
                        type.splice(type.indexOf(item), 1)
                        if (!reactDict[r].std) {
                            for (let chem in reactDict[r].products.split("+")) {
                                let name = chemDict[reactDict[r].products.split("+")[chem]].name;
                                this.addToReact(reactDict[r].products.split("+")[chem], null, name);
                            }
                        }
                        /* Standardised System -- Not in use
                        else {
                            //Implement standardized system
                            for (let c in reactDict[r].products.split("+")) {
                                let chem = reactDict[r].products.split("+")[c];
                                if (chem === "water") { this.addToReact("H2O", chem, chem); }
                                if (chem === "oxygen") { this.addToReact("O2", chem, chem); }
                                if (chem === "acid") { 
                                    //
                                    this.addToReact("H2O", chem, chem); 
                                }
                            }
                            //console.log(this.products);
                        }
                        */
                    }
                }
            }
        } else {
            return false;
        }

        return true;
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
            for (let c in reactnum) {
                if (reactnum[c] == prodnum[c]) {
                    igset.push(c);
                }
            }
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

            //Eliminate the chemicals that exist on both sides, i.e. H2O + _ -> _ + H2O
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

            //Define the smallest ratio chem value
            let min = findChemInFormArr(this.multiplyRatioes(set[0][useable[0]].getFormulaArray(), 0, set), chem);

            let finalindex = -1;
            let indexlist = [];

            //Determine the usability of the chemical
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

        //Checks the reaction data for equalities via use of the HCF/GCD of the data -- No return
        let checkUsingHCF = () => {

            let equals = {}

            //Ignore all of the equal chemicals
            for (let r in this.reactants[0]) {
                for (let p in this.products[0]) {
                    if (this.reactants[0][r] === this.reactants[0][p] && this.reactants[1][r] == this.products[1][p]) {
                        equals[this.reactants[0][r].formula] = [r, p];
                    }
                }
            }

            let newreacts = []; let newprods = [];
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

            //Divide both sides by HCF
            checkUsingHCF();

            //Gets the amounts of elements on both sides to check if equal
            [reactnum, prodnum, equal] = this.getEqualizerAmts();

            iteration++;
            console.log("ITERATION: " + iteration);

            //After 1000 recycles, it is clear that the reaction won't work and the program will not calculate an answer
            if (iteration >= 1000) {
                complete = false;
                break;
            }
        }

        checkUsingHCF();
        return complete;
    }

    //Returns a list of dictionaries+booleans, determining the amounts of elements on each side
    //i.e. {"Na":4}
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
                    reactnum[newarr[e][0]] += newarr[e][1];
                }
                else {
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
                    prodnum[newarr[e][0]] += newarr[e][1];
                } else {
                    prodnum[newarr[e][0]] = newarr[e][1];
                }
            }
        }

        //Check for equality
        let equal = true;
        for (let e in reactnum) {
            if (reactnum[e] != prodnum[e]) {
                equal = false;
            }
        }
        return [reactnum, prodnum, equal]
    }

    //Multiplies the mole ratoes to a list
    multiplyRatioes(arr, index, set) {
        for (let c in arr) {
            arr[c][1] *= set[1][index];
        }
        return arr;
    }

    //Determine the reaction type 
    getReactionType() {
        let type = [];
        let reactantsList = [];

        for (let r in this.reactants[0]) {
            reactantsList[r] = this.reactants[0][r].formula;
        }

        for (let r in reactDict) {

            /* Only neccesary for the formulateProducts() if general-case reactdicts are used
            if (reactDict[r].base === "name") {
                let rsplit = r.split("+");
                let checkreact = true;
                for (let c in rsplit) {
                    if (!this.getId(false).includes(rsplit[c])) {
                        checkreact = false;
                    }
                }
                if (checkreact) {
                    type.push(reactDict[r].id);
                }
            }
            */

            //Non-standard reactions
            if (reactDict[r].base === "formula") {
                let rsplit = r.split("+");
                let checkreact = true;
                let formulaStores = [];

                //Check if each chemical matches
                for (let c in rsplit) {
                    if (!this.getId(true).includes(rsplit[c])) {
                        checkreact = false;
                    }
                    else {
                        formulaStores.push(rsplit[c]);
                    }
                }

                //Once it is found that it is a valid reaction
                if (checkreact) {
                    type.push(reactDict[r].id.toString());

                    //Remove reactants from list to prevent duplicates
                    for (let i in formulaStores) {
                        for (let c in reactantsList) {
                            if (reactantsList[c] === formulaStores[i]) {
                                reactantsList.splice(c, 1);
                            }
                        }
                    }
                }
            }
        }
        
        console.log(reactantsList[0]);
        //Excess chemicals that aren't apart of any reaction are added as strings
        for (let c in reactantsList) {
            type.push(reactantsList[c]);
        }

        console.log(type);

        //If else, add "none"
        if (type.length == 0) { type.push("none"); }
        return type;
    }

    //Perform calculations on the reaction
    calculate() {
        console.log("Calculate");

        //Prescision is pre-set
        let precision = 10;

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
                exchem.push(parseFloat(c));
            }
        }

        //Add amount values to the products
        for (let c in this.products[0]) {
            this.products[2][c] = round(this.products[1][c] * basicmol, precision) //round(this.convertUnits(this.products[0][c], (this.products[1][c] * basicmol), "mol", this.products[3][c]), precision);
        }

        //Add excess chemical information
        for (let c in exchem) {
            this.excess[0][c] = this.reactants[0][exchem[c]];
            this.excess[1][c] = ""; //Just a dummy set so that the display can show excess chemicals
            this.excess[2][c] = newreact[exchem[c]] - basicmol;
            this.excess[3][c] = "mol";
        }

        return this.reactants[0][limitreag];
    }

    //Converts unit amounts into others
    convertUnits(chem, val, oldu, newu, returnnewcons=false) {
        let newval = 0;
        let newcons = [];
        
        //!!!NO IMPERIAL UNITS!!!
        //===Convert Conditions to Kelvins/Pascals===//
        //Celsius
        if (this.conditions[1][0].includes("C")) {
            newcons[0] = this.conditions[0][0] + 273.15;
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
        newcons[2] = this.conditions[0][2];
        if (this.conditions[1][2].includes("m")) {
            newcons[2] *= 1 / 1000;
        } else if (this.conditions[1][2].includes("K")) {
            newcons[2] *= 1000;
        }

        if (returnnewcons) {
            return newcons;
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

    //Gets the id of the formula (not reactdict ID but string-reactants based id)
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

    //Adds a chemical to products
    addToReact(formula, type = null, name = null) {
        let chem = new chemical(formula, name, type);
        chem.ion = chem.getDriver('ion');
        this.products[0].push(chem);
        this.products[1].push(1);
        this.products[2].push(0);
        this.products[3].push("mol");
        this.products[4].push(null);
    }

    //Gets and Returns the state of any chemicals in the reaction
    //Lotta if statements to test each possibility -- no way aroud it
    getState(chem, react) {
        let conds = this.convertUnits(null, null, null, "K", true);
        let state = "";

        //If all is null
        if (chem.getDriver("state") != null && chem.getDriver("state") !== "") {
            state = chem.getDriver("state");
        }

        //Check if there is already a state
        if (react && chem.state != null) {
            state = chem.state;
        }

        //Go through each combination of boiling point
        if (chem.getDriver('mp') == null || chem.getDriver('bp') == null) {
            state = null;
            let aqflag = false;
            for (let c in this.reactants[4]) {
                if (this.reactants[4][c] === "aq") {
                    aqflag = true;
                }
            }
            if (aqflag) {
                //state = "aq";
                //All salts are aqueous
                if (chem.isSoluble()) {
                    state = "aq";
                }
                else {
                    if (chem.getDriver('bp') < conds[0]) {
                        state = "g";
                    }
                    else {
                        state = "s";
                    }
                }
            }
            else {
                if (chem.getDriver('bp') < conds[0]) {
                    state = "g";
                } else {
                    state = "s";
                }
            }
        }
        else if (chem.getDriver('mp') < conds[0] && conds[0] < chem.getDriver('bp')) {
            state = "l";
        }
        else if (chem.getDriver('mp') > conds[0]) {
            state = "s";
        }
        else if (chem.getDriver('bp') < conds[0]) {
            state = "g";
        }

        //Special cases for combustion/ions
        if (this.reacted || reactDict[this.getReactDictR()] != undefined) {
            if (reactDict[this.getReactDictR()].name === "combustion" && chem.formula === "H2O") {
                state = "g";
            }
            else if (reactDict[this.getReactDictR()].name === "dissolution") {
                state = "aq";
            }
            else if (parseInt(chem.getDriver('ion')) != 0) {
                chem.ion = parseInt(chem.getDriver('ion'));
                state = "aq";
            }
        }

        return state;
    }

    //Clears the reaction
    clear() {
        this.products = [[], [], [], [], []];
        this.conditions = [[], []];
    }

    //Gets the reaction dictionary object
    getReactDictR() {
        let returnid = null;
        for (let r in reactDict){
            let contains = true;
            for (let c in this.reactants[0]) {
                if (!r.includes(this.reactants[0][c].formula) && (this.reacted && !this.type.includes(this.reactants[0][c].formula))) {
                    contains = false;
                }
            }

            if (contains) {
                returnid = r;
                break;
            }
        }
        return returnid;
    }
}

//STANDARD FUNCTIONS NOT IN STANDARDALGOS.JS -- SPECIFIC TO CLASSES

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