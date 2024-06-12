const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Servindo arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para enviar todas as requisições para o MockAPI
app.use('/api', (req, res) => {
  const url = `https://66691b632e964a6dfed3d6e2.mockapi.io${req.url}`;
  axios({
    method: req.method,
    url: url,
    data: req.body
  }).then(response => {
    res.json(response.data);
  }).catch(error => {
    console.error('Erro ao processar requisição para o MockAPI:', error);
    res.status(500).json({ error: 'Erro ao processar requisição para o MockAPI' });
  });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
