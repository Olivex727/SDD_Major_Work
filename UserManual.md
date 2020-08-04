# User Manual

## Basic Information

The Reactit! Calculator's goal is to provide an easier way of calculating basic chemical reactions for high school and university students. It will require prior knowlege to be able to operate, hence the target audience, however, it can help individual learning especially for those in Years 10 and 11. A majority of the reactions as well as the information accesible from the program will be geared towards New South Wales Preliminary/HSC Chemistry.

## Installation

In order to install the software:
1. Download this GitHub Repository as a zip file. And move the file to the desired folder.
2. Open the zip file.
3. Open a terminal window and enter the following commands, filling in the square brackets with the information about the zip file:
- cd [File location*]
- npm install
- npm start
4. Go to the URL in a **Chrome Browser**: localhost:8000

*You can also drag and drop the folder icon (appearing at the top of the bar) on finder into the terminal of the file's location into terminal - this requires that the finder window be displaying the contents of the zip file.
![./public/user_manual/filepath.png](./public/user_manual/filepath.png)

## Processes

#### Searching Chemicals

The search bar located on the right side of the screen will allow you to select from a set list of chemicals. Enter in the full name of the chemicals (i.e. Water or Sodium Chloride) to get a set of suggested results. Once you have found your desired chemical, click on it.

#### Adding Chemicals to the list

Once you have selected a chemical from the search bar, the chemical will appear below. At this point, you can change the amount/mass/concentration of the chemical you want to add to the reaction. This requires that you select a unit measure from the drop-down list and enter a numerical value in the text box. Click the button labelled 'Add'.

***Note: Once you click the 'Add' button, the chemical cannot be removed from the reaction interface. If you want to change the chemical, you need to click the 'Delete' button, which will clear the reaction interface.***

#### Setting the reaction conditions

Above the reaction interface is a series of text boxes and drop-down lists. From left to right, these lists allow you to: change the tempurature of the reaction; change the pressure the reactio noccurs at; change the volume of the vessel. Select the units you want to use and enter a numerical value into the text box. Note that if you enter a negative or zero value at any point (Except for Celcius at -273.15), the number in the text box will switch to one. Changing the units will automatically convert the number to the desired unit.

#### Reaction

Once the desired inputs have been implemented, click the 'React' button to begin the reaction. The lower area of the page will display the results. The reaction may take some time.

## Troubleshooting

These are, most likely, the questions that you may need answering when figuring out problems and issues with this program.

**Why can I only select a limited amount of chemicals?**

You can only do such because of the complexity of reactions that are allowed. Trying to include all chemicals known to man can be a daunting task and it is better to worry about conducting the research on the most commonly occuring ones.

**Why is the reaction button not working/taking too long?**

The problem may come from the following sources:
- You inputted is incalculable, try making sure the right chemicals such as catalysts or water are included
- The reaction is not in the program's database due to similar reasons in the questions above
- The mole ratioes of the inputted reaction are too high, meaning that the program will call it quits before the numbers can be produced
- You may have not entered a valid reaction. Ensure that the reactants will actually produce a product

**Why are the numbers being displayed read zero? Why are the numbers not accurate?**

You have most likely inputted a number that is too small to calculate or that you used too many significant figures. As a standard, 5 significant figures are used

**Where are the imperial units?**

We use metric units only because this is a scientific tool. And this has been developed in Australia.

**How precise are the constants used?**

The constants are kept to 4 significant figures (i.e. Ideal Gas Constant). For other information pertaining to individual chemicals, it can vary depending on what can be dug up online.

## GUI Help

## Reactions

The reaction button contains most of the mahic of the program. The way it works is in a few simple steps:

1. Find the type of reaction (i.e. Combustion, Harber Process etc.)
2. Assign the products based on the type (e.g. complete hydrocarbon combustion reactions produce water and carbon dioxide)
3. Equalize both sides of the reaction
4. Calculate any necessary amount values
5. Extra feature values such as equilibria or acid/base