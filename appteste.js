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
        await message.reply(`Olá! Seja bem-vindo à LD POLAROID! 💖 Agradecemos o seu contato. Enquanto estamos no horário de atendimento, também estamos na produção! Por isso, o atendimento final pode demorar um pouquinho, mas pode usar nosso autoatendimento para agilizar seu pedido.\n\nAqui está nosso catálogo: [Catálogo de Produtos](https://drive.google.com/file/d/1cS55blmjHxSSXk0bMEkYz7osxSC9Vrib/view?usp=drive_link)\n\n1 - Polaroid simples\n2 - Mini Polaroid\n3 - Polaroid borda fina\n4 - Polaroid borda infinita\n5 - Polaroid quadradinha\n6 - Polaroid de mesa (Feita em mdf com revestimento branco)\n7 - Revelação convencional (Tamanho: 10 cm x 15 cm)\n8 - Quadro Moldura simples (Tamanho: 10 cm x 15 cm) ou (Tamanho: 15 cm x 21 cm)\n9 - Quadro Moldura funda (Tamanho: 10 cm x 15 cm)\n10 - Mini Box\n11 - Box Intermediária\n\n🚨 NO CATÁLOGO TEM TODOS MODELOS COM FOTO, OLHE BEM ANTES DE ESCOLHER 😉\n· Você ainda pode optar pela opção com imã, para os produtos polaroid (simples, mini e quadradinha)\n\nSE TEM DUVIDAS OU NÃO QUER USAR O AUTOATENDIMENTO POR FAVOR DIGITE A PALAVRA, *ajuda*. 🤔`);
    } else if (resposta === 'ajuda') {
        await message.reply("Já vamos lhe atender, aguarde!");
        delete confirmacao[usuario];
    } else {
        if (!confirmacao[usuario]) return; // Ignorar mensagens de usuários que não iniciaram o processo
        const step = confirmacao[usuario].step;

        switch (step) {
            case 1:
                if (!isNaN(resposta) && parseInt(resposta) >= 1 && parseInt(resposta) <= 11) {
                    confirmacao[usuario].step = 2;
                    confirmacao[usuario].produto = resposta;
                    await message.reply(`Você escolheu a opção ${resposta}. Deseja confirmar? Responda com 'sim' ou 'nao'.`);
                } else {
                    await message.reply('Opção inválida. Por favor, escolha um número entre 1 e 11.');
                }
                break;
            case 2:
                if (resposta === 'sim') {
                    confirmacao[usuario].step = 3;
                    await message.reply('Gostaria de adicionar imã ao produto? Responda com "com" ou "sem".');
                } else if (resposta === 'nao') {
                    delete confirmacao[usuario];
                    await message.reply('Pedido cancelado. Até mais!');
                } else {
                    await message.reply('Resposta inválida. Por favor, responda com "sim" ou "nao".');
                }
                break;
            case 3:
                if (resposta === 'com' || resposta === 'sem') {
                    confirmacao[usuario].step = 4;
                    confirmacao[usuario].ima = resposta;
                    await message.reply('Digite seu nome:');
                } else {
                    await message.reply('Resposta inválida. Por favor, responda com "com" ou "sem".');
                }
                break;
            case 4:
                confirmacao[usuario].step = 5;
                confirmacao[usuario].nome = resposta;
                await message.reply('Digite a quantidade desejada:');
                break;
            case 5:
                if (!isNaN(resposta) && parseInt(resposta) > 0) {
                    confirmacao[usuario].step = 0; // Reseta o processo
                    const { produto, nome, ima } = confirmacao[usuario];
                    delete confirmacao[usuario];
                    await message.reply(`Nota do pedido:\nNome - ${nome}\nProduto - ${produto}\nCom imã - ${ima}\nQuantidade - ${resposta}\n\nMe mande as fotos que deseja usar.\n\nOk, obrigado. Aguarde que já vamos finalizar seu atendimento. LD POLAROID!`);
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
