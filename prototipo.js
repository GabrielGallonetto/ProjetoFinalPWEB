// Configurações do aplicativo
const Config = {
    categoriasExistentes: ['Trabalho', 'Família', 'Faculdade'],
    prioridades: ['Baixa', 'Média', 'Alta'],
    status: ['Pendente', 'Em Andamento', 'Concluído']
};

// Seletores de elementos HTML
const tabelaEventos = document.querySelector('#tabelaEventos tbody');
const feedback = document.querySelector('#feedback');
const filtroStatus = document.querySelector('#filtroStatus');
const inputPesquisa = document.getElementById('pesquisaEvento');
const botaoAtualizar = document.getElementById('atualizarEventos');
const botaoAdicionar = document.getElementById('adicionarEvento');
const calendario = document.getElementById('calendar');

// Adicionar ouvintes de eventos após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    adicionarEventListeners();

    if (document.title === 'Finalizados') {
        // Remover o elemento de filtro de status
        filtroStatus.style.display = 'none';
        buscarEventos('Concluído');
    } else {
        // Mostrar filtro de status e carregar eventos ao carregar a página
        filtroStatus.style.display = 'inline-block';
        buscarEventos(filtroStatus.value);
    }
});

// Funções de manipulação de DOM e Event Listeners
const adicionarEventListeners = () => {
    inputPesquisa.addEventListener('input', pesquisarEventos);
    botaoAdicionar.addEventListener('click', () => adicionarLinhaEvento());
    filtroStatus.addEventListener('change', () => buscarEventos(filtroStatus.value));

    if (document.title === 'Finalizados') {
        botaoAtualizar.addEventListener('click', atualizarEventosConcluidos);
    } else {
        botaoAtualizar.addEventListener('click', atualizarEventos);
    }
};

// Função para exibir mensagens de feedback
const mostrarFeedback = (mensagem, tipo) => {
    feedback.textContent = mensagem;
    feedback.className = tipo;
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = '';
    }, 3000);
};

// Função para definir a cor da linha com base na data e status
const definirCorLinha = (linha, evento) => {
    const hoje = new Date();
    const dataEvento = new Date(evento.data);
    const diferencaDias = (dataEvento - hoje) / (1000 * 60 * 60 * 24);

    if (evento.status === 'Concluído') {
        linha.style.background = '#007bff';
    } else if (diferencaDias < 2) {
        linha.style.background = '#ff0000';
    } else if (diferencaDias < 7) {
        linha.style.background = '#f3ff00';
    } else {
        linha.style.background = '#18ff00';
    }
};

// Função para criar uma linha de evento
const criarLinhaEvento = (evento = {}) => {
    const linha = document.createElement('tr');
    linha.dataset.id = evento.id || '';

    const tdId = document.createElement('td');
    const inputId = document.createElement('input');
    inputId.type = 'text';
    inputId.value = evento.id || '';
    inputId.disabled = true;
    tdId.appendChild(inputId);
    linha.appendChild(tdId);

    const tdTitulo = document.createElement('td');
    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.value = evento.titulo || '';
    tdTitulo.appendChild(inputTitulo);
    linha.appendChild(tdTitulo);

    const tdCategoria = document.createElement('td');
    const selectCategoria = document.createElement('select');
    Config.categoriasExistentes.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        if (categoria === evento.categoria) {
            option.selected = true;
        }
        selectCategoria.appendChild(option);
    });
    tdCategoria.appendChild(selectCategoria);
    linha.appendChild(tdCategoria);

    const tdData = document.createElement('td');
    const inputData = document.createElement('input');
    inputData.type = 'date';
    inputData.value = evento.data || '';
    inputData.min = new Date().toISOString().split('T')[0]; // Define a data mínima como hoje
    tdData.appendChild(inputData);
    linha.appendChild(tdData);

    const tdDescricao = document.createElement('td');
    const inputDescricao = document.createElement('input');
    inputDescricao.type = 'text';
    inputDescricao.value = evento.descricao || '';
    tdDescricao.appendChild(inputDescricao);
    linha.appendChild(tdDescricao);

    const tdPrioridade = document.createElement('td');
    const selectPrioridade = document.createElement('select');
    Config.prioridades.forEach(prioridade => {
        const option = document.createElement('option');
        option.value = prioridade;
        option.textContent = prioridade;
        if (prioridade === evento.prioridade) {
            option.selected = true;
        }
        selectPrioridade.appendChild(option);
    });
    tdPrioridade.appendChild(selectPrioridade);
    linha.appendChild(tdPrioridade);

    const tdStatus = document.createElement('td');
    const selectStatus = document.createElement('select');
    Config.status.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === evento.status) {
            option.selected = true;
        }
        selectStatus.appendChild(option);
    });
    tdStatus.appendChild(selectStatus);
    linha.appendChild(tdStatus);

    const tdAcoes = document.createElement('td');
    const btnSalvar = document.createElement('button');
    btnSalvar.textContent = 'Salvar';
    btnSalvar.addEventListener('click', () => salvarEvento(linha));
    tdAcoes.appendChild(btnSalvar);

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', () => cancelarAdicao(linha));
    tdAcoes.appendChild(btnCancelar);

    if (evento.id) { // Adicionar botão Excluir apenas para eventos existentes
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.addEventListener('click', () => excluirEvento(evento.id));
        tdAcoes.appendChild(btnExcluir);
    }

    linha.appendChild(tdAcoes);

    // Chamar a função para definir a cor da linha
    definirCorLinha(linha, evento);

    tabelaEventos.appendChild(linha);
};

