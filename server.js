const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Servindo arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar eventos
app.get('/api/eventos', async (req, res) => {
    const status = req.query.status || '';
    try {
        const response = await axios.get(`https://66691b632e964a6dfed3d6e2.mockapi.io/api/eventos?status=${status}`);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
});

// Endpoint para salvar um evento
app.post('/api/eventos', async (req, res) => {
    try {
        const response = await axios.post('https://66691b632e964a6dfed3d6e2.mockapi.io/api/eventos', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        res.status(500).json({ error: 'Erro ao salvar evento' });
    }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
