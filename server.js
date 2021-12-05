const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3002;
const app = express();
// middle ware: parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// middle ware cont: parse incoming JSON data 
app.use(express.json());

const { animals } = require('./data/animals.json');


function filterByQuery(query, animalsArray) {
    let filteredResults = animalsArray;
    let personalityTraitsArray = [];
    
    if (query.personalityTraits) {
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits]
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
    }
    // loop through each trait in the array
    personalityTraitsArray.forEach(trait => {
        filteredResults = filteredResults.filter(animal => animal.personalityTraits.indexOf(trait) !== -1);
    });
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);    
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species)
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name)
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

//returns new animal from POST
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'), JSON.stringify({ animals: animalsArray }, null, 2)
    );

    // return finished code to post route for response
    return animal;
}

// get routes
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404)
    }

});

// post routes
app.post('/api/animals', (req, res) => {
    //set id on what next index of array will be
    req.body.id = animals.length.toString();

    // if data from req.body is incorrect send 400 error
    if (!validateAnimal(req.body)) {
        res.status(400).send('400 error. Animal not properly formated.')
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});

// listen if server is on
app.listen(PORT,() => {
    console.log(`API server now on port ${PORT} yeee!`)
});

// Validate
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
};