const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

const port = process.argv[2] || 3000;

function render(res, message) {
    fs.readFile('index.html', 'utf8', (err, data) => {
        if(err) {
            res.status(500).send('Internal error');
        }
        res.send(data.replace('__message__', message || ''));
    });
}

app.get('*', (req, res) => render(res));
app.post('/print', upload.single('file'), (req, res) => {
    const path = req.file.destination + req.file.originalname;
    fs.rename(req.file.path, path, (err) => {
        if(err) {
            console.err(err);
            render(res, 'Błąd podczas drukowania');
        } else {
            const command = 'a2ps ' + path;
            console.log(command);
            exec(command, (err, stdout, stderr) => {
                console.log(stdout);
                render(res, 'Wydrukowano ' + req.file.originalname);
            });
        }
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));