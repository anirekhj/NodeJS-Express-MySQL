const express = require('express');
let mysqlssh = require('mysql-ssh');
const app = express();


const connectionInfo = [{
    // Add your bluenose/timberlea creds here
    host: 'timberlea.cs.dal.ca',
    user: '****',
    password: '****'
},
{
    // Add your FCS DB creds here
    host: 'db.cs.dal.ca',
    user: '*****',
    password: '*****',
    database: '****'
}]

let con = mysqlssh.connect(
    connectionInfo[0], connectionInfo[1]
)

function generateResponse(err, results) {
    // console.log(results)
    if (err && err.errno === 1062) {
        return [409, 'The job already exists.']
    }
    if (results === undefined || results.length == 0) {
        return [404, 'No results found.']
    }
    if (results.info) {
        if (results.info === "Rows matched: 0  Changed: 0  Warnings: 0") {
            return [404, 'No such job exists.']
        }
        else if (results.info === "Rows matched: 1  Changed: 0  Warnings: 0") {
            return [409, 'Job already has given quantity.']
        }
        else if (results.info === "Rows matched: 1  Changed: 1  Warnings: 0") {
            return [200, 'Job quantity successfully updated.']
        }
    }
    return [200, results]
}

// landing page
app.get('/', (req, res) => {
    let sql = 'show tables;'
    con.then(client => {
        client.query(sql, (err, results, fields) => {
            [stat, data] = generateResponse(err, results);
            res.status(stat).send(data);
        })
    })
    .catch(err => {
        console.log(err)
    });
});

// get all jobs
app.get('/jobs', (req, res) => {
    let sql = 'SELECT * FROM `Jobs`'
    con.then(client => {
        client.query(sql, (err, results, fields) => {
            [stat, data] = generateResponse(err, results);
            res.status(stat).send(data);
        })
    })
    .catch(err => {
        console.log(err)
    });
});

 // get a specific job
app.get('/jobs/:jobID/:partID', (req, res) => {
    let sql = 'SELECT * FROM `Jobs` WHERE JobName = "' + req.params.jobID + '" AND PartID = ' + req.params.partID;
    con.then(client => {
        client.query(sql, (err, results, fields) => {
            [stat, data] = generateResponse(err, results);
            res.status(stat).send(data);
        })
    })
    .catch(err => {
        console.log(err)
    });
});

// post a job
app.post('/jobs/:jobID/:partID/:quantity', (req, res) => {
    let sql = 'INSERT INTO `ajain`.`Jobs`(`JobName`,`PartID`,`Quantity`)VALUES("' + req.params.jobID + '",' + req.params.partID + ',' + req.params.quantity + ')'
    // console.log(sql)
    con.then(client => {
        client.query(sql, (err, results, fields) => {
            [stat, data] = generateResponse(err, results);
            res.status(stat).send(data);
        })
    })
    .catch(err => {
        console.log(err)
    });
});

// update a job quantity
app.put('/jobs/:jobID/:partID/:quantity', (req, res) => {
    let sql = 'UPDATE `ajain`.`Jobs` SET `Quantity` = ' + req.params.quantity + ' WHERE `JobName` = "' + req.params.jobID + '" AND `PartID` = ' + req.params.partID
    console.log(sql)
    con.then(client => {
        client.query(sql, (err, results, fields) => {
            console.log(err, results);
            [stat, data] = generateResponse(err, results);
            res.status(stat).send(data);
        })
    })
    .catch(err => {
        console.log(err)
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('listening on port ${port}...'));