//Main user controls file

console.log("BEGIN PROGRAM");

salt1 = new chemical("NaCl", "Soduim Chloride", "salt", 0);
ion1 = new chemical("NO3", "Nitrate ion", "salt", -1);

console.log(salt1.getFormulaArray());
console.log(ion1.getFormulaArray());

console.log(salt1.getMolarMass());
console.log(ion1.getMolarMass());