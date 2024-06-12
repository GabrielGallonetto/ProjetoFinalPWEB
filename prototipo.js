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
        linha.style = 'background: linear-gradient(270deg, rgba(0,123,255,1) 0%, rgba(71,71,135,1) 5%, rgba(44,44,84,1) 65%);';
    } else if (diferencaDias < 2) {
        linha.style = 'background: linear-gradient(270deg, rgba(255,0,0,1) 0%, rgba(71,71,135,1) 5%, rgba(44,44,84,1) 65%);';
    } else if (diferencaDias < 7) {
        linha.style = 'background: linear-gradient(270deg, rgba(243,255,0,1) 0%, rgba(71,71,135,1) 5%, rgba(44,44,84,1) 65%);';
    } else {
        linha.style = 'background: linear-gradient(270deg, rgba(24,255,0,1) 0%, rgba(71,71,135,1) 5%, rgba(44,44,84,1) 65%);';
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

    return linha;
};

// Funções de manipulação de eventos
const adicionarLinhaEvento = (evento = {}) => {
    const linha = criarLinhaEvento(evento);
    tabelaEventos.appendChild(linha);
};

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

const buscarEventos = (status = '') => {
    fetch(`/api/eventos?status=${status}`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar eventos');
            return response.json();
        })
        .then(eventos => {
            tabelaEventos.innerHTML = '';
            eventos.forEach(evento => adicionarLinhaEvento(evento));
        })
        .catch(error => console.error('Erro ao buscar eventos:', error));
};

// Função para salvar um novo evento ou atualizar um existente
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

    const url = id ? `/api/eventos/${id}` : '/api/eventos';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoEvento)
    })
        .then(response => {
            if (response.ok) {
                // Se a operação for bem-sucedida, atualiza a tabela de eventos e exibe o feedback
                buscarEventos(filtroStatus.value);
                mostrarFeedback(id ? 'Evento atualizado com sucesso!' : 'Evento adicionado com sucesso!', 'success');
            } else {
                throw new Error('Erro ao salvar evento');
            }
        })
        .catch(error => {
            console.error('Erro ao salvar evento:', error);
            mostrarFeedback('Erro ao salvar evento', 'error');
        });
};

// Função para cancelar a adição de um novo evento
const cancelarAdicao = (linha) => {
    linha.remove();
};

// Função para excluir um evento
const excluirEvento = (id) => {
    fetch(`/api/eventos/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                // Se a operação for bem-sucedida, atualiza a tabela de eventos e exibe o feedback
                buscarEventos(filtroStatus.value);
                mostrarFeedback('Evento excluído com sucesso!', 'success');
            } else {
                throw new Error('Erro ao excluir evento');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir evento:', error);
            mostrarFeedback('Erro ao excluir evento', 'error');
        });
};

// Funções auxiliares
const atualizarEventos = () => {
    // Atualiza os eventos com base no status selecionado no filtro
    buscarEventos(filtroStatus.value);
    mostrarFeedback('Eventos atualizados com sucesso!', 'success');
};

const atualizarEventosConcluidos = () => {
    // Atualiza os eventos concluídos
    buscarEventos('Concluído');
    mostrarFeedback('Eventos atualizados com sucesso!', 'success');
};

// Limpar a tabela de eventos
const limparTabelaEventos = () => {
    tabelaEventos.innerHTML = '';
};

// Carregar eventos no calendário ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    fetch('/api/eventos')
        .then(response => response.json())
        .then(eventos => {
            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'pt-br',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: eventos.map(evento => ({
                    id: evento.id,
                    title: evento.titulo,
                    start: evento.data,
                    description: evento.descricao,
                    status: evento.status,
                    color: getColorByDateAndStatus(evento.data, evento.status)
                })),
                eventClick: function (info) {
                    alert('Evento: ' + info.event.title);
                    alert('Data: ' + info.event.start.toISOString().split('T')[0]);
                    alert('Descrição: ' + info.event.extendedProps.description);
                    // Adicione mais interações conforme necessário
                }
            });

            calendar.render();
        })
        .catch(error => console.error('Erro ao buscar eventos:', error));
});

// Função para obter a cor com base na data e no status do evento
function getColorByDateAndStatus(date, status) {
    const hoje = new Date();
    const dataEvento = new Date(date);
    const diferencaDias = (dataEvento - hoje) / (1000 * 60 * 60 * 24);

    if (status === 'Concluído') {
        return '#2435ff'; // Azul
    } else if (diferencaDias < 2) {
        return '#ff2424'; // Vermelho
    } else if (diferencaDias < 7) {
        return '#edff24'; // Amarelo
    } else {
        return '#24ff29'; // Verde
    }
}
