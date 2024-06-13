// Configurações do aplicativo
const Config = {
    categoriasExistentes: ['Trabalho', 'Família', 'Faculdade'],
    prioridades: ['Baixa', 'Média', 'Alta'],
    status: ['Pendente', 'Em Andamento', 'Concluído']
};

// Seletores de elementos HTML
const tabelaEventos = document.querySelector('#tabelaEventos tbody');
const feedback = document.querySelector('#feedback');
const inputPesquisa = document.getElementById('pesquisaEvento');
const filtroStatus = document.getElementById('filtroStatus');
const botaoAtualizar = document.getElementById('atualizarEventos');
const botaoAdicionar = document.getElementById('adicionarEvento');
const calendario = document.getElementById('calendar');

document.addEventListener('DOMContentLoaded', function () {
    // Verifica se está na página de finalizados
    if (document.title === 'Finalizados') {
        // Oculta o filtro de status na página de finalizados
        filtroStatus.style.display = 'none';

        // Inicializa a tabela de eventos concluídos
        buscarEventosConcluidos();
    } else {
        // Caso contrário, inicializa a tabela de eventos padrão
        inicializarTabelaEventos();
    }

    // Inicializa o calendário se houver um elemento de calendário na página
    if (calendario) {
        inicializarCalendario();
    }
});

// Função para pesquisar eventos na tabela
const pesquisarEventos = () => {
    const textoPesquisa = inputPesquisa.value.trim().toLowerCase();
    const statusFiltro = filtroStatus.value;

    let eventos = carregarEventos();
    let eventosFiltrados = eventos.filter(evento => {
        const titulo = evento.titulo.toLowerCase();
        const descricao = evento.descricao.toLowerCase();
        const categoria = evento.categoria.toLowerCase();

        // Verifica se o texto de pesquisa está presente no título, descrição ou categoria
        return titulo.includes(textoPesquisa) ||
               descricao.includes(textoPesquisa) ||
               categoria.includes(textoPesquisa);
    });

    // Filtra também pelo status, se selecionado
    if (statusFiltro) {
        eventosFiltrados = eventosFiltrados.filter(evento => evento.status === statusFiltro);
    }

    // Atualiza a tabela com os eventos filtrados
    atualizarTabelaEventos(eventosFiltrados);
};

// Função para buscar eventos com base no status
const buscarEventos = (status = '') => {
    const eventos = carregarEventos();
    const eventosFiltrados = status ? eventos.filter(evento => evento.status === status) : eventos;

    // Atualiza a tabela com os eventos filtrados
    atualizarTabelaEventos(eventosFiltrados);
};


// Função para atualizar a tabela de eventos com eventos filtrados
function atualizarTabelaEventos(eventos) {
    tabelaEventos.innerHTML = '';
    eventos.forEach(evento => {
        criarLinhaEvento(evento);
    });
}

// Função para inicializar a tabela de eventos
const inicializarTabelaEventos = () => {
    let eventos = carregarEventos();
    eventos.forEach(evento => {
        criarLinhaEvento(evento);
    });

    // Adiciona event listeners
    botaoAdicionar.addEventListener('click', adicionarLinhaEvento);
    inputPesquisa.addEventListener('input', pesquisarEventos);
    filtroStatus.addEventListener('change', () => buscarEventos(filtroStatus.value));
};

// Função para inicializar a tabela de eventos concluídos
const inicializarTabelaEventosFinalizados = () => {
    let eventos = carregarEventos();
    eventos = eventos.filter(evento => evento.status === 'Concluído');
    eventos.forEach(evento => {
        criarLinhaEvento(evento);
    });

    // Adiciona event listeners
    botaoAdicionar.addEventListener('click', adicionarLinhaEvento);
    inputPesquisa.addEventListener('input', pesquisarEventos);
};

// Função para adicionar uma linha de evento
const adicionarLinhaEvento = () => {
    criarLinhaEvento();
};

// Função para atualizar a tabela de eventos
function atualizarTabela() {
    let eventos = carregarEventos();
    tabelaEventos.innerHTML = '';
    eventos.forEach(evento => {
        criarLinhaEvento(evento);
    });
}

