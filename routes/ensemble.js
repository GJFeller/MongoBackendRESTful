/**
 * Created by gustavo on 02/05/2017.
 */

var mongojs = require('mongojs');
var spline = require('cubic-spline');

var ensembleCollectionString = 'ensemble';
var variableCollectionString = 'variable';
var simDataCollectionString = 'simulationData';

exports.getVariablesEnsemble = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        console.log("ensembleId = "+ensembleId);
        db.collection(variableCollectionString).find({ensembleId: mongojs.ObjectID(ensembleId)}, function (err, docs) {
            res.json(docs);
        })
    }
}

exports.getAllEnsembles = function (db) {
    return function (req, res) {
        db.collection(ensembleCollectionString).find({}, function (err, docs) {
            res.json(docs)
        })
    }
}

exports.getAllVariables = function (db) {
    return function (req, res) {
        db.collection(variableCollectionString).find({}, function (err, docs) {
            res.json(docs);
        })
    }
}

exports.getSolidVariables = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        console.log("ensembleId = "+ensembleId);
        db.collection(variableCollectionString).find({ensembleId: mongojs.ObjectID(ensembleId), type: "solid"}, function (err, docs) {
            res.json(docs);
        })
    }
}

exports.getSoluteVariables = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        console.log("ensembleId = "+ensembleId);
        db.collection(variableCollectionString).find({ensembleId: mongojs.ObjectID(ensembleId), type: "solute"}, function (err, docs) {
            res.json(docs);
        })
    }
}

exports.getSedimentVariables = function(db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        console.log("ensembleId = "+ensembleId);
        db.collection(variableCollectionString).find({ensembleId: mongojs.ObjectID(ensembleId), type: "sediment"}, function (err, docs) {
            res.json(docs);
        })
    }
}

exports.getTemporalVarData = function (db) {
    return function (req, res) {
        var xIdx = parseInt(req.params.xIdx);
        var yIdx = parseInt(req.params.yIdx);
        var zIdx = parseInt(req.params.zIdx);
        var simulationId = req.params.simulationId;
        //var varId = mongojs.ObjectID(req.params.varId);
        var varIdList = req.params.varIdList.split(',');
        for(var i = 0; i < varIdList.length; i++) {
            varIdList[i] = mongojs.ObjectID(varIdList[i]);
        }
        var ensembleId = req.params.ensembleId;
        //console.log("ensembleId = "+ensembleId);
        // First find the variableId and then find the data
        db.collection(simDataCollectionString).aggregate([
            { $match: {
                simulationId: simulationId,
                "cell.xIdx": xIdx,
                "cell.yIdx": yIdx,
                "cell.zIdx": zIdx,
            }},
            { $project: {
                variables: {$filter: {
                    input: '$variables',
                    as: 'variable',
                    cond: {$in: ['$$variable.variableId', varIdList]}
                }},
                time: 1,
                simulationId: 1,
                cell: 1,
                _id: 0
            }}
        ], function (err, docs) {
            console.log(err);
            res.json(docs);
        });
    };
        /*db.collection(simDataCollectionString).find({}, function (err, docs) {

        });*/
}

