//=======JUNK ALGORITHIMS=======//
//Full of unused algoritims - May or may not work

function shuffle(array, num) {
    for (var i = 0; i < num; i++) {
        var a = Math.round(Math.random() * (array.length - 1));
        var b = Math.round(Math.random() * (array.length - 1));
        var temp = array[a];
        array[a] = array[b];
        array[b] = temp;
    }
    return array;
}

function binarySearch(array, num) {
    let min = 0;
    let max = array.length -1;
    let found = false;
    let mid = Math.round((min + max) / 2);
    let index = -1;
    while (!found && max >= min) {
        if (num == array[mid]) {
            found = true
            index = mid;
        }
        else if (num < array[mid]) {
            max = mid - 1;
        }
        else if (num > array[mid]) {
            min = mid + 1;
        }
        mid = Math.round((min + max) / 2);
    }
    return index;
}

function getMax(array) {
    let max = array[0];
    let index = 0;
    for (let i in array) {
        if (array[i] > max) {
            max = array[i];
            index = i;
        }
    }
    return [max, index];
}

function getMin(array) {
    let min = array[0];
    let index = 0;
    for (let i in array) {
        if (array[i] < min) {
            min = array[i];
            index = i;
        }
    }
    return [min, index];
}

//=======OTHER ALGORITHIMS=======//

//Capitalises the first letter in a string
function capitalize(string) {
    let x = string.split("");
    x[0] = x[0].toUpperCase()
    return x.join('');
}

//Ranks how alike/relevant the string parameter is to the base string
//Due to the ratioing, longer strings (usually names not formulas) are going to end up lower on the list
function rankString(base, string) {
    let score = 0;

    //The points are ratioed based on the proportion of the matching string to the whole string
    if (string.toLowerCase().includes(base.toLowerCase())) {
        score = 100 * base.length / string.length;
    }
    console.log(base, string);
    
    return score;
}

//Bubble sort an array of integer arrays or just integers -- integers will use no parameter
function bubbleSort(array, index = -1) {
    let swapped = true;
    while (swapped) {
        swapped = false;
        let compare = 0;
        while (compare < array.length - 1) {
            if (index >= 0 && array[compare][index] > array[compare + 1][index]) {

                let temp = array[compare];
                array[compare] = array[compare + 1];
                array[compare + 1] = temp;
                swapped = true;
            } else if (index == -1 && array[compare] > array[compare + 1]) {
                let temp = array[compare];
                array[compare] = array[compare + 1];
                array[compare + 1] = temp;
                swapped = true;
            }
            compare++;
        }
    }
    return array;
}

//Get HCF between any two numbers (allows zero values as non-affectors)
function HCF(nums = [1]) {
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
        if (div) {
            factors.push(i)
        }
    }

    return factors[factors.length - 1];
}

//Get LCM between any two numbers
function LCM(nums = [1]) {
    let lcm = 1;
    let products = [];

    for (let n in nums) {
        lcm *= nums[n];
    }
    for (let n in nums) {
        products[n] = lcm / nums[n];
    }

    let newhcf = HCF(products);
    lcm *= 1 / newhcf;

    for (let n in nums) {
        products[n] *= 1 / newhcf;
    }

    return [products, lcm];
}

//Rounds a number to a decimal place value or significant figure
function round(num, prec, dp = false) {
    if (dp) {
        return Math.round(num * Math.pow(10, prec)) / Math.pow(10, prec);
    } else {
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
            } else if (numarr[i] === ".") {
                newnum.push(".");
                isInteger = false;
            } else {
                newnum.push("0");
            }

            if (sig && i == prec + sigstart - 1) {
                end = true;
                endindex = i;
            }
        }

        if (end) {
            if (endindex >= numarr.length - 1) {
                if (isInteger) {
                    newnum.push(".");
                    numarr.push(".");
                }
                newnum.push("0");
                numarr.push("0");
            }
            if (parseInt(numarr[endindex + 1]) >= 5 && newnum[endindex] !== "9") {
                newnum[endindex] = (parseInt(numarr[endindex]) + 1).toString();
            } else if (parseInt(numarr[endindex + 1]) >= 5 && newnum[endindex] === "9") {
                let x = 0
                while (x < endindex && newnum[endindex - x] === "9") {
                    x++;
                    newnum[endindex - x + 1] = "0";
                    if (newnum[endindex - x] !== ".") {
                        newnum[endindex - x] = (parseInt(numarr[endindex - 1]) + 1).toString();
                    } else if (newnum[endindex - x - 1] !== ".") {
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