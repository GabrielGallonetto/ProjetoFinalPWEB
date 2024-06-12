const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database(path.join(__dirname, 'eventos.db'));

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS eventos (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, categoria TEXT, data TEXT, descricao TEXT, prioridade TEXT, status TEXT)");
});

// Endpoint para adicionar eventos
app.post('/api/eventos', (req, res) => {
    const { titulo, categoria, data, descricao, prioridade, status } = req.body;
    const stmt = db.prepare("INSERT INTO eventos (titulo, categoria, data, descricao, prioridade, status) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(titulo, categoria, data, descricao, prioridade, status, function (err) {
        if (err) {
            console.error("Erro ao adicionar evento:", err);
            res.status(500).send("Erro ao adicionar evento");
        } else {
            res.status(200).send({ id: this.lastID });
        }
    });
    stmt.finalize();
});

// Endpoint para atualizar um evento
app.put('/api/eventos/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, categoria, data, descricao, prioridade, status } = req.body;
    const stmt = db.prepare("UPDATE eventos SET titulo = ?, categoria = ?, data = ?, descricao = ?, prioridade = ?, status = ? WHERE id = ?");
    stmt.run(titulo, categoria, data, descricao, prioridade, status, id, function (err) {
        if (err) {
            console.error("Erro ao atualizar evento:", err);
            res.status(500).send("Erro ao atualizar evento");
        } else {
            if (this.changes > 0) {
                res.status(200).send("Evento atualizado com sucesso");
            } else {
                console.warn("Evento não encontrado para atualizar. ID:", id);
                res.status(404).send("Evento não encontrado");
            }
        }
    });
    stmt.finalize();
});

// Endpoint para excluir um evento
app.delete('/api/eventos/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM eventos WHERE id = ?");
    stmt.run(id, function (err) {
        if (err) {
            console.error("Erro ao excluir evento:", err);
            res.status(500).send("Erro ao excluir evento");
        } else {
            if (this.changes > 0) {
                res.status(200).send("Evento excluído com sucesso");
            } else {
                console.warn("Evento não encontrado para excluir. ID:", id);
                res.status(404).send("Evento não encontrado");
            }
        }
    });
    stmt.finalize();
});

// Endpoint para buscar eventos
app.get('/api/eventos', (req, res) => {
    const { status, search } = req.query;
    let query = "SELECT * FROM eventos";

    // Se foi especificado um status, adicionamos na query
    if (status) {
        query += ` WHERE status = '${status}'`;
    }

    // Se foi especificada uma pesquisa, adicionamos na query
    if (search) {
        if (status) {
            query += ` AND (titulo LIKE '%${search}%' OR descricao LIKE '%${search}%')`;
        } else {
            query += ` WHERE (titulo LIKE '%${search}%' OR descricao LIKE '%${search}%')`;
        }
    }

    db.all(query, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar eventos:", err);
            res.status(500).send("Erro ao buscar eventos");
        } else {
            res.status(200).json(rows);
        }
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
