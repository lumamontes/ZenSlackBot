const { Router } = require('express');
const routes = Router();
const SlackBot = require('slackbots');
const api = require('./services/api')

const bot = new SlackBot({
  token: process.env.SLACK_TOKEN,
  name: process.env.SLACK_BOT_NAME
});

// Start Handler
bot.on('start', () => {
  const params = {
    icon_emoji: ':smiley:'
  };

  bot.postMessageToChannel(
    'geral',
    'ONNN',
    params
  );
});

bot.on('error', err => console.log(err));

bot.on('message', data => {
  if (data.type !== 'message') {
    return;
  }

  handleMessage(data.text);
});


function handleMessage(message) {
  if (message.length > 0) {
    if (message.includes('ticket #')) {
      handleTicket(message);
    } else if (message.includes('help')) {
      runHelp();
    }
  }
}

function handleTicket(message) {
  let ticketNumber = message.split('#');

  ticketNumber = ticketNumber[1];

  api.get(`/tickets/${ticketNumber}.json`).then(response => {
    const ticket = response.data.ticket;
    console.log(ticket);
    let agentNames = ['luma', 'lucas', 'douglas', 'aureane'];
    let status;

    for(agent of agentNames){
      if (ticket.tags.includes(agent)) {
        agentName = agent;
      }else{
        agentName = 'Ticket sem agente responsável.'
      }
    }

    if (ticket.status == 'open') {
      status = 'Em aberto'
    } else if (ticket.status == 'pending') {
      status = 'Pendente'
    } else if (ticket.status == 'solved') {
      status = 'Resolvido'
    } else if (ticket.status == 'open') {
      status = 'Em aberto'
    } else if (ticket.status == 'hold') {
      status = 'Em espera'
    } else if (ticket.status == 'closed') {
      status = 'Fechado'
    }
    const ticketsInfo = {
      "ticket": ticketNumber,
      "agent": agentName,
      "status": status,
      "priority": ticket.priority,
      "created_at": ticket.created_at,
      "updated_at": ticket.updated_at,
      "due_at": ticket.due_at
    }

    const params = {
      icon_emoji: ':robot_face'
    };

    bot.postMessageToChannel('geral',
      `Ticket : ${ticketsInfo.ticket},
    Agente Responsável: ${ticketsInfo.agent},
    Prioridade: ${ticketsInfo.priority},
    Status da solicitação: ${ticketsInfo.status},
    Criado em: ${ticketsInfo.created_at}
    Última atualização: ${ticketsInfo.updated_at}
    Prazo de resolução: ${ticketsInfo.due_at ? ticketsInfo.due_at : 'Não definido'}
    `,
      params);
  });

}

// Show Help Text
function runHelp() {
  const params = {
    icon_emoji: ':question:'
  };

  bot.postMessageToChannel(
    'geral',
    `Hellou! Digite @ZenBotJunior com o número do ticket para saber o status da solicitação :)`,
    params
  );
}

function handleDefault() {
  bot.postMessageToChannel(
    'geral',
    `Oi! Foi mal, no momento consigo apenas buscar um ticket válido. Por favor, digite "@ZenBot #numero_do_ticket"`
  );
}

module.exports = routes;