exports.getMultivariateVarData = function (db) {
    return function (req, res) {
        //var body = req.varIdList;
        //console.log("aeHOOOOOOOOOOOOO");
        //console.log(req.params.varIdList.split(','));
        var xIdx = parseInt(req.params.xIdx);
        var yIdx = parseInt(req.params.yIdx);
        var zIdx = parseInt(req.params.zIdx);
        var time = parseFloat(req.params.time);
        var simulationId = req.params.simulationId;
        var varIdList = req.params.varIdList.split(',');
        var varStringList = varIdList.slice();
        for(var i = 0; i < varIdList.length; i++) {
            varIdList[i] = mongojs.ObjectID(varIdList[i]);
        }
        console.log("blablabla");
        console.log(varIdList);

        /**
         * Return all timesteps in the following format:
         * {
         *      time: float
         *      simulationId: string
         *      cell: Object<{
         *                      xIdx: int
         *                      yIdx: int
         *                      zIdx: int
         *                      x: float
         *                      y: float
         *                      z: float
         *                   }>
         *      variables: Array<{
         *                          variableId: ObjectId
         *                          value: float
         *                      }>
         * }
         * 
         */
        db.collection(simDataCollectionString).aggregate([
            { $match: {
                simulationId: simulationId,
                "cell.xIdx": xIdx,
                "cell.yIdx": yIdx,
                "cell.zIdx": zIdx,
            }},
            { $project: {
                variables: {$filter: {
                    input: '$variables',
                    as: 'variable',
                    cond: {$in: ['$$variable.variableId', varIdList]}
                }},
                time: 1,
                simulationId: 1,
                cell: 1,
                _id: 0
            }}
        ], function (err, docs) {
            console.log(err);
            docs.sort(function(a,b) { return a.time == b.time ? 0 : +(a.time > b.time) || -1; });
            var timesteps = docs.map(a => a.time);
            console.log(timesteps);
            for(var varIdx = 0; varIdx < varStringList.length; varIdx++) {
                var varValues = [];
                docs.forEach(element => {
                    var varObj = element.variables.filter(function(variableElement){
                        //console.log(variable.variableId);
                        return variableElement.variableId == varStringList[varIdx];
                    });
                    if(varObj.length > 0) {
                        varValues.push(varObj[0].value);
                    }
                });
                console.log("varValues");
                console.log(varValues);
                if(timesteps.length === varValues.length) {
                    var splineValue = spline(63, timesteps, varValues);
                    console.log("Value at time 63 for var="+varStringList[varIdx]+" is "+splineValue);
                }
            }
        });

        /**
         * Return 1 element in the following format:
         * {
         *      time: float
         *      simulationId: string
         *      variables: Array<{
         *                          variableId: ObjectId
         *                          value: float
         *                      }>
         * }
         * 
         */
        db.collection(simDataCollectionString).aggregate([
            { $match: {
                simulationId: simulationId,
                "cell.xIdx": xIdx,
                "cell.yIdx": yIdx,
                "cell.zIdx": zIdx,
                time: time
            }},
            { $project: {
                variables: {$filter: {
                    input: '$variables',
                    as: 'variable',
                    cond: {$in: ['$$variable.variableId', varIdList]}
                }},
                time: 1,
                simulationId: 1,
                _id: 0
            }}
        ], function (err, docs) {
            console.log(err);
            res.json(docs);
        });
        //res.json([]);
    };
}

exports.getAllSimulationData = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        db.collection(simDataCollectionString).find({}, function (err, docs) {
            res.json(docs)
        })
    }
}

exports.getCellQuantity = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        db.collection(simDataCollectionString).find().sort({"cell.xIdx": -1}).limit(1, function (err, docs) {
            res.json(docs[0].cell.xIdx);
        });
    }
}

exports.getTimeEnd = function (db) {
    return function (req, res) {
        var ensembleId = req.params.ensembleId;
        db.collection(simDataCollectionString).find().sort({"time": -1}).limit(1, function (err, docs) {
            res.json(docs[0].time);
            //res.json(docs);
        });
    }
}

exports.getSpatialData = function (db) {
    return function (req, res) {
        //var body = req.varIdList;
        //console.log("aeHOOOOOOOOOOOOO");
        //console.log(req.params.varIdList.split(','));
        //var xIdx = parseInt(req.params.xIdx);
        //var yIdx = parseInt(req.params.yIdx);
        //var zIdx = parseInt(req.params.zIdx);
        var time = parseFloat(req.params.time);
        var simulationId = req.params.simulationId;
        var varIdList = req.params.varIdList.split(',');
        for(var i = 0; i < varIdList.length; i++) {
            varIdList[i] = mongojs.ObjectID(varIdList[i]);
        }
        console.log("blablabla");
        console.log(varIdList);

        db.collection(simDataCollectionString).aggregate([
            { $match: {
                simulationId: simulationId,
                /*"cell.xIdx": xIdx,
                "cell.yIdx": yIdx,
                "cell.zIdx": zIdx,*/
                time: time
            }},
            { $project: {
                variables: {$filter: {
                    input: '$variables',
                    as: 'variable',
                    cond: {$in: ['$$variable.variableId', varIdList]}
                }},
                time: 1,
                simulationId: 1,
                cell: 1,
                _id: 0
            }}
        ], function (err, docs) {
            console.log(err);
            res.json(docs);
        });
        //res.json([]);
    };
}


/*exports.getSimDataFromSimulation = function (db) {
    return function (req, res) {
        var simName = req.params.simName;


    }
}*/