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
        // Remover o elemento de filtro de status se existir
        if (filtroStatus) {
            filtroStatus.style.display = 'none';
        }
        buscarEventos('Concluído');
    } else {
        // Mostrar filtro de status e carregar eventos ao carregar a página
        if (filtroStatus) {
            filtroStatus.style.display = 'inline-block';
        }
        if (filtroStatus && filtroStatus.value) {
            buscarEventos(filtroStatus.value);
        }
    }
});

// Funções de manipulação de DOM e Event Listeners
const adicionarEventListeners = () => {
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', pesquisarEventos);
    }
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener('click', adicionarLinhaEvento);
    }
    if (filtroStatus) {
        filtroStatus.addEventListener('change', () => buscarEventos(filtroStatus.value));
    }
    if (botaoAtualizar) {
        botaoAtualizar.addEventListener('click', () => {
            if (document.title === 'Finalizados') {
                atualizarEventosConcluidos();
            } else {
                atualizarEventos();
            }
        });
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
        linha.appendChild(tdAcoes);

        // Chamar a função para definir a cor da linha
        definirCorLinha(linha, evento);

        return linha;
    }

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
const buscarEventos = (status = '') => {
    axios.get(`/api/eventos?status=${status}`)
        .then(response => {
            if (tabelaEventos) {
                tabelaEventos.innerHTML = '';
                response.data.forEach(evento => adicionarLinhaEvento(evento));
            }
        })
        .catch(error => {
            console.error('Erro ao buscar eventos:', error);
            mostrarFeedback('Erro ao buscar eventos', 'alert alert-danger');
        });
};

// Função para salvar um evento
const salvarEvento = (linha) => {
    const id = linha.dataset.id || null;
    const novoEvento = {
        titulo: linha.querySelector('td:nth-child(2) input').value,
        categoria: linha.querySelector('td:nth-child(3) select').value,
        data: linha.querySelector('td:nth-child(4) input').value,
        descricao: linha.querySelector('td:nth-child(5) input').value,
        prioridade: linha.querySelector('td:nth-child(6) select').value,
        status: linha.querySelector('td:nth-child(7) select').value
    };

    const method = id ? 'put' : 'post';
    const url = id ? `/api/eventos/${id}` : '/api/eventos';

    axios[method](url, novoEvento)
        .then(response => {
            if (id) {
                mostrarFeedback('Evento atualizado com sucesso!', 'alert alert-success');
            } else {
                linha.dataset.id = response.data.id; // Adicionar o ID retornado pelo servidor
                mostrarFeedback('Evento salvo com sucesso!', 'alert alert-success');
            }
        })
        .catch(error => {
            console.error(`Erro ao ${id ? 'atualizar' : 'salvar'} evento:`, error);
            mostrarFeedback(`Erro ao ${id ? 'atualizar' : 'salvar'} evento`, 'alert alert-danger');
        });
};

// Função para excluir um evento
const excluirEvento = (id) => {
    axios.delete(`/api/eventos/${id}`)
        .then(response => {
            mostrarFeedback('Evento excluído com sucesso!', 'alert alert-success');
            buscarEventos(filtroStatus.value); // Atualizar a lista de eventos após exclusão
        })
        .catch(error => {
            console.error('Erro ao excluir evento:', error);
            mostrarFeedback('Erro ao excluir evento', 'alert alert-danger');
        });
};

// Função para atualizar a lista de eventos
const atualizarEventos = () => {
    buscarEventos(filtroStatus.value);
};

// Função para cancelar a adição ou edição de um evento
const cancelarAdicao = (linha) => {
    if (!linha.dataset.id) { // Remover a linha apenas se for uma adição cancelada
        linha.remove();
    }
};

// Função para inicializar o calendário
const inicializarCalendario = () => {
    const calendar = new FullCalendar.Calendar(calendario, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: '/api/eventos'
    });
    calendar.render();
};

// Inicialização do calendário
inicializarCalendario();

