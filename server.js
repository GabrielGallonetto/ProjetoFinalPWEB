const express = require('express');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(bodyParser.json());

// Configurar o Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAX5QTPvEICyOmk6O7ukZgujnwYZmgExuM",
    authDomain: "eventos-15ff4.firebaseapp.com",
    projectId: "eventos-15ff4",
    storageBucket: "eventos-15ff4.appspot.com",
    messagingSenderId: "675356689478",
    appId: "1:675356689478:web:e8764cb482c4e0ad033647"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Endpoint para adicionar eventos
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

// Endpoint para atualizar um evento
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

// Endpoint para excluir um evento
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

// Endpoint para buscar eventos
app.get('/api/eventos', async (req, res) => {
    const { status, search } = req.query;
    let eventosRef = collection(db, 'eventos');

    // Se foi especificado um status, adicionamos na query
    if (status) {
        eventosRef = query(eventosRef, where('status', '==', status));
    }

    // Se foi especificada uma pesquisa, adicionamos na query
    if (search) {
        eventosRef = query(eventosRef, where('titulo', '>=', search).where('titulo', '<=', search + '\uf8ff'));
    }

    try {
        const eventosSnapshot = await getDocs(eventosRef);
        const eventos = eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(eventos);
    } catch (e) {
        console.error("Erro ao buscar eventos:", e);
        res.status(500).send("Erro ao buscar eventos");
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