// Função para calcular a urgência do evento e retornar um elemento visual
function calcularUrgencia(dataEvento) {
    let hoje = new Date();
    let data = new Date(dataEvento);
    let diffDias = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));

    let cor = 'green';
    let texto = 'Baixa'; // Texto padrão para baixa urgência

    if (diffDias <= 7 && diffDias > 3) {
        cor = 'yellow';
        texto = 'Média';
    } else if (diffDias <= 3) {
        cor = 'red';
        texto = 'Alta';
    }

    const divUrgencia = document.createElement('div');
    divUrgencia.className = 'urgencia';
    divUrgencia.style.backgroundColor = cor;
    divUrgencia.textContent = texto;

    return divUrgencia;
}



// Função para carregar eventos do localStorage
const carregarEventos = () => {
    return JSON.parse(localStorage.getItem('eventos')) || [];
};

// Função para salvar eventos no localStorage
const salvarEventoLocalStorage = (evento) => {
    let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    const index = eventos.findIndex(ev => ev.id === evento.id);

    if (index !== -1) {
        eventos[index] = evento;
    } else {
        eventos.push(evento);
    }

    localStorage.setItem('eventos', JSON.stringify(eventos));
};

// Função para inicializar o calendário se necessário
const inicializarCalendario = () => {
    if (calendario) {
        const calendar = new FullCalendar.Calendar(calendario, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: JSON.parse(localStorage.getItem('eventos')) || []
        });
        calendar.render();
    }
};

// Função para calcular a urgência do evento e retornar um elemento visual
function calcularUrgencia(dataEvento) {
    let hoje = new Date();
    let data = new Date(dataEvento);
    let diffDias = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));

    let cor = 'green';
    let texto = 'Baixa'; // Texto padrão para baixa urgência

    if (diffDias <= 7 && diffDias > 3) {
        cor = 'yellow';
        texto = 'Média';
    } else if (diffDias <= 3) {
        cor = 'red';
        texto = 'Alta';
    }

    const divUrgencia = document.createElement('div');
    divUrgencia.className = 'urgencia';
    divUrgencia.style.backgroundColor = cor;
    divUrgencia.textContent = texto;

    return divUrgencia;
}

// Função para criar uma linha de evento
const criarLinhaEvento = (evento = {}) => {
    const linha = document.createElement('tr');
    linha.dataset.id = evento.id || '';

    // Criação das células da linha
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

    const tdUrgencia = document.createElement('td');
    tdUrgencia.appendChild(calcularUrgencia(evento.data));
    linha.appendChild(tdUrgencia);

    const tdAcoes = document.createElement('td');
    const botaoSalvar = document.createElement('button');
    botaoSalvar.textContent = 'Salvar';
    botaoSalvar.className = 'btnSalvar';
    botaoSalvar.addEventListener('click', () => salvarEvento(linha));
    tdAcoes.appendChild(botaoSalvar);

    const botaoCancelar = document.createElement('button');
    botaoCancelar.textContent = 'Cancelar';
    botaoCancelar.className = 'btnCancelar';
    botaoCancelar.addEventListener('click', () => cancelarAdicao(linha));
    tdAcoes.appendChild(botaoCancelar);

    linha.appendChild(tdAcoes);

    tabelaEventos.appendChild(linha);
};


// Função para calcular a urgência do evento e retornar um elemento visual
function calcularUrgencia(dataEvento) {
    let hoje = new Date();
    let data = new Date(dataEvento);
    let diffDias = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));

    let cor = 'green';
    let texto = 'Baixa'; // Texto padrão para baixa urgência

    if (diffDias <= 7 && diffDias > 3) {
        cor = 'yellow';
        texto = 'Média';
    } else if (diffDias <= 3) {
        cor = 'red';
        texto = 'Alta';
    }

    const divUrgencia = document.createElement('div');
    divUrgencia.className = 'urgencia';
    divUrgencia.style.backgroundColor = cor;
    divUrgencia.textContent = texto;

    return     divUrgencia;

    return divUrgencia;
}

