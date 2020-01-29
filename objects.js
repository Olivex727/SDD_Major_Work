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

        //All number entries go to seperate arrays
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
       console.log(reactdict);
        let type = this.getReactionType();
        console.log(type);
        this.formulateProducts(type);
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
                                this.products[0].push(new chemical(reactdict[r].products.split("+")[chem]));
                                this.products[1].push(1);
                                this.products[2].push(0);
                                this.products[3].push("mol");
                            }
                            console.log(this.products);
                        }
                        else {
                            //Implement standardized system
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
}

//STANDARD FUNCTIONS

//Get HCF between any two numbers
function HCF(nums=[1]) {
    let div = true;
    let factor = 1;
    while(div) {
        factor++;
        div = true;
        for (let n in nums) {
            if (!Number.isInteger(nums[n] / factor)) {
                div = false;
            }
        }
        
    }
    return factor-1;
}