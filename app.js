const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();
let confirmacao = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

client.on('message', async (message) => {
    const usuario = message.from;

    if (!message.body) return; // Ignorar mensagens vazias

    const resposta = message.body.trim().toLowerCase();

    if (resposta === 'lp') {
        confirmacao[usuario] = { step: 1 };
        await message.reply('Olá! Seja bem-vindo à LD POLAROID! 💖 Agradecemos o seu contato. Enquanto estamos no horário de atendimento, também estamos na produção! Por isso, o atendimento final pode demorar um pouquinho.\n\nAqui está nosso catálogo: Catálogo de Produtos\n\n1 - Polaroid simples sem imã\n2 - Polaroid simples com imã\n3 - Mini Polaroid sem imã\n4 - Mini Polaroid com imã\n5 - Polaroid borda fina sem imã\n\n🚨 NO CATÁLOGO TEM TODOS MODELOS COM FOTO, OLHE BEM ANTES DE ESCOLHER 😉\n\nDigite qual das opções você vai querer:');
    } else {
        if (!confirmacao[usuario]) return; // Ignorar mensagens de usuários que não iniciaram o processo
        const step = confirmacao[usuario].step;

        switch (step) {
            case 1:
                if (!isNaN(resposta) && parseInt(resposta) >= 1 && parseInt(resposta) <= 5) {
                    confirmacao[usuario].step = 2;
                    confirmacao[usuario].produto = resposta;
                    await message.reply(`Você escolheu a opção ${resposta}. Deseja confirmar? Responda com 'sim' ou 'nao'.`);
                } else {
                    await message.reply('Opção inválida. Por favor, escolha um número entre 1 e 5.');
                }
                break;
            case 2:
                if (resposta === 'sim') {
                    confirmacao[usuario].step = 3;
                    await message.reply('Digite seu nome:');
                } else if (resposta === 'nao') {
                    delete confirmacao[usuario];
                    await message.reply('Pedido cancelado. Até mais!');
                } else {
                    await message.reply('Resposta inválida. Por favor, responda com "sim" ou "nao".');
                }
                break;
            case 3:
                confirmacao[usuario].step = 4;
                confirmacao[usuario].nome = resposta;
                await message.reply('Digite a quantidade desejada:');
                break;
            case 4:
                if (!isNaN(resposta) && parseInt(resposta) > 0) {
                    confirmacao[usuario].step = 0; // Reseta o processo
                    const { produto, nome } = confirmacao[usuario];
                    delete confirmacao[usuario];
                    await message.reply(`Nota do pedido:\nNome - ${nome}\nProduto - ${produto}\nQuantidade - ${resposta}\n\nMe mande as fotos que deseja usar.\n\nOk, obrigado. Aguarde que já vamos finalizar seu atendimento. LD POLAROID!`);
                } else {
                    await message.reply('Quantidade inválida. Por favor, digite um número maior que zero.');
                }
                break;
            default:
                break;
        }
    }
});

client.initialize();

