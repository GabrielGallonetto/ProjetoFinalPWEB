const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

initializeApp({
    credential: applicationDefault()
});
const db = getFirestore();

app.post('/api/eventos', async (req, res) => {
    const { titulo, categoria, data, descricao, prioridade, status } = req.body;

    try {
        const docRef = await addDoc(collection(db, 'eventos'), {
            titulo,
            categoria,
            data,
            descricao,
            prioridade,
            status
        });
        console.log("Evento adicionado com ID: ", docRef.id);
        res.status(200).send({ id: docRef.id });
    } catch (e) {
        console.error("Erro ao adicionar evento:", e);
        res.status(500).send("Erro ao adicionar evento");
    }
});

app.put('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, categoria, data, descricao, prioridade, status } = req.body;

    try {
        const eventoRef = doc(db, 'eventos', id);
        await updateDoc(eventoRef, {
            titulo,
            categoria,
            data,
            descricao,
            prioridade,
            status
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
        await deleteDoc(doc(db, 'eventos', id));
        console.log("Evento excluído com ID: ", id);
        res.status(200).send("Evento excluído com sucesso");
    } catch (e) {
        console.error("Erro ao excluir evento:", e);
        res.status(500).send("Erro ao excluir evento");
    }
});

app.get('/api/eventos', async (req, res) => {
    const { status, search } = req.query;
    let filtros = [];

    if (status) {
        filtros.push(where('status', '==', status));
    }

    if (search) {
        filtros.push(where('titulo', '>=', search));
        filtros.push(where('titulo', '<=', search + '\uf8ff'));
    }

    let eventosQuery = collection(db, 'eventos');
    if (filtros.length > 0) {
        eventosQuery = query(eventosQuery, ...filtros);
    }

    try {
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventos = eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(eventos);
    } catch (e) {
        console.error("Erro ao buscar eventos:", e);
        res.status(500).send("Erro ao buscar eventos");
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
