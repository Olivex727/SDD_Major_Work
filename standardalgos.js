console.log("STANDARD ALGOS");

let arr = []

function fillArray(array, length) {
    length--;
    let randInt = 0;
    let randIndex = 0;
    for (let i = 0; i < length+1; i++) {
        randInt = Math.round(Math.random() * length);
        while (!isNaN(array[randIndex])){
            randIndex = Math.round(Math.random() * length);
        }
        array[randIndex] = randInt;
    }
    return array;
}

//Testing stuff \/
fillArray(arr, 10);
shuffle(arr, 1000)
console.log(arr);
bubbleSort(arr);
console.log("Insertion: ");
console.log(arr);
console.log(getMax(arr)[0]);
console.log(getMin(arr)[0]);
console.log(binarySearch(arr, 4));
//Testing stuff /\

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

function bubbleSort(array) {
    let swapped = true;
    while (swapped) {
        swapped = false;
        let compare = 0;
        while (compare < array.length-1) {
            if (array[compare] > array[compare+1]) {
                let temp = array[compare];
                array[compare] = array[compare+1];
                array[compare+1] = temp;
                swapped = true;
            }
            compare++;
        }
    }
    return array;
}

function selectionSort(array) {
    let min = 0;
    for (let i = 0; i < array.length; i++) {
        min = getMin()[1];
        temp = array[i];
        array[i] = array[min];
        array[min] = temp;
    }
    return array;
}

function insertionSort(array) {
    for (let i = 1; i < array.length; i++) {
        for (let comp = 0; comp < array.length; comp++) {
            if (array[comp] >= array[i]) {
                let temp = array[i];
                if (i < comp) {
                    for (let t = i + 1; t <= comp; t++) {
                        array[t-1] = array[t];
                    }
                }
                if (i > comp) {
                    for (let t = i-1; t >= comp; t--) {
                        array[t+1] = array[t];
                    }
                }
                array[comp] = temp;
            }
        }
    }
    return array;
}

function linearSearch(array, num) {
    let index = -1;
    for (let i in array) {
        if (array[i] == num) {
            index = i;
            break;
        }
    }
    return index;
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

console.log(capitalize("lol"));

function capitalize(string) {
    let x = string.split("");
    x[0] = x[0].toUpperCase()
    return x.join('');
}

console.log("END STANDARD ALGOS");