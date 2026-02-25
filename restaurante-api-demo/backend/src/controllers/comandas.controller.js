// Controlador de Comandas (Pedidos)
// Este arquivo é como o "Chef de Pedidos" que recebe e gerencia os pedidos dos clientes

const db = require('../services/database_connection.js');

const { comandas } = require('../services/database_mock.js');

// Função que retorna todas as comandas (pedidos) registradas
const getComandas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM comandas');

    // Parse do campo JSON 'itens' (MySQL pode retornar como string, array ou objeto)
    const comandasComItens = rows.map(comanda => ({
      ...comanda,
      itens: Array.isArray(comanda.itens)
        ? comanda.itens
        : (typeof comanda.itens === 'string' ? JSON.stringify(comanda.itens) : comanda.itens)
    }));

    res.json({
      sucesso: true,
      dados: comandasComItens
    });

  } catch (erro) {
    console.error('Erro ao listar comandas:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar comandas'
    });
  }
};

// Função que cria uma nova comanda (pedido)
// Recebe os dados do pedido do cliente via req.body
const createComanda = (req, res) => {
  try {
    // Extrai os dados enviados pelo cliente
    const { mesa, itens, total } = req.body;

    // total = total * 1.10;

    // Cria um novo objeto de comanda
    const novaComanda = {
      id: comandas.length + 1, // ID automático baseado no tamanho do array
      mesa,
      itens,
      total,
      status: 'pendente',
      dataPedido: new Date().toISOString()
    };

    // Adiciona a nova comanda ao array
    comandas.push(novaComanda);

    // Retorna a comanda criada com status 201 (Created)
    res.status(201).json({
      sucesso: true,
      mensagem: 'Comanda criada com sucesso',
      dados: novaComanda
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar comanda',
      erro: error.message
    });
  }
};

// Função para atualizar o status de uma comanda (PATCH)
// Permite mudar o status de um pedido (ex: pendente → Em Preparo → Pronto)
const updateComandaStatus = (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da URL
    const { status } = req.body; // Pega o novo status do corpo da requisição

    // Validação: verifica se o status foi enviado
    if (!status) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Status é obrigatório para atualizar a comanda'
      });
    }

    // Encontra o índice da comanda no array
    // Usamos == (comparação fraca) para permitir '1' == 1
    const comandaIndex = comandas.findIndex(c => c.id == id);

    // Se não encontrar (índice -1), retorna 404
    if (comandaIndex === -1) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada.'
      });
    }

    // Atualiza o status da comanda encontrada
    comandas[comandaIndex].status = status;

    // Retorna a comanda inteira atualizada com status 200 (OK)
    return res.status(200).json(comandas[comandaIndex]);

  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar comanda',
      erro: error.message
    });
  }
};

// Função para deletar uma comanda (DELETE)
// Remove um pedido do sistema (ex: cancelamento, limpeza de pedidos antigos)
const deleteComanda = (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da URL

    // Encontra o índice da comanda no array
    // Usamos == (comparação fraca) para permitir '1' == 1
    const comandaIndex = comandas.findIndex(c => c.id == id);

    // Se não encontrar (índice -1), retorna 404
    if (comandaIndex === -1) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada.'
      });
    }

    // Remove a comanda do array usando splice
    // splice(índice, quantosRemover) - remove 1 elemento no índice encontrado
    comandas.splice(comandaIndex, 1);

    // Retorna sucesso com status 200 (OK)
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Comanda deletada com sucesso'
    });

  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar comanda',
      erro: error.message
    });
  }
};

// Exporta as funções para serem usadas nas rotas
module.exports = {
  getComandas,
  createComanda,
  updateComandaStatus,
  deleteComanda 
};
