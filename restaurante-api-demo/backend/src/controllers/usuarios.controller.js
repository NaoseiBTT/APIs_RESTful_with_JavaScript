const db = require('../services/database_connection');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');

    res.json({
      sucesso: true,
      cardapio: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({sucesso: false, mensagem: 'Erro ao acessa o banco'});
    }
};

module.exports = {
    getUsuarios
};