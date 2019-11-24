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

class chemical {
    constructor(formula, name, type, ion=0) {
        this.formula = formula; this.name = name, this.type = type; this.ion = ion;
    }

    //Search for the element's tempurature-based attributes
    getDriver(driver) {
        //Get Melting point (m), Boiling point (b), Temurature (t), Enthalpy (h), Entropy (s)
    }

    //Get the molar mass of the element
    getMolarMass() {

    }

    //Seperate fromula into array of the elements and their amounts
    getFormulaArray() {
        //Split formula into array
        //Form elements by adding to strings starting with capitals
        //All number entries go to seperate arrays
    }
}

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