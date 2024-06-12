const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

const API_URL = 'https://66691b632e964a6dfed3d6e2.mockapi.io/api/eventos';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/eventos', async (req, res) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        console.log("Evento adicionado com ID: ", data.id);
        res.status(200).send({ id: data.id });
    } catch (e) {
        console.error("Erro ao adicionar evento:", e);
        res.status(500).send("Erro ao adicionar evento");
    }
});

app.put('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        console.log("Evento atualizado com ID: ", id);
        res.status(200).send("Evento atualizado com sucesso");
    } catch (e) {
        console.error("Erro ao atualizar evento:", e);
        res.status(500).send("Erro ao atualizar evento");
    }
});

app.delete('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        console.log("Evento excluído com ID: ", id);
        res.status(200).send("Evento excluído com sucesso");
    } catch (e) {
        console.error("Erro ao excluir evento:", e);
        res.status(500).send("Erro ao excluir evento");
    }
});

app.get('/api/eventos', async (req, res) => {
    const { id, status } = req.query;
    const url = id ? `${API_URL}/${id}` : (status ? `${API_URL}?status=${status}` : API_URL);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) {
            console.log(`Eventos buscados com status: ${status}`);
        } else {
            console.log(`Evento buscado com ID: ${id}`);
        }
        res.status(200).json(data);
    } catch (e) {
        console.error("Erro ao buscar evento(s):", e);
        res.status(500).send("Erro ao buscar evento(s)");
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
