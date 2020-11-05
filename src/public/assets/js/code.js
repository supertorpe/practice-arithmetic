let data;

let currentExercise;

const initialize = function () {
    const jsonData = localStorage.getItem("data");
    if (!jsonData) {
        data = [];
        for (let i = 0; i < 8; i++) {
            let exercise = {
                boxes: []
            };
            data.push(exercise);
            for (let j = 0; j < 5; j++) {
                exercise.boxes.push({
                    count: 0,
                    stack: []
                });
            }
        }
        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 10; j++) {
                data[0].boxes[2].stack.push({ query: `${i} + ${j} = _`, ans: i + j, count: 0 });
            }
        }
        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 10; j++) {
                data[1].boxes[2].stack.push({ query: `${i} + _ = ${i + j}`, ans: j, count: 0 });
                data[1].boxes[2].stack.push({ query: `_ + ${j} = ${i + j}`, ans: i, count: 0 });
            }
        }
        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 10; j++) {
                if (i > j)
                    data[2].boxes[2].stack.push({ query: `${i} - ${j} = _`, ans: i - j, count: 0 });
            }
        }
        for (let i = 1; i < 10; i++) {
            for (let j = 1; j < 10; j++) {
                if (i > j) {
                    data[3].boxes[2].stack.push({ query: `${i} - _ = ${i - j}`, ans: j, count: 0 });
                    data[3].boxes[2].stack.push({ query: `_ - ${j} = ${i - j}`, ans: i, count: 0 });
                }
            }
        }
        for (let i = 2; i < 10; i++) {
            for (let j = 2; j < 10; j++) {
                data[4].boxes[2].stack.push({ query: `${i} x ${j} = _`, ans: i * j, count: 0 });
            }
        }
        for (let i = 2; i < 10; i++) {
            for (let j = 2; j < 10; j++) {
                data[5].boxes[2].stack.push({ query: `${i} x _ = ${i * j}`, ans: j, count: 0 });
                data[5].boxes[2].stack.push({ query: `_ x ${j} = ${i * j}`, ans: i, count: 0 });
            }
        }
        for (let i = 2; i < 10; i++) {
            for (let j = 2; j < 10; j++) {
                data[6].boxes[2].stack.push({ query: `${i * j} / ${i} = _`, ans: j, count: 0 });
            }
        }
        for (let i = 2; i < 10; i++) {
            for (let j = 2; j < 10; j++) {
                data[7].boxes[2].stack.push({ query: `${i * j} / _ = ${i}`, ans: j, count: 0 });
                data[7].boxes[2].stack.push({ query: `_ / ${i} = ${j}`, ans: i * j, count: 0 });
            }
        }
        localStorage.setItem("data", JSON.stringify(data));
    } else {
        data = JSON.parse(jsonData);
    }

    document.querySelector('.home').style.display = 'none';
    document.querySelector('.challenge').style.display = 'inline';

    updateCounters();
    window.onkeydown = function (event) {
        if (isFinite(event.key)) clickDigit(event.key);
    };
    nextChallenge();
};

const begin = function (exercise) {
    currentExercise = exercise;
    initialize();
};

let updateCounters = function () {
    document.querySelector(".uno").innerHTML = data[currentExercise].boxes[0].stack.length;
    document.querySelector(".dos").innerHTML = data[currentExercise].boxes[1].stack.length;
    document.querySelector(".tres").innerHTML = data[currentExercise].boxes[2].stack.length;
    document.querySelector(".cuatro").innerHTML = data[currentExercise].boxes[3].stack.length;
    document.querySelector(".cinco").innerHTML = data[currentExercise].boxes[4].stack.length;
};

let currentChallenge = {
    idxBox: -1,
    idxChallenge: -1,
    challenge: null,
    answer: ""
};

