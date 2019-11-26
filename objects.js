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
let chemicaldict = {}

//The chemical class stores information on the individial chemical identities
class chemical {
    constructor(formula, name, type, ion=0) {
        this.formula = formula; this.name = name, this.type = type; this.ion = ion;
    }

    //Search for the chemicals's tempurature-based attributes
    getDriver(driver) {
        //Get Melting point (m), Boiling point (b), Temurature (t), Enthalpy (h), Entropy (s)
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

        for (let c in farr){
            let char = farr[c];
            //console.log(char);
            if (char == char.toUpperCase() && isNaN(char) && c != 0) {
                if (!checknumflag) {
                    number = 1;
                }
                returnformula.push([templist.join(""), number]);
                templist = [];
                number = 1;
                templist.push(char);
                //console.log("Upper");
            }
            else if (!isNaN(char)) {
                number = parseInt(char);
                checknumflag = true;
                //console.log("Num");
            }
            else {
                templist.push(char);
                //console.log("Else");
            }
        }

        //Rerun algorithim for the end of the string/list
        if (!checknumflag) {
            number = 1;
        }
        returnformula.push([templist.join(""), number]);

        //All number entries go to seperate arrays
        return returnformula;
    }
}

//Formula class is where all of the main reaction stuff is handled
class formula {
    constructor(id, eq, reactants=[], conditions=[]) {
        this.id = id;
        this.reactants = reactants; //Array of 3-size arrays [chemichal, Amount, Units]
        this.conditions = conditions;
        this.isDynamic = eq; //Static or Dynamic

        this.products = [];
        this.equilibrum = getEq();
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

        let type = this.getReactionType();
        this.formulateProducts(type);
        this.equalize();
        this.calculate();
    }

    //Formulate the products based on the reaction type
    formulateProducts(type) {

    }

    //Equalise both sides of the reaction
    equalize() {

    }

    //Determine the reaction type
    getReactionType() {
        return "none";
    }

    //Perform calculations on the reaction
    calculate() {

    }

    //Get the Equilibrium constant for the reaction
    getEq() {
        return 0;
    }
}