// Função para adicionar uma linha de evento
const adicionarLinhaEvento = () => {
    criarLinhaEvento();
};

// Função para pesquisar eventos na tabela
const pesquisarEventos = () => {
    const textoPesquisa = inputPesquisa.value.toLowerCase();
    const linhasEventos = document.querySelectorAll('#tabelaEventos tbody tr');

    linhasEventos.forEach(linha => {
        const tituloEvento = linha.querySelector('td:nth-child(2) input').value.toLowerCase();
        if (!tituloEvento.includes(textoPesquisa)) {
            linha.style.display = 'none';
        } else {
            linha.style.display = '';
        }
    });
};


// Função para buscar eventos com base no status
const buscarEventos = async (status) => {
    try {
        const response = await axios.get(`/api/eventos?status=${status}`);
        const eventos = response.data;

        // Limpar a tabela antes de adicionar os novos eventos
        tabelaEventos.innerHTML = '';

        eventos.forEach(evento => {
            criarLinhaEvento(evento);
        });

        mostrarFeedback(`Eventos ${status} carregados com sucesso.`, 'alert alert-success');
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        mostrarFeedback('Erro ao buscar eventos.', 'alert alert-danger');
    }
};

// Função para atualizar eventos ao pressionar o botão Atualizar
const atualizarEventos = () => {
    const statusSelecionado = filtroStatus.value;
    buscarEventos(statusSelecionado);
};

// Função para salvar um evento (editar ou adicionar)
const salvarEvento = async (linha) => {
    const id = linha.dataset.id;
    const inputId = linha.querySelector('td:nth-child(1) input').value;
    const inputTitulo = linha.querySelector('td:nth-child(2) input').value;
    const selectCategoria = linha.querySelector('td:nth-child(3) select').value;
    const inputData = linha.querySelector('td:nth-child(4) input').value;
    const inputDescricao = linha.querySelector('td:nth-child(5) input').value;
    const selectPrioridade = linha.querySelector('td:nth-child(6) select').value;
    const selectStatus = linha.querySelector('td:nth-child(7) select').value;

    const evento = {
        id: id || inputId,
        titulo: inputTitulo,
        categoria: selectCategoria,
        data: inputData,
        descricao: inputDescricao,
        prioridade: selectPrioridade,
        status: selectStatus
    };

    try {
        let response;
        if (id) {
            // Editar evento existente
            response = await axios.put(`/api/eventos/${id}`, evento);
            mostrarFeedback('Evento atualizado com sucesso.', 'alert alert-success');
        } else {
            // Adicionar novo evento
            response = await axios.post('/api/eventos', evento);
            linha.dataset.id = response.data.id; // Atualiza o ID do evento na linha
            mostrarFeedback('Evento adicionado com sucesso.', 'alert alert-success');
        }
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        mostrarFeedback('Erro ao salvar evento.', 'alert alert-danger');
    }
};

// Função para cancelar a adição de uma nova linha de evento
const cancelarAdicao = (linha) => {
    if (!linha.dataset.id) {
        linha.remove(); // Remove a linha apenas se ainda não foi salva
    }
};

// Função para excluir um evento
const excluirEvento = async (id) => {
    try {
        await axios.delete(`/api/eventos/${id}`);
        document.querySelector(`tr[data-id="${id}"]`).remove();
        mostrarFeedback('Evento excluído com sucesso.', 'alert alert-success');
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        mostrarFeedback('Erro ao excluir evento.', 'alert alert-danger');
    }
};

// Função para atualizar eventos concluídos (página de eventos concluídos)
const atualizarEventosConcluidos = () => {
    buscarEventos('Concluído');
};

// Função para inicializar o calendário
const inicializarCalendario = () => {
    // Inicialização do calendário utilizando biblioteca externa (exemplo com FullCalendar)
    // Aqui você deve integrar o FullCalendar ou outra biblioteca de calendário de sua escolha
    // Exemplo básico utilizando FullCalendar:
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
        // Outras configurações conforme necessário
    });
    calendar.render();
};

// Chamada para inicializar o calendário após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    inicializarCalendario();
});