const nextChallenge = function () {
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
    document.querySelector(".timer").innerHTML = "";
    document.querySelector(".question").style.textDecoration = "";
    document.querySelector(".question-right").innerHTML = "";
    // buscar la caja
    let candidate = 0;
    // si está en la primera pasada, pillar el candidato de la caja central
    if (isInInitialPhase()) {
        candidate = 2;
    } else {
        // si no, localizar la caja de la que extraer el challenge
        for (let i = 0; i < data[currentExercise].boxes.length; i++) {
            if (data[currentExercise].boxes[i].stack.length === 0) continue;
            if (data[currentExercise].boxes[candidate].stack.length === 0) candidate = i;
            if (candidate === data.length - 1) break;
            if (
                i > candidate &&
                data[currentExercise].boxes[candidate].count > data[currentExercise].boxes[i].count * 3 * (i - candidate)
            )
                candidate = i;
        }
    }
    // seleccionar uno al azar
    currentChallenge.idxBox = candidate;
    currentChallenge.idxChallenge = Math.floor(
        Math.random() * data[currentExercise].boxes[candidate].stack.length
    );
    currentChallenge.challenge =
        data[currentExercise].boxes[currentChallenge.idxBox].stack[currentChallenge.idxChallenge];
    document.querySelector(".question").innerHTML =
        currentChallenge.challenge.query;
    currentChallenge.answer = "";
    if (!isInInitialPhase()) data[currentExercise].boxes[candidate].count++;
    if (currentChallenge.challenge.count > 0) {
        startTimer(2 + (data[currentExercise].boxes.length - candidate) * 3);
    } else {
        startTimer(10);
    }
};

const isInInitialPhase = function () {
    return data[currentExercise].boxes[2].stack.length > 0 && data[currentExercise].boxes[2].count === 0;
};

let timer;

const clearTimer = function () {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
};

const startTimer = function (time) {
    clearTimer();
    document.querySelector(".timer").innerHTML = time;
    timer = setInterval(function () {
        time--;
        document.querySelector(".timer").innerHTML = time;
        if (time === 0) {
            manageError();
        }
    }, 1000);
};

const manageError = function () {
    clearTimer();
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox > 0) {
        // moverlo de caja
        data[currentExercise].boxes[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentExercise].boxes[currentChallenge.idxBox - 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox - 1].count++;
    }
    saveData();

    document.querySelector(
        ".question-right"
    ).innerHTML = currentChallenge.challenge.query.replace(
        "_",
        currentChallenge.challenge.ans
    );
    document.querySelector(".question").style.textDecoration = "line-through";
    const timeout = setTimeout(function () {
        clearTimeout(timeout);
        nextChallenge();
    }, 3000);
};

const manageSuccess = function () {
    clearTimer();
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox < data[currentExercise].boxes.length - 1) {
        // moverlo de caja
        data[currentExercise].boxes[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentExercise].boxes[currentChallenge.idxBox + 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox + 1].count++;
    }
    saveData();
    const timeout = setTimeout(function () {
        clearTimeout(timeout);
        nextChallenge();
    }, 1000);
};

const saveData = function () {
    localStorage.setItem("data", JSON.stringify(data));
    updateCounters();
};

const clickDigit = function (digit) {
    if (!timer) return false;
    currentChallenge.answer += digit;
    let replacement = digit;
    if (
        currentChallenge.challenge.ans.toString().length >
        currentChallenge.answer.length
    )
        replacement += "_";
    document.querySelector(".question").innerHTML = document
        .querySelector(".question")
        .innerHTML.replace("_", replacement);
    const correctAnswer = currentChallenge.challenge.ans.toString();
    if (correctAnswer == currentChallenge.answer) {
        manageSuccess();
    } else {
        if (
            currentChallenge.answer.length > correctAnswer.length ||
            (correctAnswer.length == currentChallenge.answer.length &&
                correctAnswer != currentChallenge.answer)
        )
            manageError();
    }
};

const reset = function () {
    if (confirm("¿Quieres eliminar todos tus avances?")) {
        localStorage.removeItem("data");
        initialize();
    }
};

const stop = function () {
    clearTimer();
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#start').style.display = 'inline';
};

const start = function () {
    nextChallenge();
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
};

const home = function () {
    clearTimer();
    document.querySelector('.home').style.display = 'inline';
    document.querySelector('.challenge').style.display = 'none';
};

window.onload = () => {
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}