var request = require('request'),
    Q = require('q');

module.exports = {}

module.exports.getPokemon = function(name) {
  var deferred = Q.defer();
  request("http://pokeapi.co/api/v2/pokemon/"+name, function (error, response, body) {
    if (response.statusCode == 200) {
      deferred.resolve(JSON.parse(body));
    } else {
      deferred.reject(new Error("Error Getting Pokemon"));
    }
  })
  return deferred.promise;
}

module.exports.getSprite = function(url) {
  var deferred = Q.defer();
  request(url, function (error, response, body) {
    if (response.statusCode == 200) {
      deferred.resolve(JSON.parse(body));
    } else {
      deferred.reject(new Error("Error Getting Sprite"));
    }
  })
  return deferred.promise;
}

module.exports.getMove = function(url) {
  var deferred = Q.defer();
  request(url, function (error, response, body) {
    console.log("Error: " + error)
    console.log("Response: " + response)
    console.log("Body: " + body)
    if (response.statusCode == 200) {
      deferred.resolve(JSON.parse(body));
    } else {
      deferred.reject(new Error("Error Getting Move"));
    }
  })
  return deferred.promise;


/*
* Calculates the effectiveness of one move on a pokemon with 1 or 2 types.
* When accessing a move from the API, it will return with three arrays that look like this:
* "super_effective": [{name:"fairy", resource_uri:"/api/v2/type/18"} ... ]
* We only care about the name, so we map these arrays to something like:
* supereffective = ["fairy", "ice", ...]
* then we can go through and calculate the damage multiplier based on the three arrays.
*/
module.exports.getAttackMultiplier = function(offensive, defensive1, defensive2) {
  var multiplier = 1,
      typesArray = [
        "normal", //1
        "fighting",
        "flying",
        "poison",
        "ground",
        "rock",
        "bug",
        "ghost",
        "steel",
        "fire",
        "water",
        "grass",
        "electric",
        "psychic",
        "ice",
        "dragon",
        "dark",
        "fairy" //18
      ],
      typeID = typesArray.indexOf(offensive.toLowerCase()) + 1,
      deferred = Q.defer();
  request("http://pokeapi.co/api/v2/type/"+typeID, function(error, response, body){
    if(response.statusCode == 200) {
      var d = JSON.parse(body),
          ineffective = d.ineffective.map(function(val){return val.name}),
          noeffect = d.no_effect.map(function(val){return val.name}),
          supereffective = d.super_effective.map(function(val){return val.name});
      [defensive1, defensive2].forEach(function(type){
        if(ineffective.indexOf(type) !== -1) { multiplier *= 0.5; }
        if(noeffect.indexOf(type) !== -1) { multiplier *= 0; }
        if(supereffective.indexOf(type) !== -1) { multiplier *= 2; }
      });
      deferred.resolve(multiplier);
    } else {
      deferred.reject(new Error("Error accessing API while getting type."));
    }
  })

  return deferred.promise;
}