// Função para criar uma linha de evento na página de finalizados
const criarLinhaEventoFinalizados = (evento = {}) => {
    const linha = document.createElement('tr');
    linha.dataset.id = evento.id || '';

    // Criação das células da linha
    const tdId = document.createElement('td');
    const inputId = document.createElement('input');
    inputId.type = 'text';
    inputId.value = evento.id || '';
    inputId.disabled = true;
    tdId.appendChild(inputId);
    linha.appendChild(tdId);

    const tdTitulo = document.createElement('td');
    tdTitulo.textContent = evento.titulo || '';
    linha.appendChild(tdTitulo);

    const tdCategoria = document.createElement('td');
    tdCategoria.textContent = evento.categoria || '';
    linha.appendChild(tdCategoria);

    const tdData = document.createElement('td');
    tdData.textContent = evento.data || '';
    linha.appendChild(tdData);

    const tdDescricao = document.createElement('td');
    tdDescricao.textContent = evento.descricao || '';
    linha.appendChild(tdDescricao);

    const tdPrioridade = document.createElement('td');
    tdPrioridade.textContent = evento.prioridade || '';
    linha.appendChild(tdPrioridade);

    const tdStatus = document.createElement('td');
    tdStatus.textContent = evento.status || '';
    linha.appendChild(tdStatus);

    const tdUrgencia = document.createElement('td');
    tdUrgencia.appendChild(calcularUrgencia(evento.data));
    linha.appendChild(tdUrgencia);

    tabelaEventos.appendChild(linha);
};

// Função para buscar eventos concluídos
const buscarEventosConcluidos = () => {
    const eventos = carregarEventos();
    const eventosConcluidos = eventos.filter(evento => evento.status === 'Concluído');
    atualizarTabelaEventosConcluidos(eventosConcluidos);
};

// Função para atualizar a tabela de eventos concluídos
const atualizarTabelaEventosConcluidos = (eventos) => {
    tabelaEventos.innerHTML = '';
    eventos.forEach(evento => {
        criarLinhaEventoFinalizados(evento);
    });
};

// Event listeners específicos da página de finalizados
document.addEventListener('DOMContentLoaded', function () {
    // Verifica se está na página de finalizados
    if (document.title === 'Finalizados') {
        buscarEventosConcluidos();
    }

    // Adiciona event listeners gerais
    botaoAdicionar.addEventListener('click', adicionarLinhaEvento);
    inputPesquisa.addEventListener('input', pesquisarEventos);
    filtroStatus.addEventListener('change', () => buscarEventos(filtroStatus.value));
});

// Função para salvar um evento
const salvarEvento = (linha) => {
    const id = linha.dataset.id || null;
    const novoEvento = {
        id: id || Date.now(), // Gera um ID único se não houver ID definido
        titulo: linha.querySelector('td:nth-child(2) input').value,
        categoria: linha.querySelector('td:nth-child(3) select').value,
        data: linha.querySelector('td:nth-child(4) input').value,
        descricao: linha.querySelector('td:nth-child(5) input').value,
        prioridade: linha.querySelector('td:nth-child(6) select').value,
        status: linha.querySelector('td:nth-child(7) select').value
    };

    salvarEventoLocalStorage(novoEvento);

    if (id) {
        mostrarFeedback('Evento atualizado com sucesso!', 'alert alert-success');
    } else {
        linha.dataset.id = novoEvento.id; // Adiciona o ID gerado
        mostrarFeedback('Evento salvo com sucesso!', 'alert alert-success');
    }

    // Atualiza a tabela dependendo da página atual
    if (document.title === 'Finalizados') {
        buscarEventosConcluidos();
    } else {
        atualizarTabela();
    }
};

// Função para cancelar a adição ou edição de um evento
const cancelarAdicao = (linha) => {
    if (!linha.dataset.id) { // Remove a linha apenas se for uma adição cancelada
        linha.remove();
    }
};

// Função para mostrar feedback ao usuário
const mostrarFeedback = (mensagem, classe) => {
    feedback.textContent = mensagem;
    feedback.className = classe;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
};


